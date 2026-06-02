/**
 * Green field (a) breathing — restrained sine pulse layered on semantic + scroll scale.
 *
 * finalGreenScale = semanticScale * scrollScale * breathingScale
 * breathingScale = 1 + sin(time * speed + phase) * amplitude
 */

import { estimateFieldLinear } from '../data/fieldSizeHierarchy.js';

/** @typedef {'opening' | 'capabilities' | 'other'} GreenBreathingSection */

/** @type {Record<GreenBreathingSection, { amplitude: number, speed: number, phase: number, opacityAmp: number, driftAmp: number }>} */
export const GREEN_BREATHING = {
  opening: { amplitude: 0.038, speed: 0.78, phase: 0.7, opacityAmp: 0.032, driftAmp: 0.005 },
  capabilities: { amplitude: 0.028, speed: 0.74, phase: 1.3, opacityAmp: 0.024, driftAmp: 0.0035 },
  other: { amplitude: 0.022, speed: 0.68, phase: 2.1, opacityAmp: 0.02, driftAmp: 0.003 },
};

const MAX_AREA_RATIO = 3;
const MIN_LINEAR_RATIO = 1;

/**
 * @param {{ ambientKey?: string, orbScene?: string, inOpening?: boolean }} ctx
 * @returns {GreenBreathingSection}
 */
export function resolveGreenBreathingSection(ctx) {
  if (ctx.inOpening) return 'opening';
  if (ctx.ambientKey === 'warm' || ctx.ambientKey === 'default' || !ctx.ambientKey) {
    if (ctx.orbScene === 'landing') return 'opening';
  }
  if (ctx.ambientKey === 'signal' || ctx.orbScene === 'capabilities') return 'capabilities';
  return 'other';
}

/**
 * @param {number} t
 * @param {GreenBreathingSection} section
 * @param {boolean} [reducedMotion]
 * @param {{ scrollDrive?: number }} [opts]
 */
export function computeGreenBreathing(t, section, reducedMotion = false, opts = {}) {
  if (reducedMotion) {
    return { scale: 1, opacityDelta: 0, dx: 0, dy: 0 };
  }
  const cfg = GREEN_BREATHING[section] ?? GREEN_BREATHING.other;
  let amplitude = cfg.amplitude;
  if (section === 'capabilities' && opts.scrollDrive != null) {
    amplitude *= 1 - Math.min(1, Math.max(0, opts.scrollDrive)) * 0.4;
  }
  const speedWarp =
    section === 'opening'
      ? 1 +
        Math.sin(t * 0.071 + cfg.phase * 0.9) * 0.06 +
        Math.sin(t * 0.113 + cfg.phase * 1.7) * 0.03
      : 1;
  const localSpeed = cfg.speed * speedWarp;
  const wave = Math.sin(t * localSpeed + cfg.phase);
  const opacityWave = Math.sin(t * localSpeed * 0.78 + cfg.phase + 1.2);
  const driftPhase = t * localSpeed * 0.62 + cfg.phase * 0.5;
  return {
    scale: 1 + wave * amplitude,
    opacityDelta: opacityWave * cfg.opacityAmp,
    dx: Math.sin(driftPhase) * cfg.driftAmp,
    dy: Math.cos(driftPhase * 0.88) * cfg.driftAmp * 0.85,
  };
}

/**
 * Clamp breathing so green linear presence stays above blue and area ≤ 3× blue.
 * @param {number} greenScale semantic × scroll (no breathing yet)
 * @param {number} blueScale
 * @param {number} breathingScale
 * @param {string} ambKey
 * @param {{ greenStretchX?: number, greenStretchY?: number, blueStretchX?: number, blueStretchY?: number }} [stretches]
 */
export function clampGreenBreathingScale(
  greenScale,
  blueScale,
  breathingScale,
  ambKey = 'warm',
  stretches = {},
) {
  if (ambKey === 'signal') {
    // Capabilities: do not enforce blue/green ratio clamp.
    return Math.max(0.88, Math.min(1.2, breathingScale));
  }
  const radiiKey = ambKey === 'signal' ? 'signal' : 'warm';
  const gBase = estimateFieldLinear(
    'a',
    greenScale,
    stretches.greenStretchX ?? 1,
    stretches.greenStretchY ?? 1,
    radiiKey,
  );
  const bBase = estimateFieldLinear(
    'b',
    blueScale,
    stretches.blueStretchX ?? 1,
    stretches.blueStretchY ?? 1,
    radiiKey,
  );
  if (bBase <= 0 || gBase <= 0) return breathingScale;
  const baseRatio = gBase / bBase;
  const minBreath = MIN_LINEAR_RATIO / baseRatio;
  const maxBreath = Math.sqrt(MAX_AREA_RATIO) / baseRatio;
  return Math.max(minBreath, Math.min(maxBreath, breathingScale));
}

/**
 * Layer breathing on green after semantic + scroll scales are resolved.
 * @param {object} targets motion targets { a, b, c, flowB? }
 * @param {number} t animation time (seconds)
 * @param {{ ambientKey?: string, orbScene?: string, inOpening?: boolean, reducedMotion?: boolean, scrollDrive?: number }} ctx
 */
export function applyGreenBreathingLayer(targets, t, ctx) {
  const section = resolveGreenBreathingSection(ctx);
  const breath = computeGreenBreathing(t, section, ctx.reducedMotion, {
    scrollDrive: ctx.scrollDrive,
  });
  const clampedScale = clampGreenBreathingScale(
    targets.a.scale,
    targets.b.scale,
    breath.scale,
    ctx.ambientKey,
    {
      greenStretchX: targets.a.stretchX,
      greenStretchY: targets.a.stretchY,
      blueStretchX: targets.b.stretchX,
      blueStretchY: targets.b.stretchY,
    },
  );
  return {
    ...targets,
    a: {
      ...targets.a,
      scale: targets.a.scale * clampedScale,
      opacity: Math.max(0, Math.min(1, targets.a.opacity + breath.opacityDelta)),
      centerX: targets.a.centerX + breath.dx,
      centerY: targets.a.centerY + breath.dy,
    },
  };
}
