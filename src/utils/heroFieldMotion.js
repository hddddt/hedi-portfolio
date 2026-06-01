/**
 * Hero opening scroll narrative — three coordinated phases:
 *  1 scroll start → Hedi lifts, field settles from idle + elastic impact
 *  2 continued scroll → blobs gather, Hedi exits, then thesis copy fades in
 *  3 thesis complete → shrunk field + full copy hold, exit only after dwell
 */

import { HERO_BLOB_INTRO, HERO_GREEN_ROTATION } from '../data/organicFieldPalette.js';
import {
  easeScrollBreath,
  mix,
  scrollBreathScalePulse,
  smoothstep,
} from './fieldNarrative.js';

/** @typedef {'intro' | 'transition' | 'thesis' | 'exit'} HeroPhase */

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

/** Raw scroll segment boundaries (0–1 through .opening-scroll) */
export const OPENING_PHASE1_END = 0.08;
export const OPENING_PHASE2_END = 0.26;
export const OPENING_PHASE3_END = 0.5;
export const OPENING_EXIT_END = 1;

/** @deprecated */
export const OPENING_SCREEN1_END = OPENING_PHASE1_END;
export const OPENING_SCREEN2_ENTER = OPENING_PHASE2_END;
export const OPENING_SCREEN2_DWELL_END = OPENING_PHASE3_END;
export const OPENING_FIELD_SHRINK_END = 0.88;
export const OPENING_SHRINK_START = OPENING_PHASE2_END;
export const OPENING_SHRINK_END = OPENING_EXIT_END;

const INTRO_OPACITY = {
  a: HERO_BLOB_INTRO.a.opacity,
  b: HERO_BLOB_INTRO.b.opacity,
  c: HERO_BLOB_INTRO.c.opacity,
};

export const OPENING_CHAPTER_ID = 'home-landing';
export const OPENING_SCROLL_COMPLETE = 1;

export function shouldUseInCardOrganicField(_rawProgress, openingComplete = false, capHandoff = 1) {
  return !openingComplete || capHandoff < 0.85;
}

export function shouldUseViewportOrganicField(_rawProgress, openingComplete = false, capHandoff = 1) {
  return openingComplete && capHandoff > 0.04;
}

/** @deprecated use openingFieldScrollDrive(rawP) during opening */
export const HERO_SCROLL_DRIVE_START = 0.006;
export const HERO_SCROLL_DRIVE_END = 0.09;

/**
 * Master opening orchestration from raw scroll — single source for UI + field.
 * @param {number} rawP
 */
export function computeOpeningScrollOrchestration(rawP) {
  const p = Math.max(0, Math.min(1, rawP));

  /** Phase 1 — idle → still, elastic impact on first scroll (short) */
  const idleStillness = 1 - smoothstep(0.008, OPENING_PHASE1_END, p);
  const scrollImpact = scrollBreathScalePulse(smoothstep(0.012, OPENING_PHASE1_END * 0.95, p));

  /** Phase 2 — narrative drive + blob gather */
  const scrollDrive = easeScrollBreath(
    Math.max(smoothstep(0.003, 0.07, p), smoothstep(0.008, OPENING_PHASE1_END + 0.04, p) * 0.78) *
      (1 - smoothstep(OPENING_PHASE3_END, OPENING_EXIT_END, p) * 0.35),
  );

  /** Blob hero timeline — fast intro → thesis convergence */
  let heroProgress;
  if (p <= OPENING_PHASE1_END) {
    heroProgress = smoothstep(0, OPENING_PHASE1_END, p) * 0.22;
  } else if (p <= OPENING_PHASE2_END) {
    const t = (p - OPENING_PHASE1_END) / (OPENING_PHASE2_END - OPENING_PHASE1_END);
    heroProgress = 0.22 + easeScrollBreath(t) * (PHASE.thesisStart - 0.22);
  } else if (p <= OPENING_PHASE3_END) {
    heroProgress = PHASE.thesisStart;
  } else {
    const t = (p - OPENING_PHASE3_END) / (OPENING_EXIT_END - OPENING_PHASE3_END);
    heroProgress = PHASE.thesisStart + easeScrollBreath(t) * (1 - PHASE.thesisStart);
  }

  /** Gather — completes early in phase 2 */
  const gather = smoothstep(0.003, OPENING_PHASE2_END - 0.04, p);

  /** Screen 1 — quick lift off, gone before thesis */
  const fadeHero = smoothstep(0.015, OPENING_PHASE2_END - 0.03, p);

  /** Screen 2 — right after Hedi leaves */
  const fadeThesis =
    p < OPENING_PHASE2_END - 0.008
      ? 0
      : smoothstep(OPENING_PHASE2_END, OPENING_PHASE3_END - 0.05, p);

  /** Field shrink — starts mid phase 2, settles before phase 3 hold ends */
  const shrinkLinear = smoothstep(OPENING_PHASE2_END - 0.12, OPENING_PHASE3_END - 0.08, p);
  const fieldScale = mix(1, 0.56, easeScrollBreath(shrinkLinear));

  let phase = /** @type {HeroPhase} */ ('intro');
  if (p > OPENING_PHASE3_END) phase = 'exit';
  else if (p >= OPENING_PHASE2_END) phase = 'thesis';
  else if (p >= OPENING_PHASE1_END) phase = 'transition';

  return {
    rawP: p,
    heroProgress,
    phase,
    idleStillness,
    scrollDrive,
    scrollImpact,
    gather,
    fadeHero,
    fadeThesis,
    fieldScale,
    fieldEnvelope: 1,
    converge: gather,
    globalBlur: mix(14, 8, smoothstep(OPENING_PHASE1_END, OPENING_PHASE3_END, p)),
  };
}

