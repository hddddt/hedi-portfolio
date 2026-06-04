/**
 * Opening disc CSS + motion anchors.
 *
 * COLOR AUTHORITY: organicFieldGl.js shaders — NOT this file.
 * SIZE AUTHORITY: fieldSizeHierarchy.js — scales + base radii.
 * Presence targets: fieldVisualGovernance.js FIELD_SCENE_TARGETS
 * HERO_OPENING_PALETTE below is reference / docs only.
 */

import { OPENING_LINEAR_SCALE, OPENING_SCROLL_SCALE } from './fieldSizeHierarchy.js';

/**
 * Reference RGBA (docs / CSS). Landing WebGL colors: organicFieldGl.js mesh*Hero.
 * @type {{ green: { r: number, g: number, b: number, a: number }, blue: { r: number, g: number, b: number, a: number }, amber: { r: number, g: number, b: number, a: number } }}
 */
export const HERO_OPENING_PALETTE = {
  green: { r: 72, g: 172, b: 118, a: 0.5 },
  blue: { r: 62, g: 88, b: 210, a: 0.48 },
  amber: { r: 232, g: 158, b: 58, a: 0.46 },
};

/** Opening green blob — 25° counterclockwise (shader applies -rotation) */
export const HERO_GREEN_ROTATION = -(25 * Math.PI) / 180;

/** Shared gravity hub — green–blue overlap (structure lines align here) */
export const HERO_GALAXY_FOCAL = { x: 0.466, y: 0.446 };

/**
 * Visual weight targets (area-ish): green ~58%, blue ~32%, amber ~8–10%.
 */
export const OPENING_HERO_MASS_SCALE = {
  green: 1.1,
  blue: 0.94,
  amber: 0.48,
};

/** Green anchor + blue embedded; amber on overlap upper edge (not inside green) */
export const HERO_GALAXY_BODY_OFFSET = {
  a: { dx: -0.036, dy: 0.002 },
  b: { dx: 0.026, dy: 0.003 },
  c: { dx: -0.004, dy: -0.01 },
};

function galaxyCenter(id) {
  const o = HERO_GALAXY_BODY_OFFSET[id];
  return {
    centerX: HERO_GALAXY_FOCAL.x + o.dx,
    centerY: HERO_GALAXY_FOCAL.y + o.dy,
  };
}

/** Landing — balanced low-opacity spectrum (all supporting = slow ambient drift) */
export const HERO_LANDING_ORBS = {
  green: { tier: 'supporting', opacity: 0.86, scale: OPENING_LINEAR_SCALE.green * OPENING_HERO_MASS_SCALE.green * 0.86, stretchX: 1.08, stretchY: 0.92 },
  blue: { tier: 'supporting', opacity: 0.78, scale: OPENING_LINEAR_SCALE.blue * OPENING_HERO_MASS_SCALE.blue, stretchX: 1.02, stretchY: 0.96 },
  yellow: { tier: 'supporting', opacity: 0.64, scale: OPENING_LINEAR_SCALE.amber * OPENING_HERO_MASS_SCALE.amber, stretchX: 0.96, stretchY: 0.94 },
};

/** Rest positions + layout multipliers for warm / landing motion */
export const HERO_LANDING_FIELD = {
  rest: {
    a: { x: galaxyCenter('a').centerX, y: galaxyCenter('a').centerY },
    b: { x: galaxyCenter('b').centerX, y: galaxyCenter('b').centerY },
    c: { x: galaxyCenter('c').centerX, y: galaxyCenter('c').centerY },
  },
  layout: {
    a: {
      opacity: 1,
      scale: OPENING_LINEAR_SCALE.green * OPENING_HERO_MASS_SCALE.green * 0.86,
      dx: 0,
      dy: 0,
      stretchX: 1.08,
      stretchY: 0.92,
      rotation: HERO_GREEN_ROTATION,
    },
    b: {
      opacity: 1,
      scale: OPENING_LINEAR_SCALE.blue * OPENING_HERO_MASS_SCALE.blue,
      dx: 0,
      dy: 0,
      stretchX: 1.02,
      stretchY: 0.96,
      rotation: -0.24,
    },
    c: {
      opacity: 1,
      scale: OPENING_LINEAR_SCALE.amber * OPENING_HERO_MASS_SCALE.amber,
      dx: 0,
      dy: 0,
      stretchX: 0.94,
      stretchY: 0.92,
      rotation: 0.08,
    },
  },
};

/** Scroll narrative blob anchors at hero intro */
export const HERO_BLOB_INTRO = {
  a: {
    ...galaxyCenter('a'),
    scale: OPENING_SCROLL_SCALE.intro.green * OPENING_HERO_MASS_SCALE.green * 0.86,
    opacity: 0.88,
    stretchX: 1.08,
    stretchY: 0.92,
    rotation: HERO_GREEN_ROTATION,
  },
  b: {
    ...galaxyCenter('b'),
    scale: OPENING_SCROLL_SCALE.intro.blue * OPENING_HERO_MASS_SCALE.blue,
    opacity: 0.78,
    stretchX: 1.02,
    stretchY: 0.96,
    rotation: -0.24,
  },
  c: {
    ...galaxyCenter('c'),
    scale: OPENING_SCROLL_SCALE.intro.amber * OPENING_HERO_MASS_SCALE.amber,
    opacity: 0.64,
    stretchX: 0.96,
    stretchY: 0.94,
    rotation: 0.08,
  },
};

