/**
 * OrganicField motion — ambient identity, perspective focus, cluster reconfiguration.
 * Deterministic; A/B/C use distinct breathe curves, stiffness, and transition arcs.
 */

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
  { x: 0.27, y: 0.2 },
  { x: 0.21, y: 0.38 },
  { x: 0.17, y: 0.56 },
  { x: 0.23, y: 0.74 },
];

const SIGNAL_ACCENT_B = { x: 0.9, y: 0.15 };
const SIGNAL_ACCENT_C = { x: 0.94, y: 0.22 };

const SIGNAL_LAYOUT = {
  default: {
    a: { opacity: 0.62, scale: 1.42, dx: 0, dy: 0 },
    b: { opacity: 0.28, scale: 0.62, dx: 0, dy: 0, stretchX: 1, stretchY: 1 },
    c: { opacity: 0.26, scale: 0.58, dx: 0, dy: 0 },
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
    c: { opacity: 0.88, scale: 1.48, dx: 0, dy: 0 },
  },
};

/** Landing — spread anchors so amber is not buried under green */
const WARM_REST = {
  a: { x: 0.43, y: 0.56 },
  b: { x: 0.6, y: 0.5 },
  c: { x: 0.52, y: 0.39 },
};

/** Landing hero — green round & large; blue squarish; amber compact & upright */
const WARM_LAYOUT = {
  default: {
    a: {
      opacity: 0.84,
      scale: 1.28,
      dx: 0,
      dy: 0,
      stretchX: 1.02,
      stretchY: 0.98,
      rotation: -0.04,
    },
    b: {
      opacity: 0.72,
      scale: 1.22,
      dx: 0,
      dy: 0,
      stretchX: 0.96,
      stretchY: 0.96,
      rotation: 0.1,
    },
    c: {
      opacity: 0.56,
      scale: 1.08,
      dx: 0,
      dy: 0,
      stretchX: 1.0,
      stretchY: 1.1,
      rotation: 0.06,
    },
  },
};

const LAYOUT = {
  default: {
    a: { opacity: 0.84, scale: 1, dx: 0, dy: 0 },
    b: { opacity: 0.78, scale: 1, dx: 0, dy: 0, stretchX: 1, stretchY: 1 },
    c: { opacity: 0.58, scale: 0.92, dx: 0, dy: 0 },
  },
  work: {
    a: { opacity: 1, scale: 1.14, dx: 0.024, dy: 0.006 },
    b: { opacity: 0.22, scale: 0.92, dx: 0.022, dy: -0.01 },
    c: { opacity: OPACITY_FLOOR_C_PERSPECTIVE, scale: 0.82, dx: -0.01, dy: -0.016 },
  },
  thinking: {
    a: { opacity: 0.2, scale: 0.92, dx: -0.014, dy: 0.008 },
    b: { opacity: 1, scale: 1.14, dx: -0.02, dy: 0.008, stretchX: 1.1, stretchY: 0.94 },
    c: { opacity: OPACITY_FLOOR_C_PERSPECTIVE, scale: 0.84, dx: 0.012, dy: -0.012 },
  },
  person: {
    a: { opacity: 0.2, scale: 0.92, dx: 0.012, dy: 0.01 },
    b: { opacity: 0.2, scale: 0.9, dx: 0.016, dy: 0.006 },
    c: { opacity: 1, scale: 1.18, dx: 0.012, dy: 0.022 },
  },
};

const CYCLE = { a: 21, b: 14, c: 8.5 };

export const ARC_AMP = { a: 0.011, b: 0.017, c: 0.013 };

/** Landing / warm hero — per-field motion channels (see warmAmbient*) */
export const WARM_MOTION = {
  timeScale: 1.35,
  arcMult: 1.55,
  arcMultA: 0,
  arcMultB: 0,
  arcMultC: 0,
};

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

