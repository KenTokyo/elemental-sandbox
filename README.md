# Elemental Sandbox — V3.4 “Ten Signatures Rebuilt”

A skillshot VFX sandbox built with **Three.js**, **Vite** and hand-written **GLSL**.

**Eighty signature effects, one editable six-slot loadout, and two ways to aim them.** A **line cast** arms
a League-of-Legends style arrow that appears on the ground and swings with the mouse; click to
fire. A **far cast** replaces the arrow with a circle that follows the cursor and answers the only
question a ground-targeted AoE has to answer before you commit — how much space is this going to
take.

The bottom bar always shows six abilities on **Q E R F V X**. Press **L** for the compact loadout
picker: choose a slot chip, choose any of the eighty abilities, done. Search plus group and cast-shape
filters remain available without a detail pane or technical identifiers.

| Ability group | | | | | |
| --- | --- | --- | --- | --- | --- |
| **Arcane Vanguard** | Frost Lance | Storm Lance | Cinder Fall | Nova Beam | Voltaic Snare ◎ |
| **Glacial Dominion** | Glacial Crown ◎ | Permafrost Wake | Shard Cyclone ◎ | Boreal Gate ◎ | Absolute Zero ◎ |
| **Cataclysm Engine** | Solar Spear ◎ | Magma Rift | Gravity Well ◎ | Void Rail | Plasma Bloom ◎ |
| **Wild Ether** | Verdant Rupture | Sandstorm Coil ◎ | Tidal Prism ◎ | Spectral Blades | Celestial Rain ◎ |
| **Emberforge Choir** | Sunforge Anvil ◎ | Emberspire ◎ | Ember Reap | Solar Aperture ◎ | Choral Ray |
| **Hoarfrost Reliquary** | Rime Comet | Rimefault | Quartz Bastion ◎ | Maelstrom ◎ | Aurora Mantle ◎ |
| **Umbral Covenant** | Eclipse Column | Singularity Maw ◎ | Nightshade Bloom ◎ | Grave Bind ◎ | Dusk Weave |
| **Drowned Choir** | Abyssal Vault ◎ | Ashen Deluge ◎ | Obsidian Thorns | Tar Fall | Brine Lance |
| **Verdigris Conclave** | Bell Rose ◎ | Censer Coil ◎ | Orrery Gate ◎ | Verdigris Seam | Pendulum Fall ◎ |
| **Prismatic Assembly** | Prism Cascade ◎ | Refraction Fan | Lumen Spire | Halation Bloom ◎ | Caustic Rain ◎ |
| **Ashfall Legion** | Ossuary Bind ◎ | Cinder Veil | Pyreclast | Sepulchre Rift | Ash Maw ◎ |
| **Stormglass Ascendancy** | Tempest Fan | Arc Light | Stormglass Bastion ◎ | Dynamo Coil ◎ | Thunderhead ◎ |
| **Indigo Synod** | Porcelain Font ◎ | Azurite Horn | Indigo Vespers ◎ | Lapis Gyre ◎ | Cobalt Obelisk ◎ |
| **Sanguine Assize** | Sanguine Furrow | Vermilion Shears | Garnet Bolide | Carnelian Aegis ◎ | Ferrous Rose ◎ |
| **Quicksilver Escapement** | Flywheel Governor ◎ | Quicksilver Thread | Astrolabe Ring ◎ | Mercury Rain ◎ | Amalgam Weld |
| **Brimstone Litany** | Brimstone Vents | Sulphur Sump ◎ | Orpiment Scythe | Fulminate Whip | Ochre Pylon ◎ |

◎ marks a far cast. The starting bar contains the original five plus Glacial Crown; every slot can
be replaced from the picker.

**Q — Frost Lance.** A fracture front races out along the line while a field of ice crystals
tears up out of the floor behind it — small and dense at your feet, opening into a wall of blades
at the far end, with a cluster thrown up around the impact point.

**E — Storm Lance.** A bolt leaves the caster's hand and a bundle of lightning filaments is drawn
out behind the strike front, holds while it gutters and re-strikes, then blows out. Sparks come
off it the whole way, the floor underneath takes a branching electric burn and a dark scorch, and
the far end gets a shell of ionised air.

**R — Cinder Fall.** A burning rock is lobbed downrange on an arc, trailing a raymarched wake of
burning gas and heating up the whole way: the lava seams splitting its surface prise wider and
brighter as it comes in. It detonates on arrival, throws its own shattered chunks across the floor, and tears the
ground open into a network of molten cracks that keep glowing while the crater burns out.

**F — Nova Beam.** The caster winds a ball of light up in both hands, pulling motes in out of the
air, then lets a column of it out along the line — white-hot core, cyan sheath, gold ribbons
spiralling around it and shock discs racing down it. It *holds* there, burning into the floor and
throwing spray back up the beam, before collapsing to a thread and blinking out. The only cast in
the sandbox that is still happening a second after it landed.

**V — Voltaic Snare.** The far cast. A leash of current is whipped out across the floor, and where
it lands the ring snaps open past its own radius and pulls back onto it: a violet column tears up
out of the middle, tendrils crawl outward to the boundary, arcs run around the rim and the whole
disc burns. It holds there re-striking and hauling the air up into the pillar, then collapses to a
thread. The circle you measured out before the click is exactly the circle you get.

Everything you can see is generated. There are no textures, no sprite sheets and no meshes on
disk except the character: the crystals are procedural geometry, the bolt is a strip of ribbon
placed entirely by a vertex shader, the meteor is an icosphere cratered and sliced by fracture
planes on the CPU, the beam is a parametric tube drawn three times at three radii, the snare's
whole cage is that same ribbon strip threaded along four different parametric paths, the arrow, the
targeting circle, the rime, the burns and the molten cracks are signed-distance and noise shaders,
and the mist, sparks, chips and glitter are GPU particles.

