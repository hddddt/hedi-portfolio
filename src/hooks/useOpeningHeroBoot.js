import { useCallback, useEffect, useRef, useState } from 'react';
import { computeOpeningBootAt, OPENING_BOOT_MS } from '../utils/openingBootSequence.js';
import {
  computeOpeningCopyPresentation,
  computeOpeningFieldReveal,
  computeOpeningPulsePresentation,
  deriveOpeningPresentationGates,
  OPENING_PRESENTATION_MS,
} from '../utils/openingHeroPresentation.js';

/**
 * Boot narrative clock + shader readiness (presentation clock runs past boot.complete).
 */
export function useOpeningHeroBoot({
  prefersReducedMotion = false,
  scrollP = 0,
  updateOpeningBoot,
} = {}) {
  const bootStartRef = useRef(
    typeof performance !== 'undefined' ? performance.now() : 0,
  );
  const [elapsedMs, setElapsedMs] = useState(0);
  const [boot, setBoot] = useState(() =>
    computeOpeningBootAt(0, prefersReducedMotion),
  );

  const [shaderReady, setShaderReady] = useState(false);
  const [shaderVisualReady, setShaderVisualReady] = useState(false);
  const [shaderTimeout, setShaderTimeout] = useState(false);

  const onShaderReady = useCallback(() => setShaderReady(true), []);
  const onShaderVisualReady = useCallback(() => setShaderVisualReady(true), []);
  const onShaderTimeout = useCallback(() => setShaderTimeout(true), []);

  useEffect(() => {
    if (prefersReducedMotion) {
      const done = computeOpeningBootAt(OPENING_BOOT_MS.DONE, true);
      setBoot(done);
      setElapsedMs(OPENING_PRESENTATION_MS.SCROLL_CUE_END);
      updateOpeningBoot?.(done);
      setShaderReady(true);
      setShaderVisualReady(true);
      return undefined;
    }

    let raf = 0;
    const tick = (now) => {
      const elapsed = now - bootStartRef.current;
      setElapsedMs(elapsed);
      const nextBoot = computeOpeningBootAt(elapsed, false);
      setBoot(nextBoot);
      updateOpeningBoot?.(nextBoot);
      if (elapsed < OPENING_PRESENTATION_MS.CLOCK_END) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion, updateOpeningBoot]);

  useEffect(() => {
    if (prefersReducedMotion) return undefined;
    const id = window.setTimeout(
      () => setShaderTimeout(true),
      OPENING_PRESENTATION_MS.SHADER_TIMEOUT,
    );
    return () => clearTimeout(id);
  }, [prefersReducedMotion]);

  const gates = deriveOpeningPresentationGates({
    elapsedMs,
    shaderReady,
    shaderVisualReady,
    shaderTimeout,
    scrollP,
    prefersReducedMotion,
  });

  const pulse = computeOpeningPulsePresentation(elapsedMs);
  const fieldReveal = computeOpeningFieldReveal(elapsedMs);
  const copy = computeOpeningCopyPresentation(elapsedMs, gates);

  return {
    elapsedMs,
    boot,
    gates,
    pulse,
    fieldReveal,
    copy,
    shaderReady,
    shaderVisualReady,
    shaderTimeout,
    onShaderReady,
    onShaderVisualReady,
    onShaderTimeout,
  };
}
