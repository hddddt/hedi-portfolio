/**
 * Scroll-home header nav — direct window scroll + section state sync.
 * Sections listen for HOME_CHAPTER_NAV_EVENT with syncOnly (state only, no second scroll).
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { createTrackScrollTween, trackScrollTargetY } from './scrollTrack.js';
import { workTrackScrollTargetY } from './workChoreography.js';

export const HOME_CHAPTER_NAV_EVENT = 'home-chapter-nav';

/** @type {ReturnType<typeof createTrackScrollTween> | null} */
let navScrollTween = null;

/**
 * @param {string} targetId
 * @param {number} [panelIndex]
 * @param {{ syncOnly?: boolean }} [options]
 */
export function dispatchChapterNav(targetId, panelIndex = 0, options = {}) {
  window.dispatchEvent(
    new CustomEvent(HOME_CHAPTER_NAV_EVENT, {
      detail: {
        targetId,
        panelIndex,
        syncOnly: Boolean(options.syncOnly),
        prepare: Boolean(options.prepare),
      },
    }),
  );
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollBehavior() {
  return prefersReducedMotion() ? 'auto' : 'smooth';
}

function scrollWindowTo(top, behavior) {
  const y = Math.max(0, top);
  window.scrollTo({ top: y, left: 0, behavior });
  const root = document.scrollingElement ?? document.documentElement;
  if (root && Math.abs(root.scrollTop - y) > 2) {
    root.scrollTop = y;
  }
}

/**
 * @param {number} top
 * @param {'auto' | 'smooth'} behavior
 * @param {() => void} [onComplete]
 */
function navScrollTo(top, behavior, onComplete) {
  const y = Math.max(0, top);
  const current = window.scrollY;
  if (Math.abs(current - y) < 4) {
    onComplete?.();
    return;
  }

  if (behavior === 'auto' || prefersReducedMotion()) {
    scrollWindowTo(y, 'auto');
    onComplete?.();
    return;
  }

  if (!navScrollTween) {
    navScrollTween = createTrackScrollTween();
  }
  navScrollTween.cancel();
  navScrollTween.tweenTo(y, {
    duration: 520,
    onComplete: () => {
      scrollWindowTo(y, 'auto');
      onComplete?.();
    },
  });
}

function refreshScrollLayout() {
  if (typeof window === 'undefined') return;
  requestAnimationFrame(() => {
    try {
      ScrollTrigger.refresh(true);
    } catch {
      /* gsap optional at runtime */
    }
  });
}

function resolveCapTrack() {
  return (
    document.querySelector('#capabilities .capability-scroll') ??
    document.querySelector('[data-narrative-chapter="home-capabilities"] .capability-scroll') ??
    document.querySelector('.cap-dial-chapter .capability-scroll') ??
    document.querySelector('.capability-scroll')
  );
}

function resolvePovTrack() {
  return (
    document.querySelector('#point-of-view .pov-scroll') ??
    document.querySelector('[data-narrative-chapter="home-approach"] .pov-scroll') ??
    document.querySelector('.home-pov .pov-scroll')
  );
}

/**
 * @param {HTMLElement} trackEl
 * @param {number} panelIndex
 * @param {number} panelCount
 */
function povScrollTargetY(trackEl, panelIndex, panelCount) {
  const vh = window.innerHeight;
  const total = Math.max(1, trackEl.offsetHeight - vh);
  const n = Math.max(1, panelCount);
  const idx = Math.min(n - 1, Math.max(0, panelIndex));
  const traveled = n <= 1 ? 0 : (idx / (n - 1)) * total;
  return trackEl.getBoundingClientRect().top + window.scrollY + traveled;
}

/**
 * @param {string} targetId
 * @param {number} panelIndex
 * @returns {boolean}
 */
export function performHomeChapterNav(targetId, panelIndex = 0) {
  const behavior = scrollBehavior();

  const finish = (idx) => {
    dispatchChapterNav(targetId, idx, { syncOnly: true });
    refreshScrollLayout();
  };

  if (targetId === 'capabilities' || targetId === 'point-of-view') {
    dispatchChapterNav(targetId, panelIndex, { prepare: true });
  }

  if (targetId === 'capabilities') {
    const track = resolveCapTrack();
    if (!(track instanceof HTMLElement)) {
      console.warn('[homeChapterNav] Missing capability scroll track');
      return false;
    }
    const count = Math.max(
      1,
      track.querySelectorAll('.capability-scroll__snap').length ||
        document.querySelectorAll('#capabilities .capability-scroll__snap').length,
    );
    const idx = Math.min(count - 1, Math.max(0, panelIndex));
    const y = trackScrollTargetY(track, idx, count);
    navScrollTween?.cancel();
    navScrollTo(y, behavior, () => finish(idx));
    return true;
  }

  if (targetId === 'selected-work') {
    const track = document.getElementById('home-work-strongest');
    if (!(track instanceof HTMLElement)) {
      console.warn('[homeChapterNav] Missing #home-work-strongest');
      return false;
    }
    const count = Math.max(1, track.querySelectorAll('.work-narrative__layer').length);
    const idx = Math.min(count - 1, Math.max(0, panelIndex));
    const y = workTrackScrollTargetY(track, idx, count);
    navScrollTo(y, behavior, () => finish(idx));
    return true;
  }

  if (targetId === 'point-of-view') {
    const track = resolvePovTrack();
    if (!(track instanceof HTMLElement)) {
      console.warn('[homeChapterNav] Missing POV scroll track');
      return false;
    }
    const n = Math.max(1, track.querySelectorAll('.pov-scroll__snap').length);
    const idx = Math.min(n - 1, Math.max(0, panelIndex));
    const y = povScrollTargetY(track, idx, n);
    navScrollTo(y, behavior, () => finish(idx));
    return true;
  }

  if (targetId === 'me') {
    const target =
      document.getElementById('home-beyond-path') ?? document.getElementById('me');
    if (!target) {
      console.warn('[homeChapterNav] Missing #home-beyond-path / #me');
      return false;
    }
    const headerClearance = Math.max(56, Math.round(window.innerHeight * 0.06));
    const y = target.getBoundingClientRect().top + window.scrollY - headerClearance;
    navScrollTo(y, behavior, () => finish(0));
    return true;
  }

  return false;
}

/**
 * @param {string} targetId
 * @param {number} [panelIndex]
 */
export function scrollHomeChapterNav(targetId, panelIndex = 0) {
  performHomeChapterNav(targetId, panelIndex);
}
