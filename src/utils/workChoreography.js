import { measureChapterEntryProgress, motionStyle, phaseProgress } from './scrollMotion.js';
import {
  getVisualFloatIndex,
  lerp,
} from './scrollStateMachine.js';
import {
  SCROLL_LOCK_RADIUS,
  TRACK_PANEL_VH,
  TRACK_RELEASE_VH,
} from './scrollTrack.js';

export { getVisualFloatIndex };

const INDEX_LOCK_EPSILON = SCROLL_LOCK_RADIUS;

/** Scroll budget after pin before case index advances — triptych settles on case 1 first. */
export const WORK_TRACK_LEAD_IN_VH = 55;

/** Vertical spacing on the center spine — sync with `--work-step-vh` in CSS. */
export const WORK_VISUAL_STEP_VH = 40;

/** Deck motion — active card lift at rest (px / scale / depth). */
export const WORK_DECK = {
  liftPx: 10,
  liftScale: 0.012,
  liftZPx: 12,
  adjacentTiltDeg: 1.2,
  adjacentScale: 0.94,
};

/** How many case cards peek above/below the center spine. */
export const WORK_CANVAS_BAND = 1.15;

export const WORK_PHASE = {
  holdEnd: 0.24,
  exitEnd: 0.4,
  enterStart: 0.48,
  enterEnd: 0.74,
  stageSwitchAt: 0.5,
};

export function workPanelDistance(rawFloatIndex, panelIndex) {
  return panelIndex - (rawFloatIndex ?? 0);
}

function workTrackMetricsFromRect(rect) {
  const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
  const total = Math.max(1, rect.height - vh);
  const leadIn = (WORK_TRACK_LEAD_IN_VH / 100) * vh;
  const caseTravel = Math.max(1, total - leadIn);
  return { vh, total, leadIn, caseTravel };
}

export function workTrackHeightVh(panelCount, extraReleaseVh = TRACK_RELEASE_VH) {
  if (panelCount <= 0) return TRACK_PANEL_VH;
  return WORK_TRACK_LEAD_IN_VH + panelCount * TRACK_PANEL_VH + extraReleaseVh;
}

export function measureWorkFloatIndex(rect, panelCount) {
  if (panelCount <= 1) return 0;
  const { total, leadIn, caseTravel } = workTrackMetricsFromRect(rect);
  const traveled = Math.min(Math.max(-rect.top, 0), total);
  if (traveled <= leadIn) return 0;
  const step = caseTravel / panelCount;
  return Math.min(panelCount - 1, (traveled - leadIn) / Math.max(1, step));
}

export function workTrackScrollOffset(trackEl, panelIndex, panelCount) {
  if (!trackEl || panelCount <= 1) return 0;
  const vh = window.innerHeight;
  const total = Math.max(1, trackEl.offsetHeight - vh);
  const leadIn = (WORK_TRACK_LEAD_IN_VH / 100) * vh;
  const caseTravel = Math.max(1, total - leadIn);
  const step = caseTravel / panelCount;
  const clamped = Math.min(panelCount - 1, Math.max(0, panelIndex));
  if (clamped === 0) return 0;
  return leadIn + clamped * step;
}

export function workTrackScrollTargetY(trackEl, panelIndex, panelCount) {
  if (!trackEl || panelCount <= 1) {
    return trackEl ? trackEl.getBoundingClientRect().top + window.scrollY : window.scrollY;
  }
  const clamped = Math.min(panelCount - 1, Math.max(0, panelIndex));
  return (
    trackEl.getBoundingClientRect().top +
    window.scrollY +
    workTrackScrollOffset(trackEl, clamped, panelCount)
  );
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
  if (Math.abs(v - nearest) < SCROLL_LOCK_RADIUS) {
    const locked = Math.min(maxIdx, Math.max(0, nearest));
    return { from: locked, to: locked, t: 0, locked, stage: locked };
  }
  const from = Math.floor(v);
  const to = Math.min(maxIdx, from + 1);
  const t = v - from;
  const stage = t < WORK_PHASE.stageSwitchAt ? from : to;
  return { from, to, t, locked: null, stage };
}

/** Accent / glow — settled case index. */
export function workStageIndex(rawFloatIndex, panelCount) {
  if (panelCount <= 1) return 0;
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  if (ctx.locked != null) return ctx.locked;
  return ctx.t < WORK_PHASE.exitEnd ? ctx.from : ctx.to;
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
    return lerp(1, 0.88, absDist / 0.35);
  }
  if (absDist <= 1.15) {
    const base = lerp(0.88, 0.42, (absDist - 0.35) / 0.8);
    /* Next case below the active card — keep a readable dim preview while scrolling */
    if (dist > 0 && absDist <= 1.08) return Math.max(base, 0.46);
    return base;
  }
  if (absDist <= WORK_CANVAS_BAND) {
    return lerp(0.42, 0.16, (absDist - 1.15) / (WORK_CANVAS_BAND - 1.15));
  }
  return 0;
}