/** Opening field scroll drive — raw scroll based */
export function openingFieldScrollDrive(rawP) {
  return computeOpeningScrollOrchestration(rawP).scrollDrive;
}

/** @param {number | null | undefined} heroProgress */
export function heroScrollDrive(heroProgress) {
  if (heroProgress == null || heroProgress <= 0) return 0;
  return easeScrollBreath(
    smoothstep(HERO_SCROLL_DRIVE_START, HERO_SCROLL_DRIVE_END, heroProgress),
  );
}

const BLOB_STATES = {
  intro: HERO_BLOB_INTRO,
  transition: {
    a: {
      ...HERO_BLOB_INTRO.a,
      centerX: 0.4,
      centerY: 0.495,
      scale: 1.16,
      opacity: INTRO_OPACITY.a,
      rotation: HERO_GREEN_ROTATION,
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
      scale: 1.08,
      opacity: INTRO_OPACITY.a,
      rotation: HERO_GREEN_ROTATION,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.57,
      centerY: 0.46,
      scale: 1.0,
      opacity: INTRO_OPACITY.b,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.5,
      centerY: 0.4,
      scale: 0.9,
      opacity: INTRO_OPACITY.c,
    },
  },
};

const FOCUS = { x: 0.5, y: 0.48 };

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

function applyBlobOpacity(states) {
  return {
    a: { ...states.a, opacity: INTRO_OPACITY.a },
    b: { ...states.b, opacity: INTRO_OPACITY.b },
    c: { ...states.c, opacity: INTRO_OPACITY.c },
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

export function computeHeroScrollNarrative(rawP, prm = false) {
  if (prm) {
    const heroProgress = rawP;
    return {
      rawP,
      pScrub: heroProgress,
      heroProgress,
      phase: heroProgress >= PHASE.thesisStart ? 'thesis' : heroProgress >= PHASE.introEnd ? 'transition' : 'intro',
      converge: smoothstep(PHASE.introEnd * 0.5, PHASE.thesisStart, heroProgress),
      globalBlur: mix(14, 8, smoothstep(0.35, 0.85, heroProgress)),
      fadeHero: smoothstep(0.12, 0.52, heroProgress),
      fadeThesis: smoothstep(0.38, 0.78, heroProgress),
      fieldEnvelope: 1,
      idleStillness: 0,
      scrollDrive: 1,
      scrollImpact: 1,
      gather: 1,
      fieldScale: 1,
    };
  }
  const orch = computeOpeningScrollOrchestration(rawP);
  return {
    ...orch,
    pScrub: orch.heroProgress,
  };
}

export function computeOpeningFieldPresence(rawP, prm = false) {
  return computeHeroScrollNarrative(rawP, prm);
}

/**
 * @param {number} heroProgress
 * @param {number} [time]
 * @param {boolean} [prm]
 * @param {object} [orch] opening orchestration slice
 */
export function computeHeroFieldTargets(heroProgress, time = 0, prm = false, orch = null) {
  const states = blobStatesAtProgress(heroProgress);
  const gather = orch?.gather ?? smoothstep(PHASE.introEnd * 0.55, PHASE.thesisStart + 0.06, heroProgress);
  const impact = orch?.scrollImpact ?? 1;
  const stillness = orch?.idleStillness ?? 0;
  const impactGain = (1 - stillness) * Math.max(0, impact - 1) * 3.2;

  const applyBlob = (state) => {
    const cx = mix(state.centerX, FOCUS.x, gather * 0.44);
    const cy = mix(state.centerY, FOCUS.y, gather * 0.36);
    const gatherScale = 1 + gather * 0.06;
    const impactScale = 1 + impactGain * 0.18;
    const radialX = (state.centerX - FOCUS.x) * impactGain * 0.22;
    const radialY = (state.centerY - FOCUS.y) * impactGain * 0.16;
    return {
      centerX: cx + radialX,
      centerY: cy + radialY,
      scale: state.scale * gatherScale * impactScale,
      opacity: state.opacity,
      stretchX: mix(state.stretchX, state.stretchX * 1.08, impactGain * 0.35 + gather * 0.08),
      stretchY: mix(state.stretchY, state.stretchY * 0.94, impactGain * 0.28 + gather * 0.06),
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
