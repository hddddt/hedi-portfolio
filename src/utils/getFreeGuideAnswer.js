import { GUIDE_ENTRY_QUESTIONS, getGuideQuestionForEntry } from '../data/portfolioGuideFlows.js';
import {
  KNOWLEDGE_EVIDENCE,
  OUT_OF_SCOPE_FALLBACK,
  matchShortcutAnswerTemplate,
  templateToFreeGuideAnswer,
} from '../data/portfolioShortcutKnowledge.js';

/** @typedef {{ type: 'section' | 'case' | 'capability', id: string }} GuideDestination */

/** @typedef {{ label: string, description: string, action: GuideDestination }} FreeGuideWhereToLook */

/**
 * @typedef {object} FreeGuideAnswer
 * @property {string} title
 * @property {string} shortAnswer
 * @property {string[]} [points]
 * @property {FreeGuideWhereToLook[]} whereToLook
 * @property {string} [closingLine]
 */

const LLM_KNOWLEDGE_ANSWER = {
  title: 'AI at the product and workflow level',
  shortAnswer:
    'She is not positioned as an ML engineer. Her AI fluency shows up in product logic around model behavior: context, uncertainty, fallback, human review, handoff, and what happens after AI output enters real work.',
  points: [
    'She designs around AI output, not just the interaction surface.',
    'She defines what happens when output is incomplete, uncertain, or needs escalation.',
    'She focuses on making AI usable inside workflows: routing, review, traceability, control, and completion.',
  ],
  whereToLook: [
    KNOWLEDGE_EVIDENCE.conversationalAi,
    KNOWLEDGE_EVIDENCE.contractIntelligence,
    KNOWLEDGE_EVIDENCE.supplyChainAgents,
  ],
};

const LLM_KNOWLEDGE_PHRASES = [
  'does she know about llm',
  'does she know llm',
  'know about llm',
  'know llm',
  'does she know ai',
  'does she know about ai',
  'understand ai',
  'understands ai',
  'large language model',
  'language model',
  'ai technical',
  'technical fluency',
];

const LLM_KNOWLEDGE_TERMS = ['llm', 'llms', 'rag', 'gpt', 'claude', 'openai'];

const GENERAL_EVALUATION_PHRASES = [
  'is she good',
  'is hedi good',
  'is this good',
  'should we hire her',
  'should i hire her',
  'why her',
  'why hedi',
  'is she strong',
  'is she useful',
  'is she senior',
  'can she do ai',
  'is this portfolio strong',
  'is she capable',
  'is she qualified',
  'is she worth',
  'does she stand out',
  'is she valuable',
];

const GENERAL_EVALUATION_KEYWORDS = [
  'good',
  'strong',
  'useful',
  'valuable',
  'hire',
  'worth',
  'capable',
  'qualified',
  'senior',
  'different',
  'stand out',
  'why her',
  'why hedi',
  'best at',
  'should i',
  'is she',
  'can she',
];

/** Questions that should route to a more specific intent, not general evaluation. */
const SPECIFIC_INTENT_SIGNALS = [
  'which case',
  'best case',
  'case 01',
  'case 02',
  'case 03',
  'case 04',
  'problem space',
  'post-response',
  'human-ai',
  'human ai',
  'traditional ux',
  'vs ux',
  'pm ',
  'product manager',
  'engineer',
  'engineering',
  'collaborat',
  'stakeholder',
  'unclear brief',
  'ambigu',
  'traceability',
  'audit',
  'agentic',
  'chatbot',
  'conversational ai',
  'cursor',
  'vibe coding',
  'figma',
  'resume',
  ' cv',
  'linkedin',
  'email',
  'contact',
  'get in touch',
  'strongest for',
  'role fit',
  'fit for',
  'recruiter',
  'recruit',
  'beyond ui',
  'beyond screen',
  'not just ui',
  'what does she do',
  'what does hedi',
  'complex requirement',
  'human control',
  'human-in-the-loop',
];

