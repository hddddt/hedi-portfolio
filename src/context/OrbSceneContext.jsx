import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { resolveOrbScene } from '../data/orbScenes.js';
import { caseFieldHue, FIELD_HUE_CSS } from '../data/fieldSemanticStates.js';

const OrbSceneContext = createContext(null);

export function OrbSceneProvider({ children }) {
  const [guideOpen, setGuideOpen] = useState(false);
  const [caseDetailOpen, setCaseDetailOpen] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(null);
  const [contactBlend, setContactBlend] = useState(0);
  const [workCaseFocus, setWorkCaseFocusState] = useState(
    /** @type {{ caseId: string | null, hue: string | null, strength: number } | null} */ (null),
  );
  const [navFieldHint, setNavFieldHintState] = useState(
    /** @type {{ hue: string, strength: number } | null} */ (null),
  );

  const setWorkCaseFocus = useCallback((focus) => {
    if (!focus || !focus.caseId) {
      setWorkCaseFocusState(null);
      return;
    }
    const hue = focus.hue ?? caseFieldHue(focus.caseId);
    const strength =
      typeof focus.strength === 'number' && Number.isFinite(focus.strength)
        ? Math.max(0, Math.min(1, focus.strength))
        : 0;
    setWorkCaseFocusState({ caseId: focus.caseId, hue, strength });
  }, []);

  const setNavFieldHint = useCallback((hint) => {
    if (!hint?.hue) {
      setNavFieldHintState(null);
      return;
    }
    setNavFieldHintState({
      hue: hint.hue,
      strength:
        typeof hint.strength === 'number' && Number.isFinite(hint.strength)
          ? Math.max(0, Math.min(1, hint.strength))
          : 0.22,
    });
  }, []);

  const orbScene = useMemo(
    () => resolveOrbScene({ activeChapterId, guideOpen, caseDetailOpen, contactBlend }),
    [activeChapterId, guideOpen, caseDetailOpen, contactBlend],
  );

  const value = useMemo(
    () => ({
      orbScene,
      guideOpen,
      caseDetailOpen,
      contactBlend,
      workCaseFocus,
      navFieldHint,
      setGuideOpen,
      setCaseDetailOpen,
      setActiveChapterId,
      setContactBlend,
      setWorkCaseFocus,
      setNavFieldHint,
    }),
    [
      orbScene,
      guideOpen,
      caseDetailOpen,
      contactBlend,
      workCaseFocus,
      navFieldHint,
      setWorkCaseFocus,
      setNavFieldHint,
    ],
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
      contactBlend: 0,
      workCaseFocus: null,
      navFieldHint: null,
      setGuideOpen: () => {},
      setCaseDetailOpen: () => {},
      setActiveChapterId: () => {},
      setContactBlend: () => {},
      setWorkCaseFocus: () => {},
      setNavFieldHint: () => {},
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

/** Scroll-driven contact convergence within Beyond chapter. */
export function OrbSceneContactSync() {
  const { setContactBlend } = useOrbScene();

  useEffect(() => {
    const contact = document.getElementById('home-contact');
    if (!contact) return undefined;

    const measure = () => {
      const vh = window.innerHeight;
      const r = contact.getBoundingClientRect();
      if (r.top > vh * 0.92) {
        setContactBlend(0);
        return;
      }
      const start = vh * 0.72;
      const end = vh * 0.28;
      const raw = 1 - (r.top - end) / (start - end);
      setContactBlend(Math.max(0, Math.min(1, raw)));
    };

    measure();
    window.addEventListener('scroll', measure, { passive: true });
    window.addEventListener('resize', measure, { passive: true });
    return () => {
      window.removeEventListener('scroll', measure);
      window.removeEventListener('resize', measure);
    };
  }, [setContactBlend]);

  return null;
}

const SCENE_PRIMARY_HUE = {
  landing: 'green',
  capabilities: 'green',
  work: 'green',
  pov: 'blue',
  me: 'amber',
  contact: 'green',
  guide: 'blue',
  case: 'green',
};

/** Publish semantic hue on document root for CSS interaction tokens. */
export function OrbSceneSemanticRoot({ activeId, orbScene }) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.fieldScene = orbScene ?? 'landing';
    root.dataset.fieldChapter = activeId ?? 'home-landing';
    const scene = orbScene ?? 'landing';
    const primary = SCENE_PRIMARY_HUE[scene] ?? 'green';
    const tokens =
      scene === 'contact'
        ? {
            border: 'rgba(72, 82, 74, 0.22)',
            glow: 'rgba(120, 132, 118, 0.08)',
            wash: 'rgba(120, 132, 118, 0.05)',
            focus: 'rgba(88, 98, 90, 0.38)',
          }
        : FIELD_HUE_CSS[primary];
    root.style.setProperty('--field-accent-border', tokens.border);
    root.style.setProperty('--field-accent-glow', tokens.glow);
    root.style.setProperty('--field-accent-wash', tokens.wash);
    root.style.setProperty('--field-accent-focus', tokens.focus);
    return () => {
      delete root.dataset.fieldScene;
      delete root.dataset.fieldChapter;
      root.style.removeProperty('--field-accent-border');
      root.style.removeProperty('--field-accent-glow');
      root.style.removeProperty('--field-accent-wash');
      root.style.removeProperty('--field-accent-focus');
    };
  }, [activeId, orbScene]);

  return null;
}
