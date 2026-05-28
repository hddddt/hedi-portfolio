/** Subtle drift for guide orb (mood/color stays neutral unless parent sets `mood`). */

/**
 * @param {(offset: { x: number; y: number }) => void} onOffset
 * @returns {() => void}
 */
export function startIdleDrift(onOffset) {
  let raf = 0;
  const t0 = performance.now();

  const tick = (now) => {
    const t = (now - t0) / 1000;
    onOffset({
      x: Math.sin(t * 0.31) * 2.8 + Math.sin(t * 0.17) * 1.1,
      y: Math.cos(t * 0.27) * 2.2 + Math.sin(t * 0.23) * 0.9,
    });
    raf = requestAnimationFrame(tick);
  };

  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}
