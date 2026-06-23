/**
 * Portfolio Shortcut — canonical knowledge framework (positioning, capabilities, evidence, answers).
 * Answers must stay within portfolio evidence; no invented metrics or generic AI advice.
 */

/** @typedef {{ type: 'section' | 'case' | 'capability', id: string }} ShortcutAction */

/** @typedef {{
 *   label: string,
 *   description: string,
 *   action: ShortcutAction,
 * }} KnowledgeEvidenceRow
 */

/** @typedef {{
 *   id: string,
 *   matchTerms: string[],
 *   matchPhrases?: string[],
 *   title: string,
 *   shortAnswer: string,
 *   points: string[],
 *   whereToLook: KnowledgeEvidenceRow[],
 *   continueRoutes?: string[],
 * }} ShortcutAnswerTemplate
 */

export const ROLE_POSITIONING = {
  core: 'Hedi turns complexity into product logic.',
  expanded:
    'Across AI and enterprise workflows, Hedi structures requirements, roles, decisions, handoffs, validation points, and control boundaries into usable product systems.',
  role:
    'Product / UX Designer at the intersection of AI, enterprise workflows, business requirements, and system logic — not positioned as UI-only.',
};

export const OUT_OF_SCOPE_FALLBACK = {
  title: 'Within portfolio scope',
  shortAnswer:
    'This shortcut only answers questions about Hedi\u2019s work, capabilities, and portfolio evidence. Try asking about AI workflow, role fit, human-in-the-loop control, traceability, or complex requirements.',
  points: [],
  whereToLook: [
    {
      label: 'What I structure',
      description: 'Four lenses for how she works.',
      action: { type: 'section', id: 'home-capabilities' },
    },
    {
      label: 'Selected Work',
      description: 'Cases 01\u201304 as proof.',
      action: { type: 'section', id: 'home-work-narrative' },
    },
  ],
};

/** Shared evidence rows — reusable across templates and routes. */
export const KNOWLEDGE_EVIDENCE = {
  requirementsCapability: {
    label: 'What I structure \u2014 From requirements to product logic',
    description: 'Requirements translation \u00b7 workflow structure \u00b7 acceptance criteria',
    action: { type: 'capability', id: 'requirements-to-product-logic' },
  },
  aiOutputCapability: {
    label: 'What I structure \u2014 From AI output to operational workflow',
    description: 'Next-step flows \u00b7 handoff logic \u00b7 recovery paths',
    action: { type: 'capability', id: 'ai-output-to-workflow' },
  },
  humanControlCapability: {
    label: 'What I structure \u2014 From automation to human control',
    description: 'Review points \u00b7 approval gates \u00b7 escalation logic',
    action: { type: 'capability', id: 'automation-to-human-control' },
  },
  traceabilityCapability: {
    label: 'What I structure \u2014 From decisions to traceable systems',
    description: 'Decision states \u00b7 audit trail \u00b7 human confirmation',
    action: { type: 'capability', id: 'decisions-to-traceable-systems' },
  },
  whatIStructure: {
    label: 'What I structure',
    description: 'Requirements, workflows, control points, and traceable systems.',
    action: { type: 'section', id: 'home-capabilities' },
  },
  pointOfView: {
    label: 'Point of View',
    description: 'Capability is not completion \u2014 ownership, handoff, control, traceability.',
    action: { type: 'section', id: 'home-approach' },
  },
  conversationalAi: {
    label: 'Conversational AI',
    description: 'Post-response workflow \u00b7 routing \u00b7 recovery \u00b7 handoff',
    action: { type: 'case', id: 'case01' },
  },
  contractIntelligence: {
    label: 'Contract Intelligence',
    description: 'Decision states \u00b7 review ownership \u00b7 source visibility \u00b7 audit trail',
    action: { type: 'case', id: 'case02' },
  },
  supplyChainAgents: {
    label: 'Supply Chain Agents',
    description: 'Human checkpoints \u00b7 intervention gates \u00b7 control boundaries',
    action: { type: 'case', id: 'case03' },
  },
  aiCompanion: {
    label: 'AI Companion',
    description: 'Continuity \u00b7 return behavior \u00b7 presence layer',
    action: { type: 'case', id: 'case04' },
  },
};

