/**
 * Field visual governance — single place to read intent and estimate effective presence.
 *
 * AUTHORITY CHAIN (do not invert):
 *   1. RGB / material  → organicFieldGl.js (shader, sole color source)
 *   2. Size hierarchy  → fieldSizeHierarchy.js (linear scales, base radii, radii mult)
 *   3. Scene targets   → this file (desired effective opacity × scale per chapter)
 *   4. Scene weights   → orbScenes.js × organicFieldMotion.js layout
 *   5. Ambient + radii → OrganicField.jsx ORGANIC_FIELD_CONFIG
 *   6. Scroll behavior → signalGreenScrollAttenuation() etc.
 *   7. Green breathing  → greenFieldBreathing.js (sine pulse on green only)
 *
 * organicFieldPalette.js HERO_OPENING_PALETTE is reference-only — not wired to WebGL.
 */

import {
  OPENING_LINEAR_SCALE,
  OPENING_SCROLL_SCALE,
  SIGNAL_LAYOUT_SCALE,
} from './fieldSizeHierarchy.js';

/** @typedef {'green' | 'blue' | 'amber'} FieldHue */
/** @typedef {{ opacity: number, scale: number }} FieldPresenceTarget */

/** @type {Record<string, Record<FieldHue, FieldPresenceTarget>>} */
export const FIELD_SCENE_TARGETS = {
  opening: {
    green: { opacity: 0.92, scale: OPENING_LINEAR_SCALE.green },
    blue: { opacity: 0.78, scale: OPENING_LINEAR_SCALE.blue },
    amber: { opacity: 0.58, scale: OPENING_LINEAR_SCALE.amber },
  },
  openingThesis: {
    green: { opacity: 0.92, scale: OPENING_SCROLL_SCALE.thesis.green },
    blue: { opacity: 0.78, scale: OPENING_SCROLL_SCALE.thesis.blue },
    amber: { opacity: 0.58, scale: OPENING_SCROLL_SCALE.thesis.amber },
  },
  capabilities: {
    green: { opacity: 0.78, scale: SIGNAL_LAYOUT_SCALE.green },
    blue: { opacity: 0.58, scale: SIGNAL_LAYOUT_SCALE.blue },
    amber: { opacity: 0.32, scale: SIGNAL_LAYOUT_SCALE.amber },
  },
  work: {
    green: { opacity: 0.46, scale: 1.0 },
    blue: { opacity: 0.34, scale: 0.96 },
    amber: { opacity: 0.20, scale: 0.86 },
  },
  pov: {
    green: { opacity: 0.18, scale: 0.92 },
    blue: { opacity: 0.56, scale: 1.04 },
    amber: { opacity: 0.22, scale: 0.86 },
  },
  me: {
    green: { opacity: 0.10, scale: 0.86 },
    blue: { opacity: 0.16, scale: 0.90 },
    amber: { opacity: 0.72, scale: 1.02 },
  },
};

export const FIELD_AUTHORITY = {
  color: 'src/components/home/organicFieldGl.js',
  sizeHierarchy: 'src/data/fieldSizeHierarchy.js',
  presenceTargets: 'src/data/fieldVisualGovernance.js',
  sceneWeights: 'src/data/orbScenes.js',
  layout: 'src/components/home/organicFieldMotion.js',
  ambientRadii: 'src/components/home/OrganicField.jsx',
  greenBreathing: 'src/utils/greenFieldBreathing.js',
};

const HUE_TO_FIELD = { green: 'a', blue: 'b', amber: 'c' };

/**
 * Estimate effective opacity after layout × orb × ambient (landing uses orb opacity directly).
 * @param {string} scene
 * @param {FieldHue} hue
 * @param {{ layoutOpacity: number, orbOpacity: number, ambientOpacityMult: number, landing?: boolean }} factors
 */
export function estimateEffectiveOpacity(scene, hue, factors) {
  void scene;
  const { layoutOpacity, orbOpacity, ambientOpacityMult, landing = false } = factors;
  const role = landing ? orbOpacity : layoutOpacity * orbOpacity;
  return role * ambientOpacityMult;
}

/** Debug helper — log target vs estimate for a scene */
export function compareScenePresence(scene, estimates) {
  const target = FIELD_SCENE_TARGETS[scene];
  if (!target) return null;
  return Object.entries(target).map(([hue, tgt]) => ({
    hue,
    target: tgt.opacity,
    estimated: estimates[HUE_TO_FIELD[hue] ?? hue]?.opacity ?? null,
  }));
}
