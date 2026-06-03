import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSmoothedScrollProgress } from '../../hooks/useSmoothedScrollProgress.js';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import {
  measureWorkFloatIndex,
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
  workTrackScrollTargetY,
  workVisualCrossfade,
  WORK_SCROLL,
} from '../../utils/workChoreography.js';
import { measureChapterEntryProgress } from '../../utils/scrollMotion.js';
import {
  createTrackScrollTween,
  easeInOutCubic,
} from '../../utils/scrollTrack.js';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { caseFieldHue } from '../../data/fieldSemanticStates.js';
import { useProjectAccess } from '../../context/ProjectAccessContext.jsx';
import { WorkCaseDetail } from './WorkCaseDetail.jsx';

const WHEEL_STEP_THRESHOLD = 22;
const SCROLL_TWEEN_MS = 480;
const STEP_INPUT_LOCK_MS = 480;
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
/** Scroll past last-case anchor before treating as intentional chapter exit. */
const CHAPTER_EXIT_SCROLL_VH = 0.22;
/** Dwell on last case before chapter exit can arm. */
const EXIT_ARM_DWELL_MS = 1000;
/** After penultimate→last step, block chapter exit (same trackpad gesture). */
const LAST_CASE_ARRIVAL_LOCK_MS = EXIT_ARM_DWELL_MS + STEP_INPUT_LOCK_MS;
const EXIT_WHEEL_THRESHOLD = 46;
const LAST_CASE_SCROLL_BUFFER_PX = 6;
const EXIT_STEPS_REQUIRED = 2;

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

function workLastCaseScrollY(trackEl, panelCount) {
  if (!trackEl || panelCount <= 1) return window.scrollY;
  return workTrackScrollTargetY(trackEl, panelCount - 1, panelCount);
}

function workScrollPastLastCase(trackEl, panelCount, bufferPx = LAST_CASE_SCROLL_BUFFER_PX) {
  return window.scrollY > workLastCaseScrollY(trackEl, panelCount) + bufferPx;
}

function workScrollPastExitThreshold(trackEl, panelCount) {
  const lastY = workLastCaseScrollY(trackEl, panelCount);
  return window.scrollY > lastY + window.innerHeight * CHAPTER_EXIT_SCROLL_VH;
}

/** Last case settled and post-arrival lock expired — avoids 3→4 swipe exiting chapter. */
function canConsiderWorkChapterExit(anchor, rawFi, panelCount, lockUntilMs) {
  if (panelCount <= 1 || anchor < panelCount - 1) return false;
  if (performance.now() < lockUntilMs) return false;
  if (Math.abs(rawFi - anchor) > PANEL_SNAP_EPSILON) return false;
  return true;
}

