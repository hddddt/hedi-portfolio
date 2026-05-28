/**
 * Single palette for opening discs (landing) + OrganicField canvas.
 * Reference: lime–cream left, cyan–grey right, soft mix on white.
 */

export const DISC_ANCHORS = {
  a: { baseX: 0.35, baseY: 0.47 },
  b: { baseX: 0.61, baseY: 0.42 },
  veil: { baseX: 0.5, baseY: 0.54 },
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
  { r: 72, g: 118, b: 88, a: 0.55 },
  { r: 42, g: 82, b: 58, a: 0.38 },
  { r: 18, g: 48, b: 32, a: 0.16 },
  { r: 0, g: 0, b: 0, a: 0 },
];

/** @type {RgbaStop[]} */
export const DARK_STOPS_B = [
  { r: 88, g: 108, b: 138, a: 0.52 },
  { r: 52, g: 72, b: 108, a: 0.36 },
  { r: 22, g: 38, b: 72, a: 0.14 },
  { r: 0, g: 0, b: 0, a: 0 },
];

/** @type {RgbaStop[]} */
export const DARK_STOPS_VEIL = [
  { r: 168, g: 118, b: 42, a: 0.28 },
  { r: 128, g: 82, b: 28, a: 0.14 },
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
