import { useEffect, useRef } from 'react';
import { createOpeningCapHandoffScrollTrigger } from '../utils/openingCapHandoffScrollTrigger.js';

/**
 * Drives opening → capabilities handoff via ScrollTrigger (wipe, field blend, openingComplete).
 * @param {{
 *   enabled?: boolean,
 *   reduceMotion?: boolean,
 *   onProgress: (mapped: ReturnType<typeof import('../utils/openingCapHandoffScrollTrigger.js').mapOpeningCapHandoffProgress>) => void,
 * }} options
 */
export function useOpeningCapHandoffScrollTrigger({
  enabled = true,
  reduceMotion = false,
  onProgress,
}) {
  const onProgressRef = useRef(onProgress);
  onProgressRef.current = onProgress;

  useEffect(() => {
    if (!enabled) return undefined;

    return createOpeningCapHandoffScrollTrigger({
      reduceMotion,
      onProgress: (mapped) => onProgressRef.current(mapped),
    });
  }, [enabled, reduceMotion]);
}
