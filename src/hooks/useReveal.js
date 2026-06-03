import { useEffect, useRef, useState } from 'react';

const DEFAULT_OPTIONS = {
  threshold: 0.08,
  rootMargin: '0px 0px -8% 0px',
  once: true,
};

/**
 * Observes a single element; toggles `is-visible` when in view.
 * @param {IntersectionObserverInit & { once?: boolean }} [options]
 */
export function useReveal(options = {}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const { once = true, ...ioOptions } = { ...DEFAULT_OPTIONS, ...options };

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      setVisible(true);
      return undefined;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) io.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      ioOptions,
    );

    io.observe(el);
    const r = el.getBoundingClientRect();
    if (r.top < window.innerHeight * 0.92 && r.bottom > 0) {
      setVisible(true);
      if (once) io.disconnect();
    }

    return () => io.disconnect();
  }, [once, ioOptions.threshold, ioOptions.rootMargin]);

  return { ref, visible, className: visible ? 'is-visible' : '' };
}

/**
 * Mount once at app root to observe `.motion-reveal` / `.motion-reveal-group` in the DOM.
 */
function resolveRevealRoot(rootRef) {
  const el = rootRef?.current;
  if (el && el instanceof Element) return el;
  return document;
}

function collectRevealTargets(root) {
  const scope = root === document ? document : root;
  return [
    ...scope.querySelectorAll('.motion-reveal'),
    ...scope.querySelectorAll('.motion-reveal-group'),
  ];
}

/** Object handoff leads; content reveals after field climate settles. */
function fieldClimateAllowsReveal(el) {
  if (typeof document === 'undefined') return true;
  if (document.documentElement.dataset.fieldClimate !== 'settling') return true;
  if (el.closest('.opening-card, .home-hero, #home-landing, .cap-dial__layout')) return true;
  if (el.closest('.portfolio-guide')) return true;
  return false;
}

/** Reveal elements already in the viewport (avoids black screen before IO fires). */
function revealInViewNow(root) {
  const vh = window.innerHeight;
  collectRevealTargets(root).forEach((el) => {
    if (el.classList.contains('is-visible')) return;
    const r = el.getBoundingClientRect();
    if (r.top < vh * 0.94 && r.bottom > 0) {
      el.classList.add('is-visible');
    }
  });
}

export function useRevealObserver(rootRef) {
  useEffect(() => {
    const getRoot = () => resolveRevealRoot(rootRef);
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const run = () => {
      const root = getRoot();
      const targets = () => collectRevealTargets(root);

      if (reduced) {
        targets().forEach((el) => el.classList.add('is-visible'));
        return () => {};
      }

      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            if (!fieldClimateAllowsReveal(entry.target)) return;
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          });
        },
        { threshold: 0.06, rootMargin: '0px 0px -6% 0px' },
      );

      const observeAll = () => {
        if (document.documentElement.dataset.fieldClimate !== 'settling') {
          revealInViewNow(root);
        }
        targets().forEach((el) => {
          if (el.classList.contains('is-visible')) return;
          if (fieldClimateAllowsReveal(el)) {
            const r = el.getBoundingClientRect();
            if (r.top < window.innerHeight * 0.94 && r.bottom > 0) {
              el.classList.add('is-visible');
              return;
            }
          }
          io.observe(el);
        });
      };

      const onClimateReady = () => {
        if (document.documentElement.dataset.fieldClimate === 'ready') {
          revealInViewNow(root);
          observeAll();
        }
      };
      window.addEventListener('fieldclimatechange', onClimateReady);

      observeAll();
      const mo = new MutationObserver(observeAll);
      const moRoot = root === document ? document.body : root;
      mo.observe(moRoot, { childList: true, subtree: true });

      return () => {
        window.removeEventListener('fieldclimatechange', onClimateReady);
        io.disconnect();
        mo.disconnect();
      };
    };

    let cleanup = run();
    const raf = requestAnimationFrame(() => {
      cleanup?.();
      cleanup = run();
    });

    return () => {
      cancelAnimationFrame(raf);
      cleanup?.();
    };
  }, [rootRef]);
}
