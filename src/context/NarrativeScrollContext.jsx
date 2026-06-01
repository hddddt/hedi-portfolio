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
    const vh = window.innerHeight;
    const centerY = vh * 0.36;

    /** Ch 05 — prefer over ch 04 only once corridor handoff has started (avoids overlap). */
    const archiveRec = registry.current.get('home-life-archive');
    const archiveNode = archiveRec?.getElement?.();
    if (archiveNode) {
      const r = archiveNode.getBoundingClientRect();
      const handoffRaw = parseFloat(
        document.querySelector('.home-scroll-root')?.style.getPropertyValue('--archive-handoff') ??
          '0',
      );
      const povExitRaw = parseFloat(
        document.querySelector('.home-scroll-root')?.style.getPropertyValue('--pov-exit') ?? '0',
      );
      const handoffReady = handoffRaw > 0.38 || povExitRaw > 0.55;
      if (handoffReady && r.top < vh * 0.68 && r.bottom > 56) {
        if (lastActiveRef.current !== 'home-life-archive') {
          lastActiveRef.current = 'home-life-archive';
          setActiveId('home-life-archive');
          setAmbientKey(archiveRec.ambient ?? 'archive');
        }
        return;
      }
    }

    const workRec = registry.current.get('home-work-narrative');
    const workNode = workRec?.getElement?.();
    if (workNode) {
      const wr = workNode.getBoundingClientRect();
      if (wr.top <= 12 && wr.bottom > vh * 0.5) {
        if (lastActiveRef.current !== 'home-work-narrative') {
          lastActiveRef.current = 'home-work-narrative';
          setActiveId('home-work-narrative');
          setAmbientKey(workRec.ambient ?? 'work');
        }
        return;
      }
    }

    let bestId = null;
    let bestDist = Infinity;
    for (const ch of chapters) {
      const rec = registry.current.get(ch.id);
      const node = rec?.getElement?.();
      if (!node) continue;
      const r = node.getBoundingClientRect();
      if (r.bottom < 48 || r.top > vh - 24) continue;
      let d;
      if (ch.id === 'home-capabilities' || ch.id === 'home-work-narrative') {
        /* Tall sticky tracks — pin line; only ignore when scrolled past */
        if (r.top < -vh * 0.12) continue;
        d = Math.abs(r.top) + Math.max(0, r.top) * 0.4;
      } else {
        const mid = (r.top + r.bottom) / 2;
        const pinBias = r.top <= 16 && r.bottom > vh * 0.55 ? Math.abs(r.top) * 0.35 : 0;
        d = Math.abs(mid - centerY) + pinBias;
      }
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
