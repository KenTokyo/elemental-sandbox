import { Vector3, MathUtils } from 'three';

import { Renderer } from './Renderer.js';
import { Time } from './Time.js';
import { CameraRig } from './CameraRig.js';
import { frame } from './FrameUniforms.js';

import { Environment } from '../world/Environment.js';
import { Ground } from '../world/Ground.js';
import { DustMotes } from '../world/DustMotes.js';
import { ContactShadows } from '../world/ContactShadows.js';

import { AssetLoader } from '../loaders/AssetLoader.js';
import { CharacterController } from '../animation/CharacterController.js';

import { InputManager } from '../input/InputManager.js';
import { AimController } from '../input/AimController.js';

import { ParticleEngine } from '../particles/ParticleEngine.js';
import { LightPool } from '../effects/LightPool.js';
import { DecalSystem } from '../effects/GroundDecals.js';
import { FissureSystem } from '../effects/GroundFissures.js';
import { BurstSystem } from '../effects/BurstSphere.js';
import { CameraShake } from '../effects/CameraShake.js';
import { ScreenFlash } from '../effects/ScreenFlash.js';

import { AbilityManager } from '../abilities/AbilityManager.js';
import { PostProcessing } from '../postprocessing/PostProcessing.js';

import { CombatField } from '../combat/CombatField.js';
import { TrainingDummy } from '../combat/TrainingDummy.js';

import { HUD, LoadingScreen } from '../ui/HUD.js';
import { Editor } from '../ui/Editor.js';
import { Loadout } from '../ui/Loadout.js';
import { AbilityPicker } from '../ui/AbilityPicker.js';
import { TargetOverlay } from '../ui/TargetOverlay.js';

import { settings, DEFAULT_LOADOUT, ELEMENTS, ELEMENT_META } from '../config/settings.js';

const HDR_URL = './hdri/spruit_sunrise.hdr';

/**
 * Application root: owns every subsystem and the frame loop.
 *
 * The wiring is deliberately one-directional — App builds the systems, hands the
 * ability manager a context object of the shared services, and then does nothing
 * but order the per-frame updates. No subsystem reaches back into App.
 *
 * The interaction is a single loop: select and arm an ability (Q / E / R / F /
 * V / X), swing the ground arrow with the mouse, click to fire. `AimController`
 * owns the targeting and emits one `cast` event; App turns that into an
 * ability, a heading for the character and a cooldown.
 *
 * The six hotkeys address slots, not fixed spells. `Loadout` says which six of
 * the twenty abilities are on the bar and `AbilityPicker` (L) changes them with
 * one direct slot-then-ability interaction. App owns no catalogue, batch,
 * rendition or prompt identity layer; ordinary settings keys are the complete
 * runtime contract again.
 */
