/**
 * Shared scroll choreography helpers — transform/opacity only, no layout thrash.
 */

export function clamp01(v) {
  return Math.max(0, Math.min(1, v));
}

export function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}

export function mix(a, b, t) {
  return a + (b - a) * t;
}

/** Progress through a sub-range of [0,1]. */
export function phaseProgress(progress, start, end) {
  if (end <= start) return progress >= end ? 1 : 0;
  return smoothstep(start, end, progress);
}

/**
 * Spring step toward target (Framer-like defaults: stiffness 90, damping 24, mass 0.7).
 * @param {number} current
 * @param {number} target
 * @param {number} velocity
 * @param {number} dt seconds
 * @param {{ stiffness?: number; damping?: number; mass?: number }} opts
 */
export function springStep(current, target, velocity, dt, opts = {}) {
  const stiffness = opts.stiffness ?? 90;
  const damping = opts.damping ?? 24;
  const mass = opts.mass ?? 0.7;
  const force = -stiffness * (current - target) - damping * velocity;
  const accel = force / mass;
  const v = velocity + accel * dt;
  const x = current + v * dt;
  return { value: x, velocity: v };
}

/**
 * Chapter entry: 0 when section below fold, 1 when sticky pin engages.
 * @param {DOMRect} rect
 * @param {number} vh
 */
export function measureChapterEntryProgress(rect, vh) {
  const start = vh * 0.88;
  const end = vh * 0.06;
  if (rect.top >= start) return 0;
  if (rect.top <= end) return 1;
  return clamp01((start - rect.top) / (start - end));
}

/**
 * Section scroll through sticky track (0 at pin, 1 at end).
 * @param {DOMRect} rect
 */
export function measureStickyTrackProgress(rect) {
  const vh = window.innerHeight;
  const total = Math.max(1, rect.height - vh);
  const t = Math.min(Math.max(-rect.top, 0), total);
  return clamp01(t / total);
}

/**
 * @param {number} p phase progress 0–1
 * @param {{ y?: number; scale?: number; scaleX?: number; opacity?: number; blur?: number; x?: number; rotate?: number }} from
 * @param {{ y?: number; scale?: number; scaleX?: number; opacity?: number; blur?: number; x?: number; rotate?: number }} to
 */
export function motionStyle(p, from, to) {
  const u = clamp01(p);
  const y = mix(from.y ?? 0, to.y ?? 0, u);
  const x = mix(from.x ?? 0, to.x ?? 0, u);
  const scale = mix(from.scale ?? 1, to.scale ?? 1, u);
  const scaleX = mix(from.scaleX ?? scale, to.scaleX ?? scale, u);
  const scaleY = mix(from.scaleY ?? scale, to.scaleY ?? scale, u);
  const opacity = mix(from.opacity ?? 0, to.opacity ?? 1, u);
  const blur = mix(from.blur ?? 0, to.blur ?? 0, u);
  const rotate = mix(from.rotate ?? 0, to.rotate ?? 0, u);
  const parts = [
    `translate3d(${x}px, ${y}px, 0)`,
    scaleX !== scaleY || from.scaleX != null || to.scaleX != null
      ? `scale(${scaleX}, ${scaleY})`
      : `scale(${scale})`,
    rotate ? `rotate(${rotate}deg)` : '',
  ].filter(Boolean);
  return {
    opacity,
    transform: parts.join(' '),
    filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
    willChange: u > 0.001 && u < 0.999 ? 'transform, opacity' : undefined,
  };
}
