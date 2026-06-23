import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSmoothedScrollProgress } from '../../hooks/useSmoothedScrollProgress.js';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { povBeats } from '../../data/pointOfViewChapters.js';
import { povPhases } from '../../utils/scrollTrackConfigs.js';
import { trackScrollTargetY } from '../../utils/scrollTimeline.js';
import {
  measureWorkFloatIndex,
  measureWorkReleaseProgress,
  syncWorkStepAnchor,
  workCaseCopyLayerStyle,
  workCaseCopyPartStyle,
  workCaseCopyVisible,
  workCaseInVisualBand,
  workChapterAccent,
  workChapterEntryCopy,
  workChapterEntryRail,
  workChapterEntryVisual,
  workFrameEntryStyle,
  workRailOnesFlipStyle,
  workRailScrollStyle,
  workAtmosphereStrength,
  workSettledIndex,
  workSpineFloatIndex,
  workStageIndex,
  workTrackHeightVh,
  snapWorkCaseScrollY,
  workTrackScrollTargetY,
  workVisualCrossfade,
  WORK_SCROLL,
} from '../../utils/workChoreography.js';
import { measureCapabilityFloatIndex, measureCapabilityReleaseProgress } from '../../utils/capabilitiesChoreography.js';
import { HOME_CHAPTER_NAV_EVENT } from '../../utils/portfolioGuideTarget.js';
import { performHomeChapterNav } from '../../utils/homeChapterNav.js';
import { beginChapterTransition, endChapterTransition, isChapterTransition } from '../../utils/chapterTransitionLock.js';
import { homeCapabilities } from '../../data/homeScrollChapters.js';
import { measureChapterEntryProgress } from '../../utils/scrollMotion.js';
import { preloadImage } from '../../utils/scrollPerformance.js';
import {
  createTrackScrollTween,
  easeInOutCubic,
} from '../../utils/scrollTrack.js';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { caseFieldHue } from '../../data/fieldSemanticStates.js';
import { useProjectAccess } from '../../context/ProjectAccessContext.jsx';
import { WorkCaseDetail } from './WorkCaseDetail.jsx';
import { useMobileHomeMode } from '../../utils/mobileHomeMode.js';

const WORK_POV_HANDOFF_EVENT = 'portfolio:work-pov-handoff';

const WHEEL_STEP_THRESHOLD = 22;
const SCROLL_TWEEN_MS = 400;
const STEP_INPUT_LOCK_MS = 220;
/** Brief lock after Cap→Work handoff — keep at 0 so the next wheel step is immediate. */
const HANDOFF_INPUT_LOCK_MS = 0;
const PANEL_SNAP_EPSILON = 0.05;

/** Mac trackpad / mouse — deltaMode-aware vertical delta. */
function wheelDeltaY(e) {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  else if (e.deltaMode === 2) dy *= window.innerHeight;
  return dy;
}
const PIN_TOP_TOLERANCE_PX = 3;
const CHAPTER_ENTRY_DONE = 0.992;
const CHAPTER_EXIT_EPSILON = 0.12;
/** Dwell on last case before chapter exit can arm. */
const EXIT_ARM_DWELL_MS = 1000;
/** After penultimate→last step, block chapter exit (same trackpad gesture). */
const LAST_CASE_ARRIVAL_LOCK_MS = EXIT_ARM_DWELL_MS + STEP_INPUT_LOCK_MS;

function isChapterStickyPinned(rect) {
  return (
    rect.top >= -PIN_TOP_TOLERANCE_PX &&
    rect.top <= PIN_TOP_TOLERANCE_PX &&
    rect.bottom > window.innerHeight
  );
}

function formatCaseRailIndex(index) {
  return String(Math.max(1, index + 1)).padStart(2, '0');
}

function caseOpenLabel(item) {
  const title = item.narrativeBlock?.title ?? item.title;
  return `Open ${title} case study`;
}

function resolvePovScrollTrack() {
  return (
    document.querySelector('#point-of-view .pov-scroll') ??
    document.querySelector('[data-narrative-chapter="home-approach"] .pov-scroll') ??
    document.querySelector('.pov-scroll')
  );
}

function povFirstBeatScrollY() {
  const track = resolvePovScrollTrack();
  const beatN = povBeats.length;
  if (!track || beatN <= 1) return null;
  return trackScrollTargetY(track, povPhases(beatN), 0);
}

function capBlocksWorkWheel(activeId) {
  if (
    activeId === 'home-work-narrative' ||
    activeId === 'home-approach' ||
    isChapterTransition('cap-work')
  ) {
    return false;
  }
  const capTrack = document.querySelector('.capability-scroll');
  if (!capTrack) return false;
  const cr = capTrack.getBoundingClientRect();
  const vh = window.innerHeight;
  const capPinned = isChapterStickyPinned(cr);
  const capNear =
    capPinned || (cr.top < vh * 0.22 && cr.bottom > vh * 0.45);
  if (!capNear) return false;

  const capN = homeCapabilities.length;
  const rawFi = measureCapabilityFloatIndex(cr, capN);
  const releaseP = measureCapabilityReleaseProgress(cr, capN);
  const onLastCap = rawFi >= capN - 1 - 0.35 || releaseP > 0.01;

  if (onLastCap && releaseP < 0.98) return true;
  if (capPinned && releaseP < 0.82) return true;
  return false;
}

function capReleaseInProgress(activeId) {
  if (activeId === 'home-work-narrative' || activeId === 'home-approach') {
    return false;
  }
  const capTrack = document.querySelector('.capability-scroll');
  if (!capTrack) return false;
  const releaseP = measureCapabilityReleaseProgress(
    capTrack.getBoundingClientRect(),
    homeCapabilities.length,
  );
  return releaseP > 0.02 && releaseP < 0.96;
}

