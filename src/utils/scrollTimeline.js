/**
 * Unified phase-based scroll track model.
 * All homepage sticky sections derive progress from explicit phases — no ad-hoc /n or /(n-1) math.
 */

export function clamp01(v) {
  return Math.max(0, Math.min(1, v ?? 0));
}

/**
 * @typedef {'panel' | 'release' | 'approach' | 'scroll'} TrackPhaseKind
 * @typedef {{ id: string, vh: number, kind?: TrackPhaseKind, index?: number }} TrackPhase
 */

/** Sum of phase vh — total track height (sticky viewport is separate). */
export function trackHeightVhFromPhases(phases) {
  if (!phases?.length) return 100;
  return phases.reduce((sum, p) => sum + (p.vh ?? 0), 0);
}

/** Scrollable distance inside a sticky track (px). */
export function trackScrollablePx(trackHeightPx, viewportHeight) {
  return Math.max(1, trackHeightPx - viewportHeight);
}

/** Traveled scroll within track (px) from sticky rect. */
export function trackTraveledPx(rect, viewportHeight) {
  if (!rect) return 0;
  const scrollable = trackScrollablePx(rect.height, viewportHeight);
  return Math.min(Math.max(-rect.top, 0), scrollable);
}

/**
 * Build phase boundary offsets in px within scrollable range.
 * @param {TrackPhase[]} phases
 * @param {number} scrollablePx
 */
export function phaseBoundariesPx(phases, scrollablePx) {
  const totalVh = trackHeightVhFromPhases(phases);
  if (totalVh <= 0) return [{ phase: phases[0], start: 0, span: scrollablePx }];
  let start = 0;
  return phases.map((phase) => {
    const span = (phase.vh / totalVh) * scrollablePx;
    const entry = { phase, start, span, end: start + span };
    start += span;
    return entry;
  });
}

/**
 * @param {TrackPhase[]} phases
 * @param {number} activePhaseIndex
 * @param {number} phaseProgress
 */
function panelFloatFromPhase(phases, activePhaseIndex, phaseProgress) {
  const active = phases[activePhaseIndex];
  const kind = active?.kind ?? 'panel';

  if (kind === 'approach') {
    return active.index ?? 0;
  }

  if (kind === 'release') {
    const lastPanel = [...phases].reverse().find((p) => p.kind === 'panel');
    return lastPanel?.index ?? Math.max(0, phases.filter((p) => p.kind === 'panel').length - 1);
  }

  if (kind === 'panel') {
    const idx = active.index ?? 0;
    return idx + clamp01(phaseProgress);
  }

  return 0;
}

/**
 * Legacy-compatible capability float (matches scrollTrack.measureTrackFloatIndex with panelCount).
 * @param {number} traveled
 * @param {number} scrollable
 * @param {number} panelCount
 */
export function legacyPanelFloatIndex(traveled, scrollable, panelCount) {
  if (panelCount <= 1) return 0;
  const step = scrollable / panelCount;
  return Math.min(panelCount - 1, traveled / Math.max(1, step));
}

/**
 * Legacy-compatible release progress after last panel stop.
 */
export function legacyReleaseProgress(traveled, scrollable, panelCount) {
  if (panelCount <= 1) return 0;
  const step = scrollable / panelCount;
  const lastPanelTravel = step * (panelCount - 1);
  if (traveled <= lastPanelTravel + 4) return 0;
  return clamp01((traveled - lastPanelTravel) / Math.max(1, scrollable - lastPanelTravel));
}

/**
 * Measure a sticky track from DOM rect + phase config.
 * @param {DOMRect | null | undefined} rect
 * @param {TrackPhase[]} phases
 * @param {number} viewportHeight
 * @param {{ panelCount?: number, legacyPanelIndex?: boolean }} [options]
 */
