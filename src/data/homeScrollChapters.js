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

/** Capability dial — scroll-driven active state (home narrative) */
export const homeCapabilities = [
  {
    id: 'ai-systems',
    code: '01',
    label: 'AI Systems',
    headline: 'AI Systems',
    description:
      'Defining how AI enters real workflows: what it should support, automate, validate, escalate, or hand off.',
    pills: [
      'AI role definition',
      'workflow integration',
      'uncertainty handling',
      'fallback logic',
      'escalation paths',
    ],
  },
  {
    id: 'product-structure',
    code: '02',
    label: 'Product Structure',
    headline: 'Product Structure',
    description: 'Making complex enterprise products easier to understand, operate, and scale.',
    pills: [
      'Information architecture',
      'Product logic',
      'Workflow mapping',
      'System mapping',
      'User flows',
    ],
  },
  {
    id: 'decision-design',
    code: '03',
    label: 'Decision Design',
    headline: 'Decision Design',
    description:
      'Turning AI outputs into reviewable decisions with states, ownership, provenance, and traceability.',
    pills: ['answer states', 'review logic', 'provenance', 'decision ownership', 'auditability'],
  },
  {
    id: 'human-ai',
    code: '04',
    label: 'Human-AI Collaboration',
    headline: 'Human–AI Collaboration',
    description: 'Defining when AI acts, when humans intervene, and how control moves between them.',
    pills: [
      'control boundaries',
      'intervention points',
      'handoff logic',
      'trust calibration',
      'escalation model',
    ],
  },
  {
    id: 'product-strategy',
    code: '05',
    label: 'Product Strategy',
    headline: 'Product Strategy',
    description:
      'Translating ambiguous AI opportunities into product direction, value logic, and operating structure.',
    pills: ['problem framing', 'value translation', 'prioritization', 'roadmap logic', 'system positioning'],
  },
];
