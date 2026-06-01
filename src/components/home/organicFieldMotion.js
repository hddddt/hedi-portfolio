/**
 * OrganicField motion — ambient identity, perspective focus, cluster reconfiguration.
 * Deterministic; A/B/C use distinct breathe curves, stiffness, and transition arcs.
 */

import { SIGNAL_LAYOUT_SCALE } from '../../data/fieldSizeHierarchy.js';
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
    a: {
      opacity: 0.78,
      scale: SIGNAL_LAYOUT_SCALE.green,
      dx: -0.028,
      dy: 0,
      rotation: 0,
      stretchX: 1.06,
      stretchY: 0.94,
    },
    b: {
      opacity: 0.58,
      scale: SIGNAL_LAYOUT_SCALE.blue,
      dx: 0,
      dy: 0,
      stretchX: 1.06,
      stretchY: 0.9,
      rotation: 0.1,
    },
    c: { opacity: 0.32, scale: SIGNAL_LAYOUT_SCALE.amber, dx: 0, dy: 0 },
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

export const ARC_AMP = { a: 0.014, b: 0.048, c: 0.074 };

/** Landing motion tempo — green slow, blue moderate, amber fastest */
export const LANDING_MOTION_RATE = { a: 0.58, b: 0.92, c: 1.28 };

/** Post-landing idle motion gain — arc, float, orbit */
export const LANDING_MOTION_GAIN = 1.28;

