/**
 * OrganicField motion — ambient identity, perspective focus, cluster reconfiguration.
 * Deterministic; A/B/C use distinct breathe curves, stiffness, and transition arcs.
 */

import { ORB_SCENE_SPECS } from '../../data/orbScenes.js';
import { HERO_LANDING_FIELD } from '../../data/organicFieldPalette.js';
import {
  easeScrollBreath,
  scrollBreathScalePulse,
} from '../../utils/fieldNarrative.js';
import { computeHeroFieldTargets, heroScrollDrive } from '../../utils/heroFieldMotion.js';

const TAU = Math.PI * 2;

export const CLUSTER_FOCUS = { x: 0.505, y: 0.485 };

/** Minimum C opacity (warm signal never fully vanishes) */
export const OPACITY_FLOOR_C = 0.22;
export const OPACITY_FLOOR_C_PERSPECTIVE = 0.24;
export const SCALE_FLOOR_C = 0.44;

const REST = {
  a: { x: 0.43, y: 0.48 },
  b: { x: 0.58, y: 0.51 },
  c: { x: 0.52, y: 0.44 },
};

const SIGNAL_ARC_GREEN = [
  { x: 0.19, y: 0.2 },
  { x: 0.13, y: 0.38 },
  { x: 0.09, y: 0.56 },
  { x: 0.15, y: 0.74 },
];

/** Pinned capability panels — matches homeCapabilities.length */
const CAPABILITY_PANEL_COUNT = 5;

const SIGNAL_ACCENT_B = { x: 0.9, y: 0.15 };
const SIGNAL_ACCENT_C = { x: 0.94, y: 0.22 };

const SIGNAL_LAYOUT = {
  default: {
    a: { opacity: 0.78, scale: 1.34, dx: -0.028, dy: 0, rotation: 0, stretchX: 1.06, stretchY: 0.94 },
    b: { opacity: 0.50, scale: 0.86, dx: 0, dy: 0, stretchX: 1.06, stretchY: 0.9, rotation: 0.1 },
    c: { opacity: 0.22, scale: 0.48, dx: 0, dy: 0 },
  },
};

const WORK_REST = {
  a: { x: 0.12, y: 0.04 },
  b: { x: 0.91, y: 0.11 },
  c: { x: 0.94, y: 0.19 },
};

const WORK_LAYOUT = {
  default: {
    a: { opacity: 0.48, scale: 1.1, dx: -0.01, dy: -0.02 },
    b: { opacity: 0.3, scale: 0.92, dx: 0.01, dy: 0, stretchX: 1.04, stretchY: 1 },
    c: { opacity: 0.24, scale: 0.54, dx: 0, dy: 0 },
  },
};

const DEPTH_REST = {
  b: { x: 0.14, y: 0.48 },
  a: { x: 0.9, y: 0.1 },
  c: { x: 0.84, y: 0.22 },
};

/** Section 04 — blue hero drifts along POV scroll (like signal green arc) */
const DEPTH_ARC_BLUE = [
  { x: 0.1, y: 0.56 },
  { x: 0.16, y: 0.5 },
  { x: 0.22, y: 0.43 },
  { x: 0.3, y: 0.34 },
];

const DEPTH_LAYOUT = {
  default: {
    a: { opacity: 0.22, scale: 0.62, dx: 0.01, dy: 0 },
    b: { opacity: 0.58, scale: 1.5, dx: 0, dy: 0, stretchX: 1.06, stretchY: 1.03 },
    c: { opacity: 0.24, scale: 0.54, dx: 0, dy: 0 },
  },
};

const CONTACT_REST = {
  c: { x: 0.17, y: 0.14 },
  a: { x: 0.91, y: 0.1 },
  b: { x: 0.11, y: 0.7 },
};

const CONTACT_LAYOUT = {
  default: {
    a: { opacity: 0.2, scale: 0.54, dx: 0, dy: 0 },
    b: { opacity: 0.22, scale: 0.58, dx: 0, dy: 0, stretchX: 1, stretchY: 1 },
    c: { opacity: 0.52, scale: 1.32, dx: 0, dy: 0 },
  },
};

const ARCHIVE_REST = {
  c: { x: 0.52, y: 0.42 },
  a: { x: 0.03, y: 0.07 },
  b: { x: 0.97, y: 0.05 },
};

const ARCHIVE_LAYOUT = {
  default: {
    a: { opacity: 0.1, scale: 0.4, dx: -0.022, dy: -0.014 },
    b: { opacity: 0.12, scale: 0.42, dx: 0.02, dy: -0.012, stretchX: 1, stretchY: 1 },
    c: { opacity: 0.88, scale: 1.32, dx: 0, dy: 0, stretchX: 1.0, stretchY: 1.03 },
  },
};

/** Landing — green left, blue upper-right seam, amber high (subtitle clearance) */
const WARM_REST = HERO_LANDING_FIELD.rest;

const WARM_LAYOUT = {
  default: HERO_LANDING_FIELD.layout,
};

const LAYOUT = {
  default: {
    a: { opacity: 0.84, scale: 1, dx: 0, dy: 0 },
    b: { opacity: 0.78, scale: 1, dx: 0, dy: 0, stretchX: 1, stretchY: 1 },
    c: { opacity: 0.58, scale: 0.92, dx: 0, dy: 0 },
  },
  work: {
    a: {
      opacity: 1,
      scale: 1.14,
      dx: 0.024,
      dy: 0.006,
      rotation: -0.14,
      stretchX: 1.1,
      stretchY: 0.88,
    },
    b: { opacity: 0.22, scale: 0.92, dx: 0.022, dy: -0.01 },
    c: { opacity: OPACITY_FLOOR_C_PERSPECTIVE, scale: 0.82, dx: -0.01, dy: -0.016 },
  },
  thinking: {
    a: {
      opacity: 0.2,
      scale: 0.92,
      dx: -0.014,
      dy: 0.008,
      rotation: 0.2,
      stretchX: 0.9,
      stretchY: 1.08,
    },
    b: { opacity: 1, scale: 1.14, dx: -0.02, dy: 0.008, stretchX: 1.1, stretchY: 0.94 },
    c: { opacity: OPACITY_FLOOR_C_PERSPECTIVE, scale: 0.84, dx: 0.012, dy: -0.012 },
  },
  person: {
    a: {
      opacity: 0.2,
      scale: 0.92,
      dx: 0.012,
      dy: 0.01,
      rotation: -0.1,
      stretchX: 1.06,
      stretchY: 0.9,
    },
    b: { opacity: 0.2, scale: 0.9, dx: 0.016, dy: 0.006 },
    c: { opacity: 1, scale: 1.18, dx: 0.012, dy: 0.022 },
  },
};

