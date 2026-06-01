/**
 * Hero opening scroll narrative — one master timeline for green / blue / yellow blobs.
 * Screen 1 (intro) → transition → Screen 2 (thesis). Coordinated convergence, minimal rotation.
 */

import { plateauProgress, smoothstep, mix } from './fieldNarrative.js';

/** @typedef {'intro' | 'transition' | 'thesis'} HeroPhase */

/**
 * @typedef {object} HeroBlobState
 * @property {number} centerX
 * @property {number} centerY
 * @property {number} scale
 * @property {number} opacity
 * @property {number} stretchX
 * @property {number} stretchY
 */

const PHASE = {
  introEnd: 0.4,
  thesisStart: 0.7,
};

/** Chapter id for the opening scroll (in-card field only while this chapter is active). */
export const OPENING_CHAPTER_ID = 'home-landing';

/** Opening scroll complete — switch from in-card field to viewport field. */
export const OPENING_SCROLL_COMPLETE = 1;

/**
 * In-card field for the full opening scrub (0→1); hand off only when openingComplete is latched.
 * @param {number} _rawProgress
 * @param {boolean} [openingComplete]
 */
export function shouldUseInCardOrganicField(_rawProgress, openingComplete = false) {
  return !openingComplete;
}

/**
 * Viewport field after opening section has left the viewport.
 * @param {number} _rawProgress
 * @param {boolean} [openingComplete]
 */
export function shouldUseViewportOrganicField(_rawProgress, openingComplete = false) {
  return openingComplete;
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
  return smoothstep(HERO_SCROLL_DRIVE_START, HERO_SCROLL_DRIVE_END, heroProgress);
}

/** Green = system field, Blue = POV lens, Yellow = human agency */
const BLOB_STATES = {
  intro: {
    a: { centerX: 0.38, centerY: 0.6, scale: 1.34, opacity: 0.96, stretchX: 1.1, stretchY: 0.94 },
    b: { centerX: 0.66, centerY: 0.5, scale: 1.02, opacity: 0.54, stretchX: 0.92, stretchY: 0.92 },
    c: { centerX: 0.54, centerY: 0.36, scale: 0.84, opacity: 0.46, stretchX: 1, stretchY: 1.1 },
  },
  transition: {
    a: { centerX: 0.44, centerY: 0.54, scale: 1.24, opacity: 0.92, stretchX: 1.04, stretchY: 0.98 },
    b: { centerX: 0.57, centerY: 0.47, scale: 1.12, opacity: 0.66, stretchX: 0.98, stretchY: 0.95 },
    c: { centerX: 0.51, centerY: 0.4, scale: 0.94, opacity: 0.54, stretchX: 0.99, stretchY: 1.08 },
  },
  thesis: {
    a: { centerX: 0.43, centerY: 0.53, scale: 1.16, opacity: 0.88, stretchX: 1.02, stretchY: 0.98 },
    b: { centerX: 0.59, centerY: 0.49, scale: 1.06, opacity: 0.62, stretchX: 0.96, stretchY: 0.96 },
    c: { centerX: 0.52, centerY: 0.41, scale: 0.9, opacity: 0.5, stretchX: 0.98, stretchY: 1.05 },
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
  return {
    centerX: mix(from.centerX, to.centerX, u),
    centerY: mix(from.centerY, to.centerY, u),
    scale: mix(from.scale, to.scale, u),
    opacity: mix(from.opacity, to.opacity, u),
    stretchX: mix(from.stretchX, to.stretchX, u),
    stretchY: mix(from.stretchY, to.stretchY, u),
  };
}

function blobStatesAtProgress(heroProgress) {
  const p = Math.max(0, Math.min(1, heroProgress));
  if (p < PHASE.introEnd) {
    return {
      a: lerpBlobState(BLOB_STATES.intro.a, BLOB_STATES.transition.a, p / PHASE.introEnd),
      b: lerpBlobState(BLOB_STATES.intro.b, BLOB_STATES.transition.b, p / PHASE.introEnd),
      c: lerpBlobState(BLOB_STATES.intro.c, BLOB_STATES.transition.c, p / PHASE.introEnd),
    };
  }
  if (p < PHASE.thesisStart) {
    const t = (p - PHASE.introEnd) / (PHASE.thesisStart - PHASE.introEnd);
    return {
      a: lerpBlobState(BLOB_STATES.transition.a, BLOB_STATES.thesis.a, t),
      b: lerpBlobState(BLOB_STATES.transition.b, BLOB_STATES.thesis.b, t),
      c: lerpBlobState(BLOB_STATES.transition.c, BLOB_STATES.thesis.c, t),
    };
  }
  return BLOB_STATES.thesis;
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
    /** Content crossfade aligned to blob transition */
    fadeHero: smoothstep(0.12, 0.52, heroProgress),
    fadeThesis: smoothstep(0.38, 0.78, heroProgress),
    /** Stay bright through screen 2 — shrink handles presence, not opacity cliff */
    fieldEnvelope: mix(1, 0.96, smoothstep(0.9, 0.99, heroProgress)),
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
  const shrinkT = smoothstep(OPENING_SHRINK_START, OPENING_SHRINK_END, p);
  const fieldScale = mix(1, 0.74, shrinkT);
  const endSoften = mix(1, 0.97, smoothstep(0.92, 1, p));
  const fieldEnvelope = narrative.fieldEnvelope * endSoften;
  return {
    ...narrative,
    fieldScale,
    fieldEnvelope: Math.max(0.94, fieldEnvelope),
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
  const gain = smoothstep(0.82, 0.94, heroProgress) * 0.35;
  const wave = Math.sin(time * 0.48) * gain;
  return {
    dx: wave * 0.004,
    dy: Math.sin(time * 0.48 + 0.6) * 0.003 * gain,
    scale: 1 + wave * 0.01,
  };
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
  const gather = smoothstep(0.25, 0.82, heroProgress) * 0.05;

  const applyBlob = (state) => {
    const cx = mix(state.centerX, FOCUS.x, gather * 0.12) + breath.dx;
    const cy = mix(state.centerY, FOCUS.y, gather * 0.1) + breath.dy;
    return {
      centerX: cx,
      centerY: cy,
      scale: state.scale * breath.scale,
      opacity: state.opacity,
      stretchX: state.stretchX,
      stretchY: state.stretchY,
      rotation: 0,
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
