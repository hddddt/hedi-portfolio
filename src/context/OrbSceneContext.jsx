import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { resolveOrbScene } from '../data/orbScenes.js';

const OrbSceneContext = createContext(null);

export function OrbSceneProvider({ children }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);

  const orbScene = useMemo(
    () => resolveOrbScene({ activeChapterId, guideOpen, caseDetailOpen }),
    [activeChapterId, guideOpen, caseDetailOpen],
  );

  const value = useMemo(
    () => ({
      orbScene,
      guideOpen,
      caseDetailOpen,
      setGuideOpen,
      setCaseDetailOpen,
      setActiveChapterId,
    }),
    [orbScene, guideOpen, caseDetailOpen],
  );

  return <OrbSceneContext.Provider value={value}>{children}</OrbSceneContext.Provider>;
}

export function useOrbScene() {
  const ctx = useContext(OrbSceneContext);
  if (!ctx) {
    return {
      orbScene: 'landing',
      guideOpen: false,
      caseDetailOpen: false,
      setGuideOpen: () => {},
      setCaseDetailOpen: () => {},
      setActiveChapterId: () => {},
    };
  }
  return ctx;
}

/** Sync narrative chapter id into orb scene (render inside scroll layout). */
export function OrbSceneChapterSync({ activeId }) {
  const { setActiveChapterId } = useOrbScene();
  useEffect(() => {
    setActiveChapterId(activeId);
  }, [activeId, setActiveChapterId]);
  return null;
}
