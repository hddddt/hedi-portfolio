import { useEffect, useState } from 'react';

/**
 * True while scroll events are firing and for `settleMs` after the last event.
 * @param {number} [settleMs]
 */
export function useScrollActivityPause(settleMs = 420) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      setActive(true);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setActive(false), settleMs);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.clearTimeout(timer);
    };
  }, [settleMs]);

  return active;
}
