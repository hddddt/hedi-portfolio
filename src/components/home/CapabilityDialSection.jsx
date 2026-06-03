import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSmoothedScrollProgress } from '../../hooks/useSmoothedScrollProgress.js';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import {
  CAPABILITY_THEMES,
  capabilitySectionCopy,
  homeCapabilities,
  homeScrollChapters,
} from '../../data/homeScrollChapters.js';
import { openingCapHandoffVisual } from '../../utils/fieldNarrative.js';
import { signalGreenFieldPresentation } from './organicFieldMotion.js';
import {
  capabilitiesEntryLayers,
  capabilitiesFieldParallax,
  capabilityAmbientStyleFromNarrative,
  capabilityArcDotRefocus,
  capabilityNarrativeState,
  capabilityPanelCrossfade,
  capabilityPanelPartStyle,
  capabilityPrimaryChipStyle,
  capabilitySecondaryChipStyle,
  measureCapabilityFloatIndex,
  measureCapabilityReleaseProgress,
  measureCapabilitiesChapterEntry,
} from '../../utils/capabilitiesChoreography.js';
import { workTrackScrollTargetY } from '../../utils/workChoreography.js';
import {
  createTrackScrollTween,
  easeInOutCubic,
  trackHeightVh,
  trackScrollTargetY,
} from '../../utils/scrollTrack.js';

const CAP_WORK_HANDOFF_EVENT = 'portfolio:cap-work-handoff';

/** Mac trackpad / mouse — deltaMode-aware vertical delta. */
function wheelDeltaY(e) {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  else if (e.deltaMode === 2) dy *= window.innerHeight;
  return dy;
}

function resolveCapWorkHandoffY(cachedY) {
  if (cachedY != null && Number.isFinite(cachedY)) return cachedY;
  const workTrack = document.getElementById('home-work-strongest');
  const workN = homeScrollChapters.length;
  if (!workTrack || workN < 1) {
    return window.scrollY + window.innerHeight * 0.5;
  }
  return workTrackScrollTargetY(workTrack, 0, workN);
}

function isWorkChapterPinned(workTrack, vh = window.innerHeight) {
  if (!workTrack) return false;
  const wr = workTrack.getBoundingClientRect();
  return wr.top <= PIN_TOP_TOLERANCE_PX + 8 && wr.bottom > vh * 0.45;
}

function capScrollPastWorkHandoff(cachedY, bufferPx = 12) {
  const workTrack = document.getElementById('home-work-strongest');
  if (!workTrack) return false;
  const handoffY = resolveCapWorkHandoffY(cachedY);
  return window.scrollY >= handoffY - bufferPx && isWorkChapterPinned(workTrack);
}

/** Left-edge capability rail — large-radius arc (open parenthesis curve). */
const ARC_VIEW_H = 1000;
const ARC_CHORD_INSET = 72;
const ARC_R = 800;
const ARC_PATH_D = `M 0 ${ARC_CHORD_INSET} A ${ARC_R} ${ARC_R} 0 0 1 0 ${ARC_VIEW_H - ARC_CHORD_INSET}`;
const ARC_VIEW_W = 360;
const FIELD_TILT_DEG = -45;
const WHEEL_STEP_THRESHOLD = 22;
const SCROLL_TWEEN_MS = 480;
const CHAPTER_SNAP_SETTLE_MS = 280;
const PANEL_SNAP_EPSILON = 0.05;
/** Ignore further wheel events in the same gesture until the current step tween finishes. */
const STEP_INPUT_LOCK_MS = 480;
const PIN_TOP_TOLERANCE_PX = 3;

/** Sticky chapter is pinned only while its top edge sits at the viewport top (not after scrolling past). */
function isChapterStickyPinned(rect) {
  return (
    rect.top >= -PIN_TOP_TOLERANCE_PX &&
    rect.top <= PIN_TOP_TOLERANCE_PX &&
    rect.bottom > window.innerHeight
  );
}

function isCapabilityWheelEngaged(rect, vh = window.innerHeight) {
  return rect.top < vh * 0.2 && rect.bottom > vh * 0.45;
}

function getArcPointAtFloat(arcFloat, panelCount, pathEl) {
  if (panelCount <= 1) {
    return { x: 0, y: ARC_CHORD_INSET };
  }
  const t = arcFloat / (panelCount - 1);
  if (!pathEl) {
    const y = ARC_CHORD_INSET + t * (ARC_VIEW_H - ARC_CHORD_INSET * 2);
    return { x: 0, y };
  }
  const len = pathEl.getTotalLength();
  const pt = pathEl.getPointAtLength(t * len);
  return { x: pt.x, y: pt.y };
}

