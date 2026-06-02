/**
 * Hero opening scroll narrative — three coordinated phases:
 *  1 scroll start → Hedi lifts, field settles from idle + elastic impact
 *  2 continued scroll → blobs gather, Hedi exits, then thesis copy fades in
 *  3 thesis complete → shrunk field + full copy hold, exit only after dwell
 */

import { OPENING_LINEAR_SCALE, OPENING_SCROLL_SCALE } from '../data/fieldSizeHierarchy.js';
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

function elasticCompress(u) {
  const t = Math.max(0, Math.min(1, u));
  const easeIn = t * t * (3 - 2 * t);
  const snap = Math.sin(t * Math.PI) * (1 - t) * 0.22;
  const settle = Math.sin(t * Math.PI * 2.35) * (1 - t) * 0.11;
  return Math.max(0, Math.min(1, easeIn + snap - settle));
}

/**
 * Potential-like curve: explosive start, hard brake near end.
 * Used to avoid slow middle-ground gathering.
 */
function potentialSnap(u) {
  const t = Math.max(0, Math.min(1, u));
  const edge = 0.2;
  if (t < 0.5) return 0.5 * Math.pow(t * 2, edge);
  return 1 - 0.5 * Math.pow((1 - t) * 2, edge);
}

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
  const introReadEnd = 0.3;
  const systemBuildEnd = 0.65;
  const introRead = smoothstep(0, introReadEnd, p);
  const systemBuild = smoothstep(introReadEnd, systemBuildEnd, p);
  const bridgeReveal = smoothstep(systemBuildEnd, 1, p);

  /** Phase 1 — keep a stronger free idle field before gather fully takes over. */
  const idleStillness = 1 - introRead * 0.96;
  const scrollImpact = scrollBreathScalePulse(smoothstep(0.006, OPENING_PHASE1_END * 0.7, p));

  /** Phase 2 — narrative drive + blob gather */
  const scrollDrive =
    (0.24 * introRead + easeScrollBreath(systemBuild) * 0.76) *
    (1 - bridgeReveal * 0.12);

  /** Blob hero timeline — fast intro → thesis convergence */
  let heroProgress;
  if (p <= introReadEnd) {
    heroProgress = smoothstep(0, introReadEnd, p) * 0.16;
  } else if (p <= systemBuildEnd) {
    heroProgress = 0.16 + potentialSnap(smoothstep(introReadEnd, systemBuildEnd, p)) * 0.6;
  } else if (p <= OPENING_PHASE3_END) {
    heroProgress = 0.76;
  } else {
    const t = (p - OPENING_PHASE3_END) / (OPENING_EXIT_END - OPENING_PHASE3_END);
    heroProgress = 0.76 + easeScrollBreath(t) * 0.24;
  }

  /** Gather — start almost immediately; complete early for a clear impact event */
  const gather = potentialSnap(smoothstep(introReadEnd, systemBuildEnd, p));

  /** Screen 1 — handoff starts with gather and exits before thesis reveal */
  const fadeHero = smoothstep(0.58, 0.9, p);

  /** Screen 2 — reveal only after gather has mostly settled */
  const fadeThesis = smoothstep(0.66, 0.94, p);

  /** Field compresses hard during gather, then slightly releases in thesis settle. */
  const compressLinear = potentialSnap(smoothstep(introReadEnd, systemBuildEnd, p));
  const compressElastic = elasticCompress(compressLinear);
  const compressedScale = mix(1, 0.46, easeScrollBreath(compressElastic));
  const thesisRelease = smoothstep(systemBuildEnd + 0.02, 0.94, p);
  const fieldScale = compressedScale + thesisRelease * 0.06;

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
    globalBlur:
      p < systemBuildEnd
        ? mix(16, 8.6, smoothstep(introReadEnd, systemBuildEnd, p))
        : mix(8.6, 7.2, smoothstep(systemBuildEnd + 0.02, 1, p)),
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
      centerX: 0.47,
      centerY: 0.5,
      scale: OPENING_SCROLL_SCALE.transition.green,
      opacity: INTRO_OPACITY.a,
      rotation: HERO_GREEN_ROTATION,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.525,
      centerY: 0.468,
      scale: OPENING_SCROLL_SCALE.transition.blue,
      opacity: INTRO_OPACITY.b,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.498,
      centerY: 0.43,
      scale: OPENING_SCROLL_SCALE.transition.amber,
      opacity: INTRO_OPACITY.c,
    },
  },
  thesis: {
    a: {
      ...HERO_BLOB_INTRO.a,
      centerX: 0.478,
      centerY: 0.498,
      scale: OPENING_SCROLL_SCALE.thesis.green * 1.16,
      opacity: INTRO_OPACITY.a,
      stretchX: 1.08,
      stretchY: 0.92,
      rotation: HERO_GREEN_ROTATION * 1.05,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.524,
      centerY: 0.476,
      scale: OPENING_SCROLL_SCALE.thesis.blue * 1.16,
      opacity: INTRO_OPACITY.b,
      stretchX: 0.9,
      stretchY: 1.08,
      rotation: -0.26,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.502,
      centerY: 0.462,
      scale: OPENING_SCROLL_SCALE.thesis.amber * 1.16,
      opacity: INTRO_OPACITY.c,
      stretchX: 1.14,
      stretchY: 0.9,
      rotation: 0.16,
    },
  },
};

