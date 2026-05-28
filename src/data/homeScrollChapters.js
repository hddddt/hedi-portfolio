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
  case01: '#2a5a52',
  case02: '#9a7224',
  case03: '#c45f2a',
  case04: '#c4b8ce',
};

/**
 * Work narrative right column — verbatim copy (do not paraphrase).
 * Hyphens: U+2011 where the source used non-breaking hyphens (e.g. workflow‑aligned).
 */
export const WORK_NARRATIVE_EXACT = {
  case01: {
    title: 'CONVERSATIONAL AI',
    subtitle: 'Enterprise Conversational UX & Workflow Alignment',
    bullets: [
      'Mapped user goals and service touchpoints into a coherent conversational strategy that anticipates needs, clarifies roles, and aligns AI interventions with real outcomes.',
      'Defined interaction patterns (intent, fallback, validation, escalation) that ensure conversations reliably lead to task resolution rather than dead ends.',
      'Integrated dialogue outputs with downstream systems (handoffs, agents, APIs, Cognigy flows) so AI responses trigger meaningful operational actions.',
    ],
    keySignalsLine:
      'Key signals: workflow\u2011aligned conversation strategy, human-AI interaction design, system integration.',
    tags: [
      'CONVERSATIONAL AI',
      'workflow\u2011aligned conversation strategy',
      'human-AI interaction design',
      'system integration',
    ],
  },
  case02: {
    title: 'CONTRACT INTELLIGENCE',
    subtitle: 'Human\u2011in\u2011the\u2011Loop & Auditable Workflow Design',
    bullets: [
      'Translated contract review processes into structured units (clause, classification, answer, rationale, state) that make AI output actionable and reviewable.',
      'Separated AI suggestions, user edits, and legal decisions so judgment remains visible, owned, and traceable throughout the workflow.',
      'Built clear audit paths and decision boundaries so reviewers can verify, correct, and own contract outcomes.',
    ],
    keySignalsLine:
      'Key signals: human\u2011in\u2011the\u2011loop design, governance UX, traceability in AI workflows.',
    tags: [
      'CONTRACT INTELLIGENCE',
      'human\u2011in\u2011the\u2011loop design',
      'governance UX',
      'traceability in AI workflows',
    ],
  },
  case03: {
    title: 'SUPPLY CHAIN AGENTS',
    subtitle: 'Agentic Workflow & Human Control Integration',
    bullets: [
      'Defined when AI agents act autonomously, when they defer, and when humans intervene to maintain control in operational flows.',
      'Turned alerts and exceptions into decision gates with context and explicit intervention points.',
      'Unified agents, alerts, and conversational touchpoints into an execution model that balances autonomy with oversight.',
    ],
    keySignalsLine: 'Key signals: agentic workflows, control design, exception handling UX.',
    tags: [
      'SUPPLY CHAIN AGENTS',
      'agentic workflows',
      'control design',
      'exception handling UX',
    ],
  },
  case04: {
    title: 'AI COMPANION',
    subtitle: 'Presence & Continuity\u2011Driven Engagement Design',
    bullets: [
      'Shifted design focus from isolated interactions to persistent companion presence grounded in user context and behavior.',
      'Used continuity signals (memory, session state, preference cues) to create low-friction return paths and personalized engagement.',
      'Reframed engagement metrics from single sessions to accumulated relational indicators.',
    ],
    keySignalsLine:
      'Key signals: companion experience design, continuity UX, adaptive engagement.',
    tags: [
      'AI COMPANION',
      'companion experience design',
      'continuity UX',
      'adaptive engagement',
    ],
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
  headline: 'I bring structure to complex products.',
  intro:
    'Where AI, workflows, decisions, and ownership need to become usable in real operations.',
  footer: '',
};

export const homeCapabilities = [
  {
    id: 'product-framing',
    code: '01',
    label: 'Product Framing',
    headline: 'Product Framing',
    headlineLines: ['Product Framing'],
    railLabelLines: ['Product Framing'],
    description: 'What problem should the product solve — and why now?',
    pillsPrimary: [
      'Problem definition',
      'User needs',
      'Business goals',
      'Use cases',
      'Product requirements',
      'Stakeholder alignment',
    ],
    pillsSecondary: [
      'Product discovery',
      'User journeys',
      'Jobs-to-be-done',
      'Scope definition',
    ],
  },
  {
    id: 'product-experience',
    code: '02',
    label: 'Product Experience Design',
    headline: 'Product Experience Design',
    headlineLines: ['Product Experience', 'Design'],
    railLabelLines: ['Product Experience', 'Design'],
    description: 'How does the product become clear, usable, and buildable?',
    pillsPrimary: [
      'User flows',
      'Information architecture',
      'Wireframes',
      'Prototypes',
      'Interaction patterns',
      'Design systems',
    ],
    pillsSecondary: [
      'Usability testing',
      'Edge cases',
      'Accessibility',
      'Developer handoff',
    ],
  },
  {
    id: 'ai-workflow-architecture',
    code: '03',
    label: 'AI Workflow & Service Architecture',
    headline: 'AI Workflow & Service Architecture',
    headlineLines: ['AI Workflow &', 'Service Architecture'],
    railLabelLines: ['AI Workflow &', 'Service Architecture'],
    description: 'How should AI, users, tools, and systems move work toward completion?',
    pillsPrimary: [
      'Human-AI workflows',
      'Agentic workflows',
      'Conversation flows',
      'Service flows',
      'System states',
      'Tool integrations',
    ],
    pillsSecondary: [
      'Backend integration',
      'Task automation',
      'Knowledge base integration',
      'Workflow orchestration',
    ],
  },
  {
    id: 'decision-trust-control',
    code: '04',
    label: 'Decision, Trust & Control',
    headline: 'Decision, Trust & Control',
    headlineLines: ['Decision,', 'Trust & Control'],
    railLabelLines: ['Decision,', 'Trust & Control'],
    description: 'How do people verify, intervene, and stay responsible when AI is involved?',
    pillsPrimary: [
      'Human-in-the-loop',
      'Traceability',
      'Explainability',
      'Source attribution',
      'Escalation paths',
      'Approval flows',
    ],
    pillsSecondary: [
      'Audit trails',
      'Confidence signals',
      'Risk controls',
      'Governance workflows',
    ],
  },
];
