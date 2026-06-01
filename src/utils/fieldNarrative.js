import { DISC_ANCHORS } from '../data/organicFieldPalette.js';

export function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

export function mix(a, b, t) {
  return a + (b - a) * t;
}

/** Scroll morph — smoothstep with a mid-transition swell (breath / elastic read) */
export function easeScrollBreath(t) {
  const c = Math.max(0, Math.min(1, t));
  const base = c * c * (3 - 2 * c);
  const swell = Math.sin(c * Math.PI) * 0.12 * (1 - c * 0.4);
  return Math.max(0, Math.min(1, base + swell));
}

/** Scale pulse that peaks mid-scroll — pairs with easeScrollBreath */
export function scrollBreathScalePulse(t) {
  const c = Math.max(0, Math.min(1, t));
  return 1 + Math.sin(c * Math.PI) * 0.06 * (1 - c * 0.3);
}

export function plateauProgress(p, holdStart, holdEnd) {
  if (p <= holdStart || holdEnd <= holdStart) return p;
  if (p < holdEnd) return holdStart;
  return holdStart + ((p - holdEnd) / (1 - holdEnd)) * (1 - holdStart);
}

/** CSS keyframe breathe: 0 → peak → 0 over period (alternate) */
function breatheOffset(time, periodSec, peakX, peakY) {
  const w = 0.5 - 0.5 * Math.cos((time / periodSec) * Math.PI * 2);
  return { x: peakX * w, y: peakY * w };
}

/** Disc translate % (of anchor box) → viewport UV offset */
function pctToUv(pct) {
  return pct * 0.0042;
}

/**
 * Single field narrative from opening-scroll progress p ∈ [0, 1].
 * Drives OpeningBridge discs + OrganicField WebGL (same motion language).
 */