**Every parameter is a live slider** — 15727 keys across the eighty blocks, 12765 numbers and 2875
colours — and they stay
live while the simulation is paused. That is the point of the project: freeze a frame
mid-eruption, mid-strike or mid-burn with **P**, then reshape the silhouette, the palette and the
timing against a still image.

References for the look: `icecast.jpg`, `thundercast.jpg`, `superbeam.jpg` and
`electricalboost.jpg`.

The fourteen signatures added in V20.3 and the twenty each added in V3.1, V3.2 and V3.3 reuse
those same fifteen engines; their mechanics are covered in
[Eighty signatures, fifteen engines](#eighty-signatures-fifteen-engines).

---

## Quick start

This project uses **pnpm** and a fixed port.

```bash
pnpm install
pnpm dev              # http://localhost:6067
pnpm build
pnpm preview
pnpm audit:settings   # static: no engine reads a key its block lacks
```

The port is pinned with `strictPort: true` in `vite.config.js` for both `server` and `preview`, so
it never silently moves to another one. The settings audit catches the failure mode this build is
actually exposed to — see [Keeping eighty blocks honest](#keeping-eighty-blocks-honest).

### Assets

Six binary assets are served from `public/` and loaded automatically at boot:

| File | Purpose |
| --- | --- |
| `public/models/Idle.fbx` | Rigged character **and** its idle animation clip |
| `public/models/diffuse.png` | The character's colour map |
| `public/models/cast1.fbx` | Cast animation |
| `public/models/cast2.fbx` | Cast animation |
| `public/models/cast3.fbx` | Cast animation — the default for the frost family (see below) |
| `public/hdri/spruit_sunrise.hdr` | HDR probe used for image-based lighting and crystal reflections |

All four FBX files are Mixamo exports of the same rig, each carrying a skinned mesh plus one
animation stack. The character comes from the idle file; the cast files are loaded for their clip
alone, and the duplicate rig that arrives with each one is released the moment its `AnimationClip`
has been taken. Clips bind to the skeleton by bone name, which is the whole reason an animation
authored in another file plays here without retargeting.

The rig ships no material, so `diffuse.png` is loaded beside it and assigned as the colour map when
the imported materials are converted to PBR — an FBX that *does* carry an embedded texture keeps its
own, since that map is authored against its own UVs.

Every ability picks the clip it throws — `castAnim` in its settings block, a dropdown under **The
cast** in its editor folder. Across the eighty the split is twenty-seven on `cast3` (the frost family
and everything else that is slow and deliberate), twenty-eight on `cast2` (the ones thrown or planted)
and twenty-five on `cast1`. The clip is a one-shot laid over the looping idle,
with `character.castBlendIn` / `castBlendOut` as the two edges of that overlap.

The HDR is loaded as image-based lighting and as the reflection source for the ice — it is never
shown as a visible sky. The stage keeps its flat dark backdrop.

---

## Controls

| Input | Action |
| --- | --- |
| **Q E R F V X** | Arm slots 1–6 — press the same key again to put an armed cast away |
| **L** | Open the loadout picker; choose a slot chip, then choose an ability |
| **Move the mouse** | Swing the aim arrow, or move the far-cast circle |
| **Left click** | Cast along the arrow, or drop the circle where it is |
| **Esc** / **right click** | Cancel an armed cast |
| **Right mouse + drag** | Orbit the camera |
| **Scroll** | Zoom |
| **G** | Show/hide the VFX editor |
| **P** | Pause / resume — *the editor keeps applying* |
| **C** | Clear all active effects |
| **H** | Hide the controls panel |

`range` and `minRange` are per ability, so the indicator's reach changes with the slot you have
selected. Aiming closer than the selected ability's `minRange` tints it red and refuses the cast;
set `minRange` to 0 if you would rather cast at your own feet, which is what the Snare ships with —
a trap you cannot drop on yourself is missing half its uses.

Cooldowns are per **ability**, not per slot, and all eighty continue to tick while off the bar.
Replacing a cooling ability does not refund it; equipping it again restores the same cooldown state.

---

## Project layout

```
src/
  abilities/      Ability base class (the travelling front) and the fifteen engines:
                  Ice, Thunder, Meteor, Beam, Snare, Glacier, Cyclone, Gate, Dome,
                  Spear, Rift, Well, Bloom, Blades, Rain — plus the pooling manager
    <engine>-fx.js, -setup.js, -scratch.js
                  The five engines that were over 800 lines keep their emission
                  (and for Glacier and Meteor their build-once) methods in
                  kebab-case siblings, mixed onto the prototype at the foot of
                  the class file — same methods, same `this`
    support/      ShardCloud, StrandBundle, ZoneField — the three pieces more than
                  one engine needed, factored out rather than copied
  animation/      FBX character loading, AnimationMixer, the per-ability cast clips,
                  the procedural cast lunge
  assets/         Procedural crystal and asteroid geometry, the bolt ribbon strip,
                  the beam tube and its shock discs
  config/         settings.js — the single source of truth for every parameter;
                  since the sweep it holds the globals, the helpers and the
                  re-exports, and spreads the rest back in from:
    registry.js   Ability metadata, picker groups, cast shapes and the default
                  six-slot bar. Imports nothing, so it can never form a cycle
    blocks-strikes.js, blocks-projectiles.js, blocks-farcasts.js
                  The six hand-written base blocks, grouped by cast shape
    variants.js   The fourteen V20.3 blocks, derived from the six originals —
                  the derivations themselves live in variants-dominion.js,
                  -cataclysm.js, -ether.js and -ether-rhythms.js, with the
                  shared `derive`/`borrow` in derive.js
    signatures-forge.js, signatures-hoarfrost.js, signatures-umbra.js,
    signatures-drowned.js
                  The twenty V3.1 blocks, each derived from the sibling that
                  already runs on its engine — one file per picker group, so
                  none of them passes the 800-line ceiling
    signatures-conclave.js, signatures-prismatic.js, signatures-ashfall.js,
    signatures-stormglass.js
                  The twenty V3.2 blocks, same rule and the same one-file-per-
                  group split; each derives from one of the first twenty
    signatures-ashfall-hollows.js, signatures-stormglass-cells.js
                  Two of those groups did not fit one file — their last two
                  blocks each, spread back in by the group module
    signatures-synod.js, signatures-assize.js, signatures-escapement.js,
    signatures-litany.js
                  The twenty V3.3 blocks, three per group here and two in the
                  sibling module below — the split laid down before the first
                  block was written rather than after the ceiling was hit
    signatures-synod-descents.js, signatures-assize-wards.js,
    signatures-escapement-hairlines.js, signatures-litany-lashes.js
                  The other two blocks of each V3.3 group, spread back into the
                  same object the group module returns
    dead-keys.js  GENERATED — the keys the audit found nothing reads, so the
                  editor can hide them. Never hand-edited
  core/           App, Renderer, CameraRig, Time, Layers, shared frame uniforms
  effects/        Aim arrow, far-cast circle, ground decals, fissures, bursts,
                  light pool, shake, flash
  input/          InputManager (events) and AimController (both targeting shapes)
  loaders/        AssetLoader with a shared LoadingManager
  materials/      IceMaterial, LightningMaterial, MeteorMaterial,
                  VolumetricFireMaterial, BeamMaterial, SnareMaterial,
                  GlacierMaterial, FrostFieldMaterial, and the two shared by the
                  new engines: ShellMaterial, StrandMaterial
    volumetric-fire-glsl.js
                  The fire volume's two shader sources, lifted out verbatim: 566
                  of that material's 842 lines were one constructor argument
  particles/      GPU particle system + engine and rate emitters
  postprocessing/ Composer pipeline, grade shader, distortion shader
  shaders/lib/    Shared GLSL: noise library, common helpers
  ui/             HUD, Loadout model and AbilityPicker (the L menu), lil-gui editor,
                  preset manager, sigils and the copied reference styles
    glyph-frame.js, glyphs.js, glyphs-signatures.js,
    glyphs-signatures-v33.js
                  The eighty inline SVG marks: the shared 100×100 frame, the
                  first forty, the twenty of the V3.2 groups and the twenty of
                  the V3.3 groups
    controls.js, panels-strikes.js, panels-projectiles.js, panels-farcasts.js
                  The editor's shared control helpers and its six hand-written
                  panels, one module per cast shape
  utils/          Maths, colour cache, pooling, disposal, shader patching
  world/          Environment (stage lighting), floor, dust, contact shadows
  archive/        The retired four-element sandbox — see archive/README.md
tools/
  audit-settings-keys.mjs   Static check that no engine reads a key its block lacks,
                            and the reverse — which keys nothing reads
  registry-check.mjs        Eighty ids with a block, metadata, a sigil and an engine,
                            and `--fingerprint` over every value in them
docs/
  engine-notes.md           How the ice, the lightning, the beam and the snare are
                            built — lifted out of this file at the 800-line ceiling
  rough-edges-history.md    The V3.2, V3.1 and V20.3 rough-edge lists — lifted out
                            the same way when V3.4 hit the ceiling again
  elemental-library/tasks/  One file per library task: plan and progress log
```

Every file under `src/` is inside the 800-line ceiling in `AGENTS.md`, bar two knowing exceptions
in `src/archive/` (946 and 820) — nothing outside that folder imports from it, so a split there
would be rule-following with no reader.

---

## The loadout picker

The runtime uses ordinary ability ids from `ELEMENTS` directly. A small `Loadout` model owns six ids
and is shared by App, HUD and `AbilityPicker`. Picking an ability for a slot updates that array
immediately. If the ability is already equipped, both slots swap so the bar never contains duplicates.

The `L` menu mirrors the compact reference picker: six target chips across the top and a grouped card
grid below. Search, group and cast-shape filters are stored locally, while cards show only the ability
name, glyph, colour and current hotkey.

`AbilityManager` maps the same eighty ids directly to fifteen engine classes. Pools remain lazy:
selecting an ability warms one instance, while abilities that are never selected allocate no meshes
or materials.

---

## How it fits together

### Settings are the API

`src/config/settings.js` holds every tweakable value. Nothing else owns that state: shaders,
particle systems, lights and post passes *read* those objects every frame. That is what makes the
editor work with no rebuild — moving a slider changes the ice field that is already standing, the
next cast, the environment and the post stack at once. Preset loading deep-merges *into* the same
objects so every live binding stays valid.

```js
import { settings } from './config/settings.js';
settings.ice.height = 7;          // visible on the next frame, even mid-cast
settings.thunder.jitter = 1.2;    // re-kinks a bolt that is already in the air
settings.global.timeScale = 0.1;  // slow the whole cast to a crawl
```

Ability blocks are keyed by their id in `ELEMENTS`, and the shared systems that need to know
"which ability is the player holding" — the aim controller, the cooldowns, the HUD — look it up as
`settings[element]`. The four fields they rely on being present are `range`, `minRange`, `speed`
and `cooldown`; a far cast adds a fifth, `zoneRadius`. Everything else in a block is that ability's
own business.

### The rule that makes "edit while paused" work

A spike record in `IceAbility` stores **only what the dice decided**: a position *fraction* along
the line, a signed lateral *fraction*, and a handful of unitless jitters. Not one metre, radian or
second is captured when the cast starts. Every dimension is resolved against `settings.ice` inside
the update loop, which runs on a zero-length frame too.

So dragging `height` re-grows a field that is already standing; dragging `lean` re-tilts it;
dragging `clumping` re-packs it toward the centre line. The only values a record *does* capture
are timestamps — the moment its own eruption was triggered. Those are events, not dimensions.

The four *shape* controls (`facets`, `taper`, `roughness`, `bend`) cannot be expressed as a
per-instance transform, so they are baked into the geometry instead — and a six-sided crystal is
just 60 triangles, cheap enough to regenerate outright rather than approximate in a vertex shader.
`IceAbility#_syncGeometry` hashes those four values and rebuilds the three crystal meshes when the
hash changes, which is what keeps them live sliders rather than restart-required constants.

### Aiming

`AimController` raycasts the pointer onto the ground plane **every frame**, not only on mouse
move, so orbiting the camera with a cast armed swings the indicator under a stationary cursor. It
clamps the distance into `[minRange, range]`, tracks a 0..1 reveal envelope, and emits a single
`cast` event carrying an origin, a unit direction and a distance — which is exactly the signature
`Ability#spawn` takes. It decides nothing about what the cast does.

It runs on **real** time rather than the scaled simulation delta, so the indicator keeps animating
while the sandbox is paused.

There are two indicators and one controller. Which one is drawn comes from
`ELEMENT_META[element].cast` — `CastShape.LINE` or `CastShape.ZONE` — and that is the *only* thing
the two shapes disagree about. Arming, clamping, validating, revealing and firing are shared, and
both end in the same three-argument `cast` event, because from the targeting side a far cast is a
line cast you only care about the far end of. That is why zone targeting needed no change in
`Ability`, `AbilityManager` or `App`: `SnareAbility` reads its centre as `pointAt(1)` and works
outward from there.

### The far-cast circle

`ZoneIndicator` is the arrow's opposite number, and it is built out of the same two ideas: metres,
and no textures.

The **footprint** is one quad whose fragment shader remaps UV into metres from the target, so the
boundary stays 0.34 m thick whether the circle is 2 m or 8 m across. The band is deliberately the
heaviest mark on screen — it is the whole message — and it is split about the nominal radius by
`boundaryBias` rather than centred on it, so its *outer* lip stays honest about where the effect
ends. Inside there is a rim-weighted wash, contour rings travelling outward, warped filaments and a
reticle whose downrange arm is longer, because the quad carries the caster's yaw and that arm is
therefore the heading.

The **reach ring** at the caster is the bolt's ribbon strip bent into a circle: `(t, side)` in,
world position out. A quad big enough to hold a 20 m range would be 40 m across and shade a
screenful of discarded fragments for one thin line.

The circle **snaps out past its radius and settles back** when the cast is armed, and the trap does
the same thing when it lands. A circle that grows linearly reads as a UI element; one that
overshoots reads as something the caster did.

### The arrow is one SDF

`AimIndicator` is a single ground quad. Its fragment shader remaps UV into **metres measured from
the caster**, so every control in `settings.aim` is a real measurement — the shaft stays 0.42 m
wide whether the cast is 3 m or 15 m long.

The silhouette is a rounded union of a box (the shaft) and iq's exact triangle SDF (the head);
the cheap half-plane intersection leaves visible corner artefacts on a wedge this shallow. From
that one distance field the shader derives the outline, the rim-weighted interior wash, the
chevrons (a phase skewed by `|x|`, which turns flat bands into arrowheads pointing the way the
cast does), the frost noise and voronoi plates, the ring at the caster's feet, the range cap arc,
a six-fold frost rosette pinned to the impact point, and the sweep-out when the ability is armed.

### The ice, the lightning, the beam and the snare

How those four engines are actually built — the patched standard material and its thickness tint,
the bolt drawn entirely in a vertex shader, the tube drawn three times at three radii, and the one
ribbon threaded along four parametric paths — moved to [`docs/engine-notes.md`](docs/engine-notes.md)
when this file reached the 800-line ceiling in `AGENTS.md`. They are the reference for what a
derived block can reshape, so they are worth reading before writing a new signature.

### Eighty signatures, fifteen engines

The six original abilities are 600–1300 lines of bespoke code each — five of them now spread over
a class file and one or two kebab-case siblings, which changes where the lines live and not what
they do. Seventy-four more in that style would be neither coherent nor maintainable, so V20.3 went
the other way and V3.1, V3.2 and V3.3 followed it:

**1. Everything is element-parametric.** An `Ability` subclass and every material it builds read
`settings[this.element]`, never `settings.ice`. One engine can therefore carry any number of
signatures.

**2. Every engine runs at least twice, and that is the point.** An engine here is a *casting
grammar* — a fracture front, a funnel, a held column — and its settings block is the entire
character of the effect. `permafrost` is the Frost Lance's engine run wide and slow, `tidal` is the
Glacial Crown's ring of blades rebuilt out of water, `voidrail` is the Nova Beam inverted,
`sandstorm` is the Shard Cyclone loaded with stone, `verdant` is the fracture front growing thorns.
V3.1 pushed the busiest engines to four and five tenants: `IceAbility` now also carries Obsidian
Thorns and the Brine Lance, `BeamAbility` the Choral Ray and the Eclipse Column. Each is a settings
block and one line in `ABILITY_TYPES`; nothing else in the project changes. That an engine can
carry a fifth signature at all is the evidence that the parametrisation went deep enough.

V3.2 spread its twenty across **all fifteen** engines and gave none of them more than two, which is
the only distribution that fits — Ice, Beam, Glacier, Cyclone and Dome take two each, the other ten
take one. V3.3 did the same again, but chose its five doubles by *thinness* rather than by capacity:
Thunder, Rain, Well, Rift and Blades were the five sitting on three tenants each, and each of them
took a second id. The two siblings of a doubled engine were then put in different picker groups, so
a pair sharing a casting grammar never sits next to itself in the palette either.

The distribution across the eighty is now Ice 8, Beam 7 (11 counting the Spear, which subclasses
it), Glacier 7, Cyclone 7, then five each on Thunder, Meteor, Dome, Rift, Well, Blades and Rain, and
four each on Snare, Gate, Spear and Bloom. That an engine carries eight signatures at all is the
evidence the parametrisation went deep enough.

**3. Variants, not clones.** `config/variants.js` derives the fourteen V20.3 blocks from the six
originals — deep clone, then write the values that make it a different ability over the top. Two
rules keep that honest: a variant may *add* keys but never silently drop one (a derivation can
`borrow` a whole family from a second block), and a variant must be a different ability rather than
a recolour, so each one moves the silhouette, the timing *and* the palette.

**4. Siblings, not bases.** The twelve `config/signatures-*.js` group modules add the sixty V3.1,
V3.2 and V3.3 blocks with the same `derive()`, but each one comes off the *finished* signature that
already runs on its engine rather than off one of the six. A sibling carries exactly the control
surface its engine reads, so no derivation there can be short a family and none of them needs
`borrow` at all. The cost is an ordering constraint: the modules are merged
`variants → forge → hoarfrost → umbra → drowned → conclave → prismatic → ashfall → stormglass →
synod → assize → escapement → litany` in `settings.js`, and any other order hands `derive()` an
`undefined` base — which is not an error, it is a block of `NaN`. `pnpm audit:registry` walks every
number on every block and is what catches it.

The V3.3 modules also stop hitting the 800-line ceiling by accident: V3.2 had to split two of its
groups after the fact, so each V3.3 group was written as three blocks in the group module and two in
a named sibling from the start. The sibling is spread back into the same object the group module
returns, so the merge order above is untouched.

**5. Only keys that exist on the base get overwritten.** A derived block may add a key, but on these
sixty it never does: an override for a key the base does not have is not a bug that shows, it is a
control the editor renders and no shader reads. Three of the V3.2 bases carry no `colorBurst*`
family at all (`meteor`, `magma`, `plasma` tint their shells straight out of the flame palette), so
`pyreclast`, `sepulcher` and `halation` deliberately do not set one either — and in V3.3 `sanguine`,
`garnet`, `ferrous` and `brimstone` inherit the same gap and leave it alone. The same rule keeps
`fadeTime` and `zoneRadius` off `amalgam` and `porcelain`, and `slashPitch` unwritten on `orpiment`:
the blade engine never reads it, so a number there would be a slider that visibly does nothing.

The registry is `ABILITY_GROUPS` plus `ELEMENT_META` in `config/settings.js`. Groups organise the
picker only; the hotbar key belongs to one of the six mutable slots and never to the ability itself.

### Keeping eighty blocks honest

Parametrising by element buys a lot and costs exactly one thing: a settings key an engine reads but
its block does not have is not an error in JavaScript. It is `undefined`, which becomes `NaN` in a
uniform, which is a black material, a collapsed geometry, or an effect that silently never emits.
`pnpm build` cannot see it — it only proves the imports resolve.

`tools/audit-settings-keys.mjs` is the check that can. It collects every `c.foo` /
`this.config.foo` read out of each engine and each per-element material, then looks each one up on
every block that module is instantiated for. `pnpm audit:settings` exits non-zero on a miss, and it
found two real ones on the run that introduced it: `settings.cyclone` had no `trail*` family even
though `CycloneAbility` builds and syncs a `VolumetricFireMaterial` for both its signatures, and
`settings.sandstorm` had no `ringRate`, so the Sandstorm Coil's pressure rings never spawned.

Reads that are genuinely branch-guarded (the cyclone's crystal-versus-rock shard geometry) are
listed in a `CONDITIONAL` table in that file rather than waved through — each entry is a claim that
has to stay true.

The audit follows a module that has been split, and has to: a file outside its `CONSUMERS` table
falls to the coarse net that counts a name as live for *every* block, so moving an engine's
emission methods into a sibling would trade element-precise reads for "somebody reads this" and
shrink the dead-key list without a test going red. Parts are found by name (`kebab-case.js` next to
`PascalCase.js`) along the consumer's own imports; one under `abilities/` or `materials/` that no
consumer imports fails the audit rather than being scanned at the wrong precision.

### Adding another ability

An ability is an ordinary id shared by a small set of registries:

1. Add its settings block to `settings` (directly in `config/settings.js`, or as a derived block in
   `config/variants.js` or one of the eight `config/signatures-*.js` modules). It must
   exist before `DEFAULT_SETTINGS` is captured, and a derivation must run *after* the block it
   derives from.
2. Put the id in one group in `ABILITY_GROUPS` and add its label, accent, blurb and optional cast
   shape to `ELEMENT_META`.
3. Add its inline SVG mark to `ui/glyphs-signatures.js`, which `ui/glyphs.js` spreads into
   `ELEMENT_SIGILS`. `pnpm audit:registry` imports that table, so a mark that resolved to
   `undefined` fails the same as a missing one.
4. Map the id to an existing or new engine class in `ABILITY_TYPES` in `abilities/AbilityManager.js`.
5. Add the id to every `CONSUMERS` entry in `tools/audit-settings-keys.mjs` that its engine and
   materials are listed under — a new engine needs a new entry, an extra tenant on an existing one
   needs the id appended, or the audit never checks the block at all.

The picker and generated editor folders discover the id through `ABILITY_GROUPS`; the HUD and input
layer continue to deal in the six mutable slot indices, so they need no per-ability wiring.

To make it a **far cast** instead of a line cast, add two things and nothing else: `cast:
CastShape.ZONE` in its `ELEMENT_META` entry, and a `zoneRadius` in its settings block. The circle
indicator, the reach ring, the snap-out and the whole targeting loop come for free, and the ability
reads its centre as `pointAt(1)`.

### Particles

`particles/ParticleSystem.js` is a GPU-simulated, instanced-quad system. Motion (velocity, gravity,
analytic drag, curl turbulence, vortex swirl), size-over-lifetime, the colour gradient and alpha
fade are all evaluated in the shader from per-instance attributes; the CPU only ever writes spawn
data, and only the slots that changed are uploaded. Particles live in a ring buffer, so spamming
the ability recycles slots instead of allocating. Silhouettes (soft, smoke, streak, leaf, chip,
ring) are procedural — there are no sprite textures anywhere in the project.

Frost Lance uses three systems: **mist** (non-additive, so the fog genuinely occludes and gives the
field depth), **shards** (lit chips under gravity) and **glitter** (additive, negative gravity — the
rising plume that is the signature of the reference frame).

Storm Lance uses four: **sparks** (velocity-stretched streaks under gravity), **motes** (the slow
ionised drift around the bolt), **smoke** (non-additive haze off the scorched floor) and **debris**
(lit chips). Its sparks are emitted from several points along the bolt each frame rather than one:
a beam sheds along its whole length, and a single origin makes every emission read as a starburst.

Nova Beam uses four as well, and works one of them twice: its **motes** are the intake spiralling
*into* the orb while it charges and the drift shed off the column once it is firing — the same glow,
thrown the other way. Its **sparks** are thrown radially off the barrel and then dragged downrange
by `sparkForward`, which is the read that says "pressure"; the bolt's fall instead, and that one
difference does a lot of the work of keeping the two abilities apart.

### Render pipeline

Per frame:

1. **Depth prepass** — the opaque world into a half-res packed-depth buffer. Every VFX shader
   samples it for soft intersections, so nothing cuts a hard line into the ground. The crystals sit
   on `LAYER.WORLD`, so mist and glitter fade softly against them.
2. **Distortion pass** — meshes on the distortion layer write screen-space UV offsets into a second
   half-res buffer. Nothing writes to it in the current build; the pass is kept because it is the
   hook a refraction effect would use.
3. **Composer** — scene → refraction warp → bloom → tone map (ACES) → grade.

The grade pass folds chromatic aberration, lift/gain/contrast/saturation/temperature, vignette,
film grain and the impact flash into one resample.

Shadows come from a single directional light whose orthographic shadow camera is re-centred on the
character each frame and fitted to a 52 m box at 4096² (~1.3 cm/texel). The `three/addons` CSM
module was tried first and removed: it replaces three's `lights_fragment_begin` chunk *globally*,
so any material not explicitly registered with it silently loses all directional lighting.

Contact shadows are a real render: the character's depth is captured from below into a 256²
target, blurred twice and projected onto the ground.

---

## Editor and presets

Press **G** for the panel. Folders: Presets, Global, Aim indicator, Far-cast circle, Frost Lance,
Storm Lance, Cinder Fall, Nova Beam, Voltaic Snare, Glacial Crown, **Generated variants (74)**,
Environment, Post processing, Camera, Character. Every folder starts collapsed — there are enough
controls here that one open section pushes the rest off the screen.

**Generated variants (74)** is built from the settings blocks rather than written out — including
the count in its own title, which went stale the first time the library grew. It groups the
seventy-four additions by the same ability groups used in the picker, and each one's controls are read off
the values themselves — `#rrggbb` strings become colour pickers, integers of any size step by 1, and
every other number gets a slider from 0 (or a mirrored negative) to three times its shipped value,
which puts the default at a third of the track. Keys are sorted into the same four sections everywhere:
*The cast*, *Timing*, *Light & feel*, *Shape*, plus *Colour*.

Each of the seventy-four builds itself the first time you open it. Between them they are 11824
controls once `dead-keys.js` has hidden what nothing reads, and building all of them at boot is a
visible hitch on the loading screen paid for a panel almost nobody scrolls to the bottom of.

What a generated folder does not have is the prose. The six hand-written folders explain what each
control does to the silhouette; a generated one gives you a name and a range. Since every variant
descends from one of the six, **the base folder is the documentation for its descendants** — and
which block it came from directly is stated in its comment in `config/variants.js` or one of the
eight `config/signatures-*.js` modules.

- **Global** multipliers scale everything at once (speed, glow, noise, particles, lights, impact
  intensity, camera shake, time scale…).
- **Aim indicator** — the arrow's silhouette in metres, its outline and fill, the chevrons and
  frost, and the rings and rosette.
- **Far-cast circle** (40 controls) — the boundary band, the interior, the ticks, sweep and
  reticle, the reach ring, and the snap-out. Shared by every far cast, so it is filed with the
  targeting rather than with any one ability.
- **Frost Lance** (113 controls, 25 of them colours) — the cast, the footprint, the silhouette,
  the crystal itself, the eruption timing, the ice material, the frost on the ground,
  mist/chips/glitter, the impact and the dynamic light.
- **Storm Lance** (123 controls, 34 of them colours) — the cast, where the bolt leaves the hand,
  the bundle, one filament, the ribbon, flicker and restrike, the bolt's colour, the burns on the
  ground, sparks/motes/smoke/debris, the muzzle and impact, and the dynamic light.
- **Nova Beam** (176 controls) — the cast, where it leaves the hands, the column, the core/sheath/
  halo stack, the surface and its flow, the beam's colour, the coils, the shock discs, the charge
  and its intake, what the floor does, sparks/motes/steam/debris, release/impact/burn, and the two
  dynamic lights.
- **Voltaic Snare** (174 controls, 33 of them colours) — the cast and its footprint, the leash, the
  column, the tendrils, the rim arcs, the shared filament shape and flicker, the ribbon and its
  colour, the field on the floor, the burns, sparks/updraft/smoke/debris, throw/snap/hold, and the
  dynamic light.
- **Presets** save to `localStorage`, and can be duplicated, deleted, exported to JSON, imported
  from JSON, or reset to the shipped defaults.

Every ability exposes **every** colour it draws with, and none is derived from another: the crystal
palette, the bolt palette, the beam's four layers and its coils and discs, the ground marks, the
impact shells, the shockwave rings, the screen flashes, and a four-stop lifetime gradient
(`birth → early → late → death`) for each particle system. Tinting the fog without touching the ice,
or cooling the sparks to orange while the filaments stay blue, is a picker away.

Presets are plain snapshots of the settings tree, so an exported file is readable and editable by
hand.

Knobs worth knowing about, because they reshape their ability the most:

- `ice.heightCurve` — how late the ramp climbs; raise it and the field stays low until it explodes
  at the target. `ice.frontBias` below 1 crowds the crystals toward the impact point.
- `thunder.jitter` and `thunder.jitterScale` — how violently the bolt kinks, and how often.
  `thunder.strands` and `thunder.spread` set how wide the bundle reads, and `thunder.restrike`
  how hard it strobes. Those five carry the character of the effect.
- `beam.radius` and `beam.flare` — how heavy the column reads and how hard it opens out where it
  lands. `beam.charge` and `beam.lifetime` are the wind-up and the hold, which are what make this
  ability feel unlike the other three, and `beam.coreWidth` / `beam.coreFill` decide whether the
  layers stay separable or blow out to white.
- `snare.zoneRadius` — the one number the whole far cast is built on. It resizes the targeting
  circle, the tendrils, the rim arcs, the burnt field and the pillar's throat together, live.
  After that, `snare.snapTime` and `snare.height` carry the moment it opens, and `snare.tendrils` /
  `snare.rimArcs` / `snare.strands` decide how much of that footprint is actually lit.
- `zone.boundary` and `zone.snap` — how thick the far-cast circle's edge reads, and how hard it
  overshoots on the way out. Between them they decide whether the indicator feels like a UI overlay
  or like something the caster is doing.

---

## Performance notes

- Abilities, decals, bursts and particles are pooled, per type. Twelve casts in a row build at most
  **three** instances of an ability and then stop allocating — `MAX_CONCURRENT` is shared across
  all eighty, so mixing signatures retires the oldest cast whichever one it was.
- The whole crystal field is three draw calls regardless of crystal count; the cap is 288.
- A whole bolt is **two** draw calls regardless of filament count; the cap is 24 filaments at 72
  samples each. Nothing about the path touches the CPU, so `strands` is nearly free.
- A whole snare — leash, pillar, tendrils and rim arcs — is **two** draw calls plus one for the
  field, regardless of how many filaments are in it; the cap is 56 across the four roles. As with
  the bolt, none of the shape touches the CPU, so raising `tendrils` or `rimArcs` is nearly free.
  Its targeting circle is two more: one quad and one ring strip.
- A whole beam is **six** draw calls regardless of how many coils and discs are on it — three tube
  passes over one shared geometry, plus one instanced draw each for the coils, the discs and the
  charge orb. As with the bolt, none of the shape touches the CPU, so `coils` and `rings` are
  nearly free. It takes two of the six dynamic lights (the column and the caster's hands), so four
  concurrent beams would exhaust the pool; `LightPool.acquire()` returns null and every use of the
  handle is guarded.
- The six dynamic point lights are created at boot and parked at zero intensity rather than added
  and removed — changing the light count forces three to recompile every material.
- Shadow maps update exactly once per frame even though the scene is rendered several times.
- `renderer.compileAsync()` runs during boot so the first cast never stutters on shader compile.
- Pixel ratio is capped at 1.75; the depth and distortion buffers are half resolution.

Measured on a default cast **of the original six**: 32 draw calls idle, ~69 with a full ice field
standing and ~49 with a bolt in the air, ~1150 live particles. A snare standing with its cage,
field and rim burns is ~45 draw calls and ~480 live particles, and arming its circle costs two.
Four concurrent casts peaked at ~186 draw calls and five of the six dynamic lights — which is the
measurement that set `MAX_CONCURRENT` to 3 once the fourteen raymarched signatures arrived. The new
signatures have not been profiled.

Live counters (FPS, live particles, instances, draw calls) are in the top-right of the HUD.

---

## The archive

`src/archive/` holds the previous incarnation of this project: a four-element bending sandbox
(fire, water, earth, air) cast along a freehand-drawn spline, plus a walk mode that let the avatar
ride the same stroke. None of it is imported by the live app, so Vite never bundles it.

It was retired because this build replaced path drawing with a linear skillshot, which removed the
input every one of those systems was built on. The raymarched flame and water surfaces in
particular are worth mining. See `src/archive/README.md` for what is in there and how to restore a
piece of it.

---

## Known rough edges

### V3.4

- **Ten V3.3 blocks were rebuilt, and none of them has been seen either.** `azurite`, `indigo`,
  `cobalt`, `vermilion`, `ferrous`, `flywheel`, `astrolabe`, `mercury`, `brimstone` and `fulminate`
  were reported as unreadable and rewritten from the cause outwards — a `slashSpan` of 5.8 rad is
  332°, which is a ring and not a crescent; a `petalWidth` of 1.8 against a `petalSpan` of 2.6 is a
  hull and not a petal; `widthTip` 3.2 on `width` 0.16 is a half-metre club at the tip of a whip.
  The causes are arithmetic and checkable, but that the replacements *read* is not.
- **`ochre` was left exactly as it was**, by request. It is the one block of the twenty that was
  not complained about, so it is the control.
- **Four labels changed, and the ids did not.** Azurite Horn, Cobalt Obelisk, Vermilion Shears and
  Brimstone Vents replace their V3.3 names because the shapes underneath them changed. Nothing
  keys off a label, so this is cosmetic — but a saved loadout or a screenshot from V3.3 will name
  abilities that no longer exist under those names.
- **Ten sigils were redrawn against the new comments, not against a render.** Same standing as the
  twenty in V3.2: that they are distinguishable at 34px is a claim no gate here can make.
- **The `--fingerprint` baseline was rewritten on purpose, a third time.** This is the first time
  it was rewritten for *changed values* rather than for added blocks: the block count held at
  eighty and the hash moved from `79ca92222472ea36` to `939e45b63cc033df` because numbers inside
  ten blocks moved. Re-recording it is correct here only because the change was the whole point.
- **The superlatives were recomputed once more, and nothing checks them.** Each rebuilt block
  claims a ceiling — the shortest body on the rain engine, the largest hoop on the gate engine, the
  slowest walk on the rift engine — against the library as it stands now. The same structural gap
  as in V3.3 applies: no gate compares prose to numbers.
- **A rebuilt block also invalidates superlatives in blocks that were *not* rebuilt.** `sanguine`
  called its sixty stones "the fewest on the engine" and named Brimstone Fissure as the one that
  raised none; the rebuilt `brimstone` lays forty, so both halves of that were wrong and are
  corrected. Only the ten new blocks had been re-derived — the reverse direction was found by
  searching the config for the ten labels, which is the only handle there is.
- **The dead-key count did not move.** 2929 unread keys on 48 blocks, before and after, which is
  the expected result of changing values rather than adding or removing them, and the reason the
  settings audit is a weak signal for this kind of change.

### V3.3

- **None of the twenty added signatures has been seen either.** Same standing as V3.2 below and the
  same two gates behind it: `pnpm run audit` proves every key an engine reads exists on all eighty
  blocks and that all eighty ids have a block, metadata, a sigil and an engine; `pnpm build` proves
  the imports resolve. Whether the GLSL compiles for the new blocks, and whether a silhouette reads
  the way its comment claims, is untested.
- **Sixteen picker groups of five**, up from twelve. Whether the card grid still reads without a
  scroll break has only been reasoned about statically, and four more groups is the largest single
  jump the picker has taken.
- **The superlatives were recomputed after the merge, and nine of them were wrong.** A comment that
  says "the slowest on the engine" is written against the library as it stood when the block was
  drafted, and twenty new blocks move those ceilings underneath it. Every claim in the V3.3 blocks
  was re-derived from the merged `settings` afterwards — `sanguine`'s basalt was no longer the
  fewest (Brimstone Fissure, as it then was, raised none), `quicksilver` was not the only near-solid beam (Eclipse
  Column is more opaque), `amalgam`'s clumping was not the strongest. They are corrected, but the
  class of error is structural: nothing in the gates checks prose against numbers.
- **`slashPitch` is written nowhere in V3.3.** It sits on the `blades` block and the blade engine
  never reads it, so the drafted value for `orpiment` was dropped rather than shipped as a slider
  that visibly does nothing. `dead-keys.js` lists it for every id on that engine.
- **The `--fingerprint` baseline was rewritten on purpose**, again: twenty blocks arrived, so the
  hash was never going to match. `tools/.fingerprint` now records the eighty-block value.
- **The 800-line split was laid down before the blocks were written.** V3.2 had to split two groups
  after the fact; each V3.3 group is three blocks plus a named sibling of two from the start. The
  largest of the eight is 582 lines after the V3.4 rewrites, so the headroom is real rather than
  asserted.

### V3.2 and earlier

Moved verbatim to [`docs/rough-edges-history.md`](docs/rough-edges-history.md) — the V3.2, V3.1 and
V20.3 sections, kept because each records why a limit existed rather than only that it did. Adding
V3.4 above pushed this file over the 800-line ceiling a second time, and taking the settled prose
out is the same move V3.2 made with the engine deep-dives.

### Standing

- Crystals are drawn with `transparent: true` and `depthWrite: true`. That is the right trade for
  near-opaque ice and it keeps the field from sorting through itself, but at low `ice.opacity` the
  sorting artefacts between overlapping spikes become visible.
- The eruption front is a straight line on a flat floor. Both assumptions are baked in — the ground
  is a single plane at y = 0, and the aim raycast targets that plane.
- The distortion pass runs with nothing writing to it. It costs a half-res clear per frame.
- The impact cluster is placed radially around the end point, so at very short cast distances it
  can overlap the band behind it more than it should.
- The far cast inherits the flat-floor assumption twice over: the circle is drawn on a single quad
  at `y = 0`, and the snare's tendrils and rim arcs are placed against that same plane. Neither
  would drape over a step.
- Both the targeting circle and the snare's field are additive, so the footprint brightens the
  floor rather than shading it. On a pale floor the boundary would need a non-additive pass under
  it to stay readable.

---

## Licence

Code is provided as-is for the purposes of this project. The bundled HDR probe and the character
FBX retain their original licences.
