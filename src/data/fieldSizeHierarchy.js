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
  green: 1.24,
  blue: 1.0,
  amber: 0.8,
};

/** Scroll narrative scales — green always > blue > amber */
export const OPENING_SCROLL_SCALE = {
  intro: { green: 1.24, blue: 1.0, amber: 0.8 },
  transition: { green: 1.2, blue: 0.98, amber: 0.78 },
  thesis: { green: 1.16, blue: 0.96, amber: 0.76 },
};

/** Base shader radii [rx, ry] before scene multiplier */
export const FIELD_BASE_RADII = {
  a: [0.104, 0.134],
  b: [0.094, 0.12],
  c: [0.074, 0.094],
};

/** Warm landing / opening — modest mult; hierarchy lives in linear scale */
export const FIELD_WARM_RADII_MULT = {
  a: 1.12,
  b: 1.06,
  c: 1.0,
};

/** Capabilities signal chapter — no oversized green wall */
export const FIELD_SIGNAL_RADII_MULT = {
  a: 1.1,
  b: 1.06,
  c: 0.96,
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