export function WorkNarrativeSection({ cases = [] }) {
  const isMobileHome = useMobileHomeMode();
  const { activeId } = useNarrativeScroll();
  const { unlocked, requestAccess, pendingCaseId, clearPendingCase } = useProjectAccess();
  const { setCaseDetailOpen, setWorkCaseFocus } = useOrbScene();
  const wrapRef = useRef(null);
  const hoverCaseIdRef = useRef(null);
  const guideScrollLockUntilRef = useRef(0);
  const activeCaseIndexRef = useRef(0);
  const stepAnchorRef = useRef(0);
  const caseTransitionLockedRef = useRef(false);
  const transitionFromRef = useRef(0);
  const targetCaseIndexRef = useRef(0);
  const inputLockUntilRef = useRef(0);
  const wheelStepConsumedRef = useRef(false);
  const wheelCooldownRef = useRef(false);
  const wheelAccumResetRef = useRef(null);
  const scrollTweenRef = useRef(null);
  const chapterExitArmedRef = useRef(false);
  const exitWheelStepsRef = useRef(0);
  const exitArmTimerRef = useRef(null);
  const lastCaseArrivalLockUntilRef = useRef(0);
  const exitWheelConsumedRef = useRef(false);
  const workExitingToPovRef = useRef(false);
  const displayCaseIndexRef = useRef(0);
  const entryProgressRef = useRef(1);
  const capHandoffReadyRef = useRef(false);
  const capHandoffNavActiveRef = useRef(false);
  const prevActiveIdRef = useRef(null);
  const [capHandoffSettled, setCapHandoffSettled] = useState(false);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [displayCaseIndex, setDisplayCaseIndex] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionSpan, setTransitionSpan] = useState({ from: 0, to: 0 });
  const [caseTransitioning, setCaseTransitioning] = useState(false);
  const [openCaseId, setOpenCaseId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  activeCaseIndexRef.current = activeCaseIndex;
  displayCaseIndexRef.current = displayCaseIndex;

  const scheduleChapterExitArm = useCallback(
    (caseIndex, panelCount) => {
      clearTimeout(exitArmTimerRef.current);
      exitWheelStepsRef.current = 0;
      if (caseIndex < panelCount - 1) {
        chapterExitArmedRef.current = false;
        return;
      }
      chapterExitArmedRef.current = false;
      exitArmTimerRef.current = window.setTimeout(() => {
        chapterExitArmedRef.current = true;
        exitWheelStepsRef.current = 0;
      }, EXIT_ARM_DWELL_MS);
    },
    [],
  );

  const applySettledCase = useCallback((index) => {
    const clamped = Math.min(cases.length - 1, Math.max(0, index));
    stepAnchorRef.current = clamped;
    activeCaseIndexRef.current = clamped;
    transitionFromRef.current = clamped;
    targetCaseIndexRef.current = clamped;
    setActiveCaseIndex(clamped);
    setDisplayCaseIndex(clamped);
  }, [cases.length]);

  useEffect(() => {
    setCaseDetailOpen(Boolean(openCaseId));
    return () => setCaseDetailOpen(false);
  }, [openCaseId, setCaseDetailOpen]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const onChange = () => setReducedMotion(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  const n = cases.length;
  useEffect(() => {
    if (cases[0]?.coverSrc) preloadImage(cases[0].coverSrc);
  }, [cases]);
  const entryProgress = useSmoothedScrollProgress(
    wrapRef,
    measureChapterEntryProgress,
    { stiffness: 90, damping: 24, mass: 0.7, enabled: !reducedMotion },
  );
  entryProgressRef.current = entryProgress;

  const capHandoffActive =
    capHandoffSettled ||
    capHandoffReadyRef.current ||
    capHandoffNavActiveRef.current;
  const effectiveEntryProgress = capHandoffActive ? 1 : entryProgress;
  const inChapterEntry =
    effectiveEntryProgress < CHAPTER_ENTRY_DONE && !capHandoffActive;

  useEffect(() => {
    if (workExitingToPovRef.current) return;
    if (
      activeId === 'home-approach' ||
      activeId === 'home-life-archive' ||
      activeId === 'home-landing'
    ) {
      setCapHandoffSettled(false);
    }
  }, [activeId]);

  /** Cap → Work via native scroll (not only wheel handoff event). */
  useEffect(() => {
    const prev = prevActiveIdRef.current;
    prevActiveIdRef.current = activeId;
    if (activeId !== 'home-work-narrative' || !n) return undefined;
    if (prev === 'home-work-narrative') return undefined;
    if (workExitingToPovRef.current) return undefined;
    if (isChapterTransition('cap-work') && prev === 'home-capabilities') return undefined;

    capHandoffReadyRef.current = true;
    setCapHandoffSettled(true);
    entryProgressRef.current = 1;
    wheelStepConsumedRef.current = false;
    wheelCooldownRef.current = false;
    chapterExitArmedRef.current = false;
    exitWheelStepsRef.current = 0;
    clearTimeout(exitArmTimerRef.current);

    const el = wrapRef.current;

    if (prev === 'home-approach') {
      inputLockUntilRef.current = performance.now() + HANDOFF_INPUT_LOCK_MS;
      workExitingToPovRef.current = false;
      if (el) {
        const rect = el.getBoundingClientRect();
        const rawFi = measureWorkFloatIndex(rect, n);
        const releaseP = measureWorkReleaseProgress(rect, n);
        const fromPovBelow = releaseP > 0.03 || rawFi >= n - 0.65;
        const idx = fromPovBelow
          ? n - 1
          : Math.min(n - 1, Math.max(0, Math.round(rawFi)));
        applySettledCase(idx);
        scheduleChapterExitArm(idx, n);
      } else {
        applySettledCase(n - 1);
        scheduleChapterExitArm(n - 1, n);
      }
      return undefined;
    }

    inputLockUntilRef.current = performance.now() + STEP_INPUT_LOCK_MS;

    const enteringFromCapOrLanding =
      prev === 'home-capabilities' || prev === 'home-landing' || prev == null;

    if (!enteringFromCapOrLanding) {
      if (el) {
        const rawFi = measureWorkFloatIndex(el.getBoundingClientRect(), n);
        syncWorkStepAnchor(rawFi, stepAnchorRef);
        const idx = Math.min(n - 1, Math.max(0, stepAnchorRef.current));
        applySettledCase(idx);
        scheduleChapterExitArm(idx, n);
      }
      return undefined;
    }

    if (prev === 'home-capabilities' && el) {
      const rawFi = measureWorkFloatIndex(el.getBoundingClientRect(), n);
      if (rawFi > 0.55) {
        syncWorkStepAnchor(rawFi, stepAnchorRef);
        applySettledCase(stepAnchorRef.current);
        scheduleChapterExitArm(stepAnchorRef.current, n);
        return undefined;
      }
    }

    applySettledCase(0);
    scheduleChapterExitArm(0, n);
    return undefined;
  }, [activeId, n, applySettledCase, scheduleChapterExitArm]);

  useEffect(() => {
    const onCapHandoff = () => {
      const el = wrapRef.current;
      if (!el || !n) return;
      if (workExitingToPovRef.current) return;
      if (activeCaseIndexRef.current > 0 || stepAnchorRef.current > 0) return;
      capHandoffNavActiveRef.current = true;
      capHandoffReadyRef.current = true;
      setCapHandoffSettled(true);
      entryProgressRef.current = 1;
      wheelStepConsumedRef.current = false;
      wheelCooldownRef.current = false;
      exitWheelConsumedRef.current = false;
      inputLockUntilRef.current = 0;
      applySettledCase(0);
      scheduleChapterExitArm(0, n);
    };
    window.addEventListener('portfolio:cap-work-handoff', onCapHandoff);
    return () => window.removeEventListener('portfolio:cap-work-handoff', onCapHandoff);
  }, [applySettledCase, n, scheduleChapterExitArm]);

  const visualScrollFi = useMemo(() => {
    if (inChapterEntry) return 0;
    if (caseTransitioning) {
      const { from, to } = transitionSpan;
      return from + (to - from) * transitionProgress;
    }
    return displayCaseIndex;
  }, [
    caseTransitioning,
    displayCaseIndex,
    inChapterEntry,
    transitionProgress,
    transitionSpan,
  ]);

  const isInputLocked = useCallback(() => {
    return (
      caseTransitionLockedRef.current ||
      wheelCooldownRef.current ||
      scrollTweenRef.current?.isRunning() ||
      performance.now() < inputLockUntilRef.current
    );
  }, []);

  useEffect(() => {
    if (activeId !== 'home-work-narrative' || openCaseId || !n) {
      setWorkCaseFocus(null);
      return;
    }
    if (hoverCaseIdRef.current) return;
    const settled = workSettledIndex(visualScrollFi, n);
    const caseId = cases[settled]?.id;
    if (caseId) {
      setWorkCaseFocus({ caseId, hue: caseFieldHue(caseId), strength: 0.36 });
    }
  }, [activeId, openCaseId, visualScrollFi, n, cases, setWorkCaseFocus]);

  const choreoIndex = useMemo(
    () => workSpineFloatIndex(visualScrollFi, n || 1),
    [visualScrollFi, n],
  );

  const idx = n ? workStageIndex(visualScrollFi, n) : 0;
  const c = n ? cases[idx] : null;
  const accentList = useMemo(() => cases.map((item) => item.accent), [cases]);
  const chapterAccent = useMemo(
    () => (n ? workChapterAccent(visualScrollFi, accentList, n) : '#3d5c56'),
    [visualScrollFi, accentList, n],
  );
  const atmosphereStrength = useMemo(
    () => workAtmosphereStrength(visualScrollFi, n, effectiveEntryProgress, inChapterEntry),
    [visualScrollFi, inChapterEntry, n, effectiveEntryProgress],
  );

  const scrollToCase = useCallback(
    (index, behavior = 'smooth', options = {}) => {
      const { force = false } = options;
      if (caseTransitionLockedRef.current && !force) return;

      const el = wrapRef.current;
      if (!el || n <= 1) return;

      const current = stepAnchorRef.current;
      let clamped = Math.min(n - 1, Math.max(0, index));

      if (!force && Math.abs(clamped - current) > 1) {
        clamped = current + Math.sign(clamped - current);
      }
      if (clamped === current && !force) {
        wheelStepConsumedRef.current = false;
        return;
      }

      wheelCooldownRef.current = true;

      if (!scrollTweenRef.current) {
        scrollTweenRef.current = createTrackScrollTween();
      }
      scrollTweenRef.current.cancel();

      wheelAccumResetRef.current?.();

      if (clamped < n - 1) {
        chapterExitArmedRef.current = false;
        exitWheelStepsRef.current = 0;
        clearTimeout(exitArmTimerRef.current);
      }

      caseTransitionLockedRef.current = true;
      transitionFromRef.current = current;
      targetCaseIndexRef.current = clamped;
      setTransitionSpan({ from: current, to: clamped });
      setTransitionProgress(0);
      setCaseTransitioning(true);

      const targetY = workTrackScrollTargetY(el, clamped, n);
      const finish = () => {
        const exactY = workTrackScrollTargetY(el, clamped, n);
        window.scrollTo(0, exactY);
        applySettledCase(clamped);
        setTransitionSpan({ from: clamped, to: clamped });
        setTransitionProgress(0);
        setCaseTransitioning(false);
        caseTransitionLockedRef.current = false;
        wheelCooldownRef.current = false;
        wheelStepConsumedRef.current = false;
        exitWheelConsumedRef.current = false;
        inputLockUntilRef.current = performance.now() + STEP_INPUT_LOCK_MS;
        wheelAccumResetRef.current?.();

        if (clamped === n - 1 && current < n - 1) {
          chapterExitArmedRef.current = false;
          exitWheelStepsRef.current = 0;
          clearTimeout(exitArmTimerRef.current);
          lastCaseArrivalLockUntilRef.current =
            performance.now() + LAST_CASE_ARRIVAL_LOCK_MS;
          exitArmTimerRef.current = window.setTimeout(() => {
            scheduleChapterExitArm(n - 1, n);
          }, LAST_CASE_ARRIVAL_LOCK_MS);
        } else {
          scheduleChapterExitArm(clamped, n);
        }
      };

      setTransitionProgress(0);

      if (reducedMotion || behavior === 'auto') {
        window.scrollTo(0, targetY);
        setTransitionProgress(1);
        finish();
        return;
      }

      scrollTweenRef.current.tweenTo(targetY, {
        duration: SCROLL_TWEEN_MS,
        ease: easeInOutCubic,
        onProgress: (linearP) => {
          setTransitionProgress(easeInOutCubic(linearP));
        },
        onComplete: finish,
      });
    },
    [applySettledCase, n, reducedMotion, scheduleChapterExitArm],
  );

  const startWorkPovHandoff = useCallback(() => {
    if (workExitingToPovRef.current) return;

    const targetY = povFirstBeatScrollY();
    if (targetY == null || !Number.isFinite(targetY)) return;

    workExitingToPovRef.current = true;
    chapterExitArmedRef.current = true;
    beginChapterTransition('work-pov');
    capHandoffReadyRef.current = true;
    setCapHandoffSettled(true);
    entryProgressRef.current = 1;
    scrollTweenRef.current?.cancel();
    caseTransitionLockedRef.current = false;
    setCaseTransitioning(false);
    wheelCooldownRef.current = false;
    wheelStepConsumedRef.current = false;
    applySettledCase(n - 1);
    window.dispatchEvent(new CustomEvent(WORK_POV_HANDOFF_EVENT));

    if (Math.abs(window.scrollY - targetY) < 16) {
      endChapterTransition('work-pov');
      workExitingToPovRef.current = false;
      return;
    }

    if (reducedMotion) {
      window.scrollTo(0, targetY);
      endChapterTransition('work-pov');
      workExitingToPovRef.current = false;
      return;
    }

    if (!performHomeChapterNav('point-of-view', 0)) {
      window.scrollTo(0, targetY);
      endChapterTransition('work-pov');
      workExitingToPovRef.current = false;
    }
  }, [applySettledCase, n, reducedMotion]);

  useEffect(() => {
    const onNav = (e) => {
      const { targetId, syncOnly } = e.detail ?? {};
      if (targetId === 'point-of-view' && syncOnly) {
        workExitingToPovRef.current = false;
        wheelCooldownRef.current = false;
        wheelStepConsumedRef.current = false;
        inputLockUntilRef.current = performance.now() + STEP_INPUT_LOCK_MS;
      }
      if (targetId === 'selected-work' && syncOnly) {
        capHandoffNavActiveRef.current = false;
        endChapterTransition('cap-work');
        wheelCooldownRef.current = false;
        wheelStepConsumedRef.current = false;
        inputLockUntilRef.current = 0;
      }
    };
    window.addEventListener(HOME_CHAPTER_NAV_EVENT, onNav);
    return () => window.removeEventListener(HOME_CHAPTER_NAV_EVENT, onNav);
  }, []);

  const isOnLastWorkCaseAt = useCallback(
    (rect) => {
      if (!n || !rect) return false;
      const anchor = stepAnchorRef.current;
      const caseIdx = activeCaseIndexRef.current;
      if (anchor < n - 1 || caseIdx < n - 1) return false;
      const rawFi = measureWorkFloatIndex(rect, n);
      const releaseP = measureWorkReleaseProgress(rect, n);
      return rawFi >= n - 1 - 0.22 || releaseP > 0.1;
    },
    [n],
  );

  const bumpCase = useCallback(
    (dir) => {
      if (wheelStepConsumedRef.current) return;
      if (caseTransitionLockedRef.current) return;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return;
      if (performance.now() < inputLockUntilRef.current) return;
      if (!n || n <= 1) return;

      const current = stepAnchorRef.current;
      const next = Math.min(n - 1, Math.max(0, current + dir));
      if (next === current) {
        if (dir === 1 && current >= n - 1) {
          const el = wrapRef.current;
          if (el && isOnLastWorkCaseAt(el.getBoundingClientRect())) {
            startWorkPovHandoff();
          }
        }
        wheelStepConsumedRef.current = false;
        return;
      }

      exitWheelConsumedRef.current = false;
      wheelStepConsumedRef.current = true;
      scrollToCase(next, reducedMotion ? 'auto' : 'smooth');
    },
    [n, reducedMotion, scrollToCase, startWorkPovHandoff, isOnLastWorkCaseAt],
  );

  useEffect(() => {
    if (!n || openCaseId) return undefined;

    const onScroll = () => {
      if (performance.now() < guideScrollLockUntilRef.current) return;

      const el = wrapRef.current;
      if (!el) return;

      if (workExitingToPovRef.current || isChapterTransition()) return;

      const rect = el.getBoundingClientRect();
      const rawFi = measureWorkFloatIndex(rect, n);
      const releaseP = measureWorkReleaseProgress(rect, n);
      const anchor = stepAnchorRef.current;
      const pinned = isChapterStickyPinned(rect);
      const tweenRunning = scrollTweenRef.current?.isRunning();
      const inputLocked =
        caseTransitionLockedRef.current ||
        wheelCooldownRef.current ||
        tweenRunning ||
        performance.now() < inputLockUntilRef.current;

      if (
        releaseP > 0.025 ||
        activeId === 'home-approach'
      ) {
        return;
      }

      if (pinned && n > 1) {
        const atStart = anchor <= 0;
        const leavingUp = atStart && rawFi < anchor - CHAPTER_EXIT_EPSILON;

        if (leavingUp) {
          if (!inputLocked && !caseTransitioning) {
            setDisplayCaseIndex(rawFi);
          }
          return;
        }

        if (inputLocked || caseTransitioning || isChapterTransition()) {
          return;
        }

        syncWorkStepAnchor(rawFi, stepAnchorRef);
        const synced = stepAnchorRef.current;
        if (Math.abs(rawFi - synced) < PANEL_SNAP_EPSILON) {
          setDisplayCaseIndex(synced);
        }
        return;
      }

      if (entryProgressRef.current < CHAPTER_ENTRY_DONE && !capHandoffReadyRef.current) {
        return;
      }

      if (tweenRunning || inputLocked || caseTransitioning) {
        return;
      }

      if (capReleaseInProgress(activeId) || !capHandoffReadyRef.current) return;

      const nearest = Math.round(rawFi);
      if (Math.abs(rawFi - nearest) < 0.14 && !isChapterTransition()) {
        const current = stepAnchorRef.current;
        if (nearest !== current && Math.abs(nearest - current) === 1) {
          applySettledCase(nearest);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [activeId, applySettledCase, caseTransitioning, isInputLocked, n, openCaseId]);

  useEffect(() => {
    if (isMobileHome || !n || openCaseId) return undefined;

    let wheelAccum = 0;

    wheelAccumResetRef.current = () => {
      wheelAccum = 0;
      exitWheelConsumedRef.current = false;
    };

    const tryWheelStep = (dir, rect) => {
      if (wheelStepConsumedRef.current) return false;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return false;
      if (performance.now() < inputLockUntilRef.current) return false;
      if (dir === 1 && rect && isOnLastWorkCaseAt(rect)) {
        startWorkPovHandoff();
        wheelAccum = 0;
        return true;
      }
      bumpCase(dir);
      wheelAccum = 0;
      return true;
    };

    const onWheel = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      if (rect.bottom < 48 || rect.top > vh + 48) return;

      const workPinned = isChapterStickyPinned(rect);
      const workEngaged =
        activeId === 'home-work-narrative' ||
        (workPinned && rect.bottom > vh * 0.42);
      const deltaY = wheelDeltaY(e);

      if (workEngaged && isOnLastWorkCaseAt(rect) && deltaY > 0) {
        if (activeId === 'home-approach') {
          return;
        }

        e.preventDefault();
        e.stopImmediatePropagation();

        if (workExitingToPovRef.current) {
          return;
        }

        if (scrollTweenRef.current?.isRunning()) {
          scrollTweenRef.current.cancel();
          setCaseTransitioning(false);
          caseTransitionLockedRef.current = false;
        }
        wheelCooldownRef.current = false;
        wheelStepConsumedRef.current = false;
        stepAnchorRef.current = n - 1;
        applySettledCase(n - 1);
        startWorkPovHandoff();
        return;
      }

      if (workExitingToPovRef.current) {
        return;
      }

      if (isChapterTransition('work-pov')) return;
      if (isChapterTransition('cap-work') && activeId !== 'home-work-narrative') return;

      if (capBlocksWorkWheel(activeId)) return;

      const capTrack = document.querySelector('.capability-scroll');
      if (capTrack && activeId === 'home-capabilities') {
        const cr = capTrack.getBoundingClientRect();
        const vhCap = window.innerHeight;
        const capInChapter =
          isChapterStickyPinned(cr) ||
          (cr.top < vhCap * 0.22 && cr.bottom > vhCap * 0.45);
        if (capInChapter) return;
      }

      if (!workEngaged) return;

      const workReady =
        activeId === 'home-work-narrative' ||
        capHandoffReadyRef.current ||
        workPinned;
      if (!workReady) return;

      const scrollingDown = deltaY > 0.5;
      const scrollingUp = deltaY < -0.5;
      if (!scrollingDown && !scrollingUp) return;

      const anchor = stepAnchorRef.current;
      const atFirst = anchor <= 0;

      if (scrollingUp && atFirst) {
        return;
      }

      if (
        wheelStepConsumedRef.current ||
        wheelCooldownRef.current ||
        scrollTweenRef.current?.isRunning() ||
        performance.now() < inputLockUntilRef.current
      ) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      const wheelDir = scrollingDown ? 1 : -1;

      if (Math.abs(deltaY) >= WHEEL_STEP_THRESHOLD) {
        tryWheelStep(wheelDir, rect);
        return;
      }

      wheelAccum += deltaY;

      if (wheelAccum >= WHEEL_STEP_THRESHOLD) {
        tryWheelStep(1, rect);
      } else if (wheelAccum <= -WHEEL_STEP_THRESHOLD) {
        tryWheelStep(-1, rect);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      wheelAccumResetRef.current = null;
    };
  }, [activeId, applySettledCase, bumpCase, isMobileHome, isOnLastWorkCaseAt, n, openCaseId, startWorkPovHandoff]);

  useEffect(() => {
    if (!n || openCaseId) return undefined;
    const onKey = (e) => {
      if (isInputLocked()) return;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const inWork =
        activeId === 'home-work-narrative' ||
        capHandoffReadyRef.current ||
        (rect.top < vh * 0.22 && rect.bottom > vh * 0.42);
      if (!inWork) return;
      if (!capHandoffReadyRef.current && entryProgressRef.current < CHAPTER_ENTRY_DONE) {
        return;
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        bumpCase(1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        bumpCase(-1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeId, bumpCase, n, openCaseId, isInputLocked]);

  useEffect(() => {
    if (!unlocked || !pendingCaseId) return;
    setOpenCaseId(pendingCaseId);
    clearPendingCase();
  }, [unlocked, pendingCaseId, clearPendingCase]);

  useEffect(() => {
    if (!openCaseId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenCaseId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openCaseId]);

  useEffect(() => {
    const onGuideOpenCase = (e) => {
      const caseId = e?.detail?.caseId;
      if (!caseId) return;
      if (!unlocked) {
        requestAccess(caseId);
        return;
      }
      setOpenCaseId(caseId);
    };
    window.addEventListener('portfolio-guide-open-case', onGuideOpenCase);
    return () => window.removeEventListener('portfolio-guide-open-case', onGuideOpenCase);
  }, [unlocked, requestAccess]);

  useEffect(() => {
    const goToWorkPanel = (panelIndex) => {
      if (!n) return;
      const nextIdx = Math.min(n - 1, Math.max(0, panelIndex));
      guideScrollLockUntilRef.current = performance.now() + 920;
      setOpenCaseId(null);
      scrollToCase(nextIdx, 'smooth', { force: true });
    };

    const onChapterNav = (e) => {
      const { targetId, panelIndex = 0, syncOnly } = e.detail ?? {};
      if (targetId !== 'selected-work') return;
      const nextIdx = Math.min(n - 1, Math.max(0, panelIndex));
      if (!syncOnly) {
        guideScrollLockUntilRef.current = performance.now() + 920;
      } else {
        guideScrollLockUntilRef.current = performance.now() + HANDOFF_INPUT_LOCK_MS;
      }
      setOpenCaseId(null);
      scrollTweenRef.current?.cancel();
      caseTransitionLockedRef.current = false;
      setCaseTransitioning(false);
      applySettledCase(nextIdx);
      capHandoffReadyRef.current = true;
      setCapHandoffSettled(true);
      const el = wrapRef.current;
      if (el) {
        const snapY = snapWorkCaseScrollY(el, nextIdx, n);
        if (Math.abs(window.scrollY - snapY) > 6) {
          window.scrollTo(0, snapY);
        }
      }
      if (!syncOnly) {
        goToWorkPanel(nextIdx);
      }
    };

    const onGuideFocusCase = (e) => {
      const caseId = e?.detail?.caseId;
      const panelIndex = e?.detail?.panelIndex;
      if (!caseId || !n) return;
      const fromId = cases.findIndex((item) => item.id === caseId);
      const nextIdx =
        typeof panelIndex === 'number' && panelIndex >= 0
          ? Math.min(n - 1, panelIndex)
          : fromId;
      if (nextIdx < 0) return;
      goToWorkPanel(nextIdx);
    };

    window.addEventListener(HOME_CHAPTER_NAV_EVENT, onChapterNav);
    window.addEventListener('portfolio-guide-focus-case', onGuideFocusCase);
    return () => {
      window.removeEventListener(HOME_CHAPTER_NAV_EVENT, onChapterNav);
      window.removeEventListener('portfolio-guide-focus-case', onGuideFocusCase);
    };
  }, [cases, n, scrollToCase]);

  useEffect(
    () => () => {
      scrollTweenRef.current?.cancel();
      clearTimeout(exitArmTimerRef.current);
    },
    [],
  );

  if (!n || !c) {
    return (
      <div className="work-narrative work-narrative--empty">
        <p className="work-narrative__empty">No case studies to show yet.</p>
      </div>
    );
  }

  const openItem = openCaseId ? cases.find((item) => item.id === openCaseId) : null;
  const trackVh = workTrackHeightVh(n);
  const frameEntryStyle = inChapterEntry
    ? workFrameEntryStyle(effectiveEntryProgress, reducedMotion)
    : undefined;
  const railEntryStyle = inChapterEntry
    ? workChapterEntryRail(effectiveEntryProgress, reducedMotion)
    : undefined;
  const railVisualFi = inChapterEntry
    ? 0
    : caseTransitioning
      ? visualScrollFi
      : activeCaseIndex;
  const railScrollStyle = inChapterEntry
    ? railEntryStyle
    : workRailScrollStyle(railVisualFi, n, reducedMotion);
  const workRevealed = !inChapterEntry || effectiveEntryProgress > WORK_SCROLL.approachEnd;
  const settledCaseIndex = inChapterEntry ? 0 : workSettledIndex(visualScrollFi, n);

  return (
    <>
      <section
        id="home-work-strongest"
        ref={wrapRef}
        className={`work-scroll work-scroll--snap${openItem ? ' work-scroll--detail-open' : ''}`}
        aria-hidden={openItem ? true : undefined}
        inert={openItem ? true : undefined}
        style={isMobileHome ? undefined : { height: `${trackVh}vh`, minHeight: `${trackVh}vh` }}
        aria-roledescription={isMobileHome ? undefined : 'carousel'}
        aria-label="Selected work"
      >
        <div className="work-scroll__snaps" aria-hidden="true">
          {cases.map((item) => (
            <div key={item.id} className="work-scroll__snap" />
          ))}
        </div>
        <div
          className="work-sticky"
          style={{
            '--wn-accent': chapterAccent,
            '--wn-accent-settled': cases[settledCaseIndex]?.accent ?? c.accent,
            '--wn-atmosphere': String(atmosphereStrength),
          }}
        >
          <div className="work-narrative__glow" aria-hidden="true" />
          <div className="work-narrative__wash" aria-hidden="true" />
          <div
            className={`work-narrative__frame motion-reveal-group${workRevealed ? ' is-visible' : ''}`}
            style={frameEntryStyle}
          >
            <div
              className={`work-narrative__rail motion-reveal-child${!inChapterEntry && !caseTransitioning ? ' is-rail-settled' : ''}`}
              style={isMobileHome ? { display: 'none' } : railScrollStyle}
              aria-hidden={isMobileHome ? true : undefined}
              aria-label={`Case ${formatCaseRailIndex(idx)} of 0${n}`}
            >
              <div className="work-narrative__rail-meter" aria-hidden="true">
                <span className="work-narrative__rail-digit work-narrative__rail-digit--lead">0</span>
                <span className="work-narrative__rail-flip work-narrative__rail-flip--scroll">
                  {cases.map((item, i) => (
                    <span
                      key={item.id}
                      className="work-narrative__rail-digit work-narrative__rail-digit--ones"
                      style={workRailOnesFlipStyle(railVisualFi, i, n)}
                    >
                      {i + 1}
                    </span>
                  ))}
                </span>
              </div>
              <span className="sr-only" aria-live="polite">
                {formatCaseRailIndex(idx)}
              </span>
            </div>

            <div
              className={`work-narrative__stage work-narrative__stage--spine motion-reveal-group${workRevealed ? ' is-visible' : ''}${isMobileHome ? ' work-narrative__stage--mobile' : ''}`}
            >
              {!isMobileHome
                ? cases.map((item, i) => {
                if (!isMobileHome && inChapterEntry && i !== 0) return null;
                if (!isMobileHome && !workCaseInVisualBand(visualScrollFi, i, n)) return null;
                const dist = i - choreoIndex;
                const isActive = isMobileHome ? false : i === settledCaseIndex && Math.abs(dist) < 0.42;
                const isNextPreview = !isMobileHome && dist > 0.32 && dist < 1.15 && !isActive;
                const visualStyle = isMobileHome
                  ? undefined
                  : inChapterEntry && i === 0
                  ? workChapterEntryVisual(effectiveEntryProgress, reducedMotion)
                  : workVisualCrossfade(visualScrollFi, i, reducedMotion, n);
                const locked = !unlocked;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`work-narrative__visual work-narrative__visual--track motion-reveal-child${isActive ? ' is-active' : ''}${isNextPreview ? ' is-adjacent is-next-preview' : ''}${Math.abs(dist) < 1.2 && !isActive && !isNextPreview ? ' is-adjacent' : ''}${locked ? ' work-narrative__visual--locked' : ''}`}
                    data-field-hue={caseFieldHue(item.id) ?? 'green'}
                    data-case-id={item.id}
                    style={{
                      ...(visualStyle ?? {}),
                      zIndex: visualStyle?.zIndex ?? 0,
                      '--case-accent': item.accent,
                    }}
                    onPointerEnter={isMobileHome ? undefined : () => {
                      hoverCaseIdRef.current = item.id;
                      setWorkCaseFocus({
                        caseId: item.id,
                        hue: caseFieldHue(item.id),
                        strength: 1,
                      });
                    }}
                    onPointerLeave={isMobileHome ? undefined : () => {
                      hoverCaseIdRef.current = null;
                      const caseId = cases[settledCaseIndex]?.id;
                      if (caseId) {
                        setWorkCaseFocus({
                          caseId,
                          hue: caseFieldHue(caseId),
                          strength: isActive ? 0.5 : 0.36,
                        });
                      }
                    }}
                    onFocus={isMobileHome ? undefined : () => {
                      hoverCaseIdRef.current = item.id;
                      setWorkCaseFocus({
                        caseId: item.id,
                        hue: caseFieldHue(item.id),
                        strength: 1,
                      });
                    }}
                    onBlur={isMobileHome ? undefined : () => {
                      hoverCaseIdRef.current = null;
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!unlocked) {
                        requestAccess(item.id);
                        return;
                      }
                      setOpenCaseId(item.id);
                    }}
                    aria-label={
                      locked ? `${caseOpenLabel(item)} — enter key to unlock` : caseOpenLabel(item)
                    }
                    aria-disabled={locked || undefined}
                  >
                    <span className="work-narrative__visual-inner">
                      {item.coverSrc ? (
                        <img
                          className="work-narrative__cover"
                          src={item.coverSrc}
                          alt=""
                          loading={Math.abs(i - idx) <= 1 ? 'eager' : 'lazy'}
                          decoding="async"
                          fetchPriority={i === idx ? 'high' : 'low'}
                          onError={(e) => {
                            e.currentTarget.style.opacity = '0.25';
                          }}
                        />
                      ) : null}
                      <span className="work-narrative__visual-hint">
                        {locked ? 'Enter key' : 'View case'}
                      </span>
                      {locked ? (
                        <span className="work-narrative__lock" aria-hidden="true">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M7 11V8a5 5 0 0 1 10 0v3M6 11h12v10H6V11z"
                              stroke="currentColor"
                              strokeWidth="1.5"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      ) : null}
                    </span>
                  </button>
                );
              })
                : null}
            </div>

            <div
              className={
                isMobileHome
                  ? 'work-narrative__mobile-list motion-reveal-child'
                  : 'work-narrative__copy work-narrative__copy--switch motion-reveal-child'
              }
            >
              {cases.map((item, i) => {
                if (!isMobileHome && inChapterEntry && i !== 0) return null;
                if (!isMobileHome && !workCaseCopyVisible(visualScrollFi, i, n)) return null;
                const layerStyle = isMobileHome
                  ? undefined
                  : workCaseCopyLayerStyle(visualScrollFi, i, reducedMotion, n);
                const titleStyle = isMobileHome
                  ? undefined
                  : inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'title', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'title', reducedMotion, n);
                const thesisStyle = isMobileHome
                  ? undefined
                  : inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'thesis', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'thesis', reducedMotion, n);
                const signalsStyle = isMobileHome
                  ? undefined
                  : inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'signals', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'signals', reducedMotion, n);
                const tagsStyle = isMobileHome
                  ? undefined
                  : inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'tags', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'tags', reducedMotion, n);
                const textReadable = isMobileHome
                  ? 1
                  : Math.max(
                      titleStyle.opacity ?? 0,
                      thesisStyle.opacity ?? 0,
                    );
                if (!isMobileHome && textReadable < 0.04 && (layerStyle.opacity ?? 0) < 0.04) {
                  return null;
                }
                const isActive = isMobileHome ? true : i === settledCaseIndex || textReadable > 0.72;
                return (
                <article
                  key={item.id}
                  id={`case-0${i + 1}`}
                  className={`work-narrative__layer work-narrative__layer--scroll work-narrative__layer--switch${isActive ? ' is-active' : ''}${isMobileHome ? ' work-narrative__mobile-case' : ''}`}
                  style={layerStyle}
                  aria-hidden={!isMobileHome && textReadable < 0.45}
                >
                  {isMobileHome ? (
                    <button
                      type="button"
                      className={`work-narrative__visual work-narrative__visual--mobile${!unlocked ? ' work-narrative__visual--locked' : ''}`}
                      data-case-id={item.id}
                      style={{ '--case-accent': item.accent }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!unlocked) {
                          requestAccess(item.id);
                          return;
                        }
                        setOpenCaseId(item.id);
                      }}
                      aria-label={
                        !unlocked
                          ? `${caseOpenLabel(item)} — enter key to unlock`
                          : caseOpenLabel(item)
                      }
                      aria-disabled={!unlocked || undefined}
                    >
                      <span className="work-narrative__visual-inner">
                        {item.coverSrc ? (
                          <img
                            className="work-narrative__cover"
                            src={item.coverSrc}
                            alt=""
                            loading={i <= 1 ? 'eager' : 'lazy'}
                            decoding="async"
                            fetchPriority={i === 0 ? 'high' : 'low'}
                            onError={(e) => {
                              e.currentTarget.style.opacity = '0.25';
                            }}
                          />
                        ) : null}
                        <span className="work-narrative__visual-hint">
                          {!unlocked ? 'Enter key' : 'View case'}
                        </span>
                      </span>
                    </button>
                  ) : null}
                  {item.narrativeBlock ? (
                    <>
                      <h3 className="work-narrative__title" style={titleStyle}>
                        {item.title}
                      </h3>
                      {item.narrativeBlock.thesis ? (
                        <p className="work-narrative__thesis" style={thesisStyle}>
                          {item.narrativeBlock.thesis}
                        </p>
                      ) : null}
                      {item.narrativeBlock.signals?.length ? (
                        <ul className="work-narrative__signals" style={signalsStyle}>
                          {item.narrativeBlock.signals.map((line) => (
                            <li key={line} className="work-narrative__signal">
                              {line}
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <ul
                        className="work-narrative__tags work-narrative__tags--primary"
                        aria-label="Key signals"
                        style={tagsStyle}
                      >
                        {(item.narrativeBlock.primaryTags ?? item.narrativeBlock.tags ?? [])
                          .slice(0, 3)
                          .map((tag) => (
                            <li key={tag}>
                              <span className="work-narrative__tag">{tag}</span>
                            </li>
                          ))}
                      </ul>
                    </>
                  ) : (
                    <>
                      <h3 className="work-narrative__title" style={titleStyle}>
                        {item.title}
                      </h3>
                      <p className="work-narrative__thesis" style={thesisStyle}>
                        {item.tension}
                      </p>
                      <ul className="work-narrative__tags" style={tagsStyle}>
                        <li>
                          <span className="work-narrative__tag">{item.signal}</span>
                        </li>
                      </ul>
                    </>
                  )}
                </article>
              );
              })}
            </div>
          </div>
        </div>
      </section>
      {openItem ? (
        <WorkCaseDetail
          key={openItem.id}
          item={openItem}
          allCases={cases}
          onSelectCase={setOpenCaseId}
          onClose={() => {
            setOpenCaseId(null);
            requestAnimationFrame(() => {
              wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }}
        />
      ) : null}
    </>
  );
}