function spineBlur(absDist) {
  if (absDist < 0.2) return 0;
  return Math.min(1.1, absDist * 0.8);
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
  return ctx.t < WORK_PHASE.exitEnd ? ctx.from : ctx.to;
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
  const blur = spineBlur(absDist);
  const scale = spineScale(absDist);
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);
  const isLockedActive = ctx.locked === panelIndex;
  const { liftY, scaleExtra, liftZ } = deckLift(absDist, isLockedActive);
  const tiltX = deckTilt(dist, absDist);
  const yFinal = yPx + liftY;
  const scaleFinal = scale + scaleExtra;
  const zIndex =
    absDist < 0.38 ? 44 : dist > 0 && absDist <= 1.05 ? 38 - Math.round(absDist * 6) : 40 - Math.round(absDist * 9);

  return {
    opacity,
    filter: blur > 0.12 ? `blur(${blur.toFixed(2)}px)` : undefined,
    transform: `translate3d(-50%, calc(-50% + ${yFinal.toFixed(2)}px), ${liftZ.toFixed(1)}px) scale(${scaleFinal.toFixed(4)}) rotateX(${tiltX.toFixed(2)}deg)`,
    visibility: opacity > 0.05 ? 'visible' : 'hidden',
    pointerEvents: absDist < 0.4 ? 'auto' : 'none',
    zIndex,
  };
}

export function workRailOnesFlipStyle(rawFloatIndex, digitIndex, panelCount) {
  const ctx = getWorkTransitionContext(rawFloatIndex, panelCount);

  if (ctx.locked != null) {
    const on = digitIndex === ctx.locked;
    return {
      opacity: on ? 1 : 0,
      transform: on ? 'translate3d(0, 0, 0) rotateX(0deg)' : 'translate3d(0, 10px, 0) rotateX(-48deg)',
      visibility: on ? 'visible' : 'hidden',
    };
  }

  if (digitIndex === ctx.from) {
    if (ctx.t >= WORK_PHASE.exitEnd) {
      return { opacity: 0, visibility: 'hidden', transform: 'translate3d(0, -12px, 0) rotateX(48deg)' };
    }
    const u = ctx.t < WORK_PHASE.holdEnd
      ? 0
      : (ctx.t - WORK_PHASE.holdEnd) / (WORK_PHASE.exitEnd - WORK_PHASE.holdEnd);
    return {
      opacity: lerp(1, 0, u),
      transform: `translate3d(0, ${lerp(0, -14, u).toFixed(2)}px, 0) rotateX(${lerp(0, 52, u).toFixed(2)}deg)`,
      visibility: u < 0.98 ? 'visible' : 'hidden',
    };
  }

  if (digitIndex === ctx.to) {
    if (ctx.t < WORK_PHASE.enterStart) {
      return { opacity: 0, visibility: 'hidden', transform: 'translate3d(0, 14px, 0) rotateX(-52deg)' };
    }
    const u = Math.min(1, (ctx.t - WORK_PHASE.enterStart) / (WORK_PHASE.enterEnd - WORK_PHASE.enterStart));
    return {
      opacity: lerp(0, 1, u),
      transform: `translate3d(0, ${lerp(14, 0, u).toFixed(2)}px, 0) rotateX(${lerp(-52, 0, u).toFixed(2)}deg)`,
      visibility: u > 0.02 ? 'visible' : 'hidden',
    };
  }

  return { opacity: 0, visibility: 'hidden', transform: 'none' };
}

function workOutgoingCopy(t, part = 'title') {
  if (t < WORK_PHASE.holdEnd) {
    return { opacity: 1, y: 0, pointerEvents: true, zIndex: 20 };
  }
  if (t >= WORK_PHASE.exitEnd) {
      return { opacity: 0, y: -8, pointerEvents: false, zIndex: 0 };
  }
  const u = (t - WORK_PHASE.holdEnd) / (WORK_PHASE.exitEnd - WORK_PHASE.holdEnd);
  const opacity = lerp(1, 0, u);
  const partFade = part === 'title' ? 1 : Math.max(0, 1 - u * 1.15);
  return {
    opacity: opacity * partFade,
    y: lerp(0, -8, u),
    pointerEvents: false,
    zIndex: 12,
  };
}

function workIncomingCopy(t, part = 'title') {
  let partDelay = 0;
  if (part === 'intro') partDelay = 0.05;
  if (part === 'bullets') partDelay = 0.09;
  if (part === 'tags') partDelay = 0.13;

  if (t < WORK_PHASE.enterStart + partDelay) {
    return { opacity: 0, y: 10, pointerEvents: false, zIndex: 0 };
  }
  if (t >= WORK_PHASE.enterEnd) {
    return { opacity: 1, y: 0, pointerEvents: true, zIndex: 20 };
  }
  const u = Math.min(
    1,
    (t - WORK_PHASE.enterStart - partDelay) / Math.max(0.1, WORK_PHASE.enterEnd - WORK_PHASE.enterStart - partDelay),
  );
  return {
    opacity: lerp(0, 1, u),
    y: lerp(10, 0, u),
    pointerEvents: u > 0.55,
    zIndex: 14,
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
        ? workOutgoingCopy(ctx.t, part)
        : role === 'incoming'
          ? workIncomingCopy(ctx.t, part)
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

export function workFrameEntryStyle(entryProgress, reducedMotion = false) {
  if (reducedMotion) {
    return { opacity: 1, transform: 'none', filter: undefined };
  }
  const p = entryProgress;
  return motionStyle(phaseProgress(p, 0.08, 0.55), {
    y: 20,
    scale: 0.985,
    opacity: 0,
    blur: 2,
  }, { y: 0, scale: 1, opacity: 1, blur: 0 });
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
