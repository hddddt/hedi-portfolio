import { EvidenceCard } from './EvidenceCard.jsx';
import { Readout } from './Readout.jsx';

export function DecisionSection({ d }) {
  const evidenceCard = (
    <EvidenceCard evidenceTitle={d.evidenceTitle} slotLines={d.slotLines} />
  );

  const readout = <Readout items={d.readout} />;

  const gridClass = `evidence-grid${d.flip ? ' flip' : ''}`;

  return (
    <section className="decision reveal">
      <div className="decision-head">
        <div>
          <div className="d-num">{d.dNum}</div>
          <h3 className="d-title">{d.dTitle}</h3>
          <p className="d-thesis">{d.dThesis}</p>
        </div>
        <div className="notbut">
          {d.nb.map((row, j) => (
            <div key={`${d.dNum}-${j}`} className={`nb${row.but ? ' but' : ''}`}>
              <strong>{row.strong}</strong>
              <span>{row.text}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={gridClass}>
        {d.flip ? (
          <>
            {readout}
            {evidenceCard}
          </>
        ) : (
          <>
            {evidenceCard}
            {readout}
          </>
        )}
      </div>
    </section>
  );
}
