import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  SHORTCUT_DIRECT_CASES,
  SHORTCUT_PROOF_POINTS,
  SHORTCUT_ROUTES,
  getShortcutRoute,
  getShortcutRoutePanel,
} from '../../data/portfolioShortcutContent.js';
import { SHORTCUT_ENTRY, SHORTCUT_SECTIONS } from '../../data/portfolioGuideSystem.js';
import { getPortfolioGuidePortalNode } from '../../utils/portfolioGuidePortal.js';
import {
  actionToTargetId,
  activateGuideTarget,
  scrollToGuideAction,
} from '../../utils/portfolioGuideTarget.js';
import '../../styles/portfolio-guide-mobile.css';

const MOBILE_SECTIONS = {
  keyAngles: SHORTCUT_SECTIONS.guidedRoutes,
  proofPoints: SHORTCUT_SECTIONS.directCases,
  search: SHORTCUT_SECTIONS.askAboutWork,
  openEvidence: SHORTCUT_SECTIONS.openEvidence,
  continueWith: SHORTCUT_SECTIONS.continueWith,
  allAngles: SHORTCUT_SECTIONS.allRoutes,
};

const SHEET_CLOSE_MS = 320;
const DRAG_CLOSE_PX = 88;

function useBodyScrollLock(locked) {
  const scrollYRef = useRef(0);

  useEffect(() => {
    if (!locked) return undefined;
    scrollYRef.current = window.scrollY;
    const { body } = document;
    body.style.position = 'fixed';
    body.style.top = `-${scrollYRef.current}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';
    body.style.overflow = 'hidden';

    return () => {
      const y = scrollYRef.current;
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.width = '';
      body.style.overflow = '';
      window.scrollTo(0, y);
    };
  }, [locked]);
}

/**
 * Touch-first Portfolio Shortcut — bottom chip + bottom sheet (mobile only).
 */
export function MobilePortfolioShortcut() {
  const chipRef = useRef(null);
  const sheetRef = useRef(null);
  const bodyRef = useRef(null);
  const closeBtnRef = useRef(null);
  const dragStartYRef = useRef(null);
  const dragOffsetRef = useRef(0);

  const [open, setOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [view, setView] = useState('home');
  const [angleId, setAngleId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [reducedMotion, setReducedMotion] = useState(false);

  useBodyScrollLock(open || closing);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const closeSheet = useCallback(() => {
    if (!open || closing) return;
    setClosing(true);
    window.setTimeout(() => {
      setOpen(false);
      setClosing(false);
      setView('home');
      setAngleId(null);
      chipRef.current?.focus();
    }, reducedMotion ? 0 : SHEET_CLOSE_MS);
  }, [open, closing, reducedMotion]);

  const openSheet = useCallback(() => {
    setClosing(false);
    setOpen(true);
    setView('home');
    setAngleId(null);
    window.requestAnimationFrame(() => {
      closeBtnRef.current?.focus();
    });
  }, []);

  const toggleSheet = useCallback(() => {
    if (open) closeSheet();
    else openSheet();
  }, [open, closeSheet, openSheet]);

  const openAngle = useCallback((routeId) => {
    setAngleId(routeId);
    setView('angle');
    bodyRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const returnHome = useCallback(() => {
    setView('home');
    setAngleId(null);
    bodyRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }, [reducedMotion]);

  const handleEvidenceClick = useCallback(
    (event, action) => {
      if (!action) return;
      event.preventDefault();
      scrollToGuideAction(action);
      const targetId = actionToTargetId(action);
      if (targetId && !targetId.startsWith('case-')) {
        activateGuideTarget(targetId);
      }
      closeSheet();
    },
    [closeSheet],
  );

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim().toLowerCase();
    if (!q) return;
    const match =
      SHORTCUT_ROUTES.find((r) => r.title.toLowerCase().includes(q) || r.question.toLowerCase().includes(q)) ??
      SHORTCUT_PROOF_POINTS.find((p) => p.title.toLowerCase().includes(q));
    if (match) {
      if ('id' in match && SHORTCUT_ROUTES.some((r) => r.id === match.id)) {
        openAngle(match.id);
      } else if (match.action) {
        handleEvidenceClick(e, match.action);
      }
    }
    setSearchQuery('');
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closeSheet();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, closeSheet]);

  const onDragStart = (clientY) => {
    dragStartYRef.current = clientY;
    dragOffsetRef.current = 0;
  };

  const onDragMove = (clientY) => {
    if (dragStartYRef.current == null || !sheetRef.current) return;
    const delta = Math.max(0, clientY - dragStartYRef.current);
    dragOffsetRef.current = delta;
    sheetRef.current.style.transform = `translate3d(0, ${delta}px, 0)`;
  };

  const onDragEnd = () => {
    if (dragOffsetRef.current > DRAG_CLOSE_PX) {
      closeSheet();
    } else if (sheetRef.current) {
      sheetRef.current.style.transform = '';
    }
    dragStartYRef.current = null;
    dragOffsetRef.current = 0;
  };

  const angleRoute = angleId ? getShortcutRoute(angleId) : null;
  const anglePanel = angleId ? getShortcutRoutePanel(angleId) : null;

  const shell = (
    <div
      className={[
        'mobile-shortcut',
        open ? 'is-open' : '',
        closing ? 'is-closing' : '',
        reducedMotion ? 'is-reduced-motion' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {!open ? (
        <button
          ref={chipRef}
          type="button"
          className="mobile-shortcut__chip"
          aria-label="Open Portfolio Shortcut"
          aria-expanded={open}
          onClick={toggleSheet}
        >
          <span className="mobile-shortcut__chip-dot" aria-hidden="true" />
          <span className="mobile-shortcut__chip-label">Shortcut</span>
        </button>
      ) : null}

      {open ? (
        <>
          <button
            type="button"
            className="mobile-shortcut__scrim"
            aria-label="Close Portfolio Shortcut"
            onClick={closeSheet}
          />
          <div
            ref={sheetRef}
            className="mobile-shortcut__sheet"
            role="dialog"
            aria-modal="true"
            aria-label="Portfolio Shortcut"
          >
            <div
              className="mobile-shortcut__handle"
              aria-hidden="true"
              onPointerDown={(e) => onDragStart(e.clientY)}
              onPointerMove={(e) => {
                if (e.buttons) onDragMove(e.clientY);
              }}
              onPointerUp={onDragEnd}
              onPointerCancel={onDragEnd}
            />

            <header className="mobile-shortcut__sheet-head">
              <div className="mobile-shortcut__sheet-head-copy">
                <h2 className="mobile-shortcut__sheet-title">{SHORTCUT_ENTRY.label}</h2>
                <p className="mobile-shortcut__sheet-tagline">{SHORTCUT_ENTRY.tagline}</p>
              </div>
              <button
                ref={closeBtnRef}
                type="button"
                className="mobile-shortcut__close"
                aria-label="Close Portfolio Shortcut"
                onClick={closeSheet}
              >
                <span aria-hidden="true">×</span>
              </button>
            </header>

            <div ref={bodyRef} className="mobile-shortcut__body">
              {view === 'home' ? (
                <>
                  <section className="mobile-shortcut__section" aria-label={MOBILE_SECTIONS.keyAngles}>
                    <h3 className="mobile-shortcut__section-label">{MOBILE_SECTIONS.keyAngles}</h3>
                    <ul className="mobile-shortcut__angle-grid mobile-shortcut__angle-grid--routes">
                      {SHORTCUT_ROUTES.map((route) => (
                        <li key={route.id}>
                          <button
                            type="button"
                            className="mobile-shortcut__angle-tile mobile-shortcut__route-row"
                            onClick={() => openAngle(route.id)}
                          >
                            <span className="mobile-shortcut__angle-eyebrow">{route.index}</span>
                            <span className="mobile-shortcut__angle-title">{route.title}</span>
                            <span className="mobile-shortcut__route-signal">{route.signal}</span>
                            <span className="mobile-shortcut__route-arrow" aria-hidden="true">↗</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="mobile-shortcut__section mobile-shortcut__section--cases" aria-label={MOBILE_SECTIONS.proofPoints}>
                    <h3 className="mobile-shortcut__section-label">{MOBILE_SECTIONS.proofPoints}</h3>
                    <p className="mobile-shortcut__case-strip">
                      {SHORTCUT_DIRECT_CASES.map((item, i) => (
                        <span key={item.id}>
                          {i > 0 ? ' · ' : ''}
                          <button
                            type="button"
                            className="mobile-shortcut__case-strip-link"
                            onClick={(e) => handleEvidenceClick(e, item.action)}
                          >
                            {item.label}
                          </button>
                        </span>
                      ))}
                    </p>
                  </section>

                  <section className="mobile-shortcut__section mobile-shortcut__section--search" aria-label={MOBILE_SECTIONS.search}>
                    <h3 className="mobile-shortcut__section-label">{MOBILE_SECTIONS.search}</h3>
                    <p className="mobile-shortcut__ask-helper">{SHORTCUT_ENTRY.askHelper}</p>
                    <form className="mobile-shortcut__search" onSubmit={handleSearchSubmit}>
                      <input
                        type="search"
                        enterKeyHint="search"
                        className="mobile-shortcut__search-input"
                        placeholder={SHORTCUT_ENTRY.freeInputPlaceholder}
                        aria-label={SHORTCUT_ENTRY.freeInputPlaceholder}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <button type="submit" className="mobile-shortcut__search-submit">
                        {SHORTCUT_ENTRY.submitLabel}
                      </button>
                    </form>
                  </section>
                </>
              ) : null}

              {view === 'angle' && angleRoute && anglePanel ? (
                <section className="mobile-shortcut__angle-result" aria-label={angleRoute.title}>
                  <button type="button" className="mobile-shortcut__back" onClick={returnHome}>
                    ← {MOBILE_SECTIONS.allAngles}
                  </button>
                  <h3 className="mobile-shortcut__result-title">{angleRoute.title}</h3>
                  <p className="mobile-shortcut__result-oneliner">{anglePanel.intro ?? anglePanel.meaning}</p>

                  <div className="mobile-shortcut__result-block">
                    <h4 className="mobile-shortcut__result-label">{MOBILE_SECTIONS.openEvidence}</h4>
                    <ul className="mobile-shortcut__evidence-list">
                      {anglePanel.evidence.map((row) => (
                        <li key={`${row.num}-${row.title}`}>
                          <button
                            type="button"
                            className="mobile-shortcut__evidence-row"
                            onClick={(e) => handleEvidenceClick(e, row.action)}
                          >
                            <span className="mobile-shortcut__evidence-copy">
                              <span className="mobile-shortcut__evidence-title">
                                {row.num} {row.title}
                              </span>
                              <span className="mobile-shortcut__evidence-signal">{row.signal}</span>
                            </span>
                            <span className="mobile-shortcut__evidence-arrow" aria-hidden="true">↗</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mobile-shortcut__result-block">
                    <h4 className="mobile-shortcut__result-label">{MOBILE_SECTIONS.continueWith}</h4>
                    <div className="mobile-shortcut__continue-chips">
                      {(anglePanel.continueRoutes ?? [])
                        .map((id) => SHORTCUT_ROUTES.find((r) => r.id === id))
                        .filter(Boolean)
                        .map((route) => (
                        <button
                          key={route.id}
                          type="button"
                          className="mobile-shortcut__continue-chip"
                          onClick={() => openAngle(route.id)}
                        >
                          {route.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(shell, getPortfolioGuidePortalNode());
  }
  return shell;
}
