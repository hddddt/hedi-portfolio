import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { capabilitySectionCopy, homeCapabilities } from '../../data/homeScrollChapters.js';

const ARC_PATH_D = 'M 108 36 Q 12 400 108 764';
const ARC_VIEW_W = 120;
const ARC_VIEW_H = 800;
const BLUR_MAX_PX = 9;
const PANEL_SCROLL_VH = 100;
const FIELD_TILT_DEG = -45;
const WHEEL_STEP_THRESHOLD = 52;
const WHEEL_STEP_COOLDOWN_MS = 680;
const CHAPTER_SNAP_SETTLE_MS = 900;
const PIN_TOP_TOLERANCE_PX = 3;

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

/** Scroll-scrubbed atmosphere (aligned with Opening field language). */
function capabilityAtmosphere(floatIndex, panelCount, reducedMotion) {
  const panelP = panelCount <= 1 ? 0 : floatIndex / (panelCount - 1);
  const spread = smoothstep(0.06, 0.94, panelP);
  const snapDist = panelCount <= 1 ? 0 : Math.abs(floatIndex - Math.round(floatIndex));
  const settle = reducedMotion ? 1 : 1 - Math.min(1, snapDist * 1.15);
  const sx = spread * (reducedMotion ? 0 : 1);

  const fieldStyle = {
    transform: `translate(-50%, -42%) rotate(${FIELD_TILT_DEG}deg) scale(${mix(0.94, 1.08, spread)}, ${mix(0.92, 1.04, spread)})`,
    opacity: mix(0.78, 0.96, settle),
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

/** Cosine ease: sharp at rest, soft handoff mid-scroll (breathing crossfade). */
function breathe(dist) {
  const t = Math.min(1, Math.max(0, dist));
  const opacity = Math.cos(t * Math.PI * 0.5);
  const blurPx = Math.pow(t, 1.55) * BLUR_MAX_PX;
  return { opacity, blurPx };
}

function labelPresentation(index, floatIndex, reducedMotion) {
  if (reducedMotion) {
    const on = Math.round(floatIndex) === index;
    return { opacity: on ? 1 : 0.22, filter: 'none' };
  }
  const dist = Math.abs(floatIndex - index);
  if (dist >= 1) return { opacity: 0.18, filter: 'blur(3px)' };
  const { opacity, blurPx } = breathe(dist);
  const op = 0.18 + opacity * 0.82;
  return {
    opacity: op,
    filter: blurPx < 0.15 ? 'none' : `blur(${Math.min(4, blurPx * 0.45).toFixed(2)}px)`,
  };
}

export function CapabilityDialSection() {
  const { activeId } = useNarrativeScroll();
  const { setCapabilityFloat } = useFieldNarrative();
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const panelIndexRef = useRef(0);
  const [floatIndex, setFloatIndex] = useState(0);
  const [panelIndex, setPanelIndex] = useState(0);
  const [dot, setDot] = useState({ x: 108, y: 400 });
  const [arcStops, setArcStops] = useState([]);
  const [reducedMotion, setReducedMotion] = useState(false);
  const chapterPinnedRef = useRef(false);
  const prevActiveIdRef = useRef(null);
  /** Last settled panel — scroll may not jump more than ±1 from this anchor */
  const stepAnchorRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const settlingUntilRef = useRef(0);
  const snapInProgressRef = useRef(false);
  const n = homeCapabilities.length;
  const trackVh = n * PANEL_SCROLL_VH;

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

  const scrollOffsetForPanel = useCallback(
    (index) => {
      const el = wrapRef.current;
      if (!el || n <= 1) return 0;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      return (index / (n - 1)) * total;
    },
    [n],
  );

  const scrollToPanel = useCallback(
    (index, behavior = 'smooth') => {
      const el = wrapRef.current;
      if (!el || n <= 1) return;
      const clamped = Math.min(n - 1, Math.max(0, index));
      stepAnchorRef.current = clamped;
      const y = el.getBoundingClientRect().top + window.scrollY + scrollOffsetForPanel(clamped);
      window.scrollTo({ top: y, behavior });
    },
    [n, scrollOffsetForPanel],
  );

  const snapToChapterStart = useCallback(
    (behavior = 'smooth') => {
      const el = wrapRef.current;
      if (!el || snapInProgressRef.current) return;
      snapInProgressRef.current = true;
      settlingUntilRef.current = performance.now() + CHAPTER_SNAP_SETTLE_MS;
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

  const isChapterSettling = useCallback(
    () => performance.now() < settlingUntilRef.current,
    [],
  );

  /** Entering Capabilities chapter — reset to panel 0; only snap scroll if already near the chapter. */
  useEffect(() => {
    const entered = activeId === 'home-capabilities' && prevActiveIdRef.current !== 'home-capabilities';
    prevActiveIdRef.current = activeId;

    if (!entered) return;

    stepAnchorRef.current = 0;
    setFloatIndex(0);
    setPanelIndex(0);

    const el = wrapRef.current;
    if (!el) return undefined;

    const rect = el.getBoundingClientRect();
    /* Do not yank the user from landing / opening — only align when chapter is on screen */
    if (rect.top > window.innerHeight * 0.55) return undefined;

    if (rect.top > PIN_TOP_TOLERANCE_PX) {
      const raf = requestAnimationFrame(() => {
        snapToChapterStart('auto');
      });
      return () => cancelAnimationFrame(raf);
    }
    return undefined;
  }, [activeId, snapToChapterStart]);

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const t = Math.min(Math.max(-rect.top, 0), total);
      const p = t / total;
      const fi = n <= 1 ? 0 : p * (n - 1);
      const pi = Math.min(n - 1, Math.max(0, Math.round(fi)));

      const isPinned =
        rect.top <= PIN_TOP_TOLERANCE_PX && rect.bottom > window.innerHeight;
      if (isPinned && !chapterPinnedRef.current) {
        chapterPinnedRef.current = true;
        stepAnchorRef.current = 0;
        setFloatIndex(0);
        setPanelIndex(0);
        if (fi > 0.04) {
          snapToChapterStart('auto');
          return;
        }
      }
      if (rect.top > window.innerHeight * 0.5) {
        chapterPinnedRef.current = false;
      }

      if (isPinned && n > 1) {
        const anchor = stepAnchorRef.current;
        const target = Math.round(fi);
        const atEnd = anchor >= n - 1;
        const atStart = anchor <= 0;
        /* Do not clamp when leaving the chapter past first / last panel */
        const leavingDown = atEnd && fi > anchor + 0.12;
        const leavingUp = atStart && fi < anchor - 0.12;
        if (!leavingDown && !leavingUp && Math.abs(target - anchor) > 1) {
          const clamped = Math.min(n - 1, Math.max(0, anchor + Math.sign(target - anchor)));
          scrollToPanel(clamped, reducedMotion ? 'auto' : 'smooth');
          return;
        }
        if (Math.abs(fi - target) < 0.07) {
          stepAnchorRef.current = target;
        }
      }

      setFloatIndex(fi);
      setPanelIndex(pi);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [n, reducedMotion, scrollToPanel, snapToChapterStart]);

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

  const bumpScroll = useCallback(
    (dir) => {
      const anchor = stepAnchorRef.current;
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
      const chapterOnScreen = rect.bottom > 48 && rect.top < window.innerHeight;
      if (!chapterOnScreen) return;

      const isPinned =
        rect.top <= PIN_TOP_TOLERANCE_PX && rect.bottom > window.innerHeight;
      /* Chapter top still scrolling in — not deep inside the pinned track */
      const isApproachingPin =
        rect.top > PIN_TOP_TOLERANCE_PX && rect.top < window.innerHeight * 0.55;
      const isSettling = isChapterSettling();
      const scrollingDown = e.deltaY > 0;

      /* Lock downward scroll only while snapping to the chapter pin (panel 0) */
      if (scrollingDown && (isApproachingPin || isSettling)) {
        e.preventDefault();
        if (isApproachingPin && !snapInProgressRef.current) {
          snapToChapterStart('smooth');
        }
        return;
      }

      if (!isPinned) return;

      const anchor = stepAnchorRef.current;
      const atLast = anchor >= n - 1;
      const atFirst = anchor <= 0;
      const scrollingUp = e.deltaY < 0;

      /* At chapter edges, let the page scroll into the prev / next section */
      if ((scrollingDown && atLast && !isSettling) || (scrollingUp && atFirst && !isSettling)) {
        return;
      }

      if (scrollingDown && isSettling) {
        e.preventDefault();
        return;
      }

      e.preventDefault();
      if (wheelCooldownRef.current) return;

      wheelAccum += e.deltaY;
      clearTimeout(wheelResetTimer);
      wheelResetTimer = window.setTimeout(() => {
        wheelAccum = 0;
      }, 220);

      if (wheelAccum >= WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        wheelCooldownRef.current = true;
        bumpScroll(1);
        window.setTimeout(() => {
          wheelCooldownRef.current = false;
        }, WHEEL_STEP_COOLDOWN_MS);
      } else if (wheelAccum <= -WHEEL_STEP_THRESHOLD) {
        wheelAccum = 0;
        wheelCooldownRef.current = true;
        bumpScroll(-1);
        window.setTimeout(() => {
          wheelCooldownRef.current = false;
        }, WHEEL_STEP_COOLDOWN_MS);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', onWheel);
      clearTimeout(wheelResetTimer);
    };
  }, [bumpScroll, reducedMotion, isChapterSettling, snapToChapterStart]);

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

  const atmosphere = capabilityAtmosphere(floatIndex, n, reducedMotion);
  const activePanelIndex = Math.min(n - 1, Math.max(0, Math.round(floatIndex)));
  const activeCap = homeCapabilities[activePanelIndex];
  const headlineLines = activeCap.headlineLines ?? [activeCap.headline];

  return (
    <section
      ref={wrapRef}
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
          aria-valuenow={panelIndex + 1}
        >
          <div className="cap-dial__grain" aria-hidden="true" />

          <div className="cap-dial__stage">
            <div className="cap-dial__wheel cap-dial__wheel--minimal" aria-hidden="true">
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
                    stroke="rgba(255,255,255,0.16)"
                    strokeWidth="1"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle className="cap-dial__arc-dot-circle" cx={dot.x} cy={dot.y} r={3.5} />
                </svg>
                <div className="cap-dial__arc-labels">
                  {arcStops.map((stop, i) => {
                    const pres = labelPresentation(i, floatIndex, reducedMotion);
                    const isNear = Math.abs(floatIndex - i) < 0.42;
                    return (
                      <button
                        key={stop.id}
                        type="button"
                        className={`cap-dial__arc-label ${isNear ? 'is-near' : ''} ${panelIndex === i ? 'is-active' : ''}`}
                        style={{
                          left: `${(stop.x / ARC_VIEW_W) * 100}%`,
                          top: `${(stop.y / ARC_VIEW_H) * 100}%`,
                          opacity: pres.opacity,
                          filter: pres.filter,
                        }}
                        tabIndex={-1}
                        aria-hidden
                        onClick={() => scrollToPanel(i, 'smooth')}
                      >
                        <span className="cap-dial__arc-label-text">
                          {stop.lines.map((line) => (
                            <span key={line} className="cap-dial__arc-label-line">
                              {line}
                            </span>
                          ))}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="cap-dial__main">
              {capabilitySectionCopy.footer ? (
                <p className="cap-dial__footer cap-dial__footer--lead">
                  {capabilitySectionCopy.footer}
                </p>
              ) : null}
              <div className="cap-dial__panel-body">
                <div className="cap-dial__state-stack" aria-live="polite">
                  <div
                    key={activeCap.id}
                    className={[
                      'cap-dial__state-layer',
                      'cap-dial__state-layer--single',
                      'is-settled',
                      reducedMotion ? '' : 'cap-dial__state-layer--enter',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    <h2 className="cap-dial__headline">
                      {headlineLines.map((line, idx) => (
                        <span key={line} className="cap-dial__headline-line">
                          {line}
                          {idx < headlineLines.length - 1 ? <br /> : null}
                        </span>
                      ))}
                    </h2>
                    <p className="cap-dial__lede">{activeCap.description}</p>
                    <div className="cap-dial__chip-groups">
                      <ul
                        className="cap-dial__chips cap-dial__chips--primary"
                        aria-label={`${activeCap.headline} primary focus areas`}
                      >
                        {activeCap.pillsPrimary.map((pill, j) => (
                          <li
                            key={pill}
                            className="cap-dial__chip cap-dial__chip--primary"
                            style={{
                              transitionDelay: `${j * 22}ms`,
                              opacity: 1,
                            }}
                          >
                            {pill}
                          </li>
                        ))}
                      </ul>
                      <ul
                        className="cap-dial__chips cap-dial__chips--secondary"
                        aria-label={`${activeCap.headline} supporting focus areas`}
                      >
                        {activeCap.pillsSecondary.map((pill, j) => (
                          <li
                            key={pill}
                            className="cap-dial__chip cap-dial__chip--secondary"
                            style={{
                              transitionDelay: `${(activeCap.pillsPrimary.length + j) * 22}ms`,
                              opacity: 1,
                            }}
                          >
                            {pill}
                          </li>
                        ))}
                      </ul>
                    </div>
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
