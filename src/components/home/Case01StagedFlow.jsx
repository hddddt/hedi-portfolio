import { useState } from 'react';
import { CASE01_FLOW } from '../../data/workCaseDetailCase01.js';
import { DECISION_01_UX_ARTIFACT } from '../../data/case01ShsArtifacts.js';

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

const GRID_LABELS = [
  ['challenge', 'Challenge'],
  ['focus', 'Focus'],
  ['role', 'My Role'],
  ['solution', 'Solution'],
];

function DecisionGrid({ grid }) {
  if (!grid) return null;
  return (
    <div className="case01-decision-grid" role="list">
      {GRID_LABELS.map(([key, label]) => (
        <div key={key} className="case01-decision-grid__cell" role="listitem">
          <p className="case01-decision-grid__label">{label}</p>
          <p className="case01-decision-grid__text">{grid[key]}</p>
        </div>
      ))}
    </div>
  );
}

function ArtifactInsetPanel({ artifact }) {
  const { inset } = artifact ?? {};
  if (!inset?.src) return null;
  return (
    <figure className="case01-artifact case01-artifact--compact">
      <div className="case01-artifact__frame case01-artifact__frame--inset">
        <img
          src={inset.src}
          alt={inset.alt ?? inset.title}
          className="case01-artifact__img"
          loading="lazy"
          decoding="async"
        />
      </div>
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
      <div className="case01-artifact__frame case01-artifact__frame--panel">
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
      <div className="case01-artifact__frame case01-artifact__frame--panel">
        <img
          src={panel.src}
          alt={panel.alt ?? panel.title}
          className="case01-artifact__img"
          loading="lazy"
          decoding="async"
        />
      </div>
      {panel.title ? <p className="case01-artifact__panel-title">{panel.title}</p> : null}
      {panel.caption ? (
        <figcaption className="case01-artifact__caption">{panel.caption}</figcaption>
      ) : null}
    </figure>
  );
}

