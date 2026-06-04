import { getCapabilityBlurTune } from '../config/capabilityBlurTune.js';
import {
  measureCapabilitiesChapterEntry,
  measureChapterEntryProgress,
  motionStyle,
  phaseProgress,
  smoothstep,
} from './scrollMotion.js';
import {
  clamp01,
  getPanelTransitionRole,
  getVisualFloatIndex,
  motionStyleFromState,
  sampleCurve,
} from './scrollStateMachine.js';
import {
  easeInOutCubic,
  easeOutCubic,
  measureTrackFloatIndex,
  SCROLL_LOCK_RADIUS,
  scrollTrackToPanel,
  trackScrollOffset,
} from './scrollTrack.js';

export { getVisualFloatIndex };

/** Within this distance of an integer panel, UI reads as fully settled (no blur crossfade). */
export const CAP_DISPLAY_SETTLE_RADIUS = 0.32;

/** Arc reaches target when linear tween progress hits this (same-arrival, early-start). */
export const CAP_ARC_ARRIVAL_END = 0.88;

/** Left capability rail geometry — keep in sync with CapabilityDialSection arc path. */
export const CAPABILITY_ARC = {
  viewH: 1000,
  viewW: 360,
  chordInset: 72,
  radius: 800,
};

/** 0 at first panel (arc top) → 1 at last panel (arc bottom). Same axis as arc dot. */
export function capabilityArcProgress(floatIndex, panelCount = 5) {
  const maxIdx = Math.max(1, (panelCount ?? 5) - 1);
  if (maxIdx <= 0) return 0;
  return clamp01((floatIndex ?? 0) / maxIdx);
}

/** Organic-field UV Y — locked to arc dot height, not an independent journey. */
export function capabilityArcFieldY(floatIndex, panelCount = 5) {
  const t = smoothstep(0, 1, capabilityArcProgress(floatIndex, panelCount));
  const topUv = 0.38;
  const bottomUv = 0.84;
  return topUv + (bottomUv - topUv) * t;
}

const INDEX_LOCK_EPSILON = SCROLL_LOCK_RADIUS;

/** Per-panel motion narrative — enter → settle → read → release. */
export const CAPABILITY_RHYTHM = {
  enterEnd: 0.22,
  settleEnd: 0.36,
  readEnd: 0.72,
  releaseEnd: 1,
};

function decisiveTransit(t) {
  const c = clamp01(t);
  const edge = 0.36;
  if (c < 0.5) return 0.5 * Math.pow(2 * c, edge);
  return 1 - 0.5 * Math.pow(2 * (1 - c), edge);
}

/**
 * Panel-local rhythm from capability float (segment [floor, floor+1]).
 * Snapped stops rest in read; transit uses enter/settle/read/release windows.
 */
