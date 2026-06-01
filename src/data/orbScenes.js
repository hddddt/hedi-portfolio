/**
 * Semantic orb scenes — green = work/system, blue = POV/thinking, yellow = author/guide.
 * Each scene defines dominant / supporting / latent tiers (not equal decorative blobs).
 */

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
  landing: {
    green: { tier: 'dominant', opacity: 1, scale: 1.22, stretchX: 1.02, stretchY: 0.98 },
    blue: { tier: 'supporting', opacity: 0.68, scale: 0.98, stretchX: 0.96, stretchY: 0.96 },
    yellow: { tier: 'latent', opacity: 0.4, scale: 0.82, stretchX: 1, stretchY: 1.06 },
  },
  capabilities: {
    green: { tier: 'supporting', opacity: 0.58, scale: 0.92, stretchX: 1, stretchY: 1 },
    blue: { tier: 'dominant', opacity: 1, scale: 1.18, stretchX: 1.06, stretchY: 0.92 },
    yellow: { tier: 'latent', opacity: 0.34, scale: 0.76, stretchX: 1, stretchY: 1.08 },
  },
  work: {
    green: { tier: 'dominant', opacity: 1, scale: 1.14, stretchX: 1.04, stretchY: 1.02 },
    blue: { tier: 'supporting', opacity: 0.55, scale: 0.9, stretchX: 1.08, stretchY: 0.94 },
    yellow: { tier: 'latent', opacity: 0.3, scale: 0.72, stretchX: 1, stretchY: 1.05 },
  },
  case: {
    green: { tier: 'dominant', opacity: 0.92, scale: 1.1, stretchX: 1.06, stretchY: 1.02 },
    blue: { tier: 'dominant', opacity: 0.78, scale: 1.02, stretchX: 1.12, stretchY: 0.9 },
    yellow: { tier: 'latent', opacity: 0.26, scale: 0.68, stretchX: 1, stretchY: 1.04 },
  },
  pov: {
    green: { tier: 'latent', opacity: 0.28, scale: 0.7, stretchX: 1, stretchY: 1 },
    blue: { tier: 'dominant', opacity: 1, scale: 1.2, stretchX: 1.1, stretchY: 0.9 },
    yellow: { tier: 'supporting', opacity: 0.62, scale: 0.88, stretchX: 0.98, stretchY: 1.08 },
  },
  me: {
    green: { tier: 'latent', opacity: 0.24, scale: 0.68, stretchX: 1, stretchY: 1 },
    blue: { tier: 'supporting', opacity: 0.52, scale: 0.86, stretchX: 1.04, stretchY: 0.94 },
    yellow: { tier: 'dominant', opacity: 1, scale: 1.16, stretchX: 0.98, stretchY: 1.1 },
  },
  guide: {
    green: { tier: 'latent', opacity: 0.22, scale: 0.66, stretchX: 1, stretchY: 1 },
    blue: { tier: 'supporting', opacity: 0.5, scale: 0.84, stretchX: 1.06, stretchY: 0.92 },
    yellow: { tier: 'dominant', opacity: 1, scale: 1.08, stretchX: 0.98, stretchY: 1.12 },
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
