import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSmoothedScrollProgress } from '../../hooks/useSmoothedScrollProgress.js';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { capabilitySectionCopy, homeCapabilities } from '../../data/homeScrollChapters.js';
import {
  capabilitiesEntryLayers,
  capabilitiesFieldParallax,
  capabilityArcDotRefocus,
  capabilityArcNodeRefocus,
  capabilityPanelCrossfade,
  capabilityPrimaryChipStyle,
  capabilitySecondaryChipStyle,
  getVisualFloatIndex,
  measureCapabilityFloatIndex,
  measureChapterEntryProgress,
  syncCapabilityStepAnchor,
} from '../../utils/capabilitiesChoreography.js';
import {
  createTrackScrollTween,
  easeInOutCubic,
  trackHeightVh,
  trackScrollTargetY,
} from '../../utils/scrollTrack.js';

const ARC_PATH_D = 'M 108 36 Q 12 400 108 764';
const ARC_VIEW_W = 120;
const ARC_VIEW_H = 800;
const FIELD_TILT_DEG = -45;
const WHEEL_STEP_THRESHOLD = 10;
const SCROLL_TWEEN_MS = 460;
const CHAPTER_SNAP_SETTLE_MS = 280;
const PANEL_SNAP_SETTLE_MS = 120;
const PANEL_SNAP_EPSILON = 0.05;
const PIN_TOP_TOLERANCE_PX = 3;

/** Sticky chapter is pinned only while its top edge sits at the viewport top (not after scrolling past). */
function isChapterStickyPinned(rect) {
  return (
    rect.top >= -PIN_TOP_TOLERANCE_PX &&
    rect.top <= PIN_TOP_TOLERANCE_PX &&
    rect.bottom > window.innerHeight
  );
}

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

/** Scroll-scrubbed atmosphere (aligned with Opening field language). */
function capabilityAtmosphere(floatIndex, panelCount, reducedMotion, entryProgress = 1) {
  const panelP = panelCount <= 1 ? 0 : floatIndex / (panelCount - 1);
  const spread = smoothstep(0.06, 0.94, panelP);
  const snapDist = panelCount <= 1 ? 0 : Math.abs(floatIndex - Math.round(floatIndex));
  const inHold = snapDist < 0.12;
  const settle = reducedMotion ? 1 : inHold ? 1 : 1 - Math.min(1, snapDist * 2.2);
  const sx = spread * (reducedMotion ? 0 : 1);
  const entry = reducedMotion ? 1 : entryProgress;
  const fieldParallax = capabilitiesFieldParallax(entry, panelP);

  const fieldStyle = {
    transform: `translate(-50%, calc(-42% + ${fieldParallax.translateY})) rotate(${FIELD_TILT_DEG}deg) scale(${mix(0.94, 1.08, spread) * fieldParallax.scale}, ${mix(0.92, 1.04, spread)})`,
    opacity: mix(0.78, 0.96, settle) * fieldParallax.opacity,
    filter: reducedMotion ? 'none' : `blur(${mix(0, 2.2, 1 - settle)}px)`,
  };

  const discAStyle = {
    opacity: mix(0.44, 0.68, spread) * mix(0.92, 1, settle),
    filter: `blur(${mix(9, 20, spread)}px) saturate(${mix(0.9, 0.86, spread)})`,
    transform: `translate(${mix(2, -8, spread) - 11 * sx}%, ${mix(2, 16, spread) + 9 * sx}%) scale(${1 + 0.05 * sx}, ${mix(0.9, 0.84, spread) - 0.05 * sx})`,
    borderRadius: '58% 42% 61% 39% / 44% 56% 38% 62%',
  };
  const discBStyle = {
    opacity: mix(0.4, 0.62, spread) * mix(0.9, 1, settle),
    filter: `blur(${mix(12, 28, spread)}px) saturate(${mix(0.88, 0.84, spread)})`,
    transform: `translate(${mix(-2, 18, spread) + 13 * sx}%, ${mix(1, 12, spread) - 7 * sx}%) scale(${1 - 0.04 * sx}, ${mix(0.92, 0.86, spread) + 0.05 * sx})`,
    borderRadius: '52% 48% 55% 45% / 50% 50% 42% 58%',
  };
  const discVeilStyle = {
    opacity: mix(0.14, 0.22, spread),
    filter: `blur(${mix(16, 36, spread)}px) saturate(${mix(0.86, 0.82, spread)})`,
    transform: `translate(${mix(0, -6, spread) + 5 * sx}%, ${mix(3, 20, spread) + 11 * sx}%) scale(${mix(1.02, 1.12, spread) + 0.05 * sx}, ${mix(0.88, 0.9, spread) - 0.04 * sx})`,
  };

  return { fieldStyle, discAStyle, discBStyle, discVeilStyle, scrollDriven: !reducedMotion };
}

