import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  computeFieldNarrative,
  measureOpeningScrollProgress,
} from '../utils/fieldNarrative.js';
import { measureCapWorkOrchestration } from '../utils/capabilitiesChoreography.js';
import { homeCapabilities } from '../data/homeScrollChapters.js';
import { useOpeningCapHandoffScrollTrigger } from '../hooks/useOpeningCapHandoffScrollTrigger.js';
import { computeOpeningBootAt } from '../utils/openingBootSequence.js';

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
  const [openingCapHandoff, setOpeningCapHandoff] = useState(0);
  const openingCapHandoffRef = useRef(0);
  const [openingCapExitWipe, setOpeningCapExitWipe] = useState(0);
  const openingCapExitWipeRef = useRef(0);
  const [openingCapThesisFade, setOpeningCapThesisFade] = useState(0);
  const openingCapThesisFadeRef = useRef(0);
  const [capabilityFloat, setCapabilityFloat] = useState(null);
  const [capWorkHandoff, setCapWorkHandoff] = useState(0);
  const capWorkHandoffRef = useRef(0);
  const frozenCapFloatRef = useRef(null);
  const [handoffBlend, setHandoffBlendState] = useState(0);
  const handoffBlendRef = useRef(0);
  const setHandoffBlend = useCallback((value) => {
    const v =
      value == null || !Number.isFinite(value) ? 0 : Math.max(0, Math.min(1, value));
    handoffBlendRef.current = v;
    setHandoffBlendState(v);
  }, []);
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
  const handoffZoneRef = useRef(0);
  const openingBootRef = useRef(computeOpeningBootAt(0, prefersReducedMotion));
  const updateOpeningBoot = useCallback((boot) => {
    openingBootRef.current = boot;
    if (typeof document === 'undefined') return;
    const root = document.querySelector('.home-scroll-root');
    if (!root) return;
    if ((boot?.complete ?? 0) < 0.98) {
      root.dataset.openingBootActive = 'true';
    } else {
      delete root.dataset.openingBootActive;
    }
    /* Plate surface release is owned by OpeningBridgeSection (post sphere paint). */
  }, []);

  const applyHandoffMapped = useCallback((mapped) => {
    const bootDone = (openingBootRef.current?.complete ?? 0) > 0.98;
    handoffZoneRef.current = mapped.zone;
    openingCapExitWipeRef.current = mapped.wipe;
    setOpeningCapExitWipe(mapped.wipe);
    openingCapHandoffRef.current = bootDone ? mapped.fieldHandoff : 0;
    setOpeningCapHandoff(bootDone ? mapped.fieldHandoff : 0);
    openingCapThesisFadeRef.current = mapped.thesisFade;
    setOpeningCapThesisFade(mapped.thesisFade);
    if (typeof document !== 'undefined') {
      const root = document.querySelector('.home-scroll-root');
      if (root) {
        root.style.setProperty('--hero-cap-handoff', String(mapped.fieldHandoff.toFixed(4)));
        root.style.setProperty('--opening-cap-exit-wipe', String(mapped.wipe.toFixed(4)));
        root.style.setProperty('--opening-cap-thesis-fade', String(mapped.thesisFade.toFixed(4)));
        if (mapped.zone > 0.02 && mapped.zone < 0.98) {
          root.dataset.openingHandoff = 'active';
        } else {
          delete root.dataset.openingHandoff;
        }
      }
    }
    if (mapped.zone < 0.04 && window.scrollY < window.innerHeight * 0.35) {
      openingCompleteRef.current = false;
    }
  }, []);

  useOpeningCapHandoffScrollTrigger({
    enabled: true,
    reduceMotion: prefersReducedMotion,
    onProgress: applyHandoffMapped,
  });

  const syncOpening = useCallback(() => {
    const el = openingScrollRef.current;
    const raw = measureOpeningScrollProgress(el, reduceMotionRef.current);
    const vh = typeof window !== 'undefined' ? window.innerHeight : 0;
    const r = el?.getBoundingClientRect();
    const capEl =
      typeof document !== 'undefined'
        ? document.getElementById('capabilities') ??
          document.querySelector('[data-narrative-chapter="home-capabilities"]')
        : null;
    const capRect = capEl?.getBoundingClientRect();
    const openingInView =
      r != null && r.top < vh * 0.92 && r.bottom > vh * 0.08;

    const capTrack =
      typeof document !== 'undefined' ? document.querySelector('.capability-scroll') : null;
    const workTrack =
      typeof document !== 'undefined' ? document.getElementById('home-work-strongest') : null;
    const capTrackRect = capTrack?.getBoundingClientRect() ?? null;
    const workTrackRect = workTrack?.getBoundingClientRect() ?? null;
    const capWork = measureCapWorkOrchestration(
      capTrackRect,
      workTrackRect,
      homeCapabilities.length,
      vh,
    );
    capWorkHandoffRef.current = capWork.handoff;
    setCapWorkHandoff(capWork.handoff);
    frozenCapFloatRef.current = capWork.frozenFloat;
    if (typeof document !== 'undefined') {
      const root = document.querySelector('.home-scroll-root');
      if (root) {
        root.style.setProperty('--cap-work-handoff', String(capWork.handoff.toFixed(4)));
      }
    }

    const pastOpening = r != null && r.bottom <= vh * 0.06;
    const capEntering =
      capRect != null &&
      capRect.top < vh * 0.48 &&
      capRect.bottom > vh * 0.12;

    const bootDone = (openingBootRef.current?.complete ?? 0) > 0.98;
    if (bootDone && pastOpening && capEntering && handoffZoneRef.current > 0.35) {
      openingCompleteRef.current = true;
    } else if (bootDone && raw >= 0.998 && !openingInView) {
      openingCompleteRef.current = true;
    } else if (openingInView && raw < 0.48 && handoffZoneRef.current < 0.04) {
      openingCompleteRef.current = false;
    }

    const nextProgress = openingCompleteRef.current ? 1 : raw;
    setProgress(nextProgress);
    setOpeningComplete(openingCompleteRef.current);
  }, []);

  const registerOpeningScroll = useCallback(
    (el) => {
      openingScrollRef.current = el;
      if (el) {
        requestAnimationFrame(syncOpening);
      }
    },
    [syncOpening],
  );

  useEffect(() => {
    const root = document.querySelector('.home-scroll-root');
    if (root) {
      root.style.setProperty('--hero-cap-handoff', '0');
      root.style.setProperty('--opening-cap-exit-wipe', '0');
      root.style.setProperty('--opening-cap-thesis-fade', '0');
      delete root.dataset.openingHandoff;
    }
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
    const bootDone = (openingBootRef.current?.complete ?? 0) > 0.98;
    if (bootDone && window.scrollY > vh * 1.25 && !el) {
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
      openingCapHandoff,
      openingCapHandoffRef,
      openingCapExitWipe,
      openingCapExitWipeRef,
      openingCapThesisFade,
      openingCapThesisFadeRef,
      capabilityFloat,
      setCapabilityFloat,
      capWorkHandoff,
      capWorkHandoffRef,
      frozenCapFloatRef,
      handoffBlend,
      handoffBlendRef,
      setHandoffBlend,
      depthFloatRef,
      setDepthFloat,
      springPos,
      setSpringPos,
      registerOpeningScroll,
      prefersReducedMotion,
      openingBootRef,
      updateOpeningBoot,
    }),
    [
      field,
      progress,
      openingComplete,
      openingCapHandoff,
      openingCapExitWipe,
      openingCapThesisFade,
      capabilityFloat,
      capWorkHandoff,
      handoffBlend,
      springPos,
      registerOpeningScroll,
      prefersReducedMotion,
      updateOpeningBoot,
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
      openingCapHandoff: 0,
      openingCapHandoffRef: { current: 0 },
      openingCapExitWipe: 0,
      openingCapExitWipeRef: { current: 0 },
      openingCapThesisFade: 0,
      openingCapThesisFadeRef: { current: 0 },
      capabilityFloat: null,
      setCapabilityFloat: () => {},
      capWorkHandoff: 0,
      capWorkHandoffRef: { current: 0 },
      frozenCapFloatRef: { current: null },
      handoffBlend: 0,
      handoffBlendRef: { current: 0 },
      setHandoffBlend: () => {},
      depthFloatRef: { current: null },
      setDepthFloat: () => {},
      springPos: { x: 0.5, y: 0.5 },
      setSpringPos: () => {},
      registerOpeningScroll: () => {},
      prefersReducedMotion: false,
      openingBootRef: { current: computeOpeningBootAt(9999, true) },
      updateOpeningBoot: () => {},
    };
  }
  return ctx;
}
