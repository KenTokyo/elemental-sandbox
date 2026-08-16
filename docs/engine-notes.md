# Engine notes — how four of the six originals, and the V4 bolts, are actually built

Lifted verbatim out of `README.md` under the 800-line rule in `AGENTS.md`. Nothing here changed in
the move; the README keeps the overview and links back to this file for the detail.

The first four are the engines every later signature is parametrised against, so this is also the
reference for what a derived block can and cannot reshape. The fifth section is the one engine that
is not like them: `BoltAbility`, whose impact is a collision rather than a moment.

### The ice

`materials/IceMaterial.js` patches a `MeshStandardMaterial` rather than replacing it, so the
crystals cast and receive the stage's real shadows and pick up the HDR probe. The stylisation is
injected on top:

- **Thickness tint** — a facet seen head-on has the longest path through the crystal, so it
  darkens toward `colorDeep`; grazing edges stay pale. This is the term that makes the field read
  as a solid you can see *into* rather than as blue plastic.
- **Internal fracture** — ridged noise sampled in **world** space, so the crack planes stay a fixed
  physical size whether a spike is ankle-high or three metres tall, and neighbouring crystals look
  quarried from the same block.
- **Feather frost and rime** — fbm sampled in **local** space (0..1 up the crystal), so the milky
  veining and the frost creeping up from the base follow each spike's own axis however it is
  scaled or leaned.
- **Glint** — a hard-thresholded high-frequency field scrolling in world space, biased toward
  grazing angles, which is where real ice catches.
- **Birth flash** — a per-instance attribute the ability drives from 1 to 0 over `birthFade`, so a
  crystal is lit from within for the moment it erupts.

Three `InstancedMesh`es share one material. Three rather than one because the *facets* differ, not
just the proportions — per-instance scaling alone cannot buy that silhouette variety, and three
draw calls is a cheap price.

### The lightning

`ThunderAbility` takes the "no dimensions on the CPU" rule further than the ice does: there is no
path object at all. The bolt is one `InstancedBufferGeometry` — a flat ladder of quads in
*parameter* space, where each vertex carries only `(t, side)`: how far along the bolt it is, and
which edge of the ribbon it is on. One instance is one filament. `materials/LightningMaterial.js`
turns that pair into a world position every frame, so a single strip serves a bolt of any length,
any shape and any width.

Three things stack to make the shape:

- **the axis** — a straight line from the hand to the impact point, bowed by `sag`. The only part
  that knows where the cast is pointing.
- **the fan** — a constant per-filament offset in the plane perpendicular to the axis, opening
  from `spreadNear` at the hand to `spread` at the target and rolling around the axis with
  `twist`. This is what separates one filament from the next.
- **the kinks** — octaves of *linearly* interpolated value noise. Linear on purpose: smoothstep
  would round the corners off, and the corners are the entire reason it reads as lightning rather
  than as a wobbly tube.

The ribbon is turned to face the camera by crossing the local tangent with the view vector, which
is why the bolt keeps its apparent thickness from any angle without ever being a screen-space
line. It is drawn twice — a wide soft halo underneath and the hot core on top — because drawing
the glow as real ribbon rather than leaving it to bloom is what keeps it *attached* to every kink.

Two clocks run the flicker. `restrike` snaps every filament onto a new shape N times a second,
and `crawl` slides the kinks continuously in between; together they stop a held bolt from looking
like a static ribbon. A cast captures exactly one number — a seed, so two casts do not draw the
identical bolt — and resolves every metre, radian and second against `settings.thunder` each
frame. That is why dragging `jitter` re-kinks a bolt that is already in the air.

The ground burns are worth a note as a thing *not* to do. The first version sampled the filament
field on `atan(y, x)`, which hands every radius along a given bearing the same value and draws
dead-straight spokes out of the centre — a firework, not a burn. Sampling the same noise in the
plane and warping the lookup is what lets the filaments meander and fork.

### The beam

The Nova Beam shares the bolt's rule — no dimensions on the CPU — and reaches the opposite look
with it. Where the bolt's whole charm is that its noise is *piecewise-linear* and keeps its
corners, every noise term in the beam is smooth, stretched hard along the flow and crawling
downrange. A beam that kinks is a bolt.

