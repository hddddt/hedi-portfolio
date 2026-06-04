/**
 * Hero opening scroll narrative — gather → settle → reveal:
 *  idle → first scroll pulls fields in (impact + compress) → thesis revealed by field hold
 */

import { OPENING_LINEAR_SCALE, OPENING_SCROLL_SCALE } from '../data/fieldSizeHierarchy.js';
import {
  HERO_BLOB_INTRO,
  HERO_GALAXY_FOCAL,
  HERO_GREEN_ROTATION,
} from '../data/organicFieldPalette.js';
import { computeOpeningBootFieldStates } from './openingBootSequence.js';
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
  introEnd: 0.32,
  thesisStart: 0.52,
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
export const OPENING_PHASE1_END = 0.22;
/** Screen 1 — Recognition (hero legible) */
export const OPENING_SCREEN1_END = 0.3;
/** Screen 2 — Promise (thesis owns the card) */
export const OPENING_SCREEN2_ENTER = OPENING_SCREEN1_END;
export const OPENING_SCREEN2_DWELL_END = 0.58;
export const OPENING_PHASE2_END = OPENING_SCREEN2_ENTER;
export const OPENING_PHASE3_END = OPENING_SCREEN2_DWELL_END;
export const OPENING_EXIT_END = 1;

export const OPENING_HERO_EXIT_START = 0.14;
export const OPENING_HERO_EXIT_END = OPENING_SCREEN2_ENTER;
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

/** Thesis exit → Capabilities — shared cluster (no outward scatter). */
export const OPENING_CAP_HANDOFF_FOCAL = HERO_GALAXY_FOCAL;
export const OPENING_CAP_HANDOFF_ECHO = {
  a: { x: -0.032, y: -0.018, scale: 1.04, opacityMul: 0.94 },
  b: { x: 0.034, y: 0.014, scale: 0.94, opacityMul: 0.72 },
  c: { x: 0.012, y: 0.026, scale: 0.92, opacityMul: 0.68 },
};

/** @returns {{ a: object, b: object, c: object }} */
export function openingCapHandoffResidualTargets() {
  const f = OPENING_CAP_HANDOFF_FOCAL;
  const e = OPENING_CAP_HANDOFF_ECHO;
  return {
    a: {
      centerX: f.x + e.a.x,
      centerY: f.y + e.a.y,
      scale: e.a.scale,
      opacity: 0.4 * e.a.opacityMul,
    },
    b: {
      centerX: f.x + e.b.x,
      centerY: f.y + e.b.y,
      scale: e.b.scale,
      opacity: 0.22 * e.b.opacityMul,
    },
    c: {
      centerX: f.x + e.c.x,
      centerY: f.y + e.c.y,
      scale: e.c.scale,
      opacity: 0.18 * e.c.opacityMul,
    },
  };
}

function isViewportOrganicFieldReady() {
  if (typeof document === 'undefined') return false;
  return Boolean(
    document.querySelector(
      '.organic-field-host--viewport .organic-field__canvas[data-field-ready="true"]',
    ),
  );
}

/** Opening chapter — in-card field until viewport field is actually painting. */
export function shouldUseInCardOrganicField(_rawProgress, openingComplete = false, capHandoff = 0) {
  if (!openingComplete) return true;
  if (capHandoff < 0.32) return true;
  return !isViewportOrganicFieldReady();
}

/** Viewport field — after opening boot + handoff; never during timed landing sequence. */
export function shouldUseViewportOrganicField(_rawProgress, openingComplete = false, capHandoff = 0) {
  if (typeof document !== 'undefined') {
    const root = document.querySelector('.home-scroll-root');
    if (root?.dataset.openingBootActive === 'true') return false;
  }
  return openingComplete && capHandoff >= 0.04;
}

/** @deprecated use openingFieldScrollDrive(rawP) during opening */
export const HERO_SCROLL_DRIVE_START = 0.006;
export const HERO_SCROLL_DRIVE_END = 0.09;