export function capabilityPanelRhythm(fi, maxIdx) {
  const clamped = Math.max(0, Math.min(maxIdx, fi ?? 0));
  const from = Math.floor(clamped);
  const to = Math.min(maxIdx, from + 1);
  const local = clamped - from;
  const { enterEnd, settleEnd, readEnd } = CAPABILITY_RHYTHM;
  const snapDist = Math.abs(clamped - Math.round(clamped));

  if (snapDist < INDEX_LOCK_EPSILON) {
    const panel = Math.round(clamped);
    if (panel >= maxIdx && local > readEnd) {
      const u = decisiveTransit((local - readEnd) / (1 - readEnd));
      return {
        phase: 'release',
        hold: 1 - u * 0.88,
        transitU: u,
        anchorU: u * 0.42,
        from: maxIdx,
        to: maxIdx,
        activePanel: maxIdx,
        local,
      };
    }
    return {
      phase: 'read',
      hold: 1,
      transitU: 0,
      anchorU: 0,
      from: panel,
      to: panel,
      activePanel: panel,
      local: 0,
    };
  }

  if (to === from) {
    if (local < readEnd) {
      const phase = local < enterEnd ? 'enter' : local < settleEnd ? 'settle' : 'read';
      const u =
        phase === 'enter'
          ? decisiveTransit(local / enterEnd)
          : phase === 'settle'
            ? (local - enterEnd) / (settleEnd - enterEnd)
            : 0;
      return {
        phase,
        hold: phase === 'read' ? 1 : phase === 'settle' ? 0.72 + u * 0.28 : u * 0.28,
        transitU: u,
        anchorU: phase === 'enter' ? u * 0.34 : 0,
        from,
        to: from,
        activePanel: from,
        local,
      };
    }
    const u = decisiveTransit((local - readEnd) / (1 - readEnd));
    return {
      phase: 'release',
      hold: 1 - u * 0.88,
      transitU: u,
      anchorU: u * 0.42,
      from,
      to: from,
      activePanel: from,
      local,
    };
  }

  if (local < enterEnd) {
    const u = decisiveTransit(local / enterEnd);
    return {
      phase: 'enter',
      hold: u * 0.28,
      transitU: u,
      anchorU: u * 0.34,
      from,
      to,
      activePanel: to,
      local,
    };
  }
  if (local < settleEnd) {
    const u = (local - enterEnd) / (settleEnd - enterEnd);
    return {
      phase: 'settle',
      hold: 0.28 + u * 0.72,
      transitU: u,
      anchorU: 0.34 + u * 0.4,
      from,
      to,
      activePanel: from,
      local,
    };
  }
  if (local < readEnd) {
    return {
      phase: 'read',
      hold: 1,
      transitU: 0,
      anchorU: 0,
      from,
      to,
      activePanel: from,
      local,
    };
  }
  const u = decisiveTransit((local - readEnd) / (1 - readEnd));
  return {
    phase: 'release',
    hold: 1 - u * 0.88,
    transitU: u,
    anchorU: u * 0.38,
    from,
    to,
    activePanel: from,
    local,
  };
}

/** Stabilized float for atmosphere / WebGL — plateaus during read, slow blend on enter/release. */
export function capabilityBackgroundFloatIndex(floatIndex, panelCount) {
  const maxIdx = Math.max(0, (panelCount ?? 1) - 1);
  if (maxIdx <= 0) return 0;
  const rhythm = capabilityPanelRhythm(floatIndex, maxIdx);
  if (rhythm.phase === 'read' || rhythm.phase === 'settle') {
    return rhythm.activePanel;
  }
  if (rhythm.phase === 'enter') {
    const t = smoothstep(0, 1, rhythm.transitU * 0.55);
    return rhythm.from + (rhythm.to - rhythm.from) * t;
  }
  if (rhythm.phase === 'release') {
    const t = smoothstep(0, 1, rhythm.transitU * 0.45);
    return rhythm.from + (rhythm.to - rhythm.from) * t;
  }
  return rhythm.activePanel;
}

/**
 * Unified narrative state for capability section orchestration.
 * @returns {{
 *   activeCapabilityIndex: number,
 *   targetCapabilityIndex: number,
 *   localTransitionProgress: number,
 *   sectionPhase: string,
 *   backgroundFloatIndex: number,
 *   rhythm: ReturnType<typeof capabilityPanelRhythm>,
 * }}
 */
export function capabilityNarrativeState(floatIndex, activeCapabilityIndex, panelCount) {
  const maxIdx = Math.max(0, (panelCount ?? 1) - 1);
  const fi = Math.max(0, Math.min(maxIdx + 0.999, floatIndex ?? 0));
  const rhythm = capabilityPanelRhythm(fi, maxIdx);
  const settled = Math.min(maxIdx, Math.max(0, activeCapabilityIndex ?? Math.round(fi)));
  const target =
    rhythm.phase === 'release' || rhythm.phase === 'enter' ? rhythm.to : rhythm.activePanel;

  return {
    activeCapabilityIndex: settled,
    targetCapabilityIndex: target,
    localTransitionProgress: rhythm.transitU ?? rhythm.local ?? 0,
    sectionPhase: rhythm.phase,
    backgroundFloatIndex: capabilityBackgroundFloatIndex(fi, panelCount),
    rhythm,
  };
}
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
  { t: 0.12, opacity: 0.12, blur: INACTIVE_BLUR_PX, scale: 0.985, y: 14 },
  { t: 0.28, opacity: 0.44, blur: 3, scale: 0.99, y: 10 },
  { t: 0.42, opacity: 0.78, blur: CAP_TRANSIT_BLUR_PX, scale: 0.996, y: 5 },
  { t: 0.56, opacity: 0.96, blur: 2, scale: 1, y: 2 },
  { t: 0.72, opacity: 1, blur: 0, scale: 1, y: 0 },
  { t: 1, opacity: 1, blur: 0, scale: 1, y: 0 },
];

