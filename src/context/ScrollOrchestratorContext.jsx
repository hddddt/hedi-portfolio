import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { homeCapabilities } from '../data/homeScrollChapters.js';
import { povBeats } from '../data/pointOfViewChapters.js';
import { narrativeChapters } from '../data/narrativeChapters.js';
import { measureOpeningScrollProgress } from '../utils/fieldNarrative.js';
import { measureOpeningCapHandoff } from '../utils/openingCapHandoff.js';
import {
  measurePovArchiveHandoff,
  measurePovExitProgress,
  measureOrbHandoffBlend,
} from '../utils/povArchiveHandoff.js';
import { measureCapWorkOrchestration } from '../utils/capabilitiesChoreography.js';
import { isPortfolioGuidePanelLocked } from '../utils/portfolioGuidePanelState.js';
import { isMobileHomeMode } from '../utils/mobileHomeMode.js';
import { applyScrollPerformanceRootAttrs, prefersReducedMotion } from '../utils/scrollPerformance.js';
import { measureTrack, trackScrollTargetY, trackScrollablePx } from '../utils/scrollTimeline.js';
import {
  capabilityPhases,
  workPhases,
  povPhases,
} from '../utils/scrollTrackConfigs.js';
import { springStep } from '../utils/scrollMotion.js';
import { HOME_CHAPTER_NAV_EVENT } from '../utils/homeChapterNav.js';
import { resolveWorkChapterEntryScrollY } from '../utils/workChoreography.js';

const CAP_WORK_HANDOFF_EVENT = 'portfolio:cap-work-handoff';
const WORK_POV_HANDOFF_EVENT = 'portfolio:work-pov-handoff';

/** Guide / nav target ids → narrative chapter ids. */
const NAV_TARGET_CHAPTER = {
  'selected-work': 'home-work-narrative',
  'point-of-view': 'home-approach',
  capabilities: 'home-capabilities',
};

const ScrollOrchestratorContext = createContext(null);

const EMPTY_TRACK = {
  trackProgress: 0,
  traveled: 0,
  scrollable: 1,
  activePhaseId: '',
  activePhaseIndex: 0,
  phaseProgress: 0,
  activeIndex: 0,
  releaseProgress: 0,
  floatIndex: 0,
};

function rectTop(el) {
  if (!el) return 0;
  return el.getBoundingClientRect().top + window.scrollY;
}

/**
 * Chapter scroll range for deterministic activeId.
 * @param {HTMLElement | null} measureEl
 * @param {number} vh
 */
function chapterScrollRange(measureEl, vh) {
  if (!measureEl) return null;
  const top = rectTop(measureEl);
  const height = measureEl.offsetHeight;
  const scrollable = Math.max(0, height - vh);
  return {
    start: top,
    scrollEnd: top + scrollable,
    end: top + height,
  };
}

function buildChapterRanges(chapterRegistry, vh) {
  const ranges = [];
  for (const ch of narrativeChapters) {
    const getEl = chapterRegistry.get(ch.id);
    const measureEl = getEl?.() ?? null;
    const range = chapterScrollRange(measureEl, vh);
    if (!range) continue;
    ranges.push({ id: ch.id, ...range });
  }
  return ranges;
}

function confirmChapterLatch(latchId, scrollY, vh) {
  if (latchId === 'home-work-narrative') {
    const track = document.getElementById('home-work-strongest');
    if (!track) return false;
    const count = Math.max(1, track.querySelectorAll('.work-narrative__layer').length);
    const targetY = resolveWorkChapterEntryScrollY(track, 0, count);
    if (scrollY >= targetY - vh * 0.14) return true;
    const wr = track.getBoundingClientRect();
    return wr.top <= 12 && wr.bottom > vh * 0.45;
  }
  if (latchId === 'home-approach') {
    const track =
      document.querySelector('#point-of-view .pov-scroll') ??
      document.querySelector('.home-pov .pov-scroll');
    if (!track) return false;
    const beatN = Math.max(1, povBeats.length);
    const targetY = trackScrollTargetY(track, povPhases(beatN), 0, vh);
    const workTrack = document.getElementById('home-work-strongest');
    let y = targetY;
    if (workTrack instanceof HTMLElement) {
      const rect = workTrack.getBoundingClientRect();
      const scrollable = trackScrollablePx(workTrack.offsetHeight, vh);
      y = Math.max(y, rect.top + scrollY + scrollable + Math.round(vh * 0.02));
    }
    if (scrollY >= y - vh * 0.14) return true;
    const pr = track.getBoundingClientRect();
    return pr.top <= 12 && pr.bottom > vh * 0.45;
  }
  return true;
}