/** Raw scroll — gather → settle → reveal rhythm (first scroll = system entry). */
const OPENING_IMPACT_START = 0.006;
const OPENING_GATHER_END = 0.18;
export const OPENING_SETTLE_END = 0.32;
export const OPENING_THESIS_REVEAL_END = 0.46;
const OPENING_THESIS_HOLD = 0.52;
const OPENING_THESIS_REVEAL_START = OPENING_SCREEN2_ENTER;
const OPENING_DECK_REVEAL_START = 0.4;
const OPENING_DECK_REVEAL_END = 0.54;

/** @typedef {'recognition' | 'shift' | 'promise' | 'handoff'} OpeningNarrativeBeat */

/**
 * Narrative beat for opening UI (screen 1 → screen 2 → Cap handoff).
 * @param {number} rawP
 * @param {boolean} [prm]
 * @returns {OpeningNarrativeBeat}
 */
export function openingNarrativeBeat(rawP, prm = false) {
  if (prm) {
    return rawP < 0.45 ? 'recognition' : rawP < 0.82 ? 'promise' : 'handoff';
  }
  const p = Math.max(0, Math.min(1, rawP));
  if (p < OPENING_SCREEN1_END) return 'recognition';
  if (p < OPENING_HERO_EXIT_END) return 'shift';
  if (p < OPENING_SCREEN2_DWELL_END) return 'promise';
  return 'handoff';
}

/**
 * Master opening orchestration from raw scroll — single source for UI + field.
 * @param {number} rawP
 */
