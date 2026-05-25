import { approachSteps, designApproachIntro } from '../../data/portfolio.js';

export function DesignApproachSection() {
  return (
    <section
      className="portfolio-section portfolio-section--approach design-approach"
      id="approach"
      aria-labelledby="design-approach-title"
    >
      <div className="design-approach__inner">
        <header className="design-approach__head reveal">
          <h2 className="design-approach__title" id="design-approach-title">
            {designApproachIntro.title}
          </h2>
          <p className="design-approach__subtitle">{designApproachIntro.subtitle}</p>
        </header>

        <ol className="method-process">
          {approachSteps.map((s) => (
            <li key={s.id} className="method-process__step reveal">
              <div className="method-process__rail" aria-hidden="true">
                <span className="method-process__node" />
              </div>
              <div className="method-process__content">
                <span className="method-process__num">{s.step}</span>
                <h3 className="method-process__title">{s.title}</h3>
                <p className="method-process__text">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
