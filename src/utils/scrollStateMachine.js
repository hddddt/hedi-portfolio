/** Shared scroll-linked state roles for panel / case transitions. */

import { SCROLL_LOCK_RADIUS } from './scrollTrack.js';

export const PANEL_LOCK_RADIUS = SCROLL_LOCK_RADIUS;

export function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function phaseLerp(t, t0, t1, a, b) {
  if (t <= t0) return a;
  if (t >= t1) return b;
  const u = (t - t0) / Math.max(1e-6, t1 - t0);
  return lerp(a, b, u);
}

/** @typedef {'active'|'outgoing'|'incoming'|'before'|'after'} TransitionRole */

/**
 * Raw scroll index with visual lock zones — snaps to integer when near a stop.
 * @param {number} rawFloatIndex
 * @param {number} [lockRadius]
 */
export function getVisualFloatIndex(rawFloatIndex, lockRadius = PANEL_LOCK_RADIUS) {
  if (!Number.isFinite(rawFloatIndex)) return 0;
  const nearest = Math.round(rawFloatIndex);
  if (Math.abs(rawFloatIndex - nearest) < lockRadius) {
    return nearest;
  }
  return rawFloatIndex;
}

/**
 * @param {number} floatIndex — use getVisualFloatIndex for rendering
 * @param {number} panelIndex
 * @returns {{ role: TransitionRole; t: number; dist: number }}
 */
export function getPanelTransitionRole(floatIndex, panelIndex) {
  const f = floatIndex;
  const i = panelIndex;
  const hold = PANEL_LOCK_RADIUS;

  if (Math.abs(f - i) < hold) {
    return { role: 'active', t: 0, dist: Math.abs(f - i) };
  }
  if (f > i && f <= i + 1) {
    return { role: 'outgoing', t: f - i, dist: f - i };
  }
  if (f > i - 1 && f < i) {
    return { role: 'incoming', t: f - (i - 1), dist: i - f };
  }
  if (f < i) {
    return { role: 'before', t: i - f, dist: i - f };
  }
  return { role: 'after', t: f - i, dist: f - i };
}

/** Piecewise linear sample across keyframes `{ t, ...vals }`. */
export function sampleCurve(keys, t, fields) {
  const u = clamp01(t);
  if (u <= keys[0].t) return { ...keys[0] };
  if (u >= keys[keys.length - 1].t) return { ...keys[keys.length - 1] };

  for (let i = 0; i < keys.length - 1; i += 1) {
    const a = keys[i];
    const b = keys[i + 1];
    if (u >= a.t && u <= b.t) {
      const span = Math.max(1e-6, b.t - a.t);
      const p = (u - a.t) / span;
      const out = { t: u };
      for (const field of fields) {
        out[field] = lerp(a[field], b[field], p);
      }
      return out;
    }
  }
  return { ...keys[keys.length - 1] };
}

export function motionStyleFromState(state, opts = {}) {
  const {
    pointerEvents = false,
    zIndex = 0,
    yKey = 'y',
    includeBlur = true,
  } = opts;
  const y = state[yKey] ?? 0;
  const blurPx = includeBlur ? Math.max(0, state.blur ?? 0) : 0;
  const scale = state.scale ?? 1;
  const opacity = state.opacity ?? 0;

  return {
    opacity,
    filter: includeBlur && blurPx > 0.12 ? `blur(${blurPx.toFixed(2)}px)` : undefined,
    transform: `translate3d(0, ${y.toFixed(2)}px, 0) scale(${scale.toFixed(4)})`,
    visibility: opacity > 0.02 ? 'visible' : 'hidden',
    pointerEvents: pointerEvents ? 'auto' : 'none',
    zIndex,
  };
}
