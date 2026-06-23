import { measureChapterEntryProgress, motionStyle, phaseProgress } from './scrollMotion.js';
import {
  getVisualFloatIndex,
  lerp,
} from './scrollStateMachine.js';
import {
  workPhases,
  workTrackHeightVhFromPhases,
} from './scrollTrackConfigs.js';
import { measureTrack, trackScrollablePx, trackScrollOffset, trackScrollTargetY } from './scrollTimeline.js';
import { easeInOutCubic } from './scrollTrack.js';

export { getVisualFloatIndex };

const INDEX_LOCK_EPSILON = 0.14;

/** Scroll budget after pin before case index advances — triptych settles on case 1 first. */
export const WORK_TRACK_LEAD_IN_VH = 20;

/** Tail scroll after last case — keep small so exit is deliberate, not inertial drift. */
export const WORK_TRACK_RELEASE_VH = 64;

/** Vertical spacing on the center spine — sync with `--work-step-vh` in CSS. */
export const WORK_VISUAL_STEP_VH = 32;

/** Deck motion — active card lift at rest (px / scale / depth). */
export const WORK_DECK = {
  liftPx: 10,
  liftScale: 0.02,
  liftZPx: 12,
  activeScaleBoost: 0.028,
  adjacentTiltDeg: 0.9,
  adjacentScale: 0.82,
  previewOpacity: 0.2,
  previewBlur: 1.2,
};

/** How many case cards peek above/below the center spine. */
export const WORK_CANVAS_BAND = 1.05;

/** Unified scroll phases — sequential chapter entry into first case evidence. */
export const WORK_SCROLL = {
  approachEnd: 0.06,
  pinEnd: 0.16,
  readEnd: 0.54,
};

/** @deprecated Alias — prefer WORK_SCROLL */
export const WORK_PHASE = {
  approachEnd: WORK_SCROLL.approachEnd,
  pinEnd: WORK_SCROLL.pinEnd,
  readEnd: WORK_SCROLL.readEnd,
  holdEnd: WORK_SCROLL.approachEnd,
  exitEnd: 0.48,
  enterStart: WORK_SCROLL.pinEnd,
  enterEnd: WORK_SCROLL.readEnd,
  stageSwitchAt: WORK_SCROLL.pinEnd,
};

export function workPanelDistance(rawFloatIndex, panelIndex) {
  return panelIndex - (rawFloatIndex ?? 0);
}

export function workTrackHeightVh(panelCount, _extraReleaseVh = WORK_TRACK_RELEASE_VH) {
  return workTrackHeightVhFromPhases(panelCount);
}

/** Map settled case index (0..n-1) to panelPhases index — panelPhases[0] is approach. */
function workCasePanelPhaseIndex(caseIndex, caseCount) {
  const n = Math.max(1, caseCount);
  const clamped = Math.min(n - 1, Math.max(0, caseIndex));
  return clamped + 1;
}

export function measureWorkFloatIndex(rect, panelCount) {
  if (panelCount <= 1) return 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  return measureTrack(rect, workPhases(panelCount), vh).floatIndex;
}

/** 0→1 through the sticky track release zone after the last case stop. */
export function measureWorkReleaseProgress(rect, panelCount) {
  if (!rect || panelCount <= 1) return 0;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  return measureTrack(rect, workPhases(panelCount), vh).releaseProgress;
}

export function workTrackScrollOffset(trackEl, caseIndex, panelCount) {
  if (!trackEl || panelCount <= 1) return 0;
  const phaseIdx = workCasePanelPhaseIndex(caseIndex, panelCount);
  return trackScrollOffset(trackEl, workPhases(panelCount), phaseIdx);
}

/**
 * Visual case index from programmatic step transition (0–1 tween progress).
 * @param {number} transitionProgress linear 0–1 from scroll tween
 */
export function workTransitionDisplayIndex(fromIndex, toIndex, transitionProgress) {
  const from = fromIndex;
  const to = toIndex;
  const p = Math.max(0, Math.min(1, transitionProgress));
  const eased = easeInOutCubic(p);
  return from + (to - from) * eased;
}

export function workTrackScrollTargetY(trackEl, caseIndex, panelCount) {
  if (!trackEl || panelCount <= 1) {
    return trackEl ? trackEl.getBoundingClientRect().top + window.scrollY : window.scrollY;
  }
  const phaseIdx = workCasePanelPhaseIndex(caseIndex, panelCount);
  return trackScrollTargetY(trackEl, workPhases(panelCount), phaseIdx);
}