function assignRef(ref, node) {
  if (!ref) return;
  if (typeof ref === 'function') ref(node);
  else ref.current = node;
}

export function CapabilityDialSection({ trackRef }) {
  const { activeId } = useNarrativeScroll();
  const { setCapabilityFloat } = useFieldNarrative();
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
  const [dot, setDot] = useState({ x: 108, y: 400 });
  const [arcStops, setArcStops] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [chapterPinned, setChapterPinned] = useState(false);
  const [panelTransit, setPanelTransit] = useState(false);
  const chapterPinnedRef = useRef(false);
  const prevActiveIdRef = useRef(null);
  /** Last settled panel — scroll may not jump more than ±1 from this anchor */
  const stepAnchorRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const scrollTweenRef = useRef(null);
  const snapTimerRef = useRef(null);
  const snapInProgressRef = useRef(false);
  const n = homeCapabilities.length;
  const trackVh = trackHeightVh(n);

  const entryProgress = useSmoothedScrollProgress(
    wrapRef,
    measureChapterEntryProgress,
    { stiffness: 90, damping: 24, mass: 0.7, enabled: !reducedMotion },
  );
  /** Raw scroll index + visual lock zones for rendering. */
  const visualFloatIndex = useMemo(
    () => getVisualFloatIndex(floatIndex),
    [floatIndex],
  );

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
      const clamped = Math.min(n - 1, Math.max(0, index));
      stepAnchorRef.current = clamped;

      if (!scrollTweenRef.current) {
        scrollTweenRef.current = createTrackScrollTween();
      }
      scrollTweenRef.current.cancel();

      const targetY = trackScrollTargetY(el, clamped, n);
      const finish = () => {
        const exactY = trackScrollTargetY(el, clamped, n);
        window.scrollTo(0, exactY);
        stepAnchorRef.current = clamped;
        setFloatIndex(clamped);
        setPanelIndex(clamped);
        wheelCooldownRef.current = false;
        setPanelTransit(false);
      };

      if (reducedMotion || behavior === 'auto') {
        window.scrollTo(0, targetY);
        finish();
        return;
      }

      wheelCooldownRef.current = true;
      setPanelTransit(true);
      scrollTweenRef.current.tweenTo(targetY, {
        duration: SCROLL_TWEEN_MS,
        ease: easeInOutCubic,
        onComplete: finish,
      });
    },
    [n, reducedMotion],
  );

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
    const fromBelow =
      prevId === 'home-work-narrative' ||
      prevId === 'home-life-archive' ||
      rawFi >= 0.35;

    const applyPanel = (index) => {
      stepAnchorRef.current = index;
      setFloatIndex(index);
      setPanelIndex(index);
    };

    if (fromBelow) {
      applyPanel(target);
      if (Math.abs(rawFi - target) > 0.06) {
        scrollToPanel(target, isChapterStickyPinned(rect) ? 'auto' : 'smooth');
      }
      return undefined;
    }

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
      if (activeId !== 'home-capabilities') return;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const rawFi = measureCapabilityFloatIndex(rect, n);

      const isPinned = isChapterStickyPinned(rect);
      if (isPinned && !chapterPinnedRef.current) {
        chapterPinnedRef.current = true;
        setChapterPinned(true);
        let target = Math.min(n - 1, Math.max(0, Math.round(rawFi)));
        if (rawFi < 0.42) target = 0;
        stepAnchorRef.current = target;
        setFloatIndex(target);
        setPanelIndex(target);
        if (Math.abs(rawFi - target) > PANEL_SNAP_EPSILON && !scrollTweenRef.current?.isRunning()) {
          scrollToPanel(target, 'auto');
          return;
        }
      }
      if (rect.top > window.innerHeight * 0.5) {
        chapterPinnedRef.current = false;
        setChapterPinned(false);
      }

      if (isPinned && n > 1 && !scrollTweenRef.current?.isRunning()) {
        const anchor = stepAnchorRef.current;
        syncCapabilityStepAnchor(rawFi, stepAnchorRef);
        const target = Math.round(rawFi);
        const atEnd = anchor >= n - 1;
        const atStart = anchor <= 0;
        const leavingDown = atEnd && rawFi > anchor + 0.12;
        const leavingUp = atStart && rawFi < anchor - 0.12;
        if (!leavingDown && !leavingUp && Math.abs(target - anchor) > 1) {
          const clamped = Math.min(n - 1, Math.max(0, anchor + Math.sign(target - anchor)));
          scrollToPanel(clamped, 'smooth');
          return;
        }
      }

      const tweenRunning = scrollTweenRef.current?.isRunning();
      const cooldown = wheelCooldownRef.current;

      if (tweenRunning || cooldown) {
        setFloatIndex(rawFi);
        setPanelIndex(Math.min(n - 1, Math.max(0, Math.round(rawFi))));
      } else {
        syncCapabilityStepAnchor(rawFi, stepAnchorRef);
        const anchor = stepAnchorRef.current;
        if (Math.abs(rawFi - anchor) < PANEL_SNAP_EPSILON) {
          setFloatIndex(anchor);
          setPanelIndex(anchor);
        } else {
          setFloatIndex(rawFi);
          setPanelIndex(Math.min(n - 1, Math.max(0, Math.round(rawFi))));
        }
      }

      if (wheelCooldownRef.current || snapInProgressRef.current || tweenRunning) {
        return;
      }

      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = window.setTimeout(() => {
        if (activeId !== 'home-capabilities') return;
        if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return;
        const r = el.getBoundingClientRect();
        if (!isChapterStickyPinned(r)) return;
        const latest = measureCapabilityFloatIndex(r, n);
        const snap = Math.round(latest);
        syncCapabilityStepAnchor(latest, stepAnchorRef);
        if (Math.abs(latest - snap) > PANEL_SNAP_EPSILON) {
          scrollToPanel(snap, 'smooth');
        } else {
          stepAnchorRef.current = snap;
          setFloatIndex(snap);
          setPanelIndex(snap);
        }
      }, PANEL_SNAP_SETTLE_MS);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(snapTimerRef.current);
    };
  }, [activeId, n, scrollToPanel, snapToChapterStart]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const tAlong = n <= 1 ? 0 : (floatIndex / (n - 1)) * len;
    const pt = path.getPointAtLength(tAlong);
    setDot({ x: pt.x, y: pt.y });

    const stops = homeCapabilities.map((cap, i) => {
      const tStop = n <= 1 ? 0 : (i / (n - 1)) * len;
      const p = path.getPointAtLength(tStop);
      const lines = cap.railLabelLines ?? cap.headlineLines ?? [cap.label];
      return {
        id: cap.id,
        lines,
        x: p.x,
        y: p.y,
      };
    });
    setArcStops(stops);
  }, [floatIndex, n]);

  useEffect(
    () => () => scrollTweenRef.current?.cancel(),
    [],
  );

  const bumpScroll = useCallback(
    (dir) => {
      const el = wrapRef.current;
      if (!el || n <= 1) return;
      const fi = measureCapabilityFloatIndex(el.getBoundingClientRect(), n);
      syncCapabilityStepAnchor(fi, stepAnchorRef);
      const nearest = Math.round(fi);
      let anchor = stepAnchorRef.current;
      if (dir < 0 && nearest < anchor) anchor = nearest;
      if (dir > 0 && nearest > anchor) anchor = nearest;
      const next = Math.min(n - 1, Math.max(0, anchor + dir));
      if (next === anchor) return;
      scrollToPanel(next, 'smooth');
    },
    [n, scrollToPanel],
  );

  useEffect(() => {
    if (reducedMotion) return undefined;

    let wheelAccum = 0;
    let wheelResetTimer = null;

    const onWheel = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const isPinned = isChapterStickyPinned(rect);

      const workTrack = document.getElementById('home-work-strongest');
      if (workTrack) {
        const wr = workTrack.getBoundingClientRect();
        const workPinned =
          wr.top <= PIN_TOP_TOLERANCE_PX && wr.bottom > window.innerHeight * 0.45;
        if (workPinned && activeId === 'home-work-narrative') {
          return;
        }
      }

      const capEngaged =
        activeId === 'home-capabilities' ||
        (isPinned && rect.bottom > window.innerHeight * 0.45);
      if (!capEngaged || !isPinned) return;

      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;
      if (!scrollingDown && !scrollingUp) return;

      const fiNow = measureCapabilityFloatIndex(rect, n);
      syncCapabilityStepAnchor(fiNow, stepAnchorRef);
      const nearest = Math.round(fiNow);
      let anchor = stepAnchorRef.current;
      if (scrollingUp && nearest < anchor) anchor = nearest;
      if (scrollingDown && nearest > anchor) anchor = nearest;
      const atLast = anchor >= n - 1;
      const atFirst = anchor <= 0;

      /* At first/last panel, release wheel so the page can exit the chapter */
      if ((scrollingDown && atLast) || (scrollingUp && atFirst)) {
        return;
      }

      e.preventDefault();

      const wheelDir = scrollingDown ? 1 : -1;
      if (wheelCooldownRef.current && scrollTweenRef.current?.isRunning()) {
        const nextFromTween = Math.min(n - 1, Math.max(0, anchor + wheelDir));
        if (nextFromTween !== anchor) {
          wheelAccum = 0;
          bumpScroll(wheelDir);
        }
        return;
      }
      if (wheelCooldownRef.current) return;

      const delta = e.deltaY;
      if (Math.abs(delta) >= WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        bumpScroll(wheelDir);
        return;
      }

      wheelAccum += delta;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAccum = 0;
      }, 160);

      if (wheelAccum >= WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        bumpScroll(1);
      } else if (wheelAccum <= -WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        bumpScroll(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      clearTimeout(wheelResetTimer);
    };
  }, [activeId, bumpScroll, reducedMotion, snapToChapterStart]);

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

  const atmosphere = capabilityAtmosphere(
    visualFloatIndex,
    n,
    reducedMotion,
    entryProgress,
  );
  const activePanelIndex = Math.min(n - 1, Math.max(0, Math.round(visualFloatIndex)));
  const ariaCap = homeCapabilities[activePanelIndex];
  const renderFloatIndex = useMemo(() => {
    if (Math.abs(floatIndex - panelIndex) < PANEL_SNAP_EPSILON) return panelIndex;
    return floatIndex;
  }, [floatIndex, panelIndex]);
  const isPanelScrubbing = Math.abs(floatIndex - panelIndex) > PANEL_SNAP_EPSILON + 0.02;
  /** Blur only during intentional panel tweens — not chapter-entry track bleed */
  const crossfadeFloatIndex = panelTransit ? renderFloatIndex : panelIndex;

  const renderCapabilityPanel = (cap, panelIdx) => {
    const crossfade = capabilityPanelCrossfade(crossfadeFloatIndex, panelIdx, reducedMotion);
    const isSettled = !isPanelScrubbing && panelIdx === panelIndex;
    const useChapterEntry = panelIdx === 0 && effectiveEntryProgress < 0.995;
    const layers = useChapterEntry
      ? entryLayers
      : capabilitiesEntryLayers(1, reducedMotion);
    const headlineLines = cap.headlineLines ?? [cap.headline];
    const entryP = useChapterEntry ? effectiveEntryProgress : 1;

    return (
      <div
        key={cap.id}
        className={`cap-dial__state-layer${isSettled ? ' is-settled' : ''}`}
        data-cap-id={cap.id}
        style={crossfade}
        aria-hidden={crossfade.opacity < 0.45}
      >
        <h2
          className="cap-dial__headline"
          style={useChapterEntry ? layers.headline : undefined}
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
                : undefined
            }
          >
            {cap.positioning}
          </p>
        ) : null}
        <div
          className="cap-dial__chip-groups"
          style={
            useChapterEntry
              ? { transform: `translate3d(0, ${layers.parallax?.chips ?? 0}px, 0)` }
              : undefined
          }
        >
          <div className="cap-dial__chip-group">
            <p className="cap-dial__chip-group-label" style={layers.chipLabelPrimary}>
              Primary
            </p>
            <ul
              className="cap-dial__chips cap-dial__chips--primary"
              aria-label={`${cap.headline} primary outputs`}
            >
              {cap.pillsPrimary.map((pill, j) => (
                <li
                  key={pill}
                  className="cap-dial__chip cap-dial__chip--primary"
                  style={capabilityPrimaryChipStyle(entryP, j, cap.pillsPrimary.length, reducedMotion)}
                >
                  {pill}
                </li>
              ))}
            </ul>
          </div>
          <div className="cap-dial__chip-group cap-dial__chip-group--secondary">
            <p className="cap-dial__chip-group-label" style={layers.chipLabelSecondary}>
              Secondary
            </p>
            <ul
              className="cap-dial__chips cap-dial__chips--secondary"
              aria-label={`${cap.headline} supporting methods`}
            >
              {cap.pillsSecondary.map((pill, j) => (
                <li
                  key={pill}
                  className="cap-dial__chip cap-dial__chip--secondary"
                  style={capabilitySecondaryChipStyle(
                    entryP,
                    j,
                    cap.pillsSecondary.length,
                    reducedMotion,
                  )}
                >
                  {pill}
                </li>
              ))}
            </ul>
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
      <div className="capability-sticky">
        <div className="cap-dial__atmosphere" aria-hidden="true">
          <div
            className={`cap-dial__field ${atmosphere.scrollDriven ? 'cap-dial__field--scroll' : 'cap-dial__field--live'}`.trim()}
            style={atmosphere.fieldStyle}
          >
            <div
              className="cap-dial__disc cap-dial__disc--veil"
              style={atmosphere.discVeilStyle}
            />
            <div className="cap-dial__disc cap-dial__disc--a" style={atmosphere.discAStyle} />
            <div className="cap-dial__disc cap-dial__disc--b" style={atmosphere.discBStyle} />
          </div>
        </div>
        <div
          className="cap-dial cap-dial--wheel"
          role="region"
          aria-label="Capabilities. Scroll this chapter to move through capabilities, or use arrow keys."
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={activePanelIndex + 1}
          aria-valuetext={ariaCap.headline}
        >
          <div className="cap-dial__grain" aria-hidden="true" />

          <div className="cap-dial__stage">
            <div
              className="cap-dial__wheel cap-dial__wheel--minimal"
              aria-hidden="true"
              style={{
                transform: `translate3d(${-10 + (entryLayers.parallax?.arc ?? 0) * 0.15}px, ${entryLayers.parallax?.arc ?? 0}px, 0)`,
                opacity: entryLayers.arc?.opacity ?? 1,
                filter: entryLayers.arc?.filter,
              }}
            >
              <div className="cap-dial__arc-rig">
                <svg
                  className="cap-dial__arc cap-dial__arc--interactive"
                  viewBox={`0 0 ${ARC_VIEW_W} ${ARC_VIEW_H}`}
                  preserveAspectRatio="xMinYMid meet"
                >
                  <path
                    ref={pathRef}
                    d={ARC_PATH_D}
                    fill="none"
                    stroke="rgba(255,255,255,0.28)"
                    strokeWidth="1.85"
                    vectorEffect="non-scaling-stroke"
                  />
                  {(() => {
                    const dotPres = capabilityArcDotRefocus(visualFloatIndex, reducedMotion);
                    return (
                      <circle
                        className="cap-dial__arc-dot-circle"
                        cx={dot.x}
                        cy={dot.y}
                        r={dotPres.r}
                        style={{
                          opacity: dotPres.opacity,
                          filter: dotPres.filter,
                        }}
                      />
                    );
                  })()}
                </svg>
                <div className="cap-dial__arc-labels">
                  {arcStops.map((stop, i) => {
                    const lineCount = stop.lines?.length ?? 1;
                    return (
                      <button
                        key={stop.id}
                        type="button"
                        data-cap={stop.id}
                        className="cap-dial__arc-label cap-dial__arc-label--scroll"
                        style={{
                          left: `${(stop.x / ARC_VIEW_W) * 100}%`,
                          top: `${(stop.y / ARC_VIEW_H) * 100}%`,
                          transform: 'translate(8px, -50%)',
                        }}
                        tabIndex={-1}
                        aria-hidden
                        onClick={() => scrollToPanel(i, 'smooth')}
                      >
                        <span className="cap-dial__arc-label-text">
                          {stop.lines.map((line, lineIdx) => {
                            const linePres = capabilityArcNodeRefocus(
                              visualFloatIndex,
                              i,
                              lineIdx,
                              lineCount,
                              reducedMotion,
                            );
                            return (
                              <span
                                key={line}
                                className="cap-dial__arc-label-line"
                                style={{
                                  opacity: linePres.opacity,
                                  filter: linePres.filter,
                                  transform: linePres.transform,
                                  color: linePres.color,
                                }}
                              >
                                {line}
                              </span>
                            );
                          })}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div
              className="cap-dial__main"
              style={{
                transform: `translate3d(0, ${entryLayers.parallax?.title ?? 0}px, 0)`,
              }}
            >
              {capabilitySectionCopy.footer ? (
                <p
                  className="cap-dial__footer cap-dial__footer--lead"
                  style={entryLayers.footerLead}
                >
                  {capabilitySectionCopy.footer}
                </p>
              ) : null}
              <div className="cap-dial__panel-body">
                <div className="cap-dial__state-stack" aria-live="polite">
                  {homeCapabilities.map((cap, i) => renderCapabilityPanel(cap, i))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
