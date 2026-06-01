import {
  clamp01,
  measureStickyTrackProgress,
  motionStyle,
  phaseProgress,
  smoothstep,
} from './scrollMotion.js';

/** First five archive browse cards — staggered gather offsets. */
export const ARCHIVE_FRAGMENT_OFFSETS = [
  { x: -24, y: 16, rotate: -0.8 },
  { x: 18, y: -12, rotate: 0.6 },
  { x: -10, y: 24, rotate: -0.4 },
  { x: 20, y: 14, rotate: 0.7 },
  { x: -16, y: -8, rotate: -0.5 },
];

const POV_EXIT_START = 0.92;
const HANDOFF_START_VH = 0.94;
const HANDOFF_END_VH = 0.14;
const ARCHIVE_ENTER_START_VH = 0.88;
const ARCHIVE_ENTER_END_VH = 0.12;
/** Once chapter top passes this line, path + archive copy stay fully visible (latched). */
const ARCHIVE_CONTENT_LATCH_VH = 0.46;

/**
 * Progress through POV sticky track (0 = pin start, 1 = end).
 * @param {DOMRect} povScrollRect
 */
export function measurePovTrackProgress(povScrollRect) {
  return measureStickyTrackProgress(povScrollRect);
}

/** Final ~8% of POV scroll — fade only in handoff corridor after design-close. */
export function measurePovExitProgress(povTrackProgress) {
  return phaseProgress(povTrackProgress, POV_EXIT_START, 1);
}

/**
 * Unified 04→05 handoff: 0 while POV dominates, 1 when archive entrance has settled.
 * @param {DOMRect} povScrollRect
 * @param {DOMRect} archiveChapterRect
 * @param {number} vh
 */
export function measurePovArchiveHandoff(povScrollRect, archiveChapterRect, vh) {
  const povTrack = measurePovTrackProgress(povScrollRect);
  const povExit = measurePovExitProgress(povTrack);

  let corridor = 0;
  if (archiveChapterRect.top < vh * HANDOFF_START_VH) {
    corridor = smoothstep(vh * HANDOFF_END_VH, vh * HANDOFF_START_VH, archiveChapterRect.top);
  }

  let archiveEnter = 0;
  if (archiveChapterRect.top < vh * ARCHIVE_ENTER_START_VH) {
    archiveEnter = smoothstep(
      vh * ARCHIVE_ENTER_END_VH,
      vh * ARCHIVE_ENTER_START_VH,
      archiveChapterRect.top,
    );
  }

  /* smoothstep peaks mid-entrance then drops when top < END — latch so path + archive stay readable */
  if (archiveChapterRect.top <= vh * ARCHIVE_CONTENT_LATCH_VH) {
    corridor = 1;
    archiveEnter = 1;
  }

  return clamp01(Math.max(corridor * 0.85, archiveEnter, povExit * 0.35));
}

/** Sphere crossfade: 0 = POV (blue dominant), 1 = archive (yellow dominant). */
export function measureOrbHandoffBlend(handoff) {
  return smoothstep(0.12, 0.72, handoff);
}

/**
 * @param {number} exitProgress 0–1
 * @param {boolean} reducedMotion
 */
export function povExitLayers(exitProgress, reducedMotion = false) {
  if (reducedMotion || exitProgress <= 0.001) {
    return {
      stage: { opacity: 1, transform: 'none', filter: undefined },
      atmosphere: { opacity: 1 },
      zLift: 0,
    };
  }
  const p = clamp01(exitProgress);
  const y = -mixRange(p, 0, 48);
  const opacity = mixRange(p, 1, 0.2);
  const blueDim = mixRange(p, 1, 0.35);
  return {
    stage: {
      opacity,
      transform: `translate3d(0, ${y}px, 0)`,
      filter: undefined,
      willChange: p < 0.99 ? 'transform, opacity' : undefined,
    },
    atmosphere: { opacity: blueDim },
    zLift: p,
  };
}

function mixRange(p, from, to) {
  return from + (to - from) * p;
}

/** Path part (05 · first) — quick reveal, no ghosting on entry */
export function pathPartReveal(handoff) {
  const p = clamp01(handoff);
  if (p >= 0.92) return 1;
  return smoothstep(0.04, 0.36, p);
}

export function pathKickerStyle(handoff, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none', filter: undefined };
  const r = pathPartReveal(handoff);
  return motionStyle(phaseProgress(r, 0, 0.18), { y: 7, opacity: 0.96 }, { y: 0, opacity: 1, blur: 0 });
}

export function pathBlockStyle(handoff, blockIndex, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };
  const r = pathPartReveal(handoff);
  const starts = [0.06, 0.14, 0.26, 0.44];
  const start = starts[blockIndex] ?? 0;
  return motionStyle(phaseProgress(r, start, start + 0.14), { y: 3, opacity: 0.98 }, { y: 0, opacity: 1 });
}

/**
 * Per-line micro entrance — staggered within each path block.
 */
