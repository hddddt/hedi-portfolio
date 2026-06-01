import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSmoothedScrollProgress } from '../../hooks/useSmoothedScrollProgress.js';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import {
  measureWorkFloatIndex,
  syncWorkStepAnchor,
  workCaseCopyLayerStyle,
  workCaseCopyPartStyle,
  workCaseCopyVisible,
  workCaseInVisualBand,
  workFrameEntryStyle,
  workRailOnesFlipStyle,
  workSettledIndex,
  workSpineFloatIndex,
  workStageIndex,
  workTrackHeightVh,
  workTrackScrollTargetY,
  workVisualCrossfade,
} from '../../utils/workChoreography.js';
import { measureChapterEntryProgress } from '../../utils/scrollMotion.js';
import {
  createTrackScrollTween,
  easeInOutCubic,
} from '../../utils/scrollTrack.js';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { useProjectAccess } from '../../context/ProjectAccessContext.jsx';
import { WorkCaseDetail } from './WorkCaseDetail.jsx';

const WHEEL_STEP_THRESHOLD = 24;
const SCROLL_TWEEN_MS = 520;
const SNAP_SETTLE_MS = 60;
const SNAP_EPSILON = 0.04;
const PIN_TOP_TOLERANCE_PX = 3;
const CHAPTER_ENTRY_DONE = 0.992;

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