/**
 * Cap → Work handoff scroll target — always past the capability release track.
 * @param {HTMLElement} trackEl
 * @param {number} caseIndex
 * @param {number} caseCount
 */
export function resolveWorkChapterEntryScrollY(trackEl, caseIndex, caseCount) {
  if (!trackEl) {
    const vh = window.innerHeight || 800;
    return window.scrollY + Math.round(vh * 0.5);
  }
  const vh = window.innerHeight || 800;
  const caseY = workTrackScrollTargetY(trackEl, caseIndex, caseCount);
  let y = caseY;

  const capTrack = document.querySelector('.capability-scroll');
  if (capTrack instanceof HTMLElement) {
    const rect = capTrack.getBoundingClientRect();
    const scrollable = trackScrollablePx(capTrack.offsetHeight, vh);
    const capEndY = rect.top + window.scrollY + scrollable;
    // Clear cap release, but never stop short of the settled case panel.
    y = Math.max(caseY, capEndY + Math.round(vh * 0.02));
  }

  // Never nudge only ~0.15vh — that leaves handoff stuck in cap-release / work-approach.
  if (y <= window.scrollY + 8) {
    y = Math.max(caseY, window.scrollY + Math.round(vh * 0.35));
  }
  return y;
}

/** Exact window scrollY for a settled work case (Cap→Work finish snap). */
export function snapWorkCaseScrollY(trackEl, caseIndex, caseCount) {
  if (!trackEl || caseCount <= 1) return window.scrollY;
  return workTrackScrollTargetY(trackEl, caseIndex, caseCount);
}

/** Capabilities exit → Work chapter: pin track with case 1 (index 0) settled on the spine. */
export function workFirstCaseScrollY(trackEl, panelCount) {
  return workTrackScrollTargetY(trackEl, 0, panelCount);
}

/** Center spine index — holds with left/right copy during transition phases. */
export function workSpineFloatIndex(rawFloatIndex, panelCount) {
  if (panelCount <= 1) return 0;
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) return ctx.locked;
  const { from, to, t } = ctx;
  if (t < WORK_PHASE.holdEnd) return from;
  if (t >= WORK_PHASE.enterEnd) return to;
  const u = (t - WORK_PHASE.holdEnd) / (WORK_PHASE.enterEnd - WORK_PHASE.holdEnd);
  return from + smoothstep01(u) * (to - from);
}

/**
 * @param {number} rawFloatIndex
 * @param {number} [panelCount]
 */
export function getWorkTransitionContext(rawFloatIndex, panelCount = 99) {
  const maxIdx = Math.max(0, panelCount - 1);
  const v = Math.max(0, Math.min(maxIdx, rawFloatIndex ?? 0));
  if (!Number.isFinite(v)) {
    return { from: 0, to: 0, t: 0, locked: 0, stage: 0 };
  }
  const nearest = Math.round(v);
  if (Math.abs(v - nearest) < INDEX_LOCK_EPSILON) {
    const locked = Math.min(maxIdx, Math.max(0, nearest));
    return { from: locked, to: locked, t: 0, locked, stage: locked };
  }
  const from = Math.floor(v);
  const to = Math.min(maxIdx, from + 1);
  const t = v - from;
  const stage = t < WORK_PHASE.stageSwitchAt ? from : to;
  return { from, to, t, locked: null, stage };
}

/** Accent / glow — settled case index (tracks evidence focus). */
export function workStageIndex(rawFloatIndex, panelCount) {
  if (panelCount <= 1) return 0;
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) return ctx.locked;
  return ctx.t < WORK_SCROLL.pinEnd ? ctx.from : ctx.to;
}

function workPanelRole(panelIndex, ctx) {
  if (ctx.locked != null) {
    return panelIndex === ctx.locked ? 'active' : 'idle';
  }
  if (panelIndex === ctx.from) return 'outgoing';
  if (panelIndex === ctx.to) return 'incoming';
  return 'idle';
}

/** @deprecated Use raw floatIndex for scroll-scrubbed canvas motion. */
export function workRenderFloatIndex(rawFloatIndex) {
  return rawFloatIndex ?? 0;
}

/** @deprecated Use workStageIndex */
export function workRailDisplayIndex(rawFloatIndex, panelCount) {
  return workStageIndex(rawFloatIndex, panelCount);
}