function detectPinnedStickyChapter(capRect, workRect, povRect, vh) {
  const pinTol = 8;
  if (workRect && workRect.top <= pinTol && workRect.bottom > vh * 0.5) {
    return 'home-work-narrative';
  }
  if (capRect && capRect.top <= pinTol && capRect.bottom > vh * 0.5) {
    return 'home-capabilities';
  }
  if (povRect && povRect.top <= pinTol && povRect.bottom > vh * 0.5) {
    return 'home-approach';
  }
  return null;
}

function resolveActiveChapterId(ranges, scrollY, vh, archiveHandoff, pinnedChapterId = null) {
  if (archiveHandoff > 0.42) {
    const archive = ranges.find((r) => r.id === 'home-life-archive');
    if (archive && scrollY + vh * 0.35 >= archive.start - vh * 0.12) {
      return 'home-life-archive';
    }
  }

  if (pinnedChapterId) {
    return pinnedChapterId;
  }

  const probe = scrollY + vh * 0.32;

  for (let i = ranges.length - 1; i >= 0; i--) {
    const r = ranges[i];
    if (!r?.start && r?.start !== 0) continue;
    const rangeEnd =
      r.id === 'home-life-archive'
        ? r.end
        : Math.max(r.scrollEnd + vh * 0.08, r.start + vh);
    if (probe >= r.start && probe < rangeEnd) {
      return r.id;
    }
  }

  if (probe >= ranges[ranges.length - 1]?.scrollEnd) {
    return ranges[ranges.length - 1]?.id ?? narrativeChapters[0]?.id;
  }

  return narrativeChapters[0]?.id ?? 'home-landing';
}

function writeRootCssVars(root, snapshot) {
  if (!root || isPortfolioGuidePanelLocked()) return;
  if (isMobileHomeMode()) {
    root.style.setProperty('--hero-cap-handoff', '0');
    root.style.setProperty('--opening-cap-exit-wipe', '0');
    root.style.setProperty('--opening-cap-thesis-fade', '0');
    root.style.setProperty('--cap-work-handoff', '0');
    root.style.setProperty('--pov-exit', '0');
    root.style.setProperty('--archive-handoff', '0');
    delete root.dataset.openingHandoff;
    delete root.dataset.povExiting;
    delete root.dataset.archiveHandoff;
    return;
  }
  const h = snapshot.handoff.openingCap;
  root.style.setProperty('--hero-cap-handoff', h.fieldHandoff.toFixed(4));
  root.style.setProperty('--opening-cap-exit-wipe', h.wipe.toFixed(4));
  root.style.setProperty('--opening-cap-thesis-fade', h.thesisFade.toFixed(4));
  root.style.setProperty('--cap-work-handoff', snapshot.handoff.capWork.toFixed(4));
  root.style.setProperty('--pov-exit', snapshot.handoff.povExit.toFixed(4));
  root.style.setProperty('--archive-handoff', snapshot.handoff.archiveHandoff.toFixed(4));

  if (h.zone > 0.02 && h.zone < 0.98) {
    root.dataset.openingHandoff = 'active';
  } else {
    delete root.dataset.openingHandoff;
  }
  if (snapshot.handoff.povExit > 0.04) {
    root.dataset.povExiting = 'true';
  } else {
    delete root.dataset.povExiting;
  }
  if (snapshot.handoff.archiveHandoff > 0.06) {
    root.dataset.archiveHandoff = 'true';
  } else {
    delete root.dataset.archiveHandoff;
  }
}

