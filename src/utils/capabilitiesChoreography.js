import { getCapabilityBlurTune } from '../config/capabilityBlurTune.js';
import { measureChapterEntryProgress, motionStyle, phaseProgress, smoothstep } from './scrollMotion.js';
import {
  clamp01,
  getPanelTransitionRole,
  getVisualFloatIndex,
  motionStyleFromState,
  sampleCurve,
} from './scrollStateMachine.js';
import {
  measureTrackFloatIndex,
  SCROLL_LOCK_RADIUS,
  scrollTrackToPanel,
  trackScrollOffset,
} from './scrollTrack.js';

export { getVisualFloatIndex };

const INDEX_LOCK_EPSILON = SCROLL_LOCK_RADIUS;
const INACTIVE_BLUR_PX = 8;
/** Peak blur during panel handoff — subtle for stable recordings. */
const CAP_TRANSIT_BLUR_PX = 4;

/** Narrow blur corridor — blur is transit only, not a resting state. */
const CAP_OUTGOING_KEYS = [
  { t: 0, opacity: 1, blur: 0, scale: 1, y: 0 },
  { t: 0.28, opacity: 1, blur: 0, scale: 1, y: 0 },
  { t: 0.42, opacity: 0.84, blur: CAP_TRANSIT_BLUR_PX, scale: 0.993, y: 8 },
  { t: 0.54, opacity: 0.42, blur: 3, scale: 0.988, y: 12 },
  { t: 0.66, opacity: 0, blur: INACTIVE_BLUR_PX, scale: 0.985, y: 16 },
  { t: 1, opacity: 0, blur: INACTIVE_BLUR_PX, scale: 0.985, y: 16 },
];

const CAP_INCOMING_KEYS = [
  { t: 0, opacity: 0, blur: INACTIVE_BLUR_PX, scale: 0.985, y: 16 },
  { t: 0.4, opacity: 0.1, blur: INACTIVE_BLUR_PX, scale: 0.985, y: 14 },
  { t: 0.52, opacity: 0.42, blur: 3, scale: 0.99, y: 10 },
  { t: 0.66, opacity: 0.78, blur: CAP_TRANSIT_BLUR_PX, scale: 0.996, y: 5 },
  { t: 0.78, opacity: 0.96, blur: 2, scale: 1, y: 2 },
  { t: 0.9, opacity: 1, blur: 0, scale: 1, y: 0 },
  { t: 1, opacity: 1, blur: 0, scale: 1, y: 0 },
];

const CAP_FIELDS = ['opacity', 'blur', 'scale', 'y'];

export function measureCapabilityFloatIndex(rect, panelCount) {
  return measureTrackFloatIndex(rect, panelCount);
}

export function quantizeCapabilityFloatIndex(fi) {
  const nearest = Math.round(fi);
  if (Math.abs(fi - nearest) < INDEX_LOCK_EPSILON) return nearest;
  return fi;
}

export function syncCapabilityStepAnchor(fi, anchorRef) {
  const nearest = Math.round(fi);
  if (Math.abs(fi - nearest) < INDEX_LOCK_EPSILON) {
    anchorRef.current = nearest;
  }
}

export function capabilityScrollOffsetForPanel(trackEl, panelIndex, panelCount) {
  return trackScrollOffset(trackEl, panelIndex, panelCount);
}

export function scrollCapabilityToPanel(trackEl, panelIndex, panelCount, behavior = 'auto') {
  scrollTrackToPanel(trackEl, panelIndex, panelCount, behavior);
}

export function capabilityPanelTransitionBand(floatIndex, panelIndex) {
  const { role, t } = getPanelTransitionRole(floatIndex, panelIndex);
  if (role === 'active') return { band: 'rest', t: 0 };
  if (role === 'outgoing') return { band: 'outgoing', t };
  if (role === 'incoming') return { band: 'incoming', t };
  return { band: 'idle', t: Math.abs(floatIndex - panelIndex) };
}

function inactivePanelStyle() {
  return {
    opacity: 0,
    filter: `blur(${INACTIVE_BLUR_PX}px)`,
    transform: 'translate3d(0, 0, 0) scale(0.93)',
    visibility: 'hidden',
    pointerEvents: 'none',
    zIndex: 0,
  };
}

