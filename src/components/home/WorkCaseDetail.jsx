import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/case01-staged.css';
import { WORK_CASE_DETAIL } from '../../data/workCaseDetailContent.js';
import { Case01StagedFlow } from './Case01StagedFlow.jsx';

function caseDockLabel(num) {
  const digits = String(num ?? '').replace(/\D/g, '');
  if (!digits) return '—';
  return digits.padStart(2, '0').slice(-2);
}

function TextBlocks({ text, className = 'work-case-detail__p' }) {
  if (!text) return null;
  return text.split('\n\n').map((block) => (
    <p key={block.slice(0, 48)} className={className}>
      {block.split('\n').map((line, i, arr) => (
        <span key={`${block}-${line}`}>
          {line}
          {i < arr.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  ));
}

function Paragraphs({ items, className = 'work-case-detail__p' }) {
  if (!items?.length) return null;
  return items.map((p) => (
    <p key={p.slice(0, 48)} className={className}>
      {p.split('\n').map((line, i, arr) => (
        <span key={line}>
          {line}
          {i < arr.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  ));
}

function ValueField({ label, children }) {
  return (
    <div className="work-case-detail__field">
      <h3 className="work-case-detail__field-label">{label}</h3>
      <div className="work-case-detail__field-body">{children}</div>
    </div>
  );
}

function EvidenceSection({ title, children }) {
  return (
    <section className="work-case-detail__section">
      <h3 className="work-case-detail__section-title">{title}</h3>
      <div className="work-case-detail__section-body">{children}</div>
    </section>
  );
}

function ShiftBlock({ shiftLead, shiftFrom, shiftTo }) {
  if (!shiftFrom) return null;
  return (
    <>
      {shiftLead ? <p className="work-case-detail__p work-case-detail__p--label">{shiftLead}</p> : null}
      <blockquote className="work-case-detail__shift">
        <p className="work-case-detail__shift-from">{shiftFrom}</p>
        <p className="work-case-detail__shift-to">{shiftTo}</p>
      </blockquote>
    </>
  );
}

function FlowDiagram({ diagram }) {
  if (!diagram) return null;
  return (
    <figure className="work-case-detail__flow-diagram">
      <div className="work-case-detail__flow-diagram__placeholder" aria-hidden="true">
        <span className="work-case-detail__flow-diagram__hint">Visual should appear here</span>
      </div>
      <div className="work-case-detail__flow-stages">
        {diagram.stages.map((stage, i) => (
          <div key={stage.label} className="work-case-detail__flow-stage">
            <p className="work-case-detail__flow-stage-label">{stage.label}</p>
            <p className="work-case-detail__flow-stage-detail">{stage.detail}</p>
            {i < diagram.stages.length - 1 ? (
              <span className="work-case-detail__flow-arrow" aria-hidden="true">
                →
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <figcaption className="work-case-detail__flow-caption">{diagram.caption}</figcaption>
    </figure>
  );
}

function DataTable({ table }) {
  if (!table) return null;
  return (
    <div className="work-case-detail__table-wrap">
      <table className="work-case-detail__table">
        <thead>
          <tr>
            {table.headers.map((h) => (
              <th key={h} scope="col">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => (
            <tr key={row.join('-')}>
              {row.map((cell) => (
                <td key={cell}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DesignDecisionBlock({ decision }) {
  return (
    <div
      className={`work-case-detail__decision${
        decision.emphasis === 'strong' ? ' work-case-detail__decision--strong' : ''
      }`}
    >
      {decision.lead ? <p className="work-case-detail__decision-lead">{decision.lead}</p> : null}
      <Paragraphs items={decision.paragraphs} className="work-case-detail__p" />
      {decision.pullQuote ? (
        <blockquote
          className={`work-case-detail__pullquote${
            decision.emphasis === 'quote' ? ' work-case-detail__pullquote--featured' : ''
          }`}
        >
          {decision.pullQuote.split('\n').map((line, i, arr) => (
            <span key={line}>
              {line}
              {i < arr.length - 1 ? <br /> : null}
            </span>
          ))}
        </blockquote>
      ) : null}
    </div>
  );
}

function HeroAnswerStateModel({ hero }) {
  return (
    <figure className="work-case-detail__hero-evidence">
      <h4 className="work-case-detail__hero-evidence-title">{hero.title}</h4>
      <div className="work-case-detail__state-model">
        <div className="work-case-detail__state-track">
          {hero.states.map((state, i) => (
            <div key={state.label} className="work-case-detail__state-step">
            <div className="work-case-detail__state-card">
              <p className="work-case-detail__state-label">{state.label}</p>
              {state.lines.map((line) => (
                <p key={line} className="work-case-detail__state-line">
                  {line}
                </p>
              ))}
            </div>
            {i < hero.states.length - 1 ? (
              <span className="work-case-detail__state-arrow" aria-hidden="true">
                ↓
              </span>
            ) : null}
            </div>
          ))}
        </div>
        <ul className="work-case-detail__state-labels" aria-label="State dimensions">
          {hero.sideLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
      <figcaption className="work-case-detail__hero-caption">{hero.caption}</figcaption>
    </figure>
  );
}

function CaseMapColumn({ map, activeSection, onNavClick }) {
  const rail = map.railMode;
  const decisions = map.readingMap.decisions ?? [];
  const provesLabel = map.provesLabel ?? 'Why this layer matters';

  return (
    <aside
      className={`work-case-detail__value${rail ? ' work-case-detail__value--rail' : ''}`}
      aria-label="AI Case Map"
    >
      {!rail ? <p className="work-case-detail__column-tag">AI Case Map</p> : null}
      <ValueField label="Case Title">
        <h2 className="work-case-detail__case-title" id="work-case-detail-title">
          {map.caseTitle}
        </h2>
      </ValueField>
      <ValueField label="AI Value Layer">
        <p className="work-case-detail__layer-name">{map.aiValueLayer}</p>
      </ValueField>
      <ValueField label={provesLabel}>
        <p className="work-case-detail__rail-why work-case-detail__rail-proves">{map.whyLayerMatters}</p>
      </ValueField>
      <ValueField label={map.readingMap.navLabel ?? 'ON THIS CASE'}>
        <nav className="work-case-detail__rail-nav" aria-label="On this case">
          {decisions.map((item) => {
            const slug = item.slug ?? item.num;
            const dLabel = item.d ?? item.num;
            const isActive = activeSection === slug;
            return (
              <a
                key={slug}
                href={`#case01-${slug}`}
                className={`work-case-detail__rail-nav-item${isActive ? ' work-case-detail__rail-nav-item--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  onNavClick?.(slug);
                }}
              >
                <span className="work-case-detail__rail-nav-num">{dLabel}</span>
                <span className="work-case-detail__rail-nav-title">{item.title}</span>
              </a>
            );
          })}
        </nav>
      </ValueField>
      {!rail ? (
        <ValueField label="Key Signals">
          <ul className="work-case-detail__signals">
            {map.keySignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </ValueField>
      ) : (
        <div className="work-case-detail__rail-signals">
          <p className="work-case-detail__rail-signals-label">Key signals</p>
          <p className="work-case-detail__rail-signals-line">{map.keySignals.join(' · ')}</p>
        </div>
      )}
    </aside>
  );
}

function EvidenceFlowColumn({ evidence, caseId }) {
  if (caseId === 'case01' && evidence?.staged) {
    return (
      <div className="work-case-detail__evidence-inner work-case-detail__evidence-inner--staged">
        <Case01StagedFlow />
      </div>
    );
  }

  return (
    <div className="work-case-detail__evidence-inner">
      <p className="work-case-detail__column-tag">Project Evidence Flow</p>

      <EvidenceSection title="Project Context">
        <TextBlocks text={evidence.projectContext.lead} />
        {evidence.projectContext.items?.map((item) => (
          <div key={item.title} className="work-case-detail__context-item">
            <p className="work-case-detail__context-title">{item.title}</p>
            <p className="work-case-detail__p">{item.body}</p>
          </div>
        ))}
        {evidence.projectContext.bullets?.length ? (
          <ul className="work-case-detail__list work-case-detail__list--compact">
            {evidence.projectContext.bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <Paragraphs items={evidence.projectContext.paragraphs} />
        {evidence.projectContext.takeaway ? (
          <p className="work-case-detail__takeaway">{evidence.projectContext.takeaway}</p>
        ) : null}
      </EvidenceSection>

      <EvidenceSection title="Default Direction">
        <TextBlocks text={evidence.defaultDirection.lead} />
        {evidence.defaultDirection.bullets?.length ? (
          <ul className="work-case-detail__list work-case-detail__list--compact">
            {evidence.defaultDirection.bullets.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        ) : null}
        <Paragraphs items={evidence.defaultDirection.paragraphs} />
      </EvidenceSection>

      <EvidenceSection title="Turning Point">
        <Paragraphs items={evidence.turningPoint.paragraphs} />
        <FlowDiagram diagram={evidence.turningPoint.flowDiagram} />
        <ShiftBlock
          shiftLead={evidence.turningPoint.shiftLead}
          shiftFrom={evidence.turningPoint.shiftFrom}
          shiftTo={evidence.turningPoint.shiftTo}
        />
      </EvidenceSection>

      <EvidenceSection title="Design Decision">
        <DesignDecisionBlock decision={evidence.designDecision} />
      </EvidenceSection>

      <EvidenceSection title="What I Designed">
        <ol className="work-case-detail__designed">
          {evidence.whatIDesigned.map((item) => (
            <li key={item.num} className="work-case-detail__designed-item">
              <p className="work-case-detail__designed-head">
                <span className="work-case-detail__designed-num">{item.num}</span>
                <span className="work-case-detail__designed-sep" aria-hidden="true">
                  ·
                </span>
                <span className="work-case-detail__designed-title">{item.title}</span>
              </p>
              <TextBlocks text={item.body} />
              <p className="work-case-detail__design-value">
                <span className="work-case-detail__design-value-label">Design value</span>
                {item.designValue}
              </p>
            </li>
          ))}
        </ol>
      </EvidenceSection>

      {evidence.heroEvidence ? (
        <div className="work-case-detail__section work-case-detail__section--hero">
          <HeroAnswerStateModel hero={evidence.heroEvidence} />
        </div>
      ) : null}

      <EvidenceSection title="Evidence Modules">
        <ul className="work-case-detail__visuals">
          {evidence.evidenceModules.map((mod) => (
            <li key={mod.label ?? mod.title} className="work-case-detail__visual">
              <p className="work-case-detail__visual-label">
                {mod.label ? `${mod.label}｜` : ''}
                {mod.title}
              </p>
              {mod.whatToShow ? (
                <p className="work-case-detail__visual-what">
                  <span className="work-case-detail__visual-what-label">What to show</span>
                  {mod.whatToShow}
                </p>
              ) : null}
              {mod.table ? <DataTable table={mod.table} /> : null}
              {mod.hierarchyTables ? (
                <div className="work-case-detail__hierarchy">
                  <p className="work-case-detail__hierarchy-label">Before:</p>
                  <DataTable table={mod.hierarchyTables.before} />
                  <p className="work-case-detail__hierarchy-label">After:</p>
                  <DataTable table={mod.hierarchyTables.after} />
                </div>
              ) : null}
              {mod.image ? (
                <figure className="work-case-detail__artifact-frame">
                  <img
                    src={mod.image}
                    alt={mod.alt ?? mod.title}
                    className="work-case-detail__artifact-img"
                    loading="lazy"
                    decoding="async"
                  />
                </figure>
              ) : (
                <div className="work-case-detail__visual-placeholder" aria-hidden="true" />
              )}
              {mod.caption ? (
                <figcaption className="work-case-detail__visual-caption">
                  <span className="work-case-detail__visual-caption-label">Caption</span>
                  {mod.caption}
                </figcaption>
              ) : null}
            </li>
          ))}
        </ul>
      </EvidenceSection>

      <EvidenceSection title="Resulting Value">
        <Paragraphs items={evidence.resultingValue.paragraphs} />
      </EvidenceSection>

      <p className={`work-case-detail__closing work-case-detail__closing--${caseId}`}>
        {evidence.closingLine}
      </p>
    </div>
  );
}

export function WorkCaseDetail({ item, allCases = [], onClose, onSelectCase }) {
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState('d1');
  const detail = WORK_CASE_DETAIL[item.id];
  const siblings = allCases.filter((c) => c.id !== item.id);
  const caseMap = detail?.caseMap;
  const evidence = detail?.evidence;
  const isCase01 = item.id === 'case01';

  const scrollToSection = useCallback((slug) => {
    const root = scrollRef.current;
    const target = document.getElementById(`case01-${slug}`);
    if (!root || !target) return;
    const top = target.offsetTop - root.offsetTop - 12;
    root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    setActiveSection(slug);
  }, []);

  useEffect(() => {
    if (!isCase01) return undefined;
    const root = scrollRef.current;
    if (!root) return undefined;

    const sectionSlugs = ['d1', 'd2', 'd3'];
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id.replace('case01-', ''));
        }
      },
      { root, rootMargin: '-12% 0px -52% 0px', threshold: [0.08, 0.2, 0.45] },
    );

    sectionSlugs.forEach((slug) => {
      const el = document.getElementById(`case01-${slug}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isCase01, item.id]);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('work-case-detail-open');
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove('work-case-detail-open');
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    if (isCase01) setActiveSection('d1');
  }, [item.id, isCase01]);

  if (!caseMap || !evidence) return null;

  return createPortal(
    <div
      className="work-case-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-case-detail-title"
    >
      <div className="work-case-detail">
        <div className="work-case-detail__toolbar">
          <button type="button" className="work-case-detail__back" onClick={onClose}>
            ← Back to work
          </button>
        </div>

        <div className="work-case-detail__shell">
          <CaseMapColumn
            map={caseMap}
            activeSection={isCase01 ? activeSection : undefined}
            onNavClick={isCase01 ? scrollToSection : undefined}
          />

          <div ref={scrollRef} className="work-case-detail__scroll" tabIndex={-1}>
            <EvidenceFlowColumn evidence={evidence} caseId={item.id} />
          </div>
        </div>

        {siblings.length > 0 ? (
          <nav className="work-case-detail__dock" aria-label="Other case studies">
            <div className="work-case-detail__dock-inner">
              {siblings.map((sibling) => (
                <button
                  key={sibling.id}
                  type="button"
                  className="work-case-detail__dock-btn"
                  onClick={() => onSelectCase?.(sibling.id)}
                  aria-label={`View case ${caseDockLabel(sibling.num)}`}
                >
                  {caseDockLabel(sibling.num)}
                </button>
              ))}
            </div>
          </nav>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