export class App {
  constructor(canvas) {
    this.canvas = canvas;
    this.time = new Time();
    this.elapsed = 0;
    this.paused = false;
    this._raf = 0;

    /** Cooldowns stay attached to abilities even while they are off the bar. */
    this.cooldowns = new Map(ELEMENTS.map((element) => [element, 0]));

    /** One mutable six-slot bar, shared by HUD and picker. */
    this.loadout = new Loadout(DEFAULT_LOADOUT);

    /* ---- core ---- */
    this.renderer = new Renderer(canvas);
    this.rig = new CameraRig(canvas);
    this.camera = this.rig.camera;

    this.environment = new Environment(this.renderer, this.camera);
    this.scene = this.environment.scene;

    /* ---- world ---- */
    this.ground = new Ground(this.environment);
    this.dust = new DustMotes();
    this.contactShadows = new ContactShadows(this.renderer, { size: 2.6, height: 2.4, blur: 2.0 });

    this.scene.add(this.ground.mesh, this.dust.points, this.contactShadows.group);
    this.dust.setPixelRatio(this.renderer.gl.getPixelRatio());

    /* ---- shared VFX services ---- */
    this.particles = new ParticleEngine(this.scene);
    this.lights = new LightPool(this.scene);
    this.decals = new DecalSystem(this.scene);
    this.fissures = new FissureSystem(this.scene);
    this.bursts = new BurstSystem(this.scene);
    this.shake = new CameraShake(this.rig);
    this.flash = new ScreenFlash();

    /* ---- the stage's only target ---- */
    // `combat` is the whole interface between a flying body and something it can
    // touch: the bolts ask it "does this piece of path hit anything", it answers
    // with the earliest contact or nothing. No ability holds a target reference
    // across frames, and no target knows an ability exists.
    this.combat = new CombatField();
    this.dummy = this.combat.add(
      new TrainingDummy({
        scene: this.scene,
        particles: this.particles,
        decals: this.decals
      })
    );

    this.abilities = new AbilityManager(
      {
        scene: this.scene,
        camera: this.camera,
        environment: this.environment,
        particles: this.particles,
        lights: this.lights,
        decals: this.decals,
        fissures: this.fissures,
        bursts: this.bursts,
        shake: this.shake,
        flash: this.flash,
        combat: this.combat
      }
    );

    /* ---- character ---- */
    this.character = new CharacterController(this.environment);
    this.scene.add(this.character.root);

    /* ---- input & targeting ---- */
    this.input = new InputManager(canvas);
    this.aim = new AimController(this.camera);
    this.scene.add(this.aim.object3D);

    /* ---- post ---- */
    this.post = new PostProcessing(this.renderer, this.scene, this.camera);

    /* ---- UI ---- */
    this.loading = new LoadingScreen();
    this.hud = new HUD(document.getElementById('hud'), this.loadout);
    this.picker = new AbilityPicker({ loadout: this.loadout });
    this.editor = new Editor({
      onClear: () => this.clearEffects(),
      onToast: (message) => this.hud.showToast(message)
    });

    /* ---- the target's readout ---- */
    this.targetHud = new TargetOverlay();
    this.targetHud.setHealth(this.dummy.health, this.dummy.maxHealth);
    // The dummy pushes; nothing polls it. A damage number is thrown up from the
    // *contact point*, not from the effigy's centre, so a graze along the edge
    // reads as a graze.
    this.dummy.onDamage = (amount, point) => {
      this._project(point, this._screen);
      this.targetHud.popDamage(amount, this._screen.x, this._screen.y);
    };
    this.dummy.onDefeat = () => {
      this.targetHud.setDefeated(true);
      this._project(this.dummy.anchor, this._screen);
      this.targetHud.popDefeat(this._screen.x, this._screen.y);
    };
    this.dummy.onRespawn = () => this.targetHud.setDefeated(false);

    this._bindEvents();
    this.selectAbility(this.loadout.at(0), { silent: true });

    this._focusPoint = new Vector3();
    /** Reused projection result: {x, y} in CSS pixels, plus `visible`. */
    this._screen = { x: 0, y: 0, visible: false };
    this._projection = new Vector3();
  }

  /**
   * World point → CSS pixels on the canvas.
   *
   * `Vector3#project` returns normalised device coordinates, which are only
   * pixels once they are scaled by the canvas's *CSS* size — not its backing
   * store, which is the device pixel ratio larger and would put the panel at a
   * fraction of the right place on any HiDPI screen.
   */
  _project(point, out) {
    this._projection.copy(point).project(this.camera);
    const element = this.renderer.gl.domElement;
    out.x = (this._projection.x * 0.5 + 0.5) * element.clientWidth;
    out.y = (0.5 - this._projection.y * 0.5) * element.clientHeight;
    out.visible =
      this._projection.z < 1 &&
      out.x > -160 &&
      out.y > -80 &&
      out.x < element.clientWidth + 160 &&
      out.y < element.clientHeight + 80;
    return out;
  }

  /** The ability currently in the slot. */
  get element() {
    return this.abilities.selected;
  }

  /* ------------------------------------------------------------------ */

  _bindEvents() {
    this.renderer.onResize((width, height, pixelRatio) => {
      this.rig.resize(width, height);
      this.post.setSize(width, height, pixelRatio);
      this.dust.setPixelRatio(pixelRatio);
    });

    this.input.on('pointer:move', (pointer) => this.aim.point(pointer));
    this.input.on('pointer:confirm', (pointer) => {
      this.aim.point(pointer);
      this.aim.confirm();
    });
    this.input.on('action', (action, slot) => this._handleAction(action, slot));

    this.aim.on('cast', (origin, direction, distance) => this._cast(origin, direction, distance));
    this.aim.on('reject', () => this.hud.showToast('Too close — aim further out'));

    this.hud.onAbility = (element) => this.armAbility(element);
    this.loadout.onChange = (slot, element) => this._onLoadoutChange(slot, element);
  }