const CAP_IDS = homeCapabilities.map((cap) => cap.id);

/** CSS fallback discs when WebGL is unavailable. */
function capabilityAtmosphereFallback(reducedMotion, fieldParallax) {
  const fieldStyle = {
    transform: `translate(-72%, -38%) rotate(${FIELD_TILT_DEG}deg) scale(${fieldParallax.scale})`,
    opacity: fieldParallax.opacity * 0.88,
    filter: 'blur(10px) saturate(0.88)',
  };
  const discAStyle = {
    opacity: 0.14,
    filter: 'blur(16px) saturate(0.92)',
    transform: 'translate(-22%, 6%) scale(0.82, 0.78)',
    borderRadius: '58% 42% 61% 39% / 44% 56% 38% 62%',
  };
  const discBStyle = {
    opacity: 0.1,
    filter: 'blur(20px)',
    transform: 'translate(4%, 2%) scale(0.76, 0.74)',
    borderRadius: '52% 48% 55% 45% / 50% 50% 42% 58%',
  };
  const discVeilStyle = {
    opacity: 0.08,
    filter: 'blur(22px)',
    transform: 'translate(-6%, 10%) scale(0.84, 0.8)',
  };
  return { fieldStyle, discAStyle, discBStyle, discVeilStyle };
}

function assignRef(ref, node) {
  if (!ref) return;
  if (typeof ref === 'function') ref(node);
  else ref.current = node;
}

