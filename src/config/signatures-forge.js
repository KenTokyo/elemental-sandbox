/**
 * signatures-forge.js — five of the twenty signatures added in V3.1.
 *
 * `variants.js` derived fourteen blocks from the six hand-written ones, which
 * meant borrowing whole key families (`field*`, `trail*`) whenever a new engine
 * needed a control surface its base block did not own. This file does not have
 * that problem, because it runs **after** the twenty are complete and derives
 * each new signature from the *sibling that already runs on the same engine*:
 *
 *   Sunforge Anvil ← Solar Spear      (SpearAbility)
 *   Emberspire     ← Sandstorm Coil   (CycloneAbility, rock branch)
 *   Ember Reap     ← Spectral Blades  (BladesAbility)
 *   Solar Aperture ← Boreal Gate      (GateAbility)
 *   Choral Ray     ← Nova Beam        (BeamAbility)
 *
 * The other five of this pair — the Hoarfrost Reliquary — live in
 * `signatures-hoarfrost.js`, split off purely for file length; they are built
 * the same way and merged directly after this file.
 *
 * A sibling derivation inherits exactly the keys its engine reads, so no
 * derivation here can be short a family — and the settings audit still proves
 * it rather than taking it on trust.
 *
 * The rule from `variants.js` still holds and is the whole job: **a signature is
 * a different ability, not a recolour.** Every block below moves the silhouette
 * (footprint, height, count, curvature), the timing (travel, hold, release) and
 * the palette away from the sibling it came from, and each doc comment says
 * which read it is going for. Where a value is pinned by an engine ceiling
 * (`MAX_RINGS`, `MAX_TENDRIL`, …) the comment says so, because a number above
 * the cap is silently clamped and would read as a knob that does nothing.
 */

import { derive } from './variants.js';

