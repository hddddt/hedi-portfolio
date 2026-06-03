/**
 * Portfolio Shortcut — compressed orb-family edge presence (not avatar / button).
 */
export function ShortcutMarkerArt({ className = '' }) {
  return (
    <span className={`portfolio-guide__marker-visual ${className}`.trim()} aria-hidden="true">
      <span className="portfolio-guide__marker-field portfolio-guide__marker-field--green" />
      <span className="portfolio-guide__marker-field portfolio-guide__marker-field--blue" />
      <span className="portfolio-guide__marker-field portfolio-guide__marker-field--amber" />
      <span className="portfolio-guide__marker-core" />
      <span className="portfolio-guide__marker-edge-seam" aria-hidden="true" />
      <span className="portfolio-guide__marker-edge-fade" />
    </span>
  );
}

/** @deprecated */
export const ShortcutCompanionArt = ShortcutMarkerArt;
export const ShortcutCreatureArt = ShortcutMarkerArt;