export function WorkNarrativeSection({ cases = [] }) {
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
  const entryProgressRef = useRef(1);
  const capHandoffReadyRef = useRef(false);
  const [capHandoffSettled, setCapHandoffSettled] = useState(false);
  const [activeCaseIndex, setActiveCaseIndex] = useState(0);
  const [displayCaseIndex, setDisplayCaseIndex] = useState(0);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const [transitionSpan, setTransitionSpan] = useState({ from: 0, to: 0 });
  const [caseTransitioning, setCaseTransitioning] = useState(false);
  const [openCaseId, setOpenCaseId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  activeCaseIndexRef.current = activeCaseIndex;

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
  const entryProgress = useSmoothedScrollProgress(
    wrapRef,
    measureChapterEntryProgress,
    { stiffness: 90, damping: 24, mass: 0.7, enabled: !reducedMotion },
  );
  entryProgressRef.current = entryProgress;

  const effectiveEntryProgress = capHandoffSettled ? 1 : entryProgress;
  const inChapterEntry =
    effectiveEntryProgress < CHAPTER_ENTRY_DONE && !capHandoffSettled;

  useEffect(() => {
    if (entryProgress >= CHAPTER_ENTRY_DONE) {
      setCapHandoffSettled(false);
    }
  }, [entryProgress]);

  useEffect(() => {
    const onCapHandoff = () => {
      const el = wrapRef.current;
      if (!el || !n) return;
      capHandoffReadyRef.current = true;
      setCapHandoffSettled(true);
      entryProgressRef.current = 1;
      wheelStepConsumedRef.current = false;
      wheelCooldownRef.current = false;
      exitWheelConsumedRef.current = false;
      lastCaseArrivalLockUntilRef.current = performance.now() + LAST_CASE_ARRIVAL_LOCK_MS;
      inputLockUntilRef.current = 0;
      const y = workTrackScrollTargetY(el, 0, n);
      window.scrollTo(0, y);
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
        wheelStepConsumedRef.current = false;
        return;
      }

      exitWheelConsumedRef.current = false;
      wheelStepConsumedRef.current = true;
      scrollToCase(next, reducedMotion ? 'auto' : 'smooth');
    },
    [n, reducedMotion, scrollToCase],
  );

  useEffect(() => {
    if (!n || openCaseId) return undefined;

    const onScroll = () => {
      if (performance.now() < guideScrollLockUntilRef.current) return;

      const el = wrapRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const rawFi = measureWorkFloatIndex(rect, n);
      const anchor = stepAnchorRef.current;
      const pinned = isChapterStickyPinned(rect);
      const tweenRunning = scrollTweenRef.current?.isRunning();
      const inputLocked =
        caseTransitionLockedRef.current ||
        wheelCooldownRef.current ||
        tweenRunning ||
        performance.now() < inputLockUntilRef.current;

      if (pinned && n > 1) {
        const atEnd = anchor >= n - 1;
        const atStart = anchor <= 0;
        const leavingDown =
          atEnd &&
          chapterExitArmedRef.current &&
          performance.now() >= lastCaseArrivalLockUntilRef.current &&
          workScrollPastExitThreshold(el, n);
        const leavingUp = atStart && rawFi < anchor - CHAPTER_EXIT_EPSILON;

        if (leavingDown || leavingUp) {
          if (!inputLocked) {
            setDisplayCaseIndex(rawFi);
          }
          return;
        }

        if (
          atEnd &&
          !inputLocked &&
          !caseTransitioning &&
          !tweenRunning &&
          performance.now() >= lastCaseArrivalLockUntilRef.current &&
          workScrollPastLastCase(el, n) &&
          (!chapterExitArmedRef.current || exitWheelStepsRef.current < EXIT_STEPS_REQUIRED)
        ) {
          window.scrollTo(0, workLastCaseScrollY(el, n));
          return;
        }
      }

      if (entryProgressRef.current < CHAPTER_ENTRY_DONE && !capHandoffReadyRef.current) {
        return;
      }

      if (tweenRunning || inputLocked || caseTransitioning) {
        return;
      }

      if (pinned) {
        if (Math.abs(rawFi - anchor) < PANEL_SNAP_EPSILON) {
          setDisplayCaseIndex(anchor);
        }
        return;
      }

      const nearest = Math.round(rawFi);
      if (Math.abs(rawFi - nearest) < 0.14) {
        applySettledCase(nearest);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [applySettledCase, caseTransitioning, isInputLocked, n, openCaseId]);

  useEffect(() => {
    if (reducedMotion || !n || openCaseId) return undefined;

    let wheelAccum = 0;
    let exitWheelAccum = 0;

    wheelAccumResetRef.current = () => {
      wheelAccum = 0;
      exitWheelAccum = 0;
      exitWheelConsumedRef.current = false;
    };

    const tryWheelStep = (dir) => {
      if (wheelStepConsumedRef.current) return false;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return false;
      if (performance.now() < inputLockUntilRef.current) return false;
      bumpCase(dir);
      wheelAccum = 0;
      return true;
    };

    const onWheel = (e) => {
      const capTrack = document.querySelector('.capability-scroll');
      if (capTrack && activeId === 'home-capabilities') {
        const cr = capTrack.getBoundingClientRect();
        if (isChapterStickyPinned(cr)) return;
      }

      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const workEngaged =
        activeId === 'home-work-narrative' ||
        (rect.top <= PIN_TOP_TOLERANCE_PX && rect.bottom > window.innerHeight * 0.45);
      if (!workEngaged) return;

      const isPinned = isChapterStickyPinned(rect);
      if (!isPinned) return;

      if (entryProgressRef.current < CHAPTER_ENTRY_DONE && !capHandoffReadyRef.current) {
        return;
      }

      const rawFi = measureWorkFloatIndex(rect, n);
      const deltaY = wheelDeltaY(e);
      const scrollingDown = deltaY > 0.5;
      const scrollingUp = deltaY < -0.5;
      if (!scrollingDown && !scrollingUp) return;

      const anchor = stepAnchorRef.current;
      const onLastCase = anchor >= n - 1;
      const atFirst = anchor <= 0;
      const exitReady = canConsiderWorkChapterExit(
        anchor,
        rawFi,
        n,
        lastCaseArrivalLockUntilRef.current,
      );

      if (scrollingUp && atFirst) {
        return;
      }

      if (scrollingDown && onLastCase) {
        if (
          exitReady &&
          chapterExitArmedRef.current &&
          exitWheelStepsRef.current >= EXIT_STEPS_REQUIRED
        ) {
          return;
        }

        e.preventDefault();
        wheelAccum = 0;

        if (!exitReady || isInputLocked() || !chapterExitArmedRef.current) {
          exitWheelAccum = 0;
          exitWheelConsumedRef.current = false;
          if (workScrollPastLastCase(el, n)) {
            window.scrollTo(0, workLastCaseScrollY(el, n));
          }
          return;
        }

        if (exitWheelConsumedRef.current) {
          return;
        }

        exitWheelAccum += deltaY;
        if (exitWheelAccum >= EXIT_WHEEL_THRESHOLD) {
          exitWheelAccum = 0;
          exitWheelConsumedRef.current = true;
          exitWheelStepsRef.current += 1;
          window.scrollTo(0, workLastCaseScrollY(el, n));
        }
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
        tryWheelStep(wheelDir);
        return;
      }

      wheelAccum += deltaY;

      if (wheelAccum >= WHEEL_STEP_THRESHOLD) {
        tryWheelStep(1);
      } else if (wheelAccum <= -WHEEL_STEP_THRESHOLD) {
        tryWheelStep(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      wheelAccumResetRef.current = null;
    };
  }, [activeId, bumpCase, n, openCaseId, reducedMotion, isInputLocked]);

  useEffect(() => {
    if (!n || openCaseId) return undefined;
    const onKey = (e) => {
      if (isInputLocked()) return;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!isChapterStickyPinned(rect)) return;
      if (entryProgressRef.current < CHAPTER_ENTRY_DONE && !capHandoffReadyRef.current) {
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
  }, [bumpCase, n, openCaseId, isInputLocked]);

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
      guideScrollLockUntilRef.current = performance.now() + 920;
      setOpenCaseId(null);
      scrollToCase(nextIdx, 'smooth', { force: true });
    };
    window.addEventListener('portfolio-guide-focus-case', onGuideFocusCase);
    return () => window.removeEventListener('portfolio-guide-focus-case', onGuideFocusCase);
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
        style={{ height: `${trackVh}vh`, minHeight: `${trackVh}vh` }}
        aria-roledescription="carousel"
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
              style={railScrollStyle}
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
              className={`work-narrative__stage work-narrative__stage--spine motion-reveal-group${workRevealed ? ' is-visible' : ''}`}
            >
              {cases.map((item, i) => {
                if (inChapterEntry && i !== 0) return null;
                if (!workCaseInVisualBand(visualScrollFi, i, n)) return null;
                const dist = i - choreoIndex;
                const isActive = i === settledCaseIndex && Math.abs(dist) < 0.42;
                const isNextPreview = dist > 0.32 && dist < 1.15 && !isActive;
                const visualStyle = inChapterEntry && i === 0
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
                      ...visualStyle,
                      zIndex: visualStyle.zIndex ?? 0,
                      '--case-accent': item.accent,
                    }}
                    onPointerEnter={() => {
                      hoverCaseIdRef.current = item.id;
                      setWorkCaseFocus({
                        caseId: item.id,
                        hue: caseFieldHue(item.id),
                        strength: 1,
                      });
                    }}
                    onPointerLeave={() => {
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
                    onFocus={() => {
                      hoverCaseIdRef.current = item.id;
                      setWorkCaseFocus({
                        caseId: item.id,
                        hue: caseFieldHue(item.id),
                        strength: 1,
                      });
                    }}
                    onBlur={() => {
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
                      locked ? `${caseOpenLabel(item)} — password required` : caseOpenLabel(item)
                    }
                    aria-disabled={locked || undefined}
                  >
                    <span className="work-narrative__visual-inner">
                      {item.coverSrc ? (
                        <img
                          className="work-narrative__cover"
                          src={item.coverSrc}
                          alt=""
                          loading={i === idx ? 'eager' : 'lazy'}
                          decoding="async"
                        />
                      ) : null}
                      <span className="work-narrative__visual-hint">
                        {locked ? 'Password required' : 'View case'}
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
              })}
            </div>

            <div className="work-narrative__copy work-narrative__copy--switch motion-reveal-child">
              {cases.map((item, i) => {
                if (inChapterEntry && i !== 0) return null;
                if (!workCaseCopyVisible(visualScrollFi, i, n)) return null;
                const layerStyle = workCaseCopyLayerStyle(visualScrollFi, i, reducedMotion, n);
                const titleStyle = inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'title', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'title', reducedMotion, n);
                const aiLayerStyle = inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'aiLayer', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'aiLayer', reducedMotion, n);
                const thesisStyle = inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'thesis', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'thesis', reducedMotion, n);
                const signalsStyle = inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'signals', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'signals', reducedMotion, n);
                const tagsStyle = inChapterEntry && i === 0
                  ? workChapterEntryCopy(effectiveEntryProgress, 'tags', reducedMotion)
                  : workCaseCopyPartStyle(visualScrollFi, i, 'tags', reducedMotion, n);
                const textReadable = Math.max(
                  titleStyle.opacity ?? 0,
                  aiLayerStyle.opacity ?? 0,
                  thesisStyle.opacity ?? 0,
                );
                if (textReadable < 0.04 && (layerStyle.opacity ?? 0) < 0.04) {
                  return null;
                }
                const isActive = i === settledCaseIndex || textReadable > 0.72;
                return (
                <article
                  key={item.id}
                  id={`case-0${i + 1}`}
                  className={`work-narrative__layer work-narrative__layer--scroll work-narrative__layer--switch${isActive ? ' is-active' : ''}`}
                  style={layerStyle}
                  aria-hidden={textReadable < 0.45}
                >
                  {item.narrativeBlock ? (
                    <>
                      <h3 className="work-narrative__title" style={titleStyle}>
                        {item.title}
                      </h3>
                      <p className="work-narrative__ai-layer" style={aiLayerStyle}>
                        {item.narrativeBlock.subtitle}
                      </p>
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
                      <p className="work-narrative__ai-layer" style={aiLayerStyle}>
                        {item.layer}
                      </p>
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