It is a real tube rather than a camera-facing ribbon, because a column this thick has to *have* a
cross-section: the silhouette must bow correctly when you orbit it, the far wall must add through
the near one, and the shock discs have to hug it. `createBeamTubeGeometry` is the ribbon strip one
dimension richer — every vertex carries `(t, a)`, how far along the barrel it is and how far around
— and `materials/BeamMaterial.js` turns that pair into a world position each frame.

That one tube is drawn three times, and the trick is in how the three are weighted:

- **halo** — widest, nothing but a rim term. The atmosphere the beam is shoving out of the way.
- **sheath** — rim-weighted, so it reads as *hollow* and its silhouette edges are its brightest part.
- **core** — narrow, and weighted the **opposite** way: brightest where the view ray runs down the
  barrel and its path through the tube is longest.

Rim-weighted outside, axis-weighted inside, both faces adding: that is a volume integral, cheaply,
and the inversion is the entire reason the middle reads as a solid rod of light instead of as a lit
pipe. Widen `coreWidth` or push `coreFill` up and the three layers collapse into one white tube —
the cyan sheath and the gold coils are only legible because the core leaves them room.

Two more instanced passes put structure on it. The **coils** are the bolt's ribbon strip bent into a
helix, camera-facing and warm on purpose — the colour split is what stops them dissolving into the
sheath. The **shock discs** are an instanced annulus whose phase is `fract(index / count + time ×
speed)`, so the train is a pure function of the clock and there is no queue on the CPU. Both place
themselves against the same `beamRadius()` the tube uses, which is why all five stay welded together
when the profile is dragged.

The beam is also the one ability with a **fourth beat**. The other three run travel → impact →
fade; this one puts a wind-up in front of that, and it needed nothing from the base class:
`advance()` simply refuses to let the front leave the hand until the orb is up to power, so `IMPACT`
becomes the burn and the phase machine is untouched. The far end therefore has an impact that keeps
happening — spray thrown back up the line, pressure shells shed off the burning point, dust and
shockwave rings pushed across the floor, all rate-throttled through the same fractional-rate emitter
the particles use so every rate is a live slider.

### The snare

The Voltaic Snare is the first ability built around a *point* instead of a line, and the thing that
holds it together is that `zoneRadius` is read in exactly one place per consumer and nowhere is it
copied: the indicator measures it out, the tendrils end on it, the rim arcs run along it, the field
burns it and the column's throat and flare are fractions of it. Drag it and all five move together,
mid-cast, with the clock stopped.

The whole cage — the whip that plants it, the pillar, the tendrils and the rim arcs — is **one
instanced ribbon strip**, the same one the bolt and the beam's coils are drawn on. A filament's
*role* is decided in the vertex shader by testing its instance index against four live counts, and
the role picks which parametric path it is threaded along:

- **leash** — a sagging line from the hand to the travelling tip, dropped onto the floor.
- **column** — a twisting climb whose radius opens from `throat` to `columnSpread`.
- **tendril** — a meander running outward, its veer a per-filament constant rather than noise, so
  it curves the way a discharge that has committed to a direction does.
- **rim** — an arc travelling around the boundary, hopping over it at mid-span.

Every offset then lives in a frame taken by finite difference off that path, which is what lets one
kink function serve a vertical pillar and a filament crawling flat across the floor. The two
ground-hugging roles damp the vertical component of that offset and clamp above the floor — a kink
with a free `y` buries half of every tendril and the effect reads as a broken dotted line. Setting
a count to zero retires the role outright, which is how the leash disappears on the frame the ring
takes over. Two draw calls cover all four roles, however many filaments are in the air.

The **field** is a quad rather than a pooled decal for one reason: a decal captures its radius when
it spawns, and this circle has to re-scale under `zoneRadius` while it is standing. Its veins are
sampled in the plane and domain warped — the same lesson the bolt's ground burns taught, and for
the same reason.

The one thing worth stealing for the next far cast is the **snap**: the ring opens on
`Easing.outCubic` multiplied by a bump that peaks late and dies at exactly 1, so it overshoots its
radius and pulls back onto it, and the pillar climbs on the same clock 1.7× slower. The ground goes
first, then the air breaks down over it.

---

### The bolts (V4)

