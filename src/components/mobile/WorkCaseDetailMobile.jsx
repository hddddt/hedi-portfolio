import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/case01-staged.css';
import { WORK_CASE_DETAIL } from '../../data/workCaseDetailContent.js';
import { CASE01_FLOW } from '../../data/workCaseDetailCase01.js';
import { CASE02_FLOW } from '../../data/workCaseDetailCase02.js';
import { CASE03_FLOW } from '../../data/workCaseDetailCase03.js';
import { CASE04_FLOW } from '../../data/workCaseDetailCase04.js';
import { StagedCaseFlow } from '../home/Case01StagedFlow.jsx';
import { HeroAnswerStateModel } from '../home/HeroAnswerStateModel.jsx';

const STAGED_CASE_FLOW = {
  case01: CASE01_FLOW,
  case02: CASE02_FLOW,
  case03: CASE03_FLOW,
  case04: CASE04_FLOW,
};

const CASE_ORDER = ['case01', 'case02', 'case03', 'case04'];

function isStagedCaseId(caseId, evidence) {
  if (!evidence?.staged) return false;
  return CASE_ORDER.includes(caseId);
}

function caseIndexLabel(num) {
  const digits = String(num ?? '').replace(/\D/g, '');
  return digits ? digits.padStart(2, '0').slice(-2) : '—';
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

function EvidenceSection({ title, children }) {
  return (
    <section className="work-case-detail__section">
      <h3 className="work-case-detail__section-title">{title}</h3>
      <div className="work-case-detail__section-body">{children}</div>
    </section>
  );
}

function DesignDecisionBlock({ decision }) {
  return (
    <div className="work-case-detail__decision">
      {decision.lead ? <p className="work-case-detail__decision-lead">{decision.lead}</p> : null}
      <Paragraphs items={decision.paragraphs} className="work-case-detail__p" />
    </div>
  );
}

function MobileCaseMap({ map, hasOutcomeSection, activeSection, onNavClick }) {
  const navItems = [
    { slug: 'overview', title: 'Overview' },
    ...(map.readingMap.decisions ?? []),
    ...(hasOutcomeSection ? [{ slug: 'outcome', title: 'Outcome' }] : []),
  ];

  return (
    <nav className="mobile-case-detail__section-nav" aria-label="On this case">
      {navItems.map((item) => {
        const slug = item.slug ?? item.num;
        const isActive = activeSection === slug;
        return (
          <button
            key={slug}
            type="button"
            className={`mobile-case-detail__section-link${isActive ? ' is-active' : ''}`}
            aria-current={isActive ? 'true' : undefined}
            onClick={() => onNavClick?.(slug)}
          >
            {item.title}
          </button>
        );
      })}
    </nav>
  );
}

function MobileEvidence({ evidence, caseId, activeSection }) {
  if (isStagedCaseId(caseId, evidence)) {
    const flow = STAGED_CASE_FLOW[caseId];
    if (!flow) return <p className="work-case-detail__p">Staged flow unavailable.</p>;
    return (
      <div className="work-case-detail__evidence-inner work-case-detail__evidence-inner--staged">
        <StagedCaseFlow flow={flow} sectionPrefix={caseId} activeSection={activeSection} />
      </div>
    );
  }

  return (
    <div className="work-case-detail__evidence-inner">
      <EvidenceSection title="Project Context">
        <TextBlocks text={evidence.projectContext.lead} />
        <Paragraphs items={evidence.projectContext.paragraphs} />
      </EvidenceSection>
      <EvidenceSection title="Design Decision">
        <DesignDecisionBlock decision={evidence.designDecision} />
      </EvidenceSection>
      {evidence.heroEvidence ? (
        <div className="work-case-detail__section work-case-detail__section--hero">
          <HeroAnswerStateModel hero={evidence.heroEvidence} />
        </div>
      ) : null}
      <EvidenceSection title="Resulting Value">
        <Paragraphs items={evidence.resultingValue.paragraphs} />
      </EvidenceSection>
    </div>
  );
}

/**
 * Mobile case detail — compact top bar, linear content, bottom case navigation.
 */
export function WorkCaseDetailMobile({ item, allCases = [], onClose, onSelectCase }) {
  const scrollRef = useRef(null);
  const [activeSection, setActiveSection] = useState('overview');
  const detail = WORK_CASE_DETAIL[item.id];
  const orderedCases = CASE_ORDER.map((id) => allCases.find((c) => c.id === id)).filter(
    (c) => c && WORK_CASE_DETAIL[c.id],
  );
  const currentIndex = orderedCases.findIndex((c) => c.id === item.id);
  const caseMap = detail?.caseMap;
  const evidence = detail?.evidence;
  const isStagedCase = isStagedCaseId(item.id, evidence);
  const sectionPrefix = item.id;
  const hasOutcomeSection = Boolean(
    isStagedCase && STAGED_CASE_FLOW[item.id]?.some((node) => node.type === 'resulting-value'),
  );

  const prevCase = currentIndex > 0 ? orderedCases[currentIndex - 1] : null;
  const nextCase = currentIndex < orderedCases.length - 1 ? orderedCases[currentIndex + 1] : null;

  const scrollToSection = useCallback(
    (slug) => {
      const root = scrollRef.current;
      const target = document.getElementById(`${sectionPrefix}-${slug}`);
      if (!root || !target) return;
      const top = target.offsetTop - root.offsetTop - 12;
      root.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      setActiveSection(slug);
    },
    [sectionPrefix],
  );

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('work-case-detail-open', 'mobile-case-detail-open');
    return () => {
      document.body.style.overflow = prevOverflow;
      document.documentElement.classList.remove('work-case-detail-open', 'mobile-case-detail-open');
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setActiveSection('overview');
  }, [item.id]);

  if (!caseMap || !evidence) return null;

  const caseLabel = caseIndexLabel(item.num);
  const totalLabel = String(orderedCases.length).padStart(2, '0');

  return createPortal(
    <div
      className="mobile-case-detail"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mobile-case-detail-title"
    >
      <header className="mobile-case-detail__topbar">
        <button type="button" className="mobile-case-detail__back" onClick={onClose}>
          ← Work
        </button>
        <span className="mobile-case-detail__indicator" aria-live="polite">
          {caseLabel} / {totalLabel}
        </span>
      </header>

      <div ref={scrollRef} className="mobile-case-detail__scroll">
        <div className="mobile-case-detail__intro">
          <h1 id="mobile-case-detail-title" className="mobile-case-detail__title">
            {caseMap.caseTitle}
          </h1>
          <p className="mobile-case-detail__layer">{caseMap.aiValueLayer}</p>
          <p className="mobile-case-detail__why">{caseMap.whyLayerMatters}</p>
        </div>

        {isStagedCase ? (
          <MobileCaseMap
            map={caseMap}
            hasOutcomeSection={hasOutcomeSection}
            activeSection={activeSection}
            onNavClick={scrollToSection}
          />
        ) : null}

        <MobileEvidence evidence={evidence} caseId={item.id} activeSection={activeSection} />
      </div>

      <footer className="mobile-case-detail__footer">
        {prevCase ? (
          <button
            type="button"
            className="mobile-case-detail__nav-btn"
            onClick={() => onSelectCase?.(prevCase.id)}
          >
            ← {caseIndexLabel(prevCase.num)}
          </button>
        ) : (
          <span />
        )}
        {nextCase ? (
          <button
            type="button"
            className="mobile-case-detail__nav-btn mobile-case-detail__nav-btn--next"
            onClick={() => onSelectCase?.(nextCase.id)}
          >
            {caseIndexLabel(nextCase.num)} →
          </button>
        ) : (
          <span />
        )}
      </footer>
    </div>,
    document.body,
  );
}
