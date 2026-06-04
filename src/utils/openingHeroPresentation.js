/**
 * Opening hero presentation — boot clock × shader readiness gates.
 * Narrative: white field → focus pulse → sphere reveal → signature copy → scroll cue.
 */

import { mix, smoothstep } from './fieldNarrative.js';
import { OPENING_BOOT_MS } from './openingBootSequence.js';

export const OPENING_PRESENTATION_MS = {
  LATENT_END: 160,
  PULSE_START: 160,
  PULSE_PEAK: 820,
  PULSE_END: 1280,
  FIELD_REVEAL_START: 700,
  FIELD_REVEAL_END: 1200,
  MIN_FIELD_HOLD: 520,
  SHADER_TIMEOUT: 2500,
  SHADER_MIN_READY: 320,
  IDENTITY_AFTER_FIELD_MS: 150,
  ROLE_STAGGER_MS: 100,
  DESCRIPTOR_STAGGER_MS: 90,
  SCROLL_AFTER_DESCRIPTOR_MS: 220,
};

const REVEAL_EASE = 'cubic-bezier(0.19, 1, 0.22, 1)';

function clamp01(t) {
  return Math.max(0, Math.min(1, t ?? 0));
}

/** @param {number} t ms */
function pulsePhase(t) {
  if (t < OPENING_PRESENTATION_MS.PULSE_START) return 0;
  if (t >= OPENING_PRESENTATION_MS.PULSE_END) return 0;
  const u = (t - OPENING_PRESENTATION_MS.PULSE_START) / (OPENING_PRESENTATION_MS.PULSE_END - OPENING_PRESENTATION_MS.PULSE_START);
  const rise = smoothstep(0, 0.55, u);
  const fall = 1 - smoothstep(0.45, 1, u);
  return rise * fall;
}

/**
 * Single slow condensation pulse (not a blink).
 * @param {number} elapsedMs
 */
export function computeOpeningPulsePresentation(elapsedMs) {
  const t = Math.max(0, elapsedMs);
  const active = t >= OPENING_PRESENTATION_MS.PULSE_START && t < OPENING_PRESENTATION_MS.PULSE_END + 200;
  if (!active) {
    return { visible: false, opacity: 0, scale: 0.65 };
  }
  const u = pulsePhase(t);
  const mid = smoothstep(OPENING_PRESENTATION_MS.PULSE_START, OPENING_PRESENTATION_MS.PULSE_PEAK, t);
  const scale = mix(0.55, mix(1.32, 0.88, mid), u);
  const opacity = mix(0, mix(0.92, 0.42, mid), u);
  return {
    visible: opacity > 0.02,
    opacity,
    scale,
    dissolve: smoothstep(OPENING_PRESENTATION_MS.FIELD_REVEAL_START, OPENING_PRESENTATION_MS.FIELD_REVEAL_END, t),
  };
}

/**
 * Sphere materialize — overlaps pulse tail (point grows into sphere).
 * @param {number} elapsedMs
 */
export function computeOpeningFieldReveal(elapsedMs) {
  const t = Math.max(0, elapsedMs);
  const u = smoothstep(
    OPENING_PRESENTATION_MS.FIELD_REVEAL_START,
    OPENING_PRESENTATION_MS.FIELD_REVEAL_END,
    t,
  );
  return {
    progress: u,
    opacity: u,
    scale: mix(0.96, 1, u),
    blurPx: mix(8, 0, u),
    brightness: mix(0.75, 1, u),
    grain: mix(0.3, 1, u),
    posterOpacity: 1 - smoothstep(0.35, 0.92, u),
  };
}

/**
 * @param {number} elapsedMs
 * @param {ReturnType<import('./openingBootSequence.js').computeOpeningBootAt>} boot
 */
export function computeOpeningCopyPresentation(elapsedMs, boot) {
  const identity = clamp01(boot?.heroReveal ?? 0);
  const role = clamp01(boot?.subReveal ?? 0);
  const scrollCue = smoothstep(
    OPENING_BOOT_MS.TYPO_END,
    OPENING_BOOT_MS.DONE,
    elapsedMs,
  );
  return {
    identity: {
      opacity: identity,
      y: mix(7, 0, identity),
      trackingEm: mix(0.2, 0.14, identity),
    },
    role: {
      opacity: role,
      y: mix(4, 0, role),
    },
    descriptor: {
      opacity: Math.max(0, role - 0.06),
      y: mix(3, 0, Math.max(0, role - 0.1)),
    },
    scrollCue: {
      opacity: scrollCue * 0.38,
    },
  };
}

