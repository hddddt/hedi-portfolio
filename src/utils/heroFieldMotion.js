/**
 * Hero opening scroll narrative — one master timeline for green / blue / yellow blobs.
 * Screen 1 (intro) → transition → Screen 2 (thesis). Coordinated convergence, minimal rotation.
 */

import { HERO_BLOB_INTRO } from '../data/organicFieldPalette.js';
import {
  easeScrollBreath,
  mix,
  plateauProgress,
  scrollBreathScalePulse,
  smoothstep,
} from './fieldNarrative.js';

/** @typedef {'intro' | 'transition' | 'thesis'} HeroPhase */

/**
 * @typedef {object} HeroBlobState
 * @property {number} centerX
 * @property {number} centerY
 * @property {number} scale
 * @property {number} opacity
 * @property {number} stretchX
 * @property {number} stretchY
 * @property {number} [rotation]
 */

const PHASE = {
  introEnd: 0.4,
  thesisStart: 0.7,
};

const INTRO_OPACITY = {
  a: HERO_BLOB_INTRO.a.opacity,
  b: HERO_BLOB_INTRO.b.opacity,
  c: HERO_BLOB_INTRO.c.opacity,
};

/** Chapter id for the opening scroll (in-card field only while this chapter is active). */
export const OPENING_CHAPTER_ID = 'home-landing';

/** Opening scroll complete — switch from in-card field to viewport field. */
export const OPENING_SCROLL_COMPLETE = 1;

/**
 * In-card field for the full opening scrub (0→1); hand off when capabilities handoff settles.
 * @param {number} _rawProgress
 * @param {boolean} [openingComplete]
 * @param {number} [capHandoff]
 */
export function shouldUseInCardOrganicField(_rawProgress, openingComplete = false, capHandoff = 1) {
  return !openingComplete || capHandoff < 0.85;
}

/**
 * Viewport field once opening latch begins — overlaps briefly for seamless pose carry.
 * @param {number} _rawProgress
 * @param {boolean} [openingComplete]
 * @param {number} [capHandoff]
 */
export function shouldUseViewportOrganicField(_rawProgress, openingComplete = false, capHandoff = 1) {
  return openingComplete && capHandoff > 0.04;
}
/** Raw progress where screen-2 shrink begins (≈ second viewport of opening) */
export const OPENING_SHRINK_START = 0.34;
export const OPENING_SHRINK_END = 0.92;

/** Scroll progress where independent idle motion yields to hero narrative */
export const HERO_SCROLL_DRIVE_START = 0.006;
export const HERO_SCROLL_DRIVE_END = 0.09;

/**
 * 0 at rest — independent warm motion. Ramps to 1 shortly after scroll begins.
 * @param {number | null | undefined} heroProgress
 */
export function heroScrollDrive(heroProgress) {
  if (heroProgress == null || heroProgress <= 0) return 0;
  return easeScrollBreath(
    smoothstep(HERO_SCROLL_DRIVE_START, HERO_SCROLL_DRIVE_END, heroProgress),
  );
}

/** Green = system field, Blue = POV lens, Yellow = human agency */
const BLOB_STATES = {
  intro: HERO_BLOB_INTRO,
  transition: {
    a: {
      ...HERO_BLOB_INTRO.a,
      centerX: 0.4,
      centerY: 0.495,
      scale: 1.12,
      opacity: INTRO_OPACITY.a,
      rotation: -0.14,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.63,
      centerY: 0.43,
      scale: 1.04,
      opacity: INTRO_OPACITY.b,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.54,
      centerY: 0.34,
      scale: 0.94,
      opacity: INTRO_OPACITY.c,
    },
  },
  thesis: {
    a: {
      ...HERO_BLOB_INTRO.a,
      centerX: 0.41,
      centerY: 0.5,
      scale: 1.1,
      opacity: INTRO_OPACITY.a,
      rotation: -0.1,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.57,
      centerY: 0.46,
      scale: 1.06,
      opacity: INTRO_OPACITY.b,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.5,
      centerY: 0.4,
      scale: 0.96,
      opacity: INTRO_OPACITY.c,
    },
  },
};

const FOCUS = { x: 0.5, y: 0.48 };

/**
 * @param {HeroBlobState} from
 * @param {HeroBlobState} to
 * @param {number} t
 * @returns {HeroBlobState}
 */
