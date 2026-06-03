import { useMemo } from 'react';

/** Chapter → marker contrast mode (spec §11). */
const SURFACE_BY_CHAPTER = {
  'home-landing': 'light',
  'home-capabilities': 'dark',
  'home-work-narrative': 'dark',
  'home-approach': 'mixed',
  'home-life-archive': 'dark',
};

/**
 * @param {string | null | undefined} activeId
 * @returns {'light' | 'dark' | 'mixed'}
 */
export function resolveShortcutSurface(activeId) {
  if (!activeId) return 'dark';
  return SURFACE_BY_CHAPTER[activeId] ?? 'dark';
}

/**
 * @param {string | null | undefined} activeId
 */
export function usePortfolioShortcutSurface(activeId) {
  return useMemo(() => resolveShortcutSurface(activeId), [activeId]);
}