function activePanelStyle() {
  return motionStyleFromState(
    { opacity: 1, blur: 0, scale: 1, y: 0 },
    { pointerEvents: true, zIndex: 20 },
  );
}

/** Panels within this distance of a snap stop render sharp — blur is transit-only. */
const CAP_SETTLE_RADIUS = 0.22;

function applyTransitBlur(state, localT, role) {
  let blur = state.blur ?? 0;
  if (role === 'outgoing' && localT <= 0.26) blur = 0;
  if (role === 'incoming' && localT >= 0.78) {
    blur *= Math.max(0, 1 - (localT - 0.78) / 0.22);
  }
  return Math.min(CAP_TRANSIT_BLUR_PX, blur);
}

export function capabilityPanelCrossfade(rawFloatIndex, panelIndex, reducedMotion = false, tune) {
  void tune;

  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return on
      ? activePanelStyle()
      : inactivePanelStyle();
  }

  const raw = rawFloatIndex ?? 0;
  const nearest = Math.round(raw);
  if (nearest === panelIndex && Math.abs(raw - panelIndex) < CAP_SETTLE_RADIUS) {
    return activePanelStyle();
  }

  const floatIndex = getVisualFloatIndex(rawFloatIndex);

  const { role, t: localT } = getPanelTransitionRole(floatIndex, panelIndex);

  if (role === 'active') {
    return activePanelStyle();
  }

  if (role === 'outgoing') {
    const state = sampleCurve(CAP_OUTGOING_KEYS, localT, CAP_FIELDS);
    if (state.opacity < 0.06) return inactivePanelStyle();
    return motionStyleFromState({ ...state, blur: applyTransitBlur(state, localT, 'outgoing') }, {
      pointerEvents: localT < 0.28,
      zIndex: 12,
    });
  }

  if (role === 'incoming') {
    const state = sampleCurve(CAP_INCOMING_KEYS, localT, CAP_FIELDS);
    if (state.opacity < 0.06) return inactivePanelStyle();
    return motionStyleFromState({ ...state, blur: applyTransitBlur(state, localT, 'incoming') }, {
      pointerEvents: localT > 0.68,
      zIndex: 14,
    });
  }

  return inactivePanelStyle();
}

export function capabilityArcNodeRefocus(
  rawFloatIndex,
  panelIndex,
  lineIndex = 0,
  lineCount = 1,
  reducedMotion = false,
) {
  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return {
      opacity: on ? 0.96 : 0,
      filter: undefined,
      color: on ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,0.22)',
    };
  }

  const raw = rawFloatIndex ?? 0;
  const nearest = Math.round(raw);
  if (nearest === panelIndex && Math.abs(raw - panelIndex) < CAP_SETTLE_RADIUS) {
    return {
      opacity: 0.96,
      filter: undefined,
      color: 'rgba(255,255,255,0.88)',
    };
  }

  const floatIndex = getVisualFloatIndex(rawFloatIndex);

  const { role, t: baseT } = getPanelTransitionRole(floatIndex, panelIndex);
  const lineStagger = lineIndex * 0.01;
  const pointProgress = clamp01((baseT - lineStagger) / 0.78);

  if (role === 'active') {
    return {
      opacity: 0.96,
      filter: undefined,
      color: 'rgba(255,255,255,0.88)',
    };
  }

  if (role === 'before' || role === 'after') {
    return {
      opacity: 0,
      filter: `blur(${INACTIVE_BLUR_PX}px)`,
      color: 'rgba(255,255,255,0.14)',
    };
  }

  let state;
  if (role === 'outgoing') {
    state = sampleCurve(CAP_OUTGOING_KEYS, pointProgress, CAP_FIELDS);
  } else {
    state = sampleCurve(CAP_INCOMING_KEYS, pointProgress, CAP_FIELDS);
  }

  const blurPx = applyTransitBlur(state, pointProgress, role === 'outgoing' ? 'outgoing' : 'incoming');
  return {
    opacity: state.opacity,
    filter: blurPx > 0.12 ? `blur(${blurPx.toFixed(2)}px)` : undefined,
    transform: `translate3d(0, ${state.y.toFixed(2)}px, 0) scale(${state.scale.toFixed(4)})`,
    color: `rgba(255,255,255,${(0.14 + state.opacity * 0.64).toFixed(3)})`,
  };
}

