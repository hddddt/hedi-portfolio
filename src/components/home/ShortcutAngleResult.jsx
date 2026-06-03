import { SHORTCUT_SECTIONS } from '../../data/portfolioGuideSystem.js';
import { getShortcutAngleResult } from '../../data/portfolioShortcutContent.js';

/**
 * @param {{
 *   angleId: string,
 *   onBack: () => void,
 *   onEvidencePointerEnter: (action: { type: string, id: string }) => void,
 *   onEvidencePointerLeave: (action: { type: string, id: string }) => void,
 *   onEvidenceClick: (event: React.MouseEvent, action: { type: string, id: string }) => void,
 *   onRouteClick: (event: React.MouseEvent, action: { type: string, id: string }) => void,
 * }} props
 */
export function ShortcutAngleResult({
  angleId,
  onBack,
  onEvidencePointerEnter,
  onEvidencePointerLeave,
  onEvidenceClick,
  onRouteClick,
}) {
  const result = getShortcutAngleResult(angleId);
  if (!result) return null;

  return (
    <section className="portfolio-guide__angle-result" aria-label={result.title}>
      <div className="portfolio-guide__result-nav">
        <button type="button" className="portfolio-guide__back portfolio-guide__back--nav" onClick={onBack}>
          ← Back
        </button>
      </div>

      <div className="portfolio-guide__angle-result-head">
        <h3 className="portfolio-guide__angle-result-title">{result.title}</h3>
        <p className="portfolio-guide__angle-result-sub">{result.subtitle}</p>
      </div>

      <div className="portfolio-guide__angle-result-card">
        <p className="portfolio-guide__block-label">{SHORTCUT_SECTIONS.shortAnswer}</p>
        <p className="portfolio-guide__angle-result-answer">{result.shortAnswer}</p>
      </div>

      {result.proofPoints.length ? (
        <div className="portfolio-guide__angle-result-proof">
          <p className="portfolio-guide__block-label">{SHORTCUT_SECTIONS.relatedProof}</p>
          <ul className="portfolio-guide__cards portfolio-guide__cards--compact">
            {result.proofPoints.map((item, cardIndex) => (
              <li key={item.label} className="portfolio-guide__card-item" style={{ '--card-i': cardIndex }}>
                <button
                  type="button"
                  className="portfolio-guide__card portfolio-guide__card--evidence"
                  onPointerEnter={() => onEvidencePointerEnter(item.action)}
                  onPointerLeave={() => onEvidencePointerLeave(item.action)}
                  onClick={(event) => onEvidenceClick(event, item.action)}
                >
                  <span className="portfolio-guide__card-copy">
                    <span className="portfolio-guide__card-title">{item.label}</span>
                    <span className="portfolio-guide__card-desc">{item.signal}</span>
                  </span>
                  <span className="portfolio-guide__card-arrow" aria-hidden="true">
                    ↗
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {result.continueRoutes.length ? (
        <div className="portfolio-guide__angle-result-continue">
          <p className="portfolio-guide__block-label portfolio-guide__block-label--secondary">
            {SHORTCUT_SECTIONS.continueWith}
          </p>
          <div className="portfolio-guide__route-chips portfolio-guide__route-chips--inline">
            {result.continueRoutes.map((route) => (
              <button
                key={route.label}
                type="button"
                className="portfolio-guide__route-chip"
                onClick={(event) => onRouteClick(event, route.action)}
              >
                {route.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
