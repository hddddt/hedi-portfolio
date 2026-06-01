import { GUIDE_FLOWS } from '../data/portfolioGuideFlows.js';

const INTENT_RULES = [
  {
    flowId: 'roleFit',
    terms: [
      'recruiter',
      'recruit',
      'role fit',
      'role',
      'cv',
      'resume',
      'hire',
      'hiring',
      'position',
      'job',
      'profile',
      'strongest for',
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
      'routing',
      'handoff',
      'recovery',
      'continuation',
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
      'control surface',
      'guardrail',
      'multi-agent',
    ],
  },
  {
    flowId: 'contractIntelligence',
    terms: ['contract', 'legal', 'audit', 'compliance', 'reviewable', 'source reference'],
  },
  {
    flowId: 'toolWorkflow',
    terms: ['tool', 'cursor', 'vibe coding', 'vibe', 'prototype', 'figma', 'build workflow'],
  },
  {
    flowId: 'unclearBrief',
    terms: [
      'unclear brief',
      'broken brief',
      'ambiguous',
      'ambiguity',
      'vague',
      'undefined',
      'early stage',
      'messy',
    ],
  },
  {
    flowId: 'bestCaseFit',
    terms: ['which case', 'best case', 'proves', 'proof', 'evidence', 'fit'],
  },
  {
    flowId: 'aiProblems',
    terms: ['ai problem', 'design for', 'problem space', 'enterprise ai'],
  },
  {
    flowId: 'ambiguityToStructure',
    terms: ['turn ambiguity', 'into structure', 'structuring', 'operating layer'],
  },
  {
    flowId: 'differentFromTraditionalUx',
    terms: ['traditional ux', 'different from ux', 'not just ui', 'operating layer'],
  },
  {
    flowId: 'aiOutputNotEnough',
    terms: ['not enough', 'after the answer', 'post-response', 'output is not'],
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

  return { flowId: 'fallback', question };
}

/**
 * @param {string} flowId
 * @returns {boolean}
 */
export function isKnownGuideFlow(flowId) {
  return Boolean(GUIDE_FLOWS[flowId]);
}
