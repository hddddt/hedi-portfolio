/**
 * Portfolio Shortcut — horizontal 3D signal gem (default visible, not hover-only).
 */
export function ShortcutMarkerArt({ className = '' }) {
  return (
    <span className={`portfolio-guide__marker-visual ${className}`.trim()} aria-hidden="true">
      <span className="portfolio-guide__marker-halo" aria-hidden="true" />
      <span className="portfolio-guide__marker-body" aria-hidden="true" />
      <span className="portfolio-guide__marker-core" aria-hidden="true" />
      <span className="portfolio-guide__marker-edge-seam" aria-hidden="true" />
    </span>
  );
}

/** @deprecated */
export const ShortcutCompanionArt = ShortcutMarkerArt;
export const ShortcutCreatureArt = ShortcutMarkerArt;
