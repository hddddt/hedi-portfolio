import { ValueCard } from './ValueCard.jsx';
import { valueCards, valueSectionIntro } from '../../data/portfolio.js';

export function ValueSection() {
  return (
    <section
      className="portfolio-section portfolio-section--value"
      id="value"
      aria-labelledby="value-section-title"
    >
      <div className="portfolio-section__inner portfolio-section__inner--value">
        <header className="value-section__head reveal">
          <h2 className="value-section__title" id="value-section-title">
            {valueSectionIntro.title}
          </h2>
          <p className="value-section__subtitle">{valueSectionIntro.subtitle}</p>
        </header>
        <div className="value-grid">
          {valueCards.map((card) => (
            <ValueCard
              key={card.id}
              num={card.num}
              title={card.title}
              explanation={card.explanation}
              tags={card.tags}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