/** Per-field arc — green breathe, blue float, amber orbit */
export const WARM_MOTION = {
  timeScale: 1.32,
  arcMult: 2.75,
  landingArcMult: 3.85,
  arcMultA: 0.36,
  arcMultB: 1.18,
  arcMultC: 1.22,
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

/**
 * Aperiodic scalar — irrational freq mix, no obvious loop cadence.
 * @param {number} t
 * @param {number} seed
 * @param {number} [gain]
 */
function aperiodicChannel(t, seed, gain = 1) {
  const s = seed;
  const f1 = 0.173 + s * 0.0117;
  const f2 = 0.311 + s * 0.0073;
  const f3 = 0.497 + s * 0.0131;
  const f4 = 0.619 + s * 0.0059;
  const f5 = 0.853 + s * 0.0094;
  const v =
    Math.sin(t * f1 + s * 2.17) * 0.36 +
    Math.sin(t * f2 + s * 1.43) * 0.26 +
    Math.cos(t * f3 + s * 3.81) * 0.2 +
    Math.sin(t * f4 + s * 0.92) * 0.15 +
    Math.cos(t * f5 + s * 4.33) * 0.11 +
    Math.sin(t * (f1 * 1.618) + s * 0.67) * 0.08 +
    Math.cos(t * (f3 * 0.707) + s * 2.04) * 0.06;
  return v * gain;
}

/** Vector + scale from unrelated aperiodic scalars. */
function aperiodicFieldOffset(t, seed, amp = 1) {
  const x = aperiodicChannel(t, seed, amp);
  const y = aperiodicChannel(t + 17.31, seed + 4.91, amp * 0.93);
  const rot = aperiodicChannel(t + 31.74, seed + 8.17, amp * 0.019);
  const scale = 1 + aperiodicChannel(t + 9.07, seed + 2.13, amp * 0.044);
  return { x, y, rot, scale };
}

/** Green — slow anchor drift only; scale pulse lives in greenFieldBreathing.js */
function landingGreenBreathMotion(t) {
  const rate = LANDING_MOTION_RATE.a;
  const gain = LANDING_MOTION_GAIN;
  const off = aperiodicFieldOffset(t * 0.52 * rate, 1.7, 0.42);
  const off2 = aperiodicFieldOffset(t * 0.38 * rate + 3.2, 5.4, 0.34);
  return {
    dx: (off.x * 0.001 + off2.x * 0.0005) * gain,
    dy: (off.y * 0.00082 + off2.y * 0.0004) * gain,
    scale: 1,
    rotation: (off.rot * 0.18 + off2.rot * 0.1) * gain,
    stretchX: 1,
    stretchY: 1,
    flow: off.x * 0.1 + off2.y * 0.06,
  };
}

/** Blue — gentle float, readable drift near green */
function landingBlueFloatMotion(t) {
  const rate = LANDING_MOTION_RATE.b;
  const gain = LANDING_MOTION_GAIN;
  const greenRest = WARM_REST.a;
  const base = WARM_REST.b;
  const anchorX = greenRest.x + 0.112;
  const anchorY = greenRest.y - 0.042;
  const drift = aperiodicFieldOffset(t * 0.48 * rate, 2.3, 1);
  const drift2 = aperiodicFieldOffset(t * 0.34 * rate + 4.1, 6.8, 0.78);
  const rightBias = 0.012 + aperiodicChannel(t * 0.38 * rate, 8.4, 0.009);
  const floatX =
    rightBias +
    ((drift.x / 2.8) * 0.036 + (drift2.x / 3.2) * 0.021) * gain;
  const floatY =
    ((drift.y / 2.8) * 0.054 + (drift2.y / 3.2) * 0.031) * gain;
  return {
    dx: anchorX + floatX - base.x,
    dy: anchorY + floatY - base.y,
    scale: drift.scale * (0.98 + aperiodicChannel(t * rate, 11.2, 0.032)),
    rotation: -0.28 + (drift.rot * 0.88 + drift2.rot * 0.42) * gain,
    stretchX: 1.07 + aperiodicChannel(t * rate + 1.3, 4.5, 0.024),
    stretchY: 0.87 - aperiodicChannel(t * rate + 3.7, 8.1, 0.019),
    flow: drift.x * 0.38 + drift2.y * 0.24 + rightBias * 1.4,
  };
}

/** Centroid between green + blue — amber orbits this hub */
function landingClusterCentroid() {
  const g = WARM_REST.a;
  const b = WARM_REST.b;
  return {
    x: g.x + (b.x - g.x) * 0.54,
    y: g.y + (b.y - g.y) * 0.42 - 0.015,
  };
}

/** Amber — orbits green / blue; faster than others but smooth, not jumpy */
function landingAmberWanderMotion(t) {
  const rate = LANDING_MOTION_RATE.c;
  const gain = LANDING_MOTION_GAIN;
  const base = WARM_REST.c;
  const centroid = landingClusterCentroid();
  const hubDrift = aperiodicFieldOffset(t * 0.22 * rate, 6.2, 0.42);
  const hubX = centroid.x + (hubDrift.x / 3.2) * 0.023 * gain;
  const hubY = centroid.y + (hubDrift.y / 3.2) * 0.02 * gain;

  const orbitT = t * rate * 0.44;
  const off = aperiodicFieldOffset(orbitT * 0.72, 4.7, 0.82);
  const off2 = aperiodicFieldOffset(orbitT * 0.54 + 2.1, 9.3, 0.62);
  const ringR = (0.118 + aperiodicChannel(orbitT, 14.2, 0.036)) * gain;
  const ringPh = orbitT * 0.54 + off.x * 0.07 + aperiodicChannel(orbitT, 11.8, 0.22);
  const orbitX =
    (Math.cos(ringPh * 0.61) * ringR +
      Math.sin(ringPh * 1.21 + 0.85) * ringR * 0.32 +
      (off.x / 2.2) * 0.066 +
      (off2.x / 2.7) * 0.041) *
    (0.92 + gain * 0.08);
  const orbitY =
    (Math.sin(ringPh * 0.74) * ringR * 0.88 +
      Math.cos(ringPh * 1.14 + 1.1) * ringR * 0.3 +
      (off.y / 2.2) * 0.061 +
      (off2.y / 2.7) * 0.036) *
    (0.92 + gain * 0.08);

  return {
    dx: hubX + orbitX - base.x,
    dy: hubY + orbitY - base.y,
    scale: off.scale * (0.98 + aperiodicChannel(t * rate * 0.72, 14.3, 0.022)),
    rotation: off.rot * 0.95 + off2.rot * 0.55,
    stretchX: 1.03 + aperiodicChannel(t * rate * 0.65 + 2.4, 15.1, 0.018),
    stretchY: 1.03 + aperiodicChannel(t * rate * 0.65 + 6.1, 17.4, 0.015),
    flow: ringPh * 0.32 + off.x * 0.22 + off2.y * 0.14,
  };
}

/** @deprecated alias */
function landingBlueSeamMotion(t) {
  return landingBlueFloatMotion(t);
}

/** @deprecated alias */
function landingAmberOrbitMotion(t) {
  return landingAmberWanderMotion(t);
}

/** Shared elastic rhythm for landing idle — distinct cadence per field */
const WARM_ELASTIC = {
  ensemblePeriod: 26,
  cycleA: 20,
  cycleB: 14,
  cycleC: 16,
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
    scale: 1,
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

/** Green — swell / contract in place (minimal drift) */
function warmAmbientA(t) {
  return landingGreenBreathMotion(t);
}

/** Blue — weightless float near green */
function warmAmbientB(t) {
  return landingBlueFloatMotion(t);
}

/** Amber — restless wander near cluster */
function warmAmbientC(t) {
  return landingAmberWanderMotion(t);
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

/** Warm idle — arc path modulated by aperiodic ripple (no clean loop) */
export function applyWarmArcDrift(cur, target, amp, phase, t) {
  const off = aperiodicFieldOffset(t * 0.44 + phase * 0.08, phase * 0.17 + 3.3, 1);
  const ampMod = amp * (0.84 + (off.scale - 1) * 2.4);
  const aperiodicPhase = phase + off.x * 0.42 + aperiodicChannel(t, phase * 0.09 + 2.7, 0.55);
  const out = applyArcDrift(cur, target, ampMod, aperiodicPhase);
  const rippleX = (off.x / 2.4) * amp * 0.78 + aperiodicChannel(t + 3.1, 13.6, amp * 0.22);
  const rippleY = (off.y / 2.4) * amp * 0.68 + aperiodicChannel(t + 7.4, 16.9, amp * 0.19);
  return {
    ...out,
    centerX: out.centerX + rippleX,
    centerY: out.centerY + rippleY,
  };
}

/**
 * Landing warm fields — three unrelated motion languages (not shared arc drift).
 * @param {'a'|'b'|'c'} id
 */
/** Green — anchored; scale pulse applied via greenFieldBreathing.js */
function greenSceneDrift(target, t, signalHero = false, landing = false) {
  if (landing) {
    const breath = landingGreenBreathMotion(t);
    return {
      ...target,
      centerX: target.centerX + breath.dx,
      centerY: target.centerY + breath.dy,
      rotation: (target.rotation ?? 0) + breath.rotation,
    };
  }
  const phase = t * (signalHero ? 0.52 : 0.42);
  const wobble =
    Math.sin(phase * 0.5) * (signalHero ? 0.038 : 0.022) +
    Math.cos(phase * 1.12) * (signalHero ? 0.028 : 0.016);
  const breathe = Math.sin(phase * 0.35) * (signalHero ? 0.014 : 0.006);
  return {
    ...target,
    centerX: target.centerX + Math.sin(phase) * (signalHero ? 0.014 : 0.009) + breathe,
    centerY: target.centerY + Math.cos(phase * 0.68) * (signalHero ? 0.012 : 0.007),
    rotation: (target.rotation ?? 0) + wobble,
  };
}

/** Blue — directional lens motion; on landing floats near green */
function blueSceneDrift(target, t, flow = 0, signalAccent = false, landing = false) {
  if (landing) {
    const float = landingBlueFloatMotion(t);
    return {
      ...target,
      centerX: WARM_REST.b.x + float.dx,
      centerY: WARM_REST.b.y + float.dy,
      rotation: (target.rotation ?? 0) + float.rotation,
      stretchX: (target.stretchX ?? 1) * float.stretchX,
      stretchY: (target.stretchY ?? 1) * float.stretchY,
      scale: target.scale * float.scale,
      flow: float.flow,
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

/** Yellow — precise author/guide presence; landing wanders near cluster */
function yellowSceneDrift(target, t, landing = false) {
  if (landing) {
    const wander = landingAmberWanderMotion(t);
    return {
      ...target,
      centerX: WARM_REST.c.x + wander.dx,
      centerY: WARM_REST.c.y + wander.dy,
      rotation: (target.rotation ?? 0) + wander.rotation,
      stretchX: (target.stretchX ?? 1) * wander.stretchX,
      stretchY: Math.min((target.stretchY ?? 1) * wander.stretchY, 1.06),
      scale: target.scale * wander.scale,
      flow: wander.flow,
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
  if (tier === 'supporting') return 0.88;
  return 1;
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
  return tierMotionGain(role.tier, orbScene);
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
  if (id === 'a') {
    const breath = landingGreenBreathMotion(t);
    return {
      ...target,
      centerX: target.centerX + breath.dx,
      centerY: target.centerY + breath.dy,
      rotation: (target.rotation ?? 0) + breath.rotation,
    };
  }
  if (id === 'b') {
    const float = landingBlueFloatMotion(t);
    return {
      ...target,
      centerX: WARM_REST.b.x + float.dx,
      centerY: WARM_REST.b.y + float.dy,
      rotation: (target.rotation ?? 0) + float.rotation * 0.72,
      scale: target.scale * float.scale,
      stretchX: (target.stretchX ?? 1) * float.stretchX,
      stretchY: (target.stretchY ?? 1) * float.stretchY,
      flow: float.flow,
    };
  }
  const wander = landingAmberWanderMotion(t);
  return {
    ...target,
    centerX: WARM_REST.c.x + wander.dx,
    centerY: WARM_REST.c.y + wander.dy,
    rotation: (target.rotation ?? 0) + wander.rotation,
    scale: target.scale * wander.scale,
    stretchX: (target.stretchX ?? 1) * wander.stretchX,
    stretchY: Math.min((target.stretchY ?? 1) * wander.stretchY, 1.06),
    flow: wander.flow,
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
  const openingOrch = opts.openingOrch;
  const isWarmHero =
    heroProgress != null &&
    (ambientKey === 'warm' || ambientKey === 'default' || !ambientKey) &&
    (perspectiveKey ?? 'default') === 'default';

  if (isWarmHero) {
    const drive = openingOrch ? openingOrch.scrollDrive : heroScrollDrive(heroProgress);
    if (drive > 0.001) {
      const narrative = computeHeroFieldTargets(heroProgress, t, reducedMotion, openingOrch);
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
