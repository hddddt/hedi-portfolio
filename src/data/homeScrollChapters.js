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
  headline: 'I bring structure to complex products.',
  intro:
    'Where AI, workflows, decisions, and ownership need to become usable in real operations.',
  footer: '',
};

/** Per-capability ambient tint — residual field memory, not decorative blobs. */
export const CAPABILITY_THEMES = {
  'ai-problem-framing': {
    residualA: 'rgba(128, 148, 108, 0.14)',
    residualB: 'rgba(72, 98, 118, 0.06)',
    residualC: 'rgba(148, 122, 88, 0.05)',
    wash: 'rgba(108, 98, 88, 0.04)',
  },
  'human-ai-workflow-design': {
    residualA: 'rgba(102, 138, 128, 0.13)',
    residualB: 'rgba(82, 118, 128, 0.06)',
    residualC: 'rgba(142, 118, 92, 0.05)',
    wash: 'rgba(98, 112, 108, 0.04)',
  },
  'decision-traceability': {
    residualA: 'rgba(98, 118, 108, 0.12)',
    residualB: 'rgba(88, 108, 128, 0.06)',
    residualC: 'rgba(138, 108, 92, 0.05)',
    wash: 'rgba(104, 96, 92, 0.04)',
  },
  'human-in-the-loop-control': {
    residualA: 'rgba(112, 128, 102, 0.12)',
    residualB: 'rgba(128, 122, 108, 0.06)',
    residualC: 'rgba(132, 112, 92, 0.05)',
    wash: 'rgba(118, 112, 100, 0.04)',
  },
  'ai-continuity-presence': {
    residualA: 'rgba(96, 128, 138, 0.12)',
    residualB: 'rgba(78, 112, 122, 0.06)',
    residualC: 'rgba(142, 118, 96, 0.05)',
    wash: 'rgba(96, 118, 112, 0.04)',
  },
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
    pillsPrimary: ['role definition', 'workflow gaps', 'success criteria'],
    pillsSecondary: ['task definition', 'risk points', 'constraints', 'feature scope'],
  },
  {
    id: 'human-ai-workflow-design',
    code: '02',
    label: 'Human-AI Workflow Design',
    headline: 'Human-AI Workflow Design',
    headlineLines: ['Human-AI', 'Workflow Design'],
    railLabelLines: ['Human-AI', 'Workflow Design'],
    positioning: 'Where AI output becomes continued work.',
    pillsPrimary: ['routing logic', 'handoff design', 'next-step flows'],
    pillsSecondary: ['fallback paths', 'follow-up flows', 'human review', 'recovery flows'],
  },
  {
    id: 'decision-traceability',
    code: '03',
    label: 'Decision Traceability',
    headline: 'Decision Traceability',
    headlineLines: ['Decision', 'Traceability'],
    railLabelLines: ['Decision', 'Traceability'],
    positioning: 'Where AI-assisted judgment becomes reviewable.',
    pillsPrimary: ['review steps', 'source visibility', 'audit trail'],
    pillsSecondary: [
      'confirmation steps',
      'human override',
      'decision history',
      'source record',
    ],
  },
  {
    id: 'human-in-the-loop-control',
    code: '04',
    label: 'Human-in-the-loop Control',
    headline: 'Human-in-the-loop Control',
    headlineLines: ['Human-in-the-', 'loop Control'],
    railLabelLines: ['Human-in-the-loop', 'Control'],
    positioning: 'Where automation meets human responsibility.',
    pillsPrimary: ['control boundaries', 'handoff points', 'approval gates'],
    pillsSecondary: [
      'escalation logic',
      'exception handling',
      'review load',
      'trust signals',
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
    pillsPrimary: ['session continuity', 'return logic', 'memory support'],
    pillsSecondary: [
      're-entry flows',
      'presence signals',
      'continuity cues',
      'return patterns',
    ],
  },
];