const CYCLE = { a: 21, b: 14, c: 8.5 };

export const ARC_AMP = { a: 0.014, b: 0.028, c: 0.034 };

/** Landing / warm hero — per-field motion channels (see warmAmbient*) */
export const WARM_MOTION = {
  timeScale: 1.08,
  arcMult: 1.88,
  landingArcMult: 2.35,
  arcMultA: 0,
  arcMultB: 0,
  arcMultC: 0,
};

/** Incommensurate drift — reads irregular, not repetitive back-and-forth. */
function irregularFieldOffset(t, seed = 0) {
  const s = seed;
  const x =
    Math.sin(t * 0.23 + s * 1.7) +
    Math.sin(t * 0.41 + s * 2.9) * 0.72 +
    Math.cos(t * 0.17 + s * 0.4) * 0.58 +
    Math.sin(t * 0.67 + s * 4.1) * 0.45 +
    Math.cos(t * 0.31 + s * 1.1) * 0.38;
  const y =
    Math.cos(t * 0.27 + s * 2.2) +
    Math.sin(t * 0.39 + s * 1.3) * 0.68 +
    Math.cos(t * 0.53 + s * 3.7) * 0.52 +
    Math.sin(t * 0.19 + s * 0.9) * 0.41;
  const rot =
    Math.sin(t * 0.21 + s) * 0.018 + Math.cos(t * 0.37 + s * 2.5) * 0.012;
  return { x, y, rot };
}

/** Blue hugs green right edge — free path, clamped so it never leaves the seam. */
function landingBlueSeamMotion(t) {
  const g = WARM_REST.a;
  const base = WARM_REST.b;
  const seamX = g.x + 0.11;
  const seamY = g.y - 0.035;
  const off = irregularFieldOffset(t * 0.72, 2.9);
  const along = (off.x / 3.2) * 0.014;
  const lift = (off.y / 3.2) * 0.012;
  const targetX = Math.max(seamX - 0.006, Math.min(seamX + 0.02, seamX + along));
  const targetY = seamY + lift;
  const urTilt = -0.32;
  return {
    dx: targetX - base.x,
    dy: targetY - base.y,
    scale: 1 + Math.abs(off.x) * 0.0018 + Math.abs(off.y) * 0.0012,
    rotation: urTilt + off.rot * 0.55,
    stretchX: 1.1 + off.x * 0.003,
    stretchY: 0.84 - off.y * 0.002,
    flow: t * 0.22 + off.x * 0.35 + off.y * 0.2,
  };
}

/** Orange — wider orbit on Opening. */
function landingAmberOrbitMotion(t) {
  const ph = (t / WARM_ELASTIC.cycleC) * TAU;
  const pulse = elasticPulse(t, WARM_ELASTIC.cycleC, 1.15);
  const r = 0.056 * (1 + elasticWave(t, 15, [0.14], [1.1]) * 0.38);
  const wobble = elasticWave(t, 8.5, [0.22], [0.3]) * 0.018;
  return {
    dx: Math.cos(ph * 0.88) * r + wobble,
    dy: Math.sin(ph * 1.05) * r * 0.86 + pulse * 0.012,
    scale: 1 + pulse * 0.028,
    rotation: Math.sin(ph * 0.7) * 0.038 + pulse * 0.015,
    stretchX: 1.02 + Math.sin(ph * 0.45) * 0.016,
    stretchY: 1.02 + Math.cos(ph * 0.45) * 0.014,
    flow: ph * 0.55,
  };
}

/** Shared elastic rhythm for landing idle */
const WARM_ELASTIC = {
  ensemblePeriod: 26,
  cycleA: 18,
  cycleB: 12.5,
  cycleC: 22,
};

/**
 * Periodic wave with harmonic overshoot — reads as soft elastic, not linear sine.
 * @param {number} t
 * @param {number} period seconds per cycle
 * @param {number[]} [harmonics]
 * @param {number[]} [phaseOff]
 */
function elasticWave(t, period, harmonics = [0.24, 0.09], phaseOff = [0.55, 1.85]) {
  const ph = (t / period) * TAU;
  let v = Math.sin(ph);
  let norm = 1;
  harmonics.forEach((h, i) => {
    v += h * Math.sin(ph * (2.15 + i * 0.75) + (phaseOff[i] ?? 0));
    norm += h;
  });
  return v / norm;
}

/** Peaks with a touch of snap — premium breathe cadence */
function elasticPulse(t, period, sharpness = 1.35) {
  const e = elasticWave(t, period);
  const ph = (t / period) * TAU;
  return e * (1 + Math.cos(ph * sharpness) * 0.14);
}

function warmEnsemble(t) {
  const breath = elasticPulse(t, WARM_ELASTIC.ensemblePeriod);
  const sway = elasticWave(t, WARM_ELASTIC.ensemblePeriod * 1.28, [0.16, 0.05], [1.1, 2.4]);
  return { breath, sway };
}

export function easeSmoothstep(t) {
  const c = Math.max(0, Math.min(1, t));
  return c * c * (3 - 2 * c);
}

/** Scan along capability arc with dwell near each stop */
export function easeCapabilityFloat(raw) {
  if (raw == null) return null;
  const maxIdx = Math.max(1, SIGNAL_ARC_GREEN.length - 1);
  const clamped = Math.max(0, Math.min(maxIdx, raw));
  const i0 = Math.floor(clamped);
  const frac = clamped - i0;
  const smoothFrac = frac * frac * (3 - 2 * frac);
  const dwell = Math.sin(frac * Math.PI) * 0.14;
  return i0 + smoothFrac * (1 - dwell * 0.4) + dwell * 0.12;
}

