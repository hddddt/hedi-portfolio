/** @typedef {{ type: 'section' | 'case' | 'capability', id: string }} GuideDestination */

import { homeCapabilities } from '../data/homeScrollChapters.js';
import {
  dispatchChapterNav,
  HOME_CHAPTER_NAV_EVENT,
  performHomeChapterNav,
} from './homeChapterNav.js';
import { isMobileHomeMode } from './mobileHomeMode.js';

const ACTIVE_HIGHLIGHT_MS = 1800;

export { HOME_CHAPTER_NAV_EVENT, dispatchChapterNav };

/** Logical guide target → DOM element id (1:1 on scroll-home prototype). */
export const GUIDE_TARGET_DOM_ID = {
  capabilities: 'capabilities',
  'selected-work': 'selected-work',
  'point-of-view': 'point-of-view',
  me: 'me',
  'life-archive': 'home-beyond-archive',
  'case-01': 'case-01',
  'case-02': 'case-02',
  'case-03': 'case-03',
  'case-04': 'case-04',
};

/**
 * @param {string} targetId
 * @returns {HTMLElement | null}
 */
export function resolveGuideTargetElement(targetId) {
  if (!targetId) return null;
  const domId = GUIDE_TARGET_DOM_ID[targetId] ?? targetId;
  return document.getElementById(domId);
}

/**
 * @param {GuideDestination | null | undefined} action
 * @returns {string | null}
 */
export function actionToTargetId(action) {
  if (!action) return null;

  if (action.type === 'section') {
    if (action.id === 'home-capabilities') return 'capabilities';
    if (action.id === 'home-work-narrative') return 'selected-work';
    if (action.id === 'home-approach') return 'point-of-view';
    if (action.id === 'home-life-archive') return 'me';
    if (action.id === 'home-beyond-archive') return 'life-archive';
    return null;
  }

  if (action.type === 'case') {
    const match = String(action.id).match(/case0?(\d+)/i);
    if (match) return `case-0${match[1]}`;
    return 'selected-work';
  }

  if (action.type === 'capability') {
    return 'capabilities';
  }

  return null;
}

/**
 * @param {GuideDestination | null | undefined} action
 */
export function scrollToGuideAction(action) {
  if (!action) return;

  if (action.type === 'capability') {
    const panelIndex = homeCapabilities.findIndex((c) => c.id === action.id);
    scrollCapabilityToPanel(panelIndex >= 0 ? panelIndex : 0);
    window.setTimeout(() => activateGuideTarget('capabilities'), 480);
    return;
  }

  const targetId = actionToTargetId(action);
  if (targetId) scrollToGuideTarget(targetId);
}

/**
 * @param {string} targetId
 * @returns {string | null}
 */
export function caseTargetToCaseId(targetId) {
  const match = String(targetId).match(/^case-0?(\d+)$/i);
  return match ? `case0${match[1]}` : null;
}

/**
 * @param {string} caseId
 * @returns {number}
 */
export function caseIdToPanelIndex(caseId) {
  const match = String(caseId).match(/case0?(\d+)/i);
  if (!match) return 0;
  return Math.max(0, parseInt(match[1], 10) - 1);
}

function scrollMobileToElement(el, block = 'start') {
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block });
}

function scrollMobileCapabilityToPanel(panelIndex = 0) {
  const cap = homeCapabilities[panelIndex];
  if (!cap) {
    scrollMobileToElement(resolveGuideTargetElement('capabilities'));
    return;
  }
  const panel = document.querySelector(`[data-cap-id="${cap.id}"]`);
  scrollMobileToElement(panel ?? resolveGuideTargetElement('capabilities'));
}

function scrollMobileGuideTarget(targetId) {
  const el = resolveGuideTargetElement(targetId);
  scrollMobileToElement(el);
}

function scrollCapabilityToPanel(panelIndex = 0) {
  if (isMobileHomeMode()) {
    scrollMobileCapabilityToPanel(panelIndex);
    window.setTimeout(() => activateGuideTarget('capabilities'), 320);
    return;
  }
  performHomeChapterNav('capabilities', panelIndex);
}