export function buildForgeSignatures(settings) {
  const { solar, sandstorm, blades, gate, beam } = settings;

  return {
    /* ================================================================== */
    /* EMBERFORGE CHOIR                                                    */
    /* ================================================================== */

    /**
     * SUNFORGE ANVIL — the Solar Spear's shaft, made short, thick and heavy.
     *
     * The Spear is a needle dropped from twenty-six metres onto a small circle:
     * it arrives before you can read it, and the footprint is barely wider than
     * the shaft. This is the opposite gesture with the same engine — a molten
     * billet held over a *wide* floor for three quarters of a second, then
     * driven down at a quarter of the speed, so the whole cast is the fall and
     * the strike rather than the flash. Everything follows from that: the column
     * is three times the radius, the rings are the spreading shock rather than
     * travelling coils, and the hold is almost nothing because an anvil blow
     * does not linger.
     */
    anvil: derive(solar, {
      range: 19.0,
      minRange: 0,
      zoneRadius: 5.6,
      spearHeight: 12.0, // low enough that you watch it come down
      spearTilt: 0.24,
      castAnim: 'cast1',

      charge: 0.78, // the wind-up is most of the cast
      speed: 62,
      lifetime: 0.55,
      fadeTime: 0.95,
      cooldown: 2.6,
      endHeight: 0.12,

      radiusNear: 0.95,
      radius: 2.35,
      radiusCurve: 0.72, // widest just above the floor, not at the sky
      flare: 0.55,
      flareWidth: 0.2,
      coreWidth: 0.34,
      coreSharp: 1.1,
      coreFill: 0.85,
      shellWidth: 1.25,
      shellRim: 0.8,
      shellFill: 0.34,
      haloWidth: 3.4,
      haloOpacity: 0.24,
      opacity: 0.44,
      throb: 0.22,
      throbSpeed: 1.4,

      coils: 2,
      coilTurns: 0.55,
      coilSpeed: 0.42,
      coilRadius: 1.2,
      coilWidth: 0.22,
      coilGlow: 5.5,
      colorCoil: '#fff0c0',
      colorCoilEdge: '#ff5a08',

      rings: 12, // MAX_RINGS — the shock stack is the point of this one
      ringSpeed: 2.6,
      ringInner: 1.5,
      ringOuter: 3.5,
      ringSwell: 1.15,
      ringGlow: 3.2,
      colorRing: '#ffcf7a',

      orbSize: 1.15,
      orbThrob: 0.3,
      orbGlow: 3.4,
      orbBands: 3,

      colorCore: '#fff6e2',
      colorInner: '#ffd489',
      colorOuter: '#ff8b1e',
      colorHalo: '#7a2a00',
      colorScorch: '#140a04',
      colorEmber: '#ff8b1e',

      fieldBoundary: 0.52,
      fieldBoundaryGlow: 2.2,
      fieldFill: 0.36,
      fieldRings: 3.4,
      fieldSpokes: 12,
      fieldSpokeLength: 0.72,
      fieldCore: 2.0,
      fieldCoreSize: 0.42,
      colorField: '#ff9a2e',
      colorFieldEdge: '#ffe9c2',

      lightIntensity: 42,
      lightRadius: 26,
      lightColor: '#ffa646',
      chargeShake: 0.08,

      burstSize: 6.4,
      burstIntensity: 2.4,
      impactShake: 1.6,
      shakeDuration: 1.3,
      impactFlash: 0.42,
      rumble: 0.09,
      colorBurstA: '#ff8b1e',
      colorBurstB: '#ffd489',
      colorBurstC: '#fff6e2',
      colorFlash: '#ffd489'
    }),

    /**
     * EMBERSPIRE — the third spin, and the tall one.
     *
     * Shard Cyclone is glass and Sandstorm Coil is stone; both are read from
     * their *load*. This one is read from its **rate of climb**: a narrow
     * chimney turning three times as fast as the coil it derives from, with the
     * dust column kept on but pulled in thin and bright so it is a flue rather
     * than a wall. The cinders it carries are small and numerous, and they are
     * thrown upward (`climb` near one) instead of orbiting at a height, which
     * is the difference between a tornado and a fire.
     */
    emberspire: derive(sandstorm, {
      range: 17.0,
      zoneRadius: 3.3,
      speed: 55,
      snapTime: 0.2,
      lifetime: 3.6,
      fadeTime: 1.2,
      cooldown: 2.0,
      castAnim: 'cast1',

      funnelHeight: 11.5,
      funnelBase: 0.16,
      funnelTop: 0.7,
      funnelCurve: 1.9, // stays tight for most of its height, then flares
      funnelLean: 0.06,
      spin: 4.6,
      spinFalloff: 0.3,
      spinJitter: 0.25,
      climb: 0.95,
      climbJitter: 0.5,

      shardCount: 190,
      shardScale: 0.19,
      shardScaleJitter: 0.9,
      tumble: 7.5,
      wobble: 0.28,
      wobbleScale: 1.8,

      strands: 30,
      strandWidth: 0.05,
      strandTurns: 2.3,
      strandSpeed: 2.1,
      strandJitter: 0.3,
      strandGlow: 2.6,
      colorStrandCore: '#fff4d2',
      colorStrandEdge: '#ff7a18',
      colorStrandHalo: '#5c1400',

      trailWidth: 0.42,
      trailPlume: 0.7,
      trailDensity: 1.35,
      trailSoot: 0.6,
      trailGlow: 4.2,
      trailOpacity: 0.72,
      trailBuoyancy: 5.4,
      trailSpeed: 6.0,
      trailTurbulence: 3.4,
      trailTempCore: 2050,
      trailTempEdge: 1710,
      colorFlameMid: '#ffc24e',
      colorFlameEdge: '#ff4d08',
      colorFlameSmoke: '#1a0f08',

      dustRate: 260,
      dustSize: 1.2,
      dustOpacity: 0.055,
      dustRise: 2.6,
      colorDustA: '#ffcf8c',
      colorDustB: '#c9702e',
      colorDustC: '#6b3210',
      colorDustD: '#1c0e06',
      moteRate: 300,
      moteRise: 3.4,
      moteGlow: 1.6,
      colorMoteA: '#fff4d2',
      colorMoteB: '#ffab3c',
      colorMoteC: '#ff5a08',
      colorMoteD: '#2a0c02',
      gritRate: 120,
      gritGravity: -11,
      colorGritA: '#ffd07a',
      colorGritB: '#c96a24',
      colorGritC: '#5c2a0c',
      colorGritD: '#1c0e06',

      colorField: '#ff7a18',
      colorFieldEdge: '#ffd9a0',
      fieldRings: 2.6,
      fieldSpin: 0.5,

      lightIntensity: 30,
      lightRadius: 20,
      lightColor: '#ff9633',
      lightFlicker: 0.4,
      lightFlickerSpeed: 18,

      burstSize: 3.4,
      impactShake: 0.7,
      holdShake: 0.05,
      rumble: 0.05,
      colorBurstA: '#ff7a18',
      colorBurstB: '#ffc24e',
      colorBurstC: '#fff4d2',
      colorFlash: '#ffc24e'
    }),

    /**
     * EMBER REAP — three enormous strokes where Spectral Blades cuts seven.
     *
     * Same engine, opposite rhythm. The Blades are a burst: small, fast, teal,
     * gone in half a second, and the echo is a whisper behind each one. This is
     * a *swing* — three arcs nearly twice the radius, each lit three times as
     * long, spaced far enough apart that you count them, with a heavy delayed
     * echo so every cut is visibly followed by its own heat. The stroke is
     * flatter (`slashTilt` well down) because a reap comes across, not down.
     */
    emberreap: derive(blades, {
      range: 16.0,
      speed: 34,
      lifetime: 1.7,
      fadeTime: 0.95,
      cooldown: 1.9,
      castAnim: 'cast2',

      slashes: 3,
      slashInterval: 0.27, // you can count them
      slashLife: 0.9,
      slashSpan: 4.6,
      slashRadius: 4.2,
      slashRadiusJitter: 0.12,
      slashTilt: 0.52, // across, not down
      slashHeight: 1.95,
      slashHeightJitter: 0.22,
      slashSweep: 1.5,
      slashWidth: 0.3,
      slashTaper: 0.05,
      slashCurve: 1.05,
      slashLead: 0.55,
      echo: 0.78,
      echoDelay: 0.17,
      echoSpread: 0.62,

      width: 0.05,
      coreSharp: 3.2,
      glowWidth: 7.4,
      glowOpacity: 0.58,
      colorCore: '#fff2d8',
      colorInner: '#ffbe63',
      colorOuter: '#ff5f10',
      colorHalo: '#5a1200',
      glow: 2.6,

      arcRate: 2.2,
      arcRadius: 2.2,
      colorArc: '#ffcf8c',
      colorEmber: '#ff5f10',
      colorScorch: '#160b05',
      scorchRadius: 2.2,
      scorchIntensity: 0.6,

      sparkRate: 260,
      sparkSize: 0.19,
      sparkSpeed: 7.0,
      sparkLifetime: 0.75,
      colorSparkA: '#fffdf2',
      colorSparkB: '#ffd27a',
      colorSparkC: '#ff5f10',
      colorSparkD: '#3d1103',

      lightIntensity: 22,
      lightRadius: 16,
      lightColor: '#ff8a30',
      burstSize: 3.6,
      burstIntensity: 1.6,
      impactShake: 1.0,
      shakeDuration: 0.8,
      impactFlash: 0.22,
      rumble: 0.05,
      colorBurstA: '#ff5f10',
      colorBurstB: '#ffbe63',
      colorBurstC: '#fff2d8',
      colorFlash: '#ffbe63'
    }),

    /**
     * SOLAR APERTURE — the Boreal Gate opened wide and stood almost upright.
     *
     * The Gate is a doorway: raked back, tightly framed, a swirling sheet, nine
     * short rays. This is an *aperture* — a third again the radius, raked to
     * within a few degrees of plumb, taking twice as long to open, with the
     * membrane calmed right down (low swirl, high ring count) so it reads as a
     * lens rather than a portal, and sixteen rays at nearly twice the length
     * thrown through it in a tight spread. The frame is amber quartz, not ice.
     */
    aperture: derive(gate, {
      range: 20.0,
      zoneRadius: 6.2,
      speed: 40,
      lifetime: 5.4,
      fadeTime: 1.5,
      cooldown: 2.4,
      castAnim: 'cast3',

      gateRadius: 1.35,
      gateLift: 0.5,
      gateTilt: 0.05, // nearly plumb
      gateOpen: 0.95, // it dilates rather than snapping
      riseTime: 0.34,

      ringShards: 120, // MAX_SHARDS is 140
      ringShardScale: 1.6,
      ringShardLean: 0.18,
      ringShardFan: 0.5,
      ringShardJitter: 0.28,

      membraneScale: 1.35,
      membraneSwirl: 0.45,
      membraneSpeed: 0.26,
      membraneRings: 5.6,
      membraneRingSpeed: 0.32,
      membraneDepth: 0.55,
      membraneOpacity: 0.8,
      membraneGlow: 3.4,
      colorMembraneA: '#4a1c00',
      colorMembraneB: '#ffb648',
      colorMembraneC: '#fff6e0',

      rays: 16, // MAX_RAYS
      rayLength: 13.0,
      rayWidth: 0.1,
      raySpeed: 0.7,
      raySpread: 0.3,
      rayDim: 0.85,
      rayGlow: 3.2,
      colorRayCore: '#fffdf2',
      colorRayEdge: '#ffc46a',
      colorRayHalo: '#7a3000',

      colorGlass: '#4a2a10',
      colorEdge: '#fff6e0',
      colorPrismA: '#ffd07a',
      colorPrismB: '#ff9a2e',
      colorCore: '#ffe6b4',
      colorTip: '#fffaf0',
      dispersion: 0.95,
      pipe: 1.25,
      tipGlow: 2.0,

      colorField: '#ffb648',
      colorFieldEdge: '#fff6e0',
      fieldRings: 3.2,
      fieldSpin: 0.02,
      colorVeil: '#ffd89a',
      colorVeilCrest: '#fff6e4',
      colorFrost: '#fff2da',
      colorFrostEdge: '#c98a3c',

      colorMistA: '#fff2da',
      colorMistB: '#ffd9a0',
      colorMistC: '#c98a3c',
      colorMistD: '#2c1706',
      colorGlitterA: '#fffdf2',
      colorGlitterB: '#ffc46a',
      colorGlitterC: '#ffe6b4',
      colorGlitterD: '#341a04',
      colorSnowA: '#fffdf2',
      colorSnowB: '#ffeac4',
      colorSnowC: '#ffc46a',
      colorSnowD: '#33190a',

      lightIntensity: 20,
      lightRadius: 22,
      lightColor: '#ffb64d',
      impactShake: 0.6,
      shakeDuration: 1.0,
      rumble: 0.03,
      colorShockA: '#ffb648',
      colorShockB: '#fff6e0',
      colorBurstA: '#ffb648',
      colorBurstB: '#ffe6b4',
      colorBurstC: '#fff6e0',
      colorFlash: '#ffe6b4'
    }),

    /**
     * CHORAL RAY — the Nova Beam, slowed down and opened out.
     *
     * The Beam is a lance: a tight cyan column that arrives in a tenth of a
     * second and burns for one. This one takes almost a full second to wind up,
     * crosses thirty metres, and then *stands* for three — the longest hold in
     * the library. It is two and a half times the radius at a third of the
     * opacity, so it reads as a lit volume rather than a bar, and the coil count
     * comes down while the ring count goes to the ceiling: fewer things turning
     * around it, more things breathing along it.
     */
    chorus: derive(beam, {
      range: 30.0,
      minRange: 3.5,
      charge: 0.92,
      speed: 90,
      lifetime: 3.2,
      fadeTime: 1.2,
      cooldown: 2.8,
      castAnim: 'cast3',

      radiusNear: 0.55,
      radius: 1.9,
      radiusCurve: 0.85,
      flare: 0.9,
      flareWidth: 0.16,
      throb: 0.14,
      throbScale: 2.6,
      throbSpeed: 1.2,

      coreWidth: 0.14,
      coreSharp: 1.15,
      coreFill: 0.45,
      shellWidth: 1.35,
      shellRim: 0.9,
      shellFill: 0.24,
      haloWidth: 3.8,
      haloRim: 3.2,
      haloOpacity: 0.2,
      opacity: 0.34,
      ripple: 0.35,
      rippleBands: 1.2,
      rippleSpeed: 0.9,
      streak: 0.55,
      flowSpeed: 2.6,

      coils: 3,
      coilTurns: 0.75,
      coilSpeed: -0.28,
      coilRadius: 1.35,
      coilWidth: 0.16,
      coilGlow: 5.5,
      coilPulse: 0.35,
      coilPulseSpeed: 0.9,
      colorCoil: '#fff0c8',
      colorCoilEdge: '#ffb04a',

      rings: 12, // MAX_RINGS — the breathing is what carries the hold
      ringSpeed: 0.55,
      ringInner: 3.2,
      ringOuter: 3.9,
      ringSwell: 0.85,
      ringFade: 0.3,
      ringGlow: 3.0,
      colorRing: '#ffe7b0',

      orbSize: 0.62,
      orbThrobSpeed: 3.4,
      orbGlow: 3.4,

      colorCore: '#fffdf4',
      colorInner: '#ffeec4',
      colorOuter: '#ffc257',
      colorHalo: '#6a3a05',
      colorScorch: '#140e06',
      colorEmber: '#ffc257',
      colorDustA: '#6b5a3c',
      colorDustB: '#ffe7b0',

      sparkRate: 200,
      colorSparkA: '#fffdf4',
      colorSparkB: '#ffeec4',
      colorSparkC: '#ffc257',
      colorSparkD: '#5c3208',
      moteRate: 150,
      moteRise: 1.4,
      colorMoteA: '#fffdf4',
      colorMoteB: '#ffe7b0',
      colorMoteC: '#ffc257',
      colorMoteD: '#4a2a06',

      lightIntensity: 34,
      lightRadius: 26,
      lightColor: '#ffd18a',
      lightPulse: 0.1,
      lightPulseSpeed: 1.6,
      muzzleLightIntensity: 20,

      burstSize: 3.2,
      burstIntensity: 1.2,
      impactShake: 0.5,
      shakeDuration: 0.9,
      burnShake: 0.05,
      impactFlash: 0.2,
      colorBurstA: '#ffc257',
      colorBurstB: '#ffeec4',
      colorBurstC: '#fffdf4',
      colorFlash: '#ffeec4',
      colorCastFlash: '#ffeec4'
    }),
  };
}