const FREE_INTENTS = [
  {
    id: 'contact',
    terms: ['contact', 'email', 'linkedin', 'reach', 'hire me', 'get in touch', 'next step'],
    answer: {
      title: 'Contact & next step',
      shortAnswer: 'Use the site footer and Life Archive section for direct links and context.',
      points: [
        'Portfolio cases show the work in depth.',
        'What I structure explains how she creates product logic.',
      ],
      whereToLook: [
        {
          label: 'Life Archive',
          description: 'Contact links and personal context.',
          action: { type: 'section', id: 'home-life-archive' },
        },
        {
          label: 'Selected Work',
          description: 'Case evidence before reaching out.',
          action: { type: 'section', id: 'home-work-narrative' },
        },
      ],
    },
  },
  {
    id: 'aiTools',
    terms: ['tool', 'cursor', 'vibe coding', 'vibe', 'figma', 'prototype', 'ai build'],
    answer: {
      title: 'AI tools & build workflow',
      shortAnswer:
        'Tool fluency supports faster exploration. Design judgment still defines what should be built and how work completes.',
      points: [
        'Rapid prototyping supports flow validation.',
        'Cases show enterprise depth beyond demos.',
      ],
      whereToLook: [KNOWLEDGE_EVIDENCE.whatIStructure, KNOWLEDGE_EVIDENCE.conversationalAi],
    },
  },
  {
    id: 'cvBackground',
    terms: ['cv', 'resume', 'background', 'biography', 'bio', 'about her'],
    answer: {
      title: 'Background & profile',
      shortAnswer:
        'Product / UX designer focused on AI products, enterprise workflows, and turning complexity into product logic.',
      points: [
        'Read What I structure for how she works.',
        'Read cases for proof — not a CV dump here.',
      ],
      whereToLook: [KNOWLEDGE_EVIDENCE.whatIStructure, KNOWLEDGE_EVIDENCE.pointOfView],
    },
  },
  {
    id: 'collaboration',
    terms: [
      'pm',
      'product manager',
      'engineer',
      'engineering',
      'collaborat',
      'cross-functional',
      'stakeholder',
      'dev',
      'developer',
    ],
    answer: {
      title: 'Working with PMs & engineering',
      shortAnswer:
        'She collaborates at the structure layer — requirements, workflows, roles, and decision logic — not only at UI handoff.',
      points: [
        'Shared framing, ownership, and acceptance criteria with PMs.',
        'Handoffs, constraints, and validation points with engineering.',
      ],
      whereToLook: [
        KNOWLEDGE_EVIDENCE.supplyChainAgents,
        KNOWLEDGE_EVIDENCE.requirementsCapability,
      ],
    },
  },
  {
    id: 'caseEvidence',
    terms: [
      'which case',
      'best case',
      'case evidence',
      'proof',
      'show me a case',
      'show me the case',
      'project example',
    ],
    answer: {
      title: 'Case evidence',
      shortAnswer: 'Each case proves a different layer — match the case to what you need to evaluate.',
      points: [
        'Case 01 — AI output becomes continued work (conversational workflow).',
        'Case 02 — AI-assisted decisions become reviewable and traceable.',
        'Case 03 — Automation meets human control and intervention gates.',
      ],
      whereToLook: [
        KNOWLEDGE_EVIDENCE.conversationalAi,
        KNOWLEDGE_EVIDENCE.contractIntelligence,
        KNOWLEDGE_EVIDENCE.supplyChainAgents,
      ],
    },
  },
];

const OUT_OF_SCOPE_TERMS = [
  'industry trend',
  'market size',
  'salary',
  'negotiate',
  'interview tip',
  'career advice',
  'should i learn',
  'how to become',
  'best ai tool',
  'compare chatgpt',
  'stock',
  'invest',
  'politics',
  'weather',
  'recipe',
  'movie',
  'game',
];