export function measureTrack(rect, phases, viewportHeight, options = {}) {
  const vh = viewportHeight > 0 ? viewportHeight : 800;
  const scrollable = rect ? trackScrollablePx(rect.height, vh) : 1;
  const traveled = rect ? trackTraveledPx(rect, vh) : 0;
  const trackProgress = clamp01(traveled / scrollable);

  const bounds = phaseBoundariesPx(phases, scrollable);
  let activePhaseIndex = 0;
  let phaseProgress = 0;

  for (let i = 0; i < bounds.length; i++) {
    const b = bounds[i];
    if (traveled < b.end || i === bounds.length - 1) {
      activePhaseIndex = i;
      phaseProgress = b.span > 0 ? clamp01((traveled - b.start) / b.span) : 1;
      break;
    }
  }

  const activePhase = phases[activePhaseIndex] ?? phases[0];
  const panelPhases = phases.filter((p) => p.kind === 'panel' || p.kind === 'approach');
  const releasePhase = phases.find((p) => p.kind === 'release');

  const panelCount = options.panelCount ?? panelPhases.length;
  const floatIndex = options.legacyPanelIndex
    ? legacyPanelFloatIndex(traveled, scrollable, panelCount)
    : panelFloatFromPhase(phases, activePhaseIndex, phaseProgress);

  let activeIndex = 0;
  if (options.legacyPanelIndex) {
    activeIndex = Math.min(panelCount - 1, Math.max(0, Math.round(floatIndex)));
  } else if (activePhase.kind === 'panel' || activePhase.kind === 'approach') {
    activeIndex = activePhase.index ?? 0;
  } else if (activePhase.kind === 'release') {
    const lastPanel = panelPhases[panelPhases.length - 1];
    activeIndex = lastPanel?.index ?? Math.max(0, panelPhases.length - 1);
  }

  let releaseProgress = 0;
  if (releasePhase) {
    const releaseBound = bounds.find((b) => b.phase === releasePhase);
    if (releaseBound && traveled >= releaseBound.start) {
      releaseProgress =
        releaseBound.span > 0
          ? clamp01((traveled - releaseBound.start) / releaseBound.span)
          : 1;
    }
  }

  if (options.legacyPanelIndex && releasePhase) {
    releaseProgress = legacyReleaseProgress(traveled, scrollable, panelCount);
  }

  return {
    trackProgress,
    traveled,
    scrollable,
    activePhaseId: activePhase?.id ?? '',
    activePhaseIndex,
    phaseProgress,
    activeIndex,
    releaseProgress,
    floatIndex,
    phases,
  };
}

/**
 * Window scrollY target for a panel index within a track element.
 * @param {HTMLElement} trackEl
 * @param {TrackPhase[]} phases
 * @param {number} panelIndex
 * @param {number} [viewportHeight]
 */
export function trackScrollTargetY(trackEl, phases, panelIndex, viewportHeight) {
  if (!trackEl) return 0;
  const vh = viewportHeight ?? window.innerHeight;
  const rect = trackEl.getBoundingClientRect();
  const scrollable = trackScrollablePx(trackEl.offsetHeight, vh);
  const panelPhases = phases.filter((p) => p.kind === 'panel' || p.kind === 'approach');
  if (!panelPhases.length) {
    return rect.top + window.scrollY;
  }
  const clamped = Math.min(panelPhases.length - 1, Math.max(0, panelIndex));
  const targetPhase = panelPhases[clamped];
  const bounds = phaseBoundariesPx(phases, scrollable);
  const bound = bounds.find((b) => b.phase === targetPhase);
  const traveled = bound?.start ?? 0;
  return rect.top + window.scrollY + traveled;
}

/** Offset within track for panel index (px). */
export function trackScrollOffset(trackEl, phases, panelIndex, viewportHeight) {
  if (!trackEl) return 0;
  const vh = viewportHeight ?? window.innerHeight;
  const scrollable = trackScrollablePx(trackEl.offsetHeight, vh);
  const panelPhases = phases.filter((p) => p.kind === 'panel' || p.kind === 'approach');
  const clamped = Math.min(panelPhases.length - 1, Math.max(0, panelIndex));
  const targetPhase = panelPhases[clamped];
  const bounds = phaseBoundariesPx(phases, scrollable);
  const bound = bounds.find((b) => b.phase === targetPhase);
  return bound?.start ?? 0;
}
