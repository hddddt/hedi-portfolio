import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useScrollOrchestrator } from '../../context/ScrollOrchestratorContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { usePovArchiveHandoff } from '../../context/PovArchiveHandoffContext.jsx';
import { povBeats } from '../../data/pointOfViewChapters.js';
import { formatPovMarkers } from '../../data/povSources.js';
import { povExitLayers } from '../../utils/povArchiveHandoff.js';
import { HOME_CHAPTER_NAV_EVENT } from '../../utils/portfolioGuideTarget.js';
import { isChapterTransition } from '../../utils/chapterTransitionLock.js';
import { useMobileHomeMode } from '../../utils/mobileHomeMode.js';

import {
  povPhases,
  povTrackHeightVhFromPhases,
} from '../../utils/scrollTrackConfigs.js';
import { measureTrack, trackScrollTargetY } from '../../utils/scrollTimeline.js';
import {
  createTrackScrollTween,
  easeInOutCubic,
} from '../../utils/scrollTrack.js';

const LINE_STAGGER_S = 0.14;
const WHEEL_STEP_THRESHOLD = 22;
const SCROLL_TWEEN_MS = 480;
const STEP_INPUT_LOCK_MS = 300;
const PIN_TOP_TOLERANCE_PX = 3;
const BEAT_SNAP_EPSILON = 0.06;
const POV_INDEX_LOCK_EPSILON = 0.14;
const POV_BEAT_SWAP_PROGRESS = 0.94;

function wheelDeltaY(e) {
  let dy = e.deltaY;
  if (e.deltaMode === 1) dy *= 16;
  else if (e.deltaMode === 2) dy *= window.innerHeight;
  return dy;
}

function isChapterStickyPinned(rect) {
  return (
    rect.top >= -PIN_TOP_TOLERANCE_PX &&
    rect.top <= PIN_TOP_TOLERANCE_PX &&
    rect.bottom > window.innerHeight
  );
}

function measurePovFloatIndex(rect, beatCount) {
  if (!rect || beatCount <= 1) return 0;
  return measureTrack(rect, povPhases(beatCount), window.innerHeight).floatIndex;
}

function measurePovReleaseProgress(rect, beatCount) {
  if (!rect || beatCount <= 1) return 0;
  return measureTrack(rect, povPhases(beatCount), window.innerHeight).releaseProgress;
}

function syncPovStepAnchor(rawFi, anchorRef) {
  const nearest = Math.round(rawFi);
  if (Math.abs(rawFi - nearest) < POV_INDEX_LOCK_EPSILON) {
    anchorRef.current = nearest;
  }
}

function PovMarkers({ markers }) {
  if (!markers) return null;
  return <span className="pov-footnote-marker">{formatPovMarkers(markers)}</span>;
}

function PovLine({ role, text, markers, index, isCurrent }) {
  return (
    <p className={`pov-line pov-line--${role}`} style={animStyle(isCurrent, index)}>
      {text}
      <PovMarkers markers={markers} />
    </p>
  );
}

function animStyle(isCurrent, index) {
  return isCurrent
    ? { '--line-i': index, '--stagger': `${LINE_STAGGER_S}s` }
    : undefined;
}