export function quantizeWorkFloatIndex(fi) {
  return getVisualFloatIndex(fi);
}

export function syncWorkStepAnchor(fi, anchorRef) {
  const nearest = Math.round(fi);
  if (Math.abs(fi - nearest) < INDEX_LOCK_EPSILON) {
    anchorRef.current = nearest;
  }
}

export function workScrollOffsetForCase(trackEl, caseIndex, caseCount) {
  return workTrackScrollOffset(trackEl, caseIndex, caseCount);
}

export function scrollWorkToCase(trackEl, caseIndex, caseCount, behavior = 'auto') {
  if (!trackEl || caseCount <= 1) return;
  const y = workTrackScrollTargetY(trackEl, caseIndex, caseCount);
  window.scrollTo({ top: y, behavior });
}

function spineOpacity(absDist, dist = 0) {
  if (absDist <= 0.35) {
    return lerp(1, 0.9, absDist / 0.35);
  }
  if (absDist <= 1.15) {
    const base = lerp(0.88, 0.3, (absDist - 0.35) / 0.8);
    if (dist > 0 && absDist <= 1.08) {
      return Math.max(base, WORK_DECK.previewOpacity);
    }
    return base;
  }
  if (absDist <= WORK_CANVAS_BAND) {
    return lerp(0.42, 0.16, (absDist - 1.15) / (WORK_CANVAS_BAND - 1.15));
  }
  return 0;
}

function spineBlur(absDist, dist = 0) {
  if (absDist < 0.2) return 0;
  const base = Math.min(1.1, absDist * 0.72);
  if (dist > 0.35 && absDist <= 1.12) {
    return Math.max(base, WORK_DECK.previewBlur);
  }
  return base;
}

function spineScale(absDist) {
  if (absDist < 0.38) return 1;
  if (absDist <= 1.12) {
    const t = (absDist - 0.38) / 0.74;
    return lerp(1, WORK_DECK.adjacentScale, smoothstep01(t));
  }
  return WORK_DECK.adjacentScale - 0.04;
}

function smoothstep01(t) {
  const u = Math.max(0, Math.min(1, t));
  return u * u * (3 - 2 * u);
}

/** Active card “picked up” from the row — strongest when settled on an integer index. */
function deckLift(absDist, locked) {
  if (absDist >= 0.52) {
    return { liftY: 0, scaleExtra: 0, liftZ: 0 };
  }
  const t = smoothstep01(1 - absDist / 0.52);
  const settle = locked ? 1 : t * t;
  return {
    liftY: -WORK_DECK.liftPx * settle * t,
    scaleExtra: WORK_DECK.liftScale * settle * t,
    liftZ: WORK_DECK.liftZPx * settle * t,
  };
}

/** Dim cards in the row tilt slightly away from the lifted center card. */
function deckTilt(dist, absDist) {
  if (absDist < 0.38 || absDist > 1.12) return 0;
  const t = smoothstep01(1 - (absDist - 0.38) / 0.74);
  return (dist > 0 ? 1 : -1) * WORK_DECK.adjacentTiltDeg * t;
}

/** Scroll-settled index — integer when within lock radius. */
export function workSettledIndex(rawFloatIndex, panelCount) {
  if (panelCount <= 1) return 0;
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) return ctx.locked;
  return ctx.t < WORK_SCROLL.pinEnd ? ctx.from : ctx.to;
}

export function workCaseInCanvasBand(rawFloatIndex, panelIndex, panelCount, radius = WORK_CANVAS_BAND) {
  if (panelCount <= 1) return true;
  return Math.abs(workPanelDistance(rawFloatIndex, panelIndex)) <= radius;
}

export function workCaseInVisualBand(rawFloatIndex, panelIndex, panelCount) {
  if (panelCount <= 1) return true;
  const dist = workPanelDistance(rawFloatIndex, panelIndex);
  if (Math.abs(dist) <= WORK_CANVAS_BAND) return true;
  /* Always keep the next case in the stack visible when not on the last slide */
  const v = Math.max(0, Math.min(panelCount - 1, rawFloatIndex ?? 0));
  const nextIdx = Math.min(panelCount - 1, Math.floor(v) + 1);
  return panelIndex === nextIdx && v < panelCount - 1 - 0.01;
}

