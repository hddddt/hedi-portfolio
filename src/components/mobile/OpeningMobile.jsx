import { MobileHeroField } from './MobileHeroField.jsx';

const HERO_CHIPS = ['AI workflow', 'Decision traceability', 'Human-in-the-loop'];

/**
 * Mobile hero — stable first screen, normal document flow.
 */
export function OpeningMobile() {
  return (
    <section id="home-identity" className="mobile-opening" aria-label="Position">
      <MobileHeroField />
      <div className="mobile-opening__content">
        <p className="mobile-opening__name">HEDI</p>
        <h1 className="mobile-opening__headline">I turn complexity into product logic.</h1>
        <p className="mobile-opening__deck">
          Across AI and enterprise workflows, I structure requirements, roles, decisions, handoffs,
          and control points into usable product systems.
        </p>
        <ul className="mobile-opening__chips" aria-label="Focus areas">
          {HERO_CHIPS.map((chip) => (
            <li key={chip}>
              <span className="mobile-opening__chip">{chip}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
