import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  OPENING_HERO_COLORS,
  OPENING_HERO_FRAGMENT,
  OPENING_HERO_VERTEX,
} from '../../shaders/openingHeroGradientShaders.js';
import { mapOpeningHeroShaderState } from '../../utils/openingHeroProgress.js';

const DEG = Math.PI / 180;

/** Debug overlay only. Card/plate always visible through shader alpha=0 areas. */
const SHADER_ISOLATE = false;

const DEBUG_STYLE_ID = 'opening-hero-shader-debug-style';

const DEBUG_CSS = `
.opening-card--hero-shader.opening-card--plate,
.opening-card--hero-shader.opening-card--plate[style] {
  background: linear-gradient(
    178deg,
    rgb(245, 245, 238) 0%,
    rgb(242, 241, 234) 50%,
    rgb(238, 236, 228) 100%
  ) !important;
}
.opening-card--hero-shader .opening-card__plate-ground {
  opacity: 1 !important;
  background: linear-gradient(
    178deg,
    rgb(245, 245, 238) 0%,
    rgb(242, 241, 234) 50%,
    rgb(238, 236, 228) 100%
  ) !important;
}
.opening-hero-shader__debug {
  position: absolute;
  left: 10px;
  bottom: 10px;
  z-index: 12;
  padding: 8px 10px;
  font: 11px/1.45 ui-monospace, SFMono-Regular, Menlo, monospace;
  color: rgba(20, 18, 14, 0.92);
  background: rgba(252, 248, 238, 0.88);
  border-radius: 6px;
  white-space: pre;
  pointer-events: none;
  letter-spacing: 0.02em;
  box-shadow: 0 2px 12px rgba(0,0,0,0.12);
}
.opening-hero-shader__fallback {
  display: none !important;
}
`;

/** Dolly on +Z — plane scale ~1; object alpha mask defines visible area. */
function placeCamera(camera, distance, polarDeg, azimuthDeg, lookAtY = 0) {
  const tilt = (polarDeg - 90) * DEG;
  const orbit = azimuthDeg * DEG;
  const x = Math.sin(orbit) * Math.sin(tilt) * distance * 0.16;
  const y = Math.cos(tilt) * distance * 0.09;
  const z = distance;
  camera.position.set(x, y, z);
  camera.lookAt(0, lookAtY, 0);
}

/**
 * Alpha-masked compound gradient object on transparent WebGL layer.
 * @param {{ progressRef: React.MutableRefObject<number>, reduceMotion?: boolean }} props
 */
