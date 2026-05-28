import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/case01-staged.css';
import { WORK_CASE_DETAIL } from '../../data/workCaseDetailContent.js';
import { CASE01_FLOW } from '../../data/workCaseDetailCase01.js';
import { CASE02_FLOW } from '../../data/workCaseDetailCase02.js';
import { CASE03_FLOW } from '../../data/workCaseDetailCase03.js';
import { CASE04_FLOW } from '../../data/workCaseDetailCase04.js';
import { StagedCaseFlow } from './Case01StagedFlow.jsx';
import { HeroAnswerStateModel } from './HeroAnswerStateModel.jsx';

const STAGED_CASE_FLOW = {
  case01: CASE01_FLOW,
  case02: CASE02_FLOW,
  case03: CASE03_FLOW,
  case04: CASE04_FLOW,
};

const CASE_SWITCHER_ORDER = ['case01', 'case02', 'case03', 'case04'];

function isStagedCaseId(caseId, evidence) {
  if (!evidence?.staged) return false;
  return caseId === 'case01' || caseId === 'case02' || caseId === 'case03' || caseId === 'case04';
}

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

function CaseMapColumn({ map, activeSection, onNavClick, sectionPrefix = 'case01' }) {
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
                href={`#${sectionPrefix}-${slug}`}
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
  if (isStagedCaseId(caseId, evidence)) {
    const flow = STAGED_CASE_FLOW[caseId];
    if (!flow) {
      return (
        <div className="work-case-detail__evidence-inner work-case-detail__evidence-inner--staged">
          <p className="work-case-detail__p">Staged flow unavailable.</p>
        </div>
      );
    }
    return (
      <div className="work-case-detail__evidence-inner work-case-detail__evidence-inner--staged">
        <StagedCaseFlow flow={flow} sectionPrefix={caseId} />
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
  const switcherCases = CASE_SWITCHER_ORDER.map((id) => allCases.find((c) => c.id === id)).filter(
    (c) => c && WORK_CASE_DETAIL[c.id],
  );
  const caseMap = detail?.caseMap;
  const evidence = detail?.evidence;
  const isStagedCase = isStagedCaseId(item.id, evidence);
  const sectionPrefix = item.id;

  const scrollToSection = useCallback(
    (slug) => {
      const root = scrollRef.current;
      const target = document.getElementById(`${sectionPrefix}-${slug}`);
      if (!root || !target) return;
      const top = target.offsetTop - root.offsetTop - 80;
      root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setActiveSection(slug);
    },
    [sectionPrefix],
  );

  useEffect(() => {
    if (!isStagedCase) return undefined;
    const root = scrollRef.current;
    if (!root) return undefined;

    const sectionSlugs = ['d1', 'd2', 'd3'];
    const prefix = `${sectionPrefix}-`;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) {
          setActiveSection(visible[0].target.id.replace(prefix, ''));
        }
      },
      { root, threshold: 0.3 },
    );

    sectionSlugs.forEach((slug) => {
      const el = document.getElementById(`${sectionPrefix}-${slug}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [isStagedCase, sectionPrefix]);

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
    if (isStagedCase) setActiveSection('d1');
  }, [item.id, isStagedCase]);

  if (!caseMap || !evidence) return null;

  return createPortal(
    <div
      className="work-case-detail-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-case-detail-title"
    >
      <header className="work-case-detail__topbar">
        <button type="button" className="work-case-detail__back" onClick={onClose}>
          ← Back to Work
        </button>
        {switcherCases.length > 1 ? (
          <nav className="work-case-detail__case-switcher" aria-label="Case studies">
            {switcherCases.map((navCase, index) => {
              const label = caseDockLabel(navCase.num);
              const isCurrent = navCase.id === item.id;
              return (
                <span key={navCase.id} className="work-case-detail__case-switcher-item">
                  {index > 0 ? (
                    <span className="work-case-detail__case-switcher-divider" aria-hidden="true">
                      |
                    </span>
                  ) : null}
                  {isCurrent ? (
                    <span className="work-case-detail__case-switcher-num work-case-detail__case-switcher-num--current">
                      {label}
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="work-case-detail__case-switcher-num"
                      onClick={() => onSelectCase?.(navCase.id)}
                      aria-label={`View case ${label}`}
                    >
                      {label}
                    </button>
                  )}
                </span>
              );
            })}
          </nav>
        ) : null}
      </header>

      <div className="work-case-detail">
        <div className="work-case-detail__shell">
          <CaseMapColumn
            map={caseMap}
            sectionPrefix={sectionPrefix}
            activeSection={isStagedCase ? activeSection : undefined}
            onNavClick={isStagedCase ? scrollToSection : undefined}
          />

          <div ref={scrollRef} className="work-case-detail__scroll" tabIndex={-1}>
            <EvidenceFlowColumn evidence={evidence} caseId={item.id} />
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