const CAP_FIELDS = ['opacity', 'blur', 'scale', 'y'];

export function measureCapabilityFloatIndex(rect, panelCount) {
  return measureTrackFloatIndex(rect, panelCount);
}

/** Linear 0–1 progress between step indices from a sticky track rect. */
export function capabilityStepTransitionProgress(rect, panelCount, fromIndex, toIndex) {
  const raw = measureCapabilityFloatIndex(rect, panelCount);
  const from = fromIndex;
  const to = toIndex;
  if (to === from) return 1;
  return clamp01((raw - from) / (to - from));
}

/**
 * Visual float for crossfade / arc / field — never fractional when settled.
 * @param {number} activeIndex settled panel
 * @param {boolean} isTransitioning programmatic panel tween
 * @param {number} transitionFrom
 * @param {number} transitionTo
 * @param {number | null} measuredRaw scroll-measured index during tween
 */
export function resolveCapabilityDisplayFloat(
  activeIndex,
  isTransitioning,
  transitionFrom,
  transitionTo,
  measuredRaw = null,
) {
  const active = Math.max(0, activeIndex);
  if (!isTransitioning) {
    return active;
  }
  const lo = Math.min(transitionFrom, transitionTo);
  const hi = Math.max(transitionFrom, transitionTo);
  const raw = measuredRaw ?? transitionTo;
  return Math.min(hi, Math.max(lo, raw));
}

/**
 * Single transition clock — arc starts slightly earlier, both arrive near p → 1.
 * Arc is a locator: early-start, same-arrival (not preview-at-target).
 * @param {number} transitionProgress linear 0–1 from scroll tween
 */
