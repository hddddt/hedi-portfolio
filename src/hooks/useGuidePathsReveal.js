import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { animateEvidencePathsReveal } from '../utils/portfolioGuideMotion.js';

gsap.registerPlugin(useGSAP);

/**
 * Stagger evidence path links when `active` flips true (flow result or follow-up).
 * @param {boolean} active
 * @param {{ itemSelector: string, headSelector?: string }} selectors
 */
export function useGuidePathsReveal(active, { itemSelector, headSelector }) {
  const ref = useRef(null);

  useGSAP(
    () => {
      if (!active) return undefined;
      const root = ref.current;
      if (!root) return undefined;
      return animateEvidencePathsReveal(root, itemSelector, headSelector);
    },
    { scope: ref, dependencies: [active], revertOnUpdate: true },
  );

  return ref;
}
