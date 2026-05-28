import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrganicFieldHost } from '../../context/OrganicFieldHostContext.jsx';
import { usePerspective } from '../../context/PerspectiveContext.jsx';
import { createOrganicFieldRenderer } from './organicFieldGl.js';
import {
  applyArcDrift,
  applyWarmFieldDrift,
  ARC_AMP,
  WARM_MOTION,
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
    warm: { opacityMult: 0.72, scaleMult: 1.04, light: true, extraC: 1.14 },
    signal: { opacityMult: 0.58, scaleMult: 1.08, light: false, extraC: 0.92 },
    work: { opacityMult: 0.5, scaleMult: 1.06, light: false, extraC: 0.9 },
    depth: { opacityMult: 0.54, scaleMult: 1.14, light: false, extraC: 0.94 },
    archive: { opacityMult: 0.78, scaleMult: 1.0, light: false, extraC: 1.18 },
    contact: { opacityMult: 0.56, scaleMult: 1.08, light: true, extraC: 1.12 },
    default: { opacityMult: 0.7, scaleMult: 1.0, light: false, extraC: 1.05 },
  },
};

const { fields, ambient } = ORGANIC_FIELD_CONFIG;

const LANDING_HANDOFF = 0.88;

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
    const r = 1.22 * avgStretch;
    return { x: rx0 * r, y: ry0 * r };
  }
  return { x: rx0 * stretchX, y: ry0 * stretchY };
}

function initMotionState() {
  const t0 = computeMotionTargets(0, null, false, 'warm');
  return {
    a: {
      ...t0.a,
      stretchX: t0.a.stretchX ?? 1,
      stretchY: t0.a.stretchY ?? 1,
      rotation: t0.a.rotation ?? 0,
      flow: 0,
    },
    b: {
      ...t0.b,
      stretchX: t0.b.stretchX ?? 1,
      stretchY: t0.b.stretchY ?? 1,
      rotation: t0.b.rotation ?? 0,
      flow: t0.flowB,
    },
    c: {
      ...t0.c,
      stretchX: t0.c.stretchX ?? 1,
      stretchY: t0.c.stretchY ?? 1,
      rotation: t0.c.rotation ?? 0,
      flow: 0,
    },
    flowB: t0.flowB,
  };
}

function OrganicFieldCanvas({ inCard = false }) {
  const { ambientKey } = useNarrativeScroll();
  const { capabilityFloat, depthFloatRef } = useFieldNarrative();
  const { perspectiveKey } = usePerspective();
  const canvasRef = useRef(null);
  const inCardRef = useRef(inCard);
  const ambientKeyRef = useRef(ambientKey);
  const capabilityFloatRef = useRef(capabilityFloat);
  const perspectiveKeyRef = useRef(perspectiveKey);

  useEffect(() => {
    inCardRef.current = inCard;
  }, [inCard]);

  useEffect(() => {
    ambientKeyRef.current = ambientKey;
  }, [ambientKey]);

  useEffect(() => {
    perspectiveKeyRef.current = perspectiveKey;
  }, [perspectiveKey]);

  useEffect(() => {
    capabilityFloatRef.current = capabilityFloat;
  }, [capabilityFloat]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = createOrganicFieldRenderer(canvas);
    if (!renderer) return undefined;

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

    const motion = initMotionState();

    let chapterMorph = 1;
    let aLead = 1;
    let capPulse = 0;
    let lastAmbientKey = ambientKeyRef.current || 'default';
    let lastPerspective = perspectiveKeyRef.current;
    let lastCapRaw = capabilityFloatRef.current;

    let globalOpacity = ambient.warm.opacityMult;
    let globalScale = 1;
    let extraC = 1;
    let light = true;

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

      const ambKey = ambientKeyRef.current || 'default';
      const persp = perspectiveKeyRef.current;
      if (ambKey !== lastAmbientKey) {
        lastAmbientKey = ambKey;
        chapterMorph = 0;
        aLead = 0;
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
      let targets = computeMotionTargets(
        animTime,
        perspectiveKeyRef.current,
        reducedMotion,
        ambKey,
        easedCap,
        depthFloatRef?.current ?? null,
        { chapterMorph, capPulse, aLead },
      );

      const isWarmLand = ambKey === 'warm' || ambKey === 'default' || !ambKey;
      const arcBase = isWarmLand ? WARM_MOTION.arcMult : 1;
      const phaseA = animTime * 0.5;
      const phaseB = animTime * 1.18 + (motion.b.flow ?? 0) * 0.1;
      const phaseC = animTime * 0.62;

      if (isWarmLand) {
        targets = {
          ...targets,
          a: applyWarmFieldDrift('a', targets.a, phaseA, animTime),
          b: applyWarmFieldDrift('b', targets.b, phaseB, animTime),
          c: applyWarmFieldDrift('c', targets.c, phaseC, animTime),
        };
      } else {
        targets = {
          ...targets,
          a: applyArcDrift(motion.a, targets.a, ARC_AMP.a * arcBase, phaseA),
          b: applyArcDrift(motion.b, targets.b, ARC_AMP.b * arcBase, phaseB),
          c: applyArcDrift(motion.c, targets.c, ARC_AMP.c * arcBase, phaseC),
        };
      }

      motion.a = smoothField(
        motion.a,
        {
          ...targets.a,
          stretchX: targets.a.stretchX ?? 1,
          stretchY: targets.a.stretchY ?? 1,
          rotation: targets.a.rotation ?? 0,
        },
        dt,
        MOTION_SMOOTH.a,
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
        MOTION_SMOOTH.b,
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
        MOTION_SMOOTH.c,
      );
      motion.flowB = smoothScalar(motion.flowB, targets.flowB, dt, MOTION_SMOOTH.flow);

      const kAmb = 1 - Math.exp(-MOTION_SMOOTH.ambient * dt);
      globalOpacity = lerp(globalOpacity, amb.opacityMult, kAmb);
      globalScale = lerp(globalScale, amb.scaleMult, kAmb);
      extraC = lerp(extraC, amb.extraC ?? 1, kAmb);
      light = amb.light ?? false;

      renderer.draw({
        width: canvas.width,
        height: canvas.height,
        light,
        globalOpacity: finite(globalOpacity, 0.7),
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
      });
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
  const { progress } = useFieldNarrative();
  if (progress >= LANDING_HANDOFF) return null;

  return (
    <div className="organic-field organic-field--in-card">
      <OrganicFieldCanvas inCard />
    </div>
  );
}

/** Later chapters — viewport layer behind scroll content. */
export function ViewportOrganicField() {
  const { progress } = useFieldNarrative();
  const { rootHostRef, rootHostReady } = useOrganicFieldHost();

  if (progress < LANDING_HANDOFF) return null;

  const host = rootHostRef.current;
  if (!rootHostReady || !host) return null;

  return createPortal(
    <div className="organic-field organic-field--viewport">
      <OrganicFieldCanvas inCard={false} />
    </div>,
    host,
  );
}
