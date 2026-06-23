import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { computeFieldNarrative } from '../utils/fieldNarrative.js';
import { computeOpeningBootAt } from '../utils/openingBootSequence.js';
import { useScrollOrchestrator } from './ScrollOrchestratorContext.jsx';

const FieldNarrativeContext = createContext(null);

const DEFAULT_FIELD = computeFieldNarrative(0);

export function FieldNarrativeProvider({ children }) {
  const {
    snapshotRef,
    openingCompleteRef,
    handoffZoneRef,
    registerOpeningScroll,
    subscribe,
    setBootComplete,
    setBootInitialized,
    prefersReducedMotion: prmFromOrchestrator,
  } = useScrollOrchestrator();

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(prmFromOrchestrator);
  const [progress, setProgress] = useState(0);
  const [openingRawProgress, setOpeningRawProgress] = useState(0);
  const [openingComplete, setOpeningComplete] = useState(false);
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
  const openingBootRef = useRef(computeOpeningBootAt(0, prefersReducedMotion));

  const updateOpeningBoot = useCallback(
    (boot) => {
      openingBootRef.current = boot;
      setBootInitialized();
      setBootComplete((boot?.complete ?? 0) > 0.98);
    },
    [setBootComplete, setBootInitialized],
  );

  useEffect(() => {
    return subscribe((snapshot) => {
      const cap = snapshot.handoff.openingCap;
      openingCapHandoffRef.current = cap.fieldHandoff;
      openingCapExitWipeRef.current = cap.wipe;
      openingCapThesisFadeRef.current = cap.thesisFade;
      capWorkHandoffRef.current = snapshot.handoff.capWork;
      frozenCapFloatRef.current = snapshot.handoff.capWorkFrozenFloat;
      handoffBlendRef.current = snapshot.handoff.orbBlend;
      openingCompleteRef.current = snapshot.opening.openingComplete;

      setProgress((prev) =>
        Math.abs(prev - snapshot.opening.progress) > 0.002
          ? snapshot.opening.progress
          : prev,
      );
      setOpeningRawProgress((prev) =>
        Math.abs(prev - snapshot.opening.rawProgress) > 0.002
          ? snapshot.opening.rawProgress
          : prev,
      );
      setOpeningComplete((prev) =>
        prev !== snapshot.opening.openingComplete ? snapshot.opening.openingComplete : prev,
      );
      setOpeningCapHandoff((prev) =>
        Math.abs(prev - cap.fieldHandoff) > 0.003 ? cap.fieldHandoff : prev,
      );
      setOpeningCapExitWipe((prev) =>
        Math.abs(prev - cap.wipe) > 0.003 ? cap.wipe : prev,
      );
      setOpeningCapThesisFade((prev) =>
        Math.abs(prev - cap.thesisFade) > 0.003 ? cap.thesisFade : prev,
      );
      setCapWorkHandoff((prev) =>
        Math.abs(prev - snapshot.handoff.capWork) > 0.003 ? snapshot.handoff.capWork : prev,
      );
      setHandoffBlendState((prev) =>
        Math.abs(prev - snapshot.handoff.orbBlend) > 0.003 ? snapshot.handoff.orbBlend : prev,
      );
    });
  }, [subscribe, openingCompleteRef]);

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
      openingRawProgress,
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
      snapshotRef,
    }),
    [
      field,
      progress,
      openingRawProgress,
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
      snapshotRef,
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
      openingRawProgress: 0,
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
      snapshotRef: { current: null },
    };
  }
  return ctx;
}