/** Normalized 0→1 progress through the Capabilities pinned track */
export function signalGreenCapabilityProgress(
  capabilityFloat,
  panelCount = CAPABILITY_PANEL_COUNT,
) {
  if (capabilityFloat == null) return 0;
  const maxIdx = Math.max(1, panelCount - 1);
  const clamped = Math.max(0, Math.min(maxIdx, capabilityFloat));
  return easeSmoothstep(clamped / maxIdx);
}

/**
 * Green field recedes as Capabilities scroll advances — scale + position only (color stays).
 * @param {number} progress 0 at section entry, 1 at final panel
 */
export function signalGreenScrollAttenuation(progress) {
  const raw = Math.max(0, Math.min(1, progress));
  const t = easeScrollBreath(raw);
  const breath = scrollBreathScalePulse(raw);
  return {
    scaleMult: (0.96 + (0.80 - 0.96) * t) * breath,
    dx: -0.038 - 0.042 * t,
    dy: -0.032 - 0.018 * t,
  };
}

function anchorAlongStops(stops, floatIndex) {
  if (!stops?.length) return { x: 0.5, y: 0.5 };
  if (stops.length === 1) return stops[0];
  const maxIdx = stops.length - 1;
  const fi = Math.max(0, Math.min(maxIdx, floatIndex ?? 0));
  const i0 = Math.floor(fi);
  const i1 = Math.min(maxIdx, i0 + 1);
  const t = fi - i0;
  const eased = t * t * (3 - 2 * t);
  return {
    x: stops[i0].x + (stops[i1].x - stops[i0].x) * eased,
    y: stops[i0].y + (stops[i1].y - stops[i0].y) * eased,
  };
}

function signalGreenAnchor(floatIndex, panelCount = SIGNAL_ARC_GREEN.length) {
  return anchorAlongStops(SIGNAL_ARC_GREEN, floatIndex ?? 0);
}

function scrollDepthIndex(depthFloat) {
  if (depthFloat == null) return 0;
  const raw =
    typeof depthFloat === 'number' && Number.isFinite(depthFloat) ? depthFloat : 0;
  const eased = easeCapabilityFloat(raw);
  return eased != null && Number.isFinite(eased) ? eased : raw;
}

function depthBlueAnchor(depthIndex) {
  return anchorAlongStops(DEPTH_ARC_BLUE, depthIndex ?? 0);
}

function depthRestForScroll(depthIndex) {
  const blue = depthBlueAnchor(depthIndex ?? 0);
  return {
    a: DEPTH_REST.a,
    b: blue,
    c: DEPTH_REST.c,
    focus: blue,
  };
}

function signalRestForCapability(capabilityFloat) {
  const green = signalGreenAnchor(capabilityFloat ?? 0);
  return {
    a: green,
    b: SIGNAL_ACCENT_B,
    c: SIGNAL_ACCENT_C,
    focus: green,
  };
}

function ambientA(t, signalMode = false) {
  const ph = (t / CYCLE.a) * TAU;
  const rotAmp = signalMode ? 0.038 : 0.012;
  const stretchAmp = signalMode ? 0.05 : 0.014;
  return {
    dx: Math.sin(ph) * 0.006 + Math.sin(ph * 0.41) * 0.003,
    dy: Math.cos(ph * 0.79) * 0.006 + Math.sin(ph * 0.23) * 0.003,
    scale: 1 + Math.sin(ph) * 0.008,
    rotation: Math.sin(ph * 0.72) * rotAmp + Math.cos(ph * 1.15) * rotAmp * 0.65,
    stretchX: 1 + Math.sin(ph * 0.55) * stretchAmp,
    stretchY: 1 - Math.sin(ph * 0.55) * stretchAmp * 0.82,
  };
}

/** Green volume read during capability arc travel — turn + foreshorten between stops */
function signalGreenVolumeMotion(capabilityFloat, capPulse, chapterMorph) {
  if (capabilityFloat == null) {
    return { rotation: 0, stretchX: 1, stretchY: 1 };
  }
  const fi = capabilityFloat;
  const frac = fi - Math.floor(fi);
  const seg = Math.sin(frac * Math.PI);
  const morph = 1 - easeSmoothstep(chapterMorph ?? 1);
  const pulse = (capPulse ?? 0) * 0.62;
  const rot = seg * 0.58 + fi * 0.16 + pulse * 0.32;
  const depthTilt = Math.cos(frac * TAU + fi * 0.42) * 0.18;
  const squash = 1 + seg * 0.2 * (0.55 + morph * 0.45) + pulse * 0.14;
  return {
    rotation: rot * (0.7 + morph * 0.3),
    stretchX: (1 + depthTilt) / squash,
    stretchY: squash * (1 - depthTilt * 0.7),
  };
}

function ambientB(t, flowBoost = 0) {
  const ph = (t / CYCLE.b) * TAU;
  return {
    dx: Math.sin(ph) * 0.008 + Math.cos(ph * 0.55) * 0.006,
    dy: Math.sin(ph * 0.62) * 0.007 + Math.cos(ph * 0.88) * 0.006,
    scale: 1 + Math.sin(ph * 0.85) * 0.006,
    flow: ph + flowBoost,
  };
}

function ambientC(t, perspectiveKey, capPulse = 0) {
  const ph = (t / CYCLE.c) * TAU;
  const pulseAmp = perspectiveKey === 'person' ? 0.014 : 0.011;
  const capBoost = capPulse * 0.018;
  return {
    dx: Math.sin(ph * 1.08) * 0.006 + Math.sin(ph * 0.47) * 0.004,
    dy: Math.cos(ph * 0.92) * 0.007 + Math.sin(ph * 0.58) * 0.004,
    scale: 1 + Math.sin(ph) * (pulseAmp + capBoost) + Math.sin(ph * 2.05) * 0.004,
  };
}