/**
 * @param {{
 *   elapsedMs: number,
 *   boot: ReturnType<import('./openingBootSequence.js').computeOpeningBootAt>,
 *   shaderReady: boolean,
 *   shaderVisualReady: boolean,
 *   shaderTimeout: boolean,
 *   fallbackReady?: boolean,
 *   scrollP?: number,
 *   prefersReducedMotion?: boolean,
 * }} input
 */
export function deriveOpeningPresentationGates(input) {
  const {
    elapsedMs,
    boot,
    shaderReady,
    shaderVisualReady,
    shaderTimeout,
    fallbackReady = true,
    scrollP = 0,
    prefersReducedMotion = false,
  } = input;

  if (prefersReducedMotion) {
    return {
      phase: 'ready',
      showPulse: false,
      canMountShader: true,
      canRevealField: true,
      fieldVisualEntered: true,
      canRevealIdentity: true,
      canRevealRole: true,
      canRevealDescriptor: true,
      canRevealScrollCue: true,
      bootComplete: true,
    };
  }

  const scrollOverride = scrollP > 0.045 || (boot?.complete ?? 0) > 0.98;
  const bootFieldPhase =
    elapsedMs >= OPENING_PRESENTATION_MS.FIELD_REVEAL_START ||
    (boot?.structure ?? 0) > 0.35;
  const shaderGate =
    shaderVisualReady || shaderTimeout || (fallbackReady && elapsedMs >= OPENING_PRESENTATION_MS.SHADER_MIN_READY);
  const minTime = elapsedMs >= OPENING_PRESENTATION_MS.MIN_FIELD_HOLD;

  const canRevealField = scrollOverride || (bootFieldPhase && shaderGate && minTime);
  const fieldReveal = computeOpeningFieldReveal(elapsedMs);
  const fieldVisualEntered =
    scrollOverride || (canRevealField && fieldReveal.progress > 0.88);

  const identityDelay =
    OPENING_PRESENTATION_MS.FIELD_REVEAL_END + OPENING_PRESENTATION_MS.IDENTITY_AFTER_FIELD_MS;
  const bootIdentity = (boot?.heroReveal ?? 0) > 0.02 && elapsedMs >= identityDelay - 80;
  const canRevealIdentity = scrollOverride || (fieldVisualEntered && bootIdentity);
  const canRevealRole = scrollOverride || (canRevealIdentity && (boot?.subReveal ?? 0) > 0.08);
  const canRevealDescriptor = scrollOverride || (canRevealRole && (boot?.subReveal ?? 0) > 0.35);
  const canRevealScrollCue =
    scrollOverride || (canRevealDescriptor && elapsedMs >= OPENING_BOOT_MS.TYPO_END);

  let phase = 'latent';
  if (elapsedMs >= OPENING_PRESENTATION_MS.PULSE_START && !canRevealField) phase = 'pulse';
  else if (canRevealField && !canRevealIdentity) phase = 'field';
  else if (canRevealIdentity && !canRevealScrollCue) phase = 'identity';
  else if (canRevealScrollCue) phase = 'ready';

  return {
    phase,
    showPulse:
      elapsedMs >= OPENING_PRESENTATION_MS.PULSE_START &&
      elapsedMs < OPENING_PRESENTATION_MS.PULSE_END + 180,
    canMountShader:
      shaderReady ||
      shaderTimeout ||
      elapsedMs >= OPENING_PRESENTATION_MS.FIELD_REVEAL_START - 120,
    canRevealField,
    fieldVisualEntered,
    canRevealIdentity,
    canRevealRole,
    canRevealDescriptor,
    canRevealScrollCue,
    bootComplete: (boot?.complete ?? 0) > 0.98,
    shaderGate,
  };
}

export { REVEAL_EASE };
