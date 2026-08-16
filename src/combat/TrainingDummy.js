import {
  AdditiveBlending,
  CapsuleGeometry,
  Color,
  CylinderGeometry,
  DoubleSide,
  Group,
  IcosahedronGeometry,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  RingGeometry,
  SphereGeometry,
  TorusGeometry,
  Vector3
} from 'three';
import { ParticleShape } from '../particles/ParticleSystem.js';
import { DecalType } from '../effects/GroundDecals.js';
import { frame } from '../core/FrameUniforms.js';
import { LAYER } from '../core/Layers.js';
import { settings } from '../config/settings.js';
import { getColor } from '../utils/color.js';
import { damp, saturate, Easing, lerp } from '../utils/math.js';

/* The effigy's dimensions. Hard-wired rather than put in `settings`: this is a
 * measuring instrument for the ten bolts, not a signature in the library, and a
 * target whose size can be dragged is a target that proves nothing. */
const PLINTH_RADIUS = 1.05;
const PLINTH_HEIGHT = 0.28;
const TORSO_HEIGHT = 1.32; // centre of the torso above the floor
const HEAD_HEIGHT = 2.16;
const RING_RADIUS = 0.98;

/** The collision volume, and the only geometry a projectile is tested against. */
const HIT_HEIGHT = 1.44;
const HIT_RADIUS = 0.86;

const MAX_HEALTH = 1500;
const DOWN_TIME = 2.2; // seconds it lies there before it comes back
const FALL_TIME = 0.75;
const RISE_TIME = 0.8;

const STEEL = '#2b333d';
const ACCENT = '#ff8a5c';
const HOT = '#fff2e0';

const _emit = {};
const _tmp = new Vector3();
const _dir = new Vector3();

/**
 * The Proving Effigy — one stationary target, and the only thing on the stage
 * that has health.
 *
 * It exists so a projectile can be *wrong*. Before it, every ability in the
 * sandbox resolved at the end of its own cast line and there was no observable
 * difference between a shot that would have connected and one that would have
 * sailed past. The effigy makes that difference the whole point: its health
 * only ever moves when a flying body's swept path actually intersects the
 * sphere below, once per body, and a shot that goes by leaves the number
 * untouched.
 *
 * No AI, no movement, no retaliation — deliberately. Everything here is either
 * the collision volume, the readout, or feedback about which of the two just
 * happened.
 *
 * Four states: `alive` → `falling` → `down` → `rising` → `alive`. It is only
 * targetable in the first, so a bolt fired at a corpse passes through it and
 * fizzles at the target point like any other miss.
 */
export class TrainingDummy {
  /**
   * @param {object} services { scene, particles, decals }
   * @param {Vector3} [position] where it stands, on the floor
   */
  constructor({ scene, particles, decals }, position = new Vector3(3.2, 0, -11.5)) {
    this.scene = scene;
    this.particles = particles;
    this.decals = decals;

    this.position = position.clone();
    this.maxHealth = MAX_HEALTH;
    this.health = MAX_HEALTH;

    /** Where the projectiles are tested against, kept current in `update`. */
    this.hitCenter = new Vector3();
    this.hitRadius = HIT_RADIUS;
    /** Where the health readout is anchored, in world space. */
    this.anchor = new Vector3();

    /** @type {((amount:number, point:Vector3, remaining:number) => void)|null} */
    this.onDamage = null;
    /** @type {(() => void)|null} */
    this.onDefeat = null;
    /** @type {(() => void)|null} */
    this.onRespawn = null;

    this._state = 'alive';
    this._stateTime = 0;
    this._flash = 0; // 0..1, the white-hot pass over every plate
    this._ringPulse = 0;
    this._recoil = new Vector3();
    // The knock-back lean, split across the two floor axes so the effigy tips
    // *away from the shot* rather than always forward.
    this._leanX = 0;
    this._leanZ = 0;
    this._age = 0;

    this._build();
    this._createParticles();
    this._sync(0);
  }

