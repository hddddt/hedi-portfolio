import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { capabilitySectionCopy } from '../../data/homeScrollChapters.js';
import { LandingOrganicField } from './OrganicField.jsx';

/** Shared oblique system (~30°), flattened vertically in SVG group space */
const ORBIT_AXIS_DEG = -30;
const FIELD_TILT_DEG = -30;

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Scroll scrub plateau: effective progress freezes while raw p ∈ [holdStart, holdEnd).
 * Agency-style “hold on the line” before the next beat (here: section B main landed).
 */
function plateauProgress(p, holdStart, holdEnd) {
  if (p <= holdStart || holdEnd <= holdStart) return p;
  if (p < holdEnd) return holdStart;
  return holdStart + ((p - holdEnd) / (1 - holdEnd)) * (1 - holdStart);
}

/**
 * Scroll 0→1: tilted orbit family + fused atmospheric field (offset discs, layered blur).
 */
export function OpeningBridgeSection() {
  const scrollRef = useRef(null);
  const { registerOpeningScroll } = useFieldNarrative();
  const [p, setP] = useState(0);

  const setScrollRef = useCallback(
    (el) => {
      scrollRef.current = el;
      registerOpeningScroll(el);
    },
    [registerOpeningScroll],
  );
  const reduceMotionRef = useRef(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPrefersReducedMotion(reduceMotionRef.current);
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => {
      reduceMotionRef.current = mq.matches;
      setPrefersReducedMotion(mq.matches);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = scrollRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const t = Math.min(Math.max(-rect.top, 0), total);
      let nextP = t / total;
      if (reduceMotionRef.current) {
        nextP = nextP >= 0.5 ? 1 : 0;
      }
      setP(nextP);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const prm = prefersReducedMotion;
  /** Tune: ~15% of opening scroll = readable hold on section B main copy */
  const OPENING_HOLD_LO = 0.5;
  const OPENING_HOLD_HI = 0.66;
  const pScrub = prm ? p : plateauProgress(p, OPENING_HOLD_LO, OPENING_HOLD_HI);
  const open = smoothstep(0.03, 0.97, pScrub);

  /** Identity field “opening” — spatial expansion, not only tone */
  const expand = smoothstep(0.04, 0.9, open);
  const spreadField = smoothstep(0.05, 0.9, open);

  const fieldDrive = prm ? open : smoothstep(0.02, 0.88, open);
  const orbitDrive = prm ? fieldDrive : smoothstep(0.18, 0.94, open);
  const descend = smoothstep(0.05, 0.84, open);
  const nucleate = 1 - smoothstep(0, 0.34, open);
  const stretchBand = smoothstep(0.08, 0.52, open) * (1 - smoothstep(0.48, 0.9, open) * 0.35);
  const dilate = smoothstep(0.12, 0.74, open);
  const recede = smoothstep(0.52, 0.98, open);
  const friction = prm ? 0 : Math.min(0.45, Math.abs(fieldDrive - orbitDrive) * 2.2);

  /** Tonal plane: subtle deepen only (not the primary transition read) */
  const tonalDeep = smoothstep(0.22, 0.9, open);
  const c1 = Math.round(mix(252, 248, tonalDeep));
  const c2 = Math.round(mix(246, 238, tonalDeep));
  const c3 = Math.round(mix(240, 230, tonalDeep));
  const openingCardStyle = {
    background: `linear-gradient(178deg,rgb(${c1},${c1},${c1}) 0%,rgb(${c2},${c2},${c2}) 50%,rgb(${c3},${c3},${c3}) 100%)`,
  };
  const tonalPlaneStyle = {
    opacity: mix(0, 0.12, smoothstep(0.28, 0.88, open)),
    background:
      'linear-gradient(182deg,rgba(10,9,8,0) 0%,rgba(10,9,8,0.018) 48%,rgba(10,9,8,0.055) 100%)',
  };

  /** Outer envelope: scroll expands the whole hero field */
  const stretchX = mix(0.92, 1.22, dilate) * mix(1, 0.93, recede) * mix(0.97, 1.06, expand);
  const stretchY = mix(1.0, 1.58, dilate) * mix(1, 0.86, recede) * mix(0.98, 1.12, expand);
  const skewY = prm ? 0 : mix(0, 2.4, stretchBand) * (1 - recede * 0.7);
  const fieldDescendVh = prm ? 0 : mix(0, 6.5, descend);
  const fieldTopPct = mix(35, 48, descend);
  const fieldW = mix(46, 124, fieldDrive) * mix(0.94, 1.02, expand);
  const fieldH = mix(30, 96, fieldDrive) * mix(0.94, 1.04, expand);
  const fieldOpacity = mix(0.99, 0.44, recede);

  const atmosphereStyle = {
    position: 'absolute',
    width: `${fieldW}vw`,
    maxWidth: 'min(940px, 96vw)',
    height: `${fieldH}vh`,
    maxHeight: 'min(680px, 82vh)',
    left: '50%',
    top: `${fieldTopPct}%`,
    opacity: fieldOpacity,
    transform: `translate3d(-50%, calc(-40% + ${fieldDescendVh}vh), 0) skewY(${skewY}deg) scale(${stretchX}, ${stretchY})`,
    transformOrigin: '50% 28%',
  };

  /** Tilted disc: compresses around identity at rest, opens with scroll */
  const flatY = mix(0.86, 0.94, dilate) * mix(1, 0.9, recede) * mix(1.02, 0.92, expand);
  const flatX = mix(1.02, 1.14, dilate) * mix(1, 0.97, recede) * mix(0.98, 1.08, expand);
  const fieldDeformStyle = {
    transform: `rotate(${FIELD_TILT_DEG}deg) scale(${flatX}, ${flatY}) translate(${mix(0, 14, fieldDrive)}px, ${mix(0, 20, dilate)}px)`,
    transformOrigin: '50% 46%',
  };

  const fuseBlur = mix(2, 11, dilate) * mix(1, 0.86, recede) * mix(0.92, 1.05, expand);
  const fieldStackClass = `opening-card__field-stack${prm ? '' : ' opening-card__field-stack--live'}`;
  const fieldStackStyle = {
    filter: `blur(${fuseBlur}px) saturate(${mix(1.05, 0.97, open)})`,
  };

  const blurA = mix(10, 22, dilate) * mix(1, 0.88, recede) * mix(0.94, 1.08, expand);
  const blurB = mix(14, 32, dilate) * mix(1, 0.85, recede) * mix(0.94, 1.1, expand);
  const blurVeil = mix(18, 42, dilate) * mix(1, 0.82, recede) * mix(0.92, 1.06, expand);

  /** Spheres: rest float → scroll freeze → slow spread (translate + anisotropic scale, not uniform “zoom”) */
  const sx = spreadField * (prm ? 0 : 1);
  const discAStyle = {
    opacity: mix(0.94, 0.8, recede),
    filter: `blur(${blurA}px) saturate(${mix(1.12, 1.02, open)})`,
    transform: `translate(${mix(2, -7, expand) - 10 * sx}%, ${mix(2, 14, expand) + 8 * sx}%) scale(${1 + 0.05 * sx}, ${mix(0.9, 0.86, nucleate) - 0.06 * sx})`,
  };
  const discBStyle = {
    opacity: mix(0.88, 0.72, recede),
    filter: `blur(${blurB}px) saturate(${mix(1.08, 0.98, open)})`,
    transform: `translate(${mix(-1, 16, expand) + 12 * sx}%, ${mix(1, 10, expand) - 6 * sx}%) scale(${1 - 0.04 * sx}, ${mix(0.92, 0.88, nucleate) + 0.05 * sx})`,
  };
  const discVeilStyle = {
    opacity: mix(0.28, 0.2, recede),
    filter: `blur(${blurVeil}px) saturate(${mix(1.15, 1.02, open)})`,
    transform: `translate(${mix(0, -5, expand) + 4 * sx}%, ${mix(3, 18, expand) + 10 * sx}%) scale(${mix(1.02, 1.14, expand) + 0.06 * sx}, ${mix(0.88, 0.9, expand) - 0.05 * sx})`,
  };

  /** Orbit wrap: tighter around identity at rest, loosens + grows with scroll */
  const orbitOpacity = mix(0.88, 0.32, recede);
  const orbitTx = mix(0, -2.8, orbitDrive);
  const orbitTy = mix(0, 1.8, orbitDrive);
  const orbitScale = mix(1.08, 1.22, orbitDrive) * mix(1, 0.97, recede) * mix(0.98, 1.08, expand);
  const orbitDriftYvh = prm ? 0 : mix(0, 2.8, orbitDrive);

  const orbitWrapStyle = {
    opacity: orbitOpacity,
    transform: `translate3d(calc(-50% + ${orbitTx}%), calc(-46% + ${orbitTy}% + ${orbitDriftYvh}vh), 0) scale(${orbitScale})`,
  };

  const od = orbitDrive;
  const axisNudge = mix(0, -1.1, od) + mix(0, 0.28, friction);
  const flatOrbit = mix(0.84, 0.9, od) * mix(1.02, 0.96, expand);
  const orbitFamily = `translate(200,200) rotate(${ORBIT_AXIS_DEG + axisNudge}) scale(1,${flatOrbit}) translate(-200,-200)`;

  const ex = mix(1, 1.09, expand);
  const e1 = `translate(${mix(0, 10, od)} ${mix(0, -6, od)}) scale(${mix(1, 1.04, od) * ex})`;
  const e2 = `translate(${mix(0, -18, od)} ${mix(0, 12, od)}) scale(${mix(1, 1.06, od) * ex})`;
  const e3 = `translate(${mix(0, -8, od)} ${mix(0, 20, od)}) scale(${mix(1, 1.03, od) * ex})`;
  const e4 = `translate(${mix(0, 14, od)} ${mix(0, -10, od)}) scale(${mix(1, 1.02, od) * ex})`;

  const dashStrokeW = 0.92 + friction * 0.48;
  const solidOrbitGroupOpacity = mix(1, 0.38, smoothstep(0.18, 0.82, open));
  const dashedOrbitGroupOpacity = mix(0.92, 1, smoothstep(0.22, 0.88, open));

  /**
   * A→B: long scroll track + wide smoothsteps so the handoff feels slow and deliberate.
   */
  const ab = smoothstep(0.02, 0.94, open);
  const abShift = smoothstep(0.04, 0.91, ab);
  const sharedShiftVh = prm ? mix(0, -8, abShift) : mix(0, -28, abShift);
  const heroLiftStyle = {
    transform: `translate3d(0, ${sharedShiftVh}vh, 0)`,
  };
  const fadeHero = smoothstep(0.1, 0.56, ab);
  const fadeMain = smoothstep(0.34, 0.8, ab);
  const heroOpacity = 1 - fadeHero;
  const narrativeOpacity = fadeMain;

  const orbitStopMo = !prm && ab > 0.06 && ab < 0.48;

  const idleClass = prm
    ? 'opening-card__atmosphere-idle'
    : 'opening-card__atmosphere-idle opening-card__atmosphere-idle--live';

  const breatheA = prm ? '' : 'opening-card__disc-breathe opening-card__disc-breathe--a';
  const breatheB = prm ? '' : 'opening-card__disc-breathe opening-card__disc-breathe--b';
  const breatheV = prm ? '' : 'opening-card__disc-breathe opening-card__disc-breathe--veil';

  const headlineLines = Array.isArray(capabilitySectionCopy.headline)
    ? capabilitySectionCopy.headline
    : [capabilitySectionCopy.headline];

  return (
    <section ref={setScrollRef} className="opening-scroll" aria-label="Opening">
      <div className="opening-sticky">
        <div className="opening-bridge__frame">
          <div className="opening-card opening-card--plate" style={openingCardStyle}>
            <div className="opening-card__field-slot" aria-hidden="true">
              <LandingOrganicField />
            </div>

            <div className="opening-card__inner">
            <div className="opening-card__tonal-plane" style={tonalPlaneStyle} aria-hidden="true" />

            <div className="opening-card__orbit-wrap" style={orbitWrapStyle} aria-hidden="true">
              <svg className="opening-card__orbit-svg" viewBox="0 0 400 400">
                <g strokeLinecap="round" vectorEffect="non-scaling-stroke">
                  <g transform={orbitFamily}>
                    <g className={orbitStopMo ? 'opening-orbit-strobe-root' : undefined}>
                      <g transform={e3} style={{ opacity: solidOrbitGroupOpacity }}>
                        <g transform="translate(164 228)">
                          <g className={prm ? '' : 'opening-orbit-depth opening-orbit-depth--e3'}>
                            <g
                              className={
                                prm
                                  ? ''
                                  : 'opening-orbit-ring opening-orbit-ring--spin opening-orbit-ring--t3'
                              }
                            >
                              <g className={prm ? '' : 'opening-orbit-idle opening-orbit-idle--s3'}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx="242"
                                  ry="104"
                                  fill="none"
                                  stroke="rgba(10,9,8,0.075)"
                                  strokeWidth="0.68"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot"
                                  cx="242"
                                  cy="0"
                                  r="2.35"
                                  fill="rgba(8,8,8,0.58)"
                                />
                              )}
                            </g>
                          </g>
                        </g>
                      </g>
                      <g transform={e4} style={{ opacity: solidOrbitGroupOpacity }}>
                        <g transform="translate(242 150)">
                          <g className={prm ? '' : 'opening-orbit-depth opening-orbit-depth--e4'}>
                            <g
                              className={
                                prm
                                  ? ''
                                  : 'opening-orbit-ring opening-orbit-ring--spin opening-orbit-ring--t4'
                              }
                            >
                              <g className={prm ? '' : 'opening-orbit-idle opening-orbit-idle--s4'}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx="214"
                                  ry="92"
                                  fill="none"
                                  stroke="rgba(10,9,8,0.09)"
                                  strokeWidth="0.62"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot"
                                  cx="214"
                                  cy="0"
                                  r="2.2"
                                  fill="rgba(8,8,8,0.55)"
                                />
                              )}
                            </g>
                          </g>
                        </g>
                      </g>
                      <g transform={e1} style={{ opacity: solidOrbitGroupOpacity }}>
                        <g transform="translate(178 158)">
                          <g className={prm ? '' : 'opening-orbit-depth opening-orbit-depth--e1'}>
                            <g
                              className={
                                prm
                                  ? ''
                                  : 'opening-orbit-ring opening-orbit-ring--spin opening-orbit-ring--t1'
                              }
                            >
                              <g className={prm ? '' : 'opening-orbit-idle opening-orbit-idle--s1'}>
                                <ellipse
                                  cx="0"
                                  cy="0"
                                  rx="318"
                                  ry="122"
                                  fill="none"
                                  stroke="rgba(10,9,8,0.125)"
                                  strokeWidth="0.82"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot"
                                  cx="318"
                                  cy="0"
                                  r="2.45"
                                  fill="rgba(8,8,8,0.62)"
                                />
                              )}
                            </g>
                          </g>
                        </g>
                      </g>
                      <g transform={e2} style={{ opacity: dashedOrbitGroupOpacity }}>
                        <g transform="translate(206 202)">
                          <g className={prm ? '' : 'opening-orbit-depth opening-orbit-depth--e2'}>
                            <g
                              className={
                                prm
                                  ? ''
                                  : 'opening-orbit-ring opening-orbit-ring--spin opening-orbit-ring--t2'
                              }
                            >
                              <g className={prm ? '' : 'opening-orbit-idle opening-orbit-idle--dash'}>
                                <ellipse
                                  className={prm ? '' : 'opening-orbit-dash-el'}
                                  cx="0"
                                  cy="0"
                                  rx="252"
                                  ry="108"
                                  fill="none"
                                  stroke="rgba(10,9,8,0.34)"
                                  strokeWidth={dashStrokeW}
                                  strokeDasharray="9 5 3 11 6"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot opening-orbit-guide-dot--dash"
                                  cx="252"
                                  cy="0"
                                  r="2.25"
                                  fill="rgba(8,8,8,0.72)"
                                />
                              )}
                            </g>
                          </g>
                        </g>
                      </g>
                    </g>
                  </g>
                </g>
              </svg>
            </div>

            <div className="opening-card__stack">
              <div className="opening-card__layer opening-card__layer--single">
                <div className="opening-card__scroll-rig">
                  <div
                    className="opening-card__hero-lock opening-card__scroll-rig__hero"
                    style={{
                      ...heroLiftStyle,
                      opacity: heroOpacity,
                      visibility: heroOpacity < 0.03 ? 'hidden' : 'visible',
                    }}
                  >
                    <h1 className="opening-card__name opening-card__wordmark">Hedi</h1>
                    <p className="opening-card__sub">
                      <span className="opening-card__sub-role">Product Designer</span>
                      <span
                        className="opening-card__sub-lead"
                        aria-label="for AI systems and enterprise workflows"
                      >
                        <span className="opening-card__sub-for">for </span>
                        <span className="opening-card__sub-ai">AI systems</span>
                        <span className="opening-card__sub-join"> &amp; </span>
                        <span className="opening-card__sub-work">enterprise workflows</span>
                      </span>
                    </p>
                  </div>
                  <div
                    className="opening-card__scroll-rig__position opening-card__scroll-rig__narrative"
                    style={{
                      opacity: narrativeOpacity,
                      visibility: narrativeOpacity < 0.03 ? 'hidden' : 'visible',
                    }}
                  >
                    <div className="opening-card__narrative-bundle opening-card__narrative-bundle--poster">
                      <div className="opening-card__poster">
                        <h2 id="home-position-title" className="opening-card__title">
                          {headlineLines.map((line) => (
                            <span key={line} className="opening-card__title-line">
                              {line}
                              <br />
                            </span>
                          ))}
                        </h2>
                        <p className="opening-card__deck">{capabilitySectionCopy.intro}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
      <div id="home-identity" className="opening-scroll__hash" tabIndex={-1} />
    </section>
  );
}