/** Right copy — only the settled case, or the pair in a transition. */
export function workCaseCopyVisible(rawFloatIndex, panelIndex, panelCount) {
  if (panelCount <= 1) return panelIndex === 0;
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) return panelIndex === ctx.locked;
  return panelIndex === ctx.from || panelIndex === ctx.to;
}

/** @deprecated Use workCaseCopyVisible or workCaseInVisualBand */
export function workCaseInTransitionBand(rawFloatIndex, panelIndex, panelCount) {
  return workCaseCopyVisible(rawFloatIndex, panelIndex, panelCount);
}

export function workVisualCrossfade(rawFloatIndex, panelIndex, reducedMotion = false, panelCount = 99) {
  const spineIndex = workSpineFloatIndex(rawFloatIndex, panelCount);
  const dist = workPanelDistance(spineIndex, panelIndex);
  const absDist = Math.abs(dist);
  const stepPx = (WORK_VISUAL_STEP_VH / 100) * (typeof window !== 'undefined' ? window.innerHeight : 800);
  const yPx = dist * stepPx;

  if (!workCaseInVisualBand(rawFloatIndex, panelIndex, panelCount)) {
    return {
      opacity: 0,
      filter: undefined,
      transform: `translate3d(-50%, calc(-50% + ${yPx.toFixed(2)}px), 0) scale(0.94)`,
      visibility: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    };
  }

  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return {
      opacity: on ? 1 : absDist <= 1 ? 0.42 : 0,
      filter: undefined,
      transform: `translate3d(-50%, calc(-50% + ${yPx.toFixed(2)}px), 0) scale(${on ? 1 : 0.95})`,
      visibility: on || absDist <= 1 ? 'visible' : 'hidden',
      pointerEvents: on ? 'auto' : 'none',
      zIndex: on ? 30 : 10 - Math.round(absDist),
    };
  }

  const opacity = spineOpacity(absDist, dist);
  let blur = spineBlur(absDist, dist);
  const isNextPreview = dist > 0.32 && dist < 1.15 && absDist > 0.35;
  const scale = spineScale(absDist);
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  const role = workPanelRole(panelIndex, ctx);
  const isLockedActive = ctx.locked === panelIndex;
  const { liftY, scaleExtra, liftZ } = deckLift(absDist, isLockedActive);
  const tiltX = deckTilt(dist, absDist);
  let yFinal = yPx + liftY;
  let scaleFinal = scale + scaleExtra;
  let opacityFinal = opacity;
  if (isLockedActive && absDist < 0.28) {
    scaleFinal += WORK_DECK.activeScaleBoost;
  }

  if (ctx.locked == null) {
    if (role === 'incoming') {
      const env = visualIncomingEnvelope(ctx.t);
      opacityFinal *= env.opacityMul;
      scaleFinal *= env.scaleMul;
      blur += env.blurExtra;
      yFinal += env.yExtra;
    } else if (role === 'outgoing') {
      const env = visualOutgoingEnvelope(ctx.t);
      opacityFinal *= env.opacityMul;
      scaleFinal *= env.scaleMul;
      blur += env.blurExtra;
      yFinal += env.yExtra;
    }
  }

  const zIndex =
    absDist < 0.38 ? 44 : dist > 0 && absDist <= 1.05 ? 38 - Math.round(absDist * 6) : 40 - Math.round(absDist * 9);

  return {
    opacity: opacityFinal,
    filter: blur > 0.12 ? `blur(${blur.toFixed(2)}px)` : undefined,
    transform: `translate3d(-50%, calc(-50% + ${yFinal.toFixed(2)}px), ${liftZ.toFixed(1)}px) scale(${scaleFinal.toFixed(4)}) rotateX(${tiltX.toFixed(2)}deg)`,
    visibility: opacityFinal > 0.05 ? 'visible' : 'hidden',
    pointerEvents: absDist < 0.4 && opacityFinal > 0.45 ? 'auto' : 'none',
    zIndex,
  };
}