/** Green — swell / contract + slow drift toward upper-right */
function warmAmbientA(t) {
  const ens = warmEnsemble(t);
  const pulse = elasticPulse(t, WARM_ELASTIC.cycleA);
  const swell = elasticWave(t, WARM_ELASTIC.cycleA * 0.58, [0.22], [0.3]);
  const ph = (t / WARM_ELASTIC.cycleA) * TAU;
  const breathe = pulse * 0.85 + swell * 0.4;
  const ur = irregularFieldOffset(t * 0.42, 1.3);
  return {
    dx: ens.sway * 0.002 + (ur.x / 3.4) * 0.0045,
    dy: ens.breath * 0.0015 - (ur.y / 3.4) * 0.004,
    scale: 1 + breathe * 0.062 + Math.sin(ph * 2.0) * 0.008,
    rotation: Math.sin(ph * 0.35) * 0.012 + ens.sway * 0.006,
    stretchX: 1 + breathe * 0.042 - swell * 0.012,
    stretchY: 1 + breathe * 0.038 + swell * 0.014,
  };
}

/** Blue — Opening: slides along green edge */
function warmAmbientB(t) {
  return landingBlueSeamMotion(t);
}

/** Amber — Opening: wider orbit */
function warmAmbientC(t) {
  return landingAmberOrbitMotion(t);
}

/** Depth chapter — blue slides on a slow diagonal while scrolling */
function depthAmbientB(t, scrollNorm = 0) {
  const ph = (t / 17) * TAU;
  const drift = scrollNorm * 0.028;
  return {
    dx: drift + Math.sin(ph) * 0.012 + Math.cos(ph * 0.62) * 0.008,
    dy: -drift * 0.65 + Math.sin(ph * 0.74) * 0.01 + Math.cos(ph * 1.05) * 0.007,
    scale: 1 + Math.sin(ph * 0.8) * 0.004,
    flow: ph + scrollNorm * 0.85,
    rotation: 0.14 + scrollNorm * 0.06 + Math.sin(ph * 0.45) * 0.03,
    stretchX: 1.08 + scrollNorm * 0.04,
    stretchY: 0.92 - scrollNorm * 0.02,
  };
}

function mergeFieldMotion(layoutField, amb) {
  const rotBase = layoutField.rotation ?? 0;
  const rotAmb = amb.rotation ?? 0;
  return {
    stretchX: (layoutField.stretchX ?? 1) * (amb.stretchX ?? 1),
    stretchY: (layoutField.stretchY ?? 1) * (amb.stretchY ?? 1),
    rotation: rotBase + rotAmb,
  };
}

function accentPos(rest, amb, damp) {
  return { x: rest.x + amb.dx * damp, y: rest.y + amb.dy * damp };
}

function towardFocal(rest, focus, pull) {
  return {
    x: rest.x + (focus.x - rest.x) * pull,
    y: rest.y + (focus.y - rest.y) * pull,
  };
}

/** Push accent fields away from chapter hero (archive: A/B recede from C). */
function awayFromFocal(rest, focus, push) {
  const dx = rest.x - focus.x;
  const dy = rest.y - focus.y;
  const len = Math.hypot(dx, dy) || 1;
  return {
    x: Math.max(0.02, Math.min(0.98, rest.x + (dx / len) * push)),
    y: Math.max(0.02, Math.min(0.98, rest.y + (dy / len) * push)),
  };
}

function clampCOpacity(opacity, isArchive, perspectiveKey) {
  if (isArchive) return Math.max(opacity, 0.82);
  if (perspectiveKey === 'person') return Math.max(opacity, 0.88);
  return Math.max(opacity, OPACITY_FLOOR_C);
}

function clampCScale(scale, isArchive) {
  const floor = isArchive ? 0.95 : SCALE_FLOOR_C;
  return Math.max(scale, floor);
}

/**
 * Subtle gather → expand during chapter morph (morph 0 = just changed, 1 = settled).
 */
export function applyChapterMorph(targets, morph) {
  const u = easeSmoothstep(morph);
  const gatherPhase = 1 - easeSmoothstep(Math.min(1, morph / 0.22));
  const expandPhase = easeSmoothstep(Math.max(0, (morph - 0.12) / 0.88));
  const gather = gatherPhase * 0.045;
  const scalePulse = 1 - gatherPhase * 0.035 + expandPhase * 0.02;

  const twist = gatherPhase * 0.26 - expandPhase * 0.08;

  const pull = (field, isGreen = false) => ({
    centerX: field.centerX + (CLUSTER_FOCUS.x - field.centerX) * gather,
    centerY: field.centerY + (CLUSTER_FOCUS.y - field.centerY) * gather,
    scale: field.scale * scalePulse,
    opacity: field.opacity,
    stretchX: (field.stretchX ?? 1) * (isGreen ? 1 - gatherPhase * 0.1 + expandPhase * 0.05 : 1),
    stretchY: (field.stretchY ?? 1) * (isGreen ? 1 + gatherPhase * 0.08 - expandPhase * 0.03 : 1),
    rotation: (field.rotation ?? 0) + (isGreen ? twist : 0),
    flow: field.flow,
  });

  return {
    a: pull(targets.a, true),
    b: pull(targets.b),
    c: pull(targets.c),
    flowB: targets.flowB,
  };
}

/**
 * Perpendicular arc drift while position is still catching up (cinematic path).
 */
export function applyArcDrift(cur, target, amp, phase) {
  const dx = target.centerX - cur.centerX;
  const dy = target.centerY - cur.centerY;
  const dist = Math.hypot(dx, dy);
  if (dist < 0.0008) return target;

  const progress = Math.min(1, dist / 0.12);
  const swing = Math.sin(progress * Math.PI);
  const nx = -dy / dist;
  const ny = dx / dist;
  const wave = Math.sin(phase * 0.85) * 0.28;

  return {
    ...target,
    centerX: target.centerX + nx * amp * swing + Math.cos(phase * 0.6) * amp * wave * 0.25,
    centerY: target.centerY + ny * amp * swing + Math.sin(phase * 0.5) * amp * wave * 0.25,
  };
}