/**
 * @param {string} question
 * @returns {string}
 */
function normalizeQuestion(question) {
  return String(question ?? '')
    .trim()
    .toLowerCase()
    .replace(/[?!.]+$/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * @param {string} text — normalized question
 * @returns {boolean}
 */
function matchesLlmKnowledge(text) {
  if (!text) return false;

  if (LLM_KNOWLEDGE_PHRASES.some((phrase) => text.includes(phrase))) {
    return true;
  }

  if (LLM_KNOWLEDGE_TERMS.some((term) => text.includes(term))) {
    return true;
  }

  if (text.includes('prompt') && /\b(ai|llm|model|gpt)\b/.test(text)) {
    return true;
  }

  if (/\b(know|understand)\b/.test(text) && /\b(ai|llm|model|language)\b/.test(text)) {
    return true;
  }

  return false;
}

/**
 * @param {string} text — normalized question
 * @returns {boolean}
 */
function matchesGeneralEvaluation(text) {
  if (!text) return false;

  if (SPECIFIC_INTENT_SIGNALS.some((signal) => text.includes(signal))) {
    return false;
  }

  if (GENERAL_EVALUATION_PHRASES.some((phrase) => text.includes(phrase) || text === phrase)) {
    return true;
  }

  const hasEvalKeyword = GENERAL_EVALUATION_KEYWORDS.some((term) => text.includes(term));
  if (!hasEvalKeyword) return false;

  const hasSubject =
    /\b(she|hedi|her|portfolio|hire|we)\b/.test(text) ||
    /^(is|can|should|why|what|does|do)\b/.test(text);

  if (hasSubject && text.length <= 96) {
    return true;
  }

  if (text.length <= 40 && hasEvalKeyword) {
    return true;
  }

  return false;
}

/**
 * @param {string} text — normalized question
 * @returns {boolean}
 */
function isLikelyOutOfScope(text) {
  if (!text) return false;
  return OUT_OF_SCOPE_TERMS.some((term) => text.includes(term));
}

/**
 * If the question closely matches a preset entry, return that flow id (for explicit preset navigation).
 * @param {string} question
 * @returns {string | null}
 */
export function matchExplicitPresetFlowId(question) {
  const text = normalizeQuestion(question);
  if (!text) return null;

  for (const entry of GUIDE_ENTRY_QUESTIONS) {
    const preset = getGuideQuestionForEntry(entry.flowId).toLowerCase().replace(/\?$/, '');
    if (text === preset || text === `${preset}?`) return entry.flowId;
  }
  return null;
}

/**
 * @param {string} question
 * @param {string} [_currentFlowId]
 * @returns {FreeGuideAnswer}
 */
export function getFreeGuideAnswer(question, _currentFlowId) {
  const text = normalizeQuestion(question);
  if (!text) {
    return {
      title: 'Ask a question',
      shortAnswer: 'Type what you want to understand about Hedi\u2019s work, capabilities, or portfolio evidence.',
      points: [],
      whereToLook: [],
    };
  }

  if (isLikelyOutOfScope(text)) {
    return OUT_OF_SCOPE_FALLBACK;
  }

  const template = matchShortcutAnswerTemplate(text);
  if (template) {
    return templateToFreeGuideAnswer(template);
  }

  if (matchesLlmKnowledge(text)) {
    return LLM_KNOWLEDGE_ANSWER;
  }

  for (const intent of FREE_INTENTS) {
    if (intent.terms.some((term) => text.includes(term))) {
      return intent.answer;
    }
  }

  if (matchesGeneralEvaluation(text)) {
    const strongTemplate =
      matchShortcutAnswerTemplate('what is hedi especially strong') ??
      matchShortcutAnswerTemplate('best at');
    if (strongTemplate) {
      return templateToFreeGuideAnswer(strongTemplate);
    }
  }

  return OUT_OF_SCOPE_FALLBACK;
}
