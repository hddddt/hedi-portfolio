import gsap from 'gsap';

export const ROUTE_PANEL_PIECE = 'portfolio-guide__route-panel-piece';

/** Restrained cinematic easing — panel instrument motion */
export const GUIDE_EASE_CINEMATIC = 'cubic-bezier(0.19, 1, 0.22, 1)';

const EASE_UI = 'power2.out';

/**
 * @param {(mm: gsap.MatchMedia) => void} setup
 * @returns {() => void}
 */
export function runPortfolioGuideMotion(setup) {
  const mm = gsap.matchMedia();
  setup(mm);
  return () => mm.revert();
}

/**
 * @param {HTMLElement} root
 * @param {Element[]} pieces
 * @returns {() => void}
 */
export function animateRoutePanelEnter(root, pieces) {
  return runPortfolioGuideMotion((mm) => {
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set([root, ...pieces], { opacity: 1, y: 0, filter: 'blur(0px)' });
    });
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: EASE_UI } });
      /* Opacity-only on root — transform on ancestors breaks sticky Back nav */
      tl.from(root, { opacity: 0, duration: 0.52, ease: GUIDE_EASE_CINEMATIC }).from(
        pieces,
        {
          opacity: 0,
          y: 10,
          filter: 'blur(3px)',
          duration: 0.62,
          stagger: 0.09,
          ease: GUIDE_EASE_CINEMATIC,
        },
        '-=0.28',
      );
      return () => tl.kill();
    });
  });
}

/**
 * Drawer open — title, route cards, footer search.
 * @param {HTMLElement} module
 * @returns {() => void}
 */
export function animateGuideHomeEnter(module) {
  const title = module.querySelector('.portfolio-guide__enter-stage--title');
  const paths = module.querySelector('.portfolio-guide__enter-stage--paths');
  const evidence = module.querySelector('.portfolio-guide__enter-stage--evidence');
  const angleCards = gsap.utils.toArray('.portfolio-guide__angle-card', module);
  const evidenceCards = gsap.utils.toArray('.portfolio-guide__card--evidence', module);
  const search = module.querySelector('.portfolio-guide__enter-stage--search');
  const targets = [title, paths, evidence, search, ...angleCards, ...evidenceCards].filter(Boolean);

  return runPortfolioGuideMotion((mm) => {
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1 });
    });
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      if (title) {
        tl.from(title, { opacity: 0, x: 10, duration: 0.48 }, 0.06);
      }
      if (paths) {
        tl.from(paths, { opacity: 0, x: 10, duration: 0.4 }, 0.1);
      }
      if (angleCards.length) {
        tl.from(
          angleCards,
          { opacity: 0, y: 6, duration: 0.34, stagger: 0.06, ease: GUIDE_EASE_CINEMATIC },
          0.12,
        );
      }
      if (evidence) {
        tl.from(evidence, { opacity: 0, x: 8, duration: 0.38, ease: GUIDE_EASE_CINEMATIC }, 0.28);
      }
      if (evidenceCards.length) {
        tl.from(
          evidenceCards,
          { opacity: 0, y: 5, duration: 0.32, stagger: 0.05, ease: GUIDE_EASE_CINEMATIC },
          0.32,
        );
      }
      if (search) {
        tl.from(search, { opacity: 0, x: 6, duration: 0.44, ease: GUIDE_EASE_CINEMATIC }, 0.48);
      }
      return () => tl.kill();
    });
  });
}

/**
 * @param {HTMLElement} root — container with `.portfolio-guide__path-track-item` or follow-up `li`
 * @param {string} itemSelector
 * @param {string} [headSelector]
 * @returns {() => void}
 */
export function animateEvidencePathsReveal(root, itemSelector, headSelector) {
  const items = gsap.utils.toArray(itemSelector, root);
  const head = headSelector ? root.querySelector(headSelector) : null;
  const targets = [head, ...items].filter(Boolean);

  return runPortfolioGuideMotion((mm) => {
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set(targets, { opacity: 1, x: 0 });
    });
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: EASE_UI } });
      if (head) {
        tl.from(head, { opacity: 0, x: 10, duration: 0.42 }, 0.04);
      }
      tl.from(items, { opacity: 0, x: 12, duration: 0.46, stagger: 0.07 }, head ? 0.08 : 0.06);
      return () => tl.kill();
    });
  });
}

