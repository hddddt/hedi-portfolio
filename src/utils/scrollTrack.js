/**
 * Sticky chapter scroll indexing — each panel gets an equal slice of track height (total / panelCount).
 */

export const TRACK_PANEL_VH = 100;
export const TRACK_RELEASE_VH = 100;

/** Visual lock — within this distance of an integer, panel reads as fully settled. */
export const SCROLL_LOCK_RADIUS = 0.2;

export function easeOutCubic(t) {
  const u = Math.max(0, Math.min(1, t));
  return 1 - (1 - u) ** 3;
}

export function easeInOutCubic(t) {
  const u = Math.max(0, Math.min(1, t));
  return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
}

export function trackHeightVh(panelCount, extraReleaseVh = TRACK_RELEASE_VH) {
  if (panelCount <= 0) return TRACK_PANEL_VH;
  return panelCount * TRACK_PANEL_VH + extraReleaseVh;
}

export function measureTrackFloatIndex(rect, panelCount) {
  if (panelCount <= 1) return 0;
  const vh = window.innerHeight;
  const total = Math.max(1, rect.height - vh);
  const traveled = Math.min(Math.max(-rect.top, 0), total);
  const step = total / panelCount;
  return Math.min(panelCount - 1, traveled / Math.max(1, step));
}

export function trackScrollOffset(trackEl, panelIndex, panelCount) {
  if (!trackEl || panelCount <= 1) return 0;
  const total = Math.max(1, trackEl.offsetHeight - window.innerHeight);
  const step = total / panelCount;
  return panelIndex * step;
}

export function trackScrollTargetY(trackEl, panelIndex, panelCount) {
  if (!trackEl || panelCount <= 1) {
    return trackEl ? trackEl.getBoundingClientRect().top + window.scrollY : window.scrollY;
  }
  const clamped = Math.min(panelCount - 1, Math.max(0, panelIndex));
  return (
    trackEl.getBoundingClientRect().top +
    window.scrollY +
    trackScrollOffset(trackEl, clamped, panelCount)
  );
}

export function scrollTrackToPanel(trackEl, panelIndex, panelCount, behavior = 'auto') {
  if (!trackEl || panelCount <= 1) return;
  const y = trackScrollTargetY(trackEl, panelIndex, panelCount);
  window.scrollTo({ top: y, behavior });
}

export function snapTrackIndex(floatIndex, panelCount) {
  return Math.min(panelCount - 1, Math.max(0, Math.round(floatIndex)));
}

const DEFAULT_TWEEN_MS = 480;

/**
 * RAF scroll tween — moves real scrollY; visuals read from scroll position.
 * @returns {{ tweenTo: Function, cancel: Function, isRunning: () => boolean }}
 */
export function createTrackScrollTween() {
  let rafId = null;
  let running = false;

  const cancel = () => {
    running = false;
    if (rafId != null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  };

  const tweenTo = (targetY, options = {}) => {
    const {
      duration = DEFAULT_TWEEN_MS,
      ease = easeOutCubic,
      onProgress,
      onComplete,
    } = options;

    cancel();
    running = true;
    const startY = window.scrollY;
    const delta = targetY - startY;
    const startTime = performance.now();

    if (Math.abs(delta) < 0.5) {
      const tickInPlace = (now) => {
        if (!running) return;
        const linearP = Math.min(1, (now - startTime) / duration);
        onProgress?.(linearP);
        if (linearP < 1) {
          rafId = requestAnimationFrame(tickInPlace);
        } else {
          window.scrollTo(0, targetY);
          running = false;
          rafId = null;
          onProgress?.(1);
          onComplete?.();
        }
      };
      rafId = requestAnimationFrame(tickInPlace);
      return;
    }

    const tick = (now) => {
      if (!running) return;
      const elapsed = now - startTime;
      const linearP = Math.min(1, elapsed / duration);
      window.scrollTo(0, startY + delta * ease(linearP));
      onProgress?.(linearP);
      if (linearP < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, targetY);
        running = false;
        rafId = null;
        onProgress?.(1);
        onComplete?.();
      }
    };

    rafId = requestAnimationFrame(tick);
  };

  return {
    tweenTo,
    cancel,
    isRunning: () => running,
  };
}
