/**
 * Low-performance / mobile-friendly rendering hints for scroll-heavy layers.
 */

let cachedLowPerf = null;

export function prefersReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function connectionSaveData() {
  if (typeof navigator === 'undefined') return false;
  return navigator.connection?.saveData === true;
}

/** Heuristic: mobile, save-data, low RAM / cores, or coarse pointer without hover. */
export function isLowPerformanceMode() {
  if (cachedLowPerf != null) return cachedLowPerf;
  if (typeof window === 'undefined') {
    cachedLowPerf = false;
    return false;
  }
  if (prefersReducedMotion()) {
    cachedLowPerf = true;
    return true;
  }
  if (connectionSaveData()) {
    cachedLowPerf = true;
    return true;
  }

  const ua = navigator.userAgent ?? '';
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const noHover = window.matchMedia('(hover: none)').matches;
  const deviceMemory = navigator.deviceMemory ?? 0;
  const cores = navigator.hardwareConcurrency ?? 0;
  const lowMemory = deviceMemory > 0 && deviceMemory <= 4;
  const lowCores = cores > 0 && cores <= 4;

  cachedLowPerf = isMobile || lowMemory || lowCores || (coarse && noHover);
  return cachedLowPerf;
}

/** Cap WebGL DPR on phones / low-end laptops to reduce GPU memory. */
export function maxFieldDevicePixelRatio() {
  if (isLowPerformanceMode()) return 1;
  return 2;
}

/** Warm an image decode off the critical scroll path. */
export function preloadImage(src) {
  if (!src || typeof Image === 'undefined') return;
  const img = new Image();
  img.decoding = 'async';
  img.src = src;
}

export function applyScrollPerformanceRootAttrs(root) {
  if (!root) return;
  if (isLowPerformanceMode()) {
    root.dataset.scrollPerf = 'low';
  } else {
    delete root.dataset.scrollPerf;
  }
  if (prefersReducedMotion()) {
    root.dataset.reducedMotion = 'true';
  } else {
    delete root.dataset.reducedMotion;
  }
}
