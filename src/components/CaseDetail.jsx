import { getCaseById } from '../data/cases.js';
import { CaseAside } from './CaseAside.jsx';
import { CaseBar } from './CaseBar.jsx';
import { CaseHero } from './CaseHero.jsx';
import { DecisionSection } from './DecisionSection.jsx';
import { OutcomeSection } from './OutcomeSection.jsx';

export default function CaseDetail({ data, isOpen, onClose, onSwitch }) {
  const prevCase = getCaseById(data.prevId);
  const nextCase = getCaseById(data.nextId);

  return (
    <section className={`case-expanded${isOpen ? ' open' : ''}`} id={data.id}>
      <CaseBar
        bar={data.bar}
        prevCase={prevCase}
        nextCase={nextCase}
        prevId={data.prevId}
        nextId={data.nextId}
        onClose={onClose}
        onSwitch={onSwitch}
      />
      <div className="case-panel">
        <div className="case-shell">
          <CaseAside aside={data.aside} />
          <div className="case-body">
            <div className="case-hero">
              <CaseHero hero={data.hero} />
            </div>

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
