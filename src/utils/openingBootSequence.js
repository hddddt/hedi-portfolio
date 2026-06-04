/**
 * Time-based opening boot (0ms on load) — three phases before scroll takes over.
 * Phase 1 · Latent system (0–500ms)
 * Phase 2 · Structure forms (500–1100ms)
 * Phase 3 · Identity lock (900–1600ms, overlaps phase 2)
 */

import {
  HERO_BLOB_INTRO,
  HERO_GALAXY_BODY_OFFSET,
  HERO_GALAXY_FOCAL,
  HERO_GREEN_ROTATION,
} from '../data/organicFieldPalette.js';
import { OPENING_SCROLL_SCALE } from '../data/fieldSizeHierarchy.js';
import { mix, smoothstep } from './fieldNarrative.js';

export const OPENING_BOOT_MS = {
  PHASE1_END: 500,
  PHASE2_START: 500,
  PHASE2_END: 1100,
  PHASE3_START: 900,
  PHASE3_END: 1600,
  HERO_SUB_DELAY: 150,
  /** Compound body first, internal roles clarify, amber accent last */
  COMPOUND_START: 180,
  COMPOUND_END: 820,
  CORE_START: 480,
  CORE_END: 1020,
  GREEN_START: 320,
  GREEN_END: 980,
  BLUE_START: 360,
  BLUE_END: 980,
  AMBER_START: 920,
  AMBER_END: 1280,
  STRUCTURE_START: 640,
  STRUCTURE_END: 1120,
  /** After sphere reveal settles — signature, not frame-zero logo */
  TYPO_START: 1280,
  TYPO_END: 1780,
  DONE: 1920,
};

function easeOutCubic(t) {
  const u = Math.max(0, Math.min(1, t));
  return 1 - (1 - u) ** 3;
}

function lerpBlob(from, to, t) {
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
    stretchX: mix(from.stretchX ?? 1, to.stretchX ?? 1, u),
    stretchY: mix(from.stretchY ?? 1, to.stretchY ?? 1, u),
    rotation: rotFrom + rotDelta * u,
  };
}

/**
 * Blob anchor along the same focal→body vector (homogeneous galaxy interpolation).
 * @param {'a' | 'b' | 'c'} id
 * @param {number} offsetFrac 0 = at focal, 1 = full intro offset
 */
function galaxyBootBlob(id, offsetFrac, partial) {
  const o = HERO_GALAXY_BODY_OFFSET[id];
  const intro = HERO_BLOB_INTRO[id];
  const scaleKey =
    id === 'a' ? OPENING_SCROLL_SCALE.intro.green : id === 'b' ? OPENING_SCROLL_SCALE.intro.blue : OPENING_SCROLL_SCALE.intro.amber;
  return {
    centerX: HERO_GALAXY_FOCAL.x + o.dx * offsetFrac,
    centerY: HERO_GALAXY_FOCAL.y + o.dy * offsetFrac,
    scale: scaleKey * partial.scaleMul,
    opacity: partial.opacity,
    stretchX: partial.stretchX,
    stretchY: partial.stretchY,
    rotation: partial.rotation ?? intro.rotation ?? 0,
  };
}

/** Near focal — one unresolved compound smear */
const BLOB_LATENT = {
  a: galaxyBootBlob('a', 0.1, {
    scaleMul: 0.44,
    opacity: 0.1,
    stretchX: 1.06,
    stretchY: 0.94,
    rotation: HERO_GREEN_ROTATION * 0.35,
  }),
  b: galaxyBootBlob('b', 0.1, {
    scaleMul: 0.42,
    opacity: 0.08,
    stretchX: 1.02,
    stretchY: 0.96,
    rotation: -0.12,
  }),
  c: galaxyBootBlob('c', 0.1, {
    scaleMul: 0.22,
    opacity: 0.0,
    stretchX: 0.96,
    stretchY: 0.94,
    rotation: 0.06,
  }),
};

/** Compound clarifies — green-blue core, amber still latent */
const BLOB_FORMING = {
  a: galaxyBootBlob('a', 0.58, {
    scaleMul: 0.88,
    opacity: 0.52,
    stretchX: 1.08,
    stretchY: 0.92,
    rotation: HERO_GREEN_ROTATION * 0.78,
  }),
  b: galaxyBootBlob('b', 0.58, {
    scaleMul: 0.84,
    opacity: 0.46,
    stretchX: 1.02,
    stretchY: 0.96,
    rotation: -0.22,
  }),
  c: galaxyBootBlob('c', 0.52, {
    scaleMul: 0.28,
    opacity: 0.06,
    stretchX: 0.96,
    stretchY: 0.94,
    rotation: 0.07,
  }),
};

