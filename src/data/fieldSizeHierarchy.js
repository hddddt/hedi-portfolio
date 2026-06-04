/**
 * Organic field size hierarchy — green (system) > blue (POV) > amber (agency).
 *
 * Linear scale is relative to blue = 1.0 at opening.
 * Visual area ≈ (linearScale × radiiGeom × radiiMult)² — keep green/blue area 1.6–2.3× (max 3×).
 */

/** @typedef {'green' | 'blue' | 'amber'} FieldHue */
/** @typedef {'a' | 'b' | 'c'} FieldId */

export const FIELD_ID = /** @type {Record<FieldHue, FieldId>} */ ({
  green: 'a',
  blue: 'b',
  amber: 'c',
});

/** Opening linear scales — blue is the 1.0 anchor */
export const OPENING_LINEAR_SCALE = {
  green: 1.28,
  blue: 1.0,
  amber: 0.76,
};

/** Scroll narrative scales — green always > blue > amber */
export const OPENING_SCROLL_SCALE = {
  intro: { green: 1.28, blue: 1.0, amber: 0.76 },
  transition: { green: 1.2, blue: 0.98, amber: 0.78 },
  thesis: { green: 1.36, blue: 1.1, amber: 0.94 },
};

/** Base shader radii [rx, ry] before scene multiplier */
export const FIELD_BASE_RADII = {
  a: [0.092, 0.102],
  b: [0.088, 0.104],
  c: [0.058, 0.066],
};

/** Warm landing / opening — modest mult; hierarchy lives in linear scale */
export const FIELD_WARM_RADII_MULT = {
  a: 1.03,
  b: 1.02,
  c: 0.94,
};

/** Capabilities signal chapter — no oversized green wall */
export const FIELD_SIGNAL_RADII_MULT = {
  a: 1.18,
  b: 1.1,
  c: 1.02,
};

/** Capabilities / signal layout motion scales (before orb × ambient scaleMult) */
export const SIGNAL_LAYOUT_SCALE = {
  green: 1.53,
  blue: 0.98,
  amber: 0.92,
};

/** Capabilities orb scene multipliers */
export const CAPABILITIES_ORB_SCALE = {
  green: 1.22,
  blue: 1.0,
  amber: 0.88,
};

/**
 * @param {FieldId} id
 * @param {'warm' | 'signal' | string} ambKey
 */
export function fieldRadiiMultiplier(id, ambKey = 'warm') {
  if (ambKey === 'signal') return FIELD_SIGNAL_RADII_MULT[id];
  if (ambKey === 'warm' || ambKey === 'default' || !ambKey) return FIELD_WARM_RADII_MULT[id];
  return 1;
}

/**
 * Estimate linear presence (proportional to sqrt area for similar ellipses).
 * @param {FieldId} id
 * @param {number} motionScale
 * @param {number} stretchX
 * @param {number} stretchY
 * @param {string} ambKey
 */
export function estimateFieldLinear(id, motionScale = 1, stretchX = 1, stretchY = 1, ambKey = 'warm') {
  const [rx0, ry0] = FIELD_BASE_RADII[id];
  const geom = Math.sqrt(rx0 * ry0);
  const avgStretch = (stretchX + stretchY) * 0.5;
  const mult = fieldRadiiMultiplier(id, ambKey);
  return geom * mult * avgStretch * motionScale;
}

/** Opening orb role spec from hierarchy */
export function openingOrbRole(hue, tier) {
  const scale = OPENING_LINEAR_SCALE[hue];
  const opacity = hue === 'green' ? 0.92 : hue === 'blue' ? 0.78 : 0.58;
  const stretch =
    hue === 'green'
      ? { stretchX: 1.02, stretchY: 0.98 }
      : hue === 'blue'
        ? { stretchX: 1.06, stretchY: 0.84 }
        : { stretchX: 1, stretchY: 1.02 };
  return { tier, opacity, scale, ...stretch };
}
