import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { getShortcutRoute, getShortcutRoutePanel } from '../../data/portfolioShortcutContent.js';
import {
  ROUTE_PANEL_PIECE,
  animateRoutePanelEnter,
} from '../../utils/portfolioGuideMotion.js';
import { ShortcutRouteVisual } from './ShortcutRouteVisual.jsx';

gsap.registerPlugin(useGSAP);

/**
 * @param {{
 *   routeId: string,
 *   onBack: () => void,
 *   onEvidencePointerEnter: (action: { type: string, id: string }) => void,
 *   onEvidencePointerLeave: (action: { type: string, id: string }) => void,
 *   onEvidenceClick: (event: React.MouseEvent, action: { type: string, id: string }) => void,
 * }} props
 */
export function ShortcutRoutePanel({
  routeId,
  onBack,
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

  const panelClass = [
    'portfolio-guide__route-panel',
    `portfolio-guide__route-panel--${panel.visual}`,
  ].join(' ');

  return (
    <section ref={panelRef} className={panelClass} aria-label={route.title}>
      <nav
        className={`portfolio-guide__route-panel-nav ${ROUTE_PANEL_PIECE}`}
        aria-label="Breadcrumb"
      >
        <button type="button" className="portfolio-guide__back portfolio-guide__back--nav" onClick={onBack}>
          ← Back
        </button>
        <span className="portfolio-guide__route-breadcrumb">
          <span className="portfolio-guide__route-breadcrumb-root">Routes</span>
          <span aria-hidden="true"> / </span>
          <span className="portfolio-guide__route-breadcrumb-current">{route.title}</span>
        </span>
      </nav>

      <header className={`portfolio-guide__route-panel-head ${ROUTE_PANEL_PIECE}`}>
        <p className="portfolio-guide__route-eyebrow">{route.eyebrow}</p>
        <h3 className="portfolio-guide__route-panel-title">{route.title}</h3>
        <p className="portfolio-guide__route-panel-meaning">{panel.meaning}</p>
      </header>

      <div className={ROUTE_PANEL_PIECE}>
        <ShortcutRouteVisual kind={panel.visual} />
      </div>

      <div className={`portfolio-guide__route-primary ${ROUTE_PANEL_PIECE}`}>
        <button
          type="button"
          className="portfolio-guide__route-primary-btn"
          onPointerEnter={() => onEvidencePointerEnter(panel.primary.action)}
          onPointerLeave={() => onEvidencePointerLeave(panel.primary.action)}
          onClick={(event) => onEvidenceClick(event, panel.primary.action)}
        >
          <span className="portfolio-guide__route-primary-label">{panel.primary.label}</span>
          <span className="portfolio-guide__route-primary-helper">{panel.primary.helper}</span>
          <span className="portfolio-guide__route-primary-dest">{panel.primary.destinationLabel}</span>
          <span className="portfolio-guide__route-primary-arrow" aria-hidden="true">
            →
          </span>
        </button>
      </div>

      {panel.secondary.length ? (
        <ul className="portfolio-guide__route-secondary" aria-label="Related evidence">
          {panel.secondary.map((link) => (
            <li
              key={link.label}
              className={`portfolio-guide__route-secondary-item ${ROUTE_PANEL_PIECE}`}
            >
              <button
                type="button"
                className="portfolio-guide__route-secondary-btn"
                onPointerEnter={() => onEvidencePointerEnter(link.action)}
                onPointerLeave={() => onEvidencePointerLeave(link.action)}
                onClick={(event) => onEvidenceClick(event, link.action)}
              >
                <span className="portfolio-guide__route-secondary-label">{link.label}</span>
                <span className="portfolio-guide__route-secondary-relevance">{link.relevance}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {panel.tertiaryChip ? (
        <button
          type="button"
          className={`portfolio-guide__route-tertiary-chip ${ROUTE_PANEL_PIECE}`}
          title={panel.tertiaryChip.relevance}
          onPointerEnter={() => onEvidencePointerEnter(panel.tertiaryChip.action)}
          onPointerLeave={() => onEvidencePointerLeave(panel.tertiaryChip.action)}
          onClick={(event) => onEvidenceClick(event, panel.tertiaryChip.action)}
        >
          {panel.tertiaryChip.label}
        </button>
      ) : null}
    </section>
  );
}
