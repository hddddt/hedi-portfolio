import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

const NarrativeScrollContext = createContext(null);

export function NarrativeScrollProvider({ chapters, children }) {
  const registry = useRef(new Map());
  const lastActiveRef = useRef(null);
  const [activeId, setActiveId] = useState(chapters[0]?.id ?? null);
  const [ambientKey, setAmbientKey] = useState(chapters[0]?.ambient ?? 'default');

  const registerChapter = useCallback((id, getElement, ambient) => {
    registry.current.set(id, { getElement, ambient });
    return () => {
      registry.current.delete(id);
    };
  }, []);

  const resolveActive = useCallback(() => {
    const centerY = window.innerHeight * 0.36;
    let bestId = null;
    let bestDist = Infinity;
    for (const ch of chapters) {
      const rec = registry.current.get(ch.id);
      const node = rec?.getElement?.();
      if (!node) continue;
      const r = node.getBoundingClientRect();
      if (r.bottom < 48 || r.top > window.innerHeight - 24) continue;
      const mid = (r.top + r.bottom) / 2;
      const d = Math.abs(mid - centerY);
      if (d < bestDist) {
        bestDist = d;
        bestId = ch.id;
      }
    }
    if (!bestId) return;
    if (bestId === lastActiveRef.current) return;
    lastActiveRef.current = bestId;
    setActiveId(bestId);
    const ak = chapters.find((c) => c.id === bestId)?.ambient ?? 'default';
    setAmbientKey(ak);
  }, [chapters]);

  useEffect(() => {
    const onScroll = () => resolveActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    requestAnimationFrame(onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [resolveActive]);

  const value = useMemo(
    () => ({
      chapters,
      activeId,
      ambientKey,
      registerChapter,
    }),
    [chapters, activeId, ambientKey, registerChapter],
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