function scrollWorkToPanel(panelIndex = 0) {
  if (isMobileHomeMode()) {
    const caseId = `case-0${panelIndex + 1}`;
    scrollMobileGuideTarget(caseId);
    window.setTimeout(() => activateGuideTarget(caseId), 320);
    return;
  }
  performHomeChapterNav('selected-work', panelIndex);
}

function scrollPovToPanel(panelIndex = 0) {
  if (isMobileHomeMode()) {
    scrollMobileGuideTarget('point-of-view');
    window.setTimeout(() => activateGuideTarget('point-of-view'), 320);
    return;
  }
  performHomeChapterNav('point-of-view', panelIndex);
}

function scrollMeChapter() {
  if (isMobileHomeMode()) {
    scrollMobileGuideTarget('me');
    window.setTimeout(() => activateGuideTarget('me'), 320);
    return;
  }
  performHomeChapterNav('me', 0);
}

/**
 * Sync work carousel UI after programmatic scroll (no second scroll).
 * @param {string} caseId
 * @param {number} panelIndex
 */
export function syncWorkCaseFromGuide(caseId, panelIndex) {
  const idx =
    typeof panelIndex === 'number' && panelIndex >= 0
      ? panelIndex
      : caseIdToPanelIndex(caseId);
  if (isMobileHomeMode()) {
    scrollMobileGuideTarget(`case-0${idx + 1}`);
    return;
  }
  performHomeChapterNav('selected-work', idx);
}

/**
 * @param {string} targetId
 */
export function scrollToGuideTarget(targetId) {
  const caseId = caseTargetToCaseId(targetId);

  if (isMobileHomeMode()) {
    if (caseId) {
      scrollMobileGuideTarget(targetId);
      window.setTimeout(() => activateGuideTarget(targetId), 320);
      return;
    }
    scrollMobileGuideTarget(targetId);
    window.setTimeout(() => activateGuideTarget(targetId), 320);
    return;
  }

  if (caseId) {
    const panelIndex = caseIdToPanelIndex(caseId);
    performHomeChapterNav('selected-work', panelIndex);
    window.setTimeout(() => activateGuideTarget(targetId), 560);
    return;
  }

  if (targetId === 'capabilities') {
    scrollCapabilityToPanel(0);
    window.setTimeout(() => activateGuideTarget(targetId), 480);
    return;
  }

  if (targetId === 'selected-work') {
    scrollWorkToPanel(0);
    window.setTimeout(() => activateGuideTarget(targetId), 480);
    return;
  }

  if (targetId === 'point-of-view') {
    scrollPovToPanel(0);
    window.setTimeout(() => activateGuideTarget(targetId), 480);
    return;
  }

  if (targetId === 'me') {
    scrollMeChapter();
    window.setTimeout(() => activateGuideTarget(targetId), 480);
    return;
  }

  const target = resolveGuideTargetElement(targetId);
  if (!target) {
    console.warn('[PortfolioGuide] Missing target:', targetId);
    return;
  }

  const y = target.getBoundingClientRect().top + window.scrollY;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
  window.setTimeout(() => activateGuideTarget(targetId), 480);
}

/** @deprecated Use scrollToGuideTarget */
export function scrollToTarget(targetId) {
  scrollToGuideTarget(targetId);
}

/**
 * @param {string} targetId
 */
export function previewTarget(targetId) {
  const el = resolveGuideTargetElement(targetId);
  if (!el) return;
  el.classList.add('portfolio-guide-target-preview');
}

/**
 * @param {string} targetId
 */
export function clearPreviewTarget(targetId) {
  const el = resolveGuideTargetElement(targetId);
  if (!el) return;
  el.classList.remove('portfolio-guide-target-preview');
}

/**
 * @param {string} targetId
 */
export function activateGuideTarget(targetId) {
  const el = resolveGuideTargetElement(targetId);
  if (!el) return;
  el.classList.add('portfolio-guide-target-active');
  window.setTimeout(() => {
    el.classList.remove('portfolio-guide-target-active');
  }, ACTIVE_HIGHLIGHT_MS);
}

/** @deprecated Use activateGuideTarget */
export function activateTarget(targetId) {
  activateGuideTarget(targetId);
}