const BLOB_INTRO = {
  a: { ...HERO_BLOB_INTRO.a },
  b: { ...HERO_BLOB_INTRO.b },
  c: { ...HERO_BLOB_INTRO.c },
};

/**
 * @param {number} elapsedMs
 * @param {boolean} [prm]
 */
export function computeOpeningBootAt(elapsedMs, prm = false) {
  if (prm) {
    return {
      complete: 1,
      phase: 3,
      elapsedMs: OPENING_BOOT_MS.DONE,
      latent: 0,
      structure: 1,
      identity: 1,
      orangeReveal: 1,
      sharpen: 1,
      orbitDraw: 1,
      structureDraw: 1,
      compoundBody: 1,
      coreClarify: 1,
      massGreen: 1,
      massBlue: 1,
      massAmber: 1,
      fieldGain: 1,
      heroReveal: 1,
      heroScale: 1,
      heroTranslateY: 0,
      subReveal: 1,
      heroFieldProgress: 0.08,
      latentStillness: 0,
      blurPx: 3.2,
      globalOpacityMul: 1.08,
      light: true,
      active: false,
    };
  }

  const t = Math.max(0, elapsedMs);
  const complete = smoothstep(OPENING_BOOT_MS.PHASE3_END, OPENING_BOOT_MS.DONE, t);

  const latent = 1 - smoothstep(OPENING_BOOT_MS.PHASE2_START - 80, OPENING_BOOT_MS.PHASE2_END, t);
  const structure = smoothstep(
    OPENING_BOOT_MS.PHASE2_START,
    OPENING_BOOT_MS.PHASE2_END,
    t,
  );
  const identity = smoothstep(
    OPENING_BOOT_MS.PHASE3_START,
    OPENING_BOOT_MS.PHASE3_END,
    t,
  );
  const compoundBody = smoothstep(
    OPENING_BOOT_MS.COMPOUND_START,
    OPENING_BOOT_MS.COMPOUND_END,
    t,
  );
  const coreClarify = smoothstep(OPENING_BOOT_MS.CORE_START, OPENING_BOOT_MS.CORE_END, t);
  const massGreen = smoothstep(OPENING_BOOT_MS.GREEN_START, OPENING_BOOT_MS.GREEN_END, t);
  const massBlue = smoothstep(OPENING_BOOT_MS.BLUE_START, OPENING_BOOT_MS.BLUE_END, t);
  const massAmber = smoothstep(OPENING_BOOT_MS.AMBER_START, OPENING_BOOT_MS.AMBER_END, t);
  const orangeReveal = massAmber;
  const structureDraw = smoothstep(
    OPENING_BOOT_MS.STRUCTURE_START,
    OPENING_BOOT_MS.STRUCTURE_END,
    t,
  );
  const sharpen = smoothstep(OPENING_BOOT_MS.CORE_END - 140, OPENING_BOOT_MS.AMBER_END - 60, t);
  const orbitDraw = structureDraw;

  const heroReveal = easeOutCubic(
    smoothstep(OPENING_BOOT_MS.TYPO_START, OPENING_BOOT_MS.TYPO_END - 180, t),
  );
  const subReveal = easeOutCubic(
    smoothstep(
      OPENING_BOOT_MS.TYPO_START + OPENING_BOOT_MS.HERO_SUB_DELAY,
      OPENING_BOOT_MS.TYPO_END,
      t,
    ),
  );

  const fieldGain =
    mix(0.54, 0.8, smoothstep(0, OPENING_BOOT_MS.PHASE1_END, t)) +
    structure * 0.2 +
    identity * 0.1;

  const globalOpacityMul = mix(0.98, 1.08, Math.min(1, fieldGain));
  const blurPx = mix(5.5, 2.4, structure * 0.85 + identity * 0.15);

  let phase = 1;
  if (t >= OPENING_BOOT_MS.PHASE3_START) phase = 3;
  else if (t >= OPENING_BOOT_MS.PHASE2_START) phase = 2;

  return {
    complete,
    phase,
    elapsedMs: t,
    latent,
    structure,
    identity,
    orangeReveal,
    compoundBody,
    coreClarify,
    massGreen,
    massBlue,
    massAmber,
    structureDraw,
    sharpen,
    orbitDraw,
    fieldGain: Math.min(1.14, fieldGain),
    heroReveal,
    heroScale: mix(0.96, 1, heroReveal),
    heroTranslateY: mix(8, 0, heroReveal),
    subReveal,
    heroFieldProgress: structure * 0.06 + identity * 0.04,
    latentStillness: latent * 0.92,
    blurPx,
    globalOpacityMul,
    light: sharpen > 0.18,
    active: complete < 0.995,
  };
}

