/**
 * Portfolio Shortcut — intent-to-evidence routing (not chat / FAQ / sitemap).
 */

import { KNOWLEDGE_EVIDENCE } from './portfolioShortcutKnowledge.js';

/** @typedef {{ type: 'section' | 'case' | 'capability', id: string }} ShortcutAction */

/** @typedef {{
 *   label: string,
 *   relevance: string,
 *   action: ShortcutAction,
 * }} ShortcutSecondaryLink
 */

/** @typedef {{
 *   num: string,
 *   title: string,
 *   signal: string,
 *   action: ShortcutAction,
 * }} ShortcutEvidenceRow
 */

/** @typedef {{
 *   routeId: string,
 *   intro: string,
 *   meaning?: string,
 *   evidence: ShortcutEvidenceRow[],
 *   continueRoutes: string[],
 *   visual?: string,
 *   primary?: ShortcutPrimaryAction,
 *   secondary?: ShortcutSecondaryLink[],
 * }} ShortcutRoutePanel
 */

/** @typedef {{
 *   label: string,
 *   helper: string,
 *   destinationLabel: string,
 *   action: ShortcutAction,
 * }} ShortcutPrimaryAction
 */

/** @typedef {{
 *   id: string,
 *   index: string,
 *   title: string,
 *   signal: string,
 *   eyebrow: string,
 *   oneLiner: string,
 *   question: string,
 *   intent: string,
 * }} ShortcutRoute
 */

export const SHORTCUT_ASK_CHIPS = [
  'Beyond UI',
  'AI workflow',
  'Human-in-the-loop',
  'Traceability',
];

export const SHORTCUT_DIRECT_CASES = [
  { id: 'case01', label: 'Conversational AI', action: { type: 'case', id: 'case01' } },
  { id: 'case02', label: 'Contract Intelligence', action: { type: 'case', id: 'case02' } },
  { id: 'case03', label: 'Supply Chain Agents', action: { type: 'case', id: 'case03' } },
  { id: 'case04', label: 'AI Companion', action: { type: 'case', id: 'case04' } },
];

export const SHORTCUT_ROUTES = [
  {
    id: 'requirements-to-product-logic',
    index: '01',
    title: 'From requirements to product logic',
    signal: 'Stakeholder needs → workflows, roles, acceptance criteria',
    eyebrow: 'Capability 01',
    oneLiner: 'Translates complex requirements into clear product structures.',
    question: 'How does Hedi handle complex requirements?',
    intent: 'requirements / BA-adjacent / structure-first',
  },
  {
    id: 'ai-output-to-workflow',
    index: '02',
    title: 'From AI output to operational workflow',
    signal: 'Output → next steps, handoffs, recovery, completion',
    eyebrow: 'Capability 02',
    oneLiner: 'Designs what happens after AI produces an answer.',
    question: 'How does Hedi design AI workflows beyond the interface?',
    intent: 'AI workflow / post-response / operationalization',
  },
  {
    id: 'automation-to-human-control',
    index: '03',
    title: 'From automation to human control',
    signal: 'Review · approve · override · escalate · own',
    eyebrow: 'Capability 03',
    oneLiner: 'Defines where people stay involved in automated processes.',
    question: 'Where does Hedi define human control in AI-supported workflows?',
    intent: 'human-in-the-loop / governance / control boundaries',
  },
  {
    id: 'decisions-to-traceable-systems',
    index: '04',
    title: 'From decisions to traceable systems',
    signal: 'Decision states · sources · audit · confirmation',
    eyebrow: 'Capability 04',
    oneLiner: 'Structures how decisions are made, reviewed, and traced.',
    question: 'How does Hedi make AI-assisted decisions reviewable?',
    intent: 'traceability / auditability / accountable completion',
  },
];

/** @deprecated alias — use SHORTCUT_ROUTES */
export const SHORTCUT_KEY_ANGLES = SHORTCUT_ROUTES;

