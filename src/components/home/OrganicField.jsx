import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { useOrganicFieldHost } from '../../context/OrganicFieldHostContext.jsx';
import { usePerspective } from '../../context/PerspectiveContext.jsx';
import { applyGreenBreathingLayer } from '../../utils/greenFieldBreathing.js';
import { createOrganicFieldRenderer } from './organicFieldGl.js';
import {
  computeHeroFieldTargets,
  computeOpeningFieldPresence,
  computeOpeningScrollOrchestration,
  heroScrollDrive,
  mergeOpeningBootOrchestration,
  shouldUseInCardOrganicField,
  shouldUseViewportOrganicField,
} from '../../utils/heroFieldMotion.js';
import {
  applyWarmArcDrift,
  applyWarmFieldDrift,
  ARC_AMP,
  WARM_MOTION,
  orbSceneArcScale,
  blendChapterClimateTargets,
  blendCapWorkFieldTargets,
  blendMotionTargets,
  blendOpeningToCapabilitiesField,
  computeMotionTargets,
  easeCapabilityFloat,
  easeSmoothstep,
  MOTION_SMOOTH,
  signalGreenActivationEnvelope,
  smoothField,
  smoothScalar,
} from './organicFieldMotion.js';
import { FIELD_BASE_RADII, fieldRadiiMultiplier } from '../../data/fieldSizeHierarchy.js';
import '../../styles/organic-field.css';

export const ORGANIC_FIELD_CONFIG = {
  fields: {
    a: { radii: FIELD_BASE_RADII.a },
    b: { radii: FIELD_BASE_RADII.b },
    c: { radii: FIELD_BASE_RADII.c },
  },
  ambient: {
    warm: { opacityMult: 1.02, scaleMult: 1.02, light: true, extraC: 1.02 },
    signal: { opacityMult: 0.84, scaleMult: 1, light: false, extraC: 1.02, organic: 0.62 },
    work: { opacityMult: 0.82, scaleMult: 1.06, light: false, extraC: 0.96, organic: 0.72 },
    depth: { opacityMult: 0.86, scaleMult: 1.12, light: false, extraC: 1, organic: 0.68 },
    archive: { opacityMult: 0.88, scaleMult: 1.02, light: false, extraC: 1.06, organic: 0.7 },
    contact: { opacityMult: 0.56, scaleMult: 1.08, light: true, extraC: 1.12 },
    default: { opacityMult: 0.7, scaleMult: 1.0, light: false, extraC: 1.05 },
  },
};

const { fields, ambient } = ORGANIC_FIELD_CONFIG;

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function finite(n, fallback = 0) {
  return typeof n === 'number' && Number.isFinite(n) ? n : fallback;
}

function ambientState(ambientKey) {
  return ambient[ambientKey] ?? ambient.default;
}

function fieldRadii(id, stretchX = 1, stretchY = 1, ambKey = 'warm') {
  const [rx0, ry0] = fields[id].radii;
  const isWarmLand = ambKey === 'warm' || ambKey === 'default' || !ambKey;
  const isSignal = ambKey === 'signal';
  if (isSignal || isWarmLand) {
    const avgStretch = (stretchX + stretchY) * 0.5;
    const mult = fieldRadiiMultiplier(id, isSignal ? 'signal' : 'warm') * avgStretch;
    return { x: rx0 * mult, y: ry0 * mult };
  }
  return { x: rx0 * stretchX, y: ry0 * stretchY };
}

function motionFromTargets(targets) {
  return {
    a: {
      ...targets.a,
      stretchX: targets.a.stretchX ?? 1,
      stretchY: targets.a.stretchY ?? 1,
      rotation: targets.a.rotation ?? 0,
      hazeRadiiMult: targets.a.hazeRadiiMult ?? 1,
      flow: 0,
    },
    b: {
      ...targets.b,
      stretchX: targets.b.stretchX ?? 1,
      stretchY: targets.b.stretchY ?? 1,
      rotation: targets.b.rotation ?? 0,
      flow: targets.flowB ?? 0,
    },
    c: {
      ...targets.c,
      stretchX: targets.c.stretchX ?? 1,
      stretchY: targets.c.stretchY ?? 1,
      rotation: targets.c.rotation ?? 0,
      flow: 0,
    },
    flowB: targets.flowB ?? 0,
  };
}

