/**
 * Opening hero presentation — presentation clock (independent of boot.complete).
 * Narrative: white field → focus pulse (kills black) → sphere fade-in → copy → scroll cue.
 */

import { mix, smoothstep } from './fieldNarrative.js';

export const OPENING_PRESENTATION_MS = {
  CLOCK_END: 3600,
  LATENT_END: 180,
  PULSE_START: 200,
  PULSE_PEAK: 780,
  PULSE_END: 1400,
  PULSE_VISIBLE_END: 1550,
  FIELD_REVEAL_START: 1080,
  FIELD_REVEAL_END: 2200,
  SHADER_TIMEOUT: 2800,
  SHADER_PAINT_MIN_MS: 900,
  PLATE_SURFACE_EXTRA_MS: 600,
  IDENTITY_START: 1980,
  IDENTITY_END: 2380,
  ROLE_START: 2120,
  ROLE_END: 2520,
  DESCRIPTOR_START: 2220,
  DESCRIPTOR_END: 2620,
  SCROLL_CUE_START: 2680,
  SCROLL_CUE_END: 3000,
};

/** @param {{ elapsedMs?: number, scrollP?: number, openingCapHandoff?: number, fieldRevealProgress?: number }} input */
export function shouldKeepOpeningPlateSurface(input = {}) {
  const elapsedMs = Math.max(0, input.elapsedMs ?? 0);
  const scrollP = input.scrollP ?? 0;
  const openingCapHandoff = input.openingCapHandoff ?? 0;
  const fieldRevealProgress = input.fieldRevealProgress ?? 0;

  if (scrollP > 0.045) return false;
  if (openingCapHandoff > 0.08) return false;
  if (elapsedMs < OPENING_PRESENTATION_MS.IDENTITY_START + OPENING_PRESENTATION_MS.PLATE_SURFACE_EXTRA_MS) {
    return true;
  }
  if (fieldRevealProgress > 0.04 && fieldRevealProgress < 0.98) return true;
  return false;
}

const REVEAL_EASE = 'cubic-bezier(0.19, 1, 0.22, 1)';

function clamp01(t) {
  return Math.max(0, Math.min(1, t ?? 0));
}

/** Wide plateau so the pulse reads as a held condensation, not a blink. */
function pulseEnvelope(t) {
  if (t < OPENING_PRESENTATION_MS.PULSE_START) return 0;
  if (t > OPENING_PRESENTATION_MS.PULSE_END) return 0;
  const u =
    (t - OPENING_PRESENTATION_MS.PULSE_START) /
    (OPENING_PRESENTATION_MS.PULSE_END - OPENING_PRESENTATION_MS.PULSE_START);
  if (u < 0.2) return smoothstep(0, 0.2, u);
  if (u > 0.78) return 1 - smoothstep(0.78, 1, u);
  return 1;
}

/**
 * @param {number} elapsedMs
 */
export function computeOpeningPulsePresentation(elapsedMs) {
  const t = Math.max(0, elapsedMs);
  const env = pulseEnvelope(t);
  if (env < 0.02) {
    return { visible: false, opacity: 0, scale: 0.5, dissolve: 0 };
  }
  const swell = smoothstep(
    OPENING_PRESENTATION_MS.PULSE_START,
    OPENING_PRESENTATION_MS.PULSE_PEAK,
    t,
  );
  const scale = mix(0.48, mix(1.55, 1.05, swell), env);
  const opacity = mix(0, mix(0.96, 0.52, swell), env);
  return {
    visible: true,
    opacity,
    scale,
    dissolve: smoothstep(
      OPENING_PRESENTATION_MS.FIELD_REVEAL_START - 120,
      OPENING_PRESENTATION_MS.FIELD_REVEAL_START + 480,
      t,
    ),
  };
}

/**
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
    scale: mix(0.92, 1, u),
    blurPx: mix(12, 0, u),
    brightness: mix(0.7, 1, u),
    grain: mix(0.25, 1, u),
    posterOpacity: 1 - smoothstep(0.25, 0.88, u),
  };
}

/**
 * @param {number} elapsedMs
 * @param {ReturnType<typeof deriveOpeningPresentationGates>} gates
 */
