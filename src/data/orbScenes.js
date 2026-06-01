/**
 * Semantic orb scenes — green = work/system, blue = POV/thinking, yellow = author/guide.
 * Effective presence targets: fieldVisualGovernance.js FIELD_SCENE_TARGETS
 */

import { HERO_LANDING_ORBS } from './organicFieldPalette.js';

/** @typedef {'dominant' | 'supporting' | 'latent'} OrbTier */

/**
 * @typedef {object} OrbRoleSpec
 * @property {OrbTier} tier
 * @property {number} opacity
 * @property {number} scale
 * @property {number} [stretchX]
 * @property {number} [stretchY]
 */

/**
 * @typedef {object} OrbSceneSpec
 * @property {OrbRoleSpec} green
 * @property {OrbRoleSpec} blue
 * @property {OrbRoleSpec} yellow
 */

/** @type {Record<string, OrbSceneSpec>} */
export const ORB_SCENE_SPECS = {
  landing: HERO_LANDING_ORBS,
  capabilities: {
    green: { tier: 'dominant', opacity: 1, scale: 1.08, stretchX: 1.04, stretchY: 0.98 },
    blue: { tier: 'supporting', opacity: 0.88, scale: 0.96, stretchX: 1.04, stretchY: 0.92 },
    yellow: { tier: 'latent', opacity: 0.72, scale: 0.82, stretchX: 1, stretchY: 1.02 },
  },
  work: {
    green: { tier: 'dominant', opacity: 1, scale: 1.16, stretchX: 1.04, stretchY: 1.02 },
    blue: { tier: 'supporting', opacity: 0.52, scale: 0.88, stretchX: 1.06, stretchY: 0.94 },
    yellow: { tier: 'latent', opacity: 0.26, scale: 0.7, stretchX: 1, stretchY: 1.03 },
  },
  case: {
    green: { tier: 'dominant', opacity: 0.92, scale: 1.1, stretchX: 1.06, stretchY: 1.02 },
    blue: { tier: 'dominant', opacity: 0.78, scale: 1.02, stretchX: 1.12, stretchY: 0.9 },
    yellow: { tier: 'latent', opacity: 0.26, scale: 0.68, stretchX: 1, stretchY: 1.04 },
  },
  pov: {
    green: { tier: 'latent', opacity: 0.26, scale: 0.68, stretchX: 1, stretchY: 1 },
    blue: { tier: 'dominant', opacity: 1, scale: 1.18, stretchX: 1.08, stretchY: 0.92 },
    yellow: { tier: 'supporting', opacity: 0.54, scale: 0.84, stretchX: 0.98, stretchY: 1.03 },
  },
  me: {
    green: { tier: 'latent', opacity: 0.22, scale: 0.64, stretchX: 1, stretchY: 1 },
    blue: { tier: 'supporting', opacity: 0.48, scale: 0.84, stretchX: 1.04, stretchY: 0.94 },
    yellow: { tier: 'dominant', opacity: 1, scale: 1.12, stretchX: 0.98, stretchY: 1.04 },
  },
  guide: {
    green: { tier: 'latent', opacity: 0.2, scale: 0.64, stretchX: 1, stretchY: 1 },
    blue: { tier: 'supporting', opacity: 0.46, scale: 0.82, stretchX: 1.04, stretchY: 0.92 },
    yellow: { tier: 'dominant', opacity: 1, scale: 1.06, stretchX: 0.98, stretchY: 1.04 },
  },
};

const CHAPTER_TO_SCENE = {
  'home-landing': 'landing',
  'home-capabilities': 'capabilities',
  'home-work-narrative': 'work',
  'home-approach': 'pov',
  'home-life-archive': 'me',
};

/**
 * @param {{ activeChapterId?: string | null, guideOpen?: boolean, caseDetailOpen?: boolean }} ctx
 * @returns {keyof typeof ORB_SCENE_SPECS}
 */
export function resolveOrbScene(ctx) {
  if (ctx.guideOpen) return 'guide';
  if (ctx.caseDetailOpen) return 'case';
  const fromChapter = ctx.activeChapterId ? CHAPTER_TO_SCENE[ctx.activeChapterId] : null;
  return fromChapter ?? 'landing';
}

function lerpRole(a, b, t) {
  return {
    tier: t < 0.5 ? a.tier : b.tier,
    opacity: a.opacity + (b.opacity - a.opacity) * t,
    scale: a.scale + (b.scale - a.scale) * t,
    stretchX: (a.stretchX ?? 1) + ((b.stretchX ?? 1) - (a.stretchX ?? 1)) * t,
    stretchY: (a.stretchY ?? 1) + ((b.stretchY ?? 1) - (a.stretchY ?? 1)) * t,
  };
}

/**
 * Crossfade orb semantics during 04→05 handoff (pov → me).
 * @param {number} t 0 = pov, 1 = me
 */
export function blendOrbSceneSpecs(sceneA, sceneB, t) {
  const a = ORB_SCENE_SPECS[sceneA] ?? ORB_SCENE_SPECS.landing;
  const b = ORB_SCENE_SPECS[sceneB] ?? ORB_SCENE_SPECS.landing;
  const u = Math.max(0, Math.min(1, t));
  return {
    green: lerpRole(a.green, b.green, u),
    blue: lerpRole(a.blue, b.blue, u),
    yellow: lerpRole(a.yellow, b.yellow, u),
  };
}