export function OpeningHeroShader({ progressRef, reduceMotion = false }) {
  const hostRef = useRef(null);
  const debugRef = useRef(null);
  const rafRef = useRef(0);
  const clockRef = useRef(0);
  const sceneRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    if (!document.getElementById(DEBUG_STYLE_ID)) {
      const styleEl = document.createElement('style');
      styleEl.id = DEBUG_STYLE_ID;
      styleEl.textContent = DEBUG_CSS;
      document.head.appendChild(styleEl);
    }

    const debugEl = document.createElement('div');
    debugEl.className = 'opening-hero-shader__debug';
    debugEl.setAttribute('aria-hidden', 'true');
    host.appendChild(debugEl);
    debugRef.current = debugEl;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 80);
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    if ('outputColorSpace' in renderer) {
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    const fallbackEl = document.createElement('div');
    fallbackEl.className = 'opening-hero-shader__fallback';
    fallbackEl.setAttribute('aria-hidden', 'true');
    host.appendChild(fallbackEl);

    const canvasEl = renderer.domElement;
    canvasEl.className = 'opening-hero-shader__canvas';
    host.appendChild(canvasEl);

    const geometry = new THREE.PlaneGeometry(12, 12, 160, 160);
    const uniforms = {
      uTime: { value: 0 },
      uNoiseDensity: { value: 1.55 },
      uNoiseStrength: { value: 0.16 },
      uFrequency: { value: 5.5 },
      uAmplitude: { value: 3.2 },
      uC1r: { value: OPENING_HERO_COLORS.green.r },
      uC1g: { value: OPENING_HERO_COLORS.green.g },
      uC1b: { value: OPENING_HERO_COLORS.green.b },
      uC2r: { value: OPENING_HERO_COLORS.blue.r },
      uC2g: { value: OPENING_HERO_COLORS.blue.g },
      uC2b: { value: OPENING_HERO_COLORS.blue.b },
      uC3r: { value: OPENING_HERO_COLORS.amber.r },
      uC3g: { value: OPENING_HERO_COLORS.amber.g },
      uC3b: { value: OPENING_HERO_COLORS.amber.b },
      uMaskRadius: { value: 0.94 },
      uMaskSoftness: { value: 0.26 },
      uCompound: { value: 0 },
      uSeparation: { value: 0 },
      uCoreTension: { value: 0 },
      uBluePressure: { value: 0.42 },
      uAmberAccent: { value: 0.22 },
      uGrain: { value: 0.028 },
      uGlobalOpacity: { value: 1 },
      uBrightness: { value: 0.94 },
      uContrast: { value: 1.02 },
    };

    let material;
    try {
      material = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: OPENING_HERO_VERTEX,
        fragmentShader: OPENING_HERO_FRAGMENT,
        glslVersion: THREE.GLSL1,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.NormalBlending,
        side: THREE.DoubleSide,
      });
    } catch (err) {
      console.error('[OpeningHeroShader] material compile failed', err);
      material = new THREE.MeshBasicMaterial({
        color: 0x3a9468,
        transparent: true,
        opacity: 0,
        side: THREE.DoubleSide,
      });
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(0, 0, 0);
    mesh.renderOrder = 1;
    scene.add(mesh);

    let liveFrames = 0;
    const markShaderLive = () => {
      liveFrames += 1;
      if (liveFrames >= 3 && material.type === 'ShaderMaterial') {
        host.classList.add('is-hero-shader-live');
      }
    };

    renderer.compile(scene, camera);

    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };

    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let lastNow = performance.now();
    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastNow) / 1000);
      lastNow = now;
      if (!reduceMotion) clockRef.current += dt;

      const heroProgress = progressRef.current ?? 0;
      const state = mapOpeningHeroShaderState(heroProgress, clockRef.current);

      camera.fov = state.cameraFov;
      camera.updateProjectionMatrix();

      placeCamera(
        camera,
        state.cameraDistance,
        state.cameraPolarDeg,
        state.cameraAzimuthDeg,
        state.lookAtYOffset ?? 0,
      );

      mesh.scale.setScalar(state.planeScale);
      mesh.rotation.x = state.planeRotationXDeg * DEG;
      mesh.rotation.y = state.planeRotationYDeg * DEG;
      mesh.rotation.z = (state.planeRotationZDeg ?? 50) * DEG;

      if (material.type === 'ShaderMaterial') {
        uniforms.uTime.value = state.uTime;
        uniforms.uNoiseDensity.value = state.noiseDensity;
        uniforms.uNoiseStrength.value = state.noiseStrength;
        uniforms.uFrequency.value = state.noiseFrequency;
        uniforms.uAmplitude.value = state.flowAmplitude;
        uniforms.uMaskRadius.value = state.maskRadius;
        uniforms.uMaskSoftness.value = state.maskSoftness;
        uniforms.uCompound.value = state.compound;
        uniforms.uSeparation.value = state.separation;
        uniforms.uCoreTension.value = state.coreTension;
        uniforms.uBluePressure.value = state.bluePressure;
        uniforms.uAmberAccent.value = state.amberAccent;
        uniforms.uGrain.value = state.grain;
        uniforms.uGlobalOpacity.value = state.globalOpacity;
        uniforms.uBrightness.value = state.brightness;
        uniforms.uContrast.value = state.contrast;
      }

      if (debugRef.current) {
        debugRef.current.textContent = [
          `heroProgress ${state.heroProgress.toFixed(3)}`,
          `phase ${state.currentPhase}`,
          `camera ${state.cameraDistance.toFixed(2)}`,
          `fov ${state.cameraFov.toFixed(1)}`,
          `maskR ${state.maskRadius.toFixed(3)}`,
          `maskSoft ${state.maskSoftness.toFixed(3)}`,
          `compound ${state.compound.toFixed(3)}`,
          `core ${state.coreTension.toFixed(3)}`,
          `blue ${state.bluePressure.toFixed(3)}`,
          `amber ${state.amberAccent.toFixed(3)}`,
          `noise ${state.noiseStrength.toFixed(3)}`,
          `density ${state.noiseDensity.toFixed(2)}`,
          `speed ${state.uSpeed.toFixed(2)}`,
        ].join('\n');
      }

      try {
        renderer.render(scene, camera);
        markShaderLive();
      } catch (err) {
        console.error('[OpeningHeroShader] render failed', err);
        host.classList.remove('is-hero-shader-live');
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (canvasEl.parentNode === host) host.removeChild(canvasEl);
      if (fallbackEl.parentNode === host) host.removeChild(fallbackEl);
      if (debugEl.parentNode === host) host.removeChild(debugEl);
      host.classList.remove('is-hero-shader-live');
      sceneRef.current = null;
    };
  }, [progressRef, reduceMotion]);

  return (
    <div
      ref={hostRef}
      className="opening-hero-shader"
      aria-hidden="true"
      data-hero-shader="masked-object"
    />
  );
}
