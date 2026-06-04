/**
 * ShaderGradient scroll — micro cameraZoom only (p=0 = site export).
 * Avoid multi-prop updates that flash / fight the renderer.
 */

import { clampHeroProgress, smoothstep } from './openingHeroProgress.js';

function mix(a, b, t) {
  return a + (b - a) * t;
}

/** Screen 1 — shadergradient.co export */
export const OPENING_SG_BASE = {
  animate: 'on',
  brightness: 1,
  cAzimuthAngle: -51,
  cDistance: 14,
  cPolarAngle: 140,
  cameraZoom: 5,
  color1: '#b5e0ce',
  color2: '#ffa742',
  color3: '#ad90ce',
  envPreset: 'city',
  grain: 'on',
  lightType: 'env',
  positionX: 0,
  positionY: 0,
  positionZ: 0,
  range: 'enabled',
  rangeStart: 1.2,
  rangeEnd: 37.8,
  reflection: 0.4,
  rotationX: 0,
  rotationY: 130,
  rotationZ: 70,
  shader: 'defaults',
  type: 'sphere',
  uAmplitude: 2.2,
  uDensity: 0.2,
  uFrequency: 5.5,
  uSpeed: 0.3,
  uStrength: 0.2,
  wireframe: false,
  zoomOut: true,
};

export const OPENING_SG_CANVAS_BASE = {
  pixelDensity: 1,
  fov: 40,
};

/** End zoom — small pull-back by lockup, not a full reframing */
const ZOOM_START = OPENING_SG_BASE.cameraZoom;
const ZOOM_END = 15;

/**
 * @param {number} heroProgress
 */
export function mapOpeningShaderGradientProps(heroProgress) {
  const p = clampHeroProgress(heroProgress);
  /** Zoom begins with first scroll (~p 0.04), settles by thesis beat (~0.55) */
  const zoomT = smoothstep(0.04, 0.55, p);
  const cameraZoom = mix(ZOOM_START, ZOOM_END, zoomT);

  return {
    heroProgress: p,
    canvas: { ...OPENING_SG_CANVAS_BASE },
    gradient: {
      ...OPENING_SG_BASE,
      cameraZoom,
    },
  };
}
