/**
 * Lightweight hero atmosphere for mobile — layered CSS orb (no WebGL).
 * Mirrors desktop signal-green mass: solid body, top-left sheen, outer mist.
 */
export function MobileHeroField() {
  return (
    <div className="mobile-hero-field" aria-hidden="true">
      <div className="mobile-hero-field__wash" />
      <div className="mobile-hero-field__orb">
        <div className="mobile-hero-field__orb-mist" />
        <div className="mobile-hero-field__orb-glow" />
        <div className="mobile-hero-field__orb-body">
          <div className="mobile-hero-field__orb-sheen" />
          <div className="mobile-hero-field__orb-depth" />
        </div>
      </div>
    </div>
  );
}
