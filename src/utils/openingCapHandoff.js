/**
 * Single authoritative Opening → Capabilities handoff (rect / scroll progress).
 * Replaces GSAP ScrollTrigger for this transition.
 */

import { smoothstep } from './fieldNarrative.js';

/**
 * Maps handoff zone progress (0–1) to coordinated wipe / field / completion.
 * @param {number} t
 */
export function mapOpeningCapHandoffProgress(t) {
  const p = Math.max(0, Math.min(1, t ?? 0));
  return {
    wipe: smoothstep(0.22, 0.78, p),
    fieldHandoff: smoothstep(0.38, 0.94, p),
    thesisFade: smoothstep(0.48, 0.9, p),
    openingComplete: smoothstep(0.76, 0.94, p),
    zone: p,
  };
}

/**
 * Measure 0→1 handoff from opening track tail into capabilities pin.
 * @param {{
 *   openingRect?: DOMRect | null,
 *   capStickyRect?: DOMRect | null,
 *   capChapterRect?: DOMRect | null,
 *   openingProgress?: number,
 *   viewportHeight?: number,
 *   reduceMotion?: boolean,
 * }} input
 */
export function measureOpeningCapHandoff(input = {}) {
  const vh = input.viewportHeight ?? (typeof window !== 'undefined' ? window.innerHeight : 800);
  const { openingRect, capStickyRect, capChapterRect, openingProgress = 0 } = input;

  if (input.reduceMotion) {
    const openBottom = openingRect?.bottom ?? vh;
    const pinTop = capStickyRect?.top ?? vh;
    const t =
      openBottom <= vh * 0.5 ? (pinTop <= vh * 0.08 ? 1 : 0.55) : 0;
    return mapOpeningCapHandoffProgress(t);
  }

  if (!openingRect) {
    return mapOpeningCapHandoffProgress(0);
  }

  /** Handoff begins when opening scroll track bottom approaches viewport (screen-2 tail). */
  const openBottom = openingRect.bottom;
  const handoffStart = vh * 0.9;
  const handoffEnd = vh * 0.12;

  let fromOpeningBottom = 0;
  if (openBottom <= handoffStart) {
    fromOpeningBottom = smoothstep(handoffEnd, handoffStart, openBottom);
  }

  let fromCapPin = 0;
  const pinTop = capStickyRect?.top ?? capChapterRect?.top;
  if (pinTop != null) {
    if (pinTop <= 0) {
      fromCapPin = 1;
    } else if (pinTop < vh * 0.72) {
      fromCapPin = smoothstep(vh * 0.58, 0, pinTop);
    }
  }

  let zone = Math.max(fromOpeningBottom, fromCapPin);

  if (openingProgress > 0.62) {
    zone = Math.max(zone, smoothstep(0.62, 0.94, openingProgress));
  }

  if (openingProgress < 0.04 && typeof window !== 'undefined' && window.scrollY < vh * 0.2) {
    zone = 0;
  }

  return mapOpeningCapHandoffProgress(Math.max(0, Math.min(1, zone)));
}
