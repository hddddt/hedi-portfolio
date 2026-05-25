import { CaseAside } from './CaseAside.jsx';
import { CaseHero } from './CaseHero.jsx';
import { DecisionSection } from './DecisionSection.jsx';
import { OutcomeSection } from './OutcomeSection.jsx';

export default function CaseDetail({ data, isOpen }) {
  return (
    <section className={`case-expanded${isOpen ? ' open' : ''}`} id={data.id}>
      <div className="case-panel">
        <div className="case-shell">
          <CaseAside aside={data.aside} />
          <div className="case-body">
            <div className="case-hero">
              <CaseHero hero={data.hero} />
            </div>

            {data.decisionsIntro ? <p className="decisions-intro">{data.decisionsIntro}</p> : null}

            {data.decisions.map((d) => (
              <DecisionSection key={d.dTitle} d={d} />
            ))}

            <OutcomeSection outcome={data.outcome} />
          </div>
        </div>
      </div>
    </section>
  );
}
