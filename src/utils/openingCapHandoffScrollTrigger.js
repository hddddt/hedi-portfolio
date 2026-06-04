import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { smoothstep } from './fieldNarrative.js';
import { isPortfolioGuidePanelLocked } from './portfolioGuidePanelState.js';

gsap.registerPlugin(ScrollTrigger);

/**
 * Maps ScrollTrigger handoff progress (0–1) to coordinated wipe / field / completion.
 * @param {number} t
 */
export function mapOpeningCapHandoffProgress(t) {
  const p = Math.max(0, Math.min(1, t ?? 0));
  return {
    /** Soft gray veil — only after thesis has had screen-2 dwell */
    wipe: smoothstep(0.22, 0.78, p),
    /** Organic field opening → capabilities signal */
    fieldHandoff: smoothstep(0.38, 0.94, p),
    /** Thesis copy fade during crossfade */
    thesisFade: smoothstep(0.48, 0.9, p),
    /** Viewport field + opening chapter release */
    openingComplete: smoothstep(0.76, 0.94, p),
    zone: p,
  };
}

function queryHandoffElements() {
  if (typeof document === 'undefined') return null;
  const opening = document.querySelector('.opening-scroll');
  const capChapter =
    document.getElementById('capabilities') ??
    document.querySelector('[data-narrative-chapter="home-capabilities"]');
  const capSticky = document.querySelector('.capability-sticky');
  if (!opening || !capChapter) return null;
  return { opening, capChapter, capSticky };
}

/**
 * Scroll-linked handoff: opening scroll tail (screen 2) → capabilities pin.
 * @param {{
 *   onProgress: (mapped: ReturnType<typeof mapOpeningCapHandoffProgress>) => void,
 *   reduceMotion?: boolean,
 * }} options
 * @returns {() => void}
 */
export function createOpeningCapHandoffScrollTrigger({ onProgress, reduceMotion = false }) {
  if (typeof window === 'undefined') return () => {};

  const apply = (t) => {
    if (isPortfolioGuidePanelLocked()) return;
    onProgress(mapOpeningCapHandoffProgress(t));
  };

  if (reduceMotion) {
    const onScroll = () => {
      const els = queryHandoffElements();
      if (!els) return;
      const { opening, capSticky } = els;
      const vh = window.innerHeight;
      const openBottom = opening.getBoundingClientRect().bottom;
      const pinTop = capSticky?.getBoundingClientRect().top ?? vh;
      const t =
        openBottom <= vh * 0.5
          ? pinTop <= vh * 0.08
            ? 1
            : 0.55
          : 0;
      apply(t);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }

  let trigger = null;

  const mount = () => {
    trigger?.kill();
    trigger = null;

    const els = queryHandoffElements();
    if (!els) {
      apply(0);
      return;
    }

    const { opening, capChapter, capSticky } = els;

    trigger = ScrollTrigger.create({
      id: 'opening-cap-handoff',
      trigger: opening,
      /** Screen-2 tail: handoff starts as opening track releases (not mid-thesis). */
      start: 'bottom 90%',
      endTrigger: capSticky ?? capChapter,
      end: 'top top',
      scrub: 0.42,
      invalidateOnRefresh: true,
      onUpdate: (self) => apply(self.progress),
      onEnter: (self) => apply(self.progress),
      onEnterBack: (self) => apply(self.progress),
      onLeave: () => apply(1),
      onLeaveBack: () => apply(0),
    });

    const atTop = window.scrollY < window.innerHeight * 0.2;
    apply(atTop && trigger.progress > 0.02 ? 0 : trigger.progress);
  };

  const ctx = gsap.context(() => {
    let attempts = 0;
    const tryMount = () => {
      mount();
      if (!trigger && attempts < 24) {
        attempts += 1;
        requestAnimationFrame(tryMount);
        return;
      }
      if (trigger) {
        requestAnimationFrame(() => ScrollTrigger.refresh());
      }
    };
    tryMount();
  });

  let refreshTimer = 0;
  const onRefresh = () => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => {
      mount();
      ScrollTrigger.refresh();
    }, 120);
  };

  ScrollTrigger.addEventListener('refreshInit', onRefresh);

  return () => {
    window.clearTimeout(refreshTimer);
    ScrollTrigger.removeEventListener('refreshInit', onRefresh);
    ctx.revert();
  };
}
