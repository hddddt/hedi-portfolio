import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import {
  SHORTCUT_ROUTES,
  getShortcutRoute,
  getShortcutRoutePanel,
} from '../../data/portfolioShortcutContent.js';
import { SHORTCUT_SECTIONS } from '../../data/portfolioGuideSystem.js';
import {
  ROUTE_PANEL_PIECE,
  animateRoutePanelEnter,
} from '../../utils/portfolioGuideMotion.js';

gsap.registerPlugin(useGSAP);

/**
 * @param {{
 *   routeId: string,
 *   onBack: () => void,
 *   onRouteSelect: (routeId: string) => void,
 *   onEvidencePointerEnter: (action: { type: string, id: string }) => void,
 *   onEvidencePointerLeave: (action: { type: string, id: string }) => void,
 *   onEvidenceClick: (event: React.MouseEvent, action: { type: string, id: string }) => void,
 * }} props
 */
export function ShortcutRoutePanel({
  routeId,
  onBack,
  onRouteSelect,
  onEvidencePointerEnter,
  onEvidencePointerLeave,
  onEvidenceClick,
}) {
  const panelRef = useRef(null);
  const route = getShortcutRoute(routeId);
  const panel = getShortcutRoutePanel(routeId);

  useGSAP(
    () => {
      const root = panelRef.current;
      if (!root) return undefined;
      const pieces = gsap.utils.toArray(`.${ROUTE_PANEL_PIECE}`, root);
      return animateRoutePanelEnter(root, pieces);
    },
    { scope: panelRef, dependencies: [routeId], revertOnUpdate: true },
  );

  if (!route || !panel) return null;

  const continueRoutes = (panel.continueRoutes ?? [])
    .map((id) => SHORTCUT_ROUTES.find((r) => r.id === id))
    .filter(Boolean);

  return (
    <section ref={panelRef} className="portfolio-guide__route-panel" aria-label={route.title}>
      <nav className="portfolio-guide__route-panel-nav" aria-label="Back">
        <button type="button" className="portfolio-guide__back portfolio-guide__back--nav" onClick={onBack}>
          ← {SHORTCUT_SECTIONS.allRoutes}
        </button>
      </nav>

      <header className={`portfolio-guide__route-panel-head ${ROUTE_PANEL_PIECE}`}>
        <h3 className="portfolio-guide__route-panel-title">{route.title}</h3>
        <p className="portfolio-guide__route-panel-meaning">{panel.intro ?? panel.meaning}</p>
      </header>

      <div className={`portfolio-guide__route-evidence ${ROUTE_PANEL_PIECE}`}>
        <p className="portfolio-guide__route-evidence-landmark">{SHORTCUT_SECTIONS.openEvidence}</p>
        <ul className="portfolio-guide__route-evidence-list">
          {panel.evidence.map((row) => (
            <li key={`${row.num}-${row.title}`}>
              <button
                type="button"
                className="portfolio-guide__route-evidence-link"
                onPointerEnter={() => onEvidencePointerEnter(row.action)}
                onPointerLeave={() => onEvidencePointerLeave(row.action)}
                onClick={(event) => onEvidenceClick(event, row.action)}
              >
                <span className="portfolio-guide__route-evidence-copy">
                  <span className="portfolio-guide__route-evidence-num">{row.num}</span>
                  <span className="portfolio-guide__route-evidence-text">
                    <span className="portfolio-guide__route-evidence-label">{row.title}</span>
                    <span className="portfolio-guide__route-evidence-signal">{row.signal}</span>
                  </span>
                </span>
                <span className="portfolio-guide__route-evidence-arrow" aria-hidden="true">
                  ↗
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {continueRoutes.length ? (
        <div className={`portfolio-guide__route-continue ${ROUTE_PANEL_PIECE}`}>
          <p className="portfolio-guide__route-continue-label">{SHORTCUT_SECTIONS.continueWith}:</p>
          <div className="portfolio-guide__route-continue-chips">
            {continueRoutes.map((nextRoute) => (
              <button
                key={nextRoute.id}
                type="button"
                className="portfolio-guide__route-continue-chip"
                onClick={() => onRouteSelect(nextRoute.id)}
              >
                {nextRoute.title}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
