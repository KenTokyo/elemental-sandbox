# Ground decals: the fill budget

The rule this file exists for:

> **Ein Bodeneffekt kostet Fläche, nicht Anzahl.** Ground decals are transparent
> quads that do not occlude each other, so overlapping patches shade the same
> pixels again and again. Budget them in **square metres of laid quad per cast**,
> not in patch count — and never let a footprint control (`frostSpread`,
> `scorchRadius`, a `× half-width` multiplier) scale a patch past the band it was
> laid over.

## Why the floor is the expensive part

`effects/GroundDecals.js` draws one quad per mark, `transparent: true`,
`depthWrite: false`, `frustumCulled = false`. None of them write depth, so none
of them cull each other: N overlapping patches means N shading passes over the
same pixel.

The `FROST` branch of `DECAL_FRAGMENT` is the heaviest of the eight. Per
fragment that survives the `cover` test:

| what | cost |
| --- | --- |
| `warp` (2 × `fbm3`) | 6 simplex |
| `lobes` (1 × `fbm3`) | 3 simplex |
| `snowDepth` × 3 (relief needs forward differences) | 12 simplex + 27 Voronoi cells |
| `glint` | 1 simplex |

≈ **22 3D-simplex evaluations and 27 Voronoi cells per fragment.** That is a
material you can afford to cover a few square metres with. It is not a material
you can afford to cover the arena with, and covering the arena is exactly what
happened.

## What the Permafrost Wake was doing

The line-cast engine (`abilities/IceAbility.js`, `_frontFx`) lays a rime patch
every `1 / frostRate` metres, each with radius `halfWidth(s) × frostSpread ×
rand(0.6, 1.15)`. Three authored numbers multiply into the fill cost, and none
of them looks alarming on its own:

| | range × rate = patches | mean patch radius | **laid area per cast** |
| --- | --- | --- | --- |
| Frost Lance (the reference) | 15 × 3.6 = 54 | 1.97 m | 655 m² + 173 m² sheet = **828 m²** |
| Permafrost Wake (before) | 17 × 6.5 = 110 | 7.18 m | 17,930 m² + 2,190 m² sheet = **20,120 m²** |
| Cinder Veil (before) | 19 × 9.0 = 171 | 11.86 m | 75,600 m² + 4,926 m² sheet = **80,530 m²** |

24× and 97× the Frost Lance. Two further multipliers made it worse:

- `frostSpread: 2.5` on a band whose half-width is already 4.8 m put the rime
  **2.5 half-widths past the band on each side** — the snow was never a wake, it
  was a disc with a wake somewhere in the middle of it.
- The impact sheet in `onImpact` is `halfWidth(1) × frostSpread × 2.2`, which
  came out at a **26 m radius** for the Wake and **39.6 m** for the Veil: a
  single quad wider than the playable floor, held for 15 seconds.
- `frostLife: 12` against a `lifetime` of 6.4 s meant every patch of a cast was
  still on the floor when the field itself had already withdrawn, and the 1.1 s
  cooldown let five or six casts stack.

## The three guardrails now in place

**1. Per-cast rime plan — `IceAbility._planRime()`.** A cast decides its patch
spacing once, at spawn, against `RIME_AREA_BUDGET = 3000` m². The budget is
spent on *count*, not radius: thinning patches out where they already overlap is
invisible, shrinking them leaves the band with a bare margin. `RIME_MAX_PATCHES
= 96` backstops the draw calls and `RIME_MAX_RADIUS = 7 m` backstops any single
patch, including the impact sheet.

**2. Global live-area budget — `DecalSystem._reclaim()`.** Across *all*
abilities, `LIVE_AREA_BUDGET = 9000` m² of quad may be on the floor at once
(`LIVE_MAX_DECALS = 320` for the draw calls). A spawn that would exceed it
retires the oldest marks early by pushing them into their own fade curve at a
raised clock rate — `CULL_FADE = 0.45 s`, so nothing pops. This is what covers
chain-casting, which no per-cast budget can see.

**3. Authored numbers brought back inside the band.**

| | after | laid area | change |
| --- | --- | --- | --- |
| Permafrost Wake | `frostSpread 1.15`, `frostRate 3.2`, `frostLife 8.0` | **2,020 m²** | 10× cheaper |
| Cinder Veil | `frostSpread 1.2`, `frostRate 2.2`, `frostLife 7.5` | **3,109 m²** | 26× cheaper |

Both now sit under the code budget on their own, so the guardrail is a guardrail
rather than the thing shaping the look.

## What was checked and left alone

- **Absolute Zero** (`DomeAbility`) — one 10.6 m sheet plus `rimeRate 5/s` of
  small collar patches: ≈ 700 m² for the whole ability. It was fine, as
  suspected. Same for Glacial Crown and Frost Gate.
- **Verdant Rupture** (1,325 m²), **Obsidian Thorns** (177 m²), **Amalgam Run**
  (6 m²) — under budget, planned exactly as authored.
- **Verdigris Seam** and **Brine Lance** both author more than 96 patches (128
  and 198) and get thinned by `RIME_MAX_PATCHES`. At their patch radii — 2.63 m
  and 0.35 m against spacings of 0.17 m and 0.23 m — the rime still overlaps
  continuously either way. Nothing visible changes; Verdigris drops from
  2,770 m² to 2,232 m² and Brine from 78 m² to 38 m².

## Authoring a new ground effect

1. Estimate `patches × π × meanRadius²` before you commit the numbers. Under
   ~1,000 m² per cast is comfortable; 3,000 m² is the ceiling.
2. Keep a `× half-width` / `× radius` footprint multiplier at or below ~1.3. Past
   that the mark stops describing the ability and starts describing the arena.
3. Keep the decal life in the same order as the ability's own `lifetime`. A mark
   that outlives its cast by 2× stacks with the next cast.
4. If an effect needs to look bigger, reach for `intensity`, colour and grain
   before radius — those are free, area is not.
