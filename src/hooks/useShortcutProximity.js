import { useEffect, useState } from 'react';

const EDGE_PX = 72;

/**
 * Pointer within the right edge band — marker "proximity" state (spec §12).
 * @param {{ enabled?: boolean }} [options]
 */
export function useShortcutProximity(options = {}) {
  const { enabled = true } = options;
  const [near, setNear] = useState(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    const onMove = (e) => {
      const x = e.clientX;
      const w = window.innerWidth;
      setNear(x >= w - EDGE_PX);
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [enabled]);

  return near;
}