/** @type {Record<string, ShortcutRoutePanel>} */
export const SHORTCUT_ROUTE_PANELS = {
  'requirements-to-product-logic': {
    routeId: 'requirements-to-product-logic',
    intro:
      'Verify how stakeholder needs, business constraints, and domain requirements become workflows, roles, decision logic, and acceptance criteria.',
    evidence: [
      {
        num: '01',
        title: 'From requirements to product logic',
        signal: 'Requirements translation · stakeholder alignment · workflow structure',
        action: { type: 'capability', id: 'requirements-to-product-logic' },
      },
      {
        num: '02',
        title: 'Supply Chain Agents',
        signal: 'Complex enterprise workflow structure',
        action: { type: 'case', id: 'case03' },
      },
      {
        num: '03',
        title: 'Contract Intelligence',
        signal: 'Review context and decision architecture',
        action: { type: 'case', id: 'case02' },
      },
    ],
    continueRoutes: ['ai-output-to-workflow', 'decisions-to-traceable-systems'],
  },
  'ai-output-to-workflow': {
    routeId: 'ai-output-to-workflow',
    intro:
      'Verify how AI output becomes continued work: next steps, handoffs, review moments, fallbacks, and recovery paths.',
    evidence: [
      {
        num: '01',
        title: 'Conversational AI',
        signal: 'Post-response workflow · routing · recovery · handoff',
        action: { type: 'case', id: 'case01' },
      },
      {
        num: '02',
        title: 'Contract Intelligence',
        signal: 'AI analysis → reviewable decision',
        action: { type: 'case', id: 'case02' },
      },
      {
        num: '03',
        title: 'From AI output to operational workflow',
        signal: 'Next-step flows · handoff logic · recovery flows',
        action: { type: 'capability', id: 'ai-output-to-workflow' },
      },
    ],
    continueRoutes: ['automation-to-human-control', 'requirements-to-product-logic'],
  },
  'automation-to-human-control': {
    routeId: 'automation-to-human-control',
    intro:
      'Verify where people review, approve, override, escalate, or take responsibility inside automated and AI-supported processes.',
    evidence: [
      {
        num: '01',
        title: 'Supply Chain Agents',
        signal: 'Human checkpoints · intervention gates · control boundaries',
        action: { type: 'case', id: 'case03' },
      },
      {
        num: '02',
        title: 'Contract Intelligence',
        signal: 'Human confirmation in AI-assisted review',
        action: { type: 'case', id: 'case02' },
      },
      {
        num: '03',
        title: 'From automation to human control',
        signal: 'Review points · approval gates · escalation logic',
        action: { type: 'capability', id: 'automation-to-human-control' },
      },
    ],
    continueRoutes: ['decisions-to-traceable-systems', 'ai-output-to-workflow'],
  },
  'decisions-to-traceable-systems': {
    routeId: 'decisions-to-traceable-systems',
    intro:
      'Verify how decisions are made, reviewed, documented, and traced across AI-assisted and enterprise workflows.',
    evidence: [
      {
        num: '01',
        title: 'Contract Intelligence',
        signal: 'Traceable review states · source visibility · audit trail',
        action: { type: 'case', id: 'case02' },
      },
      {
        num: '02',
        title: 'From decisions to traceable systems',
        signal: 'Decision states · review history · human confirmation',
        action: { type: 'capability', id: 'decisions-to-traceable-systems' },
      },
      {
        num: '03',
        title: 'Point of View',
        signal: 'Capability is not completion',
        action: { type: 'section', id: 'home-approach' },
      },
    ],
    continueRoutes: ['requirements-to-product-logic', 'automation-to-human-control'],
  },
};

/**
 * @param {string} routeId
 * @returns {ShortcutRoute | null}
 */
export function getShortcutRoute(routeId) {
  return SHORTCUT_ROUTES.find((r) => r.id === routeId) ?? null;
}

/**
 * @param {string} routeId
 * @returns {ShortcutRoutePanel | null}
 */
export function getShortcutRoutePanel(routeId) {
  return SHORTCUT_ROUTE_PANELS[routeId] ?? null;
}

/** @deprecated */
export const SHORTCUT_ANGLE_RESULTS = SHORTCUT_ROUTE_PANELS;

