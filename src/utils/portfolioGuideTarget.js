/** @typedef {{ type: 'section' | 'case', id: string }} GuideDestination */

import { WORK_TRACK_LEAD_IN_VH } from './workChoreography.js';

const ACTIVE_HIGHLIGHT_MS = 1800;

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

const SELECTORS = {
  capabilityTrack: '#capabilities .capability-scroll',
  capabilityPanelCount: '#capabilities .capability-scroll__snap',
  workTrack: '#home-work-strongest',
  workPanelCount: '#home-work-strongest .work-narrative__layer',
  povTrack: '#point-of-view .pov-scroll',
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

  return null;
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

/**
 * Scroll so a pinned vh-track lands on `panelIndex`.
 * Matches CapabilityDialSection / ApproachSection: index / (n - 1).
 * @param {HTMLElement} trackEl
 * @param {number} panelIndex
 * @param {number} panelCount
 */
function scrollPinnedTrackNMinusOne(trackEl, panelIndex, panelCount) {
  const rect = trackEl.getBoundingClientRect();
  const total = Math.max(1, rect.height - window.innerHeight);
  const idx = Math.min(panelCount - 1, Math.max(0, panelIndex));
  const traveled = panelCount <= 1 ? 0 : (idx / (panelCount - 1)) * total;
  const y = window.scrollY + rect.top + traveled;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

/**
 * Scroll work carousel — matches WorkNarrativeSection lead-in + n-panel track.
 * @param {HTMLElement} trackEl
 * @param {number} panelIndex
 * @param {number} panelCount
 */
function scrollWorkTrackN(trackEl, panelIndex, panelCount) {
  const vh = window.innerHeight;
  const total = Math.max(1, trackEl.offsetHeight - vh);
  const leadIn = (WORK_TRACK_LEAD_IN_VH / 100) * vh;
  const caseTravel = Math.max(1, total - leadIn);
  const step = caseTravel / panelCount;
  const idx = Math.min(panelCount - 1, Math.max(0, panelIndex));
  const traveled = idx === 0 ? 0 : leadIn + idx * step;
  const y = window.scrollY + trackEl.getBoundingClientRect().top + traveled;
  window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
}

function scrollCapabilityToPanel(panelIndex = 0) {
  const track = document.querySelector(SELECTORS.capabilityTrack);
  if (!(track instanceof HTMLElement)) {
    console.warn('[PortfolioGuide] Missing target:', 'capabilities');
    return;
  }
  const panelCount = document.querySelectorAll(SELECTORS.capabilityPanelCount).length;
  scrollPinnedTrackNMinusOne(track, panelIndex, Math.max(1, panelCount));
}

function scrollWorkToPanel(panelIndex = 0) {
  const track = document.querySelector(SELECTORS.workTrack);
  if (!(track instanceof HTMLElement)) {
    console.warn('[PortfolioGuide] Missing target:', 'selected-work');
    return;
  }
  const panelCount = document.querySelectorAll(SELECTORS.workPanelCount).length;
  scrollWorkTrackN(track, panelIndex, Math.max(1, panelCount));
}

function scrollPovToPanel(panelIndex = 0) {
  const track = document.querySelector(SELECTORS.povTrack);
  if (!(track instanceof HTMLElement)) {
    console.warn('[PortfolioGuide] Missing target:', 'point-of-view');
    return;
  }
  const panelCount = track.querySelectorAll('.pov-scroll__snap').length;
  scrollPinnedTrackNMinusOne(track, panelIndex, Math.max(1, panelCount));
}

/**
 * Sync work carousel UI after programmatic scroll (no second scroll).
 * @param {string} caseId
 * @param {number} panelIndex
 */
export function syncWorkCaseFromGuide(caseId, panelIndex) {
  window.dispatchEvent(
    new CustomEvent('portfolio-guide-focus-case', {
      detail: { caseId, panelIndex },
    }),
  );
}

/**
 * @param {string} targetId
 */
export function scrollToGuideTarget(targetId) {
  const caseId = caseTargetToCaseId(targetId);

  if (caseId) {
    const panelIndex = caseIdToPanelIndex(caseId);
    syncWorkCaseFromGuide(caseId, panelIndex);
    scrollWorkToPanel(panelIndex);
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
    syncWorkCaseFromGuide('case01', 0);
    window.setTimeout(() => activateGuideTarget(targetId), 480);
    return;
  }

  if (targetId === 'point-of-view') {
    scrollPovToPanel(0);
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
