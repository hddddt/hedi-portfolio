import { useEffect, useRef, useState } from 'react';
import { springStep } from '../utils/scrollMotion.js';

/**
 * Scroll-linked progress with spring smoothing (rAF).
 * @param {React.RefObject<HTMLElement | null>} ref
 * @param {(rect: DOMRect, vh: number) => number} measure
 * @param {{ stiffness?: number; damping?: number; mass?: number; enabled?: boolean }} [opts]
 */
export function useSmoothedScrollProgress(ref, measure, opts = {}) {
  const { stiffness = 90, damping = 24, mass = 0.7, enabled = true } = opts;
  const [smooth, setSmooth] = useState(0);
  const targetRef = useRef(0);
  const stateRef = useRef({ value: 0, velocity: 0 });

  useEffect(() => {
    if (!enabled) {
      targetRef.current = 0;
      stateRef.current = { value: 0, velocity: 0 };
      setSmooth(0);
      return undefined;
    }

    const syncTarget = () => {
      const el = ref.current;
      if (!el) {
        targetRef.current = 0;
        return;
      }
      const rect = el.getBoundingClientRect();
      targetRef.current = measure(rect, window.innerHeight);
    };

    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      syncTarget();
      const next = springStep(
        stateRef.current.value,
        targetRef.current,
        stateRef.current.velocity,
        dt,
        { stiffness, damping, mass },
      );
      stateRef.current = next;
      setSmooth(next.value);
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => syncTarget();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    syncTarget();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [ref, measure, stiffness, damping, mass, enabled]);

  return smooth;
}

/**
 * Spring-smooth a scalar that changes from React state (e.g. float index).
 * @param {number} target
 * @param {{ stiffness?: number; damping?: number; mass?: number; enabled?: boolean }} [opts]
 */
export function useSpringScalar(target, opts = {}) {
  const { stiffness = 110, damping = 22, mass = 0.8, enabled = true } = opts;
  const [smooth, setSmooth] = useState(target);
  const stateRef = useRef({ value: target, velocity: 0 });

  useEffect(() => {
    if (!enabled) {
      stateRef.current = { value: target, velocity: 0 };
      setSmooth(target);
      return undefined;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const next = springStep(
        stateRef.current.value,
        target,
        stateRef.current.velocity,
        dt,
        { stiffness, damping, mass },
      );
      stateRef.current = next;
      setSmooth(next.value);
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, stiffness, damping, mass, enabled]);

  return smooth;
}
