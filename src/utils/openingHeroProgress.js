/**
 * Single scroll progress (0–1) for opening hero shader field.
 * Phases: Immersion → Formation → Lockup (Release not implemented yet).
 */

export const HERO_PHASE = {
  IMMERSION_END: 0.22,
  FORMATION_END: 0.58,
  LOCKUP_END: 0.78,
};

function clamp01(t) {
  return Math.max(0, Math.min(1, t ?? 0));
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function clampHeroProgress(raw) {
  return clamp01(raw);
}

/** @param {number} heroProgress */
export function deriveOpeningHeroPhases(heroProgress) {
  const p = clampHeroProgress(heroProgress);
  return {
    heroProgress: p,
    immersionT: smoothstep(0, HERO_PHASE.IMMERSION_END, p),
    formationT: smoothstep(HERO_PHASE.IMMERSION_END, HERO_PHASE.FORMATION_END, p),
    lockupT: smoothstep(HERO_PHASE.FORMATION_END, HERO_PHASE.LOCKUP_END, p),
    releaseT: smoothstep(HERO_PHASE.LOCKUP_END, 1, p),
  };
}

/** @param {number} p */
export function openingHeroPhaseLabel(p) {
  const t = clampHeroProgress(p);
  if (t < HERO_PHASE.IMMERSION_END) return 'immersion';
  if (t < HERO_PHASE.FORMATION_END) return 'formation';
  if (t < HERO_PHASE.LOCKUP_END) return 'lockup';
  return 'release';
}

/**
 * Shader-only state — camera dolly (not plane shrink), compound editorial object.
 * @param {number} heroProgress
 * @param {number} [timeSec]
 */
export function mapOpeningHeroShaderState(heroProgress, timeSec = 0) {
  const { immersionT, formationT, lockupT, heroProgress: p } =
    deriveOpeningHeroPhases(heroProgress);

  const currentPhase = openingHeroPhaseLabel(p);

  /**
   * Visual formation curves (earlier than formal phase edges).
   * ~0.35 organizing · ~0.48 core tension · ~0.58 readable object
   */
  const organize = smoothstep(0.06, 0.5, p);
  const centerGravity = 0.12 + smoothstep(0, 0.56, p) * 0.88;
  const compound = smoothstep(0.1, 0.6, p);
  const coreTension = smoothstep(0.18, 0.5, p);

  /**
   * Camera: immersion very close (crop into object); SG ref cDistance≈3.6 but
   * landing needs tighter framing so white card sits just outside frame.
   */
  const revealStructure = smoothstep(0.1, HERO_PHASE.LOCKUP_END, p);
  /** SG: cDistance 0.5, cameraZoom 15.1, fov 45 */
  const cameraDistance = 0.82 + revealStructure * 6.95;
  const cameraFov = 45 - revealStructure * 8 - lockupT * 2;
  const cameraPolarDeg = 90;
  const lookAtYOffset = organize * 0.05 - lockupT * 0.02;
  const planeScale = 1;
  const planeRotationXDeg = 0;
  const planeRotationYDeg = mix(130, 28, revealStructure);
  const planeRotationZDeg = mix(70, 22, revealStructure);

  /**
   * Object mask on off-white card — card is always underneath.
   * At 0.00 the viewport is a close crop into the three bodies; white margins are
   * off-screen, not absent. Pull-back + smaller mask reveal the card from ~0.22+.
   */
  const maskReveal = smoothstep(0.22, HERO_PHASE.LOCKUP_END, p);
  const maskRadius = 0.98 - maskReveal * 0.56;
  const maskSoftness = mix(0.18, 0.11, compound) + lockupT * 0.025;

  const separation = clamp01(organize * 0.32 + lockupT * 0.42);
  const openSpace = maskReveal;

  const bluePressure = clamp01(0.5 + smoothstep(0, 0.52, p) * 0.35 + coreTension * 0.1);
  const amberAccent = clamp01(
    0.22 + smoothstep(0, 0.52, p) * 0.12 + compound * 0.06 + lockupT * 0.02,
  );

  /** Stronger SG warp — visible flow + readable three bodies */
  const noiseStrength = 0.16 + immersionT * 0.06 - lockupT * 0.04;
  const noiseDensity = 1.55;
  const noiseFrequency = 5.5;
  const flowAmplitude = 3.2;
  const grain = 0.028 - lockupT * 0.008;
  const uSpeed = 0.32 * (1 - lockupT * 0.85);

  const motionFreeze = lockupT * 0.92;
  const uTime = timeSec * uSpeed * (1 - motionFreeze);

  const globalOpacity = 1;
  const brightness = 0.94 + compound * 0.05;
  const contrast = 1.02 + compound * 0.04;

  return {
    heroProgress: p,
    currentPhase,
    immersionT,
    formationT,
    lockupT,
    organize,
    centerGravity,
    coreTension,
    cameraDistance,
    cameraFov,
    cameraPolarDeg,
    cameraAzimuthDeg: 108,
    lookAtYOffset,
    planeScale,
    planeRotationXDeg,
    planeRotationYDeg,
    planeRotationZDeg,
    grain,
    noiseStrength: Math.max(0.008, noiseStrength),
    noiseDensity,
    noiseFrequency,
    flowAmplitude,
    uTime,
    uSpeed,
    maskRadius,
    maskSoftness,
    compound,
    separation,
    openSpace,
    bluePressure,
    amberAccent,
    globalOpacity,
    brightness,
    contrast,
    structureOpacity:
      immersionT * 0.04 + formationT * 0.22 + lockupT * 0.38,
  };
}

/** Structure SVG — same heroProgress, no separate clock. */
export function deriveOpeningHeroStructure(heroProgress) {
  const { structureOpacity } = mapOpeningHeroShaderState(heroProgress);
  const { formationT, lockupT } = deriveOpeningHeroPhases(heroProgress);
  const wrapOpacity = structureOpacity * (0.55 + lockupT * 0.45);
  const strokeOpacity = 0.26 + formationT * 0.12 + lockupT * 0.08;
  return {
    wrapOpacity: clamp01(wrapOpacity),
    strokeOpacity: clamp01(strokeOpacity),
    draw: smoothstep(0.12, 0.52, heroProgress),
  };
}

/**
 * Typography lockup — Hedi → role → descriptor → scroll cue (last).
 * @param {number} heroProgress
 */
export function deriveOpeningHeroTypography(heroProgress) {
  const { lockupT, formationT, heroProgress: p } = deriveOpeningHeroPhases(heroProgress);

  const hediT = smoothstep(0, 0.42, lockupT);
  const roleT = smoothstep(0.12, 0.58, lockupT);
  const descriptorT = smoothstep(0.28, 0.72, lockupT);
  const scrollCueT = smoothstep(0.62, 1, lockupT);

  const hediY = (1 - hediT) * 10;
  const roleY = (1 - roleT) * 10;
  const descriptorY = (1 - descriptorT) * 8;
  const hediBlur = (1 - hediT) * 2.5;

  const heroSlotOpacity = hediT;
  const heroVisible = heroSlotOpacity > 0.04;

  const thesisOpacity = p >= HERO_PHASE.LOCKUP_END ? smoothstep(0, 0.35, p - HERO_PHASE.LOCKUP_END) : 0;

  return {
    hediOpacity: hediT,
    hediTranslateY: hediY,
    hediBlurPx: hediBlur,
    roleOpacity: roleT,
    roleTranslateY: roleY,
    descriptorOpacity: descriptorT,
    descriptorTranslateY: descriptorY,
    scrollCueOpacity: scrollCueT * (1 - smoothstep(0.92, 1, p)),
    heroSlotOpacity,
    heroVisible,
    thesisOpacity,
    formationT,
    lockupT,
  };
}
