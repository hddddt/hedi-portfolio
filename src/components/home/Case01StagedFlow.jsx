import { useEffect, useRef, useState } from 'react';
import { CASE01_FLOW } from '../../data/workCaseDetailCase01.js';
import { DECISION_01_UX_ARTIFACT } from '../../data/case01ShsArtifacts.js';
import { getDecisionEvidenceImages, getScopeEvidenceImages } from '../../data/workCaseImages.js';
import { HeroAnswerStateModel } from './HeroAnswerStateModel.jsx';
import { EvidenceImage } from '../work/EvidenceImage.jsx';

/** Four roles only: label · title · body · meta */
function SectionLabel({ children, variant }) {
  return (
    <p className={`case01-label${variant ? ` case01-label--${variant}` : ''}`}>
      <span className="case01-label__dash" aria-hidden="true">
        —
      </span>{' '}
      {children}
    </p>
  );
}

function MainTitle({ lines, children, className = '' }) {
  const content = lines ?? (children ? [children] : []);
  return (
    <h2 className={`case01-title${className ? ` ${className}` : ''}`}>
      {content.map((line, i) => (
        <span key={line}>
          {line}
          {i < content.length - 1 ? <br /> : null}
        </span>
      ))}
    </h2>
  );
}

function Body({ children, bold = false, className = '' }) {
  if (!children) return null;
  const lines = String(children).split('\n');
  return (
    <p className={`case01-body${bold ? ' case01-body--bold' : ''}${className ? ` ${className}` : ''}`}>
      {lines.map((line, i) => (
        <span key={line}>
          {line}
          {i < lines.length - 1 ? <br /> : null}
        </span>
      ))}
    </p>
  );
}

function Meta({ children, as = 'p' }) {
  if (!children) return null;
  const Tag = as;
  return <Tag className="case01-meta">{children}</Tag>;
}

function SectionBlock({ label, children }) {
  if (!children) return null;
  return (
    <div className="case01-block">
      {label ? <SectionLabel>{label}</SectionLabel> : null}
      {children}
    </div>
  );
}

function SubBody({ children, className = '' }) {
  if (!children) return null;
  return <p className={`case01-sub${className ? ` ${className}` : ''}`}>{children}</p>;
}

