import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react';
import { useScrollOrchestrator } from './ScrollOrchestratorContext.jsx';

const NarrativeScrollContext = createContext(null);

export function NarrativeScrollProvider({ chapters, children }) {
  const { activeChapterId, registerChapterMeasure } = useScrollOrchestrator();

  const registerChapter = useCallback(
    (id, getElement, _ambient) => registerChapterMeasure(id, getElement),
    [registerChapterMeasure],
  );

  const ambientKey = useMemo(() => {
    const ch = chapters.find((c) => c.id === activeChapterId);
    return ch?.ambient ?? 'default';
  }, [chapters, activeChapterId]);

  const value = useMemo(
    () => ({
      chapters,
      activeId: activeChapterId,
      ambientKey,
      registerChapter,
    }),
    [chapters, activeChapterId, ambientKey, registerChapter],
  );

  return (
    <NarrativeScrollContext.Provider value={value}>{children}</NarrativeScrollContext.Provider>
  );
}

export function useNarrativeScroll() {
  const ctx = useContext(NarrativeScrollContext);
  if (!ctx) {
    throw new Error('useNarrativeScroll must be used within NarrativeScrollProvider');
  }
  return ctx;
}