export function computeFieldNarrative(p, options = {}) {
  const prm = options.prm ?? false;
  const springPos = options.springPos ?? { x: 0.5, y: 0.5 };
  const time = options.time ?? 0;

  const pScrub = prm ? p : plateauProgress(p, 0.72, 0.86);
  const open = smoothstep(0.03, 0.97, pScrub);
  const expand = smoothstep(0.04, 0.9, open);
  const spreadField = smoothstep(0.05, 0.9, open);
  const fieldDrive = prm ? open : smoothstep(0.02, 0.88, open);
  const orbitDrive = prm ? fieldDrive : smoothstep(0.18, 0.94, open);
  const descend = smoothstep(0.05, 0.84, open);
  const nucleate = 1 - smoothstep(0, 0.34, open);
  const stretchBand = smoothstep(0.08, 0.52, open) * (1 - smoothstep(0.48, 0.9, open) * 0.35);
  const dilate = smoothstep(0.12, 0.74, open);
  const recede = smoothstep(0.52, 0.98, open);
  const handoff = smoothstep(0.62, 0.98, open);
  const handoffDrift = mix(0, 1, handoff);
  const tonalDeep = smoothstep(0.22, 0.9, open);
  const friction = prm ? 0 : Math.min(0.45, Math.abs(fieldDrive - orbitDrive) * 2.2);

  const sx = spreadField * (prm ? 0 : 1);
  const ptrX = (springPos.x - 0.5) * 2;
  const ptrY = (springPos.y - 0.5) * 2;
  const mousePull = prm ? 0 : 1;

  const brA = breatheOffset(time, 26, 0.029, -0.0235);
  const brB = breatheOffset(time, 33, -0.0245, 0.0265);
  const brV = breatheOffset(time, 21.5, 0.0175, 0.02);

  const tAx = mix(2, -7, expand) - 10 * sx + ptrX * 3.2 * mousePull;
  const tAy = mix(2, 14, expand) + 8 * sx + ptrY * 2.4 * mousePull + handoffDrift * 12;
  const tBx = mix(-1, 16, expand) + 12 * sx - ptrX * 2.6 * mousePull;
  const tBy = mix(1, 10, expand) - 6 * sx + ptrY * 2.8 * mousePull + handoffDrift * 10;
  const tVx = mix(0, -5, expand) + 4 * sx + ptrX * 1.4 * mousePull;
  const tVy = mix(3, 18, expand) + 10 * sx + ptrY * 1.6 * mousePull;

  const discs = {
    a: {
      x: DISC_ANCHORS.a.baseX + pctToUv(tAx) + brA.x,
      y: DISC_ANCHORS.a.baseY + pctToUv(tAy) + brA.y,
      rx: 0.48 + sx * 0.12 + open * 0.06,
      ry: 0.34 + sx * 0.08 + open * 0.04,
      strength: mix(0.96, 0.5, recede) * mix(1, 0.75, handoffDrift),
    },
    b: {
      x: DISC_ANCHORS.b.baseX + pctToUv(tBx) + brB.x,
      y: DISC_ANCHORS.b.baseY + pctToUv(tBy) + brB.y,
      rx: 0.42 + sx * 0.1,
      ry: 0.4 + sx * 0.09,
      strength: mix(0.92, 0.48, recede) * mix(1, 0.72, handoffDrift),
    },
    veil: {
      x: DISC_ANCHORS.veil.baseX + pctToUv(tVx) + brV.x,
      y: DISC_ANCHORS.veil.baseY + pctToUv(tVy) + brV.y,
      rx: 0.55 + sx * 0.08,
      ry: 0.42 + sx * 0.06,
      strength: mix(0.34, 0.2, recede),
    },
  };

  return {
    p,
    open,
    spreadField,
    expand,
    recede,
    dilate,
    nucleate,
    handoffDrift,
    fieldDrive,
    orbitDrive,
    friction,
    descend,
    stretchBand,
    tonalDeep,
    discs,
    scroll: {
      stretchX: mix(0.92, 1.22, dilate) * mix(1, 0.93, recede) * mix(0.97, 1.06, expand),
      stretchY: mix(1.0, 1.58, dilate) * mix(1, 0.86, recede) * mix(0.98, 1.12, expand),
      skewY: prm ? 0 : mix(0, 2.4, stretchBand) * (1 - recede * 0.7),
      fieldDescendVh: prm ? 0 : mix(0, 6.5, descend),
      fieldTopPct: mix(35, 48, descend),
      fieldW: mix(78, 124, fieldDrive) * mix(0.94, 1.02, expand),
      fieldH: mix(56, 96, fieldDrive) * mix(0.94, 1.04, expand),
      fieldOpacity: mix(1, 0.44, recede),
      flatX: mix(1.02, 1.14, dilate) * mix(1, 0.97, recede) * mix(0.98, 1.08, expand),
      flatY: mix(0.86, 0.94, dilate) * mix(1, 0.9, recede) * mix(1.02, 0.92, expand),
      fieldDrivePx: mix(0, 14, fieldDrive),
      dilatePx: mix(0, 20, dilate),
      fuseBlur: mix(4, 12, dilate) * mix(1, 0.86, recede) * mix(0.96, 1.04, expand),
      blurA: mix(14, 28, dilate) * mix(1, 0.88, recede) * mix(0.98, 1.06, expand),
      blurB: mix(16, 32, dilate) * mix(1, 0.85, recede) * mix(0.98, 1.08, expand),
      blurVeil: mix(24, 40, dilate) * mix(1, 0.82, recede) * mix(0.96, 1.04, expand),
      sx,
      ptrX,
      ptrY,
      mousePull,
      orbitOpacity: mix(0.88, 0.32, recede),
      orbitTx: mix(0, -2.8, orbitDrive),
      orbitTy: mix(0, 1.8, orbitDrive),
      orbitScale: mix(0.94, 1.12, orbitDrive) * mix(1, 0.97, recede) * mix(0.96, 1.05, expand),
      orbitDriftYvh: prm ? 0 : mix(0, 4.2, orbitDrive) + mix(0, 3.5, handoffDrift),
      orbitStretchX: mix(1, 1.14, orbitDrive) * mix(1, 1.08, handoffDrift),
      orbitStretchY: mix(1, 0.92, orbitDrive) * mix(1, 1.1, handoffDrift),
      orbitSkew: prm ? 0 : mix(0, 3.5, orbitDrive) + mix(0, 1.2, handoffDrift),
    },
  };
}

export function measureOpeningScrollProgress(el, prefersReducedMotion) {
  if (!el) {
    if (typeof window !== 'undefined' && window.scrollY > window.innerHeight * 1.5) return 1;
    return 0;
  }
  const rect = el.getBoundingClientRect();
  const vh = window.innerHeight;
  // Past opening — viewport field takes over (do not use rect.top; sticky makes top negative on screen 2)
  if (rect.bottom <= vh * 0.15) {
    return 1;
  }
  const total = Math.max(1, el.offsetHeight - vh);
  const t = Math.min(Math.max(-rect.top, 0), total);
  let nextP = t / total;
  if (prefersReducedMotion) {
    nextP = nextP >= 0.5 ? 1 : 0;
  }
  return Math.max(0, Math.min(1, nextP));
}

/**
 * 0→1 as Capabilities chapter rises into pin — drives field pose blend from opening thesis to signal.
 * @param {DOMRect | null | undefined} capabilitiesRect
 * @param {number} vh
 */
export function measureOpeningCapabilitiesHandoff(capabilitiesRect, vh) {
  if (!capabilitiesRect || vh < 1) return 1;
  const top = capabilitiesRect.top;
  if (top >= vh * 0.98) return 0;
  if (top <= vh * 0.04) return 1;
  return smoothstep(vh * 0.96, vh * 0.06, vh - top);
}
