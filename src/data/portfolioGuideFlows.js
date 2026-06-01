import {
  GUIDE_DECISION_AREAS,
  GUIDE_ENTRY,
  GUIDE_FLOW_ALIASES,
  GUIDE_RESULT_SECTIONS,
  resolveDecisionArea,
} from './portfolioGuideSystem.js';

/** @typedef {{ type: 'section' | 'case', id: string }} GuideDestination */

/** @typedef {{ step: string, label: string, description: string, action: GuideDestination }} GuideEvidence */

/** @typedef {{ label: string, flowId: string }} GuideFollowUp */

/** @typedef {{ step: string, title: string, line: string }} GuideKeyPoint */

/** @typedef {{ step: string, title: string, question: string, tags: string[] }} GuideProblemBlock */

/** @typedef {import('./portfolioGuideSystem.js').GuideDecisionAreaId} GuideDecisionAreaId */

/**
 * @typedef {object} GuideFlow
 * @property {string} id
 * @property {string} question
 * @property {GuideDecisionAreaId} [decisionArea]
 * @property {string} [read]
 * @property {string} [understand]
 * @property {string} guideTitle
 * @property {string} [guideSubline]
 * @property {GuideKeyPoint[]} keyPoints
 * @property {GuideKeyPoint[]} [framingBlocks]
 * @property {GuideProblemBlock[]} [problemBlocks]
 * @property {string} [evidenceLabel]
 * @property {GuideEvidence[]} evidence
 * @property {GuideFollowUp[]} followUps
 * @property {{ id: string, citation: string }[]} [sources]
 */

/** @type {{ id: string, num: string, flowId: string }[]} */
export const GUIDE_ENTRY_QUESTIONS = [
  { id: 'entry-01', num: '01', flowId: 'aiBeliefDesign' },
  { id: 'entry-02', num: '02', flowId: 'aiProblemDomain' },
  { id: 'entry-03', num: '03', flowId: 'ambiguityToStructure' },
  { id: 'entry-04', num: '04', flowId: 'designerTrajectory' },
];

export const GUIDE_CUSTOM_INPUT_PLACEHOLDER = GUIDE_ENTRY.freeInputPlaceholder;
export { GUIDE_ENTRY } from './portfolioGuideSystem.js';

export const GUIDE_FALLBACK_MESSAGE =
  'Pick a lens: belief · problem domain · method · expanded design boundary.';