/**
 * Home → route detail: list recedes, selected card confirms (no hard page swap feel).
 * @param {HTMLElement} module
 * @param {string} routeId
 * @returns {() => void}
 */
export function animateGuideRouteExpand(module, routeId) {
  const card = module.querySelector(`[data-route-id="${routeId}"]`);
  const angles = module.querySelector('.portfolio-guide__angles');
  const siblings = gsap.utils.toArray(
    `.portfolio-guide__angle-card:not([data-route-id="${routeId}"])`,
    module,
  );

  return runPortfolioGuideMotion((mm) => {
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set([card, angles, ...siblings].filter(Boolean), { clearProps: 'opacity,filter' });
    });
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: GUIDE_EASE_CINEMATIC } });
      if (siblings.length) {
        tl.to(siblings, { opacity: 0.38, filter: 'blur(1px)', duration: 0.28 }, 0);
      }
      if (angles) {
        tl.to(angles, { opacity: 0.52, duration: 0.32 }, 0.04);
      }
      if (card) {
        tl.to(card, { opacity: 1, duration: 0.3 }, 0);
      }
      return () => tl.kill();
    });
  });
}

/**
 * @param {HTMLElement} container
 * @param {'convergence' | 'operationalization' | 'scope' | 'relationship'} kind
 * @returns {() => void}
 */
export function animateRouteVisual(container, kind) {
  return runPortfolioGuideMotion((mm) => {
    const resetAll = () => {
      gsap.set(container.querySelectorAll('*'), { clearProps: 'all' });
    };

    mm.add('(prefers-reduced-motion: reduce)', () => {
      resetAll();
      gsap.set(container, { opacity: 1 });
    });

    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const tl = gsap.timeline({ defaults: { ease: EASE_UI } });
      const lines = [];
      const blocks = [];

      if (kind === 'convergence') {
        const scatter = container.querySelector('.shortcut-route-visual__scatter');
        if (scatter) {
          tl.from(scatter, { opacity: 0.35, x: -6, duration: 0.68 }, 0);
        }
        const accent = container.querySelector('.shortcut-route-visual__frame--accent');
        if (accent) {
          tl.from(accent, { opacity: 0, scale: 0.96, transformOrigin: '50% 50%', duration: 0.5 }, 0.2);
        }
      }

      if (kind === 'operationalization') {
        lines.push(...gsap.utils.toArray('.shortcut-route-visual__line', container));
        lines.forEach((line, i) => {
          const len = typeof line.getTotalLength === 'function' ? line.getTotalLength() : 40;
          gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(line, { strokeDashoffset: 0, duration: 0.72 }, 0.12 + i * 0.08);
        });
        blocks.push(
          ...gsap.utils.toArray(
            '.shortcut-route-visual__block, .shortcut-route-visual__chip-row',
            container,
          ),
        );
        tl.from(blocks, { opacity: 0, y: 4, duration: 0.4, stagger: 0.06 }, 0);
      }

      if (kind === 'scope') {
        const rings = gsap.utils.toArray('.shortcut-route-visual__ring', container);
        tl.from(
          rings,
          { opacity: 0, scale: 0.96, transformOrigin: '50% 50%', duration: 0.52, stagger: 0.08 },
          0,
        );
      }

      if (kind === 'relationship') {
        lines.push(...gsap.utils.toArray('.shortcut-route-visual__line', container));
        lines.forEach((line, i) => {
          const len = typeof line.getTotalLength === 'function' ? line.getTotalLength() : 80;
          gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
          tl.to(line, { strokeDashoffset: 0, duration: 0.6 }, i * 0.1);
        });
        blocks.push(...gsap.utils.toArray('.shortcut-route-visual__block', container));
        tl.from(blocks, { opacity: 0, duration: 0.35, stagger: 0.06 }, 0);
      }

      return () => {
        tl.kill();
        if (lines.length) {
          gsap.set(lines, { clearProps: 'strokeDashoffset,strokeDasharray' });
        }
        if (blocks.length) {
          gsap.set(blocks, { clearProps: 'opacity,transform' });
        }
      };
    });
  });
}
