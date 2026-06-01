import { GUIDE_ENTRY_QUESTIONS, getGuideQuestionForEntry } from '../data/portfolioGuideFlows.js';

/** @typedef {{ type: 'section' | 'case', id: string }} GuideDestination */

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
  title: 'Yes — at a product and workflow level.',
  shortAnswer:
    'She is not positioned as an ML engineer. Her LLM fluency shows up in how she designs around model behavior: context, uncertainty, fallback, human review, handoff, and what happens after AI output enters real work.',
  points: [
    'She designs around LLM output, not just the chat interface.',
    'She considers what happens when output is incomplete, uncertain, or needs escalation.',
    'Her work focuses on making AI usable inside real workflows: routing, review, traceability, human control, and completion.',
  ],
  whereToLook: [
    {
      label: 'Case 01 · Conversational AI',
      description: 'Routing, recovery, continuation, handoff.',
      action: { type: 'case', id: 'case01' },
    },
    {
      label: 'Case 02 · Contract Intelligence',
      description: 'AI output, review states, source traceability.',
      action: { type: 'case', id: 'case02' },
    },
    {
      label: 'Case 03 · Supply Chain Agents',
      description: 'Human-in-the-loop control and escalation.',
      action: { type: 'case', id: 'case03' },
    },
  ],
  closingLine: 'Best read: she understands LLMs as product systems, not just as chat interfaces.',
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

const GENERAL_EVALUATION_ANSWER = {
  title: 'Strong for the right kind of AI work.',
  shortAnswer:
    'Yes — if you are evaluating her for AI product design, enterprise workflow, or complex human-AI systems.',
  points: [
    'Her strongest signal is not visual polish alone. It is how she defines structure around AI: what happens after the output, who owns the next step, when humans intervene, and how work gets completed.',
    'What role is she strongest for?',
    'Which case proves this best?',
    'How is this different from traditional UX?',
  ],
  whereToLook: [
    {
      label: 'Capabilities',
      description: 'How she turns ambiguity into structure.',
      action: { type: 'section', id: 'home-capabilities' },
    },
    {
      label: 'Case 01 · Conversational AI',
      description: 'Post-response workflow: routing, recovery, continuation, handoff.',
      action: { type: 'case', id: 'case01' },
    },
    {
      label: 'Case 02 · Contract Intelligence',
      description: 'Decision traceability and auditability.',
      action: { type: 'case', id: 'case02' },
    },
    {
      label: 'Case 03 · Supply Chain Agents',
      description: 'Human-in-the-loop control and automation boundaries.',
      action: { type: 'case', id: 'case03' },
    },
  ],
};