export function capabilityTransitionIndices(fromIndex, toIndex, transitionProgress) {
  const from = fromIndex;
  const to = toIndex;
  const p = clamp01(transitionProgress);
  const contentT = easeInOutCubic(p);
  const arcT = easeOutCubic(smoothstep(0, CAP_ARC_ARRIVAL_END, p));
  return {
    contentIndex: from + (to - from) * contentT,
    arcIndex: from + (to - from) * arcT,
  };
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

export function capabilityPanelCrossfade(
  rawFloatIndex,
  panelIndex,
  reducedMotion = false,
  tune,
  options = {},
) {
  void tune;
  const { inStepTransition = false } = options;

  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return on
      ? activePanelStyle()
      : inactivePanelStyle();
  }

  const raw = rawFloatIndex ?? 0;
  const nearest = Math.round(raw);
  if (
    !inStepTransition &&
    nearest === panelIndex &&
    Math.abs(raw - panelIndex) < CAP_SETTLE_RADIUS
  ) {
    return activePanelStyle();
  }

  const floatIndex = inStepTransition ? raw : getVisualFloatIndex(rawFloatIndex);

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
    return { opacity: 0.96, filter: undefined, r: 7.5 };
  }
  const floatIndex = rawFloatIndex ?? 0;
  const frac = floatIndex - Math.floor(floatIndex);
  const locked = frac < SCROLL_LOCK_RADIUS || frac > 1 - SCROLL_LOCK_RADIUS;
  return {
    opacity: locked ? 0.98 : 0.9,
    filter: locked
      ? 'drop-shadow(0 0 6px rgba(255,255,255,0.34))'
      : 'drop-shadow(0 0 4px rgba(255,255,255,0.22))',
    r: locked ? 7.5 : 6.75,
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
  const arc = motionStyle(phaseProgress(p, 0.06, 0.26), {
    y: 20,
    opacity: 0,
    blur: 5,
  }, { y: 0, opacity: 1, blur: 0 });

  const headline = motionStyle(phaseProgress(p, 0.2, 0.36), {
    y: 28,
    scale: 0.96,
    opacity: 0,
    blur: 5,
  }, { y: 0, scale: 1, opacity: 1, blur: 0 });

  const description = motionStyle(phaseProgress(p, 0.3, 0.44), {
    y: 18,
    opacity: 0,
    blur: 3,
  }, { y: 0, opacity: 1, blur: 0 });

  const chipLabelPrimary = motionStyle(phaseProgress(p, 0.42, 0.52), {
    y: 8,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  const chipLabelSecondary = motionStyle(phaseProgress(p, 0.54, 0.64), {
    y: 6,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  const footerLead = motionStyle(phaseProgress(p, 0.64, 0.8), {
    y: 10,
    opacity: 0,
  }, { y: 0, opacity: 1 });

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
  const start = 0.42 + stagger * 0.14;
  const end = start + 0.1;
  return motionStyle(phaseProgress(entryProgress, start, end), {
    y: 16,
    scale: 0.97,
    opacity: 0,
  }, { y: 0, scale: 1, opacity: 1 });
}

export function capabilitySecondaryChipStyle(entryProgress, index, total, reducedMotion) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };
  const stagger = index / Math.max(1, total - 1);
  const start = 0.54 + stagger * 0.12;
  const end = start + 0.09;
  return motionStyle(phaseProgress(entryProgress, start, end), {
    y: 12,
    opacity: 0,
  }, { y: 0, scale: 1, opacity: 1 });
}

/**
 * Panel transition content reveal — enter → settle → read → release.
 * @param {'headline'|'description'|'primary'|'secondary'} part
 */
export function capabilityPanelPartStyle(
  rawFloatIndex,
  panelIndex,
  part,
  chipIndex = 0,
  chipTotal = 1,
  reducedMotion = false,
) {
  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return on ? { opacity: 1, transform: 'none', filter: undefined } : { opacity: 0, transform: 'none' };
  }

  const raw = rawFloatIndex ?? 0;
  if (Math.round(raw) === panelIndex && Math.abs(raw - panelIndex) < CAP_SETTLE_RADIUS) {
    return { opacity: 1, transform: 'none', filter: undefined };
  }

  const floatIndex = getVisualFloatIndex(rawFloatIndex);
  const { role, t: localT } = getPanelTransitionRole(floatIndex, panelIndex);

  if (role === 'active') {
    return { opacity: 1, transform: 'none', filter: undefined };
  }

  if (role === 'outgoing') {
    const fadeStart = part === 'headline' ? 0.12 : part === 'description' ? 0.08 : 0.04;
    const u = clamp01((localT - fadeStart) / 0.42);
    const opacity = 1 - smoothstep(0, 1, u);
    const y = u * (part === 'headline' ? -10 : -6);
    if (opacity < 0.04) return { opacity: 0, transform: `translate3d(0, ${y}px, 0)` };
    return {
      opacity,
      transform: `translate3d(0, ${y.toFixed(1)}px, 0)`,
      filter: u > 0.35 ? `blur(${(u * 3).toFixed(1)}px)` : undefined,
    };
  }

  if (role === 'incoming') {
    const delays = {
      headline: [0.12, 0.34],
      description: [0.2, 0.42],
      primary: [0.3 + (chipIndex / Math.max(1, chipTotal - 1)) * 0.08, 0.52],
      secondary: [0.4 + (chipIndex / Math.max(1, chipTotal - 1)) * 0.08, 0.64],
    };
    const [start, end] = delays[part] ?? delays.headline;
    const u = clamp01((localT - start) / Math.max(0.08, end - start));
    const eased = smoothstep(0, 1, u);
    const y = (1 - eased) * (part === 'headline' ? 22 : part === 'description' ? 16 : 14);
    const blur = part === 'headline' || part === 'description' ? (1 - eased) * 4 : 0;
    return {
      opacity: eased,
      transform: `translate3d(0, ${y.toFixed(1)}px, 0)`,
      filter: blur > 0.2 ? `blur(${blur.toFixed(1)}px)` : undefined,
    };
  }

  return { opacity: 0, transform: 'translate3d(0, 12px, 0)' };
}

export function capabilitiesFieldParallax(entryProgress, panelSpread = 0, handoff = 1) {
  const h = Math.max(0, Math.min(1, handoff ?? 1));
  const bgShift = entryProgress * 0.22 + panelSpread * 0.06;
  return {
    translateY: `${bgShift * 16}px`,
    scale: 1 + entryProgress * 0.02 + (1 - h) * 0.012,
    opacity: 0.58 + entryProgress * 0.16 + h * 0.1,
  };
}

/** 0→1 continuous Capabilities release → Work evidence atmosphere. */
export function measureCapWorkOrchestration(capRect, workRect, panelCount, vh) {
  if (!capRect || panelCount <= 1) {
    return { handoff: 0, capabilityFloat: null, frozenFloat: null };
  }

  const rawFi = measureCapabilityFloatIndex(capRect, panelCount);
  const release = measureCapabilityReleaseProgress(capRect, panelCount);
  const maxIdx = panelCount - 1;
  const frozenFloat =
    release > 0 ? Math.max(0, Math.min(maxIdx, maxIdx - 0.12)) : null;

  if (release <= 0) {
    return { handoff: 0, capabilityFloat: rawFi, frozenFloat: null };
  }

  let handoff = release * 0.78;

  if (workRect && vh > 0) {
    const workEntry = measureChapterEntryProgress(workRect, vh);
    if (workRect.top <= vh * 0.08) {
      handoff = Math.min(1, release * 0.72 + workEntry * 0.28);
    }
  }

  return {
    handoff: clamp01(handoff),
    capabilityFloat: rawFi,
    frozenFloat,
  };
}

/** 0→1 through the sticky track release zone after the last panel stop. */
export function measureCapabilityReleaseProgress(rect, panelCount) {
  if (!rect || panelCount <= 1) return 0;
  const vh = window.innerHeight;
  const total = Math.max(1, rect.height - vh);
  const traveled = Math.min(Math.max(-rect.top, 0), total);
  const panelStep = total / panelCount;
  const lastPanelTravel = panelStep * (panelCount - 1);
  if (traveled <= lastPanelTravel + 4) return 0;
  const releaseSpan = Math.max(1, total - lastPanelTravel);
  return clamp01((traveled - lastPanelTravel) / releaseSpan);
}

/** 0→1 Cap → Work handoff — prefers scroll release progress; float fallback for tests. */
export function measureCapabilityWorkHandoff(floatIndex, panelCount, capRect = null) {
  if (panelCount <= 1) return 0;
  if (capRect) return measureCapabilityReleaseProgress(capRect, panelCount);
  const last = panelCount - 1;
  if (floatIndex <= last + 0.06) return 0;
  const releaseEnd = last + 0.48;
  return clamp01((floatIndex - (last + 0.06)) / (releaseEnd - (last + 0.06)));
}

/**
 * Scroll-driven ambient tokens for capability residual fields.
 * @param {number} floatIndex
 * @param {Record<string, { residualA: string, residualB: string, residualC: string, wash: string }>} themes
 * @param {string[]} capIds ordered capability ids
 */
export function capabilityAmbientStyleFromNarrative(narrativeState, themes, capIds) {
  return capabilityAmbientStyle(narrativeState?.backgroundFloatIndex ?? 0, themes, capIds);
}

export function capabilityAmbientStyle(floatIndex, themes, capIds) {
  if (!capIds?.length || !themes) {
    return {
      themeId: capIds?.[0] ?? '',
      '--cap-residual-a': 'rgba(88, 108, 96, 0.08)',
      '--cap-residual-b': 'rgba(128, 118, 96, 0.06)',
      '--cap-residual-c': 'rgba(72, 92, 108, 0.04)',
      '--cap-wash': 'rgba(108, 98, 88, 0.05)',
    };
  }

  const n = capIds.length;
  const fi = Math.max(0, Math.min(n - 1, floatIndex ?? 0));
  /* Discrete themes per panel — avoid mid-scroll RGB blend that reads as three blobs clustering. */
  const panelIdx = Math.min(n - 1, Math.max(0, Math.round(fi)));
  const theme = themes[capIds[panelIdx]] ?? themes[capIds[0]];

  return {
    themeId: capIds[panelIdx],
    '--cap-residual-a': theme.residualA,
    '--cap-residual-b': theme.residualB,
    '--cap-residual-c': theme.residualC,
    '--cap-wash': theme.wash,
  };
}

export { measureCapabilitiesChapterEntry, measureChapterEntryProgress };