function ProjectInputStrips({ items }) {
  if (!items?.length) return null;
  return (
    <div className="case01-inputs" role="list" aria-label="Project inputs">
      {items.map((item) => (
        <div key={item.tag} className="case01-inputs__strip" role="listitem">
          <p className="case01-inputs__tag">{item.tag}</p>
          <p className="case01-inputs__body">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

function DesignDecisionRoadmap({ lead, columns }) {
  if (!columns?.length) return null;
  return (
    <div className="case01-scope-decisions">
      {lead ? <p className="case01-body case01-scope-decisions__lead">{lead}</p> : null}
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

function DecisionAppliedIn({ items }) {
  if (!items?.length) return null;
  return (
    <div className="case01-decision-block case01-decision-applied">
      <p className="case01-decision-block__heading">Applied in</p>
      <ul className="case01-decision-applied__list">
        {items.map((item) => (
          <li key={item.project} className="case01-decision-applied__item">
            <span className="case01-decision-applied__project">{item.project}</span>
            <span className="case01-decision-applied__sep" aria-hidden="true">
              —
            </span>
            <span className="case01-decision-applied__text">{item.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function AppliedInTabPanel({ tab, uxArtifact, knowledgeArtifact, flowArtifact }) {
  if (!tab) return null;
  return (
    <div
      className="case01-applied-panel"
      role="tabpanel"
      id={`applied-panel-${tab.id}`}
      aria-labelledby={`applied-tab-${tab.id}`}
    >
      {tab.question ? (
        <div className="case01-applied-question">
          <p className="case01-applied-question__label">Question</p>
          <p className="case01-applied-question__text">{tab.question}</p>
        </div>
      ) : null}
      <DecisionGrid grid={tab.grid} />
      <DecisionArtifacts
        items={tab.artifacts}
        uxArtifact={uxArtifact}
        knowledgeArtifact={knowledgeArtifact}
        flowArtifact={flowArtifact}
      />
      {tab.outcome ? (
        <div className="case01-decision-outcome">
          <p className="case01-decision-outcome__label">Outcome</p>
          <p className="case01-decision-outcome__text">{tab.outcome}</p>
        </div>
      ) : null}
    </div>
  );
}

function AppliedInTabs({ tabs, uxArtifact, knowledgeArtifact, flowArtifact }) {
  const [activeId, setActiveId] = useState(tabs[0]?.id ?? '');
  if (!tabs?.length) return null;

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <div className="case01-applied-tabs">
      <p className="case01-decision-block__heading">Applied in</p>
      <div
        className="case01-applied-tabs__bar"
        role="tablist"
        aria-label="Applied in project contexts"
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`applied-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`applied-panel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              className={`case01-applied-tabs__tab${isActive ? ' case01-applied-tabs__tab--active' : ''}`}
              onClick={() => setActiveId(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <AppliedInTabPanel
        tab={activeTab}
        uxArtifact={uxArtifact}
        knowledgeArtifact={knowledgeArtifact}
        flowArtifact={flowArtifact}
      />
    </div>
  );
}

function resolveArtifactPanel(item, knowledgeArtifact, flowArtifact) {
  const bundle = knowledgeArtifact ?? flowArtifact;
  return bundle?.panels?.find((p) => p.id === item.artifactId);
}

function DecisionArtifactItem({ item, uxArtifact, knowledgeArtifact, flowArtifact }) {
  if (!item) return null;
  if (item.type === 'artifact-image') {
    const panel = resolveArtifactPanel(item, knowledgeArtifact, flowArtifact);
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
        {item.label ? <p className="case01-decision-artifacts__label">{item.label}</p> : null}
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
    <div className="case01-decision-block case01-decision-artifacts">
      <p className="case01-decision-block__heading">Design artifacts</p>
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

function DecisionModule({ node }) {
  const hasAppliedTabs = Boolean(node.appliedInTabs?.length);

  return (
    <div className="case01-decision-module">
      {node.subtitle ? <p className="case01-decision-module__subtitle">{node.subtitle}</p> : null}
      {node.aiProblem ? (
        <div className="case01-decision-problem">
          <p className="case01-decision-problem__label">AI Problem</p>
          <p className="case01-decision-problem__text">{node.aiProblem}</p>
        </div>
      ) : null}
      {node.coreMove ? (
        <div className="case01-decision-move">
          <p className="case01-decision-move__label">Core Move</p>
          <p className="case01-decision-move__text">{node.coreMove}</p>
        </div>
      ) : null}

      {hasAppliedTabs ? (
        <AppliedInTabs
          tabs={node.appliedInTabs}
          uxArtifact={node.uxArtifact}
          knowledgeArtifact={node.knowledgeArtifact}
        />
      ) : (
        <>
          {node.grid ? <DecisionGrid grid={node.grid} /> : null}
          <DecisionAppliedIn items={node.appliedIn} />
          <DecisionArtifacts
            items={node.artifacts}
            uxArtifact={node.uxArtifact}
            knowledgeArtifact={node.knowledgeArtifact}
            flowArtifact={node.flowArtifact}
          />
          {node.outcome ? (
            <div className="case01-decision-outcome">
              <p className="case01-decision-outcome__label">Outcome</p>
              <p className="case01-decision-outcome__text">{node.outcome}</p>
            </div>
          ) : null}
        </>
      )}

      {node.implementationNote ? <p className="case01-decision-note">{node.implementationNote}</p> : null}
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

function renderFlowNode(node) {
  switch (node.type) {
    case 'project-inputs':
      return (
        <section key={node.id} className="case01-chapter case01-chapter--inputs">
          <SectionLabel>{node.title}</SectionLabel>
          <Body className="case01-body--inputs-intro">{node.body}</Body>
          <ProjectInputStrips items={node.projects} />
        </section>
      );

    case 'design-scope':
      return (
        <section key={node.id} className="case01-chapter case01-chapter--scope">
          <SectionLabel>{node.title}</SectionLabel>
          <MainTitle lines={node.mainTitle} />
          {(node.bodyParagraphs ?? (node.body ? [node.body] : [])).map((p) => (
            <Body key={p.slice(0, 48)}>{p}</Body>
          ))}
          <DesignDecisionRoadmap lead={node.layersLead} columns={node.columns} />
        </section>
      );

    case 'decision':
      return (
        <section
          key={node.id}
          id={`case01-${node.slug}`}
          className="case01-chapter case01-chapter--decision"
        >
          <article className="case01-decision-card">
            <header className="case01-decision-card__header">
              <p className="case01-decision-card__d">
                DECISION {node.d.slice(1).padStart(2, '0')}
              </p>
              <MainTitle className="case01-decision-card__title">{node.title}</MainTitle>
            </header>
            {node.module ? <DecisionModule node={node} /> : null}
          </article>
        </section>
      );

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

export function Case01StagedFlow() {
  return <div className="case01-flow">{CASE01_FLOW.map((node) => renderFlowNode(node))}</div>;
}
