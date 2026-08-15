import { Vector3 } from 'three';
import { BeamAbility } from './BeamAbility.js';
import { AbilityPhase } from './Ability.js';
import { ZoneField } from './support/ZoneField.js';
import { saturate, lerp } from '../utils/math.js';

/** Scratch for the two-point interpolation below. Module-level: no allocation. */
const _scratch = new Vector3();

/**
 * SOLAR SPEAR — the Nova Beam's column, stood on end and dropped.
 *
 * This is the argument for making the six original abilities element-parametric
 * rather than copying them: everything the Beam does — the wind-up, the release,
 * the tube at three radii, the coils, the shock discs, the hold, the collapse to
 * a thread — is exactly what a falling shaft of daylight needs. What changes is
 * two points in space, so that is all this file changes.
 *
 *   - the column starts `spearHeight` metres **above the target** instead of in
 *     the caster's hands, raked off vertical by `spearTilt`
 *   - it ends **on the floor at the target**, so the aim is a circle rather than
 *     an arrow
 *   - everything the beam does to the ground happens in one disc under the
 *     shaft, not in a stripe running back to the caster's feet
 *
 * The read is completely different — the Beam is a line you fire *along*, this
 * is a weight you drop *onto* a place — and the whole of the difference is in
 * the five overrides below, plus the lit disc the far cast promised.
 */
export class SpearAbility extends BeamAbility {
  constructor(context, element = 'solar') {
    super(context, element);
  }

  createShaders() {
    super.createShaders();
    // The circle the indicator drew, made real. Every other far cast in the
    // library has one, and a shaft that lands on bare ground looks like it
    // missed something.
    this.zoneField = new ZoneField(this.group, this.element);
  }

  /** The live footprint, metres. What the indicator measured out. */
  get radius() {
    return Math.max(0.05, this.config.zoneRadius);
  }

  /**
   * Where the column starts: high over the target, raked back downrange.
   *
   * The base class calls this the hand point and uses it for the wind-up orb and
   * the muzzle light too, which is exactly right here — the orb should wind up
   * where the shaft is going to come *from*, not in the caster's grip.
   */
  _handPoint(out) {
    const c = this.config;
    this.pointAt(1, out).setY(0);
    out.y = c.spearHeight;
    // Raked off vertical, so the shaft has a direction rather than being a
    // perfectly plumb line that reads as a UI element.
    out.addScaledVector(this.direction, -Math.tan(c.spearTilt) * c.spearHeight);
    return out;
  }

  /** Where it lands: the middle of the footprint. */
  _impactPoint(out) {
    this.pointAt(1, out);
    out.y = this.config.endHeight;
    return out;
  }

  /** A point on the shaft's axis, `s` from the sky to the floor. */
  _axisPoint(s, out) {
    const t = saturate(s);
    this._handPoint(out);
    const startY = out.y;
    const startX = out.x;
    const startZ = out.z;
    this._impactPoint(_scratch);
    out.set(lerp(startX, _scratch.x, t), lerp(startY, _scratch.y, t), lerp(startZ, _scratch.z, t));
    return out;
  }

  /**
   * A unit vector perpendicular to the shaft.
   *
   * The base class spans `side` and world up, which is correct for a horizontal
   * beam and degenerate for a vertical one — world up *is* the column's axis
   * here, so sparks thrown along it would run up and down the shaft instead of
   * off it. Span `side` and `direction` instead: the flat plane the shaft is
   * standing through.
   */
  _radialAt(a, out) {
    return out
      .copy(this.side)
      .multiplyScalar(Math.cos(a))
      .addScaledVector(this.direction, Math.sin(a))
      .normalize();
  }

  /**
   * Everything the shaft does to the floor happens inside the footprint.
   *
   * `s` is ignored on purpose: the column does not travel across the ground, so
   * there is no stripe to spread the burns along. They are scattered over the
   * disc instead, densest in the middle.
   */
  _floorPoint(_s, out) {
    const a = Math.random() * Math.PI * 2;
    const r = this.radius * Math.sqrt(Math.random()) * 0.9;
    this.pointAt(1, out).setY(0);
    out.x += Math.cos(a) * r;
    out.z += Math.sin(a) * r;
    return out;
  }

  /**
   * The burns.
   *
   * The base class pays them out per metre of *front travel*, which for a shaft
   * dropped from twenty-six metres would carpet the disc in the first tenth of a
   * second. Rate-limited against the burn instead, so the floor darkens under
   * the shaft while it stands rather than all at once as it arrives.
   */
  _groundFx() {
    // Deliberately empty: `_burnFx` already lays the scorch under the strike,
    // and `onImpact` lays the wide one. A travelling burn line has no meaning
    // for a cast that never moves across the ground.
  }

  _syncUniforms(dt, fade, widthFade) {
    super._syncUniforms(dt, fade, widthFade);

    const c = this.config;
    const travelling = this.phase === AbilityPhase.TRAVEL;
    // The disc lights as the orb winds up, so the promise the circle made is
    // still on screen while the shaft is being built above it.
    const charge = travelling ? this.charge : 1;
    this.pointAt(1, _scratch).setY(0);
    this.zoneField.setVisible(fade * charge > 0.004);
    this.zoneField.update(_scratch, this.radius, fade * charge, c.fieldHeight ?? 0.03);
  }

  onSpawn() {
    super.onSpawn();
    this.zoneField.reseed();
    this.zoneField.setVisible(false);
  }

  /**
   * The light rides the head of the shaft rather than a point on the floor.
   *
   * The base class already does this; it is repeated here only because the
   * shaft's head is metres above the ground plane the camera rig frames, and
   * lifting it is what makes the fall read from a low angle.
   */
  onTravel(dt) {
    super.onTravel(dt);
    if (this.age >= this.config.charge) this._axisPoint(this.u, this.position);
  }

  onDestroy() {
    super.onDestroy();
    this.zoneField.setVisible(false);
  }

  dispose() {
    this.zoneField.dispose();
    super.dispose();
  }
}