function ThreeColumns({ items, variant = 'evidence' }) {
  if (!items?.length) return null;
  const isRoadmap = variant === 'roadmap';
  return (
    <div
      className={`case01-cols${isRoadmap ? ' case01-cols--roadmap' : ''}`}
      role="list"
      aria-label={isRoadmap ? 'Three design levels' : undefined}
    >
      {items.map((item) => (
        <div key={item.num ?? item.title} className="case01-cols__col" role="listitem">
          {isRoadmap ? (
            <>
              <SubBody className="case01-sub--num">{item.num}</SubBody>
              <SubBody className="case01-sub--layer">{item.title}</SubBody>
              <SubBody className="case01-sub--question">{item.text}</SubBody>
            </>
          ) : (
            <>
              <SubBody className="case01-sub--tag">{item.title ?? item.tag}</SubBody>
              <SubBody className="case01-sub--detail">{item.text ?? item.body}</SubBody>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

const ECOSYSTEM_MAP_HEADERS = ['Stakeholder groups', 'Task lines', 'AI touchpoints'];

function EcosystemMapEvidence({ visual }) {
  const { label, intro, caption, rows = [] } = visual ?? {};
  if (!rows.length) return null;

  return (
    <section
      className="case01-ecosystem"
      aria-label={label ?? 'Service ecosystem and AI touchpoint map'}
    >
      {label ? <p className="case01-ecosystem__label">{label}</p> : null}
      {intro ? <p className="case01-ecosystem__intro">{intro}</p> : null}

      <div
        className="case01-ecosystem__grid"
        role="table"
        aria-label="Stakeholder groups, task lines, and AI touchpoints"
      >
        {ECOSYSTEM_MAP_HEADERS.map((header) => (
          <div key={header} className="case01-ecosystem__header" role="columnheader">
            {header}
          </div>
        ))}
        {rows.map((row) => (
          <div key={row.stakeholder} className="case01-ecosystem__row" role="row">
            <div className="case01-ecosystem__cell" role="cell">
              {row.stakeholder}
            </div>
            <div className="case01-ecosystem__cell" role="cell">
              {row.task}
            </div>
            <div className="case01-ecosystem__cell case01-ecosystem__cell--accent" role="cell">
              {row.touchpoint}
            </div>
          </div>
        ))}
      </div>

      {caption ? <p className="case01-ecosystem__caption">{caption}</p> : null}
    </section>
  );
}

function isEcosystemMapVisual(visual) {
  const type = visual?.diagram;
  return type === 'ecosystem-map' || type === 'service-positioning';
}

function ArtifactBoardCrop({ src, alt, focus }) {
  if (!src) return null;
  if (!focus) {
    return <img src={src} alt={alt} className="case01-artifact__img" loading="lazy" decoding="async" />;
  }
  const { scale, x, y } = focus;
  return (
    <div className="case01-artifact__crop">
      <img
        src={src}
        alt={alt}
        className="case01-artifact__img case01-artifact__img--crop"
        loading="lazy"
        decoding="async"
        style={{
          width: `${scale * 100}%`,
          maxWidth: 'none',
          transform: `translate(-${x}%, -${y}%)`,
        }}
      />
    </div>
  );
}

function UxStrategyArtifactEvidence({ artifact = DECISION_01_UX_ARTIFACT }) {
  if (!artifact) return null;
  const { title, intro, boardSrc, overview, crops, inset } = artifact;

  return (
    <section className="case01-artifact" aria-labelledby="case01-artifact-title">
      <h3 id="case01-artifact-title" className="case01-artifact__title">
        {title}
      </h3>
      {intro ? <p className="case01-artifact__intro">{intro}</p> : null}

      {boardSrc && overview ? (
        <figure className="case01-artifact__overview">
          <div className="case01-artifact__frame case01-artifact__frame--overview">
            <img
              src={boardSrc}
              alt={overview.alt}
              className="case01-artifact__img case01-artifact__img--overview"
              loading="lazy"
              decoding="async"
            />
          </div>
          {overview.caption ? (
            <figcaption className="case01-artifact__caption">{overview.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}

      {crops?.length ? (
        <div className="case01-artifact__crops">
          {crops.map((crop, index) => (
            <figure key={crop.id} className="case01-artifact__panel">
              <div
                className={`case01-artifact__frame case01-artifact__frame--panel case01-artifact__frame--panel-${index + 1}`}
              >
                <ArtifactBoardCrop
                  src={crop.dedicated ? crop.src : (crop.src ?? boardSrc)}
                  alt={crop.alt ?? crop.title}
                  focus={crop.focus}
                />
              </div>
              {crop.title ? <p className="case01-artifact__panel-title">{crop.title}</p> : null}
              {crop.caption ? (
                <figcaption className="case01-artifact__caption">{crop.caption}</figcaption>
              ) : null}
            </figure>
          ))}
        </div>
      ) : null}

      {inset ? (
        <figure className="case01-artifact__inset">
          <div className="case01-artifact__frame case01-artifact__frame--inset">
            <ArtifactBoardCrop
              src={inset.dedicated ? inset.src : (inset.src ?? boardSrc)}
              alt={inset.alt ?? inset.title}
              focus={inset.dedicated ? undefined : inset.focus}
            />
          </div>
          {inset.title ? <p className="case01-artifact__panel-title">{inset.title}</p> : null}
          {inset.caption ? (
            <figcaption className="case01-artifact__caption">{inset.caption}</figcaption>
          ) : null}
        </figure>
      ) : null}
    </section>
  );
}

function Case01Diagram({ type }) {
  switch (type) {
    case 'ecosystem-map':
    case 'service-positioning':
      return null;
    case 'knowledge-routing':
      return (
        <div className="case01-routing">
          <div className="case01-routing__col case01-routing__col--before">
            <Meta as="p">Before</Meta>
            <ol className="case01-routing__steps">
              {[
                'One chatbot → “All users” → 3 mixed knowledge bases → Risk: wrong domain / wrong interpretation',
              ].map(
                (s) => (
                  <li key={s}>{s}</li>
                ),
              )}
            </ol>
          </div>
          <div className="case01-routing__col case01-routing__col--after">
            <Meta as="p">After</Meta>
            <ol className="case01-routing__steps">
              {[
                'One entry → Intent/domain evaluation → User expertise context → Knowledge base routing → Source-aware answer → Fallback if unclear',
              ].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ol>
          </div>
        </div>
      );
    case 'cognigy-tree':
      return (
        <div className="case01-cognigy-tree">
          <Body>User asks shipment status</Body>
          <Body>→ Request tracking number → Validate</Body>
          <div className="case01-cognigy-tree__branch">
            <Body>Valid? · Yes → Return status</Body>
            <Body>· No → Clarify → Retry → Still invalid?</Body>
            <Body>→ Phone verification · Escalate → Handoff with context</Body>
          </div>
          <Meta as="p">Voice branch</Meta>
          <Body className="case01-body--muted">Low voice confidence → Repeat / confirm number</Body>
        </div>
      );
    case 'source-pattern':
      return (
        <div className="case01-source-card">
          {[
            ['Answer', 'Generated response / summary'],
            ['Source boundary', 'Handbook A · Section 3.2'],
            ['Domain context', 'Applies to: compliance specialist workflow'],
            [
              'Limitation / next step',
              'If your case belongs to another handbook, switch domain or ask for clarification.',
            ],
          ].map(([key, val]) => (
            <div key={key} className="case01-source-card__row">
              <Meta as="span">{key}</Meta>
              <span>{val}</span>
            </div>
          ))}
        </div>
      );
    case 'handoff-context':
      return (
        <div className="case01-handoff">
          {[
            ['Intent & entity', 'Shipment status · tracking number captured'],
            ['Validation state', 'Invalid → repair loop · alternative verification path'],
            ['Collected context', 'User input history · failure reason · retry count'],
            ['Handoff package', 'Transferred to agent with context — user does not restart'],
          ].map(([key, val]) => (
            <div key={key} className="case01-handoff__row">
              <Meta as="span">{key}</Meta>
              <span>{val}</span>
            </div>
          ))}
        </div>
      );
    case 'escalation-pattern':
      return (
        <div className="case01-escalation">
          {[
            ['Why escalation', 'Automation cannot resolve after repair attempts'],
            ['What transfers', 'Intent · inputs · validation state · conversation history'],
            ['What happens next', 'Human agent continues with context — clear expectation for user'],
          ].map(([key, val]) => (
            <div key={key} className="case01-escalation__row">
              <Meta as="span">{key}</Meta>
              <span>{val}</span>
            </div>
          ))}
        </div>
      );
    case 'fallback-map':
      return (
        <div className="case01-fallback-map">
          {[
            ['Intent', 'Capture request · route to entity'],
            ['Validate', 'Check format · confidence · backend lookup'],
            ['Repair loop', 'Clarify · retry · alternate verification'],
            ['Escalate', 'Handoff when automation cannot resolve'],
          ].map(([key, val], i) => (
            <div key={key} className="case01-fallback-map__step">
              <Meta as="span">{key}</Meta>
              <span>{val}</span>
              {i < 3 ? <span className="case01-fallback-map__arrow" aria-hidden="true">→</span> : null}
            </div>
          ))}
        </div>
      );
    case 'recovery-compare':
      return (
        <div className="case01-recovery-compare">
          <div className="case01-recovery-compare__col">
            <Meta as="p">Generic failure</Meta>
            <Body>“Sorry, I couldn’t verify this information.”</Body>
            <Meta as="p">No reason · no recovery path · no alternative</Meta>
          </div>
          <div className="case01-recovery-compare__col case01-recovery-compare__col--good">
            <Meta as="p">Recoverable clarification</Meta>
            <Body>
              “I couldn’t verify this tracking number. You can find it in your shipping confirmation email.
              Please enter the 10–11 digit number again, or use your phone number for verification.”
            </Body>
            <Meta as="p">What failed → How to recover → Alternative path</Meta>
          </div>
        </div>
      );
    case 'three-layer':
      return (
        <div className="case01-three-layer">
          <Meta as="p">Conversational AI support flow design</Meta>
          {[
            {
              n: 'D1',
              t: 'Service-System Framing',
              b: 'Roadmap · Journey · Stakeholders · AI touchpoints',
            },
            {
              n: 'D2',
              t: 'Flow, recovery & handoff architecture',
              b: 'Intent · Validation · Fallback · Escalation · Handoff',
            },
            {
              n: 'D3',
              t: 'Response, trust & repair patterns',
              b: 'Source boundaries · Clarification · Repair · Trust',
            },
          ].map((layer, i) => (
            <div key={layer.n}>
              {i > 0 ? <span className="case01-three-layer__down" aria-hidden="true" /> : null}
              <div className="case01-three-layer__card">
                <Meta as="p">{layer.n}</Meta>
                <Body bold>{layer.t}</Body>
                <Meta as="p">{layer.b}</Meta>
              </div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

function DiagramFigure({ caption, title, children }) {
  return (
    <figure className="case01-figure">
      {title ? <Meta as="p">{title}</Meta> : null}
      <div className="case01-figure__canvas">{children}</div>
      {caption ? (
        <figcaption>
          <Meta>{caption}</Meta>
        </figcaption>
      ) : null}
    </figure>
  );
}

const SCOPE_CONVERSATION_COPY =
  'Conversation design still mattered: intent definition, response writing, happy paths, fallback copy, and tone refinement.';

const SCOPE_SYSTEM_COPY =
  'But the real work was defining how the system routes context, recovers from failure, hands work off, and keeps service continuity.';

function Case01ContextStrip({ projects }) {
  if (!projects?.length) return null;
  const tags =
    'Project inputs: Stakeholder service context · Knowledge-user segmentation · Transactional support flow';
  return (
    <div className="case01-context-strip" aria-label="Case context">
      <p className="case01-context-strip__lead">Three conversational AI inputs</p>
      <p className="case01-context-strip__tags">{tags}</p>
    </div>
  );
}

function Case01Intro({ inputs, scope, sectionPrefix = 'case01' }) {
  if (!scope) return null;
  const scopeImages = getScopeEvidenceImages('case01');
  return (
    <section className="case01-chapter case01-chapter--intro">
      {inputs?.projects ? <Case01ContextStrip projects={inputs.projects} /> : null}
      <MainTitle lines={scope.mainTitle} className="case01-thesis" />
      <Body className="case01-body--scope">{SCOPE_CONVERSATION_COPY}</Body>
      <Body className="case01-body--scope">{SCOPE_SYSTEM_COPY}</Body>
      {scopeImages.length ? (
        <div className="case01-scope-evidence">
          {scopeImages.map((item) => (
            <EvidenceImage key={item.id} item={item} caseId={sectionPrefix} />
          ))}
        </div>
      ) : null}
      <DesignDecisionRoadmap columns={scope.columns} />
    </section>
  );
}

function Case02Intro({ node, overview }) {
  if (!node) return null;
  const { metadataStrip, caseThesis, scopeParagraphs } = node;
  return (
    <section className="case01-chapter case01-chapter--intro case01-chapter--intro-contract">
      {metadataStrip ? (
        <div className="case01-context-strip" aria-label="Case context">
          <p className="case01-context-strip__lead">{metadataStrip.lead}</p>
          <p className="case01-context-strip__body">{metadataStrip.body}</p>
        </div>
      ) : null}
      <MainTitle lines={caseThesis} className="case01-thesis" />
      {scopeParagraphs?.map((p) => (
        <Body key={p.slice(0, 48)} className="case01-body--scope">
          {p}
        </Body>
      ))}
      {node.heroArtifact ? (
        <div className="case01-case-hero">
          <StagedImageArtifact item={node.heroArtifact} />
        </div>
      ) : null}
      {overview?.columns ? <DesignDecisionRoadmap columns={overview.columns} /> : null}
    </section>
  );
}

function Case04Intro({ node }) {
  if (!node) return null;
  const { metadataStrip, caseThesis, caseThesisSupport } = node;
  return (
    <section className="case01-chapter case01-chapter--intro case01-chapter--intro-companion">
      {metadataStrip ? (
        <div className="case01-context-strip" aria-label="Case context">
          <p className="case01-context-strip__lead">{metadataStrip.lead}</p>
          <p className="case01-context-strip__body">{metadataStrip.body}</p>
        </div>
      ) : null}
      <MainTitle lines={caseThesis} className="case01-thesis" />
      {caseThesisSupport ? <Body className="case01-body--thesis-support">{caseThesisSupport}</Body> : null}
    </section>
  );
}

function Case03Intro({ node }) {
  if (!node) return null;
  const { metadataStrip, caseThesis, caseThesisSupport, heroArtifact } = node;
  return (
    <section className="case01-chapter case01-chapter--intro case01-chapter--intro-agentic">
      {metadataStrip ? (
        <div className="case01-context-strip" aria-label="Case context">
          {metadataStrip.lead ? <p className="case01-context-strip__lead">{metadataStrip.lead}</p> : null}
          {metadataStrip.body ? <p className="case01-context-strip__body">{metadataStrip.body}</p> : null}
        </div>
      ) : null}
      <MainTitle lines={caseThesis} className="case01-thesis" />
      {caseThesisSupport ? <Body className="case01-body--thesis-support">{caseThesisSupport}</Body> : null}
      {heroArtifact ? (
        <div className="case01-case-hero">
          <StagedImageArtifact item={heroArtifact} />
        </div>
      ) : null}
    </section>
  );
}

function ScopeClarification({ node, sectionPrefix }) {
  if (!node?.paragraphs?.length) return null;
  const scopeImages = getScopeEvidenceImages(sectionPrefix);
  return (
    <section className="case01-chapter case01-chapter--scope-clarification">
      {node.paragraphs.map((p) => (
        <Body key={p.slice(0, 48)} className="case01-body--scope">
          {p}
        </Body>
      ))}
      {scopeImages.length ? (
        <div className="case01-scope-evidence">
          {scopeImages.map((item) => (
            <EvidenceImage key={item.id} item={item} caseId={sectionPrefix} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function ProjectPills({ names }) {
  if (!names?.length) return null;
  return (
    <div className="case01-project-pills" role="list" aria-label="Projects">
      {names.map((name) => (
        <span key={name} className="case01-project-pill" role="listitem">
          {name}
        </span>
      ))}
    </div>
  );
}

function ProjectMap({ node }) {
  if (!node?.rows?.length) return null;
  return (
    <section className="case01-chapter case01-chapter--project-map" aria-label="Project to decision map">
      {node.intro ? <p className="case01-project-map__intro">{node.intro}</p> : null}
      <div className="case01-project-map">
        {node.rows.map((row) => (
          <div key={row.name} className="case01-project-map__row">
            <p className="case01-project-map__name">{row.name}</p>
            <div className="case01-project-map__connector" aria-hidden="true" />
            <div className="case01-project-map__decisions">
              {row.decisions.map((d) => (
                <span key={`${row.name}-${d}`} className="case01-project-map__pill">
                  {d}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function decisionProjectNames(node) {
  const cases = node.appliedInCases ?? node.appliedInTabs;
  if (cases?.length) return cases.map((item) => item.label).filter(Boolean);
  if (node.appliedIn?.length) return node.appliedIn.map((item) => item.project).filter(Boolean);
  return [];
}

function StagedHierarchyEvidence({ item }) {
  if (!item?.before || !item?.after) return null;
  return (
    <figure className="case01-staged-evidence case01-staged-evidence--hierarchy">
      {item.title ? <p className="case01-staged-evidence__title">{item.title}</p> : null}
      <div className="case01-hierarchy-shift" role="group" aria-label="Feature hierarchy before and after">
        <div className="case01-hierarchy-shift__col">
          <p className="case01-hierarchy-shift__label">Before</p>
          <p className="case01-hierarchy-shift__row">
            <span className="case01-hierarchy-shift__key">Core</span>
            <span className="case01-hierarchy-shift__val">{item.before.core}</span>
          </p>
          <p className="case01-hierarchy-shift__row">
            <span className="case01-hierarchy-shift__key">Supporting</span>
            <span className="case01-hierarchy-shift__val">{item.before.supporting}</span>
          </p>
        </div>
        <div className="case01-hierarchy-shift__col case01-hierarchy-shift__col--after">
          <p className="case01-hierarchy-shift__label">After</p>
          <p className="case01-hierarchy-shift__row">
            <span className="case01-hierarchy-shift__key">Core</span>
            <span className="case01-hierarchy-shift__val">{item.after.core}</span>
          </p>
          <p className="case01-hierarchy-shift__row">
            <span className="case01-hierarchy-shift__key">Supporting</span>
            <span className="case01-hierarchy-shift__val">{item.after.supporting}</span>
          </p>
        </div>
      </div>
      {item.caption ? (
        <figcaption className="case01-artifact__caption">{item.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function StagedTextEvidence({ item }) {
  if (!item) return null;
  return (
    <figure className="case01-staged-evidence case01-staged-evidence--text">
      {item.title ? <p className="case01-staged-evidence__title">{item.title}</p> : null}
      {item.whatToShow ? <p className="case01-staged-evidence__what">{item.whatToShow}</p> : null}
      {item.caption ? (
        <figcaption className="case01-artifact__caption">{item.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function StagedEvidenceList({ items, outcome }) {
  if (!items?.length && !outcome) return null;
  return (
    <div className="case01-decision-evidence case01-decision-evidence--staged">
      <div className="case01-staged-evidence__list">
        {items.map((item) =>
          item.before && item.after ? (
            <StagedHierarchyEvidence key={item.title} item={item} />
          ) : (
            <StagedTextEvidence key={item.title} item={item} />
          ),
        )}
      </div>
      <DecisionOutcomeLine>{outcome}</DecisionOutcomeLine>
    </div>
  );
}

function ResultingValueBlock({ node }) {
  if (!node?.outcome) return null;
  return (
    <section className="case01-chapter case01-chapter--resulting-value">
      <DecisionOutcomeLine>{node.outcome}</DecisionOutcomeLine>
    </section>
  );
}

function StagedEvidenceTable({ table }) {
  if (!table?.headers?.length) return null;
  return (
    <figure className="case01-staged-table">
      {table.title ? <p className="case01-decision-artifacts__label">{table.title}</p> : null}
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
      {table.caption ? (
        <figcaption className="case01-artifact__caption">{table.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function StagedImageArtifact({ item }) {
  if (!item?.src) return null;
  const sizeClass =
    item.size === 'medium'
      ? ' case01-artifact--size-medium'
      : item.size === 'large'
        ? ' case01-artifact--size-large'
        : '';
  return (
    <figure
      className={`case01-artifact case01-artifact--compact${
        item.featured ? ' case01-artifact--featured-shot' : ''
      }${sizeClass}`}
    >
      {item.title ? <p className="case01-artifact__panel-title">{item.title}</p> : null}
      <img
        src={item.src}
        alt={item.alt ?? item.title}
        className="case01-artifact__img case01-artifact__img--staged"
        loading="lazy"
        decoding="async"
      />
      {item.caption ? (
        <figcaption className="case01-artifact__caption">{item.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function StagedEvidenceNotes({ items }) {
  if (!items?.length) return null;
  return (
    <div className="case01-evidence-support">
      <p className="case01-evidence-support__label">Supporting evidence</p>
      <ul className="case01-evidence-notes">
        {items.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function StagedImageArtifacts({ artifacts, node }) {
  if (!artifacts?.length) return null;
  const resolved = artifacts
    .map((item) => {
      if (!item) return null;
      if (item.src) return item;
      if (item.type === 'artifact-image' && item.artifactId) {
        const panel = resolveArtifactPanel(item, node?.uxArtifact, node?.knowledgeArtifact, node?.flowArtifact);
        if (!panel) return null;
        return {
          ...panel,
          size: item.size ?? panel.size,
          featured: item.featured ?? panel.featured,
        };
      }
      return null;
    })
    .filter(Boolean);
  if (!resolved.length) return null;
  return (
    <>
      {resolved.map((item) => (
        <StagedImageArtifact key={item.id ?? item.src ?? item.title ?? item.alt ?? item.caption} item={item} />
      ))}
    </>
  );
}

function StagedSimpleEvidence({ node, showOutcome = true }) {
  return (
    <div
      className={`case01-decision-evidence case01-decision-evidence--staged${
        node.layout === 'coreMove-full-width-then-images'
          ? ' case01-decision-evidence--layout-stack'
          : ''
      }`}
    >
      {node.heroEvidence ? (
        <div className="case01-hero-evidence-wrap">
          <HeroAnswerStateModel hero={node.heroEvidence} />
        </div>
      ) : null}
      <StagedImageArtifacts artifacts={node.artifacts} node={node} />
      {node.table ? <StagedEvidenceTable table={node.table} /> : null}
      <StagedEvidenceNotes items={node.evidenceNotes} />
      {showOutcome ? <DecisionOutcomeLine>{node.outcome}</DecisionOutcomeLine> : null}
    </div>
  );
}

function RegistryEvidenceGroup({ sectionPrefix, slug }) {
  const images = getDecisionEvidenceImages(sectionPrefix, slug);
  if (!images.length) return null;
  return (
    <div className="case01-registry-evidence">
      {images.map((item) => (
        <EvidenceImage key={item.id} item={item} caseId={sectionPrefix} />
      ))}
    </div>
  );
}

function JudgmentPair({ gap, move }) {
  if (!gap && !move) return null;
  return (
    <div className="case01-judgment-pair">
      {gap ? (
        <div className="case01-judgment-card">
          <p className="case01-judgment-card__label">The gap</p>
          <p className="case01-judgment-card__text">{gap}</p>
        </div>
      ) : null}
      {move ? (
        <div className="case01-judgment-card">
          <p className="case01-judgment-card__label">The move</p>
          <p className="case01-judgment-card__text">{move}</p>
        </div>
      ) : null}
    </div>
  );
}

function ContextMetaDetails({ grid }) {
  if (!grid) return null;
  const rows = [
    ['Context', grid.challenge],
    ['Focus', grid.focus],
    ['Role', grid.role],
  ].filter(([, value]) => value);

  if (!rows.length) return null;

  return (
    <div className="case01-meta-strip" aria-label="Decision context">
      {rows.map(([label, value]) => (
        <div key={label} className="case01-meta-strip__item">
          <span className="case01-meta-strip__key">{label}</span>
          <span className="case01-meta-strip__val">{value}</span>
        </div>
      ))}
    </div>
  );
}

function DecisionOutcomeLine({ children }) {
  if (!children) return null;
  return (
    <p className="case01-outcome-line">
      <span className="case01-outcome-line__arrow" aria-hidden="true">
        →
      </span>
      {children}
    </p>
  );
}

function ArtifactInsetPanel({ artifact }) {
  const { inset } = artifact ?? {};
  if (!inset?.src) return null;
  return (
    <figure className="case01-artifact case01-artifact--compact">
      <img
        src={inset.src}
        alt={inset.alt ?? inset.title}
        className="case01-artifact__img case01-artifact__img--staged"
        loading="lazy"
        decoding="async"
      />
      {inset.title ? <p className="case01-artifact__panel-title">{inset.title}</p> : null}
      {inset.caption ? (
        <figcaption className="case01-artifact__caption">{inset.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function ArtifactJourneyPanel({ artifact }) {
  const crop = artifact?.crops?.find((c) => c.id === 'journey');
  if (!crop) return null;
  return (
    <figure className="case01-artifact case01-artifact--compact">
      <div className="case01-artifact__crop case01-artifact__crop--staged">
        <ArtifactBoardCrop src={crop.src} alt={crop.alt ?? crop.title} />
      </div>
      {crop.title ? <p className="case01-artifact__panel-title">{crop.title}</p> : null}
      {crop.caption ? (
        <figcaption className="case01-artifact__caption">{crop.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function ArtifactImagePanel({ panel }) {
  if (!panel?.src) return null;
  return (
    <figure className="case01-artifact case01-artifact--compact">
      <img
        src={panel.src}
        alt={panel.alt ?? panel.title}
        className="case01-artifact__img case01-artifact__img--staged"
        loading="lazy"
        decoding="async"
      />
      {panel.title ? <p className="case01-artifact__panel-title">{panel.title}</p> : null}
      {panel.caption ? (
        <figcaption className="case01-artifact__caption">{panel.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function DesignDecisionRoadmap({ columns }) {
  if (!columns?.length) return null;
  return (
    <div className="case01-scope-decisions">
      <div className="case01-scope-decisions__list" role="list">
        {columns.map((col) => (
          <div key={col.num} className="case01-scope-decisions__item" role="listitem">
            <p className="case01-scope-decisions__d">{col.num}</p>
            <div className="case01-scope-decisions__content">
              <p className="case01-scope-decisions__title">{col.title}</p>
              <p className="case01-scope-decisions__text">{col.text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AppliedInCasePanel({
  item,
  uxArtifact,
  knowledgeArtifact,
  flowArtifact,
  hideArtifacts = false,
  hideOutcome = false,
}) {
  if (!item) return null;
  return (
    <article className="case01-applied-case" aria-labelledby={`applied-case-${item.id}`}>
      {item.question ? (
        <div className="case01-applied-question">
          <p className="case01-applied-question__text">{item.question}</p>
        </div>
      ) : null}
      <ContextMetaDetails grid={item.grid} />
      {!hideArtifacts ? (
        <DecisionArtifacts
          items={item.artifacts}
          uxArtifact={uxArtifact}
          knowledgeArtifact={knowledgeArtifact}
          flowArtifact={flowArtifact}
        />
      ) : null}
      {!hideOutcome ? <DecisionOutcomeLine>{item.outcome}</DecisionOutcomeLine> : null}
    </article>
  );
}

function AppliedInCases({
  cases,
  uxArtifact,
  knowledgeArtifact,
  flowArtifact,
  hideArtifacts = false,
  hideOutcome = false,
}) {
  if (!cases?.length) return null;
  const projectNames = cases.map((item) => item.label).filter(Boolean);
  return (
    <div className="case01-applied-cases">
      <ProjectPills names={projectNames} />
      {cases.map((item, index) => (
        <AppliedInCasePanel
          key={item.id ?? `case-${index}`}
          item={item}
          uxArtifact={uxArtifact}
          knowledgeArtifact={knowledgeArtifact}
          flowArtifact={flowArtifact}
          hideArtifacts={hideArtifacts}
          hideOutcome={hideOutcome}
        />
      ))}
    </div>
  );
}

function resolveArtifactPanel(item, uxArtifact, knowledgeArtifact, flowArtifact) {
  for (const bundle of [uxArtifact, knowledgeArtifact, flowArtifact]) {
    const panel = bundle?.panels?.find((p) => p.id === item.artifactId);
    if (panel) return panel;
  }
  return null;
}

function DecisionArtifactItem({ item, uxArtifact, knowledgeArtifact, flowArtifact }) {
  if (!item) return null;
  if (item.type === 'artifact-image') {
    const panel = resolveArtifactPanel(item, uxArtifact, knowledgeArtifact, flowArtifact);
    if (!panel) return null;
    return (
      <figure className="case01-decision-artifacts__item">
        {item.label ? <p className="case01-decision-artifacts__label">{item.label}</p> : null}
        <ArtifactImagePanel panel={panel} />
      </figure>
    );
  }
  if (item.type === 'artifact-inset') {
    return (
      <figure className="case01-decision-artifacts__item">
        <ArtifactInsetPanel artifact={uxArtifact} />
      </figure>
    );
  }
  if (item.type === 'artifact-journey') {
    return (
      <figure className="case01-decision-artifacts__item">
        {item.label ? <p className="case01-decision-artifacts__label">{item.label}</p> : null}
        <ArtifactJourneyPanel artifact={uxArtifact} />
      </figure>
    );
  }
  if (item.type === 'diagram') {
    return (
      <figure className="case01-decision-artifacts__item">
        {item.label ? <p className="case01-decision-artifacts__label">{item.label}</p> : null}
        <div className="case01-decision-artifacts__canvas">
          <Case01Diagram type={item.diagram} />
        </div>
      </figure>
    );
  }
  return null;
}

function DecisionArtifacts({ items, uxArtifact, knowledgeArtifact, flowArtifact }) {
  if (!items?.length) return null;
  return (
    <div className="case01-decision-evidence case01-decision-artifacts">
      <div className="case01-decision-artifacts__items">
        {items.map((item) => (
          <DecisionArtifactItem
            key={`${item.type}-${item.diagram ?? item.artifactId ?? item.label}`}
            item={item}
            uxArtifact={uxArtifact}
            knowledgeArtifact={knowledgeArtifact}
            flowArtifact={flowArtifact}
          />
        ))}
      </div>
    </div>
  );
}

function DecisionJudgmentHeader({ node }) {
  return (
    <header className="case01-decision-module__layer case01-decision-module__layer--judgment">
      <p className="case01-decision-module__d">{node.d}</p>
      <h3 className="case01-decision-module__title">{node.title}</h3>
      {node.coreMove ? <p className="case01-decision-module__core-move">{node.coreMove}</p> : null}
    </header>
  );
}

function DecisionEvidenceLayer({ node, hasAppliedCases, sectionPrefix }) {
  const hasStagedEvidence =
    node.heroEvidence || node.artifacts?.length || node.table || node.evidenceNotes?.length;
  const hasEvidenceList = Boolean(node.evidence?.length);
  const registryImages = getDecisionEvidenceImages(sectionPrefix, node.slug);
  const hasRegistryImages = registryImages.length > 0;

  if (hasAppliedCases) {
    return (
      <>
        <AppliedInCases
          cases={node.appliedInCases ?? node.appliedInTabs}
          uxArtifact={node.uxArtifact}
          knowledgeArtifact={node.knowledgeArtifact}
          flowArtifact={node.flowArtifact}
          hideArtifacts={hasRegistryImages}
          hideOutcome={hasRegistryImages}
        />
        {hasRegistryImages ? <RegistryEvidenceGroup sectionPrefix={sectionPrefix} slug={node.slug} /> : null}
        {hasRegistryImages ? <DecisionOutcomeLine>{node.outcome}</DecisionOutcomeLine> : null}
      </>
    );
  }
  if (hasRegistryImages) {
    const projectNames = decisionProjectNames(node);
    return (
      <>
        <ProjectPills names={projectNames} />
        <ContextMetaDetails grid={node.grid} />
        <RegistryEvidenceGroup sectionPrefix={sectionPrefix} slug={node.slug} />
        {node.implementationNote ? <p className="case01-decision-note">{node.implementationNote}</p> : null}
        <DecisionOutcomeLine>{node.outcome}</DecisionOutcomeLine>
      </>
    );
  }
  if (hasEvidenceList) {
    return <StagedEvidenceList items={node.evidence} outcome={node.outcome} />;
  }
  if (hasStagedEvidence) {
    return <StagedSimpleEvidence node={node} showOutcome={node.layout !== 'text-left-image-right'} />;
  }
  const projectNames = decisionProjectNames(node);

  return (
    <>
      <ProjectPills names={projectNames} />
      <ContextMetaDetails grid={node.grid} />
      <DecisionArtifacts
        items={node.artifacts}
        uxArtifact={node.uxArtifact}
        knowledgeArtifact={node.knowledgeArtifact}
        flowArtifact={node.flowArtifact}
      />
      {node.implementationNote ? <p className="case01-decision-note">{node.implementationNote}</p> : null}
      {node.layout !== 'text-left-image-right' ? <DecisionOutcomeLine>{node.outcome}</DecisionOutcomeLine> : null}
    </>
  );
}

function DecisionModule({ node, sectionPrefix }) {
  const appliedCases = node.appliedInCases ?? node.appliedInTabs;
  const hasAppliedCases = Boolean(appliedCases?.length);
  const moveText = hasAppliedCases
    ? node.coreMove ?? node.solution ?? node.grid?.solution
    : (node.solution ?? node.grid?.solution);

  const judgmentGap = node.gap ?? node.aiProblem;
  const judgmentMove = node.move ?? moveText;
  const isSplitLayout = node.layout === 'text-left-image-right';

  if (isSplitLayout) {
    return (
      <div
        className={`case01-decision-module${
          node.featured || node.visualWeight === 'highest' ? ' case01-decision-module--featured' : ''
        }`}
      >
        <div className="case01-decision-layout case01-decision-layout--split">
          <div className="case01-decision-layout__text">
            <DecisionJudgmentHeader node={node} />
            <JudgmentPair gap={judgmentGap} move={judgmentMove} />
          </div>
          <div className="case01-decision-layout__media case01-decision-module__layer case01-decision-module__layer--evidence">
            <DecisionEvidenceLayer
              node={node}
              judgmentGap={judgmentGap}
              judgmentMove={judgmentMove}
              hasAppliedCases={hasAppliedCases}
              moveText={moveText}
              sectionPrefix={sectionPrefix}
            />
          </div>
        </div>
        <DecisionOutcomeLine>{node.outcome}</DecisionOutcomeLine>
      </div>
    );
  }

  return (
    <div
      className={`case01-decision-module${
        node.featured || node.visualWeight === 'highest' ? ' case01-decision-module--featured' : ''
      }`}
    >
      <DecisionJudgmentHeader node={node} />
      <JudgmentPair gap={judgmentGap} move={judgmentMove} />
      <div className="case01-decision-module__layer case01-decision-module__layer--evidence">
        <DecisionEvidenceLayer
          node={node}
          judgmentGap={judgmentGap}
          judgmentMove={judgmentMove}
          hasAppliedCases={hasAppliedCases}
          moveText={moveText}
          sectionPrefix={sectionPrefix}
        />
      </div>
    </div>
  );
}

function DecisionHighlight({ children }) {
  if (!children) return null;
  return <p className="case01-highlight">{children}</p>;
}

function DecisionNarrative({ node }) {
  const { story, scenes } = node;
  return (
    <div className="case01-decision-story">
      {story.paragraphs.map((p) => (
        <Body key={p.slice(0, 48)}>{p}</Body>
      ))}
      <DecisionHighlight>{story.highlight}</DecisionHighlight>
      {story.follow ? <Body>{story.follow}</Body> : null}
      {story.visual ? (
        isEcosystemMapVisual(story.visual) ? (
          <EcosystemMapEvidence visual={story.visual} />
        ) : (
          <DiagramFigure caption={story.visual.caption} title={story.visual.title}>
            <Case01Diagram type={story.visual.diagram} />
          </DiagramFigure>
        )
      ) : null}
      {story.outcome ? <p className="case01-body case01-outcome">{story.outcome}</p> : null}
      {node.uxArtifact ? <UxStrategyArtifactEvidence artifact={node.uxArtifact} /> : null}

      {scenes?.map((scene) => (
        <div key={scene.id} className="case01-scene">
          {scene.sceneLabel ? <Meta as="p">{scene.sceneLabel}</Meta> : null}
          {scene.paragraphs.map((p) => (
            <Body key={p.slice(0, 48)}>{p}</Body>
          ))}
          <DecisionHighlight>{scene.highlight}</DecisionHighlight>
          {scene.visual ? (
            <DiagramFigure caption={scene.visual.caption} title={scene.visual.title}>
              <Case01Diagram type={scene.visual.diagram} />
            </DiagramFigure>
          ) : null}
        </div>
      ))}
    </div>
  );
}

function DecisionBlocks({ blocks, visual }) {
  return (
    <>
      {blocks?.map((block) => (
        <SectionBlock key={block.label} label={block.label}>
          {block.paragraphs?.map((p) => (
            <Body key={p.slice(0, 40)}>{p}</Body>
          ))}
          {block.body ? <Body bold={block.bold}>{block.body}</Body> : null}
        </SectionBlock>
      ))}
      {visual ? (
        <DiagramFigure caption={visual.caption}>
          <Case01Diagram type={visual.diagram} />
        </DiagramFigure>
      ) : null}
    </>
  );
}

function EvidenceSection({ section }) {
  return (
    <article className="case01-sequence">
      <SectionBlock label={section.label}>
        {section.paragraphs?.map((p) => (
          <Body key={p.slice(0, 40)}>{p}</Body>
        ))}
        {section.thesis ? <Body>{section.thesis}</Body> : null}
        {section.bullets?.length ? (
          <Meta>{section.bullets.join(' / ')}</Meta>
        ) : null}
        {section.issue ? <Body>{section.issue}</Body> : null}
        {typeof section.tradeoff === 'string' ? <Body>{section.tradeoff}</Body> : null}
      </SectionBlock>

      {section.tradeoff?.paragraphs ? (
        <SectionBlock label="Design trade-off">
          {section.tradeoff.paragraphs.map((p) => (
            <Body key={p.slice(0, 40)}>{p}</Body>
          ))}
        </SectionBlock>
      ) : null}

      {section.decision ? (
        <SectionBlock label="My decision">
          <Body bold>{section.decision.lead}</Body>
          {section.decision.note ? <Body>{section.decision.note}</Body> : null}
        </SectionBlock>
      ) : null}

      {section.visual ? (
        <DiagramFigure caption={section.visual.caption}>
          <Case01Diagram type={section.visual.diagram} />
        </DiagramFigure>
      ) : null}

      {section.outcome ? (
        <SectionBlock label="Outcome">
          <Body>{section.outcome}</Body>
        </SectionBlock>
      ) : null}

      {section.anchor ? <Meta>{section.anchor}</Meta> : null}
    </article>
  );
}

function SubDecisionSection({ sub }) {
  return (
    <article className="case01-sequence case01-sequence--sub">
      <SectionLabel>Decision {sub.num}</SectionLabel>
      <MainTitle>{sub.title}</MainTitle>
      {sub.note ? <Meta>{sub.note}</Meta> : null}
      <Body>{sub.coreQuestion}</Body>
      <SectionBlock label={sub.evidenceLabel}>
        {sub.paragraphs?.map((p) => (
          <Body key={p.slice(0, 40)}>{p}</Body>
        ))}
        {sub.bullets?.length ? <Meta>{sub.bullets.join(' / ')}</Meta> : null}
        {sub.issue ? <Body>{sub.issue}</Body> : null}
      </SectionBlock>
      <SectionBlock label="My decision">
        <Body bold>{sub.decision.lead}</Body>
      </SectionBlock>
      <SectionBlock label="Outcome">
        <Body>{sub.outcome}</Body>
      </SectionBlock>
      {sub.anchor ? <Meta>{sub.anchor}</Meta> : null}
    </article>
  );
}

function Decision03Sub({ sub }) {
  return (
    <article className="case01-sequence case01-sequence--sub">
      <SectionLabel>{sub.label}</SectionLabel>
      <SectionBlock label={sub.evidenceLabel}>
        {sub.paragraphs?.map((p) => (
          <Body key={p.slice(0, 40)}>{p}</Body>
        ))}
        {sub.explainBullets?.length ? <Meta>{sub.explainBullets.join(' / ')}</Meta> : null}
      </SectionBlock>
      <SectionBlock label={sub.patternTitle}>
        {sub.patternBullets?.length ? <Meta>{sub.patternBullets.join(' / ')}</Meta> : null}
        {sub.patternCompare ? (
          <>
            <Meta>Instead of: {sub.patternCompare.generic}</Meta>
            <Body>{sub.patternCompare.recoverable}</Body>
          </>
        ) : null}
      </SectionBlock>
      <SectionBlock label="Outcome">
        <Body>{sub.outcome}</Body>
      </SectionBlock>
      {sub.anchor ? <Meta>{sub.anchor}</Meta> : null}
      {sub.visual ? (
        <DiagramFigure caption={sub.visual.caption}>
          <Case01Diagram type={sub.visual.diagram} />
        </DiagramFigure>
      ) : null}
    </article>
  );
}

function decisionOrderIndex(slug) {
  if (slug === 'd1') return 0;
  if (slug === 'd2') return 1;
  if (slug === 'd3') return 2;
  return -1;
}

function renderFlowNode(node, sectionPrefix, activeSection, sectionStageMap) {
  switch (node.type) {
    case 'project-inputs':
    case 'design-scope':
    case 'intro':
    case 'case-intro':
    case 'scope-clarification':
    case 'project-map':
    case 'decision-overview':
    case 'resulting-value':
      return null;

    case 'decision':
      {
        const activeIdx = decisionOrderIndex(activeSection);
        const nodeIdx = decisionOrderIndex(node.slug);
        const isActive = activeSection === node.slug;
        const isNear = !isActive && activeIdx >= 0 && nodeIdx >= 0 && Math.abs(activeIdx - nodeIdx) === 1;
        const stage = sectionStageMap[node.slug] ?? 0;
      return (
        <section
          key={node.id}
          id={`${sectionPrefix}-${node.slug}`}
          data-stage={stage}
          className={`case01-chapter case01-chapter--decision${
            node.featured || node.visualWeight === 'highest' ? ' case01-chapter--decision-featured' : ''
          }${isActive ? ' case01-chapter--decision-active' : ''}${isNear ? ' case01-chapter--decision-near' : ''} case01-reveal`}
        >
          {node.contextReminder ? (
            <>
              <div className="case01-decision-transition" aria-hidden="true" />
              <p className="case01-decision-context-reminder">{node.contextReminder}</p>
            </>
          ) : null}
          <article
            className={`case01-decision-card${
              node.featured || node.visualWeight === 'highest' ? ' case01-decision-card--featured' : ''
            }`}
          >
            <DecisionModule node={node} sectionPrefix={sectionPrefix} />
          </article>
        </section>
      );
      }

    case 'value':
      return (
        <section key={node.id} className="case01-chapter case01-chapter--value">
          <SectionLabel>{node.title}</SectionLabel>
          <Body>{node.lead}</Body>
          <ol className="case01-value-layers">
            {node.layers.map((l) => (
              <li key={l.num}>
                <Meta as="span">{l.num}</Meta>
                <Body bold>{l.title}</Body>
                <Meta as="span">{l.body}</Meta>
              </li>
            ))}
          </ol>
          <SectionBlock label="Conclusion">
            <Body>{node.close.join(' ')}</Body>
          </SectionBlock>
          {node.visual ? (
            <DiagramFigure caption={node.visual.caption}>
              <Case01Diagram type={node.visual.diagram} />
            </DiagramFigure>
          ) : null}
        </section>
      );

    default:
      return null;
  }
}

export function StagedCaseFlow({ flow, sectionPrefix = 'case01', activeSection = 'overview' }) {
  const flowRef = useRef(null);
  const introInputs = flow.find((n) => n.type === 'project-inputs');
  const introScope = flow.find((n) => n.type === 'design-scope');
  const introContract = flow.find((n) => n.type === 'intro');
  const introCompanion = flow.find((n) => n.type === 'case-intro');
  const scopeClarification = flow.find((n) => n.type === 'scope-clarification');
  const projectMap = flow.find((n) => n.type === 'project-map');
  const decisionOverview = flow.find((n) => n.type === 'decision-overview');
  const resultingValue = flow.find((n) => n.type === 'resulting-value');
  const isCase01 = sectionPrefix === 'case01';
  const isCase03 = sectionPrefix === 'case03';
  const isCase04 = sectionPrefix === 'case04';
  const [sectionStageMap, setSectionStageMap] = useState({ d1: 0, d2: 0, d3: 0 });

  useEffect(() => {
    const host = flowRef.current;
    if (!host) return undefined;
    const scrollRoot = host.closest('.work-case-detail__scroll');
    if (!scrollRoot) return undefined;
    const decisionIds = ['d1', 'd2', 'd3'];

    let rafId = 0;
    const run = () => {
      rafId = 0;
      const rootRect = scrollRoot.getBoundingClientRect();
      const next = {};
      decisionIds.forEach((slug) => {
        const section = host.querySelector(`#${sectionPrefix}-${slug}`);
        if (!section) {
          next[slug] = 0;
          return;
        }
        const rect = section.getBoundingClientRect();
        const start = rootRect.top + rootRect.height * 0.72;
        const end = rootRect.top + rootRect.height * 0.22;
        const progressRaw = (start - rect.top) / Math.max(1, start - end + rect.height * 0.12);
        const progress = Math.max(0, Math.min(1, progressRaw));
        const stage = progress < 0.15 ? 0 : progress < 0.35 ? 1 : progress < 0.5 ? 2 : progress < 0.8 ? 3 : 4;
        next[slug] = stage;
      });
      setSectionStageMap((prev) => {
        if (prev.d1 === next.d1 && prev.d2 === next.d2 && prev.d3 === next.d3) return prev;
        return next;
      });
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(run);
    };

    run();
    scrollRoot.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      scrollRoot.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [sectionPrefix]);

  return (
    <div ref={flowRef} className={`case01-flow case01-flow--${sectionPrefix}`}>
      <section id={`${sectionPrefix}-overview`} className="case01-chapter case01-chapter--overview case01-reveal">
        {isCase01 ? (
          <>
          <Case01Intro inputs={introInputs} scope={introScope} sectionPrefix={sectionPrefix} />
            {projectMap ? <ProjectMap node={projectMap} /> : null}
          </>
        ) : isCase03 ? (
          <>
            <Case03Intro node={introCompanion} />
            {scopeClarification ? <ScopeClarification node={scopeClarification} sectionPrefix={sectionPrefix} /> : null}
          </>
        ) : isCase04 ? (
          <>
            <Case04Intro node={introCompanion} />
            {scopeClarification ? <ScopeClarification node={scopeClarification} sectionPrefix={sectionPrefix} /> : null}
            {decisionOverview?.columns ? (
              <section className="case01-chapter case01-chapter--roadmap" aria-label="Decisions on this case">
                <DesignDecisionRoadmap columns={decisionOverview.columns} />
              </section>
            ) : null}
          </>
        ) : (
          <Case02Intro node={introContract} overview={decisionOverview} />
        )}
      </section>
      {flow.map((node) => (
        <div key={node.id}>
          {renderFlowNode(node, sectionPrefix, activeSection, sectionStageMap)}
          {sectionPrefix === 'case01' && node.type === 'decision' && node.slug === 'd1' ? (
            <section
              id={`${sectionPrefix}-d1-bridge`}
              className="case01-chapter case01-chapter--decision case01-chapter--transition-bridge"
            >
              <div className="case01-decision-transition" aria-hidden="true" />
              <div className="case01-registry-evidence">
                {getDecisionEvidenceImages(sectionPrefix, 'd1Bridge').map((item) => (
                  <EvidenceImage key={item.id} item={item} caseId={sectionPrefix} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ))}
      {resultingValue ? (
        <section id={`${sectionPrefix}-outcome`} className="case01-reveal">
          <ResultingValueBlock node={resultingValue} />
        </section>
      ) : null}
    </div>
  );
}

export function Case01StagedFlow() {
  return <StagedCaseFlow flow={CASE01_FLOW} sectionPrefix="case01" />;
}