export function capabilityArcDotRefocus(rawFloatIndex, reducedMotion = false) {
  if (reducedMotion) {
    return { opacity: 0.85, filter: undefined, r: 3.5 };
  }
  const floatIndex = getVisualFloatIndex(rawFloatIndex);
  const frac = floatIndex - Math.floor(floatIndex);
  const inCorridor = frac > 0.24 && frac < 0.7;
  const locked = frac < SCROLL_LOCK_RADIUS || frac > 1 - SCROLL_LOCK_RADIUS;
  return {
    opacity: locked ? 0.88 : inCorridor ? 0.72 : 0.8,
    filter: undefined,
    r: locked ? 3.5 : 3.25,
  };
}

export function sampleCapabilityBlurCurve(tune, steps = 80) {
  void tune;
  const out = [];
  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps;
    const o = sampleCurve(CAP_OUTGOING_KEYS, t, CAP_FIELDS);
    const n = sampleCurve(CAP_INCOMING_KEYS, t, CAP_FIELDS);
    out.push({
      dist: t,
      opacity: Math.max(o.opacity, n.opacity),
      blurPx: Math.max(o.blur, n.blur),
      outgoing: o,
      incoming: n,
    });
  }
  return out;
}

export function capabilitiesEntryLayers(entryProgress, reducedMotion = false) {
  if (reducedMotion) {
    return {
      headline: { opacity: 1, transform: 'none' },
      description: { opacity: 1, transform: 'none' },
      chipLabelPrimary: { opacity: 1, transform: 'none' },
      chipLabelSecondary: { opacity: 1, transform: 'none' },
      footerLead: { opacity: 1, transform: 'none' },
      arc: { opacity: 1, transform: 'none', filter: undefined },
      parallax: { title: 0, description: 0, chips: 0, arc: 0 },
    };
  }

  const p = entryProgress;
  const headline = motionStyle(phaseProgress(p, 0.2, 0.4), {
    y: 42,
    scale: 0.985,
    opacity: 0,
    blur: 8,
  }, { y: 0, scale: 1, opacity: 1, blur: 0 });

  const description = motionStyle(phaseProgress(p, 0.35, 0.55), {
    y: 24,
    opacity: 0,
    blur: 4,
  }, { y: 0, opacity: 1, blur: 0 });

  const chipLabelPrimary = motionStyle(phaseProgress(p, 0.42, 0.58), {
    y: 12,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  const chipLabelSecondary = motionStyle(phaseProgress(p, 0.58, 0.72), {
    y: 12,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  const footerLead = motionStyle(phaseProgress(p, 0.62, 0.78), {
    y: 10,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  const arc = motionStyle(phaseProgress(p, 0.08, 0.32), {
    y: 28,
    opacity: 0,
    blur: 6,
  }, { y: 0, opacity: 1, blur: 0 });

  return {
    headline,
    description,
    chipLabelPrimary,
    chipLabelSecondary,
    footerLead,
    arc,
    parallax: {
      title: (1 - p) * 18,
      description: (1 - p) * 10,
      chips: (1 - p) * 6,
      arc: (1 - p) * 22,
    },
  };
}

export function capabilityPrimaryChipStyle(entryProgress, index, total, reducedMotion) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };
  const stagger = index / Math.max(1, total - 1);
  const start = 0.45 + stagger * 0.22;
  const end = start + 0.14;
  return motionStyle(phaseProgress(entryProgress, start, end), {
    y: 18,
    scale: 0.96,
    opacity: 0,
  }, { y: 0, scale: 1, opacity: 1 });
}

export function capabilitySecondaryChipStyle(entryProgress, index, total, reducedMotion) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };
  const stagger = index / Math.max(1, total - 1);
  const start = 0.58 + stagger * 0.2;
  const end = start + 0.12;
  return motionStyle(phaseProgress(entryProgress, start, end), {
    y: 12,
    opacity: 0,
  }, { y: 0, scale: 1, opacity: 1 });
}

export function capabilitiesFieldParallax(entryProgress, panelSpread = 0) {
  const bgShift = entryProgress * 0.32 + panelSpread * 0.12;
  return {
    translateY: `${bgShift * 28}px`,
    scale: 1 + entryProgress * 0.04,
    opacity: 0.78 + entryProgress * 0.18,
  };
}

export { measureChapterEntryProgress };
