import { useId } from 'react';
import { cases, overviewIntro } from '../data/cases.js';
import { CaseGraphic } from './CaseGraphic.jsx';
import { SectionHeader } from './SectionHeader.jsx';

function OverviewCaseCard({ c, onOpenCase }) {
  const rawId = useId();
  const filterId = `card-s1-${rawId.replace(/:/g, '')}`;

  return (
    <button type="button" className="case-card" onClick={() => onOpenCase(c.id)} aria-label={c.overview.openAria}>
      <div className="card-top">
        <div>
          <div className="card-num">{c.overview.num}</div>
          <h3 className="card-title">{c.overview.title}</h3>
        </div>
        <div className="layer-pill">{c.overview.layerPill}</div>
      </div>
      <div className="card-graphic">
        <CaseGraphic variant={c.overview.graphicVariant} cardFilterId={c.id === 'case01' ? filterId : undefined} />
      </div>
      <div className="card-bottom">
        <span className="signal-label">Signal</span>
        <span className="signal-text">{c.overview.signal}</span>
        <span className="card-arrow">Open →</span>
      </div>
    </button>
  );
}

export default function CaseOverview({ onOpenCase }) {
  return (
    <section className="overview" id="overview">
      <SectionHeader
        kicker={overviewIntro.kicker}
        titleLines={overviewIntro.titleLines}
        sub={overviewIntro.sub}
      />
      <div className="case-grid reveal">
        {cases.map((c) => (
          <OverviewCaseCard key={c.id} c={c} onOpenCase={onOpenCase} />
        ))}
      </div>
    </section>
  );
}
