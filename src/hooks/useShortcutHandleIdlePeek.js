import { useEffect, useRef, useState } from 'react';

const PEEK_INTERVAL_MIN_MS = 8000;
const PEEK_INTERVAL_RANGE_MS = 6000;
const PEEK_INTERVAL_BOOST_MIN_MS = 4500;
const PEEK_INTERVAL_BOOST_RANGE_MS = 3500;
const PEEK_HOLD_MIN_MS = 600;
const PEEK_HOLD_RANGE_MS = 400;
const PEEK_HOLD_BOOST_MIN_MS = 900;
const PEEK_HOLD_BOOST_RANGE_MS = 500;

/**
 * Randomized occasional peek for the collapsed shortcut handle (8–14s between peeks).
 * @param {{ enabled: boolean, paused: boolean, boost?: boolean, allowOnCoarsePointer?: boolean }} options
 */
export function useShortcutHandleIdlePeek({
  enabled,
  paused,
  boost = false,
  allowOnCoarsePointer = false,
}) {
  const [idlePeek, setIdlePeek] = useState(false);
  const timersRef = useRef({ delay: null, hold: null });
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;

    const clearTimers = () => {
      if (timersRef.current.delay) window.clearTimeout(timersRef.current.delay);
      if (timersRef.current.hold) window.clearTimeout(timersRef.current.hold);
      timersRef.current.delay = null;
      timersRef.current.hold = null;
    };

    if (!enabled || paused) {
      setIdlePeek(false);
      clearTimers();
      return clearTimers;
    }

    const coarse =
      typeof window !== 'undefined' &&
      window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (coarse && !allowOnCoarsePointer) {
      setIdlePeek(false);
      return clearTimers;
    }

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setIdlePeek(false);
      return clearTimers;
    }

    const scheduleNext = () => {
      clearTimers();
      const delay =
        (boost ? PEEK_INTERVAL_BOOST_MIN_MS : PEEK_INTERVAL_MIN_MS) +
        Math.random() * (boost ? PEEK_INTERVAL_BOOST_RANGE_MS : PEEK_INTERVAL_RANGE_MS);
      timersRef.current.delay = window.setTimeout(() => {
        if (cancelledRef.current) return;
        setIdlePeek(true);
        const hold =
          (boost ? PEEK_HOLD_BOOST_MIN_MS : PEEK_HOLD_MIN_MS) +
          Math.random() * (boost ? PEEK_HOLD_BOOST_RANGE_MS : PEEK_HOLD_RANGE_MS);
        timersRef.current.hold = window.setTimeout(() => {
          setIdlePeek(false);
          if (!cancelledRef.current) scheduleNext();
        }, hold);
      }, delay);
    };

    scheduleNext();

    return () => {
      cancelledRef.current = true;
      clearTimers();
      setIdlePeek(false);
    };
  }, [enabled, paused, boost]);

  return idlePeek;
}