/** Field blob targets during boot (replaces scroll blob state while active). */
export function computeOpeningBootFieldStates(boot) {
  const structure = boot.structure ?? 0;
  const identity = boot.identity ?? 0;
  const orangeReveal = boot.orangeReveal ?? 0;
  const sharpen = boot.sharpen ?? 0;

  const mid = {
    a: lerpBlob(BLOB_LATENT.a, BLOB_FORMING.a, structure),
    b: lerpBlob(BLOB_LATENT.b, BLOB_FORMING.b, structure),
    c: lerpBlob(BLOB_LATENT.c, BLOB_FORMING.c, structure * orangeReveal),
  };

  const formed = {
    a: lerpBlob(mid.a, BLOB_INTRO.a, identity),
    b: lerpBlob(mid.b, BLOB_INTRO.b, identity),
    c: lerpBlob(mid.c, BLOB_INTRO.c, identity * orangeReveal),
  };

  const gain = boot.fieldGain ?? 1;
  const soft = 1 - sharpen * 0.28;

  const compound = boot.compoundBody ?? 1;
  const core = boot.coreClarify ?? compound;
  const massMul = (boot.massGreen ?? 1) * compound;
  const massMulB = (boot.massBlue ?? 1) * compound * core;
  const massMulC = (boot.massAmber ?? 0) * compound;

  const scaleOp = (blob, hue, massReveal) => {
    const introOp =
      hue === 'a' ? BLOB_INTRO.a.opacity : hue === 'b' ? BLOB_INTRO.b.opacity : BLOB_INTRO.c.opacity;
    const floor = hue === 'c' ? 0.08 : hue === 'b' ? 0.1 : 0.12;
    const op = Math.max(floor, blob.opacity) * gain * soft * massReveal;
    const cap = introOp * gain * massReveal;
    return Math.min(cap, op);
  };

  return {
    a: {
      ...formed.a,
      opacity: scaleOp(formed.a, 'a', massMul),
      scale: formed.a.scale * mix(0.92, 1, sharpen),
    },
    b: {
      ...formed.b,
      opacity: scaleOp(formed.b, 'b', massMulB),
      scale: formed.b.scale * mix(0.9, 1, sharpen * 0.9),
    },
    c: {
      ...formed.c,
      opacity: scaleOp(formed.c, 'c', massMulC),
      scale: formed.c.scale * mix(0.82, 1, sharpen * 0.75),
    },
    flowB: 0,
  };
}

/**
 * Blend scroll orchestration with boot while opening scroll is still at top.
 * @param {object} scrollOrch
 * @param {ReturnType<typeof computeOpeningBootAt>} boot
 * @param {number} rawP
 */
export function mergeOpeningBootOrchestration(scrollOrch, boot, rawP) {
  if (!boot?.active || rawP > 0.04) {
    return { ...scrollOrch, boot: boot?.active ? boot : null };
  }
  const w = 1 - smoothstep(0, 0.04, rawP);
  return {
    ...scrollOrch,
    rawP,
    beat: boot.phase < 3 ? 'recognition' : scrollOrch.beat,
    heroProgress: scrollOrch.heroProgress * (1 - w) + boot.heroFieldProgress * w,
    gather: Math.max(scrollOrch.gather ?? 0, boot.structure * w),
    settle: Math.max(scrollOrch.settle ?? 0, boot.identity * w * 0.4),
    idleStillness: Math.max(scrollOrch.idleStillness ?? 0, boot.latentStillness * w),
    globalBlur: mix(boot.blurPx, scrollOrch.globalBlur ?? 8, 1 - w * 0.65),
    fieldGain: boot.fieldGain,
    boot: { ...boot, blend: w },
  };
}
