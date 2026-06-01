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
    id: 'ai-problem-framing',
    code: '01',
    label: 'AI Problem Framing',
    headline: 'AI Problem Framing',
    headlineLines: ['AI Problem Framing'],
    railLabelLines: ['AI Problem', 'Framing'],
    positioning: 'Where AI ambition becomes a product problem.',
    pillsPrimary: ['AI role definition', 'workflow gap analysis', 'success criteria'],
    pillsSecondary: [
      'task reframing',
      'risk framing',
      'constraint mapping',
      'feature / no-feature judgment',
    ],
  },
  {
    id: 'human-ai-workflow-design',
    code: '02',
    label: 'Human-AI Workflow Design',
    headline: 'Human-AI Workflow Design',
    headlineLines: ['Human-AI', 'Workflow Design'],
    railLabelLines: ['Human-AI', 'Workflow Design'],
    positioning: 'Where AI output becomes continued work.',
    pillsPrimary: ['routing logic', 'handoff design', 'workflow continuation'],
    pillsSecondary: [
      'fallback paths',
      'clarification loops',
      'human intervention',
      'service recovery',
    ],
  },
  {
    id: 'decision-traceability',
    code: '03',
    label: 'Decision Traceability',
    headline: 'Decision Traceability',
    headlineLines: ['Decision', 'Traceability'],
    railLabelLines: ['Decision', 'Traceability'],
    positioning: 'Where AI-assisted judgment becomes reviewable.',
    pillsPrimary: ['review states', 'source visibility', 'confirmation logic'],
    pillsSecondary: ['audit trail', 'human modification', 'decision record', 'provenance'],
  },
  {
    id: 'human-in-the-loop-control',
    code: '04',
    label: 'Human-in-the-loop Control',
    headline: 'Human-in-the-loop Control',
    headlineLines: ['Human-in-the-loop Control'],
    railLabelLines: ['Human-in-the-loop', 'Control'],
    positioning: 'Where automation meets human responsibility.',
    pillsPrimary: ['control boundaries', 'intervention points', 'approval gates'],
    pillsSecondary: [
      'exception handling',
      'escalation logic',
      'monitoring reduction',
      'trust calibration',
    ],
  },
  {
    id: 'ai-continuity-presence',
    code: '05',
    label: 'AI Continuity & Presence',
    headline: 'AI Continuity & Presence',
    headlineLines: ['AI Continuity', '& Presence'],
    railLabelLines: ['AI Continuity', '& Presence'],
    positioning: 'Where interaction becomes an ongoing relationship.',
    pillsPrimary: ['state continuity', 'return logic', 'presence cues'],
    pillsSecondary: [
      'session memory',
      'engagement loop',
      'low-friction re-entry',
      'relationship rhythm',
    ],
  },
];