export function workRailOnesFlipStyle(rawFloatIndex, digitIndex, panelCount) {
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);

  if (ctx.locked != null) {
    const on = digitIndex === ctx.locked;
    return {
      opacity: on ? 1 : 0,
      transform: on ? 'translate3d(0, 0, 0) rotateX(0deg) scale(1)' : 'translate3d(0, 10px, 0) rotateX(-48deg) scale(0.88)',
      visibility: on ? 'visible' : 'hidden',
    };
  }

  const { pinEnd } = WORK_SCROLL;
  const textFadeEnd = pinEnd + 0.13;
  const indexEnterEnd = pinEnd + 0.14;

  if (digitIndex === ctx.from) {
    if (ctx.t >= textFadeEnd) {
      return { opacity: 0, visibility: 'hidden', transform: 'translate3d(0, -12px, 0) rotateX(48deg) scale(0.88)' };
    }
    const u = ctx.t < pinEnd
      ? 0
      : (ctx.t - pinEnd) / (textFadeEnd - pinEnd);
    return {
      opacity: lerp(1, 0, u),
      transform: `translate3d(0, ${lerp(0, -14, u).toFixed(2)}px, 0) rotateX(${lerp(0, 52, u).toFixed(2)}deg) scale(${lerp(0.9, 0.86, u).toFixed(3)})`,
      visibility: u < 0.98 ? 'visible' : 'hidden',
    };
  }

  if (digitIndex === ctx.to) {
    if (ctx.t < pinEnd + 0.03) {
      return { opacity: 0, visibility: 'hidden', transform: 'translate3d(0, 16px, 0) rotateX(-52deg) scale(0.88)' };
    }
    const u = Math.min(1, (ctx.t - (pinEnd + 0.03)) / (indexEnterEnd - (pinEnd + 0.03)));
    return {
      opacity: lerp(0, 1, u),
      transform: `translate3d(0, ${lerp(16, 0, u).toFixed(2)}px, 0) rotateX(${lerp(-52, 0, u).toFixed(2)}deg) scale(${lerp(0.88, 0.9, u).toFixed(3)})`,
      visibility: u > 0.02 ? 'visible' : 'hidden',
    };
  }

  return { opacity: 0, visibility: 'hidden', transform: 'none' };
}

function workOutgoingCopy(t, part = 'title') {
  const { approachEnd, pinEnd, readEnd } = WORK_SCROLL;
  const textFadeEnd = pinEnd + 0.13;

  if (t < pinEnd) {
    return { opacity: 1, y: 0, pointerEvents: true, zIndex: 20 };
  }
  if (t >= textFadeEnd) {
    return { opacity: 0, y: -10, pointerEvents: false, zIndex: 0 };
  }
  const u = (t - pinEnd) / (textFadeEnd - pinEnd);
  const opacity = lerp(1, 0, u);
  const partFade =
    part === 'title'
      ? Math.max(0, 1 - u * 0.92)
      : part === 'aiLayer' || part === 'intro'
        ? Math.max(0, 1 - u * 1.02)
        : part === 'thesis'
          ? Math.max(0, 1 - u * 1.08)
          : part === 'signals' || part === 'bullets'
            ? Math.max(0, 1 - u * 1.12)
            : Math.max(0, 1 - u * 1.16);
  void approachEnd;
  void readEnd;
  return {
    opacity: opacity * partFade,
    y: lerp(0, -10, u),
    pointerEvents: false,
    zIndex: 12,
  };
}

function workIncomingCopy(t, part = 'title') {
  const { pinEnd, readEnd } = WORK_SCROLL;
  const readSpan = readEnd - pinEnd;
  const delays = {
    title: 0.03,
    aiLayer: 0.07,
    intro: 0.07,
    thesis: 0.11,
    signals: 0.15,
    bullets: 0.15,
    tags: 0.19,
  };
  const partDelay = delays[part] ?? delays.title;
  const start = pinEnd + partDelay;
  const end = Math.min(readEnd, start + readSpan * 0.42);

  if (t < start) {
    return { opacity: 0, y: 18, pointerEvents: false, zIndex: 0 };
  }
  if (t >= end) {
    return { opacity: 1, y: 0, pointerEvents: true, zIndex: 20 };
  }
  const u = smoothstep01((t - start) / Math.max(0.08, end - start));
  const yStart = part === 'title' ? 22 : part === 'tags' ? 14 : 18;
  return {
    opacity: u,
    y: lerp(yStart, 0, u),
    pointerEvents: u > 0.55,
    zIndex: 14,
  };
}

function visualIncomingEnvelope(t) {
  const { approachEnd, pinEnd } = WORK_SCROLL;
  if (t < approachEnd) {
    return { opacityMul: 0.08, scaleMul: 0.96, blurExtra: 8, yExtra: 28 };
  }
  if (t < pinEnd) {
    const u = smoothstep01((t - approachEnd) / (pinEnd - approachEnd));
    return {
      opacityMul: lerp(0.08, 1, u),
      scaleMul: lerp(0.97, 1, u),
      blurExtra: lerp(8, 0, u),
      yExtra: lerp(24, 0, u),
    };
  }
  return { opacityMul: 1, scaleMul: 1, blurExtra: 0, yExtra: 0 };
}