  /** Follow a slot change made in the picker. */
  _onLoadoutChange(slot, element) {
    const active = this.loadout.has(this.element) ? this.element : this.loadout.at(slot);
    this.hud.refresh(active);
    this.picker.refresh();

    if (active !== this.element) {
      this.aim.cancel();
      this.selectAbility(active);
    } else {
      this.hud.showToast(`${ELEMENT_META[element]?.label ?? element} → ${this.loadout.keyOf(slot)}`);
    }
  }

  _handleAction(action, index) {
    switch (action) {
      case 'ability': {
        const element = this.loadout.at(index) ?? this.element;
        // Pressing the same key again puts an armed cast away; pressing another
        // key switches the selected slot without disarming first.
        if (this.aim.isArmed && element === this.element) this.aim.cancel();
        else this.armAbility(element);
        break;
      }
      case 'toggleLoadout':
        this.picker.toggle();
        break;
      case 'cancel':
        if (this.picker.isOpen) this.picker.close();
        else this.aim.cancel();
        break;
      case 'toggleHelp':
        this.hud.toggleHelp();
        break;
      case 'toggleEditor':
        this.editor.toggle();
        break;
      case 'clear':
        this.clearEffects();
        this.hud.showToast('Effects cleared');
        break;
      case 'togglePause':
        this.paused = !this.paused;
        this.hud.setPaused(this.paused);
        this.hud.showToast(this.paused ? 'Paused — the editor still applies' : 'Resumed');
        break;
      default:
        break;
    }
  }

  /** Put an ability in the active slot and keep aim plus HUD in sync. */
  selectAbility(element, options = {}) {
    if (!ELEMENTS.includes(element)) return;
    this.abilities.select(element);
    this.aim.setElement(element);
    this.hud.setElement(element, options);
  }

  /** Select an ability immediately, then arm it unless it is cooling down. */
  armAbility(element = this.element) {
    this.selectAbility(element);
    if ((this.cooldowns.get(element) ?? 0) > 0) {
      this.hud.showToast('Selected · still cooling down');
      return;
    }
    // Selection happens before arming, so the arrow already has the new range on
    // the frame it appears. Cooldown never blocks the visible selection itself.
    this.aim.arm();
  }

  _cast(origin, direction, distance) {
    const element = this.element;
    if (!this.abilities.cast(origin, direction, distance, element)) return;
    this.cooldowns.set(element, Math.max(0, settings[element].cooldown));

    // Snap onto the shot and throw the body into it. Which clip that is belongs
    // to the ability, so each spell can be cast with its own gesture.
    this.character.setFacing(this.aim.facing);
    this.character.playCast(settings[element].castAnim);
    this.character.castLunge();
  }

  clearEffects() {
    this.aim.cancel();
    this.abilities.clear();
    // The effigy is part of "the state a cast left behind": back to full health
    // and upright, on the same key that wipes the decals.
    this.combat.reset();
    this.particles.reset();
    this.decals.clear();
    this.fissures.clear();
    this.bursts.clear();
    this.lights.reset();
    this.shake.reset();
    this.flash.reset();
  }

  /* ------------------------------------------------------------------ */

  /** Load assets, warm the shader cache, then start the loop. */
  async load() {
    const assets = new AssetLoader();

    this.loading.setProgress(0.05, 'Loading environment…');
    const hdr = await assets.loadHDR(HDR_URL);
    await this.environment.loadEnvironment(hdr);
    frame.uEnvMap.value = this.environment.equirect;

    this.loading.setProgress(0.35, 'Loading floor…');
    await this.ground.loadTextures(assets);

    this.loading.setProgress(0.5, 'Loading character…');
    await this.character.load(assets);

    this.loading.setProgress(0.8, 'Preparing abilities…');

    this.loading.setProgress(0.85, 'Compiling shaders…');
    // Compile everything up front so the first cast never stutters.
    await this.renderer.gl.compileAsync(this.scene, this.camera);

    this.loading.setProgress(1, 'Ready');
    this.loading.hide();

    this.start();
  }

  start() {
    this.time.reset();
    const loop = () => {
      this._raf = requestAnimationFrame(loop);
      this.frame();
    };
    this._raf = requestAnimationFrame(loop);
  }

