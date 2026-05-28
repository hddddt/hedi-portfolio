import { useEffect, useRef } from 'react';

const DEFAULT = { x: 0.5, y: 0.5 };

/**
 * Critically-damped spring toward normalized pointer target (0–1).
 */
export function useSpring2D(target, { stiffness = 0.078, damping = 0.82, enabled = true } = {}) {
  const state = useRef({ ...DEFAULT, vx: 0, vy: 0 });
  const out = useRef({ ...DEFAULT });

  useEffect(() => {
    if (!enabled) {
      state.current = { ...DEFAULT, vx: 0, vy: 0 };
      out.current = { ...DEFAULT };
      return undefined;
    }

    let raf = 0;
    const tick = () => {
      const s = state.current;
      const tx = target?.x ?? 0.5;
      const ty = target?.y ?? 0.5;
      const ax = (tx - s.x) * stiffness;
      const ay = (ty - s.y) * stiffness;
      s.vx = (s.vx + ax) * damping;
      s.vy = (s.vy + ay) * damping;
      s.x += s.vx;
      s.y += s.vy;
      out.current = { x: s.x, y: s.y };
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target?.x, target?.y, stiffness, damping, enabled]);

  return out;
}