export function CapabilityDialSection({ trackRef }) {
  const { activeId } = useNarrativeScroll();
  const { setCapabilityFloat, openingCapHandoff, openingCapExitWipe } = useFieldNarrative();
  const wrapRef = useRef(null);
  const setWrapRef = useCallback(
    (node) => {
      wrapRef.current = node;
      assignRef(trackRef, node);
    },
    [trackRef],
  );
  const pathRef = useRef(null);
  const panelIndexRef = useRef(0);
  const [floatIndex, setFloatIndex] = useState(0);
  const [panelIndex, setPanelIndex] = useState(0);
  const [arcStops, setArcStops] = useState([]);
  const [pathReady, setPathReady] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [chapterPinned, setChapterPinned] = useState(false);
  const [panelTransit, setPanelTransit] = useState(false);
  const chapterPinnedRef = useRef(false);
  const forceFirstPanelOnEntryRef = useRef(false);
  /** Brief window after entering from above — block wheel only while snapping to panel 0. */
  const entryLatchUntilRef = useRef(0);
  const prevActiveIdRef = useRef(null);
  /** Last settled panel — scroll may not jump more than ±1 from this anchor */
  const stepAnchorRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const wheelStepConsumedRef = useRef(false);
  const transitionFromRef = useRef(0);
  const transitionToRef = useRef(0);
  const inputLockUntilRef = useRef(0);
  const wheelAccumResetRef = useRef(null);
  const scrollTweenRef = useRef(null);
  const snapInProgressRef = useRef(false);
  const chapterExitArmedRef = useRef(false);
  const capExitingToWorkRef = useRef(false);
  const workHandoffYRef = useRef(null);
  const [releaseProgress, setReleaseProgress] = useState(0);
  const n = homeCapabilities.length;
  const trackVh = trackHeightVh(n);

  const measureCapEntry = useCallback(
    (rect, vh) => {
      const sticky =
        typeof document !== 'undefined' ? document.querySelector('.capability-sticky') : null;
      const stickyRect = sticky?.getBoundingClientRect();
      return measureCapabilitiesChapterEntry(rect, stickyRect, vh, openingCapExitWipe ?? 0);
    },
    [openingCapExitWipe],
  );
  const entryProgress = useSmoothedScrollProgress(wrapRef, measureCapEntry, {
    stiffness: 90,
    damping: 24,
    mass: 0.7,
    enabled: !reducedMotion,
  });
  const effectiveEntryProgress =
    panelIndex === 0 && chapterPinned && !panelTransit
      ? Math.max(entryProgress, 1)
      : panelIndex === 0
        ? entryProgress
        : 1;

  const entryLayers = useMemo(
    () => capabilitiesEntryLayers(effectiveEntryProgress, reducedMotion),
    [effectiveEntryProgress, reducedMotion],
  );

  panelIndexRef.current = panelIndex;

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (activeId === 'home-capabilities') {
      setCapabilityFloat(floatIndex);
    } else {
      setCapabilityFloat(null);
    }
    return () => setCapabilityFloat(null);
  }, [activeId, floatIndex, setCapabilityFloat]);

  const scrollToPanel = useCallback(
    (index, behavior = 'smooth') => {
      const el = wrapRef.current;
      if (!el || n <= 1) return;

      const current = stepAnchorRef.current;
      let clamped = Math.min(n - 1, Math.max(0, index));
      if (Math.abs(clamped - current) > 1) {
        clamped = current + Math.sign(clamped - current);
      }
      if (clamped === current) {
        wheelStepConsumedRef.current = false;
        return;
      }

      wheelCooldownRef.current = true;
      setPanelTransit(true);

      if (!scrollTweenRef.current) {
        scrollTweenRef.current = createTrackScrollTween();
      }
      scrollTweenRef.current.cancel();

      const from = current;
      const to = clamped;
      transitionFromRef.current = from;
      transitionToRef.current = to;

      const driveTransitionFloat = (linearP) => {
        const p = easeInOutCubic(linearP);
        setFloatIndex(from + (to - from) * p);
      };

      const finish = () => {
        const exactY = trackScrollTargetY(el, to, n);
        window.scrollTo(0, exactY);
        stepAnchorRef.current = to;
        transitionFromRef.current = to;
        transitionToRef.current = to;
        setFloatIndex(to);
        setPanelIndex(to);
        wheelCooldownRef.current = false;
        wheelStepConsumedRef.current = false;
        setPanelTransit(false);
        inputLockUntilRef.current = performance.now() + STEP_INPUT_LOCK_MS;
        if (to === 0) {
          entryLatchUntilRef.current = Math.min(
            entryLatchUntilRef.current,
            performance.now() + 72,
          );
        }
        if (to >= n - 1) {
          chapterExitArmedRef.current = true;
          inputLockUntilRef.current = 0;
          entryLatchUntilRef.current = 0;
        } else {
          chapterExitArmedRef.current = false;
        }
        wheelAccumResetRef.current?.();
      };

      const targetY = trackScrollTargetY(el, to, n);

      if (reducedMotion || behavior === 'auto') {
        window.scrollTo(0, targetY);
        driveTransitionFloat(1);
        finish();
        return;
      }

      driveTransitionFloat(0);

      scrollTweenRef.current.tweenTo(targetY, {
        duration: SCROLL_TWEEN_MS,
        ease: easeInOutCubic,
        onProgress: driveTransitionFloat,
        onComplete: finish,
      });
    },
    [n, reducedMotion],
  );

  const startCapWorkHandoff = useCallback(() => {
    const el = wrapRef.current;
    if (!el || capExitingToWorkRef.current) return;

    const workTrack = document.getElementById('home-work-strongest');
    const workN = homeScrollChapters.length;
    if (workTrack && workN > 0) {
      workHandoffYRef.current = workTrackScrollTargetY(workTrack, 0, workN);
    }

    const targetY = resolveCapWorkHandoffY(workHandoffYRef.current);
    const maxIdx = n - 1;

    const finish = () => {
      const exactY = resolveCapWorkHandoffY(workHandoffYRef.current);
      window.scrollTo(0, exactY);
      stepAnchorRef.current = maxIdx;
      setFloatIndex(maxIdx);
      setPanelIndex(maxIdx);
      setReleaseProgress(0);
      capExitingToWorkRef.current = false;
      wheelCooldownRef.current = false;
      wheelStepConsumedRef.current = false;
      inputLockUntilRef.current = performance.now() + 120;
      wheelAccumResetRef.current?.();
    };

    capExitingToWorkRef.current = true;
    chapterExitArmedRef.current = true;
    wheelStepConsumedRef.current = true;
    wheelCooldownRef.current = true;
    setPanelTransit(false);
    scrollTweenRef.current?.cancel();

    window.dispatchEvent(new CustomEvent(CAP_WORK_HANDOFF_EVENT));
    window.scrollTo(0, targetY);
    finish();
  }, [n]);

  const snapToChapterStart = useCallback(
    (behavior = 'smooth') => {
      const el = wrapRef.current;
      if (!el || snapInProgressRef.current) return;
      snapInProgressRef.current = true;
      stepAnchorRef.current = 0;
      setFloatIndex(0);
      setPanelIndex(0);
      chapterPinnedRef.current = false;
      const y = el.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({ top: y, behavior });
      window.setTimeout(() => {
        snapInProgressRef.current = false;
      }, CHAPTER_SNAP_SETTLE_MS);
    },
    [],
  );

  /** Entering Capabilities — preserve scroll panel when reviewing from below; panel 0 only from above. */
  useEffect(() => {
    const prevId = prevActiveIdRef.current;
    const entered = activeId === 'home-capabilities' && prevId !== 'home-capabilities';
    prevActiveIdRef.current = activeId;

    if (!entered) return undefined;

    const el = wrapRef.current;
    if (!el) return undefined;

    const rect = el.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.55) return undefined;

    const rawFi = measureCapabilityFloatIndex(rect, n);
    const target = Math.min(n - 1, Math.max(0, Math.round(rawFi)));
    const enteringFromOpening = prevId === 'home-landing' || prevId == null;
    const fromBelow =
      prevId === 'home-work-narrative' ||
      prevId === 'home-life-archive' ||
      (!enteringFromOpening && rawFi >= 0.35);

    const applyPanel = (index) => {
      stepAnchorRef.current = index;
      setFloatIndex(index);
      setPanelIndex(index);
    };

    if (fromBelow) {
      forceFirstPanelOnEntryRef.current = false;
      entryLatchUntilRef.current = 0;
      applyPanel(target);
      if (Math.abs(rawFi - target) > 0.06) {
        scrollToPanel(target, isChapterStickyPinned(rect) ? 'auto' : 'smooth');
      }
      return undefined;
    }

    forceFirstPanelOnEntryRef.current = true;
    entryLatchUntilRef.current = performance.now() + SCROLL_TWEEN_MS + 160;
    applyPanel(0);
    if (rect.top > PIN_TOP_TOLERANCE_PX) {
      const raf = requestAnimationFrame(() => {
        snapToChapterStart('auto');
      });
      return () => cancelAnimationFrame(raf);
    }
    if (Math.abs(rawFi) > 0.06) {
      scrollToPanel(0, 'auto');
    }
    return undefined;
  }, [activeId, n, scrollToPanel, snapToChapterStart]);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const isPinned = isChapterStickyPinned(rect);
      const capEngaged =
        activeId === 'home-capabilities' ||
        (isPinned && rect.bottom > vh * 0.45) ||
        isCapabilityWheelEngaged(rect, vh);
      if (!capEngaged) return;
      if (capExitingToWorkRef.current) return;

      const rawFi = measureCapabilityFloatIndex(rect, n);
      const releaseP = measureCapabilityReleaseProgress(rect, n);
      if (capEngaged) setReleaseProgress(releaseP);

      if (isPinned && !chapterPinnedRef.current) {
        chapterPinnedRef.current = true;
        setChapterPinned(true);
        const snapFirstPanel = forceFirstPanelOnEntryRef.current;
        let target = Math.min(n - 1, Math.max(0, Math.round(rawFi)));
        if (snapFirstPanel) target = 0;
        stepAnchorRef.current = target;
        setFloatIndex(target);
        setPanelIndex(target);
        forceFirstPanelOnEntryRef.current = false;
        if (snapFirstPanel) {
          entryLatchUntilRef.current = performance.now() + SCROLL_TWEEN_MS + 100;
        }
        if (Math.abs(rawFi - target) > PANEL_SNAP_EPSILON && !scrollTweenRef.current?.isRunning()) {
          scrollToPanel(target, 'auto');
          return;
        }
      }
      if (rect.top > window.innerHeight * 0.5) {
        chapterPinnedRef.current = false;
        setChapterPinned(false);
        forceFirstPanelOnEntryRef.current = false;
        entryLatchUntilRef.current = 0;
      }

      if (
        isPinned &&
        n > 1 &&
        !scrollTweenRef.current?.isRunning() &&
        !wheelCooldownRef.current &&
        !panelTransit
      ) {
        const anchor = stepAnchorRef.current;
        if (anchor >= n - 1 && Math.abs(rawFi - anchor) < PANEL_SNAP_EPSILON) {
          chapterExitArmedRef.current = true;
          const workTrack = document.getElementById('home-work-strongest');
          const workN = homeScrollChapters.length;
          if (workTrack && workN > 0) {
            workHandoffYRef.current = workTrackScrollTargetY(workTrack, 0, workN);
          }
        }
        if (releaseP > 0.05 && anchor < n - 1) {
          return;
        }
        const target = Math.round(rawFi);
        const atEnd = anchor >= n - 1;
        const atStart = anchor <= 0;
        const leavingDown = atEnd && releaseP > 0.05;
        const leavingUp = atStart && rawFi < anchor - 0.12;
        if (!leavingDown && !leavingUp && Math.abs(target - anchor) > 1) {
          const clamped = Math.min(n - 1, Math.max(0, anchor + Math.sign(target - anchor)));
          scrollToPanel(clamped, 'smooth');
          return;
        }
      }

      const tweenRunning = scrollTweenRef.current?.isRunning();

      if (tweenRunning || wheelCooldownRef.current || panelTransit) {
        return;
      }

      if (snapInProgressRef.current) {
        return;
      }

      if (isPinned) {
        const anchor = stepAnchorRef.current;
        if (Math.abs(rawFi - anchor) < PANEL_SNAP_EPSILON) {
          setFloatIndex(anchor);
          setPanelIndex(anchor);
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, [activeId, n, panelTransit, scrollToPanel, snapToChapterStart]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const stops = homeCapabilities.map((cap, i) => {
      const tStop = n <= 1 ? 0 : (i / (n - 1)) * len;
      const p = path.getPointAtLength(tStop);
      return { id: cap.id, x: p.x, y: p.y };
    });
    setArcStops(stops);
    setPathReady((v) => v + 1);
  }, [n]);

  useEffect(
    () => () => scrollTweenRef.current?.cancel(),
    [],
  );

  const bumpScroll = useCallback(
    (dir) => {
      if (wheelStepConsumedRef.current) return;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return;
      if (performance.now() < inputLockUntilRef.current) return;
      const el = wrapRef.current;
      if (!el || n <= 1) return;

      const anchor = stepAnchorRef.current;
      const next = Math.min(n - 1, Math.max(0, anchor + dir));
      if (next === anchor) return;

      entryLatchUntilRef.current = 0;
      wheelStepConsumedRef.current = true;
      scrollToPanel(next, 'smooth');
    },
    [n, scrollToPanel],
  );

  useEffect(() => {
    let wheelAccum = 0;

    wheelAccumResetRef.current = () => {
      wheelAccum = 0;
    };

    const tryWheelStep = (dir) => {
      if (wheelStepConsumedRef.current) return false;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return false;
      if (performance.now() < inputLockUntilRef.current) return false;
      bumpScroll(dir);
      wheelAccum = 0;
      return true;
    };

    const onWheel = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 48 || rect.top > vh + 48) return;

      const workTrack = document.getElementById('home-work-strongest');
      const rawFi = measureCapabilityFloatIndex(rect, n);
      const onLastPanel =
        panelIndexRef.current >= n - 1 ||
        stepAnchorRef.current >= n - 1 ||
        rawFi >= n - 1 - 0.35;
      const deltaY = wheelDeltaY(e);
      const scrollingDown = deltaY > 0.5;
      const scrollingUp = deltaY < -0.5;

      if (scrollingDown && onLastPanel) {
        if (workTrack && isWorkChapterPinned(workTrack, vh) && activeId === 'home-work-narrative') {
          return;
        }
        if (capScrollPastWorkHandoff(workHandoffYRef.current)) {
          return;
        }
        e.preventDefault();
        if (!capExitingToWorkRef.current) {
          scrollTweenRef.current?.cancel();
          wheelCooldownRef.current = false;
          wheelStepConsumedRef.current = false;
          setPanelTransit(false);
          inputLockUntilRef.current = 0;
          startCapWorkHandoff();
        }
        return;
      }

      const isPinned = isChapterStickyPinned(rect);
      const wheelEngaged = isCapabilityWheelEngaged(rect, vh);

      if (workTrack) {
        const wr = workTrack.getBoundingClientRect();
        const workPinned =
          wr.top <= PIN_TOP_TOLERANCE_PX && wr.bottom > vh * 0.45;
        if (workPinned && activeId === 'home-work-narrative') {
          return;
        }
      }

      const capEngaged =
        capExitingToWorkRef.current ||
        activeId === 'home-capabilities' ||
        (isPinned && rect.bottom > vh * 0.45) ||
        wheelEngaged ||
        onLastPanel;
      if (!capEngaged) return;
      if (!onLastPanel && !isPinned && !wheelEngaged) return;

      const inEntryLatch = performance.now() < entryLatchUntilRef.current;
      if (inEntryLatch && !(onLastPanel && scrollingDown)) {
        const latchBusy =
          !isPinned ||
          snapInProgressRef.current ||
          wheelCooldownRef.current ||
          scrollTweenRef.current?.isRunning() ||
          panelTransit;
        if (latchBusy) {
          e.preventDefault();
          return;
        }
      }
      if (!scrollingDown && !scrollingUp) return;

      const atFirst = stepAnchorRef.current <= 0;

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
      const delta = deltaY;

      if (Math.abs(delta) >= WHEEL_STEP_THRESHOLD) {
        tryWheelStep(wheelDir);
        return;
      }

      wheelAccum += delta;

      if (Math.abs(wheelAccum) >= WHEEL_STEP_THRESHOLD) {
        tryWheelStep(wheelAccum > 0 ? 1 : -1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false, capture: true });
    return () => {
      window.removeEventListener('wheel', onWheel, { capture: true });
      wheelAccumResetRef.current = null;
    };
  }, [activeId, bumpScroll, snapToChapterStart, startCapWorkHandoff]);

  useEffect(() => {
    const onKey = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const inChapter =
        rect.top < window.innerHeight * 0.88 && rect.bottom > window.innerHeight * 0.12;
      if (!inChapter) return;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        bumpScroll(1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        bumpScroll(-1);
      }
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bumpScroll]);

  const motionFloatIndex = panelTransit ? floatIndex : panelIndex;
  const arcFloat = motionFloatIndex;
  const crossfadeFloatIndex = motionFloatIndex;

  const arcDotPoint = useMemo(
    () => getArcPointAtFloat(arcFloat, n, pathRef.current),
    [arcFloat, n, pathReady],
  );

  const narrativeState = useMemo(
    () => capabilityNarrativeState(motionFloatIndex, panelIndex, n),
    [motionFloatIndex, panelIndex, n],
  );

  const atmosphere = useMemo(() => {
    const fieldParallax = capabilitiesFieldParallax(
      effectiveEntryProgress,
      narrativeState.backgroundFloatIndex / Math.max(1, n - 1),
      openingCapHandoff ?? 1,
    );
    return {
      ...capabilityAtmosphereFallback(reducedMotion, fieldParallax),
      fieldParallax,
    };
  }, [effectiveEntryProgress, narrativeState.backgroundFloatIndex, n, openingCapHandoff, reducedMotion]);

  const ambientStyle = useMemo(
    () => capabilityAmbientStyleFromNarrative(narrativeState, CAPABILITY_THEMES, CAP_IDS),
    [narrativeState],
  );

  const [greenAttention, setGreenAttention] = useState(0);
  const greenAttRef = useRef(0);
  const lastGreenPanelRef = useRef(panelIndex);

  useEffect(() => {
    if (panelIndex !== lastGreenPanelRef.current) {
      greenAttRef.current = 1;
      lastGreenPanelRef.current = panelIndex;
      setGreenAttention(1);
    }
  }, [panelIndex]);

  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const decay = 1 - Math.exp(-1.28 * dt);
      greenAttRef.current += (0 - greenAttRef.current) * decay;
      setGreenAttention(greenAttRef.current);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const greenFieldStyle = useMemo(
    () => signalGreenFieldPresentation(motionFloatIndex, { greenAttention }),
    [motionFloatIndex, greenAttention],
  );

  const activePanelIndex = panelIndex;
  const ariaCap = homeCapabilities[activePanelIndex];
  const isPanelScrubbing = Math.abs(floatIndex - panelIndex) > PANEL_SNAP_EPSILON + 0.02;

  const capEnvIn = useMemo(() => {
    const handoffVis = openingCapHandoffVisual(openingCapHandoff ?? 0, openingCapExitWipe ?? 0);
    if (activeId !== 'home-capabilities') return handoffVis * 0.2;
    if (chapterPinned) return Math.max(handoffVis, 0.94);
    return Math.max(handoffVis * 0.42, effectiveEntryProgress * handoffVis * 0.72);
  }, [activeId, chapterPinned, effectiveEntryProgress, openingCapHandoff, openingCapExitWipe]);

  const workHandoff = releaseProgress;

  const renderCapabilityPanel = (cap, panelIdx) => {
    const crossfade = capabilityPanelCrossfade(crossfadeFloatIndex, panelIdx, reducedMotion, undefined, {
      inStepTransition: panelTransit,
    });
    const isSettled = !isPanelScrubbing && panelIdx === panelIndex;
    const useChapterEntry = panelIdx === 0 && effectiveEntryProgress < 0.995;
    const layers = useChapterEntry
      ? entryLayers
      : capabilitiesEntryLayers(1, reducedMotion);
    const headlineLines = (cap.headlineLines ?? [cap.headline]).slice(0, 2);
    const entryP = useChapterEntry ? effectiveEntryProgress : 1;
    const motionFi = useChapterEntry ? null : motionFloatIndex;

    return (
      <div
        key={cap.id}
        className={`cap-dial__state-layer${isSettled ? ' is-settled' : ''}${workHandoff > 0.08 && panelIdx === n - 1 ? ' is-releasing' : ''}`}
        data-cap-id={cap.id}
        style={crossfade}
        aria-hidden={crossfade.opacity < 0.45}
      >
        <div
          className="cap-dial__state-core"
          style={
            useChapterEntry
              ? { transform: `translate3d(0, ${layers.parallax?.title ?? 0}px, 0)` }
              : undefined
          }
        >
          <h2
            className="cap-dial__headline"
            style={
              useChapterEntry
                ? layers.headline
                : capabilityPanelPartStyle(motionFi, panelIdx, 'headline', 0, 1, reducedMotion)
            }
          >
            {headlineLines.map((line) => (
              <span key={line} className="cap-dial__headline-line">
                {line}
              </span>
            ))}
          </h2>
          {cap.positioning ? (
            <p
              className="cap-dial__positioning"
              style={
                useChapterEntry
                  ? {
                      ...layers.description,
                      transform: `translate3d(0, ${layers.parallax?.description ?? 0}px, 0)`,
                    }
                  : capabilityPanelPartStyle(motionFi, panelIdx, 'description', 0, 1, reducedMotion)
              }
            >
              {cap.positioning}
            </p>
          ) : null}
        </div>
        <div
          className="cap-dial__state-tags"
          style={
            useChapterEntry
              ? { transform: `translate3d(0, ${layers.parallax?.chips ?? 0}px, 0)` }
              : undefined
          }
        >
          <div className="cap-dial__chip-groups">
            <div className="cap-dial__chip-group">
              <ul
                className="cap-dial__chips cap-dial__chips--primary"
                aria-label={`${cap.headline} primary outputs`}
              >
                {cap.pillsPrimary.map((pill, j) => (
                  <li
                    key={pill}
                    className="cap-dial__chip cap-dial__chip--primary"
                    style={
                      useChapterEntry
                        ? capabilityPrimaryChipStyle(
                            entryP,
                            j,
                            cap.pillsPrimary.length,
                            reducedMotion,
                          )
                        : capabilityPanelPartStyle(
                            motionFi,
                            panelIdx,
                            'primary',
                            j,
                            cap.pillsPrimary.length,
                            reducedMotion,
                          )
                    }
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            </div>
            <div className="cap-dial__chip-group cap-dial__chip-group--secondary">
              <ul
                className="cap-dial__chips cap-dial__chips--secondary"
                aria-label={`${cap.headline} supporting methods`}
              >
                {cap.pillsSecondary.map((pill, j) => (
                  <li
                    key={pill}
                    className="cap-dial__chip cap-dial__chip--secondary"
                    style={
                      useChapterEntry
                        ? capabilitySecondaryChipStyle(
                            entryP,
                            j,
                            cap.pillsSecondary.length,
                            reducedMotion,
                          )
                        : capabilityPanelPartStyle(
                            motionFi,
                            panelIdx,
                            'secondary',
                            j,
                            cap.pillsSecondary.length,
                            reducedMotion,
                          )
                    }
                  >
                    {pill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section
      ref={setWrapRef}
      className="capability-scroll capability-scroll--snap"
      style={{ height: `${trackVh}vh`, minHeight: `${trackVh}vh` }}
    >
      <div className="capability-scroll__snaps" aria-hidden="true">
        {homeCapabilities.map((cap) => (
          <div key={cap.id} className="capability-scroll__snap" />
        ))}
      </div>
      <div
        className="capability-sticky"
        data-cap-theme={ambientStyle.themeId}
        data-cap-phase={narrativeState.sectionPhase}
        style={{
          '--cap-env-in': String(capEnvIn),
          '--cap-work-handoff': String(workHandoff),
          '--cap-residual-a': ambientStyle['--cap-residual-a'],
          '--cap-residual-b': ambientStyle['--cap-residual-b'],
          '--cap-residual-c': ambientStyle['--cap-residual-c'],
          '--cap-wash': ambientStyle['--cap-wash'],
          ...greenFieldStyle,
        }}
      >
        <div className="cap-dial__ambient" aria-hidden="true">
          <div className="cap-dial__ambient-residual cap-dial__ambient-residual--a-haze" />
          <div className="cap-dial__ambient-residual cap-dial__ambient-residual--a-gather" aria-hidden="true" />
          <div className="cap-dial__ambient-residual cap-dial__ambient-residual--b" />
          <div className="cap-dial__ambient-residual cap-dial__ambient-residual--c" />
          <div className="cap-dial__ambient-wash" />
          <div className="cap-dial__content-vignette" />
        </div>

        <div
          className="cap-dial__layout"
          style={{ '--cap-arc-progress': n <= 1 ? 0 : arcFloat / (n - 1) }}
        >
          <div
            className="cap-dial cap-dial--rail"
            data-active-cap={homeCapabilities[activePanelIndex]?.id ?? ''}
            role="region"
            aria-label="Capabilities. Scroll this chapter to move through capabilities, or use arrow keys."
            aria-valuemin={1}
            aria-valuemax={n}
            aria-valuenow={activePanelIndex + 1}
            aria-valuetext={ariaCap.headline}
          >
            <div className="cap-dial__grain" aria-hidden="true" />

            <div className="cap-dial__stage cap-dial__stage--content">
              <div
                className={`cap-dial__stage-row motion-reveal-group${effectiveEntryProgress > 0.12 ? ' is-visible' : ''}`}
              >
                <aside className="cap-dial__arc-rail" aria-label="Capability sequence">
                  <div
                    className="cap-dial__arc-rig"
                    style={
                      effectiveEntryProgress < 0.995
                        ? {
                            ...entryLayers.arc,
                            transform: `translate3d(0, ${entryLayers.parallax?.arc ?? 0}px, 0)`,
                          }
                        : undefined
                    }
                  >
                    <svg
                      className="cap-dial__arc cap-dial__arc--rail"
                      viewBox={`0 0 ${ARC_VIEW_W} ${ARC_VIEW_H}`}
                      preserveAspectRatio="xMinYMid meet"
                      aria-hidden="true"
                    >
                      <path
                        ref={pathRef}
                        d={ARC_PATH_D}
                        className="cap-dial__arc-path"
                        fill="none"
                        vectorEffect="non-scaling-stroke"
                      />
                      {arcStops.map((stop, i) => (
                        <circle
                          key={stop.id}
                          className="cap-dial__arc-tick"
                          cx={stop.x}
                          cy={stop.y}
                          r={2.5}
                          data-active={i === activePanelIndex ? 'true' : 'false'}
                        />
                      ))}
                      <circle
                        className="cap-dial__arc-dot-circle"
                        cx={arcDotPoint.x}
                        cy={arcDotPoint.y}
                        r={capabilityArcDotRefocus(arcFloat, reducedMotion).r}
                        style={{
                          opacity: capabilityArcDotRefocus(arcFloat, reducedMotion).opacity,
                          filter: capabilityArcDotRefocus(arcFloat, reducedMotion).filter,
                        }}
                      />
                    </svg>
                    <div className="cap-dial__arc-stops">
                      {arcStops.map((stop, i) => (
                        <button
                          key={stop.id}
                          type="button"
                          className="cap-dial__arc-stop-hit"
                          style={{
                            left: `${(stop.x / ARC_VIEW_W) * 100}%`,
                            top: `${(stop.y / ARC_VIEW_H) * 100}%`,
                          }}
                          tabIndex={-1}
                          aria-label={homeCapabilities[i]?.headline}
                          aria-current={i === activePanelIndex ? 'step' : undefined}
                          onClick={() => scrollToPanel(i, 'smooth')}
                        />
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="cap-dial__panel-body">
                  {capabilitySectionCopy.footer ? (
                    <p
                      className="cap-dial__footer cap-dial__footer--lead"
                      style={entryLayers.footerLead}
                    >
                      {capabilitySectionCopy.footer}
                    </p>
                  ) : null}
                  <div className="cap-dial__state-stack" aria-live="polite">
                    {homeCapabilities.map((cap, i) => renderCapabilityPanel(cap, i))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