  get isTargetable() {
    return this._state === 'alive';
  }

  get isDefeated() {
    return this._state !== 'alive';
  }

  /* ------------------------------------------------------------------ */
  /* Construction                                                        */
  /* ------------------------------------------------------------------ */

  _build() {
    this.group = new Group();
    this.group.name = 'TrainingDummy';
    this.group.position.copy(this.position);

    /** Every lit plate, so a hit can drive all of their emissives at once. */
    this.plates = [];
    /** The additive parts, which fade out together when it goes down. */
    this.glows = [];

    const steel = new Color(STEEL);
    const accent = new Color(ACCENT);

    /** One standard material per part: the flash writes emissive per plate. */
    const plate = (color, emissiveStrength, roughness, metalness) => {
      const material = new MeshStandardMaterial({
        color,
        roughness,
        metalness,
        emissive: new Color(color),
        emissiveIntensity: emissiveStrength
      });
      material.userData.baseEmissive = new Color(color);
      material.userData.baseIntensity = emissiveStrength;
      this.plates.push(material);
      return material;
    };

    const solid = (geometry, material, y, castShadow = true) => {
      const mesh = new Mesh(geometry, material);
      mesh.position.y = y;
      mesh.castShadow = castShadow;
      mesh.receiveShadow = true;
      mesh.layers.set(LAYER.WORLD);
      this.group.add(mesh);
      return mesh;
    };

    const steelPlate = plate(steel, 0.04, 0.62, 0.55);
    const litPlate = plate(accent, 0.9, 0.35, 0.3);

    /* --- the plinth it is bolted to --- */
    this.plinth = solid(
      new CylinderGeometry(PLINTH_RADIUS, PLINTH_RADIUS * 1.16, PLINTH_HEIGHT, 26, 1),
      steelPlate,
      PLINTH_HEIGHT * 0.5
    );

    /* --- the post, the torso, the head --- */
    this.post = solid(new CylinderGeometry(0.16, 0.26, 1.0, 14, 1), steelPlate, 0.72);
    this.torso = solid(new CapsuleGeometry(0.52, 0.52, 6, 20), steelPlate, TORSO_HEIGHT);
    this.head = solid(new OctahedronGeometry(0.34, 0), litPlate, HEAD_HEIGHT);

    /* --- the two pauldrons, which is what gives it a front --- */
    this.shoulders = [];
    for (const side of [-1, 1]) {
      const mesh = solid(new IcosahedronGeometry(0.3, 0), steelPlate, TORSO_HEIGHT + 0.5);
      mesh.position.x = side * 0.62;
      mesh.rotation.z = side * 0.4;
      this.shoulders.push(mesh);
    }

    /* --- the chest sigil: the one plate that is unambiguously a target --- */
    this.chest = solid(new IcosahedronGeometry(0.3, 1), litPlate, TORSO_HEIGHT + 0.12);
    this.chest.position.z = 0.42;
    this.chest.scale.set(1.25, 1.25, 0.4);

    /* --- the guard ring, which spins slowly and pops when the effigy is hit --- */
    this.ring = solid(new TorusGeometry(RING_RADIUS, 0.045, 8, 48), litPlate, TORSO_HEIGHT);
    this.ring.rotation.x = Math.PI / 2;

    /* --- the additive furniture --- */
    // `track` is what keeps the contact mark out of the group fade: its opacity
    // is driven by its own age, and letting `_sync` write it every frame would
    // stamp straight over that.
    const glow = (color, opacity, track = true) => {
      const material = new MeshBasicMaterial({
        color: new Color(color),
        transparent: true,
        opacity,
        blending: AdditiveBlending,
        depthWrite: false,
        toneMapped: false,
        side: DoubleSide
      });
      material.userData.baseOpacity = opacity;
      if (track) this.glows.push(material);
      return material;
    };

    this.core = new Mesh(new SphereGeometry(0.42, 20, 14), glow(HOT, 0.34));
    this.core.position.y = TORSO_HEIGHT + 0.12;
    this.core.position.z = 0.42;
    this.core.layers.set(LAYER.VFX);
    this.core.renderOrder = 13;
    this.group.add(this.core);

    /* The footprint ring on the floor: it says exactly where the thing stands,
     * which is what makes a deliberate miss a deliberate miss rather than a
     * guess. Static, unlit, and never animated. */
    this.footprint = new Mesh(
      new RingGeometry(PLINTH_RADIUS * 1.3, PLINTH_RADIUS * 1.44, 60),
      glow(ACCENT, 0.3)
    );
    this.footprint.rotation.x = -Math.PI / 2;
    this.footprint.position.y = 0.02;
    this.footprint.layers.set(LAYER.VFX);
    this.footprint.renderOrder = 9;
    this.group.add(this.footprint);

    /* The contact mark: one ring snapped flat against the incoming direction at
     * the point of contact. Reused rather than pooled — a second hit inside a
     * third of a second simply restarts it. */
    this.contactRing = new Mesh(new RingGeometry(0.55, 0.92, 40), glow(HOT, 0.9, false));
    this.contactRing.layers.set(LAYER.VFX);
    this.contactRing.renderOrder = 15;
    this.contactRing.visible = false;
    this.contactRing.matrixAutoUpdate = true;
    this.scene.add(this.contactRing);
    this._contactAge = 1;

    this.scene.add(this.group);
  }

