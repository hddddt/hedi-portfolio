import { useCallback, useEffect, useRef, useState } from 'react';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { capabilitySectionCopy } from '../../data/homeScrollChapters.js';
import {
  computeHeroScrollNarrative,
  OPENING_PHASE2_END,
  OPENING_SETTLE_END,
  OPENING_THESIS_REVEAL_END,
} from '../../utils/heroFieldMotion.js';
import { LandingOrganicField } from './OrganicField.jsx';

/** Shared oblique system (~30°), flattened vertically in SVG group space */
const ORBIT_AXIS_DEG = -30;

function smoothstep(edge0, edge1, x) {
  if (edge1 <= edge0) return x >= edge1 ? 1 : 0;
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function mix(a, b, t) {
  return a + (b - a) * t;
}

/**
 * Scroll 0→1: tilted orbit family + fused atmospheric field (offset discs, layered blur).
 */
export function OpeningBridgeSection() {
  const scrollRef = useRef(null);
  const { registerOpeningScroll, openingCapHandoff } = useFieldNarrative();
  const [p, setP] = useState(0);
  const scrollTargetRef = useRef(0);
  const scrollSmoothRef = useRef(0);
  const scrollRafRef = useRef(0);

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
    const measureScrollP = () => {
      const el = scrollRef.current;
      if (!el) return 0;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const t = Math.min(Math.max(-rect.top, 0), total);
      let nextP = t / total;
      if (reduceMotionRef.current) {
        nextP = nextP >= 0.5 ? 1 : 0;
      }
      return nextP;
    };

    const onScroll = () => {
      scrollTargetRef.current = measureScrollP();
    };

    const tick = () => {
      const target = scrollTargetRef.current;
      let next = scrollSmoothRef.current;
      if (reduceMotionRef.current) {
        next = target;
      } else {
        const delta = target - next;
        const gain = Math.abs(delta) > 0.08 ? 0.32 : 0.2;
        next += delta * gain;
        if (Math.abs(target - next) < 0.0006) next = target;
      }
      scrollSmoothRef.current = next;
      setP(next);
      scrollRafRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    scrollRafRef.current = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(scrollRafRef.current);
    };
  }, []);

  const prm = prefersReducedMotion;
  const heroNarrative = computeHeroScrollNarrative(p, prm);
  const open = heroNarrative.heroProgress;
  const gatherBeat = heroNarrative.gather ?? 0;
  const settleBeat = heroNarrative.settle ?? 0;
  const handoffLock = heroNarrative.handoffLock ?? 0;
  const decorFreeze = Math.max(gatherBeat, handoffLock * 0.85);
  const thesisNucleus = heroNarrative.thesisNucleus ?? settleBeat;
  const condenseBeat = heroNarrative.condenseBeat ?? smoothstep(0.02, OPENING_SETTLE_END, p);
  const headlineReveal = heroNarrative.headlineReveal ?? 0;
  const deckReveal = heroNarrative.deckReveal ?? 0;
  const exitDissolve = heroNarrative.exitDissolve ?? smoothstep(OPENING_PHASE2_END, 1, p);
  const thesisExit = heroNarrative.thesisExit ?? 0;
  const capHandoff = openingCapHandoff ?? 0;
  const exitVeil = exitDissolve;
  const thesisState = smoothstep(OPENING_SETTLE_END * 0.5, OPENING_PHASE2_END, p);
  const thesisSettled = smoothstep(OPENING_THESIS_REVEAL_END - 0.06, OPENING_PHASE2_END, p);
  const continuity = smoothstep(0.08, 0.72, gatherBeat * 0.55 + settleBeat * 0.65 + thesisNucleus * 0.35);

  const expand =
    exitDissolve > 0.08
      ? 0
      : smoothstep(0.22, 0.78, open) * (1 - decorFreeze * 0.88);
  const fieldDrive = prm ? open : gatherBeat;
  const orbitDrive = prm ? fieldDrive : smoothstep(0, 0.32, p) * (1 - decorFreeze * 0.55);
  const recede = smoothstep(0.42, 0.94, open);
  const friction = prm ? 0 : Math.min(0.45, Math.abs(fieldDrive - orbitDrive) * 2.2);

  const tonalDeep = smoothstep(0.22, 0.9, open);
  const thesisTone = smoothstep(OPENING_SETTLE_END * 0.65, OPENING_PHASE2_END, p) * 0.35;
  const c1 = Math.round(mix(252, 250, tonalDeep + thesisTone));
  const c2 = Math.round(mix(246, 242, tonalDeep + thesisTone));
  const c3 = Math.round(mix(240, 236, tonalDeep + thesisTone));
  const plateR = Math.round(mix(252, 18, exitVeil));
  const plateG = Math.round(mix(248, 16, exitVeil));
  const plateB = Math.round(mix(238, 14, exitVeil));
  const openingCardStyle = {
    background: `linear-gradient(178deg,rgb(${plateR},${plateG},${plateB}) 0%,rgb(${c2},${c2},${c2}) 50%,rgb(${c3},${c3},${c3}) 100%)`,
    '--opening-gather': String(gatherBeat),
    '--opening-settle': String(settleBeat),
    '--opening-nucleus': String(thesisNucleus),
    '--opening-continuity': String(continuity),
    '--opening-env-handoff': String(exitVeil),
    '--opening-thesis-settled': String(thesisSettled),
    '--opening-thesis-state': String(thesisState),
    '--opening-condense': String(condenseBeat),
  };
  const tonalPlaneStyle = {
    opacity: mix(0.04, 0.08, thesisState),
    background: thesisState > 0.2
      ? 'linear-gradient(182deg,rgba(10,9,8,0) 0%,rgba(10,9,8,0.028) 42%,rgba(10,9,8,0.072) 100%)'
      : 'linear-gradient(182deg,rgba(10,9,8,0) 0%,rgba(10,9,8,0.018) 48%,rgba(10,9,8,0.055) 100%)',
  };

  /** Orbits — narrative skeleton; compress with field, stay legible on thesis as residual trace */
  const orbitExitStruct = smoothstep(0.78, 0.98, exitVeil);
  const orbitResidual =
    mix(1, 0.9, thesisNucleus * 0.35) * mix(1, 0.82, recede) * (1 - orbitExitStruct * 0.12);
  const orbitLegibility = mix(1.18, 1.06, gatherBeat * 0.22 + thesisNucleus * 0.18);
  const orbitThesisBlend = smoothstep(0.22, 0.72, settleBeat * 0.45 + thesisNucleus * 0.65);
  const orbitOpacity =
    mix(mix(0.68, 0.64, thesisNucleus * 0.25), 0.62, orbitThesisBlend * 0.35) *
    orbitResidual *
    orbitLegibility;
  const orbitLeftPct = mix(mix(67, 64, gatherBeat * 0.35), 56, orbitThesisBlend);
  const orbitTopPct = mix(mix(43, 41, gatherBeat * 0.28), 58, orbitThesisBlend);
  const orbitTx = mix(11, 5, orbitDrive) + mix(0, -2, settleBeat);
  const orbitTy = mix(-5, 6, orbitThesisBlend) + mix(0, 3, thesisNucleus);
  const orbitScale =
    mix(1.18, 1.1, gatherBeat) *
    mix(1, 0.94, thesisNucleus * 0.45) *
    mix(1, 1.02, expand);
  const orbitDriftYvh = prm ? 0 : mix(0, 2.5, orbitDrive) + orbitThesisBlend * 1.8 - thesisNucleus * 0.8;
  const orbitCompress = mix(1, 0.9, gatherBeat * 0.55 + thesisNucleus * 0.28);

  const orbitWrapStyle = {
    opacity: orbitOpacity,
    left: `${orbitLeftPct}%`,
    top: `${orbitTopPct}%`,
    width: 'min(132%, 820px)',
    transform: `translate3d(calc(-50% + ${orbitTx}%), calc(-50% + ${orbitTy}% + ${orbitDriftYvh}vh), 0) scale(${orbitScale * orbitCompress})`,
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

  const dashStrokeW = 0.78 + friction * 0.38;
  const solidOrbitGroupOpacity =
    mix(0.74, 0.66, thesisNucleus * 0.35) * mix(1, 0.94, gatherBeat);
  const dashedOrbitGroupOpacity =
    mix(0.68, 0.6, thesisNucleus * 0.3) * mix(0.96, 1, settleBeat);

  /** gather → compress → reveal → settle — one sentence, not two screens */
  const heroRetreat = heroNarrative.fadeHero;
  const heroTravelT = smoothstep(0.04, 0.92, heroRetreat);
  const heroLiftVh = prm ? mix(0, -7, heroTravelT) : mix(0, -14, heroTravelT);
  const heroScale = mix(1, 0.9, heroTravelT);
  const heroTopPct = mix(50, 36, heroTravelT);
  const heroOpacity = mix(1, 0, Math.pow(heroTravelT, 1.35));

  const thesisTravelT = smoothstep(0.08, 1, headlineReveal);
  const thesisTopPct = mix(58, 50, thesisTravelT);
  const thesisLiftVh = mix(prm ? 6 : 10, 1.5, thesisTravelT);
  const thesisScale = mix(0.97, 1, thesisTravelT);
  const capHandoffFade = smoothstep(0.48, 0.92, capHandoff);
  const thesisHandoffFade = Math.max(thesisExit, capHandoffFade * 0.82);
  const thesisSlotOpacity = headlineReveal * (1 - thesisHandoffFade * 0.92);
  const nucleusZoneOpacity =
    smoothstep(0.55, 0.82, headlineReveal) *
    thesisSettled *
    0.38 *
    (1 - capHandoffFade * 0.5);
  const titleStyle = {
    opacity: headlineReveal,
    transform: `translate3d(0, ${mix(18, 0, headlineReveal)}px, 0)`,
  };
  const deckStyle = {
    opacity: deckReveal * (1 - thesisHandoffFade * 0.5),
    transform: `translate3d(0, ${mix(16, 0, deckReveal)}px, 0)`,
  };

  const heroSlotStyle = {
    top: `${heroTopPct}%`,
    transform: `translate3d(0, calc(-50% + ${heroLiftVh}vh), 0) scale(${heroScale})`,
    opacity: heroOpacity,
    visibility: heroOpacity < 0.04 ? 'hidden' : 'visible',
  };
  const thesisSlotStyle = {
    top: `${thesisTopPct}%`,
    transform: `translate3d(0, calc(-50% + ${thesisLiftVh}vh), 0) scale(${thesisScale})`,
    opacity: thesisSlotOpacity,
    visibility: thesisSlotOpacity < 0.04 ? 'hidden' : 'visible',
  };

  const orbitStopMo = !prm && p > 0.025 && p < OPENING_PHASE2_END + 0.02;

  const headlineLines = Array.isArray(capabilitySectionCopy.headline)
    ? capabilitySectionCopy.headline
    : [capabilitySectionCopy.headline];

  return (
    <section ref={setScrollRef} className="opening-scroll" aria-label="Opening">
      <div className="opening-sticky">
        <div className="opening-bridge__frame">
          <div
            className={`opening-card opening-card--plate${thesisState > 0.22 ? ' opening-card--thesis-state' : ''}${thesisSettled > 0.35 ? ' opening-card--thesis-settled' : ''}${handoffLock > 0.35 ? ' opening-card--handoff-lock' : ''}`}
            style={openingCardStyle}
          >
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
                                  stroke="rgba(10,9,8,0.152)"
                                  strokeWidth="0.82"
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
                                  stroke="rgba(10,9,8,0.156)"
                                  strokeWidth="0.76"
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
                                  stroke="rgba(10,9,8,0.162)"
                                  strokeWidth="0.94"
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
                                  stroke="rgba(10,9,8,0.168)"
                                  strokeWidth={dashStrokeW + 0.08}
                                  strokeDasharray="18 10 6 20 10"
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
                <div className="opening-card__sentence">
                  <div
                    className="opening-card__hero-slot motion-reveal-group is-visible"
                    style={heroSlotStyle}
                  >
                    <div className="opening-card__hero-lock">
                      <h1 className="opening-card__name opening-card__wordmark motion-reveal-child">
                        Hedi
                      </h1>
                      <p className="opening-card__sub motion-reveal-child">
                        <span className="opening-card__sub-role">Product Designer</span>
                        <span className="opening-card__sub-lead">
                          AI systems &amp; enterprise workflows
                        </span>
                      </p>
                    </div>
                  </div>
                  <div
                    className={`opening-card__thesis-slot motion-reveal-group${headlineReveal > 0.06 ? ' is-visible' : ''}`}
                    style={thesisSlotStyle}
                  >
                    <div className="opening-card__thesis-unit">
                      <h2
                        id="home-position-title"
                        className="opening-card__title motion-reveal-child"
                        style={titleStyle}
                      >
                        {headlineLines.map((line) => (
                          <span key={line} className="opening-card__title-line">
                            {line}
                            <br />
                          </span>
                        ))}
                      </h2>
                      <div
                        className="opening-card__nucleus-zone"
                        style={{ opacity: nucleusZoneOpacity }}
                        aria-hidden="true"
                      />
                      <p className="opening-card__deck motion-reveal-child" style={deckStyle}>
                        {capabilitySectionCopy.intro}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="opening-card__peripheral"
                  style={{
                    opacity: Math.max(0, 1 - heroRetreat * 0.92 - thesisNucleus * 0.35),
                  }}
                  aria-hidden={heroOpacity < 0.2}
                >
                  <p className="opening-card__scroll-cue">
                    <span className="opening-card__scroll-cue-label">Scroll</span>
                    <span className="opening-card__scroll-cue-track" aria-hidden="true">
                      <span className="opening-card__scroll-cue-line" />
                      <span className="opening-card__scroll-cue-chevron" />
                    </span>
                  </p>
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
