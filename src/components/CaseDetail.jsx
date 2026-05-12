import { getCaseById } from '../data/cases.js';
import { CaseGraphic } from './CaseGraphic.jsx';

function RichText({ parts }) {
  return (
    <>
      {parts.map((p, i) => (p.bold ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
    </>
  );
}

function SlotName({ lines }) {
  const els = [];
  lines.forEach((line, i) => {
    if (line === '') {
      els.push(<br key={`${i}-e1`} />);
      els.push(<br key={`${i}-e2`} />);
      return;
    }
    if (line === '+') {
      els.push(<br key={`${i}-p1`} />);
      els.push('+');
      els.push(<br key={`${i}-p2`} />);
      return;
    }
    if (els.length) {
      const prev = lines[i - 1];
      if (prev !== '' && prev !== '+') {
        els.push(<br key={`${i}-j`} />);
      }
    }
    els.push(line);
  });
  return <span className="slot-name">{els}</span>;
}

function DecisionBlock({ d }) {
  const evidenceCard = (
    <div className="evidence-card">
      <div className="ev-title">{d.evidenceTitle}</div>
      <div className="image-slot large">
        <SlotName lines={d.slotLines} />
      </div>
    </div>
  );

  const readout = (
    <div className="readout">
      {d.readout.map((item, idx) =>
        item.proof ? (
          <div key={idx} className="proof">
            {item.proof}
          </div>
        ) : (
          <div key={idx}>
            <div className="ro-label">{item.label}</div>
            <p className="ro-text">
              <RichText parts={item.parts} />
            </p>
          </div>
        ),
      )}
    </div>
  );

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

export default function CaseDetail({ data, isOpen, onClose, onSwitch }) {
  const prevCase = getCaseById(data.prevId);
  const nextCase = getCaseById(data.nextId);
  const a = data.aside;

  return (
    <section className={`case-expanded${isOpen ? ' open' : ''}`} id={data.id}>
      <div className="case-bar">
        <div className="cb-left">
          <span className="cb-num">{data.bar.num}</span>
          <span className="cb-title">{data.bar.title}</span>
          <span className="cb-layer">{data.bar.layer}</span>
        </div>
        <div className="cb-actions">
          <button
            type="button"
            className="cb-switch"
            onClick={() => onSwitch(data.prevId)}
            aria-label={`Go to previous case`}
          >
            ← {prevCase?.overview.num}
          </button>
          <button type="button" className="cb-back" onClick={onClose}>
            Overview
          </button>
          <button
            type="button"
            className="cb-switch"
            onClick={() => onSwitch(data.nextId)}
            aria-label={`Go to next case`}
          >
            {nextCase?.overview.num} →
          </button>
        </div>
      </div>
      <div className="case-panel">
        <div className="case-shell">
          <aside className="case-aside">
            <div className="aside-num">{a.num}</div>
            <h2 className="aside-title">{a.title}</h2>
            <div className="aside-layer">{a.layer}</div>
            <p className="aside-judge">
              <b>{a.judgeLead}</b>
              <br />
              {a.judgeRest}
            </p>
            <div className="aside-label">Decision path</div>
            <div className="aside-path">
              {a.path.map((step) => (
                <div key={step.n}>
                  <span>{step.n}</span>
                  <span>{step.t}</span>
                </div>
              ))}
            </div>
            <div className="aside-label">Signal</div>
            <p className="aside-signal">{a.signal}</p>
            <div className="aside-tags">
              {a.tags.map((t) => (
                <span key={t}>{t}</span>
              ))}
            </div>
          </aside>
          <div className="case-body">
            <div className="case-hero">
              <div className="case-hero-copy reveal">
                <div>
                  <div className="case-kicker">{data.hero.kicker}</div>
                  <h2 className="case-title">{data.hero.title}</h2>
                </div>
                <p className="case-intro">{data.hero.intro}</p>
              </div>
              <div className="hero-graphic reveal">
                <CaseGraphic variant={data.hero.graphicVariant} />
                <p className="hero-caption">{data.hero.caption}</p>
              </div>
            </div>

            {data.decisions.map((d) => (
              <DecisionBlock key={d.dTitle} d={d} />
            ))}

            <section className="outcome reveal">
              <div>
                <h3>Outcome</h3>
              </div>
              <div>
                <p>{data.outcome.paragraph}</p>
                <div className="hiring">
                  <div className="hiring-label">Hiring signal</div>
                  <div className="hiring-text">{data.outcome.hiring}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}
