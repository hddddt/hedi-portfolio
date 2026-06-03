/**
 * Scroll-driven field semantics — color language for the portfolio narrative.
 *
 * Green  = operating structure, workflow, capability, system control
 * Blue   = perspective, reasoning, conceptual depth
 * Orange = human layer, product imagination, personal practice (shader: amber / field c)
 */

import { FIELD_ID } from './fieldSizeHierarchy.js';

/** @typedef {'green' | 'blue' | 'amber'} FieldHue */

/** User-facing orange maps to amber field `c`. */
export const ORANGE_FIELD_HUE = 'amber';

/** Case id → dominant field hue for work hover / activation. */
export const CASE_FIELD_HUE = /** @type {Record<string, FieldHue>} */ ({
  case01: 'green',
  case02: 'green',
  case03: 'blue',
  case04: 'amber',
});

/** Primary nav chapter → hint hue for subtle field response. */
export const NAV_CHAPTER_FIELD_HUE = /** @type {Record<string, FieldHue>} */ ({
  'home-capabilities': 'green',
  'home-work-narrative': 'green',
  'home-approach': 'blue',
  'home-life-archive': 'amber',
});

/** Rest bias when a work case is active (normalized 0–1). */
export const WORK_CASE_FIELD_ANCHOR = /** @type {Record<string, { x: number, y: number }>} */ ({
  case01: { x: 0.26, y: 0.5 },
  case02: { x: 0.34, y: 0.48 },
  case03: { x: 0.52, y: 0.44 },
  case04: { x: 0.66, y: 0.46 },
});

/** CSS accent tokens for borders / washes (restrained, not neon). */
export const FIELD_HUE_CSS = {
  green: {
    border: 'rgba(42, 90, 72, 0.28)',
    glow: 'rgba(126, 174, 151, 0.12)',
    wash: 'rgba(126, 174, 151, 0.06)',
    focus: 'rgba(58, 108, 88, 0.42)',
  },
  blue: {
    border: 'rgba(72, 88, 132, 0.28)',
    glow: 'rgba(112, 128, 178, 0.12)',
    wash: 'rgba(112, 128, 178, 0.06)',
    focus: 'rgba(88, 104, 148, 0.42)',
  },
  amber: {
    border: 'rgba(154, 114, 36, 0.28)',
    glow: 'rgba(207, 164, 112, 0.12)',
    wash: 'rgba(207, 164, 112, 0.06)',
    focus: 'rgba(168, 124, 52, 0.42)',
  },
};

/**
 * @param {FieldHue | 'orange' | null | undefined} hue
 * @returns {'a' | 'b' | 'c' | null}
 */
export function fieldIdForHue(hue) {
  if (!hue) return null;
  const h = hue === 'orange' ? 'amber' : hue;
  return FIELD_ID[h] ?? null;
}

/**
 * @param {string | null | undefined} caseId
 * @returns {FieldHue | null}
 */
export function caseFieldHue(caseId) {
  if (!caseId) return null;
  return CASE_FIELD_HUE[caseId] ?? null;
}