function visualOutgoingEnvelope(t) {
  const { readEnd } = WORK_SCROLL;
  if (t < readEnd) {
    return { opacityMul: 1, scaleMul: 1, blurExtra: 0, yExtra: 0 };
  }
  const u = smoothstep01((t - readEnd) / (1 - readEnd));
  return {
    opacityMul: lerp(1, 0.38, u),
    scaleMul: lerp(1, 0.93, u),
    blurExtra: lerp(0, 2.8, u),
    yExtra: lerp(0, 20, u),
  };
}

export function workCaseCopyLayerStyle(rawFloatIndex, panelIndex, reducedMotion = false, panelCount = 99) {
  if (!workCaseCopyVisible(rawFloatIndex, panelIndex, panelCount)) {
    return {
      opacity: 0,
      filter: undefined,
      transform: 'none',
      visibility: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    };
  }

  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return {
      opacity: 1,
      filter: undefined,
      transform: 'none',
      visibility: on ? 'visible' : 'hidden',
      pointerEvents: on ? 'auto' : 'none',
      zIndex: on ? 20 : 0,
    };
  }

  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  const role = workPanelRole(panelIndex, ctx);
  const shell =
    role === 'active'
      ? { opacity: 1, pointerEvents: true, zIndex: 20 }
      : role === 'outgoing'
        ? workOutgoingCopy(ctx.t, 'title')
        : role === 'incoming'
          ? workIncomingCopy(ctx.t, 'title')
          : { opacity: 0, pointerEvents: false, zIndex: 0 };

  if (shell.opacity <= 0.03) {
    return {
      opacity: 0,
      filter: undefined,
      transform: 'none',
      visibility: 'hidden',
      pointerEvents: 'none',
      zIndex: 0,
    };
  }

  return {
    opacity: shell.opacity,
    filter: undefined,
    transform: 'none',
    visibility: 'visible',
    pointerEvents: shell.pointerEvents ? 'auto' : 'none',
    zIndex: shell.zIndex,
  };
}

/**
 * @param {'title'|'intro'|'bullets'|'tags'} part
 */
export function workCaseCopyPartStyle(rawFloatIndex, panelIndex, part, reducedMotion = false, panelCount = 99) {
  if (!workCaseCopyVisible(rawFloatIndex, panelIndex, panelCount)) {
    return { opacity: 0, transform: 'translate3d(0, 0, 0)', filter: undefined };
  }

  const partKey = part === 'intro' ? 'aiLayer' : part === 'bullets' ? 'signals' : part;

  if (reducedMotion) {
    const on = Math.round(rawFloatIndex ?? 0) === panelIndex;
    return { opacity: on ? 1 : 0, transform: 'none', filter: undefined };
  }

  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  const role = workPanelRole(panelIndex, ctx);

  if (role === 'idle') {
    return { opacity: 0, transform: 'translate3d(0, 0, 0)', filter: undefined };
  }

  const shell =
    role === 'active'
      ? { opacity: 1, y: 0 }
      : role === 'outgoing'
        ? workOutgoingCopy(ctx.t, partKey)
        : role === 'incoming'
          ? workIncomingCopy(ctx.t, partKey)
          : { opacity: 0, y: 0 };

  if (shell.opacity <= 0.03) {
    return { opacity: 0, transform: 'translate3d(0, 0, 0)', filter: undefined };
  }

  return {
    opacity: shell.opacity,
    filter: undefined,
    transform: `translate3d(0, ${(shell.y ?? 0).toFixed(2)}px, 0)`,
  };
}

/** @deprecated Use workCaseCopyLayerStyle + workCaseCopyPartStyle */
export function workCopyCrossfade(floatIndex, panelIndex, reducedMotion = false) {
  const layer = workCaseCopyLayerStyle(floatIndex, panelIndex, reducedMotion);
  const part = workCaseCopyPartStyle(floatIndex, panelIndex, 'title', reducedMotion);
  return {
    ...layer,
    opacity: (layer.opacity ?? 1) * (part.opacity ?? 0),
  };
}

