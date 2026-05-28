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

  const registerOpeningScroll = useCallback((el) => {
    openingScrollRef.current = el;
  }, []);

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
    const onScroll = () => {
      setProgress(
        measureOpeningScrollProgress(openingScrollRef.current, reduceMotionRef.current),
      );
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
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
