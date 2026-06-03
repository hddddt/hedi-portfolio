import { useRevealObserver } from '../../hooks/useReveal.js';

/** Mount once under scroll-home root to drive `.motion-reveal` / `.motion-reveal-group`. */
export function RevealObserver({ rootRef }) {
  useRevealObserver(rootRef);
  return null;
}
