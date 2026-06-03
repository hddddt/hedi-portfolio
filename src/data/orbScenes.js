/**
 * Semantic orb scenes — scroll-driven chapter climate.
 *
 * Green  = capability / workflow / systems (field a)
 * Blue   = perspective / reasoning (field b)
 * Orange = human / personal layer (field c — amber in shaders)
 */

import { CAPABILITIES_ORB_SCALE } from './fieldSizeHierarchy.js';
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
  /** Hero — full spectrum, low equal presence, slow ambient drift */
  landing: HERO_LANDING_ORBS,
  capabilities: {
    green: {
      tier: 'dominant',
      opacity: 0.92,
      scale: 1,
      stretchX: 1,
      stretchY: 1,
    },
    blue: {
      tier: 'latent',
      opacity: 0.82,
      scale: 1,
      stretchX: 1,
      stretchY: 1,
    },
    yellow: {
      tier: 'latent',
      opacity: 0.78,
      scale: 1,
      stretchX: 1,
      stretchY: 1,
    },
  },
  /** Work — green evidence field in support zone; case hover elevates hue */
  work: {
    green: { tier: 'supporting', opacity: 0.38, scale: 0.86, stretchX: 1.02, stretchY: 1 },
    blue: { tier: 'latent', opacity: 0.22, scale: 0.82, stretchX: 1.04, stretchY: 0.96 },
    yellow: { tier: 'latent', opacity: 0.18, scale: 0.76, stretchX: 1, stretchY: 1.02 },
  },
  case: {
    green: { tier: 'supporting', opacity: 0.72, scale: 1.02, stretchX: 1.04, stretchY: 1.02 },
    blue: { tier: 'supporting', opacity: 0.62, scale: 0.96, stretchX: 1.06, stretchY: 0.94 },
    yellow: { tier: 'latent', opacity: 0.22, scale: 0.68, stretchX: 1, stretchY: 1.04 },
  },
  pov: {
    green: { tier: 'latent', opacity: 0.14, scale: 0.6, stretchX: 1, stretchY: 1 },
    blue: { tier: 'dominant', opacity: 0.88, scale: 1.08, stretchX: 1.06, stretchY: 0.94 },
    yellow: { tier: 'latent', opacity: 0.16, scale: 0.72, stretchX: 0.98, stretchY: 1.03 },
  },
  /** Beyond / path / archive — personhood signal */
  me: {
    green: { tier: 'latent', opacity: 0.12, scale: 0.58, stretchX: 1, stretchY: 1 },
    blue: { tier: 'latent', opacity: 0.18, scale: 0.68, stretchX: 1.02, stretchY: 0.98 },
    yellow: { tier: 'dominant', opacity: 0.82, scale: 1.04, stretchX: 0.98, stretchY: 1.04 },
  },
  /** Contact — mature convergence (not hero reset) */
  contact: {
    green: { tier: 'supporting', opacity: 0.38, scale: 0.74, stretchX: 1.02, stretchY: 0.98 },
    blue: { tier: 'supporting', opacity: 0.36, scale: 0.72, stretchX: 1.04, stretchY: 0.94 },
    yellow: { tier: 'supporting', opacity: 0.4, scale: 0.76, stretchX: 0.98, stretchY: 1.02 },
  },
  guide: {
    green: { tier: 'latent', opacity: 0.14, scale: 0.58, stretchX: 1, stretchY: 1 },
    blue: { tier: 'latent', opacity: 0.22, scale: 0.68, stretchX: 1.02, stretchY: 0.98 },
    yellow: { tier: 'latent', opacity: 0.28, scale: 0.72, stretchX: 0.98, stretchY: 1.02 },
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
 * @param {{ activeChapterId?: string | null, guideOpen?: boolean, caseDetailOpen?: boolean, contactBlend?: number }} ctx
 * @returns {keyof typeof ORB_SCENE_SPECS}
 */
export function resolveOrbScene(ctx) {
  if (ctx.guideOpen) return 'guide';
  if (ctx.caseDetailOpen) return 'case';
  if (ctx.activeChapterId === 'home-life-archive' && (ctx.contactBlend ?? 0) > 0.62) {
    return 'contact';
  }
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
 * Crossfade orb semantics between scenes.
 * @param {string} sceneA
 * @param {string} sceneB
 * @param {number} t 0 = a, 1 = b
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