const FOCUS = { x: 0.5, y: 0.48 };
const CLUSTER_OFFSETS = {
  a: { x: -0.013, y: 0.009 },
  b: { x: 0.014, y: 0.001 },
  c: { x: 0.004, y: -0.012 },
};
const CLUSTER_SHAPE = {
  a: { stretchX: 1.14, stretchY: 0.86, rotation: HERO_GREEN_ROTATION * 1.08 },
  b: { stretchX: 0.84, stretchY: 1.18, rotation: -0.34 },
  c: { stretchX: 1.18, stretchY: 0.82, rotation: 0.24 },
};

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
  const gather = orch?.gather ?? smoothstep(PHASE.introEnd * 0.5, PHASE.thesisStart + 0.02, heroProgress);
  const impact = orch?.scrollImpact ?? 1;
  const stillness = orch?.idleStillness ?? 0;
  const impactGain = (1 - stillness) * Math.max(0, impact - 1) * 3.2;
  const clusterProgress = potentialSnap(
    easeScrollBreath(smoothstep(PHASE.introEnd * 0.0, PHASE.thesisStart - 0.44, heroProgress)),
  );
  const shapeProgress = easeScrollBreath(
    smoothstep(PHASE.introEnd * 0.05, PHASE.thesisStart - 0.16, heroProgress),
  );

  const applyBlob = (id, state) => {
    const cluster = CLUSTER_OFFSETS[id];
    const shape = CLUSTER_SHAPE[id];
    const focusX = FOCUS.x + cluster.x;
    const focusY = FOCUS.y + cluster.y;
    const gatherMix = gather * 0.56 + clusterProgress * 0.6;
    const cx = mix(state.centerX, focusX, gatherMix);
    const cy = mix(state.centerY, focusY, gather * 0.5 + clusterProgress * 0.62);
    const gatherScale = 1 + gather * 0.05;
    const impactScale = 1 + impactGain * 0.18;
    const radialX = (state.centerX - FOCUS.x) * impactGain * 0.22;
    const radialY = (state.centerY - FOCUS.y) * impactGain * 0.16;
    const shapeMix = impactGain * 0.28 + shapeProgress * 0.46;
    const stretchX = mix(state.stretchX, shape.stretchX, shapeMix);
    const stretchY = mix(state.stretchY, shape.stretchY, shapeMix);
    const rotation = mix(state.rotation ?? 0, shape.rotation, shapeProgress * 0.72);
    return {
      centerX: cx + radialX,
      centerY: cy + radialY,
      scale: state.scale * gatherScale * impactScale,
      opacity: state.opacity,
      stretchX,
      stretchY,
      rotation,
      flow: 0,
    };
  };

  return {
    a: applyBlob('a', states.a),
    b: applyBlob('b', states.b),
    c: applyBlob('c', states.c),
    flowB: 0,
  };
}