/** Warm idle — arc path with elastic lateral sway */
export function applyWarmArcDrift(cur, target, amp, phase, t) {
  const elasticPh = phase + elasticWave(t, 11, [0.2], [0.4]) * 0.85;
  const ampMod = amp * (1 + elasticPulse(t, 20) * 0.2);
  const out = applyArcDrift(cur, target, ampMod, elasticPh);
  const ripple = elasticWave(t, 15, [0.25], [1.0]) * amp * 0.42;
  return {
    ...out,
    centerX: out.centerX + Math.cos(elasticPh * 1.1) * ripple,
    centerY: out.centerY + Math.sin(elasticPh * 0.95) * ripple * 0.86,
  };
}

/**
 * Landing warm fields — three unrelated motion languages (not shared arc drift).
 * @param {'a'|'b'|'c'} id
 */
/** Green — slow system-field drift (large, soft, low frequency). */
function greenSceneDrift(target, t, signalHero = false, landing = false) {
  const phase = t * (signalHero ? 0.52 : landing ? 0.38 : 0.42);
  const wobble =
    Math.sin(phase * 0.5) * (signalHero ? 0.038 : landing ? 0.014 : 0.022) +
    Math.cos(phase * 1.12) * (signalHero ? 0.028 : landing ? 0.01 : 0.016);
  const breathe = Math.sin(phase * 0.35) * (signalHero ? 0.014 : landing ? 0.022 : 0.006);
  const swell = elasticPulse(t, WARM_ELASTIC.cycleA) * (landing ? 0.048 : 0);
  const ur = landing ? irregularFieldOffset(t * 0.48, 1.3) : { x: 0, y: 0, rot: 0 };
  return {
    ...target,
    centerX:
      target.centerX +
      (landing
        ? (ur.x / 3.3) * 0.014
        : Math.sin(phase) * (signalHero ? 0.014 : 0.009) + breathe),
    centerY:
      target.centerY +
      (landing
        ? -(ur.y / 3.3) * 0.012
        : Math.cos(phase * 0.68) * (signalHero ? 0.012 : 0.007)),
    rotation: (target.rotation ?? 0) + wobble,
    stretchX:
      (target.stretchX ?? 1) *
      (1 +
        Math.sin(phase * 0.88) * (signalHero ? 0.038 : landing ? 0.045 : 0.022) +
        swell * 0.35),
    stretchY:
      (target.stretchY ?? 1) *
      (1 -
        Math.sin(phase * 0.88) * (signalHero ? 0.032 : landing ? 0.038 : 0.018) -
        swell * 0.28),
    scale:
      target.scale *
      (1 + Math.sin(phase * 0.62) * (signalHero ? 0.018 : landing ? 0.055 : 0.008) + swell),
  };
}

/** Blue — directional lens motion; on landing slides along green seam */
function blueSceneDrift(target, t, flow = 0, signalAccent = false, landing = false) {
  if (landing) {
    const seam = landingBlueSeamMotion(t);
    return {
      ...target,
      centerX: WARM_REST.b.x + seam.dx,
      centerY: WARM_REST.b.y + seam.dy,
      rotation: (target.rotation ?? 0) + seam.rotation,
      stretchX: (target.stretchX ?? 1) * seam.stretchX,
      stretchY: (target.stretchY ?? 1) * seam.stretchY,
      scale: target.scale * seam.scale,
      flow: seam.flow,
    };
  }
  const phase = t * (signalAccent ? 0.72 : 1.05) + flow * 0.08;
  const cut = Math.sin(phase * 1.35) * (signalAccent ? 0.012 : 0.016);
  const wobble = Math.sin(phase * 0.72) * (signalAccent ? 0.014 : 0.02);
  return {
    ...target,
    centerX: target.centerX + cut + Math.cos(phase) * (signalAccent ? 0.01 : 0.013),
    centerY: target.centerY + Math.sin(phase * 0.88) * (signalAccent ? 0.008 : 0.01),
    rotation: (target.rotation ?? 0) + wobble + Math.sin(phase) * (signalAccent ? 0.022 : 0.038),
    stretchX: (target.stretchX ?? 1) * (1 + Math.sin(phase * 0.55) * (signalAccent ? 0.02 : 0)),
    stretchY: (target.stretchY ?? 1) * (1 - Math.sin(phase * 0.55) * (signalAccent ? 0.016 : 0)),
  };
}

/** Yellow — precise author/guide presence; wider orbit on landing */
function yellowSceneDrift(target, t, landing = false) {
  if (landing) {
    const orbit = landingAmberOrbitMotion(t);
    return {
      ...target,
      centerX: WARM_REST.c.x + orbit.dx,
      centerY: WARM_REST.c.y + orbit.dy,
      rotation: (target.rotation ?? 0) + orbit.rotation,
      stretchX: (target.stretchX ?? 1) * orbit.stretchX,
      stretchY: Math.min((target.stretchY ?? 1) * orbit.stretchY, 1.06),
      scale: target.scale * orbit.scale,
    };
  }
  const phase = t * 0.66;
  const r = 0.011;
  return {
    ...target,
    centerX: target.centerX + Math.cos(phase) * r,
    centerY: target.centerY + Math.sin(phase * 1.12) * r * 0.82,
    rotation: (target.rotation ?? 0) + phase * 0.009,
  };
}

const TIER_MOTION_GAIN = {
  dominant: 1,
  supporting: 0.48,
  latent: 0.14,
};

function tierMotionGain(tier, orbScene) {
  if (orbScene !== 'landing') return TIER_MOTION_GAIN[tier] ?? 0.5;
  if (tier === 'dominant') return 1;
  if (tier === 'supporting') return 0.82;
  return 0.62;
}

/**
 * Apply section orb scene — green=a, blue=b, yellow=c.
 * @param {keyof typeof ORB_SCENE_SPECS} orbScene
 */
