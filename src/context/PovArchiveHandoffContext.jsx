import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useFieldNarrative } from './FieldNarrativeContext.jsx';
import {
  measureOrbHandoffBlend,
  measurePovArchiveHandoff,
  measurePovExitProgress,
  measurePovTrackProgress,
} from '../utils/povArchiveHandoff.js';
import { springStep } from '../utils/scrollMotion.js';

const PovArchiveHandoffContext = createContext(null);

const POV_SECTION_ID = 'point-of-view';
const ARCHIVE_SECTION_ID = 'me';

export function PovArchiveHandoffProvider({ children }) {
  const { prefersReducedMotion, setHandoffBlend } = useFieldNarrative();
  const [handoff, setHandoff] = useState(0);
  const [exitProgress, setExitProgress] = useState(0);
  const [povTrack, setPovTrack] = useState(0);
  const targetRef = useRef({ handoff: 0, exit: 0, track: 0 });
  const stateRef = useRef({ handoff: 0, velocity: 0 });

  const syncTargets = useCallback(() => {
    const vh = window.innerHeight;
    const povScroll = document.querySelector(`#${POV_SECTION_ID} .pov-scroll`);
    const archiveChapter = document.getElementById(ARCHIVE_SECTION_ID);

    let track = 0;
    let exit = 0;
    let h = 0;

    if (povScroll) {
      const povRect = povScroll.getBoundingClientRect();
      track = measurePovTrackProgress(povRect);
      exit = measurePovExitProgress(track);
    }

    if (povScroll && archiveChapter) {
      h = measurePovArchiveHandoff(
        povScroll.getBoundingClientRect(),
        archiveChapter.getBoundingClientRect(),
        vh,
      );
    } else if (archiveChapter) {
      const r = archiveChapter.getBoundingClientRect();
      h = r.top < vh * 0.88 ? 1 : 0;
    }

    targetRef.current = { handoff: h, exit, track };
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) {
      stateRef.current = { handoff: 0, velocity: 0 };
      setHandoff(0);
      setExitProgress(0);
      setPovTrack(0);
      setHandoffBlend(0);
      return undefined;
    }

    let raf = 0;
    let last = performance.now();

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      syncTargets();
      const next = springStep(
        stateRef.current.handoff,
        targetRef.current.handoff,
        stateRef.current.velocity,
        dt,
        { stiffness: 108, damping: 22, mass: 0.65 },
      );
      stateRef.current = next;
      const smooth = next.value;
      setHandoff(smooth);
      setExitProgress(targetRef.current.exit);
      setPovTrack(targetRef.current.track);
      setHandoffBlend(measureOrbHandoffBlend(smooth));
      raf = requestAnimationFrame(tick);
    };

    const onScroll = () => syncTargets();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    syncTargets();
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      setHandoffBlend(0);
    };
  }, [prefersReducedMotion, syncTargets, setHandoffBlend]);

  useEffect(() => {
    const root = document.querySelector('.home-scroll-root');
    if (!root) return undefined;
    root.style.setProperty('--pov-exit', String(exitProgress));
    root.style.setProperty('--archive-handoff', String(handoff));
    if (exitProgress > 0.04) {
      root.dataset.povExiting = 'true';
    } else {
      delete root.dataset.povExiting;
    }
    if (handoff > 0.06) {
      root.dataset.archiveHandoff = 'true';
    } else {
      delete root.dataset.archiveHandoff;
    }
    return () => {
      root.style.removeProperty('--pov-exit');
      root.style.removeProperty('--archive-handoff');
      delete root.dataset.povExiting;
      delete root.dataset.archiveHandoff;
    };
  }, [exitProgress, handoff]);

  const value = useMemo(
    () => ({
      handoff,
      exitProgress,
      povTrack,
      reducedMotion: prefersReducedMotion,
    }),
    [handoff, exitProgress, povTrack, prefersReducedMotion],
  );

  return (
    <PovArchiveHandoffContext.Provider value={value}>
      {children}
    </PovArchiveHandoffContext.Provider>
  );
}

export function usePovArchiveHandoff() {
  const ctx = useContext(PovArchiveHandoffContext);
  if (!ctx) {
    return {
      handoff: 0,
      exitProgress: 0,
      povTrack: 0,
      reducedMotion: false,
    };
  }
  return ctx;
}
