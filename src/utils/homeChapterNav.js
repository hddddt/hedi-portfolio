/**
 * Scroll-home header nav — direct window scroll + section state sync.
 * Sections listen for HOME_CHAPTER_NAV_EVENT with syncOnly (state only, no second scroll).
 */

import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { homeCapabilities } from '../data/homeScrollChapters.js';
import { povPhases } from './scrollTrackConfigs.js';
import { trackScrollTargetY } from './scrollTimeline.js';
import { createTrackScrollTween, easeOutCubic } from './scrollTrack.js';
import { isMobileHomeMode } from './mobileHomeMode.js';
import {
  resolveWorkChapterEntryScrollY,
  snapWorkCaseScrollY,
  workTrackScrollTargetY,
} from './workChoreography.js';
import { beginChapterTransition, endChapterTransition } from './chapterTransitionLock.js';
import { trackScrollablePx } from './scrollTimeline.js';

export const HOME_CHAPTER_NAV_EVENT = 'home-chapter-nav';

/** Cross-chapter handoff scroll — snappier than in-chapter panel steps. */
const CHAPTER_HANDOFF_TWEEN_MS = 340;

/** In-chapter guide / header nav scroll. */
const CHAPTER_NAV_TWEEN_MS = 480;

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
 * @param {number} [duration]
 * @param {{ forceComplete?: boolean }} [options]
 */
function navScrollTo(top, behavior, onComplete, duration = CHAPTER_NAV_TWEEN_MS, options = {}) {
  const y = Math.max(0, top);
  const current = window.scrollY;
  if (!options.forceComplete && Math.abs(current - y) < 4) {
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
    duration,
    ease: easeOutCubic,
    onComplete: () => {
      scrollWindowTo(y, 'auto');
      onComplete?.();
    },
  });
}

function refreshScrollLayout(defer = true) {
  if (typeof window === 'undefined') return;
  const run = () => {
    try {
      ScrollTrigger.refresh(true);
    } catch {
      /* gsap optional at runtime */
    }
  };
  if (defer && typeof requestIdleCallback === 'function') {
    requestIdleCallback(run, { timeout: 1200 });
    return;
  }
  requestAnimationFrame(run);
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
  return trackScrollTargetY(trackEl, povPhases(panelCount), panelIndex);
}

function resolvePovChapterEntryScrollY(trackEl, beatIndex, beatCount) {
  const vh = window.innerHeight || 800;
  let y = povScrollTargetY(trackEl, beatIndex, beatCount);
  const workTrack = document.getElementById('home-work-strongest');
  if (workTrack instanceof HTMLElement) {
    const rect = workTrack.getBoundingClientRect();
    const scrollable = trackScrollablePx(workTrack.offsetHeight, vh);
    const workEndY = rect.top + window.scrollY + scrollable;
    y = Math.max(y, workEndY + Math.round(vh * 0.02));
  }
  if (y <= window.scrollY + 8) {
    y = window.scrollY + Math.round(vh * 0.15);
  }
  return y;
}

const CHAPTER_TRANSITION_BY_TARGET = {
  'selected-work': 'cap-work',
  'point-of-view': 'work-pov',
};

/**
 * @param {string} targetId
 * @param {number} panelIndex
 * @param {{ handoff?: boolean }} [options]
 * @returns {boolean}
 */
export function performHomeChapterNav(targetId, panelIndex = 0, options = {}) {
  const { handoff = false } = options;
  const behavior = handoff || prefersReducedMotion() ? 'auto' : scrollBehavior();
  const transitionId = CHAPTER_TRANSITION_BY_TARGET[targetId] ?? null;
  if (transitionId) beginChapterTransition(transitionId);

  const finish = (idx) => {
    if (targetId === 'selected-work') {
      const track = document.getElementById('home-work-strongest');
      const count = Math.max(
        1,
        track?.querySelectorAll('.work-narrative__layer').length ?? 1,
      );
      if (track instanceof HTMLElement) {
        scrollWindowTo(snapWorkCaseScrollY(track, idx, count), 'auto');
      }
    }
    dispatchChapterNav(targetId, idx, { syncOnly: true });
    refreshScrollLayout(!handoff);
    if (transitionId) endChapterTransition(transitionId);
  };

  const abort = () => {
    if (transitionId) endChapterTransition(transitionId);
    return false;
  };

  if (targetId === 'capabilities' || targetId === 'point-of-view' || targetId === 'selected-work') {
    dispatchChapterNav(targetId, panelIndex, { prepare: true });
  }

  if (targetId === 'capabilities') {
    const panelCount = homeCapabilities.length;
    const idx = Math.min(panelCount - 1, Math.max(0, panelIndex));

    if (isMobileHomeMode()) {
      const section = document.getElementById('capabilities');
      if (!section) {
        console.warn('[homeChapterNav] Missing #capabilities section');
        return false;
      }
      const headerClearance = Math.max(56, Math.round(window.innerHeight * 0.06));
      const y = section.getBoundingClientRect().top + window.scrollY - headerClearance;
      navScrollTween?.cancel();
      navScrollTo(y, behavior, () => finish(idx));
      return true;
    }

    const track = resolveCapTrack();
    if (!(track instanceof HTMLElement)) {
      const section = document.getElementById('capabilities');
      if (section) {
        const headerClearance = Math.max(56, Math.round(window.innerHeight * 0.06));
        const y = section.getBoundingClientRect().top + window.scrollY - headerClearance;
        navScrollTween?.cancel();
        navScrollTo(y, behavior, () => finish(idx));
        return true;
      }
      console.warn('[homeChapterNav] Missing capability scroll track');
      return false;
    }

    const count = Math.max(
      panelCount,
      track.querySelectorAll('.capability-scroll__snap').length || panelCount,
    );
    const y = trackScrollTargetY(track, idx, count);
    navScrollTween?.cancel();
    navScrollTo(y, behavior, () => finish(idx));
    return true;
  }

  if (targetId === 'selected-work') {
    const track = document.getElementById('home-work-strongest');
    if (!(track instanceof HTMLElement)) {
      console.warn('[homeChapterNav] Missing #home-work-strongest');
      return abort();
    }
    const count = Math.max(1, track.querySelectorAll('.work-narrative__layer').length);
    const idx = Math.min(count - 1, Math.max(0, panelIndex));
    const y = resolveWorkChapterEntryScrollY(track, idx, count);
    navScrollTo(
      y,
      behavior,
      () => finish(idx),
      handoff ? 0 : CHAPTER_HANDOFF_TWEEN_MS,
      { forceComplete: handoff },
    );
    return true;
  }

  if (targetId === 'point-of-view') {
    const track = resolvePovTrack();
    if (!(track instanceof HTMLElement)) {
      console.warn('[homeChapterNav] Missing POV scroll track');
      return abort();
    }
    const n = Math.max(1, track.querySelectorAll('.pov-scroll__snap').length);
    const idx = Math.min(n - 1, Math.max(0, panelIndex));
    const y = resolvePovChapterEntryScrollY(track, idx, n);
    navScrollTo(y, behavior, () => finish(idx), CHAPTER_HANDOFF_TWEEN_MS);
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