  _createParticles() {
    this.sparks = this.particles.get('dummy.sparks', {
      capacity: 1400,
      shape: ParticleShape.STREAK,
      additive: true,
      stretch: true,
      softFade: 0.25
    });
    this.sparks.uniforms.uDrag.value = 0.9;
    this.sparks.uniforms.uEndSize.value = 0.2;
    this.sparks.uniforms.uFadeOut.value = 0.5;

    this.shards = this.particles.get('dummy.shards', {
      capacity: 900,
      shape: ParticleShape.CHIP,
      additive: false,
      lit: true,
      softFade: 0.25
    });
    this.shards.uniforms.uDrag.value = 0.3;
    this.shards.uniforms.uEndSize.value = 0.8;
    this.shards.uniforms.uFadeOut.value = 0.7;
  }

  /* ------------------------------------------------------------------ */
  /* Taking a hit                                                        */
  /* ------------------------------------------------------------------ */

  /**
   * Remove health. Called exactly once per projectile, by the projectile.
   *
   * The guard is not decoration: `AbilityManager` recycles a bolt through a
   * pool, and the one thing that must never happen is a body applying its
   * damage twice because it was re-entered while the impact phase was still
   * running. The bolt holds the once-only flag; this holds the state check, so
   * a hit landing on the same frame the effigy went down still cannot take it
   * below zero twice.
   *
   * @returns {number} the health actually removed — 0 if it was not targetable
   */
  applyDamage(amount, point, direction) {
    if (!this.isTargetable) return 0;

    const applied = Math.min(this.health, Math.max(0, amount));
    this.health -= applied;

    this._flash = 1;
    this._ringPulse = 1;

    _dir.copy(direction ?? _dir.set(0, 0, 1));
    _dir.y = 0;
    if (_dir.lengthSq() < 1e-6) _dir.set(0, 0, 1);
    _dir.normalize();

    // Knocked back along the shot, and leaned over by a fixed amount rather
    // than by the size of the hit: a mortar should not fold the effigy in half.
    this._recoil.addScaledVector(_dir, 0.2);
    this._leanX += 0.16 * _dir.z;
    this._leanZ -= 0.16 * _dir.x;

    this._contactMark(point ?? this.hitCenter, _dir);
    this._contactSparks(point ?? this.hitCenter, _dir, applied);

    this.onDamage?.(applied, point ?? this.hitCenter, this.health);

    if (this.health <= 0) this._defeat();
    return applied;
  }