/** @type {ShortcutAnswerTemplate[]} */
export const SHORTCUT_ANSWER_TEMPLATES = [
  {
    id: 'beyond-ui',
    matchTerms: [
      'beyond ui',
      'beyond screen',
      'beyond interface',
      'not just ui',
      'ui only',
      'ui-only',
      'only ui',
      'only a ui',
      'visual only',
      'screen only',
      'traditional ui',
      'traditional ux',
    ],
    matchPhrases: [
      'what shows that hedi works beyond',
      'works beyond ui',
      'only a ui designer',
      'not just ui',
      'different from traditional',
    ],
    title: 'Beyond UI screens',
    shortAnswer:
      'Hedi works beyond UI by structuring the product logic behind the interface: workflows, roles, decisions, handoffs, and control points.',
    points: [
      'She translates complex requirements into workflows and decision logic.',
      'She defines how AI output continues as usable work, not just as a response.',
      'She makes human review, control, and traceability visible inside the product system.',
    ],
    whereToLook: [
      KNOWLEDGE_EVIDENCE.requirementsCapability,
      {
        label: 'Contract Intelligence',
        description: 'Decision states and review ownership',
        action: { type: 'case', id: 'case02' },
      },
      {
        label: 'Supply Chain Agents',
        description: 'Human-in-the-loop control model',
        action: { type: 'case', id: 'case03' },
      },
    ],
    continueRoutes: ['ai-output-to-workflow', 'automation-to-human-control'],
  },
  {
    id: 'ai-workflow-beyond-interface',
    matchTerms: [
      'ai workflow',
      'post-response',
      'post response',
      'after ai',
      'ai output',
      'operational workflow',
      'beyond interface',
      'beyond the interface',
      'chatbot',
      'conversational ai',
      'making ai usable',
    ],
    matchPhrases: [
      'how does hedi design ai workflow',
      'ai workflows beyond',
      'what ai work',
      'ai product design',
      'ai not stopping at output',
    ],
    title: 'AI workflow beyond the interface',
    shortAnswer:
      'She designs the layer after AI output: how results become next steps, handoffs, reviews, recovery paths, and completed work.',
    points: [
      'She focuses on operational continuation after AI responds.',
      'She defines fallback, escalation, and recovery logic.',
      'She connects AI behavior back to real workflow responsibilities.',
    ],
    whereToLook: [
      {
        label: 'Conversational AI',
        description: 'Post-response workflow and handoff logic',
        action: { type: 'case', id: 'case01' },
      },
      {
        label: 'Contract Intelligence',
        description: 'AI analysis to reviewable decision',
        action: { type: 'case', id: 'case02' },
      },
      {
        label: 'Supply Chain Agents',
        description: 'Agent output to human intervention',
        action: { type: 'case', id: 'case03' },
      },
    ],
    continueRoutes: ['automation-to-human-control', 'decisions-to-traceable-systems'],
  },
  {
    id: 'human-control',
    matchTerms: [
      'human-in-the-loop',
      'human in the loop',
      'human control',
      'human override',
      'approval gate',
      'intervention',
      'escalation',
      'automation control',
      'governance',
      'control boundary',
      'where people',
      'human responsibility',
    ],
    matchPhrases: [
      'where does hedi define human control',
      'human control in ai',
      'human-in-the-loop',
      'where people stay involved',
    ],
    title: 'Human control in AI-supported workflows',
    shortAnswer:
      'She defines where humans need to review, approve, override, escalate, or take responsibility when AI or automation enters the workflow.',
    points: [
      'She treats human control as part of the workflow structure, not an afterthought.',
      'She defines intervention points and responsibility boundaries.',
      'She designs for exceptions, escalation, and review moments.',
    ],
    whereToLook: [
      {
        label: 'Supply Chain Agents',
        description: 'Human checkpoints and intervention gates',
        action: { type: 'case', id: 'case03' },
      },
      {
        label: 'Contract Intelligence',
        description: 'Human confirmation in AI-assisted review',
        action: { type: 'case', id: 'case02' },
      },
      {
        label: 'Conversational AI',
        description: 'Escalation and handoff when AI cannot complete',
        action: { type: 'case', id: 'case01' },
      },
    ],
    continueRoutes: ['decisions-to-traceable-systems', 'ai-output-to-workflow'],
  },
  {
    id: 'traceability',
    matchTerms: [
      'traceability',
      'traceable',
      'audit',
      'auditability',
      'reviewable',
      'decision history',
      'source visibility',
      'review history',
      'human confirmation',
      'compliance',
    ],
    matchPhrases: [
      'how does hedi make ai-assisted decisions reviewable',
      'decision traceability',
      'reviewable ai',
      'audit trail',
    ],
    title: 'Reviewable AI-assisted decisions',
    shortAnswer:
      'She structures decision states, source visibility, review history, and audit paths so AI-assisted work can be checked and trusted.',
    points: [
      'She separates AI-generated output from human judgment.',
      'She makes sources, states, and review ownership visible.',
      'She designs workflows where decisions can be traced, corrected, and signed off.',
    ],
    whereToLook: [
      {
        label: 'Contract Intelligence',
        description: 'Traceable review states',
        action: { type: 'case', id: 'case02' },
      },
      KNOWLEDGE_EVIDENCE.traceabilityCapability,
      KNOWLEDGE_EVIDENCE.pointOfView,
    ],
    continueRoutes: ['human-control', 'requirements-to-product-logic'],
  },
  {
    id: 'complex-requirements',
    matchTerms: [
      'complex requirement',
      'requirements',
      'stakeholder',
      'business constraint',
      'ambigu',
      'unclear brief',
      'domain requirement',
      'acceptance criteria',
      'ba ',
      'business analyst',
      'translate',
      'translation',
    ],
    matchPhrases: [
      'how does hedi handle complex requirements',
      'complex stakeholder',
      'translate ambiguity',
      'can she handle complex',
    ],
    title: 'Complex requirements',
    shortAnswer:
      'She translates stakeholder needs, business constraints, and domain requirements into clear product logic, workflows, roles, and acceptance criteria.',
    points: [
      'She works between business, product, design, and technical constraints.',
      'She structures ambiguity into implementable workflows.',
      'She defines roles, responsibilities, validation points, and decision logic.',
    ],
    whereToLook: [
      KNOWLEDGE_EVIDENCE.requirementsCapability,
      {
        label: 'Supply Chain Agents',
        description: 'Complex enterprise workflow structure',
        action: { type: 'case', id: 'case03' },
      },
      {
        label: 'Contract Intelligence',
        description: 'Review context and decision architecture',
        action: { type: 'case', id: 'case02' },
      },
    ],
    continueRoutes: ['ai-output-to-workflow', 'decisions-to-traceable-systems'],
  },
  {
    id: 'role-fit',
    matchTerms: [
      'role fit',
      'what role',
      'which role',
      'suitable for',
      'best suited',
      'hire',
      'hiring',
      'recruiter',
      'recruit',
      'job',
      'position',
      'strongest for',
    ],
    matchPhrases: [
      'what roles is hedi best suited',
      'what roles is she suitable',
      'role fit',
      'what does hedi actually do',
    ],
    title: 'Role fit',
    shortAnswer:
      'Hedi is best suited for Product/UX roles in complex AI, enterprise workflow, decision-heavy, or business-process-heavy products.',
    points: [
      'She combines product design, workflow thinking, and requirements translation.',
      'She can work beyond UI execution into product logic and operating structure.',
      'She has evidence across AI workflow, contract intelligence, supply chain, and process-critical environments.',
    ],
    whereToLook: [
      KNOWLEDGE_EVIDENCE.whatIStructure,
      KNOWLEDGE_EVIDENCE.contractIntelligence,
      KNOWLEDGE_EVIDENCE.supplyChainAgents,
      KNOWLEDGE_EVIDENCE.conversationalAi,
    ],
    continueRoutes: ['requirements-to-product-logic', 'human-control'],
  },
  {
    id: 'especially-strong',
    matchTerms: [
      'especially good',
      'especially strong',
      'best at',
      'strongest at',
      'what makes her different',
      'what is she good',
      'what makes hedi',
      'advantage',
      'different from',
    ],
    matchPhrases: [
      'what is hedi especially strong',
      'what makes her different',
      'ai design advantage',
      'turning ambiguity',
    ],
    title: 'Core strength',
    shortAnswer:
      'Hedi is especially strong at turning ambiguity into structured product logic for complex AI and enterprise systems.',
    points: [
      'She clarifies roles, requirements, constraints, and workflows.',
      'She defines what happens after AI output enters real work.',
      'She designs control and traceability around decisions and automation.',
    ],
    whereToLook: [
      KNOWLEDGE_EVIDENCE.requirementsCapability,
      KNOWLEDGE_EVIDENCE.aiOutputCapability,
      KNOWLEDGE_EVIDENCE.traceabilityCapability,
    ],
    continueRoutes: ['ai-output-to-workflow', 'decisions-to-traceable-systems'],
  },
  {
    id: 'what-does-she-do',
    matchTerms: ['what does she do', 'what does hedi do', 'who is hedi', 'who is she'],
    matchPhrases: ['what does hedi actually do'],
    title: 'What Hedi does',
    shortAnswer:
      'Hedi turns complex requirements and AI capabilities into usable product systems — structuring roles, workflows, decisions, handoffs, review states, and control points.',
    points: [
      'She is not positioned as UI-only; she works on product logic and operating structure.',
      'She designs how AI output becomes continued work with human checkpoints.',
      'She makes decisions reviewable and automation accountable inside enterprise workflows.',
    ],
    whereToLook: [
      KNOWLEDGE_EVIDENCE.whatIStructure,
      KNOWLEDGE_EVIDENCE.contractIntelligence,
      KNOWLEDGE_EVIDENCE.supplyChainAgents,
      KNOWLEDGE_EVIDENCE.conversationalAi,
    ],
    continueRoutes: ['requirements-to-product-logic', 'ai-output-to-workflow'],
  },
];

/**
 * @param {string} text — normalized question
 * @returns {ShortcutAnswerTemplate | null}
 */
export function matchShortcutAnswerTemplate(text) {
  if (!text) return null;

  let best = null;
  let bestScore = 0;

  for (const template of SHORTCUT_ANSWER_TEMPLATES) {
    let score = 0;
    for (const phrase of template.matchPhrases ?? []) {
      if (text.includes(phrase)) score += 4;
    }
    for (const term of template.matchTerms) {
      if (text.includes(term)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      best = template;
    }
  }

  return bestScore > 0 ? best : null;
}

/**
 * @param {ShortcutAnswerTemplate} template
 * @returns {import('../utils/getFreeGuideAnswer.js').FreeGuideAnswer}
 */
export function templateToFreeGuideAnswer(template) {
  return {
    title: template.title,
    shortAnswer: template.shortAnswer,
    points: template.points,
    whereToLook: template.whereToLook,
  };
}
