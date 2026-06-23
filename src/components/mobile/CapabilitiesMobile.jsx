import { capabilitySectionCopy, homeCapabilities } from '../../data/homeScrollChapters.js';

/**
 * Mobile capabilities — stacked editorial blocks, no scroll theater.
 */
export function CapabilitiesMobile() {
  return (
    <div className="mobile-capabilities" aria-labelledby="mobile-cap-title">
      <header className="mobile-section-head">
        <h2 id="mobile-cap-title" className="mobile-section-head__title">
          {capabilitySectionCopy.title}
        </h2>
      </header>

      <ol className="mobile-capabilities__list">
        {homeCapabilities.map((cap) => (
          <li key={cap.id} className="mobile-capabilities__item" data-cap-id={cap.id}>
            <span className="mobile-capabilities__code">{cap.code}</span>
            <h3 className="mobile-capabilities__title">{cap.label}</h3>
            <p className="mobile-capabilities__positioning">{cap.positioning}</p>
            <ul className="mobile-capabilities__signals" aria-label={`${cap.label} signals`}>
              <li>{[...cap.pillsPrimary, ...cap.pillsSecondary].join(' · ')}</li>
            </ul>
          </li>
        ))}
      </ol>

      {capabilitySectionCopy.footer ? (
        <p className="mobile-capabilities__footer">{capabilitySectionCopy.footer}</p>
      ) : null}
    </div>
  );
}