export function pathLineStyle(handoff, blockIndex, lineIndex, reducedMotion = false) {
  if (reducedMotion) return {};
  const r = pathPartReveal(handoff);
  const blockStarts = [0, 0.1, 0.24, 0.42];
  const start = (blockStarts[blockIndex] ?? 0) + lineIndex * 0.014;
  const end = Math.min(0.96, start + 0.09);
  return motionStyle(phaseProgress(r, start, end), { y: 5, opacity: 0.94 }, { y: 0, opacity: 1 });
}

export function pathPortraitStyle(handoff, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none', filter: undefined };
  const r = pathPartReveal(handoff);
  return motionStyle(phaseProgress(r, 0.38, 0.58), {
    y: 8,
    scale: 0.984,
    opacity: 0.94,
  }, { y: 0, scale: 1, opacity: 1, blur: 0 });
}

export function pathDividerStyle(handoff, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };
  const r = pathPartReveal(handoff);
  return motionStyle(phaseProgress(r, 0.52, 0.68), { scaleX: 0.72, opacity: 0 }, {
    scaleX: 1,
    opacity: 1,
  });
}

/**
 * Beyond the Work / Life Archive entrance layers.
 * @param {number} handoff 0–1 spring-smoothed
 * @param {boolean} reducedMotion
 */
export function beyondWorkEntranceLayers(handoff, reducedMotion = false) {
  if (reducedMotion) {
    return {
      atmosphere: { opacity: 1 },
      pathLead: { opacity: 1, transform: 'none', filter: undefined },
      archiveTitle: { opacity: 1, transform: 'none', filter: undefined },
      archiveSubtitle: { opacity: 1, transform: 'none' },
      instruction: { opacity: 1, transform: 'none' },
      guide: { opacity: 1, transform: 'none' },
      scrollHint: { opacity: 1, transform: 'none' },
      fieldWrap: { opacity: 1, transform: 'none' },
    };
  }

  const p = clamp01(handoff);
  const pathReveal = pathPartReveal(p);
  const atmosphere = { opacity: 0.62 + pathReveal * 0.38 };

  const pathLead = pathKickerStyle(p, false);

  const archiveTitle = motionStyle(phaseProgress(p, 0.44, 0.62), {
    y: 14,
    scale: 0.99,
    opacity: 0,
    blur: 4,
  }, { y: 0, scale: 1, opacity: 1, blur: 0 });

  const archiveSubtitle = motionStyle(phaseProgress(p, 0.5, 0.66), {
    y: 10,
    opacity: 0,
    blur: 2,
  }, { y: 0, opacity: 1, blur: 0 });

  const fieldWrap = motionStyle(phaseProgress(p, 0.56, 0.72), {
    y: 10,
    opacity: 0,
    scale: 0.992,
  }, { y: 0, opacity: 1, scale: 1 });

  const instruction = motionStyle(phaseProgress(p, 0.74, 0.88), {
    y: 8,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  const guide = motionStyle(phaseProgress(p, 0.7, 0.84), {
    y: 6,
    opacity: 0,
    scale: 0.98,
  }, { y: 0, opacity: 1, scale: 1 });

  const scrollHint = motionStyle(phaseProgress(p, 0.8, 0.94), {
    y: 5,
    opacity: 0,
  }, { y: 0, opacity: 1 });

  return {
    atmosphere,
    pathLead,
    archiveTitle,
    archiveSubtitle,
    instruction,
    guide,
    scrollHint,
    fieldWrap,
  };
}

/**
 * Staggered gather for path blocks or archive photo cards.
 * @param {number} handoff
 * @param {number} index 0-based (0–4 use preset offsets)
 * @param {number} total
 * @param {boolean} reducedMotion
 */
export function archiveFragmentStyle(handoff, index, total, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };

  const offsets = ARCHIVE_FRAGMENT_OFFSETS[index] ?? {
    x: (index % 2 === 0 ? -1 : 1) * 12,
    y: (index % 3) * 8,
    rotate: (index % 2 === 0 ? -0.3 : 0.3),
  };

  const stagger = index / Math.max(1, total - 1);
  const start = 0.4 + stagger * 0.22;
  const end = Math.min(0.92, start + 0.16);
  const p = phaseProgress(handoff, start, end);

  return motionStyle(p, {
    x: offsets.x,
    y: offsets.y,
    rotate: offsets.rotate,
    scale: 0.94,
    opacity: 0,
  }, { x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 });
}

/** Remaining archive cards after the first five — settle phase (65–100%). */
export function archiveFragmentSettleStyle(handoff, index, total, reducedMotion = false) {
  if (reducedMotion) return { opacity: 1, transform: 'none' };
  const stagger = index / Math.max(1, total - 1);
  const start = 0.65 + stagger * 0.22;
  const end = Math.min(0.98, start + 0.12);
  return motionStyle(phaseProgress(handoff, start, end), {
    y: 10,
    scale: 0.97,
    opacity: 0,
  }, { y: 0, scale: 1, opacity: 1 });
}

/** Path narrative blocks — line-level stagger (path part only). */
export function pathFragmentStyle(handoff, index, total, reducedMotion = false) {
  return pathBlockStyle(handoff, Math.min(3, index), reducedMotion);
}
