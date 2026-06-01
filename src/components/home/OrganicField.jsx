import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { useOrganicFieldHost } from '../../context/OrganicFieldHostContext.jsx';
import { usePerspective } from '../../context/PerspectiveContext.jsx';
import { easeScrollBreath } from '../../utils/fieldNarrative.js';
import { createOrganicFieldRenderer } from './organicFieldGl.js';
import {
  computeHeroFieldTargets,
  computeOpeningFieldPresence,
  heroScrollDrive,
  shouldUseInCardOrganicField,
  shouldUseViewportOrganicField,
} from '../../utils/heroFieldMotion.js';
import {
  applyWarmArcDrift,
  applyWarmFieldDrift,
  ARC_AMP,
  WARM_MOTION,
  orbSceneArcScale,
  computeMotionTargets,
  easeCapabilityFloat,
  MOTION_SMOOTH,
  smoothField,
  smoothScalar,
} from './organicFieldMotion.js';
import '../../styles/organic-field.css';

export const ORGANIC_FIELD_CONFIG = {
  fields: {
    a: { radii: [0.11, 0.15] },
    b: { radii: [0.09, 0.125] },
    c: { radii: [0.058, 0.074] },
  },
  ambient: {
    warm: { opacityMult: 1, scaleMult: 1.03, light: true, extraC: 1.04 },
    signal: { opacityMult: 0.94, scaleMult: 1.22, light: false, extraC: 1.06, organic: 0.85 },
    work: { opacityMult: 0.5, scaleMult: 1.06, light: false, extraC: 0.9 },
    depth: { opacityMult: 0.68, scaleMult: 1.14, light: false, extraC: 0.96 },
    archive: { opacityMult: 0.78, scaleMult: 1.0, light: false, extraC: 1.08 },
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
  if (isSignal) {
    const avgStretch = (stretchX + stretchY) * 0.5;
    if (id === 'a') {
      const r = 1.34 * avgStretch;
      return { x: rx0 * r, y: ry0 * r };
    }
    if (id === 'b') {
      const r = 1.06 * avgStretch;
      return { x: rx0 * r, y: ry0 * r };
    }
    if (id === 'c') {
      const r = 0.88 * avgStretch;
      return { x: rx0 * r, y: ry0 * r };
    }
  }
  if (!isWarmLand) {
    return { x: rx0 * stretchX, y: ry0 * stretchY };
  }
  const avgStretch = (stretchX + stretchY) * 0.5;
  if (id === 'a') {
    const r = 1.24 * avgStretch;
    return { x: rx0 * r, y: ry0 * r };
  }
  if (id === 'b') {
    const r = 1.18 * avgStretch;
    return { x: rx0 * r, y: ry0 * r };
  }
  if (id === 'c') {
    const r = 1.34 * avgStretch;
    return { x: rx0 * r, y: ry0 * r };
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

function initMotionState(inCard = false) {
  const t0 = inCard
    ? computeMotionTargets(0, null, false, 'warm', null, null, {
        orbScene: 'landing',
        heroProgress: 0,
      })
    : computeHeroFieldTargets(1, 0, false);
  return motionFromTargets(t0);
}

function OrganicFieldCanvas({ inCard = false }) {
  const { ambientKey } = useNarrativeScroll();
  const { orbScene } = useOrbScene();
  const {
    capabilityFloat,
    depthFloatRef,
    handoffBlendRef,
    progress: heroScrollProgress,
    openingComplete,
    openingCapHandoffRef,
  } = useFieldNarrative();
  const { perspectiveKey } = usePerspective();
  const canvasRef = useRef(null);
  const inCardRef = useRef(inCard);
  const ambientKeyRef = useRef(ambientKey);
  const orbSceneRef = useRef(orbScene);
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

    const motion = initMotionState(inCardRef.current);

    let chapterMorph = 1;
    let aLead = 1;
    let capPulse = 0;
    let lastAmbientKey = ambientKeyRef.current || 'default';
    let lastOrbScene = orbSceneRef.current || 'landing';
    let lastPerspective = perspectiveKeyRef.current;
    let lastCapRaw = capabilityFloatRef.current;

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

      const rawOpen = heroProgressRef.current;
      const capHandoff = openingCapHandoffRef?.current ?? 1;
      const inOpening = !openingCompleteRef.current;
      const ambKey = inOpening ? 'warm' : ambientKeyRef.current || 'default';
      const sceneKey = inOpening ? 'landing' : orbSceneRef.current || 'landing';
      const persp = perspectiveKeyRef.current;
      if (ambKey !== lastAmbientKey) {
        lastAmbientKey = ambKey;
        chapterMorph = Math.min(capHandoff, 0.35);
        aLead = Math.min(capHandoff, 0.45);
        const ambSnap = ambientState(ambKey);
        globalOpacity = ambSnap.opacityMult;
        globalScale = ambSnap.scaleMult;
      } else if (sceneKey !== lastOrbScene) {
        lastOrbScene = sceneKey;
        chapterMorph = 0;
        aLead = Math.min(aLead, 0.55);
      } else if (persp !== lastPerspective) {
        lastPerspective = persp;
        chapterMorph = Math.min(chapterMorph, 0.42);
      }
      chapterMorph = smoothScalar(chapterMorph, 1, dt, MOTION_SMOOTH.chapterMorph);
      aLead = smoothScalar(aLead, 1, dt, MOTION_SMOOTH.aLead);

      const capRaw = capabilityFloatRef.current;
      if (
        capRaw != null &&
        lastCapRaw != null &&
        Math.abs(capRaw - lastCapRaw) > 0.04
      ) {
        capPulse = 1;
      }
      lastCapRaw = capRaw;
      capPulse = smoothScalar(capPulse, 0, dt, MOTION_SMOOTH.capPulse);

      const easedCap = easeCapabilityFloat(capRaw);
      const amb = ambientState(ambKey);
      const openingPresence = inOpening
        ? computeOpeningFieldPresence(rawOpen, reducedMotion)
        : null;
      const heroProgress = openingPresence?.heroProgress ?? null;
      const fieldEnvelope = openingPresence?.fieldEnvelope ?? 1;
      const openingFieldScale = openingPresence?.fieldScale ?? 1;

      let targets = computeMotionTargets(
        animTime,
        perspectiveKeyRef.current,
        reducedMotion,
        ambKey,
        easedCap,
        depthFloatRef?.current ?? null,
        {
          chapterMorph,
          capPulse,
          aLead,
          orbScene: sceneKey,
          heroProgress,
          handoffBlend: handoffBlendRef?.current ?? 0,
          openingCapBlend: capHandoff,
        },
      );

      const isWarmLand = ambKey === 'warm' || ambKey === 'default' || !ambKey;
      const heroDrive =
        heroProgress != null && isWarmLand ? heroScrollDrive(heroProgress) : 0;
      const capActive = capabilityFloatRef.current;
      const chapterScrollDrive =
        capActive != null && sceneKey === 'capabilities' ? Math.min(1, capActive * 1.15) : 0;
      const idleMotion = (1 - heroDrive) * (1 - chapterScrollDrive * 0.88);

      if (isWarmLand && idleMotion > 0.001) {
        const arcBase =
          WARM_MOTION.arcMult *
          (sceneKey === 'landing' ? WARM_MOTION.landingArcMult : 1) *
          idleMotion;
        const phaseA = animTime * 0.5;
        const phaseB = animTime * 1.18 + (motion.b.flow ?? 0) * 0.1;
        const phaseC = animTime * 0.62;
        const arcA = ARC_AMP.a * arcBase * orbSceneArcScale(sceneKey, 'a');
        const arcB = ARC_AMP.b * arcBase * orbSceneArcScale(sceneKey, 'b');
        const arcC = ARC_AMP.c * arcBase * orbSceneArcScale(sceneKey, 'c');
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

        if (idleMotion > 0.02) {
          const warmPhase = animTime * WARM_MOTION.timeScale;
          const driftA = applyWarmFieldDrift('a', targets.a, warmPhase, animTime);
          const driftB = applyWarmFieldDrift('b', targets.b, warmPhase, animTime);
          const driftC = applyWarmFieldDrift('c', targets.c, warmPhase, animTime);
          const blendDrift = (base, drifted) => ({
            ...base,
            centerX: lerp(base.centerX, drifted.centerX, idleMotion),
            centerY: lerp(base.centerY, drifted.centerY, idleMotion),
            rotation: lerp(base.rotation ?? 0, drifted.rotation ?? 0, idleMotion),
            scale: lerp(base.scale, drifted.scale ?? base.scale, idleMotion),
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

      const idleSpring = idleMotion * idleMotion;
      const handoffDamp = capHandoff < 0.999 ? 0.46 : 1;
      const smoothA = lerp(lerp(MOTION_SMOOTH.a, 1.72, idleSpring), 4.8, heroDrive) * handoffDamp;
      const smoothB = lerp(lerp(MOTION_SMOOTH.b, 2.05, idleSpring), 3.8, heroDrive) * handoffDamp;
      const smoothC = lerp(lerp(MOTION_SMOOTH.c, 2.48, idleSpring), 4.2, heroDrive) * handoffDamp;

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
      let targetOpacity = amb.opacityMult * fieldEnvelope;
      let targetScale = amb.scaleMult * openingScale;
      let targetLight = amb.light ?? false;
      if (!inOpening && ambKey === 'signal' && capHandoff < 0.999) {
        const u = easeScrollBreath(capHandoff);
        targetOpacity = lerp(warmAmb.opacityMult, amb.opacityMult, u) * fieldEnvelope;
        targetScale = lerp(warmAmb.scaleMult, amb.scaleMult, u) * openingScale;
        targetLight = capHandoff < 0.38;
      }
      globalOpacity = lerp(globalOpacity, targetOpacity, kAmb);
      globalScale = lerp(globalScale, targetScale, kAmb);
      extraC = lerp(extraC, amb.extraC ?? 1, kAmb);
      light = targetLight;
      const organicBoost =
        amb.organic ?? (ambKey === 'signal' || sceneKey === 'capabilities' ? 1 : 0);

      renderer.draw({
        width: canvas.width,
        height: canvas.height,
        time: animTime,
        light,
        globalOpacity: finite(globalOpacity, 0.85),
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
        radiiA: fieldRadii('a', motion.a.stretchX, motion.a.stretchY, ambKey),
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