export function computeOpeningScrollOrchestration(rawP) {
  const p = Math.max(0, Math.min(1, rawP));
  const bridgeReveal = smoothstep(OPENING_SETTLE_END + 0.14, 1, p);

  /** Idle hero — full atmospheric drift until first scroll registers. */
  const idleStillness =
    1 - potentialSnap(smoothstep(OPENING_IMPACT_START, OPENING_GATHER_END * 0.42, p));

  /** Scroll impact — subtle compress only; no mid-scroll swell (avoids blob burst). */
  const scrollImpact =
    1 +
    smoothstep(OPENING_IMPACT_START, OPENING_GATHER_END * 0.5, p) *
      0.045 *
      (1 - smoothstep(0.55, 0.68, p));

  /** Gather — immediate pull-in; finishes early so thesis can settle. */
  const gather = potentialSnap(smoothstep(OPENING_IMPACT_START, OPENING_GATHER_END, p));
  const settle = smoothstep(OPENING_GATHER_END, OPENING_SETTLE_END, p);

  /** Narrative drive follows gather/settle — avoids slow decorative drift mid-transition. */
  const scrollDrive =
    easeScrollBreath(potentialSnap(smoothstep(OPENING_IMPACT_START, OPENING_SETTLE_END, p))) *
    (1 - bridgeReveal * 0.1);

  /** Blob hero timeline — locked to gather → settle, not a long intro plateau. */
  let heroProgress;
  if (p <= OPENING_GATHER_END) {
    heroProgress = gather * 0.52;
  } else if (p <= OPENING_SETTLE_END) {
    heroProgress = 0.52 + settle * 0.24;
  } else if (p <= OPENING_PHASE3_END) {
    heroProgress = 0.76 + smoothstep(OPENING_SETTLE_END, OPENING_PHASE3_END, p) * 0.14;
  } else {
    const t = (p - OPENING_PHASE3_END) / (OPENING_EXIT_END - OPENING_PHASE3_END);
    heroProgress = 0.9 + t * 0.1;
  }

  /** Screen 1 → 2: hero exits before thesis copy owns the frame. */
  const fadeHero = smoothstep(OPENING_HERO_EXIT_START, OPENING_HERO_EXIT_END, p);
  const thesisHold = smoothstep(OPENING_SETTLE_END, OPENING_THESIS_HOLD, p);
  const fadeThesis = smoothstep(OPENING_THESIS_REVEAL_START, OPENING_THESIS_REVEAL_END, p);
  const handoffLock = settle * thesisHold * (1 - fadeThesis * 0.35);

  /** Field compresses on gather; holds scale through settle; micro-release as thesis begins. */
  const compressLinear = gather;
  const compressElastic = elasticCompress(compressLinear);
  const compressedScale = mix(1, 0.52, compressElastic);
  const thesisRelease = smoothstep(OPENING_THESIS_REVEAL_START - 0.02, OPENING_THESIS_REVEAL_END, p);
  const thesisNucleus = smoothstep(OPENING_SETTLE_END * 0.45, OPENING_THESIS_REVEAL_END + 0.04, p);
  const fieldScale =
    compressedScale + thesisRelease * 0.08 + thesisNucleus * 0.12;
  const condenseBeat = smoothstep(OPENING_IMPACT_START, OPENING_SETTLE_END + 0.04, p);
  const headlineReveal = smoothstep(
    OPENING_HERO_EXIT_END,
    OPENING_THESIS_REVEAL_END - 0.04,
    p,
  );
  const deckReveal = smoothstep(OPENING_DECK_REVEAL_START, OPENING_DECK_REVEAL_END, p);
  const exitDissolve = smoothstep(0.64, 0.96, p);
  const thesisExit = smoothstep(0.8, 0.98, p);

  let phase = /** @type {HeroPhase} */ ('intro');
  if (p > OPENING_PHASE3_END) phase = 'exit';
  else if (p >= OPENING_PHASE2_END) phase = 'thesis';
  else if (p >= OPENING_PHASE1_END) phase = 'transition';

  return {
    rawP: p,
    beat: openingNarrativeBeat(p),
    heroProgress,
    phase,
    idleStillness,
    scrollDrive,
    scrollImpact,
    gather,
    settle,
    handoffLock,
    fadeHero,
    fadeThesis,
    fieldScale,
    thesisNucleus,
    condenseBeat,
    headlineReveal,
    deckReveal,
    exitDissolve,
    thesisExit,
    fieldEnvelope: 1 + idleStillness * 0.07,
    converge: gather,
    globalBlur:
      p < OPENING_GATHER_END
        ? mix(12, 5.5, potentialSnap(smoothstep(OPENING_IMPACT_START, OPENING_GATHER_END, p)))
        : p < OPENING_SETTLE_END
          ? mix(5.5, 4.2, settle)
          : mix(4.2, 3.2, smoothstep(OPENING_SETTLE_END, OPENING_THESIS_REVEAL_END, p)),
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
      centerX: 0.48,
      centerY: 0.52,
      scale: OPENING_SCROLL_SCALE.transition.green,
      opacity: INTRO_OPACITY.a,
      rotation: HERO_GREEN_ROTATION,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.62,
      centerY: 0.52,
      scale: OPENING_SCROLL_SCALE.transition.blue,
      opacity: INTRO_OPACITY.b,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.58,
      centerY: 0.58,
      scale: OPENING_SCROLL_SCALE.transition.amber * 0.94,
      opacity: INTRO_OPACITY.c * 0.85,
    },
  },
  thesis: {
    a: {
      ...HERO_BLOB_INTRO.a,
      centerX: 0.406,
      centerY: 0.618,
      scale: OPENING_SCROLL_SCALE.thesis.green * 1.14,
      opacity: INTRO_OPACITY.a,
      stretchX: 1.16,
      stretchY: 0.8,
      rotation: HERO_GREEN_ROTATION * 1.14,
    },
    b: {
      ...HERO_BLOB_INTRO.b,
      centerX: 0.594,
      centerY: 0.656,
      scale: OPENING_SCROLL_SCALE.thesis.blue * 1.04,
      opacity: INTRO_OPACITY.b * 0.9,
      stretchX: 0.86,
      stretchY: 1.1,
      rotation: -0.44,
    },
    c: {
      ...HERO_BLOB_INTRO.c,
      centerX: 0.518,
      centerY: 0.728,
      scale: OPENING_SCROLL_SCALE.thesis.amber * 1.02,
      opacity: INTRO_OPACITY.c * 0.8,
      stretchX: 1.12,
      stretchY: 0.74,
      rotation: 0.32,
    },
  },
};

