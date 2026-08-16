import { Vector3 } from 'three';

const _d = new Vector3();
const _m = new Vector3();

/**
 * Everything on the stage a projectile is allowed to touch.
 *
 * Deliberately tiny and deliberately *not* an ability concern. The bolts ask
 * one question — "does this piece of path touch anything" — and get back the
 * earliest contact along it or nothing at all. They never enumerate targets,
 * never hold a reference to one across frames, and never decide what a hit
 * means; that is the target's own business, in `applyDamage`.
 *
 * A target is any object with:
 *   - `isTargetable`  false while it is dead, respawning or otherwise off limits
 *   - `hitCenter`     Vector3, world space, kept current by its own update
 *   - `hitRadius`     metres
 *   - `applyDamage(amount, point, direction)` → the amount actually removed
 *
 * That is the whole contract. `TrainingDummy` is the only implementation today.
 */
export class CombatField {
  constructor() {
    /** @type {object[]} */
    this.targets = [];
    // One reused result record: a sweep runs several times per frame per bolt
    // (once per substep), and this is the hot path.
    this._result = { target: null, point: new Vector3(), t: 0 };
  }

  add(target) {
    if (target && !this.targets.includes(target)) this.targets.push(target);
    return target;
  }

  remove(target) {
    const index = this.targets.indexOf(target);
    if (index >= 0) this.targets.splice(index, 1);
  }

  /**
   * The earliest contact of a moving sphere against the targetable set.
   *
   * The moving body is treated as a sphere of `radius` swept from `from` to
   * `to`; a target is a sphere of `hitRadius` at `hitCenter`. Inflating the
   * target by the body's own radius turns that into the standard segment
   * against a fattened sphere, solved in closed form, which is what makes the
   * test exact for the segment rather than a sample at each end.
   *
   * **Why this exists at all:** a bolt at 74 m/s covers 1.23 m in a 60 fps
   * frame. Testing only the frame's endpoints would let it pass clean through a
   * 0.85 m target between two frames and report a miss on a shot that visibly
   * went in. The caller splits its frame into substeps no longer than the
   * block's `stepLength` and calls this for each of them, so the longest
   * untested piece of path is a fixed number of centimetres regardless of how
   * fast the projectile is or how badly the frame stalled.
   *
   * @param {Vector3} from   segment start, world space
   * @param {Vector3} to     segment end
   * @param {number}  radius the moving body's own radius, metres
   * @returns {{target: object, point: Vector3, t: number}|null} reused record
   */
  sweep(from, to, radius) {
    let best = null;
    let bestT = Infinity;

    _d.subVectors(to, from);
    const a = _d.lengthSq();

    for (const target of this.targets) {
      if (!target.isTargetable) continue;

      const r = Math.max(0.01, target.hitRadius + radius);
      _m.subVectors(from, target.hitCenter);
      const c = _m.lengthSq() - r * r;

      // Already touching at the start of the segment: contact at t = 0. This is
      // the case that catches a target that walked onto a body rather than the
      // other way round, and it must not be lost to the quadratic below.
      if (c <= 0) {
        if (0 < bestT) {
          bestT = 0;
          best = target;
        }
        continue;
      }

      // Degenerate segment (a stalled frame, a zero-length substep): the sphere
      // test above already answered it.
      if (a < 1e-12) continue;

      const b = _m.dot(_d);
      // Pointing away from the target and starting outside it — cannot touch.
      if (b >= 0) continue;

      const discriminant = b * b - a * c;
      if (discriminant < 0) continue;

      const t = (-b - Math.sqrt(discriminant)) / a;
      if (t < 0 || t > 1 || t >= bestT) continue;

      bestT = t;
      best = target;
    }

    if (!best) return null;

    const result = this._result;
    result.target = best;
    result.t = bestT;
    result.point.copy(from).addScaledVector(_d, bestT);
    return result;
  }

  update(dt, elapsed) {
    for (const target of this.targets) target.update?.(dt, elapsed);
  }

  /** Put every target back the way it started. Bound to the "clear" hotkey. */
  reset() {
    for (const target of this.targets) target.reset?.();
  }

  dispose() {
    for (const target of this.targets) target.dispose?.();
    this.targets.length = 0;
  }
}
