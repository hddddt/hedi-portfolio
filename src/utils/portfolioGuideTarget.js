/** @typedef {{ type: 'section' | 'case' | 'capability', id: string }} GuideDestination */

import { homeCapabilities } from '../data/homeScrollChapters.js';
import {
  dispatchChapterNav,
  HOME_CHAPTER_NAV_EVENT,
  performHomeChapterNav,
} from './homeChapterNav.js';

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

function scrollCapabilityToPanel(panelIndex = 0) {
  performHomeChapterNav('capabilities', panelIndex);
}

function scrollWorkToPanel(panelIndex = 0) {
  performHomeChapterNav('selected-work', panelIndex);
}

function scrollPovToPanel(panelIndex = 0) {
  performHomeChapterNav('point-of-view', panelIndex);
}

function scrollMeChapter() {
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
  performHomeChapterNav('selected-work', idx);
}

/**
 * @param {string} targetId
 */
export function scrollToGuideTarget(targetId) {
  const caseId = caseTargetToCaseId(targetId);

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