export function ScrollOrchestratorProvider({ children }) {
  const rootRef = useRef(null);
  const openingRef = useRef(null);
  const chapterRegistry = useRef(new Map());
  const reduceMotionRef = useRef(prefersReducedMotion());

  const snapshotRef = useRef({
    scrollReady: false,
    fieldReady: false,
    activeChapterId: narrativeChapters[0]?.id ?? 'home-landing',
    opening: { progress: 0, track: { ...EMPTY_TRACK } },
    capabilities: { track: { ...EMPTY_TRACK } },
    work: { track: { ...EMPTY_TRACK } },
    pov: { track: { ...EMPTY_TRACK } },
    handoff: {
      openingCap: { zone: 0, wipe: 0, fieldHandoff: 0, thesisFade: 0, openingComplete: 0 },
      capWork: 0,
      povExit: 0,
      archiveHandoff: 0,
      orbBlend: 0,
    },
  });

  const handoffSpringRef = useRef({ value: 0, velocity: 0 });
  const openingCompleteRef = useRef(false);
  const handoffZoneRef = useRef(0);
  const bootCompleteRef = useRef(false);
  const bootInitializedRef = useRef(false);
  const layoutMeasuredRef = useRef(false);
  const lastActiveIdRef = useRef(narrativeChapters[0]?.id ?? 'home-landing');
  const chapterNavLatchRef = useRef(null);
  const chapterNavLatchPendingClearRef = useRef(false);
  const listenersRef = useRef(new Set());

  const subscribe = useCallback((fn) => {
    listenersRef.current.add(fn);
    fn(snapshotRef.current);
    return () => listenersRef.current.delete(fn);
  }, []);

  const [scrollReady, setScrollReady] = useState(false);
  const [fieldReady, setFieldReady] = useState(false);
  const [activeChapterId, setActiveChapterId] = useState(
    narrativeChapters[0]?.id ?? 'home-landing',
  );

  const registerScrollRoot = useCallback((el) => {
    rootRef.current = el;
    if (el) {
      applyScrollPerformanceRootAttrs(el);
      el.dataset.scrollReady = 'false';
      el.dataset.fieldReady = 'false';
    }
  }, []);

  const registerOpeningScroll = useCallback((el) => {
    openingRef.current = el;
    if (el) layoutMeasuredRef.current = true;
  }, []);

  const registerChapterMeasure = useCallback((id, getElement) => {
    chapterRegistry.current.set(id, getElement);
    return () => chapterRegistry.current.delete(id);
  }, []);

  const setBootComplete = useCallback((complete) => {
    bootCompleteRef.current = complete;
  }, []);

  const setBootInitialized = useCallback(() => {
    bootInitializedRef.current = true;
  }, []);

  const tick = useCallback(() => {
    if (typeof document !== 'undefined' && document.hidden) return;

    const root = rootRef.current;
    const vh = window.innerHeight;
    const scrollY = window.scrollY;
    const reduceMotion = reduceMotionRef.current;
    const mobileHome = isMobileHomeMode();

    const openingEl = openingRef.current;
    const openingRect = openingEl?.getBoundingClientRect() ?? null;
    const openingProgress = measureOpeningScrollProgress(openingEl, reduceMotion);

    const capTrack = document.querySelector('.capability-scroll');
    const capSticky = document.querySelector('.capability-sticky');
    const workTrack = document.getElementById('home-work-strongest');
    const povTrack = document.querySelector('#point-of-view .pov-scroll') ??
      document.querySelector('.pov-scroll');
    const archiveChapter = document.getElementById('me');

    const capPhases = capabilityPhases(homeCapabilities.length);
    const workCaseCount = document.querySelectorAll('#home-work-strongest .work-narrative__layer')
      .length;
    const workN = Math.max(1, workCaseCount || 4);
    const workPhaseList = workPhases(workN);
    const povPhaseList = povPhases(povBeats.length);

    const capRect = capTrack?.getBoundingClientRect() ?? null;
    const workRect = workTrack?.getBoundingClientRect() ?? null;
    const povRect = povTrack?.getBoundingClientRect() ?? null;

    const capTrackMeasure = measureTrack(capRect, capPhases, vh);
    const workTrackMeasure = measureTrack(workRect, workPhaseList, vh);
    const povTrackMeasure = measureTrack(povRect, povPhaseList, vh);

    const openingCapRaw = measureOpeningCapHandoff({
      openingRect,
      capStickyRect: capSticky?.getBoundingClientRect() ?? null,
      capChapterRect: document.getElementById('capabilities')?.getBoundingClientRect() ?? null,
      openingProgress,
      viewportHeight: vh,
      reduceMotion,
    });

    const bootDone = bootCompleteRef.current;
    const openingCap = bootDone
      ? openingCapRaw
      : { ...openingCapRaw, fieldHandoff: 0, zone: openingCapRaw.zone };

    handoffZoneRef.current = openingCap.zone;

    const capWork = measureCapWorkOrchestration(
      capRect,
      workRect,
      homeCapabilities.length,
      vh,
    );

    const povTrackProgress = povTrackMeasure.trackProgress;
    const povExit = measurePovExitProgress(povTrackProgress);
    let archiveTarget = 0;
    if (povTrack && archiveChapter) {
      archiveTarget = measurePovArchiveHandoff(
        povRect,
        archiveChapter.getBoundingClientRect(),
        vh,
      );
    } else if (archiveChapter) {
      const ar = archiveChapter.getBoundingClientRect();
      archiveTarget = ar.top < vh * 0.88 ? 1 : 0;
    }

    if (reduceMotion) {
      handoffSpringRef.current = { value: archiveTarget, velocity: 0 };
    } else {
      handoffSpringRef.current = springStep(
        handoffSpringRef.current.value,
        archiveTarget,
        handoffSpringRef.current.velocity,
        1 / 60,
        { stiffness: 108, damping: 22, mass: 0.65 },
      );
    }
    const archiveHandoff = handoffSpringRef.current.value;

    const ranges = buildChapterRanges(chapterRegistry.current, vh);
    const allChaptersMeasured = ranges.length === narrativeChapters.length;

    let nextActiveId = lastActiveIdRef.current ?? narrativeChapters[0]?.id ?? 'home-landing';
    if (allChaptersMeasured && layoutMeasuredRef.current) {
      if (chapterNavLatchRef.current) {
        nextActiveId = chapterNavLatchRef.current;
        if (
          chapterNavLatchPendingClearRef.current &&
          confirmChapterLatch(chapterNavLatchRef.current, scrollY, vh)
        ) {
          chapterNavLatchRef.current = null;
          chapterNavLatchPendingClearRef.current = false;
        }
      } else {
        nextActiveId = resolveActiveChapterId(
          ranges,
          scrollY,
          vh,
          archiveHandoff,
          detectPinnedStickyChapter(capRect, workRect, povRect, vh),
        );
      }
    } else if (scrollY < vh * 0.45) {
      nextActiveId = narrativeChapters[0]?.id ?? 'home-landing';
    }

    const openingInView =
      openingRect != null && openingRect.top < vh * 0.92 && openingRect.bottom > vh * 0.08;
    const pastOpening = openingRect != null && openingRect.bottom <= vh * 0.06;
    const capEntering =
      capRect != null && capRect.top < vh * 0.48 && capRect.bottom > vh * 0.12;

    if (bootDone && pastOpening && capEntering && openingCap.zone > 0.35) {
      openingCompleteRef.current = true;
    } else if (bootDone && openingProgress >= 0.998 && !openingInView) {
      openingCompleteRef.current = true;
    } else if (mobileHome && scrollY > vh * 0.35) {
      openingCompleteRef.current = true;
    } else if (
      !isPortfolioGuidePanelLocked() &&
      openingInView &&
      openingProgress < 0.48 &&
      openingCap.zone < 0.04
    ) {
      openingCompleteRef.current = false;
    }

    const snapshot = {
      scrollReady: layoutMeasuredRef.current,
      fieldReady: layoutMeasuredRef.current && openingEl != null,
      activeChapterId: nextActiveId,
      scrollY,
      vh,
      opening: {
        progress: openingCompleteRef.current ? 1 : openingProgress,
        rawProgress: openingProgress,
        openingComplete: openingCompleteRef.current,
        track: { ...EMPTY_TRACK, trackProgress: openingProgress },
      },
      capabilities: { track: capTrackMeasure },
      work: { track: workTrackMeasure, caseCount: workN },
      pov: { track: povTrackMeasure },
      handoff: {
        openingCap,
        capWork: capWork.handoff,
        capWorkFrozenFloat: capWork.frozenFloat,
        povExit,
        archiveHandoff,
        orbBlend: measureOrbHandoffBlend(archiveHandoff),
      },
    };

    snapshotRef.current = snapshot;

    if (root) {
      writeRootCssVars(root, snapshot);
      root.dataset.scrollReady = snapshot.scrollReady ? 'true' : 'false';
      root.dataset.fieldReady = snapshot.fieldReady ? 'true' : 'false';
    }

    if (snapshot.scrollReady && !scrollReady) setScrollReady(true);
    if (snapshot.fieldReady && !fieldReady) setFieldReady(true);
    if (nextActiveId !== lastActiveIdRef.current) {
      lastActiveIdRef.current = nextActiveId;
      setActiveChapterId(nextActiveId);
    }

    listenersRef.current.forEach((fn) => fn(snapshot));
  }, [scrollReady, fieldReady]);

  useEffect(() => {
    const onCapWorkHandoff = () => {
      chapterNavLatchRef.current = 'home-work-narrative';
      chapterNavLatchPendingClearRef.current = false;
    };
    const onWorkPovHandoff = () => {
      chapterNavLatchRef.current = 'home-approach';
      chapterNavLatchPendingClearRef.current = false;
    };
    const onChapterNav = (e) => {
      const { targetId, prepare, syncOnly } = e.detail ?? {};
      const chapterId = NAV_TARGET_CHAPTER[targetId];
      if (prepare && chapterId) {
        chapterNavLatchRef.current = chapterId;
        chapterNavLatchPendingClearRef.current = false;
      }
      if (syncOnly && chapterId && chapterNavLatchRef.current === chapterId) {
        chapterNavLatchPendingClearRef.current = true;
      }
    };
    window.addEventListener(CAP_WORK_HANDOFF_EVENT, onCapWorkHandoff);
    window.addEventListener(WORK_POV_HANDOFF_EVENT, onWorkPovHandoff);
    window.addEventListener(HOME_CHAPTER_NAV_EVENT, onChapterNav);
    return () => {
      window.removeEventListener(CAP_WORK_HANDOFF_EVENT, onCapWorkHandoff);
      window.removeEventListener(WORK_POV_HANDOFF_EVENT, onWorkPovHandoff);
      window.removeEventListener(HOME_CHAPTER_NAV_EVENT, onChapterNav);
    };
  }, []);

  useEffect(() => {
    reduceMotionRef.current = prefersReducedMotion();
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    let raf = 0;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        layoutMeasuredRef.current = true;
      });
    });

    const loop = () => {
      tick();
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
    };
  }, [tick]);

  const value = useMemo(
    () => ({
      scrollReady,
      fieldReady,
      activeChapterId,
      snapshotRef,
      openingCompleteRef,
      handoffZoneRef,
      registerScrollRoot,
      registerOpeningScroll,
      registerChapterMeasure,
      setBootComplete,
      setBootInitialized,
      subscribe,
      prefersReducedMotion: reduceMotionRef.current,
    }),
    [
      scrollReady,
      fieldReady,
      activeChapterId,
      registerScrollRoot,
      registerOpeningScroll,
      registerChapterMeasure,
      setBootComplete,
      setBootInitialized,
      subscribe,
    ],
  );

  return (
    <ScrollOrchestratorContext.Provider value={value}>{children}</ScrollOrchestratorContext.Provider>
  );
}

export function useScrollOrchestrator() {
  const ctx = useContext(ScrollOrchestratorContext);
  if (!ctx) {
    throw new Error('useScrollOrchestrator must be used within ScrollOrchestratorProvider');
  }
  return ctx;
}

export function useScrollOrchestratorOptional() {
  return useContext(ScrollOrchestratorContext);
}