/** @type {Record<string, GuideFlow>} */
export const GUIDE_FLOWS = {
  aiBeliefDesign: {
    id: 'aiBeliefDesign',
    decisionArea: 'beliefStance',
    question: 'What does she believe about AI and design?',
    read: 'AI expands what systems can do.\nDesign defines where people still belong.',
    understand:
      'AI can generate, summarize, recommend, and act.\n\nBut people still need to understand it, question it, interrupt it, and take responsibility around it.\n\nHer work sits at that relationship:\njudgment · handoff · control · traceability · completion',
    guideTitle: 'AI expands what systems can do.',
    guideSubline: 'Design defines where people still belong.',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Point of View',
        description: 'Why AI systems still need human judgment and responsibility.',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        step: '02',
        label: 'Capabilities',
        description: 'How this belief becomes operating design layers.',
        action: { type: 'section', id: 'home-capabilities' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she actually work on?', flowId: 'aiProblemDomain' },
      { label: 'How does she move from ambiguity to structure?', flowId: 'ambiguityToStructure' },
    ],
    sources: [
      { id: '2', citation: 'Google PAIR People + AI Guidebook' },
      { id: '4', citation: 'EU Ethics Guidelines for Trustworthy AI' },
    ],
  },

  aiProblemDomain: {
    id: 'aiProblemDomain',
    decisionArea: 'problemDomain',
    question: 'What AI problems does she actually work on?',
    read: 'She works beyond AI capability.',
    understand:
      'The question is not only whether AI can answer, analyze, recommend, or act.\n\nThe harder problems appear after capability enters real work:\nwhat happens next,\nwho reviews the result,\nwhere humans stay in control,\nhow tools and agents coordinate,\nand how work actually gets completed.',
    guideTitle: 'She works beyond AI capability.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description:
          'AI can respond — but work still needs routing, recovery, continuation, and handoff.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description:
          'AI can analyze — but judgment still needs review states, sources, and auditability.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description:
          'AI can automate — but control boundaries and human intervention still need design.',
        action: { type: 'case', id: 'case03' },
      },
      {
        step: '04',
        label: 'Case 04 · AI Companion',
        description:
          'AI can interact — but continuity beyond isolated sessions still needs structure.',
        action: { type: 'case', id: 'case04' },
      },
    ],
    followUps: [
      { label: 'How does she move from ambiguity to structure?', flowId: 'ambiguityToStructure' },
      { label: 'What does she believe about AI and design?', flowId: 'aiBeliefDesign' },
    ],
    sources: [
      { id: '2', citation: 'Google PAIR People + AI Guidebook' },
      { id: '3', citation: 'NIST AI RMF 1.0' },
    ],
  },

  ambiguityToStructure: {
    id: 'ambiguityToStructure',
    decisionArea: 'methodLogic',
    question: 'How does she move from ambiguity to structure?',
    read: 'She starts where the AI brief is still vague.',
    understand:
      'Before moving into screens, she looks for what the work is missing:\n\nownership,\nhandoff,\nreview logic,\ncontrol boundaries,\nworkflow continuation,\nor decision structure.\n\nThen she turns that ambiguity into flows, states, handoff logic, decision models, escalation paths, or interaction structures.',
    guideTitle: 'She starts where the AI brief is still vague.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'AI problem framing · workflow design · traceability · control.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Method lens · Conversational AI',
        description:
          'Three conversational AI projects abstracted into routing, recovery, continuation, and handoff.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '03',
        label: 'Method lens · Supply Chain Agents',
        description: 'A control model for agentic workflows.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she actually work on?', flowId: 'aiProblemDomain' },
      { label: 'How is her designer boundary expanding?', flowId: 'designerTrajectory' },
    ],
    sources: [{ id: '1', citation: 'Amershi et al., CHI 2019' }],
  },

  designerTrajectory: {
    id: 'designerTrajectory',
    decisionArea: 'trajectory',
    question: 'How is her designer boundary expanding in the AI era?',
    read:
      'AI expands the designer\u2019s boundary beyond interface.\n\nHer work moves into systems, workflows, and buildable logic.',
    understand:
      'In AI work, design no longer stops at screens.\n\nThe boundary expands into:\nhow systems behave,\nhow workflows continue,\nhow humans and AI share control,\nand how ideas become buildable.\n\nHer background across software, industrial design, HMI, and enterprise systems gives her a wider surface to work from.',
    guideTitle: 'AI expands the designer\u2019s boundary beyond interface.',
    guideSubline: 'Systems, workflows, and buildable logic.',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Expanded skills across framing, workflow, traceability, and control.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Me',
        description: 'The background behind this wider design role.',
        action: { type: 'section', id: 'home-life-archive' },
      },
      {
        step: '03',
        label: 'Point of View',
        description: 'Her view on design judgment in AI systems.',
        action: { type: 'section', id: 'home-approach' },
      },
    ],
    followUps: [
      { label: 'What does she believe about AI and design?', flowId: 'aiBeliefDesign' },
      { label: 'How does she move from ambiguity to structure?', flowId: 'ambiguityToStructure' },
    ],
    sources: [],
  },

  unclearBrief: {
    id: 'unclearBrief',
    decisionArea: 'methodLogic',
    question: 'How does she move from ambiguity to structure?',
    read: 'She starts where the AI brief is still vague.',
    understand:
      'Before moving into screens, she looks for what the work is missing: ownership, handoff, review logic, control boundaries, workflow continuation, or decision structure.',
    guideTitle: 'She starts where the AI brief is still vague.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'AI problem framing · workflow architecture.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Method lens · Conversational AI',
        description: 'Post-response workflow method.',
        action: { type: 'case', id: 'case01' },
      },
    ],
    followUps: [{ label: 'What AI problems does she work on?', flowId: 'aiProblemDomain' }],
    sources: [],
  },

  aiProblems: {
    id: 'aiProblems',
    decisionArea: 'problemDomain',
    question: 'What AI problems does she actually work on?',
    read: 'She works beyond AI capability.',
    understand: 'The harder problems appear after capability enters real work.',
    guideTitle: 'She works beyond AI capability.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Routing · recovery · continuation · handoff.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Review states · sources · auditability.',
        action: { type: 'case', id: 'case02' },
      },
    ],
    followUps: [{ label: 'How does she move from ambiguity to structure?', flowId: 'ambiguityToStructure' }],
    sources: [],
  },

  bestCaseFit: {
    id: 'bestCaseFit',
    decisionArea: 'problemDomain',
    question: 'Which case should I look at first?',
    read: 'Each case shows a different operating layer — not one generic portfolio.',
    understand:
      'Match the case to what you need to evaluate: conversation workflow, review and audit, agent control, or long-term continuity.',
    guideTitle: 'Each case shows a different operating layer.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Routing · recovery · continuation · handoff.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Review states · sources · auditability.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Delegation · intervention · control boundaries.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [{ label: 'What AI problems does she work on?', flowId: 'aiProblemDomain' }],
    sources: [],
  },

  roleFit: {
    id: 'roleFit',
    decisionArea: 'trajectory',
    question: 'How is her designer boundary expanding in the AI era?',
    read:
      'AI expands the designer\u2019s boundary beyond interface.\n\nHer work moves into systems, workflows, and buildable logic.',
    understand:
      'In AI work, design no longer stops at screens.\n\nThe boundary expands into systems, workflows, shared control, and buildable logic.',
    guideTitle: 'AI expands the designer\u2019s boundary beyond interface.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Expanded skills across framing, workflow, traceability, and control.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Me',
        description: 'The background behind this wider design role.',
        action: { type: 'section', id: 'home-life-archive' },
      },
    ],
    followUps: [{ label: 'What does she believe about AI and design?', flowId: 'aiBeliefDesign' }],
    sources: [],
  },

  whichCaseProvesBest: {
    id: 'whichCaseProvesBest',
    decisionArea: 'caseEvidence',
    question: 'Which case proves this best?',
    guideTitle: 'Match the case to the evaluation task.',
    guideSubline: 'No single “hero case” for every hiring lens.',
    keyPoints: [
      { step: '01', title: 'CX / support', line: '→ Case 01' },
      { step: '02', title: 'Legal / audit', line: '→ Case 02' },
      { step: '03', title: 'Agents / ops', line: '→ Case 03 · Case 04 for continuity' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Post-response workflow proof.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Traceability and review proof.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Agentic control proof.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'What role is she strongest for?', flowId: 'roleFit' },
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
    ],
    sources: [],
  },

  differentFromTraditionalUx: {
    id: 'differentFromTraditionalUx',
    decisionArea: 'roleFit',
    question: 'How is this different from traditional UX work?',
    guideTitle: 'Operating logic — not primarily screen polish.',
    guideSubline: 'Less UI gallery · more workflow · ownership · completion.',
    keyPoints: [
      { step: '01', title: 'Scope', line: 'Before / during / after model output.' },
      { step: '02', title: 'Question', line: 'Who owns the decision?' },
      { step: '03', title: 'Proof', line: 'Case structure — not mockup volume.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Point of View',
        description: 'Design beliefs · responsibility.',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        step: '02',
        label: 'Capabilities',
        description: 'Framing · workflow · decision design.',
        action: { type: 'section', id: 'home-capabilities' },
      },
    ],
    followUps: [
      { label: 'What role is she strongest for?', flowId: 'roleFit' },
      { label: 'Can she handle unclear AI briefs?', flowId: 'unclearBrief' },
    ],
    sources: [{ id: '4', citation: 'EU Ethics Guidelines' }],
  },

  collaborationPmEng: {
    id: 'collaborationPmEng',
    decisionArea: 'workingLogic',
    question: 'How does she work with PMs and engineers?',
    guideTitle: 'Collaborates at the structure layer.',
    guideSubline: 'Not only at UI handoff.',
    keyPoints: [
      { step: '01', title: 'With PMs', line: 'Framing · success criteria · ownership.' },
      { step: '02', title: 'With eng', line: 'Handoffs · schemas · runtime constraints.' },
      { step: '03', title: 'Shared', line: 'Testable structure — not feature lists alone.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Workflow · system structuring.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Cross-functional orchestration constraints.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'Can she handle unclear AI briefs?', flowId: 'unclearBrief' },
      { label: 'What role is she strongest for?', flowId: 'roleFit' },
    ],
    sources: [],
  },

  postResponseWorkflow: {
    id: 'postResponseWorkflow',
    decisionArea: 'aiProblemSpace',
    question: 'What does post-response workflow mean?',
    guideTitle: 'Work that continues after the AI response.',
    guideSubline: 'Routing · recovery · handoff · completion.',
    keyPoints: [
      { step: '01', title: 'Not', line: 'Not “better answers” alone.' },
      { step: '02', title: 'Is', line: 'Next step · escalation · operational tools.' },
      { step: '03', title: 'Proof', line: 'Case 01 — three projects, one method.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Primary evidence.',
        action: { type: 'case', id: 'case01' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
    ],
    sources: [{ id: '1', citation: 'Amershi et al., CHI 2019' }],
  },

  decisionTraceability: {
    id: 'decisionTraceability',
    decisionArea: 'aiProblemSpace',
    question: 'Which case shows decision traceability?',
    guideTitle: 'Case 02 · Contract Intelligence.',
    guideSubline: 'Output · human review · confirmation · audit trail.',
    keyPoints: [
      { step: '01', title: 'Inspect', line: 'What the system proposed.' },
      { step: '02', title: 'Sources', line: 'What evidence supports it.' },
      { step: '03', title: 'Record', line: 'What the human confirmed.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 02 · Contract Intelligence',
        description: 'Reviewable judgment · source visibility.',
        action: { type: 'case', id: 'case02' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0' }],
  },

  humanInTheLoopControl: {
    id: 'humanInTheLoopControl',
    decisionArea: 'aiProblemSpace',
    question: 'How does she define human-in-the-loop control?',
    guideTitle: 'Intervention is part of the workflow.',
    guideSubline: 'Not a single approval button after the fact.',
    keyPoints: [
      { step: '01', title: 'Gates', line: 'When automation pauses.' },
      { step: '02', title: 'Roles', line: 'Who can override.' },
      { step: '03', title: 'Trace', line: 'Handoff from AI action to human decision.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Intervention · escalation · boundaries.',
        action: { type: 'case', id: 'case03' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Human review on AI analysis.',
        action: { type: 'case', id: 'case02' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
    ],
    sources: [{ id: '4', citation: 'EU Ethics Guidelines' }],
  },

  differentFromAiUi: {
    id: 'differentFromAiUi',
    decisionArea: 'aiProblemSpace',
    question: 'How is this different from AI UI design?',
    guideTitle: 'Workflow completion — not prompt-and-response polish.',
    guideSubline: 'Interface is one layer · completion is the product.',
    keyPoints: [
      { step: '01', title: 'AI UI', line: 'Chat · assistant surface · output display.' },
      { step: '02', title: 'This work', line: 'Routing · review · handoff · control.' },
      { step: '03', title: 'Start', line: 'Case 01 if evaluating service AI.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Beyond chatbot UI.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Capabilities',
        description: 'Human-AI experience · workflow architecture.',
        action: { type: 'section', id: 'home-capabilities' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
    ],
    sources: [],
  },

  threeMinuteCase: {
    id: 'threeMinuteCase',
    decisionArea: 'caseEvidence',
    question: 'Which case if I only have 3 minutes?',
    guideTitle: 'Pick the lens first — then one case.',
    guideSubline: 'Three minutes = one strong signal, not a full read.',
    keyPoints: [
      { step: '01', title: 'Default', line: 'Case 01 — broadest AI product signal.' },
      { step: '02', title: 'Audit / legal', line: 'Case 02.' },
      { step: '03', title: 'Agents', line: 'Case 03.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Start here if unsure.',
        action: { type: 'case', id: 'case01' },
      },
    ],
    followUps: [
      { label: 'Which case should I look at first?', flowId: 'bestCaseFit' },
    ],
    sources: [],
  },

  systemsThinkingCase: {
    id: 'systemsThinkingCase',
    decisionArea: 'caseEvidence',
    question: 'Which case best shows systems thinking?',
    guideTitle: 'Case 01 and Case 03 — structure across boundaries.',
    guideSubline: 'Tasks · roles · tools · decision points — not screen lists.',
    keyPoints: [
      { step: '01', title: 'Case 01', line: 'Method across three conversational projects.' },
      { step: '02', title: 'Case 03', line: 'Orchestration · control surfaces.' },
      { step: '03', title: 'Capabilities', line: 'Framing before interface.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Cross-project abstraction.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Agentic architecture.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'How does she turn ambiguity into structure?', flowId: 'ambiguityToStructure' },
    ],
    sources: [],
  },

  enterpriseAiCase: {
    id: 'enterpriseAiCase',
    decisionArea: 'caseEvidence',
    question: 'Which case is most relevant for enterprise AI?',
    guideTitle: 'Cases 01–03 are the core enterprise set.',
    guideSubline: 'Workflow · judgment · agentic control.',
    keyPoints: [
      { step: '01', title: 'Case 01', line: 'Service · CX automation.' },
      { step: '02', title: 'Case 02', line: 'Compliance · review · audit.' },
      { step: '03', title: 'Case 03', line: 'Operations · agents · escalation.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Enterprise service workflows.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'High-stakes review.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Agent orchestration.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'Is she a fit for enterprise AI roles?', flowId: 'enterpriseAiRoleFit' },
    ],
    sources: [],
  },

  enterpriseAiRoleFit: {
    id: 'enterpriseAiRoleFit',
    decisionArea: 'roleFit',
    question: 'Is she a fit for enterprise AI roles?',
    guideTitle: 'Yes — when the role needs workflow and control design.',
    guideSubline: 'Not primarily demo UI or isolated assistant features.',
    keyPoints: [
      { step: '01', title: 'Fit', line: 'B2B · operations · accountability.' },
      { step: '02', title: 'Needs', line: 'Traceability · human-in-the-loop · completion.' },
      { step: '03', title: 'Proof', line: 'Cases 01–03 + Capabilities.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Scan capability areas first.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Cases 01–03.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'What role is she strongest for?', flowId: 'roleFit' },
    ],
    sources: [],
  },

  conversationalAiRoleFit: {
    id: 'conversationalAiRoleFit',
    decisionArea: 'roleFit',
    question: 'Is she a fit for conversational AI work?',
    guideTitle: 'Yes — especially beyond chatbot UI.',
    guideSubline: 'Post-response workflow is the proof layer.',
    keyPoints: [
      { step: '01', title: 'Beyond', line: 'Not answers alone — routing · handoff.' },
      { step: '02', title: 'Method', line: 'Three projects → one abstraction.' },
      { step: '03', title: 'Look', line: 'Case 01 first.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Primary fit evidence.',
        action: { type: 'case', id: 'case01' },
      },
    ],
    followUps: [
      { label: 'What does post-response workflow mean?', flowId: 'postResponseWorkflow' },
    ],
    sources: [],
  },

  toolWorkflow: {
    id: 'toolWorkflow',
    decisionArea: 'workingLogic',
    question: 'AI build workflow and tools',
    guideTitle: 'Tools accelerate exploration — judgment defines what to build.',
    guideSubline: 'Cursor · prototyping support structure — not replace it.',
    keyPoints: [
      { step: '01', title: 'Tools', line: 'Faster flow validation.' },
      { step: '02', title: 'Lead', line: 'Framing · evidence · decision design.' },
      { step: '03', title: 'Proof', line: 'Cases — not prototype volume.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Framing · structuring.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Enterprise case depth.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'How does she work with PMs and engineers?', flowId: 'collaborationPmEng' },
    ],
    sources: [],
  },

  conversationalAi: {
    id: 'conversationalAi',
    decisionArea: 'aiProblemSpace',
    question: 'Conversational AI and service workflow',
    guideTitle: 'Beyond the chatbot UI.',
    guideSubline: 'Routing · recovery · continuation · handoff.',
    keyPoints: [
      { step: '01', title: 'Route', line: 'Intent → right operational path.' },
      { step: '02', title: 'Recover', line: 'Fallback when confidence is low.' },
      { step: '03', title: 'Complete', line: 'Handoff to operations.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Primary evidence.',
        action: { type: 'case', id: 'case01' },
      },
    ],
    followUps: [
      { label: 'Can she handle unclear AI briefs?', flowId: 'unclearBrief' },
    ],
    sources: [{ id: '1', citation: 'Amershi et al., CHI 2019' }],
  },

  supplyChainAgents: {
    id: 'supplyChainAgents',
    decisionArea: 'aiProblemSpace',
    question: 'Agentic workflows and control',
    guideTitle: 'Control boundaries in agentic systems.',
    guideSubline: 'Orchestration · guardrails · intervention — not demos alone.',
    keyPoints: [
      { step: '01', title: 'See', line: 'Orchestration steps · visibility.' },
      { step: '02', title: 'Configure', line: 'Control surfaces · permissions.' },
      { step: '03', title: 'Intervene', line: 'Escalation when automation stops.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Primary evidence.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0' }],
  },

  contractIntelligence: {
    id: 'contractIntelligence',
    decisionArea: 'aiProblemSpace',
    question: 'Contract intelligence and reviewable judgment',
    guideTitle: 'AI analysis made inspectable.',
    guideSubline: 'Sources · review states · human validation.',
    keyPoints: [
      { step: '01', title: 'States', line: 'Answer tied to evidence.' },
      { step: '02', title: 'Review', line: 'Human judgment before commit.' },
      { step: '03', title: 'Audit', line: 'Traceable record.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 02 · Contract Intelligence',
        description: 'Primary evidence.',
        action: { type: 'case', id: 'case02' },
      },
    ],
    followUps: [
      { label: 'Which case shows decision traceability?', flowId: 'decisionTraceability' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0' }],
  },

  fallback: {
    id: 'fallback',
    decisionArea: 'beliefStance',
    question: 'General inquiry',
    read: 'Start from what you want to understand.',
    understand: GUIDE_FALLBACK_MESSAGE,
    guideTitle: 'Start from what you want to understand.',
    guideSubline: GUIDE_FALLBACK_MESSAGE,
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'Belief & stance',
        description: 'What she believes about AI and design.',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Cases 01–04 — operating problems in practice.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'What does she believe about AI and design?', flowId: 'aiBeliefDesign' },
      { label: 'What AI problems does she actually work on?', flowId: 'aiProblemDomain' },
      { label: 'How does she move from ambiguity to structure?', flowId: 'ambiguityToStructure' },
    ],
    sources: [],
  },
};

/**
 * @param {GuideFlow} flow
 * @returns {{
 *   area: typeof GUIDE_DECISION_AREAS[keyof typeof GUIDE_DECISION_AREAS],
 *   keyPoints: GuideKeyPoint[],
 *   framingBlocks: GuideKeyPoint[],
 *   problemBlocks: GuideProblemBlock[],
 *   evidenceLabel: string,
 *   whereToLook: GuideEvidence[],
 * }}
 */
export function getFlowPresentation(flow) {
  const areaId = resolveDecisionArea(flow.id, flow.decisionArea);
  const framingBlocks = flow.framingBlocks?.slice(0, 3) ?? [];
  const problemBlocks = flow.problemBlocks?.slice(0, 4) ?? [];
  const hasReadUnderstand = Boolean(flow.read || flow.understand);
  const hasAlternateLayout =
    !hasReadUnderstand && (framingBlocks.length > 0 || problemBlocks.length > 0);
  const read = flow.read ?? flow.guideTitle ?? '';
  const understand = flow.understand ?? flow.guideSubline ?? '';
  const readParagraphs = read
    ? read.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : [];
  const understandParagraphs = understand
    ? understand.split(/\n+/).map((p) => p.trim()).filter(Boolean)
    : [];
  return {
    area: GUIDE_DECISION_AREAS[areaId],
    read,
    readParagraphs,
    understand,
    understandParagraphs,
    hasReadUnderstand,
    framingBlocks,
    problemBlocks,
    keyPoints: hasAlternateLayout || hasReadUnderstand ? [] : flow.keyPoints.slice(0, 3),
    evidenceLabel: flow.evidenceLabel ?? GUIDE_RESULT_SECTIONS.go,
    whereToLook: flow.evidence.slice(0, 6),
  };
}

/**
 * @param {string} flowId
 * @param {string} [questionOverride]
 * @returns {GuideFlow | null}
 */
export function getGuideFlow(flowId, questionOverride) {
  const resolvedId = GUIDE_FLOW_ALIASES[flowId] ?? flowId;
  const flow = GUIDE_FLOWS[resolvedId] ?? GUIDE_FLOWS[flowId] ?? GUIDE_FLOWS.fallback;
  if (!flow) return null;
  if (!questionOverride || questionOverride === flow.question) return flow;
  return { ...flow, question: questionOverride };
}

/**
 * @param {string} flowId
 * @returns {string}
 */
export function getGuideQuestionForEntry(flowId) {
  return GUIDE_FLOWS[flowId]?.question ?? GUIDE_FLOWS.fallback.question;
}