  stop() {
    cancelAnimationFrame(this._raf);
  }

  /* ------------------------------------------------------------------ */

  frame() {
    const gl = this.renderer.gl;
    gl.info.reset();

    const raw = this.time.tick();
    const dt = this.paused ? 0 : raw * settings.global.timeScale;
    this.elapsed += dt;

    /* ---- shared uniforms ---- */
    frame.uTime.value = this.elapsed;
    frame.uDelta.value = dt;
    frame.uShaderIntensity.value = settings.global.shaderIntensity;
    frame.uGlobalGlow.value = settings.global.glow;
    frame.uCameraNear.value = this.camera.near;
    frame.uCameraFar.value = this.camera.far;

    /* ---- simulation ---- */
    this.renderer.syncSettings();

    this.environment.setFocus(this.character.position.x, this.character.position.z);
    this.environment.update();

    // Targeting runs on *real* time so the arrow keeps sweeping and animating
    // while the sandbox is paused — pausing freezes the effects, not the UI.
    this.aim.setOrigin(this.character.position);
    this.aim.update(raw);

    if (settings.character.turnToAim && this.aim.isArmed) {
      this.character.turnToward(this.aim.facing, settings.character.turnRate, raw);
    }
    this.character.update(dt);

    for (const [key, remaining] of this.cooldowns) {
      if (remaining > 0) this.cooldowns.set(key, Math.max(0, remaining - raw));
    }

    this.ground.update(this.elapsed);
    this.dust.update(this.elapsed, this.character.position);

    // Before the abilities, deliberately: the effigy's collision sphere has to
    // be where it is *this* frame before anything is swept against it, or every
    // hit is tested against the pose it had last frame.
    this.combat.update(dt, this.elapsed);

    this.abilities.update(dt);
    this.particles.flush();
    this.decals.update(dt);
    this.fissures.update(dt);
    this.bursts.update(dt);
    this.lights.update(dt);

    /* ---- camera ---- */
    const focus = this.abilities.focus;
    if (focus) this.rig.lookAt(focus.position, MathUtils.clamp(1 - focus.u * 0.4, 0, 1));
    this.rig.setAnchor(this.character.position.x, 0, this.character.position.z);
    this.shake.update(raw);
    this.flash.update(raw);
    this.rig.update(raw);

    this.contactShadows.setPosition(this.character.position.x, this.character.position.z);
    this.contactShadows.render(this.scene);

    /* ---- render ---- */
    // Exactly one cascade shadow update per frame (see Renderer).
    gl.shadowMap.needsUpdate = true;
    this.post.sync(this.elapsed, this.flash);
    this.post.render();

    /* ---- readouts ---- */
    // The target panel rides the effigy. On *real* time, like the rest of the
    // UI: pausing freezes the stage, not the readout catching up to it.
    this._project(this.dummy.anchor, this._screen);
    this.targetHud.place(this._screen.x, this._screen.y, this._screen.visible);
    this.targetHud.setHealth(this.dummy.health, this.dummy.maxHealth);
    this.targetHud.update(raw, this.dummy.health / this.dummy.maxHealth);

    for (const [key, remaining] of this.cooldowns) {
      this.hud.setCooldown(key, remaining, settings[key].cooldown);
    }
    this.hud.setArmed(this.aim.isArmed);
    this.hud.update(raw, () => ({
      particles: this.particles.countLive(this.elapsed),
      calls: gl.info.render.calls,
      spikes: this.abilities.active.reduce((total, ability) => total + ability.instanceCount, 0),
      abilities: this.abilities.active.length
    }));
  }

  /* ------------------------------------------------------------------ */

  dispose() {
    this.stop();
    this.input.dispose();
    this.aim.dispose();
    this.abilities.dispose();
    this.combat.dispose();
    this.targetHud.dispose();
    this.particles.dispose();
    this.decals.dispose();
    this.fissures.dispose();
    this.bursts.dispose();
    this.lights.dispose();
    this.character.dispose();
    this.ground.dispose();
    this.dust.dispose();
    this.contactShadows.dispose();
    this.post.dispose();
    this.environment.dispose();
    this.picker.dispose();
    this.editor.dispose();
    this.rig.dispose();
    this.renderer.dispose();
  }
}