  _contactMark(point, direction) {
    this.contactRing.position.copy(point);
    // Face the ring back down the incoming shot, so the mark reads as a plate
    // struck rather than as a halo hanging in the air.
    _tmp.copy(point).addScaledVector(direction, -1);
    this.contactRing.lookAt(_tmp);
    this.contactRing.scale.setScalar(0.35);
    this.contactRing.visible = true;
    this._contactAge = 0;
  }

  _contactSparks(point, direction, amount) {
    const count = Math.round(lerp(40, 150, saturate(amount / 260)) * settings.global.particleCount);
    const time = frame.uTime.value;

    _emit.position = point;
    _emit.radius = 0.18;
    // Back along the shot: the spray comes off the surface it struck.
    _emit.direction = _dir.copy(direction).multiplyScalar(-1).setY(0.45).normalize();
    _emit.speed = 7.5;
    _emit.speedVariance = 0.7;
    _emit.spread = 0.7;
    _emit.inherit = null;
    _emit.anchor = null;
    _emit.size = 0.13;
    _emit.sizeVariance = 0.5;
    _emit.life = 0.55;
    _emit.lifeVariance = 0.5;
    _emit.spin = 0;
    _emit.tint = null;
    _emit.time = time;
    this.sparks.emit(count, _emit);

    _emit.speed = 4.5;
    _emit.size = 0.1;
    _emit.life = 0.9;
    _emit.spin = 7;
    this.shards.emit(Math.round(count * 0.4), _emit);
  }

  _defeat() {
    this._state = 'falling';
    this._stateTime = 0;
    this.health = 0;

    const time = frame.uTime.value;
    _emit.position = _tmp.copy(this.position).setY(TORSO_HEIGHT);
    _emit.radius = 0.7;
    _emit.direction = _dir.set(0, 1, 0);
    _emit.speed = 6.0;
    _emit.speedVariance = 0.8;
    _emit.spread = 1.0;
    _emit.size = 0.16;
    _emit.life = 1.1;
    _emit.spin = 6;
    _emit.time = time;
    this.shards.emit(Math.round(180 * settings.global.particleCount), _emit);
    this.sparks.emit(Math.round(220 * settings.global.particleCount), _emit);

    this.decals.spawn(DecalType.DUSTRING, this.position, {
      radius: 3.2,
      life: 1.6,
      intensity: 0.8,
      colorA: getColor(STEEL),
      colorB: getColor(ACCENT)
    });

    this.onDefeat?.();
  }

  /** Back to full, upright, immediately. Bound to the "clear effects" hotkey. */
  reset() {
    const wasDown = this._state !== 'alive';
    this._state = 'alive';
    this._stateTime = 0;
    this.health = this.maxHealth;
    this._flash = 0;
    this._ringPulse = 0;
    this._recoil.set(0, 0, 0);
    this._leanX = 0;
    this._leanZ = 0;
    this.contactRing.visible = false;
    this._contactAge = 1;
    this._sync(0);
    if (wasDown) this.onRespawn?.();
  }

  /* ------------------------------------------------------------------ */
  /* Per-frame                                                           */
  /* ------------------------------------------------------------------ */