const GENERAL_EVALUATION_PHRASES = [
  'is she good',
  'is hedi good',
  'is this good',
  'should we hire her',
  'should i hire her',
  'what is she good at',
  'what makes her different',
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
        'Capabilities explain how she frames problems.',
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
        'Tool fluency helps her explore faster. Design judgment still defines what should be built.',
      points: [
        'Rapid prototyping supports flow validation.',
        'Cases show enterprise depth beyond demos.',
      ],
      whereToLook: [
        {
          label: 'Capabilities',
          description: 'Framing and structure first.',
          action: { type: 'section', id: 'home-capabilities' },
        },
        {
          label: 'Selected Work',
          description: 'Evidence beyond prototype volume.',
          action: { type: 'section', id: 'home-work-narrative' },
        },
      ],
    },
  },
  {
    id: 'cvBackground',
    terms: ['cv', 'resume', 'background', 'who is', 'biography', 'bio', 'about her'],
    answer: {
      title: 'Background & profile',
      shortAnswer:
        'Product designer focused on AI products, enterprise workflows, and human-AI systems.',
      points: [
        'Read capabilities for how she works.',
        'Read cases for proof — not a CV dump here.',
      ],
      whereToLook: [
        {
          label: 'Capabilities',
          description: 'How she creates value.',
          action: { type: 'section', id: 'home-capabilities' },
        },
        {
          label: 'Point of View',
          description: 'Design beliefs and approach.',
          action: { type: 'section', id: 'home-approach' },
        },
      ],
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
      shortAnswer: 'She collaborates at the structure layer — not only at UI handoff.',
      points: [
        'Shared framing, ownership, and success criteria with PMs.',
        'Handoffs, schemas, and constraints with engineering.',
      ],
      whereToLook: [
        {
          label: 'Case 03 · Supply Chain Agents',
          description: 'Cross-functional orchestration.',
          action: { type: 'case', id: 'case03' },
        },
        {
          label: 'Case 01 · Conversational AI',
          description: 'Service and platform boundaries.',
          action: { type: 'case', id: 'case01' },
        },
      ],
    },
  },
  {
    id: 'traditionalUx',
    terms: ['traditional ux', 'compare to ux', 'vs ux', 'ui only', 'visual design only', 'not just ui'],
    answer: {
      title: 'Beyond traditional UX',
      shortAnswer: 'Operating logic and completion — not primarily screen polish.',
      points: [
        'Workflow, ownership, and decision states matter.',
        'Cases show structure, not mockup galleries.',
      ],
      whereToLook: [
        {
          label: 'Point of View',
          description: 'Beliefs about AI and responsibility.',
          action: { type: 'section', id: 'home-approach' },
        },
        {
          label: 'Capabilities',
          description: 'Framing · workflow · decision design.',
          action: { type: 'section', id: 'home-capabilities' },
        },
      ],
    },
  },
  {
    id: 'roleFit',
    terms: [
      'role',
      'recruiter',
      'recruit',
      'hiring',
      'position',
      'job',
      'strongest for',
      'fit for',
      'what role',
    ],
    answer: {
      title: 'Role fit',
      shortAnswer:
        'Strongest for AI product design where workflows, ambiguous briefs, and human-AI boundaries need structure.',
      points: [
        'Enterprise AI · conversational AI · agentic workflow contexts.',
        'Not primarily visual-only or marketing-site roles.',
      ],
      whereToLook: [
        {
          label: 'Capabilities',
          description: 'Scan capability areas first.',
          action: { type: 'section', id: 'home-capabilities' },
        },
        {
          label: 'Case 01 · Conversational AI',
          description: 'Broad AI product signal.',
          action: { type: 'case', id: 'case01' },
        },
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
      shortAnswer: 'Each case shows a different layer — pick by what you want to understand.',
      points: [
        'Case 01 — service / conversational workflow.',
        'Case 02 — review / traceability. Case 03 — agents / control.',
      ],
      whereToLook: [
        {
          label: 'Case 01 · Conversational AI',
          description: 'CX · routing · recovery · handoff.',
          action: { type: 'case', id: 'case01' },
        },
        {
          label: 'Case 02 · Contract Intelligence',
          description: 'Review states · sources · auditability.',
          action: { type: 'case', id: 'case02' },
        },
        {
          label: 'Case 03 · Supply Chain Agents',
          description: 'Delegation · intervention · control.',
          action: { type: 'case', id: 'case03' },
        },
      ],
    },
  },
  {
    id: 'aiProblemSpace',
    terms: [
      'ai problem',
      'problem space',
      'human-ai',
      'human ai',
      'post-response',
      'enterprise ai',
      'chatbot',
      'conversational',
      'agent',
      'agentic',
      'traceability',
      'audit',
    ],
    answer: {
      title: 'AI problem space',
      shortAnswer:
        'She designs the operating layer around AI — where output becomes work, judgment can be reviewed, and people stay in control.',
      points: [
        'Post-response workflow · decision traceability · human-in-the-loop control · workflow orchestration.',
        'Not the prompt box alone — routing, states, intervention, and completion.',
      ],
      whereToLook: [
        {
          label: 'Case 01 · Conversational AI',
          description: 'Post-response workflow.',
          action: { type: 'case', id: 'case01' },
        },
        {
          label: 'Case 02 · Contract Intelligence',
          description: 'Decision traceability.',
          action: { type: 'case', id: 'case02' },
        },
      ],
    },
  },
  {
    id: 'workingLogic',
    terms: ['unclear', 'brief', 'ambigu', 'framing', 'structure', 'messy', 'vague', 'operating'],
    answer: {
      title: 'Working logic',
      shortAnswer: 'She maps the operating layer before screens — ownership, handoffs, completion.',
      points: [
        'Clarifies what AI should own and how work finishes.',
        'Turns capability statements into buildable structure.',
      ],
      whereToLook: [
        {
          label: 'Capabilities',
          description: 'AI problem framing · workflow architecture.',
          action: { type: 'section', id: 'home-capabilities' },
        },
        {
          label: 'Case 01 · Conversational AI',
          description: 'Ambiguity → structure in practice.',
          action: { type: 'case', id: 'case01' },
        },
      ],
    },
  },
];

const FALLBACK_ANSWER = {
  title: 'Within portfolio scope',
  shortAnswer:
    'I can best answer questions about Hedi’s AI product design work, role fit, case evidence, workflow logic, collaboration context, and AI tool workflow.',
  points: [],
  whereToLook: [
    {
      label: 'Capabilities',
      description: 'Four lenses for how she works.',
      action: { type: 'section', id: 'home-capabilities' },
    },
    {
      label: 'Selected Work',
      description: 'Cases 01–03 as the core map.',
      action: { type: 'section', id: 'home-work-narrative' },
    },
  ],
};

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
 * Generous match for broad evaluation questions (is she good?, should I hire her?, etc.).
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
      shortAnswer: 'Type what you want to understand about the work.',
      points: [],
      whereToLook: [],
    };
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
    return GENERAL_EVALUATION_ANSWER;
  }

  return FALLBACK_ANSWER;
}