export const WORK_CASE_OFFSETS = {
  case01: { x: -12, y: 36, rotate: -0.8 },
  case02: { x: 10, y: 48, rotate: 0.8 },
  case03: { x: -8, y: 60, rotate: -0.6 },
  case04: { x: 12, y: 72, rotate: 1 },
};

export function getWorkCaseOffset(caseId) {
  return WORK_CASE_OFFSETS[caseId] ?? { x: 0, y: 40, rotate: 0 };
}

/** Rail container — transform only; never dim opacity (digits stay readable). */
export function workRailScrollStyle(rawFloatIndex, panelCount, reducedMotion = false) {
  if (reducedMotion) {
    return { transform: 'translateY(0) scale(1)' };
  }
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) {
    return { transform: 'translateY(0) scale(1)' };
  }
  const { pinEnd } = WORK_SCROLL;
  const t = ctx.t;
  if (t < pinEnd) {
    return { transform: 'translateY(2px) scale(0.98)' };
  }
  const u = smoothstep01((t - pinEnd) / 0.12);
  return {
    transform: `translateY(${lerp(2, 0, u).toFixed(1)}px) scale(${lerp(0.98, 1, u).toFixed(3)})`,
  };
}

export function workAtmosphereStrength(rawFloatIndex, panelCount, entryProgress = 1, inChapterEntry = false) {
  if (inChapterEntry) {
    return Math.min(1, 0.42 + entryProgress * 0.58);
  }
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) return 1;
  const { approachEnd, readEnd } = WORK_SCROLL;
  if (ctx.t < approachEnd) {
    return lerp(0.72, 0.88, ctx.t / approachEnd);
  }
  if (ctx.t < readEnd) {
    return lerp(0.88, 1, (ctx.t - approachEnd) / (readEnd - approachEnd));
  }
  return lerp(1, 0.78, (ctx.t - readEnd) / (1 - readEnd));
}

export function workFrameEntryStyle(entryProgress, reducedMotion = false) {
  if (reducedMotion) {
    return { opacity: 1, transform: 'none', filter: undefined };
  }
  return motionStyle(phaseProgress(entryProgress, 0, WORK_SCROLL.approachEnd), {
    y: 6,
    opacity: 0,
  }, { y: 0, opacity: 1 });
}

export function workChapterEntryRail(entryProgress, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'scale(1)', filter: undefined };
  return motionStyle(phaseProgress(entryProgress, 0.02, 0.12), {
    opacity: 0,
    x: -10,
    scale: 0.88,
    blur: 3,
  }, { opacity: 1, x: 0, scale: 1, blur: 0 });
}