  update(dt, elapsed = 0) {
    this._age = elapsed;
    this._stateTime += dt;

    switch (this._state) {
      case 'falling':
        if (this._stateTime >= FALL_TIME) {
          this._state = 'down';
          this._stateTime = 0;
        }
        break;
      case 'down':
        if (this._stateTime >= DOWN_TIME) {
          this._state = 'rising';
          this._stateTime = 0;
          // Health comes back at the *start* of the rise, so the bar filling is
          // what tells you the target is live again — before it is upright, and
          // before `isTargetable` says yes.
          this.health = this.maxHealth;
          this.onRespawn?.();
        }
        break;
      case 'rising':
        if (this._stateTime >= RISE_TIME) {
          this._state = 'alive';
          this._stateTime = 0;
          this._leanX = 0;
          this._leanZ = 0;
          this._recoil.set(0, 0, 0);
        }
        break;
      default:
        break;
    }

    this._flash = damp(this._flash, 0, 0.00002, dt);
    this._ringPulse = damp(this._ringPulse, 0, 0.0005, dt);
    this._recoil.multiplyScalar(Math.pow(0.0004, dt));
    this._leanX = damp(this._leanX, 0, 0.002, dt);
    this._leanZ = damp(this._leanZ, 0, 0.002, dt);

    if (this._contactAge < 1) {
      this._contactAge = Math.min(1, this._contactAge + dt / 0.34);
      const t = this._contactAge;
      this.contactRing.scale.setScalar(0.35 + Easing.outQuint(t) * 2.1);
      this.contactRing.material.opacity =
        this.contactRing.material.userData.baseOpacity * (1 - t) * (1 - t);
      this.contactRing.visible = t < 1;
    }

    this._sync(dt);
  }

  /**
   * Push the current state onto the meshes.
   *
   * Everything below is derived from `_state`, `_stateTime`, `_flash`, the two
   * lean angles and `_recoil` — nothing is integrated in place, so the whole
   * pose is a pure function of six numbers and a stall cannot leave the effigy
   * half fallen.
   */
  _sync(dt) {
    const falling = this._state === 'falling';
    const rising = this._state === 'rising';
    const down = this._state === 'down';

    // 0 = upright, 1 = flat on the plinth.
    let collapse = 0;
    if (falling) collapse = Easing.inQuad(saturate(this._stateTime / FALL_TIME));
    else if (down) collapse = 1;
    else if (rising) collapse = 1 - Easing.outBack(saturate(this._stateTime / RISE_TIME));

    const idle = Math.sin(this._age * 1.4) * 0.035 * (1 - collapse);

    this.group.position.set(
      this.position.x + this._recoil.x,
      this.position.y + idle - collapse * 0.45,
      this.position.z + this._recoil.z
    );
    this.group.rotation.set(
      this._leanX + collapse * 1.28,
      0,
      this._leanZ + collapse * 0.22
    );

    // The ring is the only part with its own motion: it turns steadily, and a
    // hit throws it wide for a fifth of a second.
    this.ring.rotation.z += dt * 1.1;
    const pulse = 1 + this._ringPulse * 0.28;
    this.ring.scale.setScalar(pulse);
    this.head.rotation.y = this._age * 0.6;
    this.core.scale.setScalar(1 + Math.sin(this._age * 3.1) * 0.06 + this._flash * 0.5);

    /* --- the flash, and the fade while it is down --- */
    const life = 1 - collapse;
    const hot = getColor(HOT);
    for (const material of this.plates) {
      const base = material.userData.baseEmissive;
      material.emissive.copy(base).lerp(hot, this._flash * 0.9);
      material.emissiveIntensity =
        material.userData.baseIntensity * life + this._flash * 2.6;
    }
    for (const material of this.glows) {
      material.opacity = material.userData.baseOpacity * (0.35 + 0.65 * life);
    }
    // The footprint stays readable even with the effigy down — it is where the
    // thing will be standing again in two seconds.
    this.footprint.material.opacity = 0.3;

    this.hitCenter.set(
      this.group.position.x,
      this.position.y + HIT_HEIGHT,
      this.group.position.z
    );
    this.anchor.set(this.group.position.x, this.position.y + 2.95, this.group.position.z);
  }

  dispose() {
    this.contactRing.geometry.dispose();
    this.contactRing.material.dispose();
    this.contactRing.parent?.remove(this.contactRing);
    this.group.traverse((node) => {
      node.geometry?.dispose?.();
      node.material?.dispose?.();
    });
    this.group.parent?.remove(this.group);
    this.plates.length = 0;
    this.glows.length = 0;
  }
}