export function WorkNarrativeSection({ cases = [] }) {
  const { activeId } = useNarrativeScroll();
  const { unlocked, requestAccess, pendingCaseId, clearPendingCase } = useProjectAccess();
  const { setCaseDetailOpen } = useOrbScene();
  const wrapRef = useRef(null);
  const guideScrollLockUntilRef = useRef(0);
  const stepAnchorRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const scrollTweenRef = useRef(null);
  const snapTimerRef = useRef(null);
  const entryProgressRef = useRef(1);
  const [floatIndex, setFloatIndex] = useState(0);
  const [openCaseId, setOpenCaseId] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

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

  const inChapterEntry = entryProgress < CHAPTER_ENTRY_DONE;
  const choreoIndex = useMemo(() => {
    if (inChapterEntry) return 0;
    return workSpineFloatIndex(floatIndex, n || 1);
  }, [floatIndex, inChapterEntry, n]);

  const idx = n ? workStageIndex(inChapterEntry ? 0 : floatIndex, n) : 0;
  const c = n ? cases[idx] : null;

  const scrollToCase = useCallback(
    (index, behavior = 'smooth') => {
      const el = wrapRef.current;
      if (!el || n <= 1) return;
      const clamped = Math.min(n - 1, Math.max(0, index));
      stepAnchorRef.current = clamped;

      if (!scrollTweenRef.current) {
        scrollTweenRef.current = createTrackScrollTween();
      }
      scrollTweenRef.current.cancel();

      const targetY = workTrackScrollTargetY(el, clamped, n);
      const finish = () => {
        const exactY = workTrackScrollTargetY(el, clamped, n);
        window.scrollTo(0, exactY);
        stepAnchorRef.current = clamped;
        setFloatIndex(clamped);
        wheelCooldownRef.current = false;
      };

      if (reducedMotion || behavior === 'auto') {
        window.scrollTo(0, targetY);
        finish();
        return;
      }

      wheelCooldownRef.current = true;
      scrollTweenRef.current.tweenTo(targetY, {
        duration: SCROLL_TWEEN_MS,
        ease: easeInOutCubic,
        onComplete: finish,
      });
    },
    [n, reducedMotion],
  );

  const bumpCase = useCallback(
    (dir) => {
      const el = wrapRef.current;
      if (!el || n <= 1) return;
      const fi = measureWorkFloatIndex(el.getBoundingClientRect(), n);
      syncWorkStepAnchor(fi, stepAnchorRef);
      const anchor = stepAnchorRef.current;
      const next = Math.min(n - 1, Math.max(0, anchor + dir));
      if (next === anchor) return;
      scrollToCase(next, 'smooth');
    },
    [n, scrollToCase],
  );

  useEffect(() => {
    if (!n || openCaseId) return undefined;
    const onScroll = () => {
      if (performance.now() < guideScrollLockUntilRef.current) return;
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const rawFi = measureWorkFloatIndex(rect, n);

      if (isChapterStickyPinned(rect) && n > 1 && !scrollTweenRef.current?.isRunning()) {
        const anchor = stepAnchorRef.current;
        syncWorkStepAnchor(rawFi, stepAnchorRef);
        const target = Math.round(rawFi);
        const atEnd = anchor >= n - 1;
        const atStart = anchor <= 0;
        const leavingDown = atEnd && rawFi > anchor + 0.12;
        const leavingUp = atStart && rawFi < anchor - 0.12;
        if (!leavingDown && !leavingUp && Math.abs(target - anchor) > 1) {
          const clamped = Math.min(n - 1, Math.max(0, anchor + Math.sign(target - anchor)));
          scrollToCase(clamped, 'smooth');
          return;
        }
      }

      setFloatIndex(rawFi);

      if (wheelCooldownRef.current) return;

      clearTimeout(snapTimerRef.current);
      snapTimerRef.current = window.setTimeout(() => {
        if (openCaseId) return;
        const r = el.getBoundingClientRect();
        if (!isChapterStickyPinned(r)) return;
        const latest = measureWorkFloatIndex(r, n);
        const snap = Math.round(latest);
        syncWorkStepAnchor(latest, stepAnchorRef);
        if (Math.abs(latest - snap) > 0.02) {
          scrollToCase(snap, 'smooth');
        } else {
          stepAnchorRef.current = snap;
          setFloatIndex(snap);
        }
      }, SNAP_SETTLE_MS);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(snapTimerRef.current);
    };
  }, [n, openCaseId, reducedMotion, scrollToCase]);

  useEffect(() => {
    if (reducedMotion || !n || openCaseId) return undefined;

    let wheelAccum = 0;
    let wheelResetTimer = null;

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
      const approaching =
        rect.top > PIN_TOP_TOLERANCE_PX && rect.top < window.innerHeight * 0.55;
      if (!isPinned && !approaching) return;

      if (!isPinned) return;

      if (entryProgressRef.current < CHAPTER_ENTRY_DONE) return;

      const fiNow = measureWorkFloatIndex(rect, n);
      syncWorkStepAnchor(fiNow, stepAnchorRef);
      const anchor = stepAnchorRef.current;
      const atLast = anchor >= n - 1;
      const atFirst = anchor <= 0;
      const scrollingDown = e.deltaY > 0;
      const scrollingUp = e.deltaY < 0;

      /* At first/last case, release wheel so the page can exit the chapter */
      if ((scrollingDown && atLast) || (scrollingUp && atFirst)) {
        return;
      }

      e.preventDefault();

      const wheelDir = scrollingDown ? 1 : -1;
      if (wheelCooldownRef.current && scrollTweenRef.current?.isRunning()) {
        const nextFromTween = Math.min(n - 1, Math.max(0, anchor + wheelDir));
        if (nextFromTween !== anchor) {
          wheelAccum = 0;
          bumpCase(wheelDir);
          return;
        }
      }
      if (wheelCooldownRef.current) return;

      wheelAccum += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAccum = 0;
      }, 220);

      if (wheelAccum >= WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        bumpCase(1);
      } else if (wheelAccum <= -WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        bumpCase(-1);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      clearTimeout(wheelResetTimer);
    };
  }, [activeId, bumpCase, n, openCaseId, reducedMotion]);

  useEffect(() => {
    if (!n || openCaseId) return undefined;
    const onKey = (e) => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (!isChapterStickyPinned(rect)) return;

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
  }, [bumpCase, n, openCaseId]);

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
      setFloatIndex(nextIdx);
      scrollToCase(nextIdx, 'smooth');
    };
    window.addEventListener('portfolio-guide-focus-case', onGuideFocusCase);
    return () => window.removeEventListener('portfolio-guide-focus-case', onGuideFocusCase);
  }, [cases, n, scrollToCase]);

  /** Pin work chapter — snap to nearest case so the triptych never rests mid-step. */
  useEffect(() => {
    if (!n || openCaseId) return undefined;
    if (activeId !== 'home-work-narrative') return undefined;
    const el = wrapRef.current;
    if (!el) return undefined;

    const alignIfPinned = () => {
      const rect = el.getBoundingClientRect();
      if (!isChapterStickyPinned(rect)) return;
      const fi = measureWorkFloatIndex(rect, n);
      syncWorkStepAnchor(fi, stepAnchorRef);
      const target = Math.min(n - 1, Math.max(0, Math.round(fi)));
      if (Math.abs(fi - target) > SNAP_EPSILON && !scrollTweenRef.current?.isRunning()) {
        scrollToCase(target, 'auto');
      } else {
        stepAnchorRef.current = target;
        setFloatIndex(target);
      }
    };

    alignIfPinned();
    const onScroll = () => {
      if (activeId !== 'home-work-narrative') return;
      const r = el.getBoundingClientRect();
      if (!isChapterStickyPinned(r)) return;
      alignIfPinned();
      window.removeEventListener('scroll', onScroll);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [activeId, n, openCaseId, scrollToCase]);

  useEffect(
    () => () => scrollTweenRef.current?.cancel(),
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
  const frameEntryStyle = inChapterEntry ? workFrameEntryStyle(entryProgress, reducedMotion) : undefined;

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
        <div className="work-sticky">
          <div className="work-narrative__glow" style={{ '--wn-accent': c.accent }} aria-hidden="true" />
          <div className="work-narrative__frame" style={frameEntryStyle}>
            <div className="work-narrative__rail" aria-label={`Case ${formatCaseRailIndex(idx)} of 0${n}`}>
              <div className="work-narrative__rail-meter" aria-hidden="true">
                <span className="work-narrative__rail-digit work-narrative__rail-digit--lead">0</span>
                <span className="work-narrative__rail-flip work-narrative__rail-flip--scroll">
                  {cases.map((item, i) => (
                    <span
                      key={item.id}
                      className="work-narrative__rail-digit work-narrative__rail-digit--ones"
                      style={workRailOnesFlipStyle(inChapterEntry ? 0 : floatIndex, i, n)}
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

            <div className="work-narrative__stage work-narrative__stage--spine">
              {cases.map((item, i) => {
                if (inChapterEntry && i !== 0) return null;
                if (!workCaseInVisualBand(inChapterEntry ? 0 : floatIndex, i, n)) return null;
                const settled = workSettledIndex(inChapterEntry ? 0 : floatIndex, n);
                const dist = i - choreoIndex;
                const isActive = i === settled && Math.abs(dist) < 0.42;
                const visualStyle = workVisualCrossfade(inChapterEntry ? 0 : floatIndex, i, reducedMotion, n);
                const locked = !unlocked;
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`work-narrative__visual work-narrative__visual--track${isActive ? ' is-active' : ''}${Math.abs(dist) < 1.2 && !isActive ? ' is-adjacent' : ''}${locked ? ' work-narrative__visual--locked' : ''}`}
                    style={{
                      ...visualStyle,
                      zIndex: visualStyle.zIndex ?? 0,
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

            <div className="work-narrative__copy work-narrative__copy--switch">
              {cases.map((item, i) => {
                if (inChapterEntry && i !== 0) return null;
                if (!workCaseCopyVisible(inChapterEntry ? 0 : floatIndex, i, n)) return null;
                const layerStyle = workCaseCopyLayerStyle(inChapterEntry ? 0 : floatIndex, i, reducedMotion, n);
                const titleStyle = workCaseCopyPartStyle(inChapterEntry ? 0 : floatIndex, i, 'title', reducedMotion, n);
                const introStyle = workCaseCopyPartStyle(inChapterEntry ? 0 : floatIndex, i, 'intro', reducedMotion, n);
                const bulletsStyle = workCaseCopyPartStyle(inChapterEntry ? 0 : floatIndex, i, 'bullets', reducedMotion, n);
                const tagsStyle = workCaseCopyPartStyle(inChapterEntry ? 0 : floatIndex, i, 'tags', reducedMotion, n);
                const textReadable = Math.max(
                  titleStyle.opacity ?? 0,
                  introStyle.opacity ?? 0,
                );
                if (textReadable < 0.04 && (layerStyle.opacity ?? 0) < 0.04) {
                  return null;
                }
                const isActive = Math.round(floatIndex) === i || textReadable > 0.72;
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
                      <p className="work-narrative__intro" style={introStyle}>
                        {item.narrativeBlock.subtitle}
                      </p>
                      <ul className="work-narrative__bullets" style={bulletsStyle}>
                        {item.narrativeBlock.bullets.map((line) => (
                          <li key={line} className="work-narrative__bullet">
                            {line}
                          </li>
                        ))}
                      </ul>
                      <ul
                        className="work-narrative__tags"
                        aria-label="Key signals"
                        style={tagsStyle}
                      >
                        {item.narrativeBlock.tags.map((tag) => (
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
                      <p className="work-narrative__intro" style={introStyle}>
                        {item.layer}
                      </p>
                      <p
                        className="work-narrative__intro work-narrative__intro--muted"
                        style={introStyle}
                      >
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
