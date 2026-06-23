import { useEffect, useState } from 'react';

/** Mobile homepage — touch-first, no scroll theater (< 768px). */
export const MOBILE_HOME_MAX_WIDTH = 767;

/** Tablet band — responsive layout only, desktop interaction preserved. */
export const TABLET_MAX_WIDTH = 1023;

export function isMobileHomeMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${MOBILE_HOME_MAX_WIDTH}px)`).matches;
}

export function isTabletHomeMode() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(
    `(min-width: ${MOBILE_HOME_MAX_WIDTH + 1}px) and (max-width: ${TABLET_MAX_WIDTH}px)`,
  ).matches;
}

export function useMobileHomeMode() {
  const [mobile, setMobile] = useState(() => isMobileHomeMode());

  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${MOBILE_HOME_MAX_WIDTH}px)`);
    const apply = () => setMobile(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return mobile;
}
