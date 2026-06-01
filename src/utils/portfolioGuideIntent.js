import { GUIDE_FLOWS } from '../data/portfolioGuideFlows.js';

/** More specific rules first — first match wins. */
const INTENT_RULES = [
  {
    flowId: 'toolWorkflow',
    terms: ['tool', 'cursor', 'vibe coding', 'vibe', 'figma', 'ai tools', 'build workflow'],
  },
  {
    flowId: 'designerTrajectory',
    terms: [
      'designer boundary',
      'expanded boundary',
      'beyond interface',
      'buildable logic',
      'systems thinking',
      'workflow design role',
      'industrial design',
      'hmi',
    ],
  },
  {
    flowId: 'aiBeliefDesign',
    terms: [
      'believe about ai',
      'belief about ai',
      'human judgment',
      'human-ai relationship',
      'responsibility',
      'trust ai',
    ],
  },
  {
    flowId: 'roleFit',
    terms: [
      'recruiter',
      'recruit',
      'role fit',
      'strongest for',
      'cv',
      'resume',
      'hire',
      'hiring',
      'hiring manager',
      'position',
      'job',
      'profile',
    ],
  },
  {
    flowId: 'collaborationPmEng',
    terms: [
      'pm',
      'product manager',
      'engineer',
      'engineering',
      'collaborat',
      'cross-functional',
      'constraint',
      'stakeholder',
      'dev handoff',
    ],
  },
  {
    flowId: 'unclearBrief',
    terms: [
      'unclear brief',
      'unclear ai',
      'broken brief',
      'ambiguous',
      'ambiguity',
      'framing',
      'vague',
      'undefined',
      'early stage',
      'messy brief',
    ],
  },
  {
    flowId: 'bestCaseFit',
    terms: [
      'which case',
      'best case',
      'case evidence',
      'proof',
      'project evidence',
      '3 minutes',
      'three minutes',
    ],
  },
  {
    flowId: 'aiProblems',
    terms: [
      'ai problem',
      'problem space',
      'human-ai',
      'human ai',
      'post-response',
      'post response',
      'workflow design',
      'enterprise ai',
      'decision traceability',
    ],
  },
  {
    flowId: 'conversationalAi',
    terms: [
      'chatbot',
      'conversational',
      'conversation',
      'cx',
      'customer support',
      'support system',
    ],
  },
  {
    flowId: 'supplyChainAgents',
    terms: [
      'agent',
      'agentic',
      'automation',
      'orchestr',
      'supply chain',
      'guardrail',
      'multi-agent',
    ],
  },
  {
    flowId: 'contractIntelligence',
    terms: ['contract', 'legal', 'audit', 'compliance', 'reviewable'],
  },
  {
    flowId: 'differentFromTraditionalUx',
    terms: ['traditional ux', 'compare to ux', 'vs ux', 'not just ui'],
  },
  {
    flowId: 'ambiguityToStructure',
    terms: ['turn ambiguity', 'into structure', 'structuring'],
  },
];

/**
 * @param {string} input
 * @returns {{ flowId: string, question: string }}
 */
export function matchGuideFlowIntent(input) {
  const question = String(input ?? '').trim();
  const text = question.toLowerCase();

  if (!text) {
    return { flowId: 'fallback', question: '' };
  }

  for (const rule of INTENT_RULES) {
    if (rule.terms.some((term) => text.includes(term))) {
      return { flowId: rule.flowId, question };
    }
  }

  if (/\brole\b/.test(text)) {
    return { flowId: 'roleFit', question };
  }

  if (/\bcase\b|\bevidence\b/.test(text)) {
    return { flowId: 'bestCaseFit', question };
  }

  return { flowId: 'fallback', question };
}

/**
 * @param {string} flowId
 * @returns {boolean}
 */
export function isKnownGuideFlow(flowId) {
  return Boolean(GUIDE_FLOWS[flowId]);
}