function ambientA(t) {
  const ph = (t / CYCLE.a) * TAU;
  return {
    dx: Math.sin(ph) * 0.006 + Math.sin(ph * 0.41) * 0.003,
    dy: Math.cos(ph * 0.79) * 0.006 + Math.sin(ph * 0.23) * 0.003,
    scale: 1 + Math.sin(ph) * 0.008,
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

/** Green — in-place pulse (round, symmetric stretch) */
function warmAmbientA(t) {
  const ph = (t / 20) * TAU;
  const breath = Math.sin(ph);
  return {
    dx: 0,
    dy: 0,
    scale: 1 + breath * 0.058 + Math.sin(ph * 2.2) * 0.012,
    rotation: Math.sin(ph * 0.35) * 0.012,
    stretchX: 1 + breath * 0.016,
    stretchY: 1 + breath * 0.016,
  };
}

/** Blue — lateral slide; squarish silhouette */
function warmAmbientB(t) {
  const ph = (t / 13) * TAU;
  const wobble = Math.sin(ph * 0.7) * 0.012;
  return {
    dx: Math.sin(ph) * 0.034 + Math.cos(ph * 0.55) * 0.016,
    dy: Math.sin(ph * 1.42) * 0.011 + Math.cos(ph * 0.88) * 0.007,
    scale: 1 + Math.sin(ph * 1.1) * 0.006,
    rotation: 0.1 + Math.sin(ph * 0.48) * 0.05,
    stretchX: 0.98 + wobble,
    stretchY: 0.98 - wobble * 0.35,
    flow: ph * 1.15,
  };
}

/** Amber — upright blob; wider orbit away from green */
function warmAmbientC(t) {
  const ph = (t / 38) * TAU;
  const breath = Math.sin(ph * 0.42);
  return {
    dx: Math.cos(ph * 0.9) * 0.01,
    dy: Math.sin(ph * 0.9) * 0.008,
    scale: 1 + breath * 0.014,
    rotation: t * 0.026 + Math.sin(ph * 0.55) * 0.05,
    stretchX: 1.01 + breath * 0.009,
    stretchY: 1.1 + breath * 0.012,
    flow: ph * 0.4,
  };
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

  const pull = (field) => ({
    centerX: field.centerX + (CLUSTER_FOCUS.x - field.centerX) * gather,
    centerY: field.centerY + (CLUSTER_FOCUS.y - field.centerY) * gather,
    scale: field.scale * scalePulse,
    opacity: field.opacity,
    stretchX: field.stretchX,
    stretchY: field.stretchY,
    flow: field.flow,
  });

  return {
    a: pull(targets.a),
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

/**
 * Landing warm fields — three unrelated motion languages (not shared arc drift).
 * @param {'a'|'b'|'c'} id
 */
export function applyWarmFieldDrift(id, target, phase, t) {
  if (id === 'a') {
    return target;
  }
  if (id === 'b') {
    const slideX = Math.sin(phase) * 0.022 + Math.cos(phase * 0.63) * 0.011;
    const slideY = Math.sin(phase * 1.38) * 0.016 + Math.sin(phase * 0.41) * 0.008;
    return {
      ...target,
      centerX: target.centerX + slideX,
      centerY: target.centerY + slideY,
      rotation: (target.rotation ?? 0) + Math.sin(phase * 0.9) * 0.02,
    };
  }
  const orbitR = 0.027;
  const orbitPh = phase * 0.72 + t * 0.015;
  return {
    ...target,
    centerX: target.centerX + Math.cos(orbitPh) * orbitR,
    centerY: target.centerY + Math.sin(orbitPh) * orbitR * 0.88,
    rotation: (target.rotation ?? 0) + orbitPh * 0.014,
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
  let ambA = reducedMotion ? { dx: 0, dy: 0, scale: 1 } : ambientA(motionT);
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

  let targets = {
    a: {
      centerX: posA.x + layout.a.dx + ambA.dx * workGreenAmbDamp * aLead,
      centerY: posA.y + layout.a.dy + ambA.dy * workGreenAmbDamp * aLead,
      scale: layout.a.scale * (1 + (ambA.scale - 1) * aLead),
      opacity: layout.a.opacity,
      stretchX: fieldA.stretchX,
      stretchY: fieldA.stretchY,
      rotation: fieldA.rotation,
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

  if (isWarm && !perspectiveKey) {
    targets.c.opacity = Math.max(targets.c.opacity, 0.58);
    targets.c.scale = Math.max(targets.c.scale, 0.92);
  }

  const morph = opts.chapterMorph ?? 1;
  if (morph < 0.995) {
    targets = applyChapterMorph(targets, morph);
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