The four sections above describe engines whose impact is a *point in time*. This one is the
exception in the library, and it is here for the same reason the others are: it was lifted out of
`README.md` when that file hit the 800-line ceiling in `AGENTS.md`.

The eighty above are pure VFX, and they are pure VFX for a structural reason: `Ability#advance()`
pushes a *front* along the cast line, reaches `u >= 1` and fires `onImpact()`. There was nothing on
the stage to touch, so the impact was a point in **time**. Nothing distinguished a cast that would
have connected from one that would have sailed past, because nothing could.

V4 puts a second kind of ability beside them — a body with a flight time whose path is tested piece
by piece against a target that has health — without changing one line of the base class or of the
eighty.

**The hinge is a single override.** `BoltAbility#advance(dt)` returns `true` on *either* ending: at
the target point, or the instant a substep touches something. `Ability#update` reacts to that `true`
exactly as it always has — impact phase, `onImpact()`, same frame — and `onImpact` reads `_hitTarget`
to decide whether it plays a contact or a fizzle. Phase machine, light bookkeeping, pooling and the
generated editor all keep working untouched.

**Damage lands once, or not at all.** `_damaged` is raised inside `onImpact` before `applyDamage` is
called and is cleared by nothing but a fresh cast. `destroy()` — which `AbilityManager` fires on the
oldest bolt when a fourth is cast — never touches any of it, and `TrainingDummy#applyDamage` refuses
outright unless the effigy is in its `alive` state. There is no third path to its health.

**The collision is swept, not sampled.** `CombatField#sweep` solves segment-against-inflated-sphere
in closed form, and the caller splits its frame into substeps no longer than the block's
`stepLength` *of path*. This is the load-bearing detail: the Sabot Round covers 1.23 m in a 60 fps
frame against a 0.86 m target sphere, so one test per frame would let it pass clean through
something it visibly went into. At `stepLength` 0.2 the same frame resolves as seven segments, and
the shot behaves the same at 240 fps, at 12 fps and through a half-second stall.

**The path is a function of the settings, never a recording.** `_pathPoint(s)` composes the line,
the lob (`arc`, `arcCurve`) and the weave (`weaveAmp`, `weaveFreq`, and the two gains that split it
between lateral and vertical) live, every frame. Dragging `weaveAmp` re-bends a quill that is
already halfway downrange — and the substeps are taken on the curve rather than on the straight line
under it, so a quill that visibly passes beside the effigy genuinely misses it. Both the lob and the
weave are pinned to zero at both ends, which is what keeps a corkscrew aimable.

`speed` is a speed along the **path**, not along the axis: `_pathRate` differentiates `_pathPoint`
numerically to convert between the two. Without it a tightly wound helix would cross the room
several times faster than a straight shot set to the same number.

**A hit and a miss are different events on purpose.** `_contactFx` is a shell, an inner flash, a
shockwave ring, sparks, embers, camera shake, a screen flash and a mark burnt into the floor.
`_fizzleFx` is a soft `BurstMode.AIR` shell of motes and *nothing else* — no ring, no shake, no
flash, no decal, and deliberately not the block's own `impactMode`. The single most important thing
this group has to communicate is whether it connected, and that has to be legible across the room
with the sound off.

**The bodies carry the read.** Ten silhouettes — needle, boulder, thorn, machined dart, ring, caged
core, bipyramid, four-spiked star, harpoon with beads, twin helix — assembled in `bolt-bodies.js`
along +Z, turned onto the heading by one `setFromUnitVectors`. One constraint governs that file:
`bodyStretch` scales the body group non-uniformly along its own nose, which shears any child rotated
about an axis other than Z. So every part that carries a *live* rotation turns about Z, and the
parts pitched onto other axes are static — the shear then becomes part of the sculpt instead of
something that crawls.

**The Proving Effigy** (`combat/TrainingDummy.js`) is a measuring instrument, not a signature: its
dimensions are hard-wired rather than put in `settings`, because a target whose size can be dragged
proves nothing. Four states — `alive → falling → down → rising` — and it is only targetable in the
first, so a bolt fired at a corpse passes through and fizzles at the target point like any other
miss. Health returns at the *start* of the rise, so the bar filling is what tells you it is live
again. **C** stands it straight back up at full health along with clearing the effects.
