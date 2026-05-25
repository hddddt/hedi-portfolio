import { overviewIntro } from '../../data/cases.js';
import { SectionHeader } from '../SectionHeader.jsx';
import { SelectedWorkCaseBlock } from './SelectedWorkCaseBlock.jsx';
import { selectedWorkCases } from '../../data/portfolio.js';

export function SelectedWorkSection({ onOpenCase }) {
  return (
    <section className="portfolio-section portfolio-section--work selected-work" id="selected-work" aria-label={overviewIntro.kicker}>
      <div className="selected-work__inner">
        <SectionHeader
          kicker={overviewIntro.kicker}
          titleLines={overviewIntro.titleLines}
          sub={overviewIntro.sub}
        />
        <div className="selected-work-sequence">
          {selectedWorkCases.map((item) => (
            <SelectedWorkCaseBlock key={item.id} item={item} onOpenCase={onOpenCase} />
          ))}
        </div>
      </div>
    </section>
  );
}