function initMotionState(inCard = false, capHandoff = 0, rawOpen = 1) {
  if (inCard) {
    const t0 = computeMotionTargets(0, null, false, 'warm', null, null, {
      orbScene: 'landing',
      heroProgress: 0,
    });
    return motionFromTargets(t0);
  }
  const p = Math.max(0, Math.min(1, rawOpen ?? 1));
  const orch = computeOpeningScrollOrchestration(p);
  const hero = computeHeroFieldTargets(orch.heroProgress ?? 1, 0, false, orch);
  if (capHandoff < 0.995) {
    const signal = computeMotionTargets(0, null, false, 'signal', 0, null, {
      openingCapBlend: capHandoff,
      orbScene: 'capabilities',
      chapterMorph: 1,
      aLead: 1,
    });
    const blended = blendOpeningToCapabilitiesField(hero, signal, capHandoff);
    return motionFromTargets(blended);
  }
  return motionFromTargets(hero);
}

function OrganicFieldCanvas({ inCard = false }) {
  const { ambientKey } = useNarrativeScroll();
  const { orbScene, workCaseFocus, navFieldHint, contactBlend } = useOrbScene();
  const {
    capabilityFloat,
    depthFloatRef,
    handoffBlendRef,
    capWorkHandoffRef,
    frozenCapFloatRef,
    progress: heroScrollProgress,
    openingComplete,
    openingCapHandoffRef,
    openingBootRef,
  } = useFieldNarrative();
  const { perspectiveKey } = usePerspective();
  const canvasRef = useRef(null);
  const inCardRef = useRef(inCard);
  const ambientKeyRef = useRef(ambientKey);
  const orbSceneRef = useRef(orbScene);
  const workCaseFocusRef = useRef(workCaseFocus);
  const navFieldHintRef = useRef(navFieldHint);
  const contactBlendRef = useRef(contactBlend);
  const capabilityFloatRef = useRef(capabilityFloat);
  const heroProgressRef = useRef(heroScrollProgress);
  const openingCompleteRef = useRef(openingComplete);
  const perspectiveKeyRef = useRef(perspectiveKey);

  useEffect(() => {
    inCardRef.current = inCard;
  }, [inCard]);

  useEffect(() => {
    ambientKeyRef.current = ambientKey;
  }, [ambientKey]);

  useEffect(() => {
    orbSceneRef.current = inCard ? 'landing' : orbScene;
  }, [inCard, orbScene]);

  useEffect(() => {
    workCaseFocusRef.current = workCaseFocus;
  }, [workCaseFocus]);

  useEffect(() => {
    navFieldHintRef.current = navFieldHint;
  }, [navFieldHint]);

  useEffect(() => {
    contactBlendRef.current = contactBlend;
  }, [contactBlend]);

  useEffect(() => {
    perspectiveKeyRef.current = perspectiveKey;
  }, [perspectiveKey]);

  useEffect(() => {
    capabilityFloatRef.current = capabilityFloat;
  }, [capabilityFloat]);

  useEffect(() => {
    heroProgressRef.current = heroScrollProgress;
  }, [heroScrollProgress]);

  useEffect(() => {
    openingCompleteRef.current = openingComplete;
  }, [openingComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = createOrganicFieldRenderer(canvas);
    if (!renderer) {
      canvas.removeAttribute('data-field-ready');
      canvas.setAttribute('data-field-failed', 'true');
      return undefined;
    }
    canvas.removeAttribute('data-field-failed');

    let drewOnce = false;

    let raf = 0;
    let disposed = false;
    let width = 0;
    let height = 0;
    let animTime = 0;
    let lastTick = performance.now();
    let clockStart = performance.now();
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMq = () => {
      reducedMotion = mq.matches;
    };
    mq.addEventListener('change', onMq);

    const motion = initMotionState(
      inCardRef.current,
      inCardRef.current ? 0 : (openingCapHandoffRef?.current ?? 0),
      heroProgressRef.current ?? 1,
    );

    let chapterMorph = 1;
    let aLead = 1;
    let capPulse = 0;
    let lastAmbientKey = ambientKeyRef.current || 'default';
    let lastOrbScene = orbSceneRef.current || 'landing';
    let prevClimateScene = lastOrbScene;
    let sceneClimateBlend = 1;
    let lastPerspective = perspectiveKeyRef.current;
    let lastCapRaw = capabilityFloatRef.current;
    let lastCapPanel = -1;
    let greenAttention = 0;

    const ambInit = ambientState(ambientKeyRef.current || 'warm');
    let globalOpacity = ambInit.opacityMult;
    let globalScale = ambInit.scaleMult;
    let extraC = ambInit.extraC ?? 1;
    let light = ambInit.light ?? false;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const slot = inCardRef.current ? canvas.parentElement : null;
      const box = slot?.getBoundingClientRect();

      if (inCardRef.current && box && box.width > 1 && box.height > 1) {
        width = box.width;
        height = box.height;
        canvas.style.width = '100%';
        canvas.style.height = '100%';
      } else {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
      }

      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
    };

    const draw = (dt) => {
      if (disposed || width < 1 || height < 1) return;

      try {
        drawFrame(dt);
      } catch (err) {
        if (typeof console !== 'undefined') {
          console.error('[OrganicField] draw failed', err);
        }
      }
    };

    const drawFrame = (dt) => {
      const rawOpen = heroProgressRef.current;
      const capHandoff = openingCapHandoffRef?.current ?? 0;
      const capWorkHandoff = capWorkHandoffRef?.current ?? 0;
      const inCapWorkHandoff = capWorkHandoff > 0.002 && capWorkHandoff < 0.998;
      const inOpening = !openingCompleteRef.current;
      const ambKey = inOpening ? 'warm' : ambientKeyRef.current || 'default';
      const sceneKey = inOpening ? 'landing' : orbSceneRef.current || 'landing';
      const persp = perspectiveKeyRef.current;
      if (ambKey !== lastAmbientKey && !inCapWorkHandoff) {
        lastAmbientKey = ambKey;
        chapterMorph = ambKey === 'signal' ? 1 : Math.min(capHandoff, 0.35);
        aLead = ambKey === 'signal' ? 1 : Math.min(capHandoff, 0.45);
        const ambSnap = ambientState(ambKey);
        globalOpacity = ambSnap.opacityMult;
        globalScale = ambSnap.scaleMult;
      } else if (sceneKey !== lastOrbScene && !inCapWorkHandoff && capHandoff > 0.94) {
        prevClimateScene = lastOrbScene;
        lastOrbScene = sceneKey;
        sceneClimateBlend = 0;
        chapterMorph = Math.min(chapterMorph, 0.78);
        aLead = Math.min(aLead, 0.62);
      } else if (sceneKey !== lastOrbScene && !inCapWorkHandoff) {
        lastOrbScene = sceneKey;
      } else if (persp !== lastPerspective) {
        lastPerspective = persp;
        chapterMorph = Math.min(chapterMorph, 0.42);
      }
      chapterMorph = smoothScalar(chapterMorph, 1, dt, MOTION_SMOOTH.chapterMorph);
      aLead = smoothScalar(aLead, 1, dt, MOTION_SMOOTH.aLead);
      sceneClimateBlend = smoothScalar(
        sceneClimateBlend,
        1,
        dt,
        MOTION_SMOOTH.fieldClimate,
      );

      const capRaw = capabilityFloatRef.current;
      lastCapRaw = capRaw;
      const frozenCap = frozenCapFloatRef?.current;
      const effectiveCapRaw =
        capRaw != null ? capRaw : inCapWorkHandoff && frozenCap != null ? frozenCap : null;
      const capActiveForMotion =
        effectiveCapRaw != null && (ambKey === 'signal' || inCapWorkHandoff);
      if (capActiveForMotion && effectiveCapRaw != null) {
        const panelKey = Math.round(effectiveCapRaw);
        if (panelKey !== lastCapPanel) {
          greenAttention = 1;
          lastCapPanel = panelKey;
        }
      }
      greenAttention = smoothScalar(greenAttention, 0, dt, 1.28);
      capPulse = smoothScalar(
        capPulse,
        0,
        dt,
        capActiveForMotion ? 11 : MOTION_SMOOTH.capPulse,
      );

      const capForMotion =
        capActiveForMotion && effectiveCapRaw != null
          ? effectiveCapRaw
          : easeCapabilityFloat(effectiveCapRaw);
      const capActivation =
        capActiveForMotion && effectiveCapRaw != null
          ? signalGreenActivationEnvelope(effectiveCapRaw, animTime, greenAttention)
          : null;
      const amb = ambientState(ambKey);
      const openingPresence = inOpening
        ? mergeOpeningBootOrchestration(
            computeOpeningFieldPresence(rawOpen, reducedMotion),
            openingBootRef?.current,
            rawOpen,
          )
        : null;
      const heroProgress = openingPresence?.heroProgress ?? null;
      const fieldEnvelope = openingPresence?.fieldEnvelope ?? 1;
      const openingFieldScale = openingPresence?.fieldScale ?? 1;

      let targets = computeMotionTargets(
        animTime,
        perspectiveKeyRef.current,
        reducedMotion,
        ambKey,
        capForMotion,
        depthFloatRef?.current ?? null,
        {
          chapterMorph,
          capPulse,
          aLead,
          orbScene: sceneKey,
          heroProgress,
          openingOrch: openingPresence,
          handoffBlend: handoffBlendRef?.current ?? 0,
          openingCapBlend: capHandoff,
          contactBlend: contactBlendRef.current ?? 0,
          workCaseFocus: workCaseFocusRef.current,
          navFieldHint: navFieldHintRef.current,
          greenAttention,
        },
      );

      if (inCapWorkHandoff && !inOpening) {
        const settleOpts = {
          chapterMorph: 1,
          capPulse: 0,
          greenAttention: 0,
          aLead: 1,
          heroProgress,
          openingOrch: openingPresence,
          handoffBlend: handoffBlendRef?.current ?? 0,
          openingCapBlend: capHandoff,
          contactBlend: contactBlendRef.current ?? 0,
          workCaseFocus: workCaseFocusRef.current,
          navFieldHint: navFieldHintRef.current,
        };
        const capFloat = frozenCap ?? effectiveCapRaw ?? 4;
        const signalTargets = computeMotionTargets(
          animTime,
          perspectiveKeyRef.current,
          reducedMotion,
          'signal',
          capFloat,
          depthFloatRef?.current ?? null,
          { ...settleOpts, orbScene: 'capabilities' },
        );
        const workTargets = computeMotionTargets(
          animTime,
          perspectiveKeyRef.current,
          reducedMotion,
          'work',
          null,
          depthFloatRef?.current ?? null,
          { ...settleOpts, orbScene: 'work' },
        );
        targets = blendCapWorkFieldTargets(signalTargets, workTargets, capWorkHandoff);
      } else if (
        !inOpening &&
        sceneClimateBlend < 0.995 &&
        !inCapWorkHandoff &&
        prevClimateScene &&
        prevClimateScene !== sceneKey
      ) {
        const prevTargets = computeMotionTargets(
          animTime,
          perspectiveKeyRef.current,
          reducedMotion,
          ambKey,
          capForMotion,
          depthFloatRef?.current ?? null,
          {
            chapterMorph: 1,
            capPulse,
            greenAttention,
            aLead: 1,
            orbScene: prevClimateScene,
            heroProgress,
            openingOrch: openingPresence,
            handoffBlend: handoffBlendRef?.current ?? 0,
            openingCapBlend: capHandoff,
            contactBlend: contactBlendRef.current ?? 0,
            workCaseFocus: workCaseFocusRef.current,
            navFieldHint: navFieldHintRef.current,
          },
        );
        const climateT = easeSmoothstep(sceneClimateBlend);
        targets = blendChapterClimateTargets(
          prevTargets,
          targets,
          climateT,
          prevClimateScene,
          sceneKey,
        );
      }

      if (typeof document !== 'undefined') {
        const climateReady =
          inOpening || (sceneClimateBlend > 0.9 && chapterMorph > 0.86);
        const nextClimate = climateReady ? 'ready' : 'settling';
        if (document.documentElement.dataset.fieldClimate !== nextClimate) {
          document.documentElement.dataset.fieldClimate = nextClimate;
          window.dispatchEvent(new Event('fieldclimatechange'));
        }
      }

      const isWarmLand = ambKey === 'warm' || ambKey === 'default' || !ambKey;
      const heroDrive =
        inOpening && openingPresence && isWarmLand
          ? openingPresence.scrollDrive
          : heroProgress != null && isWarmLand
            ? heroScrollDrive(heroProgress)
            : 0;
      const capActive = effectiveCapRaw;
      const chapterScrollDrive =
        sceneKey === 'capabilities'
          ? 0
          : capActive != null && inCapWorkHandoff
            ? Math.min(0.28, capActive * 0.22)
            : 0;
      const openingGather = inOpening && openingPresence ? openingPresence.gather ?? 0 : 0;
      const openingHandoff =
        inOpening && openingPresence ? openingPresence.handoffLock ?? 0 : 0;
      const capHold = capActivation?.hold ?? 0;
      const scrollEventActive =
        openingGather > 0.03 ||
        openingHandoff > 0.2 ||
        (capActiveForMotion && capHold > 0.5);
      const gatherDamp = inOpening && openingPresence ? 1 - openingGather * 0.99 : 1;
      const bootMotionDamp =
        inOpening && openingPresence?.boot?.active
          ? 1 - (openingPresence.boot.structure ?? 0) * 0.92
          : 1;
      const idleMotion =
        inOpening && openingPresence && isWarmLand
          ? openingPresence.idleStillness * gatherDamp * (1 - chapterScrollDrive * 0.88) * bootMotionDamp
          : (1 - heroDrive) * (1 - chapterScrollDrive * 0.88);
      const decorativeDrift = scrollEventActive ? 0 : idleMotion * (capActivation?.driftDamp ?? 1);

      if (isWarmLand && decorativeDrift > 0.001) {
        const arcBase =
          WARM_MOTION.arcMult *
          (sceneKey === 'landing' ? WARM_MOTION.landingArcMult : 1) *
          decorativeDrift;
        const phaseA = animTime * 0.44 + 0.83;
        const phaseB = animTime * 0.64 + 1.37 + (motion.b.flow ?? 0) * 0.05;
        const phaseC = animTime * 0.96 + 2.14;
        const arcA = ARC_AMP.a * arcBase * orbSceneArcScale(sceneKey, 'a') * (WARM_MOTION.arcMultA || 1);
        const arcB = ARC_AMP.b * arcBase * orbSceneArcScale(sceneKey, 'b') * (WARM_MOTION.arcMultB || 1);
        const arcC = ARC_AMP.c * arcBase * orbSceneArcScale(sceneKey, 'c') * (WARM_MOTION.arcMultC || 1);
        targets = {
          ...targets,
          a:
            arcA > 0.002
              ? applyWarmArcDrift(motion.a, targets.a, arcA, phaseA, animTime)
              : targets.a,
          b:
            arcB > 0.002
              ? applyWarmArcDrift(motion.b, targets.b, arcB, phaseB, animTime)
              : targets.b,
          c:
            arcC > 0.002
              ? applyWarmArcDrift(motion.c, targets.c, arcC, phaseC, animTime)
              : targets.c,
        };

        if (decorativeDrift > 0.012) {
          const warmPhase = animTime * WARM_MOTION.timeScale;
          const driftA = applyWarmFieldDrift('a', targets.a, warmPhase, animTime);
          const driftB = applyWarmFieldDrift('b', targets.b, warmPhase, animTime);
          const driftC = applyWarmFieldDrift('c', targets.c, warmPhase, animTime);
          const driftBlend = Math.min(1, decorativeDrift * 1.12);
          const blendDrift = (base, drifted) => ({
            ...base,
            centerX: lerp(base.centerX, drifted.centerX, driftBlend),
            centerY: lerp(base.centerY, drifted.centerY, driftBlend),
            rotation: lerp(base.rotation ?? 0, drifted.rotation ?? 0, driftBlend),
          });
          targets = {
            ...targets,
            a: blendDrift(targets.a, driftA),
            b: blendDrift(targets.b, driftB),
            c: blendDrift(targets.c, driftC),
          };
        }
      }

      if (inOpening && openingFieldScale < 0.999) {
        const scaleField = (field) => ({
          ...field,
          scale: field.scale * openingFieldScale,
        });
        targets = {
          ...targets,
          a: scaleField(targets.a),
          b: scaleField(targets.b),
          c: scaleField(targets.c),
        };
      }

      if (!reducedMotion) {
        targets = applyGreenBreathingLayer(targets, animTime, {
          ambientKey: ambKey,
          orbScene: sceneKey,
          inOpening,
          reducedMotion,
          scrollDrive: chapterScrollDrive,
          capHold: capActivation?.hold ?? 0,
          openingGather,
        });
      }

      const idleSpring = decorativeDrift * decorativeDrift;
      const capHandoffCalm = capHandoff < 0.995 && !inOpening;
      const handoffSnapBoost = capHandoffCalm
        ? capHandoff < 0.55
          ? lerp(2.6, 3.8, capHandoff / 0.55)
          : lerp(3.8, 3.2, (capHandoff - 0.55) / 0.45)
        : 1;
      const capSnapMotion = capActive != null && (ambKey === 'signal' || inCapWorkHandoff);
      const capMotionSnap = capActivation?.motionSnap ?? 1;
      const openingImpact = inOpening && openingPresence ? openingPresence.scrollImpact ?? 1 : 1;
      // Reduce visual lag during opening gather so process reads as immediate.
      const openingSettle = inOpening && openingPresence ? openingPresence.settle ?? 0 : 0;
      const openingThesisNucleus =
        inOpening && openingPresence ? openingPresence.thesisNucleus ?? 0 : 0;
      const gatherSnap = openingGather * (1 - openingSettle * 0.92);
      const openingSnapBoost =
        capHandoffCalm || !inOpening
          ? 1
          : lerp(1, 2.1, gatherSnap) * (1 + Math.max(0, openingImpact - 1) * 0.12);
      const thesisMotionSnap =
        capHandoffCalm || !inOpening ? 1 : 1 + openingThesisNucleus * 0.42;
      const handoffMotionDamp = inCapWorkHandoff
        ? Math.max(0.42, 1 - capWorkHandoff * 0.38)
        : capHandoffCalm
          ? 0.52 + capHandoff * 0.48
          : 1;
      const climateLag = sceneClimateBlend < 0.98 ? 0.52 : 1;
      const smoothA = capSnapMotion
        ? 9.4 * capMotionSnap * handoffMotionDamp
        : lerp(lerp(MOTION_SMOOTH.a, 1.72, idleSpring), 4.8, heroDrive) *
          handoffSnapBoost *
          openingSnapBoost *
          thesisMotionSnap *
          climateLag *
          handoffMotionDamp;
      const smoothB =
        lerp(lerp(MOTION_SMOOTH.b, 2.05, idleSpring), 3.8, heroDrive) *
          handoffSnapBoost *
          openingSnapBoost *
          thesisMotionSnap *
          climateLag *
          handoffMotionDamp;
      const smoothC =
        lerp(lerp(MOTION_SMOOTH.c, 2.48, idleSpring), 4.2, heroDrive) *
          handoffSnapBoost *
          openingSnapBoost *
          thesisMotionSnap *
          climateLag *
          handoffMotionDamp;

      motion.a = smoothField(
        motion.a,
        {
          ...targets.a,
          stretchX: targets.a.stretchX ?? 1,
          stretchY: targets.a.stretchY ?? 1,
          rotation: targets.a.rotation ?? 0,
        },
        dt,
        smoothA,
      );
      motion.b = smoothField(
        motion.b,
        {
          ...targets.b,
          stretchX: targets.b.stretchX ?? 1,
          stretchY: targets.b.stretchY ?? 1,
          rotation: targets.b.rotation ?? 0,
          flow: targets.flowB,
        },
        dt,
        smoothB,
      );
      motion.c = smoothField(
        motion.c,
        {
          ...targets.c,
          stretchX: targets.c.stretchX ?? 1,
          stretchY: targets.c.stretchY ?? 1,
          rotation: targets.c.rotation ?? 0,
        },
        dt,
        smoothC,
      );
      motion.flowB = smoothScalar(motion.flowB, targets.flowB, dt, MOTION_SMOOTH.flow);

      const kAmb = 1 - Math.exp(-MOTION_SMOOTH.ambient * dt);
      const openingScale = inOpening ? openingFieldScale : 1;
      const warmAmb = ambientState('warm');
      const bootGain = inOpening ? (openingPresence?.fieldGain ?? 1) : 1;
      const bootLight = inOpening && (openingPresence?.boot?.light ?? false);
      let targetOpacity = amb.opacityMult * fieldEnvelope * bootGain;
      let targetScale = amb.scaleMult * openingScale;
      let targetLight = bootLight || (amb.light ?? false);
      if (!inOpening && ambKey === 'signal' && capHandoff < 0.999) {
        const u = capHandoff * capHandoff * (3 - 2 * capHandoff);
        targetOpacity = lerp(warmAmb.opacityMult, amb.opacityMult, u) * fieldEnvelope;
        targetScale = lerp(warmAmb.scaleMult, amb.scaleMult, u) * openingScale;
        targetLight = capHandoff < 0.38;
      }
      globalOpacity = lerp(globalOpacity, targetOpacity, kAmb);
      globalScale = lerp(globalScale, targetScale, kAmb);
      extraC = lerp(extraC, amb.extraC ?? 1, kAmb);
      light = targetLight;
      const organicBoost =
        amb.organic ??
        (ambKey === 'signal' || sceneKey === 'capabilities'
          ? 0.92
          : ambKey === 'work' || sceneKey === 'work' || sceneKey === 'case'
            ? 0.78
            : 0.65);

      renderer.draw({
        width: canvas.width,
        height: canvas.height,
        time: animTime,
        light,
        globalOpacity: finite(globalOpacity, 0.94),
        globalScale: finite(globalScale, 1),
        extraC: finite(extraC, 1),
        flowB: finite(motion.flowB, 0),
        opacity: {
          a: finite(motion.a.opacity, 0.8),
          b: finite(motion.b.opacity, 0.8),
          c: finite(motion.c.opacity, 0.5),
        },
        scale: {
          a: finite(motion.a.scale, 1),
          b: finite(motion.b.scale, 1),
          c: finite(motion.c.scale, 1),
        },
        centerA: { x: finite(motion.a.centerX, 0.43), y: finite(motion.a.centerY, 0.48) },
        centerB: { x: finite(motion.b.centerX, 0.5), y: finite(motion.b.centerY, 0.5) },
        centerC: { x: finite(motion.c.centerX, 0.56), y: finite(motion.c.centerY, 0.52) },
        radiiA: (() => {
          const r = fieldRadii('a', motion.a.stretchX, motion.a.stretchY, ambKey);
          const h = finite(motion.a.hazeRadiiMult, 1);
          return { x: r.x * h, y: r.y * h };
        })(),
        radiiB: fieldRadii('b', motion.b.stretchX, motion.b.stretchY, ambKey),
        radiiC: fieldRadii('c', motion.c.stretchX, motion.c.stretchY, ambKey),
        rotation: {
          a: finite(motion.a.rotation, 0),
          b: finite(motion.b.rotation, 0),
          c: finite(motion.c.rotation, 0),
        },
        organic: organicBoost,
      });
      if (!drewOnce) {
        drewOnce = true;
        canvas.setAttribute('data-field-ready', 'true');
        if (!inCardRef.current && typeof document !== 'undefined') {
          document.querySelector('.home-scroll-root')?.setAttribute('data-viewport-field-ready', 'true');
        }
      }
    };

    const tick = (now) => {
      if (disposed) return;
      const dt = Math.min(0.05, (now - lastTick) / 1000);
      lastTick = now;
      if (!reducedMotion) animTime = (now - clockStart) / 1000;
      if (!document.hidden) draw(dt);
      raf = requestAnimationFrame(tick);
    };

    const ro = new ResizeObserver(resize);
    resize();
    const observeTarget = inCardRef.current ? canvas.parentElement : document.documentElement;
    if (observeTarget) ro.observe(observeTarget);
    window.addEventListener('resize', resize);
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('resize', resize);
      mq.removeEventListener('change', onMq);
      renderer.dispose();
      if (!inCardRef.current && typeof document !== 'undefined') {
        document.querySelector('.home-scroll-root')?.removeAttribute('data-viewport-field-ready');
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="organic-field__canvas" />;
}

/** Landing — inline in opening card field-slot (stable, no portal). */
export function LandingOrganicField() {
  const { progress, openingComplete, openingCapHandoff } = useFieldNarrative();

  if (!shouldUseInCardOrganicField(progress, openingComplete, openingCapHandoff)) return null;

  return (
    <div className="organic-field organic-field--in-card">
      <div className="opening-field-fallback" aria-hidden="true">
        <span className="opening-field-fallback__blob opening-field-fallback__blob--green" />
        <span className="opening-field-fallback__blob opening-field-fallback__blob--blue" />
        <span className="opening-field-fallback__blob opening-field-fallback__blob--amber" />
      </div>
      <OrganicFieldCanvas inCard />
    </div>
  );
}

/** Later chapters — viewport layer behind scroll content. */
export function ViewportOrganicField() {
  const { progress, openingComplete, openingCapHandoff } = useFieldNarrative();
  const { rootHostRef, rootHostReady } = useOrganicFieldHost();

  const host = rootHostRef.current;
  if (!rootHostReady || !host) return null;

  if (!shouldUseViewportOrganicField(progress, openingComplete, openingCapHandoff)) return null;

  return createPortal(
    <div className="organic-field organic-field--viewport">
      <OrganicFieldCanvas inCard={false} />
    </div>,
    host,
  );
}