export const HERO_WARM_AMBIENT = {
  opacityMult: 1.06,
  scaleMult: 0.96,
  extraC: 1.02,
};

export const DISC_ANCHORS = {
  a: { baseX: galaxyCenter('a').centerX, baseY: galaxyCenter('a').centerY - 0.06 },
  b: { baseX: galaxyCenter('b').centerX, baseY: galaxyCenter('b').centerY - 0.1 },
  veil: { baseX: HERO_GALAXY_FOCAL.x, baseY: HERO_GALAXY_FOCAL.y - 0.03 },
};

/** CSS radial gradients — applied inline on opening discs (cannot be missed by cache) */
export const OPENING_DISC_GRADIENTS = {
  a: [
    'radial-gradient(ellipse 84% 78% at 38% 36%,',
    'rgba(220,238,168,0.78) 0%,',
    'rgba(198,228,140,0.64) 22%,',
    'rgba(248,244,198,0.48) 46%,',
    'rgba(176,198,152,0.26) 70%,',
    'transparent 100%)',
  ].join(' '),
  b: [
    'radial-gradient(ellipse 80% 82% at 62% 42%,',
    'rgba(248,250,228,0.55) 0%,',
    'rgba(186,218,240,0.68) 26%,',
    'rgba(158,200,232,0.48) 50%,',
    'rgba(198,212,228,0.2) 74%,',
    'transparent 100%)',
  ].join(' '),
  veil: [
    'radial-gradient(ellipse 92% 86% at 50% 48%,',
    'rgba(255,252,236,0.38) 0%,',
    'rgba(232,240,248,0.22) 40%,',
    'transparent 100%)',
  ].join(' '),
};

/** @typedef {{ r: number, g: number, b: number, a: number }} RgbaStop */

/** @type {RgbaStop[]} */
export const WARM_STOPS_A = [
  { r: 220, g: 238, b: 168, a: 0.55 },
  { r: 198, g: 228, b: 140, a: 0.42 },
  { r: 248, g: 244, b: 198, a: 0.28 },
  { r: 176, g: 198, b: 152, a: 0.12 },
  { r: 255, g: 255, b: 255, a: 0 },
];

/** @type {RgbaStop[]} */
export const WARM_STOPS_B = [
  { r: 248, g: 250, b: 228, a: 0.4 },
  { r: 186, g: 218, b: 240, a: 0.48 },
  { r: 158, g: 200, b: 232, a: 0.32 },
  { r: 198, g: 212, b: 228, a: 0.12 },
  { r: 255, g: 255, b: 255, a: 0 },
];

/** @type {RgbaStop[]} */
export const WARM_STOPS_VEIL = [
  { r: 255, g: 252, b: 236, a: 0.28 },
  { r: 232, g: 240, b: 248, a: 0.16 },
  { r: 255, g: 255, b: 255, a: 0 },
];

/** @type {RgbaStop[]} */
export const DARK_STOPS_A = [
  { r: 48, g: 168, b: 128, a: 0.62 },
  { r: 28, g: 128, b: 98, a: 0.44 },
  { r: 12, g: 72, b: 58, a: 0.18 },
  { r: 0, g: 0, b: 0, a: 0 },
];

/** @type {RgbaStop[]} */
export const DARK_STOPS_B = [
  { r: 108, g: 148, b: 228, a: 0.58 },
  { r: 68, g: 108, b: 198, a: 0.4 },
  { r: 32, g: 58, b: 128, a: 0.16 },
  { r: 0, g: 0, b: 0, a: 0 },
];

/** @type {RgbaStop[]} */
export const DARK_STOPS_VEIL = [
  { r: 228, g: 168, b: 72, a: 0.32 },
  { r: 188, g: 128, b: 48, a: 0.16 },
  { r: 0, g: 0, b: 0, a: 0 },
];

export const STOP_POSITIONS_AB = [0, 0.22, 0.48, 0.74, 1];
export const STOP_POSITIONS_VEIL = [0, 0.45, 1];

export function ambientDarkMix(ambientKey) {
  if (
    ambientKey === 'warm' ||
    ambientKey === 'contact' ||
    ambientKey === 'default' ||
    !ambientKey
  ) {
    return 0;
  }
  return 1;
}

export function isLightAmbient(ambientKey) {
  return ambientDarkMix(ambientKey) === 0;
}

export function lerpStops(warm, dark, t) {
  const n = Math.min(warm.length, dark.length);
  return Array.from({ length: n }, (_, i) => ({
    r: warm[i].r + (dark[i].r - warm[i].r) * t,
    g: warm[i].g + (dark[i].g - warm[i].g) * t,
    b: warm[i].b + (dark[i].b - warm[i].b) * t,
    a: warm[i].a + (dark[i].a - warm[i].a) * t,
  }));
}