export function applyOrbSceneSemantics(targets, orbScene, t, reducedMotion = false) {
  const spec = ORB_SCENE_SPECS[orbScene] ?? ORB_SCENE_SPECS.landing;
  const applyRole = (field, role, driftFn, flow = 0) => {
    const gain = tierMotionGain(role.tier, orbScene);
    const landingOpacity = orbScene === 'landing';
    let out = {
      ...field,
      opacity: landingOpacity ? role.opacity : field.opacity * role.opacity,
      scale: field.scale * role.scale,
      stretchX: (field.stretchX ?? 1) * (role.stretchX ?? 1),
      stretchY: (field.stretchY ?? 1) * (role.stretchY ?? 1),
    };
    if (!reducedMotion && gain > 0.01) {
      const drifted = driftFn(out, t, flow);
      out = {
        ...drifted,
        centerX: field.centerX + (drifted.centerX - field.centerX) * gain,
        centerY: field.centerY + (drifted.centerY - field.centerY) * gain,
        rotation:
          (field.rotation ?? 0) + ((drifted.rotation ?? 0) - (field.rotation ?? 0)) * gain,
      };
    }
    return out;
  };

  const cField = applyRole(targets.c, spec.yellow, (field, time) =>
    yellowSceneDrift(field, time, orbScene === 'landing'),
  );
  cField.stretchY = Math.min(cField.stretchY ?? 1, 1.06);

  return {
    a: applyRole(targets.a, spec.green, (field, time) =>
      greenSceneDrift(field, time, orbScene === 'capabilities', orbScene === 'landing'),
    ),
    b: applyRole(
      targets.b,
      spec.blue,
      (field, time, flow) =>
        blueSceneDrift(field, time, flow, orbScene === 'capabilities', orbScene === 'landing'),
      targets.flowB ?? 0,
    ),
    c: cField,
    flowB: targets.flowB,
  };
}

/** Arc amplitude scale from semantic tier (dominant vs latent). */
export function orbSceneArcScale(orbScene, fieldId) {
  const spec = ORB_SCENE_SPECS[orbScene] ?? ORB_SCENE_SPECS.landing;
  const role = fieldId === 'a' ? spec.green : fieldId === 'b' ? spec.blue : spec.yellow;
  return TIER_MOTION_GAIN[role.tier] ?? 0.5;
}

function lerpNum(a, b, t) {
  return a + (b - a) * t;
}

