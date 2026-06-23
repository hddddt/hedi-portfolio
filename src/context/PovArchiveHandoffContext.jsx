import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useFieldNarrative } from './FieldNarrativeContext.jsx';
import { useScrollOrchestrator } from './ScrollOrchestratorContext.jsx';

const PovArchiveHandoffContext = createContext(null);

export function PovArchiveHandoffProvider({ children }) {
  const { prefersReducedMotion, setHandoffBlend } = useFieldNarrative();
  const { subscribe } = useScrollOrchestrator();
  const [handoff, setHandoff] = useState(0);
  const [exitProgress, setExitProgress] = useState(0);
  const [povTrack, setPovTrack] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      setHandoff(0);
      setExitProgress(0);
      setPovTrack(0);
      setHandoffBlend(0);
      return undefined;
    }

    return subscribe((snapshot) => {
      setHandoff((prev) =>
        Math.abs(prev - snapshot.handoff.archiveHandoff) > 0.003
          ? snapshot.handoff.archiveHandoff
          : prev,
      );
      setExitProgress((prev) =>
        Math.abs(prev - snapshot.handoff.povExit) > 0.003 ? snapshot.handoff.povExit : prev,
      );
      setPovTrack((prev) =>
        Math.abs(prev - snapshot.pov.track.trackProgress) > 0.003
          ? snapshot.pov.track.trackProgress
          : prev,
      );
      setHandoffBlend(snapshot.handoff.orbBlend);
    });
  }, [prefersReducedMotion, subscribe, setHandoffBlend]);

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
    <PovArchiveHandoffContext.Provider value={value}>{children}</PovArchiveHandoffContext.Provider>
  );
}

export function usePovArchiveHandoff() {
  const ctx = useContext(PovArchiveHandoffContext);
  if (!ctx) {
    throw new Error('usePovArchiveHandoff must be used within PovArchiveHandoffProvider');
  }
  return ctx;
}