/** @deprecated */
export function getShortcutAngleResult(routeId) {
  return getShortcutRoutePanel(routeId);
}

/** Legacy — direct case strip + search routing */
export const SHORTCUT_PROOF_POINTS = [
  {
    id: 'case01',
    num: '01',
    title: 'Conversational AI',
    signal: 'Routing · recovery · post-response workflow',
    action: { type: 'case', id: 'case01' },
  },
  {
    id: 'case02',
    num: '02',
    title: 'Contract Intelligence',
    signal: 'Traceability · review ownership · source evidence',
    action: { type: 'case', id: 'case02' },
  },
  {
    id: 'case03',
    num: '03',
    title: 'Supply Chain Agents',
    signal: 'Agent control · intervention gates · orchestration',
    action: { type: 'case', id: 'case03' },
  },
  {
    id: 'case04',
    num: '04',
    title: 'AI Companion',
    signal: 'Continuity · return behavior · presence layer',
    action: { type: 'case', id: 'case04' },
  },
];

const ROUTE_MATCH_TERMS = {
  'requirements-to-product-logic': [
    'requirement',
    'stakeholder',
    'ambigu',
    'structure',
    'framing',
    'unclear',
    'brief',
    'messy',
    'vague',
    'domain',
    'acceptance',
    'business constraint',
    'translate',
    'ba ',
  ],
  'ai-output-to-workflow': [
    'usable',
    'workflow',
    'output',
    'handoff',
    'recovery',
    'operational',
    'post-response',
    'routing',
    'chatbot',
    'conversational',
    'ai work',
    'after ai',
    'next step',
  ],
  'automation-to-human-control': [
    'human',
    'loop',
    'control',
    'intervention',
    'override',
    'approve',
    'escalation',
    'governance',
    'automation',
    'responsibility',
    'checkpoint',
  ],
  'decisions-to-traceable-systems': [
    'traceability',
    'traceable',
    'audit',
    'reviewable',
    'decision',
    'source',
    'confirmation',
    'compliance',
    'history',
    'accountable',
  ],
};

/** Legacy route ids → current capability-aligned routes */
const LEGACY_ROUTE_ALIASES = {
  'ambiguity-structure': 'requirements-to-product-logic',
  'ai-usable-work': 'ai-output-to-workflow',
  'design-role-expansion': 'requirements-to-product-logic',
  'human-ai-relationship': 'automation-to-human-control',
};

/**
 * @param {string} question
 * @returns {ShortcutRoute | null}
 */
export function matchShortcutRoute(question) {
  const text = String(question ?? '')
    .trim()
    .toLowerCase()
    .replace(/[?!.]+$/g, '');
  if (!text) return null;

  let bestId = null;
  let bestScore = 0;

  for (const route of SHORTCUT_ROUTES) {
    const terms = ROUTE_MATCH_TERMS[route.id] ?? [];
    let score = 0;
    for (const term of terms) {
      if (text.includes(term)) score += 1;
    }
    if (route.question.toLowerCase().includes(text) || text.includes(route.title.toLowerCase())) {
      score += 3;
    }
    if (score > bestScore) {
      bestScore = score;
      bestId = route.id;
    }
  }

  return bestScore > 0 ? getShortcutRoute(bestId) : null;
}

/**
 * @param {string} routeId
 * @returns {ShortcutRoute | null}
 */
export function resolveShortcutRouteId(routeId) {
  const resolved = LEGACY_ROUTE_ALIASES[routeId] ?? routeId;
  return getShortcutRoute(resolved);
}

/** Chip label → suggested ask query */
export const SHORTCUT_CHIP_QUERIES = {
  'Beyond UI': 'What shows that Hedi works beyond UI screens?',
  'AI workflow': 'How does Hedi design AI workflows beyond the interface?',
  'Human-in-the-loop': 'Where does Hedi define human control in AI-supported workflows?',
  Traceability: 'How does Hedi make AI-assisted decisions reviewable?',
};

export { KNOWLEDGE_EVIDENCE };
