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
    flowId: 'differentFromTraditionalUx',
    terms: [
      'beyond ui',
      'beyond screen',
      'beyond interface',
      'not just ui',
      'ui only',
      'visual design only',
      'traditional ux',
      'compare to ux',
      'vs ux',
      'works beyond',
    ],
  },
  {
    flowId: 'decisionTraceability',
    terms: ['traceability', 'traceable', 'audit', 'reviewable', 'decision history', 'source visibility'],
  },
  {
    flowId: 'humanInTheLoopControl',
    terms: [
      'human-in-the-loop',
      'human in the loop',
      'human control',
      'intervention',
      'override',
      'approval gate',
      'escalation',
      'control boundary',
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
      'best suited',
      'what role',
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
      'complex requirement',
      'requirements',
      'stakeholder',
      'business constraint',
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
    terms: ['contract', 'legal', 'compliance', 'reviewable'],
  },
  {
    flowId: 'ambiguityToStructure',
    terms: ['turn ambiguity', 'into structure', 'structuring', 'complex requirement', 'requirements'],
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