export function computeOpeningCopyPresentation(elapsedMs, gates) {
  const t = Math.max(0, elapsedMs);
  const identity = gates?.canRevealIdentity
    ? clamp01(
        smoothstep(
          OPENING_PRESENTATION_MS.IDENTITY_START,
          OPENING_PRESENTATION_MS.IDENTITY_END,
          t,
        ),
      )
    : 0;
  const role = gates?.canRevealRole
    ? clamp01(
        smoothstep(
          OPENING_PRESENTATION_MS.ROLE_START,
          OPENING_PRESENTATION_MS.ROLE_END,
          t,
        ),
      )
    : 0;
  const descriptor = gates?.canRevealDescriptor
    ? clamp01(
        smoothstep(
          OPENING_PRESENTATION_MS.DESCRIPTOR_START,
          OPENING_PRESENTATION_MS.DESCRIPTOR_END,
          t,
        ),
      )
    : 0;
  const scrollCue = gates?.canRevealScrollCue
    ? clamp01(
        smoothstep(
          OPENING_PRESENTATION_MS.SCROLL_CUE_START,
          OPENING_PRESENTATION_MS.SCROLL_CUE_END,
          t,
        ),
      ) * 0.38
    : 0;

  return {
    identity: {
      opacity: identity,
      y: mix(9, 0, identity),
      trackingEm: mix(0.2, 0.14, identity),
    },
    role: {
      opacity: role,
      y: mix(5, 0, role),
    },
    descriptor: {
      opacity: descriptor,
      y: mix(4, 0, descriptor),
    },
    scrollCue: {
      opacity: scrollCue,
    },
  };
}

/**
 * @param {{
 *   elapsedMs: number,
 *   shaderReady: boolean,
 *   shaderVisualReady: boolean,
 *   shaderTimeout: boolean,
 *   scrollP?: number,
 *   prefersReducedMotion?: boolean,
 * }} input
 */
export function deriveOpeningPresentationGates(input) {
  const {
    elapsedMs,
    shaderReady,
    shaderVisualReady,
    shaderTimeout,
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

  const scrollOverride = scrollP > 0.045;
  const fieldReveal = computeOpeningFieldReveal(elapsedMs);

  const canMountShader =
    elapsedMs >= OPENING_PRESENTATION_MS.PULSE_START - 20 ||
    shaderReady ||
    shaderTimeout;

  const shaderGate =
    shaderVisualReady ||
    shaderTimeout ||
    elapsedMs >=
      OPENING_PRESENTATION_MS.FIELD_REVEAL_START + OPENING_PRESENTATION_MS.SHADER_PAINT_MIN_MS;

  const canRevealField =
    scrollOverride ||
    (elapsedMs >= OPENING_PRESENTATION_MS.FIELD_REVEAL_START && shaderGate);

  const fieldVisualEntered =
    scrollOverride ||
    (canRevealField && fieldReveal.progress >= 0.72);

  const canRevealIdentity =
    scrollOverride ||
    (fieldVisualEntered && elapsedMs >= OPENING_PRESENTATION_MS.IDENTITY_START);

  const canRevealRole =
    scrollOverride ||
    (canRevealIdentity && elapsedMs >= OPENING_PRESENTATION_MS.ROLE_START);

  const canRevealDescriptor =
    scrollOverride ||
    (canRevealRole && elapsedMs >= OPENING_PRESENTATION_MS.DESCRIPTOR_START);

  const canRevealScrollCue =
    scrollOverride ||
    (canRevealDescriptor && elapsedMs >= OPENING_PRESENTATION_MS.SCROLL_CUE_START);

  let phase = 'latent';
  if (elapsedMs >= OPENING_PRESENTATION_MS.PULSE_START && !canRevealField) {
    phase = 'pulse';
  } else if (canRevealField && !canRevealIdentity) {
    phase = 'field';
  } else if (canRevealIdentity && !canRevealScrollCue) {
    phase = 'identity';
  } else if (canRevealScrollCue) {
    phase = 'ready';
  }

  return {
    phase,
    showPulse:
      elapsedMs >= OPENING_PRESENTATION_MS.PULSE_START &&
      elapsedMs < OPENING_PRESENTATION_MS.PULSE_VISIBLE_END,
    canMountShader,
    canRevealField,
    fieldVisualEntered,
    canRevealIdentity,
    canRevealRole,
    canRevealDescriptor,
    canRevealScrollCue,
    bootComplete: fieldVisualEntered,
    shaderGate,
  };
}

export { REVEAL_EASE };