export function workChapterEntryVisual(entryProgress, reducedMotion = false) {
  if (reducedMotion) {
    return {
      opacity: 1,
      filter: undefined,
      transform: 'translate3d(-50%, -50%, 0) scale(1)',
      visibility: 'visible',
      pointerEvents: 'auto',
      zIndex: 44,
    };
  }
  const layer = motionStyle(phaseProgress(entryProgress, 0.1, 0.3), {
    opacity: 0,
    scale: 0.965,
    blur: 10,
    y: 28,
  }, { opacity: 1, scale: 1, blur: 0, y: 0 });
  const match = /translate3d\(([-\d.]+)px,\s*([-\d.]+)px/.exec(layer.transform ?? '');
  const y = match ? Number(match[2]) : 0;
  const scaleMatch = /scale\(([\d.]+)\)/.exec(layer.transform ?? '');
  const scale = scaleMatch ? Number(scaleMatch[1]) : 1;
  return {
    opacity: layer.opacity,
    filter: layer.filter,
    transform: `translate3d(-50%, calc(-50% + ${y.toFixed(2)}px), 0) scale(${scale.toFixed(4)})`,
    visibility: (layer.opacity ?? 0) > 0.05 ? 'visible' : 'hidden',
    pointerEvents: (layer.opacity ?? 0) > 0.35 ? 'auto' : 'none',
    zIndex: 44,
  };
}

/** @param {'title'|'aiLayer'|'thesis'|'signals'|'tags'} part */
export function workChapterEntryCopy(entryProgress, part, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none', filter: undefined };
  const windows = {
    title: [0.24, 0.38],
    aiLayer: [0.28, 0.42],
    thesis: [0.34, 0.48],
    signals: [0.38, 0.52],
    tags: [0.42, 0.56],
  };
  const introPart = part === 'intro' ? 'aiLayer' : part;
  const [start, end] = windows[introPart] ?? windows.title;
  const y = introPart === 'title' ? 22 : introPart === 'tags' ? 14 : 18;
  return motionStyle(phaseProgress(entryProgress, start, end), {
    y,
    opacity: 0,
    blur: introPart === 'title' || introPart === 'aiLayer' ? 4 : 0,
  }, { y: 0, opacity: 1, blur: 0 });
}

function parseHex(hex) {
  const h = String(hex).replace('#', '');
  if (h.length !== 6) return [42, 42, 42];
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

export function lerpAccentHex(fromHex, toHex, t) {
  const u = Math.max(0, Math.min(1, t));
  const a = parseHex(fromHex);
  const b = parseHex(toHex);
  const mix = (i) => Math.round(lerp(a[i], b[i], u));
  const to2 = (n) => n.toString(16).padStart(2, '0');
  return `#${to2(mix(0))}${to2(mix(1))}${to2(mix(2))}`;
}

export function workChapterAccent(rawFloatIndex, accents, panelCount) {
  if (!accents?.length || panelCount <= 1) {
    return accents?.[0] ?? '#3d5c56';
  }
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  const from = accents[ctx.from] ?? accents[0];
  const to = accents[ctx.to] ?? from;
  if (ctx.locked != null) return accents[ctx.locked] ?? from;
  if (ctx.t < WORK_SCROLL.approachEnd) {
    return lerpAccentHex(from, to, smoothstep01(ctx.t / WORK_SCROLL.approachEnd) * 0.32);
  }
  if (ctx.t < WORK_SCROLL.pinEnd) {
    const u =
      0.32 +
      smoothstep01((ctx.t - WORK_SCROLL.approachEnd) / (WORK_SCROLL.pinEnd - WORK_SCROLL.approachEnd)) * 0.38;
    return lerpAccentHex(from, to, u);
  }
  return lerpAccentHex(from, to, smoothstep01((ctx.t - WORK_SCROLL.pinEnd) / (1 - WORK_SCROLL.pinEnd)));
}

export function workCopyLayers(entryProgress, reducedMotion = false) {
  if (reducedMotion) {
    return {
      title: { opacity: 1, transform: 'none' },
      intro: { opacity: 1, transform: 'none' },
      bullets: { opacity: 1, transform: 'none' },
      tags: { opacity: 1, transform: 'none' },
    };
  }

  const p = entryProgress;
  const inner = phaseProgress(p, 0.45, 1);
  return {
    title: motionStyle(phaseProgress(inner, 0, 0.35), {
      y: 12,
      opacity: 0,
      blur: 4,
    }, { y: 0, opacity: 1, blur: 0 }),
    intro: motionStyle(phaseProgress(inner, 0.12, 0.45), {
      y: 10,
      opacity: 0,
      blur: 3,
    }, { y: 0, opacity: 1, blur: 0 }),
    bullets: motionStyle(phaseProgress(inner, 0.22, 0.55), {
      y: 8,
      opacity: 0,
    }, { y: 0, opacity: 1 }),
    tags: motionStyle(phaseProgress(inner, 0.32, 0.65), {
      y: 6,
      opacity: 0,
    }, { y: 0, opacity: 1 }),
  };
}

export function workCaseVisualStyle(settle, caseId, reducedMotion = false) {
  const off = getWorkCaseOffset(caseId);
  if (reducedMotion) {
    return {
      opacity: 1,
      transform: `translate3d(${off.x}px, 0, 0) scale(1) rotate(0deg)`,
    };
  }
  return motionStyle(settle, {
    x: off.x,
    y: off.y,
    scale: 0.965,
    opacity: 0,
    rotate: off.rotate,
  }, {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    rotate: 0,
  });
}

export function workCaseEntryStyle(entryProgress, index, caseId, reducedMotion = false) {
  const off = getWorkCaseOffset(caseId);
  if (reducedMotion) {
    return { opacity: index === 0 ? 1 : 0.5, transform: 'translateY(-50%)' };
  }
  const start = 0.22 + index * 0.1;
  const end = start + 0.16;
  const layer = motionStyle(phaseProgress(entryProgress, start, end), {
    x: off.x * 0.6,
    y: off.y,
    scale: 0.96,
    opacity: 0,
    rotate: off.rotate,
  }, {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 1,
    rotate: 0,
  });
  return {
    ...layer,
    transform: `translateY(-50%) ${layer.transform ?? ''}`,
  };
}

export { measureChapterEntryProgress };
