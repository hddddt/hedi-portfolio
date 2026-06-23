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
 * @property {string} [focus]
 * @property {GuideKeyPoint[]} keyPoints
 * @property {GuideKeyPoint[]} [framingBlocks]
 * @property {GuideProblemBlock[]} [problemBlocks]
 * @property {string} [evidenceLabel]
 * @property {GuideEvidence[]} evidence
 * @property {GuideFollowUp[]} followUps
 * @property {{ id: string, citation: string }[]} [sources]
 */

/** @type {{ id: string, num: string, flowId: string, title: string, descriptor: string }[]} */
export const GUIDE_ENTRY_QUESTIONS = [
  {
    id: 'entry-01',
    num: '01',
    flowId: 'aiBeliefDesign',
    title: 'Belief',
    descriptor: 'AI, design, and responsibility',
  },
  {
    id: 'entry-02',
    num: '02',
    flowId: 'aiProblemDomain',
    title: 'Work',
    descriptor: 'Turning AI capability into usable systems',
  },
  {
    id: 'entry-03',
    num: '03',
    flowId: 'ambiguityToStructure',
    title: 'Method',
    descriptor: 'From ambiguity to structure',
  },
  {
    id: 'entry-04',
    num: '04',
    flowId: 'designerTrajectory',
    title: 'Expanded Role',
    descriptor: 'Where design moves in AI systems',
  },
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
    understand: 'Judgment.\nControl.\nResponsibility.\nCompletion.',
    focus: 'judgment · handoff · control · traceability · completion',
    guideTitle: 'AI expands what systems can do.',
    guideSubline: 'Design defines where people still belong.',
    keyPoints: [],
    evidenceLabel: 'RELATED PATHS',
    evidence: [
      {
        step: '01',
        label: 'Point of View',
        description: 'The position behind the portfolio.',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        step: '02',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Human control inside automation.',
        action: { type: 'case', id: 'case03' },
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
    question: 'What AI work does she actually do?',
    read: 'She designs how AI capability becomes usable work.',
    understand:
      'From output to workflow.\nFrom automation to control.\nFrom possibility to operating structure.',
    focus: 'workflow · decision · handoff · control · completion',
    guideTitle: 'She designs how AI capability becomes usable work.',
    guideSubline: '',
    keyPoints: [],
    evidenceLabel: 'RELATED PATHS',
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'AI responses → workflow continuation.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'AI analysis → traceable review decisions.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Automation → human-in-the-loop control.',
        action: { type: 'case', id: 'case03' },
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
    read: 'She starts before the interface.',
    understand:
      'What is the task?\nWhere is the handoff?\nWhen should AI stop?\nWho owns the decision?',
    focus: 'framing · workflow · states · escalation · rules',
    guideTitle: 'She starts before the interface.',
    guideSubline: '',
    keyPoints: [],
    evidenceLabel: 'RELATED PATHS',
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Support ambiguity → routing and recovery logic.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Review ambiguity → decision states and ownership.',
        action: { type: 'case', id: 'case02' },
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
    question: 'How is the design role expanding in AI systems?',
    read: 'Design moves from shaping interfaces to shaping operating conditions.',
    understand:
      'Where AI acts.\nWhere people decide.\nHow work continues.\nHow responsibility stays visible.',
    focus: 'AI workflow · human-in-the-loop · governance by design · operational UX',
    guideTitle: 'Design moves from shaping interfaces to shaping operating conditions.',
    guideSubline: '',
    keyPoints: [],
    evidenceLabel: 'RELATED PATHS',
    evidence: [
      {
        step: '01',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Automation → human-in-the-loop control.',
        action: { type: 'case', id: 'case03' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'AI decisions → traceability and accountability.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 01 · Conversational AI',
        description: 'Responses → handoff and continuation.',
        action: { type: 'case', id: 'case01' },
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
    question: 'How does Hedi handle complex requirements?',
    read: 'She translates stakeholder needs, constraints, and domain requirements into product logic.',
    understand:
      'Workflows, roles, decision logic, acceptance criteria, and validation points — before interface execution.',
    guideTitle: 'Complex requirements become structured product logic.',
    guideSubline: '',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'From requirements to product logic',
        description: 'Requirements translation · stakeholder alignment · workflow structure.',
        action: { type: 'capability', id: 'requirements-to-product-logic' },
      },
      {
        step: '02',
        label: 'Supply Chain Agents',
        description: 'Complex enterprise workflow structure.',
        action: { type: 'case', id: 'case03' },
      },
      {
        step: '03',
        label: 'Contract Intelligence',
        description: 'Review context and decision architecture.',
        action: { type: 'case', id: 'case02' },
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
    question: 'What roles is Hedi best suited for?',
    read:
      'Product/UX design in complex AI, enterprise workflow, decision-heavy, or business-process-heavy products.',
    understand:
      'She combines product design, workflow thinking, and requirements translation — beyond UI execution.',
    guideTitle: 'Product/UX roles in complex AI and enterprise workflow.',
    guideSubline: 'Decision-heavy systems · internal tools · agentic or AI-supported enterprise products.',
    keyPoints: [],
    evidence: [
      {
        step: '01',
        label: 'What I structure',
        description: 'Requirements, workflows, control points, traceable systems.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Contract Intelligence',
        description: 'Decision traceability in regulated workflow context.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Supply Chain Agents',
        description: 'Human-in-the-loop control in agentic workflow.',
        action: { type: 'case', id: 'case03' },
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
    question: 'What shows that Hedi works beyond UI screens?',
    guideTitle: 'She structures product logic behind the interface.',
    guideSubline: 'Workflows · roles · decisions · handoffs · control points.',
    keyPoints: [
      { step: '01', title: 'Scope', line: 'Requirements, workflow logic, and decision structure.' },
      { step: '02', title: 'AI', line: 'What happens after output enters real work.' },
      { step: '03', title: 'Proof', line: 'Case structure — not mockup volume.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'From requirements to product logic',
        description: 'Requirements translation · workflow structure · acceptance criteria.',
        action: { type: 'capability', id: 'requirements-to-product-logic' },
      },
      {
        step: '02',
        label: 'Contract Intelligence',
        description: 'Decision states and review ownership.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Point of View',
        description: 'Completion as a responsibility structure.',
        action: { type: 'section', id: 'home-approach' },
      },
    ],
    followUps: [
      { label: 'What roles is she best suited for?', flowId: 'roleFit' },
      { label: 'How does she handle complex requirements?', flowId: 'unclearBrief' },
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
        label: 'What I structure',
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
    question: 'How does Hedi make AI-assisted decisions reviewable?',
    guideTitle: 'She structures decision states, source visibility, review history, and audit paths.',
    guideSubline: 'AI-assisted work becomes checkable, correctable, and sign-off ready.',
    keyPoints: [
      { step: '01', title: 'States', line: 'What stage a decision is in.' },
      { step: '02', title: 'Sources', line: 'What evidence supports AI output.' },
      { step: '03', title: 'Record', line: 'What the human confirmed or changed.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Contract Intelligence',
        description: 'Traceable review states.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '02',
        label: 'From decisions to traceable systems',
        description: 'Decision states · audit trail · human confirmation.',
        action: { type: 'capability', id: 'decisions-to-traceable-systems' },
      },
      {
        step: '03',
        label: 'Point of View',
        description: 'Capability is not completion.',
        action: { type: 'section', id: 'home-approach' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she work on?', flowId: 'aiProblemDomain' },
      { label: 'Which case should I look at first?', flowId: 'bestCaseFit' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0' }],
  },

  humanInTheLoopControl: {
    id: 'humanInTheLoopControl',
    decisionArea: 'aiProblemSpace',
    question: 'Where does Hedi define human control in AI-supported workflows?',
    guideTitle: 'She defines where people review, approve, override, escalate, or take responsibility.',
    guideSubline: 'Human control is part of workflow structure — not an afterthought.',
    keyPoints: [
      { step: '01', title: 'Review', line: 'Where people inspect AI or automation output.' },
      { step: '02', title: 'Control', line: 'Approval gates, override paths, escalation logic.' },
      { step: '03', title: 'Ownership', line: 'Who takes responsibility when exceptions appear.' },
    ],
    evidence: [
      {
        step: '01',
        label: 'Supply Chain Agents',
        description: 'Human checkpoints and intervention gates.',
        action: { type: 'case', id: 'case03' },
      },
      {
        step: '02',
        label: 'Contract Intelligence',
        description: 'Human confirmation in AI-assisted review.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'From automation to human control',
        description: 'Review points · approval gates · escalation logic.',
        action: { type: 'capability', id: 'automation-to-human-control' },
      },
    ],
    followUps: [{ label: 'What AI problems does she work on?', flowId: 'aiProblemDomain' }],
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
        label: 'What I structure',
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
        label: 'What I structure',
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
        label: 'What I structure',
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
    evidenceLabel: flow.evidenceLabel ?? GUIDE_RESULT_SECTIONS.relatedPaths,
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