/** Identity read above; thesis nucleus sits below headline copy */
const FOCUS_HERO = { x: 0.5, y: 0.36 };
const FOCUS_THESIS = { x: 0.508, y: 0.662 };
const CLUSTER_OFFSETS = {
  a: { x: -0.022, y: 0.01 },
  b: { x: 0.024, y: 0.034 },
  c: { x: -0.006, y: 0.048 },
};
const CLUSTER_OFFSETS_THESIS = {
  a: { x: -0.042, y: -0.022 },
  b: { x: 0.046, y: 0.012 },
  c: { x: -0.018, y: 0.048 },
};

function focusAtOrchestration(orch) {
  const raw = orch?.rawP ?? 0;
  const t = smoothstep(OPENING_SETTLE_END * 0.4, OPENING_THESIS_REVEAL_END + 0.06, raw);
  return {
    x: mix(FOCUS_HERO.x, FOCUS_THESIS.x, t),
    y: mix(FOCUS_HERO.y, FOCUS_THESIS.y, t),
  };
}
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

function applyBlobOpacity(states, nucleus = 0) {
  const nu = smoothstep(0.25, 0.8, nucleus);
  const greenHold = 1 - nu * 0.06;
  const thesisSoft = 1 - nu * 0.1;
  const amberSoft = (states.c.opacity ?? INTRO_OPACITY.c) * (1 - nu * 0.18);
  return {
    a: { ...states.a, opacity: (states.a.opacity ?? INTRO_OPACITY.a) * greenHold },
    b: { ...states.b, opacity: (states.b.opacity ?? INTRO_OPACITY.b) * thesisSoft },
    c: { ...states.c, opacity: amberSoft },
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
  return states;
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
      settle: 1,
      thesisNucleus: 1,
      condenseBeat: 1,
      headlineReveal: smoothstep(0.35, 0.75, heroProgress),
      deckReveal: smoothstep(0.45, 0.82, heroProgress),
      handoffLock: 1,
      fieldScale: 1,
      fieldEnvelope: 1,
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

export { mergeOpeningBootOrchestration } from './openingBootSequence.js';

/**
 * @param {number} heroProgress
 * @param {number} [time]
 * @param {boolean} [prm]
 * @param {object} [orch] opening orchestration slice
 */
export function computeHeroFieldTargets(heroProgress, time = 0, prm = false, orch = null) {
  const states =
    orch?.boot?.active && (orch?.rawP ?? 0) < 0.045
      ? computeOpeningBootFieldStates(orch.boot)
      : applyBlobOpacity(blobStatesAtProgress(heroProgress), orch?.thesisNucleus ?? 0);
  const gather = orch?.gather ?? smoothstep(PHASE.introEnd * 0.5, PHASE.thesisStart + 0.02, heroProgress);
  const settle = orch?.settle ?? 0;
  const nucleus = orch?.thesisNucleus ?? settle;
  const impact = orch?.scrollImpact ?? 1;
  const stillness = orch?.idleStillness ?? 0;
  const exitDissolve = orch?.exitDissolve ?? 0;
  const inExit = exitDissolve > 0.06;
  const impactGain = inExit ? 0 : (1 - stillness) * Math.max(0, impact - 1) * 1.2;
  const clusterProgress = smoothstep(
    0,
    PHASE.thesisStart - 0.08,
    gather * 0.82 + settle * 0.28 + heroProgress * 0.08,
  );
  const shapeProgress = inExit
    ? 0
    : easeScrollBreath(smoothstep(gather * 0.35, PHASE.thesisStart - 0.1, heroProgress));
  const focus = focusAtOrchestration(orch);
  const clusterTight = smoothstep(0.28, 0.72, nucleus);

  const applyBlob = (id, state) => {
    const cluster = mix(
      CLUSTER_OFFSETS[id].x,
      CLUSTER_OFFSETS_THESIS[id].x,
      clusterTight,
    );
    const clusterY = mix(
      CLUSTER_OFFSETS[id].y,
      CLUSTER_OFFSETS_THESIS[id].y,
      clusterTight,
    );
    const shape = CLUSTER_SHAPE[id];
    const focusX = focus.x + cluster;
    const focusY = focus.y + clusterY;
    const gatherMix =
      gather * 0.74 + clusterProgress * 0.62 + settle * 0.1 - clusterTight * 0.12;
    const nucleusDrop =
      id === 'c' ? nucleus * 0.042 : id === 'a' ? nucleus * 0.018 : id === 'b' ? nucleus * 0.028 : 0;
    const cx = mix(state.centerX, focusX, Math.max(0, Math.min(1, gatherMix)));
    const cy =
      mix(state.centerY, focusY, gather * 0.58 + clusterProgress * 0.66 + settle * 0.12) + nucleusDrop;
    const gatherScale =
      id === 'a'
        ? 1 - gather * 0.018 + (impact - 1) * 0.06 + nucleus * 0.09
        : id === 'b'
          ? 1 - gather * 0.028 + (impact - 1) * 0.05 + nucleus * 0.04
          : 1 - gather * 0.034 + (impact - 1) * 0.04 + nucleus * 0.02;
    const impactScale = 1 + impactGain * 0.06;
    const radialX = 0;
    const radialY = 0;
    const shapeMix = impactGain * 0.36 + shapeProgress * 0.58;
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

  const condenseTowardCapability = smoothstep(0.18, 0.88, exitDissolve);
  const handoffFocal = OPENING_CAP_HANDOFF_FOCAL;
  const handoffEcho = OPENING_CAP_HANDOFF_ECHO;
  const maxHandoffDrift = 0.055;

  const condenseBlob = (id, blob) => {
    if (condenseTowardCapability < 0.01) return blob;
    const echo = handoffEcho[id];
    const u = condenseTowardCapability;
    const tgtX = handoffFocal.x + echo.x;
    const tgtY = handoffFocal.y + echo.y;
    const pull = id === 'a' ? u * 0.56 : u * 0.44;
    let centerX = mix(blob.centerX, tgtX, pull);
    let centerY = mix(blob.centerY, tgtY, pull * 0.85);
    const dx = centerX - blob.centerX;
    const dy = centerY - blob.centerY;
    const dist = Math.hypot(dx, dy);
    if (dist > maxHandoffDrift) {
      const s = maxHandoffDrift / dist;
      centerX = blob.centerX + dx * s;
      centerY = blob.centerY + dy * s;
    }
    const softenU = smoothstep(0.4, 1, u);
    const tgtScale = Math.min(blob.scale, echo.scale);
    return {
      ...blob,
      centerX: centerX - (id === 'a' ? softenU * 0.02 : 0),
      centerY,
      scale: blob.scale * mix(1, tgtScale / Math.max(blob.scale, 0.001), softenU * 0.18),
      opacity: blob.opacity * mix(1, echo.opacityMul, softenU * 0.35),
      stretchX: mix(blob.stretchX ?? 1, 1, softenU * 0.42),
      stretchY: mix(blob.stretchY ?? 1, 1, softenU * 0.42),
    };
  };

  return {
    a: condenseBlob('a', applyBlob('a', states.a)),
    b: condenseBlob('b', applyBlob('b', states.b)),
    c: condenseBlob('c', applyBlob('c', states.c)),
    flowB: 0,
  };
}
