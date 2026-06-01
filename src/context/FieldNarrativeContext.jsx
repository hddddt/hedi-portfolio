import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { computeFieldNarrative, measureOpeningScrollProgress } from '../utils/fieldNarrative.js';

const FieldNarrativeContext = createContext(null);

const DEFAULT_FIELD = computeFieldNarrative(0);

export function FieldNarrativeProvider({ children }) {
  const openingScrollRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [progress, setProgress] = useState(0);
  const [openingComplete, setOpeningComplete] = useState(false);
  const openingCompleteRef = useRef(false);
  const [capabilityFloat, setCapabilityFloat] = useState(null);
  const depthFloatRef = useRef(null);
  const setDepthFloat = useCallback((value) => {
    if (value == null) {
      depthFloatRef.current = null;
      return;
    }
    depthFloatRef.current =
      typeof value === 'number' && Number.isFinite(value) ? value : null;
  }, []);
  const [springPos, setSpringPos] = useState({ x: 0.5, y: 0.5 });
  const timeRef = useRef(0);

  const syncOpening = useCallback(() => {
    const el = openingScrollRef.current;
    const raw = measureOpeningScrollProgress(el, reduceMotionRef.current);
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
    const pastOpening =
      el &&
      (() => {
        const r = el.getBoundingClientRect();
        return r.bottom <= vh * 0.12;
      })();
    const openingInView =
      el &&
      (() => {
        const r = el.getBoundingClientRect();
        return r.top < vh * 0.92 && r.bottom > vh * 0.08;
      })();

    if (pastOpening || (raw >= 0.999 && !openingInView)) {
      openingCompleteRef.current = true;
    } else if (openingInView) {
      openingCompleteRef.current = false;
    }

    const nextProgress = openingCompleteRef.current ? 1 : raw;
    setProgress(nextProgress);
    setOpeningComplete(openingCompleteRef.current);
  }, []);

  const registerOpeningScroll = useCallback(
    (el) => {
      openingScrollRef.current = el;
      if (el) requestAnimationFrame(syncOpening);
    },
    [syncOpening],
  );

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(reduceMotionRef.current);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
      setPrefersReducedMotion(mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    window.addEventListener('scroll', syncOpening, { passive: true });
    window.addEventListener('resize', syncOpening, { passive: true });
    syncOpening();
    return () => {
      window.removeEventListener('scroll', syncOpening);
      window.removeEventListener('resize', syncOpening);
    };
  }, [syncOpening]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const el = openingScrollRef.current;
    const vh = window.innerHeight;
    if (window.scrollY > vh * 1.25 && !el) {
      openingCompleteRef.current = true;
      setProgress(1);
      setOpeningComplete(true);
    }
    return undefined;
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      timeRef.current = 0;
      return undefined;
    }
    let raf = 0;
    let t0 = performance.now();
    const tick = (now) => {
      timeRef.current = (now - t0) / 1000;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  const field = useMemo(
    () =>
      computeFieldNarrative(progress, {
        prm: prefersReducedMotion,
        springPos,
        time: timeRef.current,
      }),
    [progress, prefersReducedMotion, springPos],
  );

  const value = useMemo(
    () => ({
      field,
      progress,
      openingComplete,
      capabilityFloat,
      setCapabilityFloat,
      depthFloatRef,
      setDepthFloat,
      springPos,
      setSpringPos,
      registerOpeningScroll,
      prefersReducedMotion,
    }),
    [
      field,
      progress,
      openingComplete,
      capabilityFloat,
      springPos,
      registerOpeningScroll,
      prefersReducedMotion,
    ],
  );

  return (
    <FieldNarrativeContext.Provider value={value}>{children}</FieldNarrativeContext.Provider>
  );
}

export function useFieldNarrative() {
  const ctx = useContext(FieldNarrativeContext);
  if (!ctx) {
    return {
      field: DEFAULT_FIELD,
      progress: 0,
      openingComplete: false,
      capabilityFloat: null,
      setCapabilityFloat: () => {},
      depthFloatRef: { current: null },
      setDepthFloat: () => {},
      springPos: { x: 0.5, y: 0.5 },
      setSpringPos: () => {},
      registerOpeningScroll: () => {},
      prefersReducedMotion: false,
    };
  }
  return ctx;
}
