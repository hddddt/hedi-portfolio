import { cases } from './cases.js';
import case01Cover from '../assets/work/case01.png';
import case02Cover from '../assets/work/case02.png';
import case03Cover from '../assets/work/case03.png';
import case04Cover from '../assets/work/case04.png';

export const WORK_COVERS = {
  case01: case01Cover,
  case02: case02Cover,
  case03: case03Cover,
  case04: case04Cover,
};

const NARRATIVE_ACCENTS = {
  case01: '#c47840',
  case02: '#9a7224',
  case03: '#8a5c48',
  case04: '#a898b8',
};

/**
 * Work narrative right column — verbatim copy (do not paraphrase).
 * Hyphens: U+2011 where the source used non-breaking hyphens (e.g. workflow‑aligned).
 */
export const WORK_NARRATIVE_EXACT = {
  case01: {
    title: 'CONVERSATIONAL AI',
    subtitle: 'Enterprise Conversational UX & Workflow Alignment',
    thesis:
      'Conversation strategy aligned to service outcomes—routing intent before response, then wiring dialogue into real handoffs and operations.',
    signals: [
      'Route intent before the assistant answers',
      'Patterns that resolve toward a task, not a dead end',
      'Dialogue tied to handoffs, agents, and downstream systems',
    ],
    primaryTags: ['workflow-aligned strategy', 'human–AI interaction', 'system integration'],
  },
  case02: {
    title: 'CONTRACT INTELLIGENCE',
    subtitle: 'Human\u2011in\u2011the\u2011Loop & Auditable Workflow Design',
    thesis:
      'Contract review as structured, reviewable units—AI suggestions separated from human judgment with clear audit paths.',
    signals: [
      'Clause-level structure: classification, answer, rationale, state',
      'Visible ownership between AI suggestion and legal decision',
      'Traceable paths for verify, correct, and sign-off',
    ],
    primaryTags: ['human-in-the-loop', 'governance UX', 'traceability'],
  },
  case03: {
    title: 'SUPPLY CHAIN AGENTS',
    subtitle: 'Agentic Workflow & Human Control Integration',
    thesis:
      'Agentic flows with explicit control—when to act, defer, or intervene, and how exceptions become decision gates.',
    signals: [
      'Autonomy boundaries with human override points',
      'Alerts and exceptions as structured decision gates',
      'Agents, alerts, and touchpoints in one execution model',
    ],
    primaryTags: ['agentic workflows', 'control design', 'exception handling'],
  },
  case04: {
    title: 'AI COMPANION',
    subtitle: 'Presence & Continuity\u2011Driven Engagement Design',
    thesis:
      'Companion presence over interaction volume—continuity signals that make return feel low-friction and relational.',
    signals: [
      'Persistent presence grounded in context and behavior',
      'Memory and session cues for low-friction return',
      'Engagement read through accumulated continuity, not sessions alone',
    ],
    primaryTags: ['companion experience', 'continuity UX', 'adaptive engagement'],
  },
};

/** Pinned work narrative — synced with portfolio `cases` overview + hero graphic */
export const homeScrollChapters = cases.map((c) => {
  const o = c.overview;
  const num = o.num.replace(/^Case\s+/i, '').trim();
  return {
    id: c.id,
    num,
    title: o.title,
    layer: o.layer,
    tension: o.tension,
    signal: o.signal,
    accent: NARRATIVE_ACCENTS[c.id] ?? '#3d5c56',
    cta: `Explore ${o.title}`,
    graphicVariant: c.hero.graphicVariant,
    coverSrc: WORK_COVERS[c.id],
    aside: c.aside,
    narrativeBlock: WORK_NARRATIVE_EXACT[c.id],
  };
});

/** Capability section — static copy + scroll-driven panels (home narrative) */
export const capabilitySectionCopy = {
  title: 'What I structure',
  headline: 'I turn complexity into product logic.',
  intro:
    'Across AI and enterprise workflows, I structure requirements, roles, decisions, handoffs, and control points into usable product systems.',
  footer: '',
};

/** Per-capability ambient tint — residual field memory, not decorative blobs. */
export const CAPABILITY_THEMES = {
  'requirements-to-product-logic': {
    residualA: 'rgba(128, 148, 108, 0.14)',
    residualB: 'rgba(72, 98, 118, 0.06)',
    residualC: 'rgba(148, 122, 88, 0.05)',
    wash: 'rgba(108, 98, 88, 0.04)',
  },
  'ai-output-to-workflow': {
    residualA: 'rgba(102, 138, 128, 0.13)',
    residualB: 'rgba(82, 118, 128, 0.06)',
    residualC: 'rgba(142, 118, 92, 0.05)',
    wash: 'rgba(98, 112, 108, 0.04)',
  },
  'automation-to-human-control': {
    residualA: 'rgba(112, 128, 102, 0.12)',
    residualB: 'rgba(128, 122, 108, 0.06)',
    residualC: 'rgba(132, 112, 92, 0.05)',
    wash: 'rgba(118, 112, 100, 0.04)',
  },
  'decisions-to-traceable-systems': {
    residualA: 'rgba(98, 118, 108, 0.12)',
    residualB: 'rgba(88, 108, 128, 0.06)',
    residualC: 'rgba(138, 108, 92, 0.05)',
    wash: 'rgba(104, 96, 92, 0.04)',
  },
};

export const homeCapabilities = [
  {
    id: 'requirements-to-product-logic',
    code: '01',
    label: 'From requirements to product logic',
    headline: 'From requirements to product logic',
    headlineLines: ['From requirements', 'to product logic'],
    railLabelLines: ['From requirements', 'to product logic'],
    positioning:
      'I translate complex stakeholder needs, business constraints, and domain requirements into clear workflows, roles, decision logic, and acceptance criteria.',
    pillsPrimary: [
      'requirements translation',
      'stakeholder alignment',
      'workflow structure',
    ],
    pillsSecondary: ['role logic', 'acceptance criteria', 'business constraints'],
  },
  {
    id: 'ai-output-to-workflow',
    code: '02',
    label: 'From AI output to operational workflow',
    headline: 'From AI output to operational workflow',
    headlineLines: ['From AI output', 'to operational workflow'],
    railLabelLines: ['From AI output', 'to operational workflow'],
    positioning:
      'I design how AI-generated outputs continue as usable work: next steps, handoffs, review moments, fallbacks, and recovery paths.',
    pillsPrimary: ['next-step flows', 'handoff logic', 'fallback paths'],
    pillsSecondary: ['human review', 'recovery flows', 'follow-up actions'],
  },
  {
    id: 'automation-to-human-control',
    code: '03',
    label: 'From automation to human control',
    headline: 'From automation to human control',
    headlineLines: ['From automation', 'to human control'],
    railLabelLines: ['From automation', 'to human control'],
    positioning:
      'I define where people need to review, approve, override, escalate, or take responsibility inside automated and AI-supported processes.',
    pillsPrimary: ['review points', 'approval gates', 'override paths'],
    pillsSecondary: ['escalation logic', 'control boundaries', 'exception handling'],
  },
  {
    id: 'decisions-to-traceable-systems',
    code: '04',
    label: 'From decisions to traceable systems',
    headline: 'From decisions to traceable systems',
    headlineLines: ['From decisions', 'to traceable systems'],
    railLabelLines: ['From decisions', 'to traceable systems'],
    positioning:
      'I structure how decisions are made, reviewed, documented, and traced across AI-assisted workflows and complex enterprise processes.',
    pillsPrimary: ['decision states', 'source visibility', 'audit trail'],
    pillsSecondary: ['review history', 'human confirmation', 'traceability'],
  },
];
