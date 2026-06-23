import { useCallback, useLayoutEffect, useRef } from 'react';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { capabilitySectionCopy } from '../../data/homeScrollChapters.js';
import { useOpeningHeroBoot } from '../../hooks/useOpeningHeroBoot.js';
import { useMobileHomeMode } from '../../utils/mobileHomeMode.js';
import {
  computeHeroScrollNarrative,
  OPENING_PHASE2_END,
  OPENING_SETTLE_END,
  OPENING_THESIS_REVEAL_END,
} from '../../utils/heroFieldMotion.js';
import {
  clampHeroProgress,
  deriveOpeningHeroPhases,
  HERO_PHASE,
} from '../../utils/openingHeroProgress.js';
import { shouldKeepOpeningPlateSurface } from '../../utils/openingHeroPresentation.js';
import { OpeningShaderGradientHero } from './OpeningShaderGradientHero.jsx';

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
 * Scroll 0→1: scroll narrative (screens 1–2) + ShaderGradient-style hero field.
 */
export function OpeningBridgeSection() {
  const isMobileHome = useMobileHomeMode();
  const {
    registerOpeningScroll,
    openingCapExitWipe,
    openingCapHandoff,
    openingCapThesisFade,
    updateOpeningBoot,
    progress,
    openingRawProgress,
    openingComplete,
    prefersReducedMotion: prm,
  } = useFieldNarrative();
  const scrollRef = useRef(null);
  const p = clampHeroProgress(openingComplete ? progress : openingRawProgress);
  const heroProgressRef = useRef(p);
  heroProgressRef.current = p;

  const setScrollRef = useCallback(
    (el) => {
      scrollRef.current = el;
      registerOpeningScroll(el);
    },
    [registerOpeningScroll],
  );

  const {
    elapsedMs,
    boot,
    gates,
    pulse,
    fieldReveal,
    copy,
    shaderVisualReady,
    onShaderReady,
    onShaderVisualReady,
    onShaderTimeout,
  } = useOpeningHeroBoot({
    prefersReducedMotion: prm || isMobileHome,
    scrollP: openingRawProgress,
    updateOpeningBoot,
  });

  const keepOpeningPlate = shouldKeepOpeningPlateSurface({
    elapsedMs,
    scrollP: p,
    openingCapHandoff: openingCapHandoff ?? 0,
    fieldRevealProgress: fieldReveal.progress,
  });

  useLayoutEffect(() => {
    const root = document.querySelector('.home-scroll-root');
    if (!root) return undefined;
    if (keepOpeningPlate) {
      root.dataset.openingBootActive = 'true';
    } else {
      delete root.dataset.openingBootActive;
    }
    root.dataset.openingPresentationPhase = gates.phase;
    return () => {
      delete root.dataset.openingBootActive;
      delete root.dataset.openingPresentationPhase;
    };
  }, [keepOpeningPlate, gates.phase]);

  const fieldBootHidden =
    gates.phase === 'latent' || gates.phase === 'pulse' || !gates.canRevealField;
  const fieldScrollFadeEarly =
    (1 - smoothstep(0.52, 0.78, p)) * (1 - (openingCapExitWipe ?? 0) * 0.85) * (1 - (openingCapHandoff ?? 0) * 0.9);
  const fieldSlotOpacity = fieldBootHidden
    ? 0
    : fieldScrollFadeEarly * (fieldReveal.opacity ?? 1);

  const heroNarrative = computeHeroScrollNarrative(p, prm);
  const phases = deriveOpeningHeroPhases(p);
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
  const capThesisFade = openingCapThesisFade ?? 0;
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

  /** White-gray plate lifts away on scroll 1→2 (shader visible underneath) */
  const plateLift = smoothstep(0.05, 0.5, p);
  const plateGroundStyle = {
    opacity: 1 - plateLift,
    transform: `translate3d(0, ${-105 * plateLift}%, 0)`,
    visibility: plateLift > 0.98 ? 'hidden' : 'visible',
  };

  const openingCardStyle = {
    background: 'transparent',
    '--opening-gather': String(gatherBeat),
    '--opening-settle': String(settleBeat),
    '--opening-nucleus': String(thesisNucleus),
    '--opening-continuity': String(continuity),
    '--opening-env-handoff': String(exitVeil),
    '--opening-thesis-settled': String(thesisSettled),
    '--opening-thesis-state': String(thesisState),
    '--opening-condense': String(condenseBeat),
    '--opening-hero-progress': String(p),
    '--opening-hero-immersion': String(phases.immersionT),
    '--opening-hero-formation': String(phases.formationT),
    '--opening-hero-lockup': String(phases.lockupT),
    '--opening-boot-field': fieldBootHidden ? '0' : String(boot?.fieldReveal ?? boot?.structure ?? 0),
    '--opening-field-slot-opacity': String(fieldSlotOpacity),
    '--opening-field-reveal': String(fieldReveal.progress ?? 0),
    '--opening-pulse-opacity': String(pulse.opacity ?? 0),
  };
  const tonalPlaneStyle = {
    opacity: mix(0.04, 0.08, thesisState),
    background: thesisState > 0.2
      ? 'linear-gradient(182deg,rgba(10,9,8,0) 0%,rgba(10,9,8,0.028) 42%,rgba(10,9,8,0.072) 100%)'
      : 'linear-gradient(182deg,rgba(10,9,8,0) 0%,rgba(10,9,8,0.018) 48%,rgba(10,9,8,0.055) 100%)',
  };

  const orbitExitStruct = smoothstep(0.78, 0.98, exitVeil);
  const orbitResidual =
    mix(1, 0.9, thesisNucleus * 0.35) * mix(1, 0.82, recede) * (1 - orbitExitStruct * 0.12);
  const orbitLegibility = mix(1.18, 1.06, gatherBeat * 0.22 + thesisNucleus * 0.18);
  const orbitThesisBlend = smoothstep(0.22, 0.72, settleBeat * 0.45 + thesisNucleus * 0.65);
  const orbitOpacity =
    mix(mix(0.38, 0.34, thesisNucleus * 0.25), 0.32, orbitThesisBlend * 0.35) *
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

  const orbitBootFade = gates.fieldVisualEntered || p > 0.04 ? 1 : 0;
  const orbitWrapStyle = {
    opacity: orbitOpacity * orbitBootFade,
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
    mix(0.46, 0.4, thesisNucleus * 0.35) * mix(1, 0.9, gatherBeat);
  const dashedOrbitGroupOpacity =
    mix(0.4, 0.34, thesisNucleus * 0.3) * mix(0.92, 1, settleBeat);

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
  const thesisSlotOpacity =
    headlineReveal * (1 - thesisHandoffFade * 0.92) * (1 - capThesisFade * 0.5);
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

  const heroAnchored = heroTravelT < 0.18;
  const heroCopyOpacity = gates.canRevealIdentity ? heroOpacity : 0;
  const heroSlotStyle = heroAnchored
    ? {
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        transform: `scale(${heroScale})`,
        opacity: heroCopyOpacity,
        visibility:
          gates.canRevealIdentity && heroCopyOpacity >= 0.04 ? 'visible' : 'hidden',
      }
    : {
        top: `${heroTopPct}%`,
        left: '50%',
        right: 'auto',
        width: 'min(40rem, 92vw)',
        display: 'grid',
        placeItems: 'center',
        transform: `translate3d(-50%, calc(-50% + ${heroLiftVh}vh), 0) scale(${heroScale})`,
        opacity: heroCopyOpacity,
        visibility:
          gates.canRevealIdentity && heroCopyOpacity >= 0.04 ? 'visible' : 'hidden',
      };
  const thesisSlotStyle = {
    top: `${thesisTopPct}%`,
    transform: `translate3d(0, calc(-50% + ${thesisLiftVh}vh), 0) scale(${thesisScale})`,
    opacity: thesisSlotOpacity,
    visibility: thesisSlotOpacity < 0.04 ? 'hidden' : 'visible',
  };

  const orbitStopMo = !prm && p > 0.025 && p < OPENING_PHASE2_END + 0.02;
  const capExitWipe = openingCapExitWipe ?? 0;

  const identityStyle = {
    opacity: gates.canRevealIdentity ? copy.identity.opacity : 0,
    transform: `translate3d(0, ${copy.identity.y}px, 0)`,
    letterSpacing: `${copy.identity.trackingEm}em`,
  };
  const roleStyle = {
    opacity: gates.canRevealRole ? copy.role.opacity : 0,
    transform: `translate3d(0, ${copy.role.y}px, 0)`,
  };
  const descriptorStyle = {
    opacity: gates.canRevealDescriptor ? copy.descriptor.opacity : 0,
    transform: `translate3d(0, ${copy.descriptor.y}px, 0)`,
  };
  const scrollCueOpacity =
    (gates.canRevealScrollCue ? copy.scrollCue.opacity : 0) *
    Math.max(0, 1 - heroRetreat * 0.92 - thesisNucleus * 0.35);

  const headlineLines = Array.isArray(capabilitySectionCopy.headline)
    ? capabilitySectionCopy.headline
    : [capabilitySectionCopy.headline];

  return (
    <section ref={setScrollRef} className="opening-scroll" aria-label="Opening">
      <div className="opening-sticky">
        <div className="opening-bridge__frame">
          <div
            className={`opening-card opening-card--plate opening-card--hero-shader${!gates.bootComplete ? ' opening-card--boot' : ''}${plateLift > 0.2 ? ' opening-card--plate-retreated' : ''}${thesisState > 0.22 ? ' opening-card--thesis-state' : ''}${thesisSettled > 0.35 ? ' opening-card--thesis-settled' : ''}${handoffLock > 0.35 ? ' opening-card--handoff-lock' : ''}`}
            style={openingCardStyle}
            data-opening-hero-progress={p.toFixed(3)}
            data-opening-presentation-phase={gates.phase}
            data-opening-phase={
              p < HERO_PHASE.IMMERSION_END
                ? 'immersion'
                : p < HERO_PHASE.FORMATION_END
                  ? 'formation'
                  : 'lockup'
            }
          >
            {plateLift < 0.35 ? (
              <div
                className="opening-card__plate-ground"
                style={plateGroundStyle}
                aria-hidden="true"
              />
            ) : null}
            <div
              className="opening-card__field-slot"
              style={{ opacity: fieldSlotOpacity }}
              aria-hidden="true"
            >
              <OpeningShaderGradientHero
                progress={p}
                openingCapHandoff={openingCapHandoff ?? 0}
                openingCapExitWipe={openingCapExitWipe ?? 0}
                canMountShader={gates.canMountShader}
                canRevealField={gates.canRevealField}
                shaderVisualReady={shaderVisualReady}
                fieldReveal={fieldReveal}
                onShaderReady={onShaderReady}
                onShaderVisualReady={onShaderVisualReady}
                onShaderTimeout={onShaderTimeout}
              />
            </div>

            <div
              className="opening-card__env-veil"
              aria-hidden="true"
              style={{ opacity: capExitWipe > 0.02 ? 1 : 0 }}
            />

            <div className="opening-card__inner">
            {gates.showPulse ? (
              <div
                className="opening-card__focus-pulse"
                aria-hidden="true"
                style={{
                  opacity: pulse.opacity * (1 - (pulse.dissolve ?? 0) * 0.85),
                  transform: `translate(-50%, -50%) scale(${pulse.scale})`,
                }}
              />
            ) : null}
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
                                  stroke="rgba(10,9,8,0.09)"
                                  strokeWidth="0.82"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot"
                                  cx="242"
                                  cy="0"
                                  r="2.35"
                                  fill="rgba(8,8,8,0.32)"
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
                                  stroke="rgba(10,9,8,0.088)"
                                  strokeWidth="0.76"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot"
                                  cx="214"
                                  cy="0"
                                  r="2.2"
                                  fill="rgba(8,8,8,0.3)"
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
                                  stroke="rgba(10,9,8,0.092)"
                                  strokeWidth="0.94"
                                />
                              </g>
                              {!prm && (
                                <circle
                                  className="opening-orbit-guide-dot"
                                  cx="318"
                                  cy="0"
                                  r="2.45"
                                  fill="rgba(8,8,8,0.32)"
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
                                  stroke="rgba(10,9,8,0.1)"
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
                                  fill="rgba(8,8,8,0.34)"
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
                    className={`opening-card__hero-slot motion-reveal-group${gates.canRevealIdentity ? ' is-visible' : ''}`}
                    style={heroSlotStyle}
                  >
                    <div className="opening-card__hero-lock">
                      <span className="sr-only">Hedi</span>
                      <p
                        className="opening-card__identity motion-reveal-child opening-copy-driven"
                        style={identityStyle}
                        aria-hidden="true"
                      >
                        HE<span className="opening-card__identity-gap"> </span>DI
                      </p>
                      <p className="opening-card__sub motion-reveal-child opening-copy-driven">
                        <span className="opening-card__sub-role opening-copy-driven" style={roleStyle}>
                          Product Designer
                        </span>
                        <span className="opening-card__sub-lead opening-copy-driven" style={descriptorStyle}>
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
                      <h1
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
                      </h1>
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
                  style={{ opacity: scrollCueOpacity }}
                  aria-hidden={scrollCueOpacity < 0.08 || heroOpacity < 0.2}
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