function lerpMotionField(from, to, t) {
  const u = Math.max(0, Math.min(1, t));
  const rotFrom = from.rotation ?? 0;
  const rotTo = to.rotation ?? 0;
  let rotDelta = rotTo - rotFrom;
  if (rotDelta > Math.PI) rotDelta -= Math.PI * 2;
  if (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
  return {
    centerX: lerpNum(from.centerX, to.centerX, u),
    centerY: lerpNum(from.centerY, to.centerY, u),
    scale: lerpNum(from.scale, to.scale, u),
    opacity: lerpNum(from.opacity, to.opacity, u),
    stretchX: lerpNum(from.stretchX ?? 1, to.stretchX ?? 1, u),
    stretchY: lerpNum(from.stretchY ?? 1, to.stretchY ?? 1, u),
    rotation: rotFrom + rotDelta * u,
    flow: lerpNum(from.flow ?? 0, to.flow ?? 0, u),
  };
}

function blendMotionTargets(idle, narrative, drive) {
  return {
    a: lerpMotionField(idle.a, narrative.a, drive),
    b: lerpMotionField(idle.b, narrative.b, drive),
    c: lerpMotionField(idle.c, narrative.c, drive),
    flowB: lerpNum(idle.flowB ?? 0, narrative.flowB ?? 0, drive),
  };
}

/** Opening thesis pose → Capabilities signal pose */
export function blendOpeningToCapabilitiesField(fromHero, signalTargets, blend) {
  const u = easeScrollBreath(Math.max(0, Math.min(1, blend)));
  const breath = scrollBreathScalePulse(blend);
  const blended = blendMotionTargets(fromHero, signalTargets, u);
  return {
    a: { ...blended.a, scale: blended.a.scale * breath },
    b: { ...blended.b, scale: blended.b.scale * (1 + (breath - 1) * 0.35) },
    c: { ...blended.c, scale: blended.c.scale * (1 + (breath - 1) * 0.25) },
    flowB: blended.flowB,
  };
}

export function applyWarmFieldDrift(id, target, phase, t) {
  const ens = warmEnsemble(t);
  if (id === 'a') {
    const pulse = elasticPulse(t, WARM_ELASTIC.cycleA);
    const swell = elasticWave(t, WARM_ELASTIC.cycleA * 0.55, [0.2], [0.35]);
    const breathe = pulse * 0.7 + swell * 0.35;
    const ur = irregularFieldOffset(t * 0.45, 1.3);
    return {
      ...target,
      centerX: target.centerX + ens.sway * 0.003 + (ur.x / 3.3) * 0.005,
      centerY: target.centerY + ens.breath * 0.0025 - (ur.y / 3.3) * 0.004,
      scale: target.scale * (1 + breathe * 0.038),
      rotation: (target.rotation ?? 0) + pulse * 0.008,
      stretchX: (target.stretchX ?? 1) * (1 + breathe * 0.028),
      stretchY: (target.stretchY ?? 1) * (1 + breathe * 0.024),
    };
  }
  if (id === 'b') {
    const seam = landingBlueSeamMotion(t);
    return {
      ...target,
      centerX: WARM_REST.b.x + seam.dx,
      centerY: WARM_REST.b.y + seam.dy,
      rotation: (target.rotation ?? 0) + seam.rotation * 0.65,
      scale: target.scale * seam.scale,
      stretchX: (target.stretchX ?? 1) * seam.stretchX,
      stretchY: (target.stretchY ?? 1) * seam.stretchY,
    };
  }
  const orbit = landingAmberOrbitMotion(t);
  return {
    ...target,
    centerX: WARM_REST.c.x + orbit.dx,
    centerY: WARM_REST.c.y + orbit.dy,
    rotation: (target.rotation ?? 0) + orbit.rotation,
    scale: target.scale * orbit.scale,
    stretchX: (target.stretchX ?? 1) * orbit.stretchX,
    stretchY: Math.min((target.stretchY ?? 1) * orbit.stretchY, 1.06),
  };
}

/**
 * @param {object} [opts]
 * @param {number} [opts.chapterMorph] 0–1 chapter settle
 * @param {number} [opts.capPulse] 0–1 capability change pulse
 * @param {number} [opts.aLead] delayed A follow for signal (0–1)
 */
export function computeMotionTargets(
  t,
  perspectiveKey,
  reducedMotion = false,
  ambientKey = 'default',
  capabilityFloat = null,
  depthFloat = null,
  opts = {},
) {
  const heroProgress = opts.heroProgress;
  const isWarmHero =
    heroProgress != null &&
    (ambientKey === 'warm' || ambientKey === 'default' || !ambientKey) &&
    (perspectiveKey ?? 'default') === 'default';

  if (isWarmHero) {
    const drive = heroScrollDrive(heroProgress);
    if (drive > 0.001) {
      const narrative = computeHeroFieldTargets(heroProgress, t, reducedMotion);
      if (drive >= 0.999) {
        return narrative;
      }
      const idle = computeMotionTargets(
        t,
        perspectiveKey,
        reducedMotion,
        ambientKey,
        capabilityFloat,
        depthFloat,
        { ...opts, heroProgress: undefined },
      );
      return blendMotionTargets(idle, narrative, drive);
    }
  }

  const isSignal = ambientKey === 'signal';
  const isWork = ambientKey === 'work';
  const isDepth = ambientKey === 'depth';
  const isArchive = ambientKey === 'archive';
  const isContact = ambientKey === 'contact';
  const isChapterField = isSignal || isWork || isDepth || isArchive || isContact;
  const isWarm = ambientKey === 'warm' || ambientKey === 'default' || !ambientKey;
  const layoutKey = perspectiveKey ?? 'default';
  let layout =
    isWarm && layoutKey === 'default'
      ? WARM_LAYOUT.default
      : LAYOUT[layoutKey] ?? LAYOUT.default;

  let rest = REST;
  let focus = CLUSTER_FOCUS;
  if (isSignal) {
    const signalPose = signalRestForCapability(capabilityFloat);
    rest = { a: signalPose.a, b: signalPose.b, c: signalPose.c };
    focus = signalPose.focus;
    layout = SIGNAL_LAYOUT.default;
  } else if (isWork) {
    rest = { a: WORK_REST.a, b: WORK_REST.b, c: WORK_REST.c };
    focus = WORK_REST.a;
    layout = WORK_LAYOUT.default;
  } else if (isDepth) {
    const depthPose = depthRestForScroll(scrollDepthIndex(depthFloat));
    rest = { a: depthPose.a, b: depthPose.b, c: depthPose.c };
    focus = depthPose.focus;
    layout = DEPTH_LAYOUT.default;
  } else if (isArchive) {
    rest = { a: ARCHIVE_REST.a, b: ARCHIVE_REST.b, c: ARCHIVE_REST.c };
    focus = ARCHIVE_REST.c;
    layout = ARCHIVE_LAYOUT.default;
  } else if (isContact) {
    rest = { a: CONTACT_REST.a, b: CONTACT_REST.b, c: CONTACT_REST.c };
    focus = CONTACT_REST.c;
    layout = CONTACT_LAYOUT.default;
  } else if (isWarm && layoutKey === 'default') {
    rest = WARM_REST;
    focus = { x: 0.5, y: 0.4 };
  }

  const capPulse = opts.capPulse ?? 0;
  const flowBoost = layoutKey === 'thinking' || isDepth ? 0.35 : 0;
  const depthScrollNorm =
    isDepth && depthFloat != null
      ? scrollDepthIndex(depthFloat) / Math.max(1, DEPTH_ARC_BLUE.length - 1)
      : 0;
  const warmRhythm = isWarm && !reducedMotion;
  const motionT = warmRhythm ? t * WARM_MOTION.timeScale : t;
  let ambA = reducedMotion ? { dx: 0, dy: 0, scale: 1 } : ambientA(motionT, isSignal);
  let ambB = reducedMotion
    ? { dx: 0, dy: 0, scale: 1, flow: 0 }
    : isDepth
      ? depthAmbientB(motionT, depthScrollNorm)
      : ambientB(motionT, flowBoost);
  let ambC = reducedMotion ? { dx: 0, dy: 0, scale: 1 } : ambientC(motionT, perspectiveKey, capPulse);

  if (warmRhythm) {
    ambA = warmAmbientA(motionT);
    ambB = warmAmbientB(motionT);
    ambC = warmAmbientC(motionT);
  }

  const accentDamp = isChapterField ? 0.42 : 1;
  const workGreenAmbDamp = isWork ? 0.38 : 1;
  const aLead = opts.aLead ?? 1;

  const pullA = isChapterField ? 0 : layoutKey === 'work' ? 0.38 : 0;
  const pullB = isChapterField ? 0 : layoutKey === 'thinking' ? 0.4 : 0;
  const pullC = isChapterField ? 0 : layoutKey === 'person' ? 0.44 : 0;

  let posA;
  let posB;
  let posC;
  if (isDepth) {
    posA = accentPos(rest.a, ambA, accentDamp);
    posB = towardFocal(rest.b, focus, 0);
    posC = accentPos(rest.c, ambC, accentDamp);
  } else if (isContact) {
    posA = accentPos(rest.a, ambA, accentDamp);
    posB = accentPos(rest.b, ambB, accentDamp);
    posC = towardFocal(rest.c, focus, 0);
  } else if (isArchive) {
    const archiveRepel = 0.26;
    const archiveAccentDamp = 0.12;
    posA = accentPos(awayFromFocal(rest.a, focus, archiveRepel), ambA, archiveAccentDamp);
    posB = accentPos(awayFromFocal(rest.b, focus, archiveRepel), ambB, archiveAccentDamp);
    posC = accentPos(towardFocal(rest.c, focus, 0), ambC, accentDamp);
  } else if (isChapterField) {
    posA = towardFocal(rest.a, focus, pullA);
    posB = accentPos(rest.b, ambB, accentDamp);
    posC = accentPos(rest.c, ambC, accentDamp);
  } else if (isWarm && layoutKey === 'default') {
    posA = accentPos(rest.a, ambA, 1);
    posB = accentPos(rest.b, ambB, 1);
    posC = accentPos(rest.c, ambC, 1);
  } else {
    posA = towardFocal(rest.a, focus, pullA);
    posB = towardFocal(rest.b, focus, pullB);
    posC = towardFocal(rest.c, focus, pullC);
  }

  if (isSignal) {
    const lag = 0.14 * (1 - aLead);
    posB = {
      x: posB.x + (posA.x - posB.x) * lag * 0.35,
      y: posB.y + (posA.y - posB.y) * lag * 0.35,
    };
  }

  if (isWork && layoutKey === 'work') {
    layout = {
      ...layout,
      a: { ...layout.a, scale: layout.a.scale * 1.04 },
    };
  }

  const fieldA = mergeFieldMotion(layout.a, ambA);
  const fieldB = mergeFieldMotion(layout.b, ambB);
  const fieldC = mergeFieldMotion(layout.c, ambC);

  let greenVol = { rotation: 0, stretchX: 1, stretchY: 1 };
  if (isSignal && capabilityFloat != null && !reducedMotion) {
    greenVol = signalGreenVolumeMotion(capabilityFloat, capPulse, opts.chapterMorph ?? 1);
  }

  let targets = {
    a: {
      centerX: posA.x + layout.a.dx + ambA.dx * workGreenAmbDamp * aLead,
      centerY: posA.y + layout.a.dy + ambA.dy * workGreenAmbDamp * aLead,
      scale: layout.a.scale * (1 + (ambA.scale - 1) * aLead),
      opacity: layout.a.opacity,
      stretchX: fieldA.stretchX * greenVol.stretchX,
      stretchY: fieldA.stretchY * greenVol.stretchY,
      rotation: fieldA.rotation + greenVol.rotation,
    },
    b: {
      centerX: posB.x + layout.b.dx + ambB.dx,
      centerY: posB.y + layout.b.dy + ambB.dy,
      scale: layout.b.scale * ambB.scale,
      opacity: layout.b.opacity,
      stretchX: fieldB.stretchX,
      stretchY: fieldB.stretchY,
      rotation: fieldB.rotation,
      flow: ambB.flow ?? 0,
    },
    c: {
      centerX: posC.x + layout.c.dx + ambC.dx,
      centerY: posC.y + layout.c.dy + ambC.dy,
      scale: layout.c.scale * ambC.scale,
      opacity: layout.c.opacity,
      stretchX: fieldC.stretchX,
      stretchY: fieldC.stretchY,
      rotation: fieldC.rotation,
    },
    flowB: ambB.flow ?? 0,
  };

  targets.c.opacity = clampCOpacity(targets.c.opacity, isArchive, perspectiveKey);
  targets.c.scale = clampCScale(targets.c.scale, isArchive);

  const morph = opts.chapterMorph ?? 1;
  if (morph < 0.995) {
    targets = applyChapterMorph(targets, morph);
  }

  const orbScene = opts.orbScene ?? null;
  const handoffBlend = opts.handoffBlend ?? 0;
  if (handoffBlend > 0.02 && handoffBlend < 0.98 && !reducedMotion) {
    const twist = Math.sin(handoffBlend * Math.PI) * 0.38;
    targets = {
      ...targets,
      a: {
        ...targets.a,
        rotation: (targets.a.rotation ?? 0) + twist,
        stretchX: (targets.a.stretchX ?? 1) * (1 - twist * 0.18),
        stretchY: (targets.a.stretchY ?? 1) * (1 + twist * 0.14),
      },
    };
  }
  if (orbScene) {
    if (handoffBlend > 0.001 && handoffBlend < 0.999) {
      const povTargets = applyOrbSceneSemantics(targets, 'pov', t, reducedMotion);
      const meTargets = applyOrbSceneSemantics(targets, 'me', t, reducedMotion);
      targets = blendMotionTargets(povTargets, meTargets, handoffBlend);
    } else {
      targets = applyOrbSceneSemantics(targets, orbScene, t, reducedMotion);
    }
  } else if (isWarm && !perspectiveKey) {
    targets.c.opacity = Math.max(targets.c.opacity, 0.58);
    targets.c.scale = Math.max(targets.c.scale, 0.92);
  }

  if (isSignal) {
    const capProgress = signalGreenCapabilityProgress(capabilityFloat ?? 0);
    const atten = signalGreenScrollAttenuation(capProgress);
    targets = {
      ...targets,
      a: {
        ...targets.a,
        centerX: targets.a.centerX + atten.dx,
        centerY: targets.a.centerY + atten.dy,
        scale: targets.a.scale * atten.scaleMult,
      },
    };
  }

  const openingCapBlend = opts.openingCapBlend ?? 1;
  if (isSignal && openingCapBlend < 0.999) {
    const fromHero = computeHeroFieldTargets(1, t, reducedMotion);
    targets = blendOpeningToCapabilitiesField(fromHero, targets, openingCapBlend);
  }

  return targets;
}

export function smoothField(cur, target, dt, stiffness = 4.2) {
  const k = 1 - Math.exp(-stiffness * dt);
  const rotCur = cur.rotation ?? 0;
  const rotTgt = target.rotation ?? 0;
  let rotDelta = rotTgt - rotCur;
  if (rotDelta > Math.PI) rotDelta -= Math.PI * 2;
  if (rotDelta < -Math.PI) rotDelta += Math.PI * 2;
  return {
    centerX: cur.centerX + (target.centerX - cur.centerX) * k,
    centerY: cur.centerY + (target.centerY - cur.centerY) * k,
    scale: cur.scale + (target.scale - cur.scale) * k,
    opacity: cur.opacity + (target.opacity - cur.opacity) * k,
    stretchX: cur.stretchX + ((target.stretchX ?? 1) - cur.stretchX) * k,
    stretchY: cur.stretchY + ((target.stretchY ?? 1) - cur.stretchY) * k,
    rotation: rotCur + rotDelta * k,
    flow: cur.flow + ((target.flow ?? cur.flow ?? 0) - (cur.flow ?? 0)) * k,
  };
}

export function smoothScalar(cur, target, dt, stiffness) {
  const k = 1 - Math.exp(-stiffness * dt);
  return cur + (target - cur) * k;
}

export const MOTION_SMOOTH = {
  a: 2.5,
  b: 3.6,
  c: 4.9,
  flow: 3.2,
  ambient: 3.2,
  chapterMorph: 1.65,
  capPulse: 4.5,
  aLead: 2.1,
};
