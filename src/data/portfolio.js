/** Portfolio page copy and lists — Hedi. Case narrative lives in cases.js. */

export const navLinks = [
  { href: '#hero', label: 'Identity' },
  { href: '#value', label: 'Value' },
  { href: '#work-transition', label: 'Work' },
  { href: '#selected-work', label: 'Cases' },
  { href: '#approach', label: 'Approach' },
  { href: '#contact', label: 'Contact' },
];

export const heroSection = {
  eyebrow: 'Identity',
  name: 'Hedi',
  role: 'Product Designer for complex AI and enterprise systems.',
  /** Lines shown on the static hero identity stage (see HeroSection). */
  stageRoleLines: ['Product Designer', 'AI systems & enterprise workflows'],
  positioning:
    'I bring structure to complex products where AI, workflows, decisions, and ownership need to become usable in real operations.',
  tags: [
    'AI Systems',
    'Enterprise Workflows',
    'Product Strategy',
    'Decision Design',
    'Human-AI Collaboration',
  ],
  motionSlot: {
    kicker: 'Name motion',
    note: 'Jitter — production asset',
    srLabel: 'Reserved area for animated name treatment',
  },
};

export const valueSectionIntro = {
  title: 'Where I Create Value',
  subtitle:
    'Across complex AI and enterprise systems, I help teams move from vague opportunities and fragmented workflows to clear product structures, decisions, and scalable systems.',
};

export const valueCards = [
  {
    id: 'strategic-product-framing',
    num: '01',
    title: 'Strategic Product Framing',
    explanation:
      'I help define what problem is worth solving, where AI should create value, and how product direction connects user needs, business processes, and technical possibilities.',
    tags: [
      'Product strategy',
      'Problem framing',
      'AI opportunity mapping',
      'Business alignment',
      'Value definition',
    ],
  },
  {
    id: 'complex-system-structuring',
    num: '02',
    title: 'Complex System Structuring',
    explanation:
      'I turn fragmented workflows, domain logic, stakeholder needs, and system constraints into clear product structures that teams can understand, discuss, and build.',
    tags: [
      'System mapping',
      'Workflow structure',
      'Information architecture',
      'Enterprise UX',
      'Stakeholder alignment',
    ],
  },
  {
    id: 'ai-workflow-decision-design',
    num: '03',
    title: 'AI Workflow & Decision Design',
    explanation:
      'I design how AI moves from response or recommendation into real work — through validation, review, handoff, decision states, and traceable outcomes.',
    tags: [
      'AI workflows',
      'Decision states',
      'Human validation',
      'Handoff',
      'Traceability',
      'Fallback logic',
    ],
  },
  {
    id: 'scalable-product-systems',
    num: '04',
    title: 'Scalable Product Systems',
    explanation:
      'I create reusable structures, patterns, and product logic that help complex experiences scale across workflows, teams, and use cases.',
    tags: [
      'Design systems',
      'Product patterns',
      'Reusable logic',
      'Documentation',
      'Design governance',
      'Consistency',
    ],
  },
];

export const workTransition = {
  sectionLabel: 'Into the work',
  title: 'Across systems, the same gaps kept appearing.',
  intro:
    'The cases ahead are not a scatter of unrelated projects. They are evidence of recurring gaps — the same unresolved questions resurfacing across AI surfaces and enterprise operations.',
  guidingQuestions: [
    {
      id: 'wt-q1',
      question: 'What happens after AI responds?',
      caseId: 'case01',
      caseNum: 'Case 01',
      caseTitle: 'Conversational AI',
    },
    {
      id: 'wt-q2',
      question: 'Who owns the decision?',
      caseId: 'case02',
      caseNum: 'Case 02',
      caseTitle: 'Contract Intelligence',
    },
    {
      id: 'wt-q3',
      question: 'When should humans intervene?',
      caseId: 'case03',
      caseNum: 'Case 03',
      caseTitle: 'Supply Chain Agents',
    },
    {
      id: 'wt-q4',
      question: 'How does the work become complete?',
      caseId: 'case04',
      caseNum: 'Case 04',
      caseTitle: 'AI Companion',
    },
  ],
  motion: {
    kicker: 'Case overview guide',
    note: 'Sequential motion',
    srLabel: 'Case sequence preview — in-page motion',
  },
};

export const designApproachIntro = {
  title: 'Design Approach',
  subtitle:
    'How I approach complex AI and enterprise systems before deciding what to design.',
};

export const approachSteps = [
  {
    id: 'da-frame-value',
    step: '01',
    title: 'Frame the value',
    text: 'Clarify what problem is worth solving, where AI should create value, and what outcome the product needs to support.',
  },
  {
    id: 'da-map-system',
    step: '02',
    title: 'Map the system',
    text: 'Understand actors, workflows, rules, states, data, constraints, and where the current system breaks down.',
  },
  {
    id: 'da-define-ai',
    step: '03',
    title: "Define AI's role",
    text: 'Decide whether AI should answer, recommend, validate, automate, escalate, or stay out of the workflow.',
  },
  {
    id: 'da-design-scale',
    step: '04',
    title: 'Design for use and scale',
    text: 'Turn the solution into understandable flows, reusable patterns, traceable states, and structures that teams can operate.',
  },
];

export const contactSection = {
  title: "Let's connect",
  closingLine:
    "I'm interested in AI and enterprise systems where product design has to define how work actually continues.",
  links: [
    { id: 'email', label: 'Email', href: 'mailto:hello@example.com' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/', external: true },
    { id: 'cv', label: 'CV', href: '#cv' },
    {
      id: 'writing',
      label: 'Writing / Experiments',
      href: '#',
      optional: true,
    },
  ],
};

/** Selected work overview — stacked sequence only (not case detail). */
export const selectedWorkCases = [
  {
    id: 'case01',
    num: 'Case 01',
    title: 'Conversational AI',
    layer: 'AI Support Flow Design',
    tension: 'AI could respond. The support work still got stuck after the response.',
    signal: 'Buildable support workflow logic.',
    cta: 'Open case',
    openAria: 'Open Conversational AI case',
    visualKey: 'orange',
  },
  {
    id: 'case02',
    num: 'Case 02',
    title: 'Contract Intelligence',
    layer: 'Decision Traceability',
    tension: 'AI could analyze contracts. Judgment still disappeared during review.',
    signal: 'Auditable AI-assisted contract decisions.',
    cta: 'Open case',
    openAria: 'Open Contract Intelligence case',
    visualKey: 'red',
  },
  {
    id: 'case03',
    num: 'Case 03',
    title: 'Supply Chain Agents',
    layer: 'Human-Agent Control',
    tension: 'Automation scaled execution. It also scaled monitoring.',
    signal: 'Control models for agentic enterprise workflows.',
    cta: 'Open case',
    openAria: 'Open Supply Chain Agents case',
    visualKey: 'agent',
  },
  {
    id: 'case04',
    num: 'Case 04',
    title: 'AI Companion',
    layer: 'Presence & Continuity',
    tension: 'More interaction did not create stronger engagement.',
    signal: 'Continuity-driven AI companion systems.',
    cta: 'Open case',
    openAria: 'Open AI Companion case',
    visualKey: 'presence',
  },
];