function lerpBlobState(from, to, t) {
  const u = Math.max(0, Math.min(1, t));
  const rotFrom = from.rotation ?? 0;
  const rotTo = to.rotation ?? 0;
  let rotDelta = rotTo - rotFrom;
  if (rotDelta > Math.PI) rotDelta -= Math.PI * 2;
  if (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
  return {
    centerX: mix(from.centerX, to.centerX, u),
    centerY: mix(from.centerY, to.centerY, u),
    scale: mix(from.scale, to.scale, u),
    opacity: mix(from.opacity, to.opacity, u),
    stretchX: mix(from.stretchX, to.stretchX, u),
    stretchY: mix(from.stretchY, to.stretchY, u),
    rotation: rotFrom + rotDelta * u,
  };
}

function resolveBlobOpacity() {
  return INTRO_OPACITY;
}

function applyBlobOpacity(states) {
  const op = resolveBlobOpacity();
  return {
    a: { ...states.a, opacity: op.a },
    b: { ...states.b, opacity: op.b },
    c: { ...states.c, opacity: op.c },
  };
}

function blobStatesAtProgress(heroProgress) {
  const p = Math.max(0, Math.min(1, heroProgress));
  let states;
  if (p < PHASE.introEnd) {
    const t = easeScrollBreath(p / PHASE.introEnd);
    states = {
      a: lerpBlobState(BLOB_STATES.intro.a, BLOB_STATES.transition.a, t),
      b: lerpBlobState(BLOB_STATES.intro.b, BLOB_STATES.transition.b, t),
      c: lerpBlobState(BLOB_STATES.intro.c, BLOB_STATES.transition.c, t),
    };
  } else if (p < PHASE.thesisStart) {
    const t = easeScrollBreath((p - PHASE.introEnd) / (PHASE.thesisStart - PHASE.introEnd));
    states = {
      a: lerpBlobState(BLOB_STATES.transition.a, BLOB_STATES.thesis.a, t),
      b: lerpBlobState(BLOB_STATES.transition.b, BLOB_STATES.thesis.b, t),
      c: lerpBlobState(BLOB_STATES.transition.c, BLOB_STATES.thesis.c, t),
    };
  } else {
    states = BLOB_STATES.thesis;
  }
  return applyBlobOpacity(states);
}

/**
 * Shared scroll scrub for opening (screen 1 hold → screen 2 thesis).
 * @param {number} rawP
 * @param {boolean} [prm]
 */
export function computeHeroScrollNarrative(rawP, prm = false) {
  const pScrub = prm ? rawP : plateauProgress(rawP, 0.5, 0.66);
  const open = smoothstep(0.03, 0.97, pScrub);
  const heroProgress = open;

  let phase = /** @type {HeroPhase} */ ('intro');
  if (heroProgress >= PHASE.thesisStart) phase = 'thesis';
  else if (heroProgress >= PHASE.introEnd) phase = 'transition';

  const converge = smoothstep(PHASE.introEnd * 0.5, PHASE.thesisStart, heroProgress);
  const globalBlur = mix(14, 8, smoothstep(0.35, 0.85, heroProgress));

  return {
    rawP,
    pScrub,
    heroProgress,
    phase,
    converge,
    globalBlur,
    /** Content crossfade — thesis copy appears on screen 2, independent of field fade */
    fadeHero: smoothstep(0.12, 0.52, heroProgress),
    fadeThesis: smoothstep(0.38, 0.78, heroProgress),
    /** Field color stays full through screen-2 shrink — only scale recedes */
    fieldEnvelope: 1,
  };
}

/**
 * Opening field presence from raw scroll — shrink on screen 2, no sudden vanish.
 * @param {number} rawP
 * @param {boolean} [prm]
 */
export function computeOpeningFieldPresence(rawP, prm = false) {
  const narrative = computeHeroScrollNarrative(rawP, prm);
  const p = Math.max(0, Math.min(1, rawP));
  /** Shrink only after screen 2 entry — elastic breath, no color fade */
  const shrinkLinear = smoothstep(0.72, 0.94, p);
  const shrinkT = easeScrollBreath(shrinkLinear);
  const fieldScale = mix(1, 0.74, shrinkT) * scrollBreathScalePulse(shrinkLinear);
  return {
    ...narrative,
    fieldScale,
    fieldEnvelope: 1,
  };
}

/**
 * Subtle shared breathe — only after thesis settles.
 * @param {number} heroProgress
 * @param {number} time
 * @param {boolean} prm
 */
function heroBreathe(heroProgress, time, prm) {
  if (prm) return { dx: 0, dy: 0, scale: 1 };
  const transitionGain =
    smoothstep(PHASE.introEnd * 0.75, PHASE.thesisStart + 0.08, heroProgress) *
    (1 - smoothstep(PHASE.thesisStart + 0.18, 0.96, heroProgress));
  const settleGain = smoothstep(0.82, 0.94, heroProgress) * 0.35;
  const gain = Math.max(transitionGain * 0.9, settleGain);
  const wave = Math.sin(time * 0.48) * gain;
  const scrollSwell =
    transitionGain > 0.01
      ? Math.sin(
          ((heroProgress - PHASE.introEnd) /
            Math.max(0.001, PHASE.thesisStart - PHASE.introEnd)) *
            Math.PI,
        ) *
        0.045 *
        transitionGain
      : 0;
  return {
    dx: wave * 0.004,
    dy: Math.sin(time * 0.48 + 0.6) * 0.003 * gain,
    scale: 1 + wave * 0.012 + scrollSwell,
  };
}

function transitionBreathScale(heroProgress) {
  if (heroProgress < PHASE.introEnd || heroProgress > PHASE.thesisStart + 0.12) return 1;
  const t = (heroProgress - PHASE.introEnd) / (PHASE.thesisStart - PHASE.introEnd);
  return scrollBreathScalePulse(t);
}

/**
 * OrganicField targets for in-card hero (progress-driven, no independent loops).
 * @param {number} heroProgress 0–1
 * @param {number} [time]
 * @param {boolean} [prm]
 */
export function computeHeroFieldTargets(heroProgress, time = 0, prm = false) {
  const states = blobStatesAtProgress(heroProgress);
  const breath = heroBreathe(heroProgress, time, prm);
  const gather = smoothstep(PHASE.introEnd * 0.55, PHASE.thesisStart + 0.06, heroProgress) * 0.14;

  const applyBlob = (state) => {
    const cx = mix(state.centerX, FOCUS.x, gather * 0.22) + breath.dx;
    const cy = mix(state.centerY, FOCUS.y, gather * 0.18) + breath.dy;
    return {
      centerX: cx,
      centerY: cy,
      scale: state.scale * breath.scale * transitionBreathScale(heroProgress),
      opacity: state.opacity,
      stretchX: state.stretchX,
      stretchY: state.stretchY,
      rotation: state.rotation ?? 0,
      flow: 0,
    };
  };

  return {
    a: applyBlob(states.a),
    b: applyBlob(states.b),
    c: applyBlob(states.c),
    flowB: 0,
  };
}