function PovSlide({ beat, isCurrent }) {
  let animIndex = 0;
  const nextAnim = () => {
    const i = animIndex;
    animIndex += 1;
    return animStyle(isCurrent, i);
  };

  if (beat.id === 'design-close') {
    const practice = beat.lines.find((l) => l.role === 'practice');
    const closingLead = beat.lines.find((l) => l.role === 'closingLead');
    const closingGravity = beat.lines.find((l) => l.role === 'closingGravity');

    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-design__upper">
          {practice && (
            <p className="pov-line pov-line--practice" style={nextAnim()}>
              {practice.text}
              <PovMarkers markers={practice.markers} />
            </p>
          )}
          <div className="pov-boundaries">
            {beat.lines
              .filter((l) => l.role === 'boundary')
              .map((line) => (
                <p key={line.text} className="pov-line pov-line--boundary">
                  {line.text}
                </p>
              ))}
          </div>
        </div>
        <div className="pov-closing">
          {closingLead && (
            <p className="pov-line pov-line--closingLead" style={nextAnim()}>
              {closingLead.text}
            </p>
          )}
          {closingGravity && (
            <p className="pov-line pov-line--closingGravity" style={nextAnim()}>
              {closingGravity.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (beat.id === 'saw') {
    const setup = beat.lines.find((l) => l.role === 'setup');
    const core = beat.lines.find((l) => l.role === 'core');

    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-zone pov-zone--setup">
          {setup && (
            <p className="pov-line pov-line--setup" style={nextAnim()}>
              {setup.text}
            </p>
          )}
        </div>
        <div className="pov-zone pov-zone--weight">
          {core && (
            <p className="pov-line pov-line--core" style={nextAnim()}>
              {core.text}
              {core.markers ? <span className="pov-footnote-marker">{core.markers}</span> : null}
            </p>
          )}
          <div className="pov-pairs" style={nextAnim()}>
            {beat.lines
              .filter((l) => l.role === 'pair')
              .map((line) => (
                <p key={line.text} className="pov-line pov-line--pair">
                  {line.text}
                </p>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (beat.id === 'thesis-origin') {
    const label = beat.lines.find((l) => l.role === 'label');
    const gravity = beat.lines.find((l) => l.role === 'gravity');
    const origin = beat.lines.find((l) => l.role === 'origin');

    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-zone pov-zone--declare">
          {label && (
            <p className="pov-line pov-line--label" style={nextAnim()}>
              {label.text}
            </p>
          )}
          {gravity && (
            <p className="pov-line pov-line--gravity" style={nextAnim()}>
              {gravity.text}
              <PovMarkers markers={gravity.markers} />
            </p>
          )}
        </div>
        {origin && (
          <p className="pov-line pov-line--origin pov-zone--provenance" style={nextAnim()}>
            {origin.text}
          </p>
        )}
      </div>
    );
  }

  if (beat.id === 'believe') {
    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-zone pov-zone--stance">
          {beat.lines.map((line) => (
            <PovLine
              key={`${line.role}-${line.text}`}
              role={line.role}
              text={line.text}
              markers={line.markers}
              index={animIndex++}
              isCurrent={isCurrent}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function ApproachSection() {
  const isMobileHome = useMobileHomeMode();
  const wrapRef = useRef(null);
  const { activeId } = useNarrativeScroll();
  const { setDepthFloat } = useFieldNarrative();
  const { subscribe } = useScrollOrchestrator();
  const { exitProgress, reducedMotion: handoffReduced } = usePovArchiveHandoff();
  const [beatIndex, setBeatIndex] = useState(0);
  const [scrollFloat, setScrollFloat] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const beatIndexRef = useRef(0);
  const stepAnchorRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const wheelStepConsumedRef = useRef(false);
  const scrollTweenRef = useRef(null);
  const inputLockUntilRef = useRef(0);
  const beatTransitRef = useRef(false);
  const beatSwapAppliedRef = useRef(false);
  const wheelAccumResetRef = useRef(null);
  const chapterNavLockUntilRef = useRef(0);
  const prevActiveIdRef = useRef(null);

  const n = povBeats.length;
  const corridorVh = handoffReduced ? 0 : 38;
  const trackVh = povTrackHeightVhFromPhases(n, corridorVh);
  const effectiveExit = useMemo(() => {
    if (handoffReduced) return exitProgress;
    /* Last beat stays fully opaque until scroll enters the handoff corridor */
    if (beatIndex >= n - 1 && scrollFloat < n - 1 + 0.14) {
      return Math.min(exitProgress, 0.03);
    }
    return exitProgress;
  }, [exitProgress, beatIndex, scrollFloat, n, handoffReduced]);
  const exitLayers = useMemo(
    () => povExitLayers(effectiveExit, handoffReduced),
    [effectiveExit, handoffReduced],
  );

  useEffect(() => {
    beatIndexRef.current = beatIndex;
  }, [beatIndex]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  useEffect(() => {
    if (activeId === 'home-approach') {
      const blueHold = 1 - exitProgress * 0.88;
      setDepthFloat(beatIndex * blueHold);
    } else {
      setDepthFloat(null);
    }
    return () => setDepthFloat(null);
  }, [activeId, beatIndex, exitProgress, setDepthFloat]);

  const applySettledBeat = useCallback((index) => {
    const clamped = Math.min(n - 1, Math.max(0, index));
    stepAnchorRef.current = clamped;
    beatIndexRef.current = clamped;
    setBeatIndex(clamped);
    setScrollFloat(clamped);
  }, [n]);

  useEffect(() => {
    const onWorkHandoff = () => {
      applySettledBeat(0);
      wheelStepConsumedRef.current = false;
      wheelCooldownRef.current = false;
      inputLockUntilRef.current = performance.now() + STEP_INPUT_LOCK_MS;
    };
    window.addEventListener('portfolio:work-pov-handoff', onWorkHandoff);
    return () => window.removeEventListener('portfolio:work-pov-handoff', onWorkHandoff);
  }, [applySettledBeat]);

  const scrollToBeat = useCallback(
    (index, behavior = 'smooth', options = {}) => {
      const { force = false } = options;
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
      beatTransitRef.current = true;
      beatSwapAppliedRef.current = false;

      if (!scrollTweenRef.current) {
        scrollTweenRef.current = createTrackScrollTween();
      }
      scrollTweenRef.current.cancel();
      wheelAccumResetRef.current?.();

      const to = clamped;
      const phases = povPhases(n);
      const targetY = trackScrollTargetY(el, phases, to);

      if (Math.abs(targetY - window.scrollY) < 6) {
        if (to !== current) {
          applySettledBeat(to);
        }
        wheelStepConsumedRef.current = false;
        return;
      }

      const maybeSwapBeat = (linearP) => {
        if (beatSwapAppliedRef.current || linearP < POV_BEAT_SWAP_PROGRESS) return;
        beatSwapAppliedRef.current = true;
        stepAnchorRef.current = to;
        beatIndexRef.current = to;
        setBeatIndex(to);
        setScrollFloat(to);
      };

      const finish = () => {
        const exactY = trackScrollTargetY(el, phases, to);
        window.scrollTo(0, exactY);
        maybeSwapBeat(1);
        applySettledBeat(to);
        beatTransitRef.current = false;
        beatSwapAppliedRef.current = false;
        wheelCooldownRef.current = false;
        wheelStepConsumedRef.current = false;
        inputLockUntilRef.current = performance.now() + STEP_INPUT_LOCK_MS;
        wheelAccumResetRef.current?.();
      };

      if (reducedMotion || handoffReduced || behavior === 'auto') {
        window.scrollTo(0, targetY);
        finish();
        return;
      }

      scrollTweenRef.current.tweenTo(targetY, {
        duration: SCROLL_TWEEN_MS,
        ease: easeInOutCubic,
        onProgress: maybeSwapBeat,
        onComplete: finish,
      });
    },
    [applySettledBeat, handoffReduced, n, reducedMotion],
  );

  const bumpBeat = useCallback(
    (dir) => {
      if (wheelStepConsumedRef.current) return;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return;
      if (performance.now() < inputLockUntilRef.current) return;
      if (beatTransitRef.current) return;

      const current = stepAnchorRef.current;
      const next = Math.min(n - 1, Math.max(0, current + dir));
      if (next === current) {
        wheelStepConsumedRef.current = false;
        return;
      }

      wheelStepConsumedRef.current = true;
      scrollToBeat(next, 'smooth');
    },
    [n, scrollToBeat],
  );

  useEffect(() => {
    const prev = prevActiveIdRef.current;
    prevActiveIdRef.current = activeId;
    if (activeId !== 'home-approach' || prev === 'home-approach') return undefined;
    if (isChapterTransition('work-pov') && prev === 'home-work-narrative') return undefined;

    wheelStepConsumedRef.current = false;
    wheelCooldownRef.current = false;
    inputLockUntilRef.current = 0;
    beatTransitRef.current = false;

    const el = wrapRef.current;
    if (!el) {
      applySettledBeat(0);
      return undefined;
    }

    const rect = el.getBoundingClientRect();
    const rawFi = measurePovFloatIndex(rect, n);
    let target = Math.min(n - 1, Math.max(0, Math.round(rawFi)));

    if (prev === 'home-work-narrative') {
      target = rawFi >= 0.55 ? target : 0;
    }

    applySettledBeat(target);
    if (Math.abs(rawFi - target) > 0.08) {
      scrollToBeat(target, isChapterStickyPinned(rect) ? 'auto' : 'smooth');
    }
    return undefined;
  }, [activeId, applySettledBeat, n, scrollToBeat]);

  useEffect(() => {
    const onChapterNav = (e) => {
      const { targetId, panelIndex = 0, syncOnly, prepare } = e.detail ?? {};
      if (targetId !== 'point-of-view') return;
      scrollTweenRef.current?.cancel();
      if (prepare) return;
      chapterNavLockUntilRef.current =
        performance.now() + (syncOnly ? 180 : 920);
      const clamped = Math.min(n - 1, Math.max(0, panelIndex));
      wheelCooldownRef.current = false;
      wheelStepConsumedRef.current = false;
      beatTransitRef.current = false;
      applySettledBeat(clamped);
      if (!syncOnly) {
        scrollToBeat(clamped, 'smooth', { force: true });
      }
    };
    window.addEventListener(HOME_CHAPTER_NAV_EVENT, onChapterNav);
    return () => window.removeEventListener(HOME_CHAPTER_NAV_EVENT, onChapterNav);
  }, [applySettledBeat, n, scrollToBeat]);

  useEffect(() => {
    const onScroll = () => {
      if (performance.now() < chapterNavLockUntilRef.current) return;
      if (isChapterTransition()) return;
      if (beatTransitRef.current || wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) {
        return;
      }

      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!isChapterStickyPinned(rect)) return;

      const rawFi = measurePovFloatIndex(rect, n);
      const anchor = stepAnchorRef.current;
      const releaseP = measurePovReleaseProgress(rect, n);
      const atEnd = anchor >= n - 1;
      const atStart = anchor <= 0;
      const leavingDown = atEnd && releaseP > 0.05;
      const leavingUp = atStart && rawFi < anchor - 0.12;

      if (leavingDown || leavingUp) {
        setScrollFloat(rawFi);
        return;
      }

      syncPovStepAnchor(rawFi, stepAnchorRef);
      const synced = stepAnchorRef.current;
      if (Math.abs(rawFi - synced) < BEAT_SNAP_EPSILON) {
        setScrollFloat(synced);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [n, scrollToBeat]);

  useEffect(() => {
    if (isMobileHome || reducedMotion || handoffReduced) return undefined;

    let wheelAccum = 0;
    wheelAccumResetRef.current = () => {
      wheelAccum = 0;
    };

    const tryWheelStep = (dir) => {
      if (wheelStepConsumedRef.current) return false;
      if (wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) return false;
      if (performance.now() < inputLockUntilRef.current) return false;
      if (beatTransitRef.current) return false;
      if (dir === 1 && stepAnchorRef.current >= n - 1) return false;
      bumpBeat(dir);
      wheelAccum = 0;
      return true;
    };

    const onWheel = (e) => {
      const workTrack = document.getElementById('home-work-strongest');
      if (workTrack && activeId === 'home-work-narrative') {
        const wr = workTrack.getBoundingClientRect();
        const vh = window.innerHeight;
        if (wr.top <= PIN_TOP_TOLERANCE_PX + 8 && wr.bottom > vh * 0.45) {
          return;
        }
      }

      const el = wrapRef.current;
      if (!el) return;
      const vh = window.innerHeight;
      const rect = el.getBoundingClientRect();
      if (rect.bottom < 48 || rect.top > vh + 48) return;

      const povEngaged =
        activeId === 'home-approach' ||
        (rect.top <= PIN_TOP_TOLERANCE_PX + 8 && rect.bottom > vh * 0.42);
      if (!povEngaged) return;

      const isPinned = isChapterStickyPinned(rect);
      if (!isPinned && activeId !== 'home-approach') return;

      const anchor = stepAnchorRef.current;
      const onLastBeat = anchor >= n - 1;
      const deltaY = wheelDeltaY(e);
      const scrollingDown = deltaY > 0.5;
      const scrollingUp = deltaY < -0.5;
      if (!scrollingDown && !scrollingUp) return;

      if (scrollingUp && anchor <= 0) return;

      if (onLastBeat && scrollingDown) {
        wheelAccum = 0;
        return;
      }

      if (
        wheelStepConsumedRef.current ||
        wheelCooldownRef.current ||
        scrollTweenRef.current?.isRunning() ||
        beatTransitRef.current ||
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
  }, [activeId, bumpBeat, handoffReduced, isMobileHome, n, reducedMotion]);

  useEffect(() => () => scrollTweenRef.current?.cancel(), []);

  useEffect(() => {
    return subscribe((snapshot) => {
      if (performance.now() < chapterNavLockUntilRef.current) return;
      if (beatTransitRef.current || wheelCooldownRef.current || scrollTweenRef.current?.isRunning()) {
        return;
      }
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const releaseP = measurePovReleaseProgress(rect, n);
      const anchor = stepAnchorRef.current;
      const atEnd = anchor >= n - 1;
      if (isChapterStickyPinned(rect) && !(atEnd && releaseP > 0.05)) {
        setScrollFloat(anchor);
        return;
      }
      const fi = snapshot.pov.track.floatIndex;
      setScrollFloat((prev) => (Math.abs(prev - fi) > 0.003 ? fi : prev));
    });
  }, [n, subscribe]);

  return (
    <section
      ref={wrapRef}
      className="pov-scroll"
      style={isMobileHome ? undefined : { height: `${trackVh}vh`, minHeight: `${trackVh}vh` }}
      aria-labelledby="home-pov-title"
    >
      <h2 id="home-pov-title" className="sr-only">
        Point of View
      </h2>

      <div className="pov-scroll__snaps" aria-hidden="true">
        {povBeats.map((beat) => (
          <div key={beat.id} className="pov-scroll__snap" />
        ))}
      </div>

      <div className="pov-atmosphere" aria-hidden="true" style={exitLayers.atmosphere}>
        <svg className="pov-curve" viewBox="0 0 400 800" preserveAspectRatio="none">
          <path
            d="M 300 48 Q 140 400 300 752"
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="1"
          />
        </svg>
      </div>

      {corridorVh > 0 ? (
        <div className="pov-scroll__corridor" aria-hidden="true" style={{ height: `${corridorVh}vh` }} />
      ) : null}

      <div
        className="pov-pin"
        data-pov-exit={exitProgress > 0.04 ? 'true' : undefined}
        style={exitLayers.stage}
      >
        <div className="pov-pin__stage">
          {povBeats.map((beat, i) => (
            <PovSlide key={beat.id} beat={beat} isCurrent={isMobileHome || beatIndex === i} />
          ))}
        </div>
      </div>
    </section>
  );
}
