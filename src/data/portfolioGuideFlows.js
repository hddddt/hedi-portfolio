/** @typedef {{ type: 'section' | 'case', id: string }} GuideDestination */

/** @typedef {{ step: string, label: string, description: string, action: GuideDestination }} GuideEvidence */

/** @typedef {{ label: string, flowId: string }} GuideFollowUp */

/**
 * @typedef {object} GuideFlow
 * @property {string} id
 * @property {string} question
 * @property {string} guideTitle
 * @property {string} guideSubline
 * @property {string[]} why
 * @property {string} [howIntro]
 * @property {string[]} how
 * @property {GuideEvidence[]} evidence
 * @property {GuideFollowUp[]} followUps
 * @property {{ id: string, citation: string }[]} [sources]
 */

/** @type {{ id: string, num: string, flowId: string }[]} */
export const GUIDE_ENTRY_QUESTIONS = [
  { id: 'entry-01', num: '01', flowId: 'unclearBrief' },
  { id: 'entry-02', num: '02', flowId: 'aiProblems' },
  { id: 'entry-03', num: '03', flowId: 'bestCaseFit' },
  { id: 'entry-04', num: '04', flowId: 'ambiguityToStructure' },
];

export const GUIDE_CUSTOM_INPUT_PLACEHOLDER =
  'Ask about role fit · AI cases · workflow design · collaboration context';

export const GUIDE_FALLBACK_MESSAGE =
  'I can best guide you through Hedi’s AI product design work, case evidence, role fit, workflow design, and collaboration context. Try asking about: role fit, conversational AI, agentic workflows, decision traceability, or how she works with ambiguity.';

/** @type {Record<string, GuideFlow>} */
export const GUIDE_FLOWS = {
  unclearBrief: {
    id: 'unclearBrief',
    question: 'Can she work when the AI brief is still unclear?',
    guideTitle: 'She works before the brief is clear.',
    guideSubline:
      'Where AI capability, workflow, ownership, and next steps are still undefined.',
    why: [
      'AI briefs often start as capability statements: “We want an assistant.” “We want automation.” “We want to use AI.”',
      'But the product problem is often still unresolved: What should AI own? Where should humans intervene? What happens after AI gives an output? How does work actually get completed?',
    ],
    howIntro:
      'She turns vague AI ambition into product structure by locating the missing operating layer:',
    how: [
      'workflow continuation',
      'decision ownership',
      'human intervention points',
      'escalation logic',
      'traceability',
      'completion responsibility',
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'How she turns ambiguity into structure.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Case 01 · Conversational AI',
        description:
          'How she designs routing, recovery, continuation, and handoff after the AI response.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'How she defines control in agentic workflows.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'What does she do when AI output is not enough?', flowId: 'aiOutputNotEnough' },
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
      { label: 'How is this different from traditional UX work?', flowId: 'differentFromTraditionalUx' },
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
    ],
    sources: [
      { id: '1', citation: 'Amershi et al., CHI 2019 — Human-AI interaction guidelines' },
      { id: '3', citation: 'NIST AI RMF 1.0 — accountability and operational risk' },
    ],
  },

  aiProblems: {
    id: 'aiProblems',
    question: 'What AI problems does she design for?',
    guideTitle: 'She designs where AI meets unfinished work.',
    guideSubline:
      'Not chat interfaces alone — but decision, continuation, ownership, and completion in enterprise systems.',
    why: [
      'Most AI product failures are not model failures. They are operating-layer failures: the system can respond, but the work still does not move.',
      'She focuses on problems where AI output must become action — with human review, traceability, escalation, and clear responsibility.',
    ],
    howIntro: 'Her problem spaces typically include:',
    how: [
      'post-response workflow and handoff',
      'human-in-the-loop review and validation',
      'agent orchestration and control surfaces',
      'decision traceability in high-stakes domains',
      'service recovery when AI confidence is low',
      'turning capability demos into operable product structure',
    ],
    evidence: [
      {
        step: '01',
        label: 'Point of View',
        description: 'How she defines the real design layer before the interface.',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        step: '02',
        label: 'Case 01 · Conversational AI',
        description: 'Routing, recovery, and continuation after the AI response.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '03',
        label: 'Case 02 · Contract Intelligence',
        description: 'How AI analysis becomes reviewable judgment.',
        action: { type: 'case', id: 'case02' },
      },
    ],
    followUps: [
      { label: 'Can she work when the AI brief is still unclear?', flowId: 'unclearBrief' },
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
    ],
    sources: [
      { id: '2', citation: 'Google PAIR People + AI Guidebook — feedback loops and mental models' },
      { id: '4', citation: 'EU Ethics Guidelines — human agency and oversight' },
    ],
  },

  bestCaseFit: {
    id: 'bestCaseFit',
    question: 'Which case best proves her fit?',
    guideTitle: 'It depends what you need to evaluate.',
    guideSubline:
      'Each case proves a different AI operating layer — not a generic “AI portfolio.”',
    why: [
      'Recruiters and leads rarely need “more cases.” They need the right evidence for the role, team, and risk level.',
      'Match the case to the judgment you are trying to make: conversational completion, reviewable analysis, or agentic control.',
    ],
    howIntro: 'Use this lens to choose evidence:',
    how: [
      'Conversational AI → service workflow completion after the response',
      'Contract Intelligence → traceable judgment in high-stakes review',
      'Supply Chain Agents → control, orchestration, and operational guardrails',
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Best for CX, support automation, and post-response workflow design.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Best for auditability, legal review, and human validation flows.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Best for agentic systems, orchestration, and enterprise control design.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
      { label: 'How does she turn ambiguity into structure?', flowId: 'ambiguityToStructure' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0 — evidence and accountability framing' }],
  },

  ambiguityToStructure: {
    id: 'ambiguityToStructure',
    question: 'How does she turn ambiguity into structure?',
    guideTitle: 'She maps the missing operating layer first.',
    guideSubline:
      'Before screens — workflow, ownership, decision states, and what “done” means.',
    why: [
      'Ambiguous AI projects often hide structural gaps: unclear ownership, undefined handoffs, and no model for completion.',
      'Without that layer, teams iterate on interfaces while the product problem stays unresolved.',
    ],
    howIntro: 'Her structuring moves typically include:',
    how: [
      'mapping stakeholders, triggers, and decision gates',
      'defining what AI owns vs. what humans must validate',
      'designing continuation paths after AI output',
      'making escalation and recovery explicit',
      'aligning business process with interface states',
      'translating domain logic into reviewable product flows',
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'How she frames product direction under ambiguity.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Three cases showing structure across conversational, analytical, and agentic AI.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Control surfaces for complex agent orchestration.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'Can she work when the AI brief is still unclear?', flowId: 'unclearBrief' },
      { label: 'How is this different from traditional UX work?', flowId: 'differentFromTraditionalUx' },
    ],
    sources: [{ id: '1', citation: 'Amershi et al., CHI 2019 — structured interaction design' }],
  },

  aiOutputNotEnough: {
    id: 'aiOutputNotEnough',
    question: 'What does she do when AI output is not enough?',
    guideTitle: 'She designs what happens after the answer.',
    guideSubline:
      'Recovery, routing, escalation, and handoff — so work can still complete.',
    why: [
      'In enterprise systems, an AI response is rarely the end state. Users still need to act, verify, escalate, or continue in another system.',
      'The design problem is not “better answers” alone — it is what the product does when the answer is incomplete, wrong, or insufficient.',
    ],
    howIntro: 'She typically designs:',
    how: [
      'fallback and recovery flows when confidence is low',
      'intent routing to the right operational path',
      'human takeover and review surfaces',
      'continuation into back-office or specialist tools',
      'visible decision states instead of dead-end chat',
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Abstracted method across three conversational AI projects.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Review states when AI analysis requires human judgment.',
        action: { type: 'case', id: 'case02' },
      },
    ],
    followUps: [
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
      { label: 'Can she work when the AI brief is still unclear?', flowId: 'unclearBrief' },
    ],
    sources: [{ id: '2', citation: 'Google PAIR — feedback and failure handling' }],
  },

  whichCaseProvesBest: {
    id: 'whichCaseProvesBest',
    question: 'Which case proves this best?',
    guideTitle: 'Pick evidence by the AI layer you need to evaluate.',
    guideSubline:
      'Conversational completion, reviewable analysis, or agentic control — each case proves a different fit signal.',
    why: [
      'A single “best case” flattens the work. The strongest proof depends on whether you are hiring for service workflow, judgment design, or agent orchestration.',
    ],
    howIntro: 'Quick mapping:',
    how: [
      'CX / support / conversational → Case 01',
      'legal / audit / review → Case 02',
      'agents / automation / control → Case 03',
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Routing, recovery, continuation, and handoff.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Case 02 · Contract Intelligence',
        description: 'Traceable judgment and source-backed review.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '03',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Orchestration, guardrails, and operational control.',
        action: { type: 'case', id: 'case03' },
      },
    ],
    followUps: [
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
    ],
    sources: [],
  },

  differentFromTraditionalUx: {
    id: 'differentFromTraditionalUx',
    question: 'How is this different from traditional UX work?',
    guideTitle: 'She designs the operating layer, not just the interface.',
    guideSubline:
      'Workflow, ownership, decision states, and completion — especially where AI is involved.',
    why: [
      'Traditional UX often stops at usable screens. AI enterprise work requires designing what happens before, during, and after model output — including human intervention and traceability.',
      'The product question is frequently: who owns the decision, and how does work finish?',
    ],
    howIntro: 'Her work extends into:',
    how: [
      'product framing under ambiguous AI briefs',
      'decision and validation design',
      'handoff between AI and operational systems',
      'control surfaces for agentic workflows',
      'evidence-oriented case narratives, not UI galleries',
    ],
    evidence: [
      {
        step: '01',
        label: 'Point of View',
        description: 'Beliefs about AI, responsibility, and completion.',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        step: '02',
        label: 'Capabilities',
        description: 'Framing, structuring, workflow, and decision design.',
        action: { type: 'section', id: 'home-capabilities' },
      },
    ],
    followUps: [
      { label: 'How does she turn ambiguity into structure?', flowId: 'ambiguityToStructure' },
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
    ],
    sources: [{ id: '4', citation: 'EU Ethics Guidelines — human agency in AI systems' }],
  },

  roleFitStrongest: {
    id: 'roleFitStrongest',
    question: 'What role is she strongest for?',
    guideTitle: 'Senior product design in complex AI and enterprise workflow contexts.',
    guideSubline:
      'Especially where the brief is unclear, stakes are high, and AI must become operable structure.',
    why: [
      'She is strongest where teams need product judgment before polished UI — framing AI capability into workflow, ownership, and reviewable outcomes.',
      'Less ideal as a purely visual or marketing-site role; strongest when AI, operations, and decision design intersect.',
    ],
    howIntro: 'Strong fit signals include:',
    how: [
      'AI product design / lead product designer (enterprise)',
      'human-in-the-loop and workflow design roles',
      'agentic product or platform design with control requirements',
      'early-stage AI product framing with cross-functional teams',
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'How she creates value across framing, structure, and AI workflow design.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Enterprise evidence across conversational, analytical, and agentic AI.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'Which case best proves her fit?', flowId: 'bestCaseFit' },
      { label: 'Can she work when the AI brief is still unclear?', flowId: 'unclearBrief' },
    ],
    sources: [],
  },

  roleFit: {
    id: 'roleFit',
    question: 'Role fit and profile',
    guideTitle: 'Evaluate her through capability, evidence, and operating context.',
    guideSubline:
      'Senior product designer for AI systems, enterprise workflows, and human-AI decision design.',
    why: [
      'A CV alone rarely answers whether someone can enter an ambiguous AI project and make it buildable. The guide routes you to the right evidence for that judgment.',
    ],
    howIntro: 'Start with:',
    how: [
      'Capabilities for framing and structuring',
      'Case evidence matched to your hiring lens',
      'Point of View for design beliefs and responsibility',
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Where she creates value across AI product work.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Which case fits your role?',
        description: 'Use the case lens to pick the strongest proof.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
      { label: 'Which case best proves her fit?', flowId: 'bestCaseFit' },
    ],
    sources: [],
  },

  conversationalAi: {
    id: 'conversationalAi',
    question: 'Conversational AI and service workflow',
    guideTitle: 'She designs beyond the chatbot UI.',
    guideSubline:
      'Routing, recovery, continuation, and handoff after the AI response.',
    why: [
      'Conversational AI in enterprise settings fails when the product stops at answering. Service work continues in operations, escalation, and specialist tools.',
    ],
    howIntro: 'Case 01 shows how she abstracted three projects into a method for:',
    how: [
      'intent routing',
      'fallback and recovery flow',
      'escalation logic',
      'handoff to operational surfaces',
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 01 · Conversational AI',
        description: 'Primary evidence for post-response workflow design.',
        action: { type: 'case', id: 'case01' },
      },
      {
        step: '02',
        label: 'Capabilities',
        description: 'AI workflow and decision design capability area.',
        action: { type: 'section', id: 'home-capabilities' },
      },
    ],
    followUps: [
      { label: 'What does she do when AI output is not enough?', flowId: 'aiOutputNotEnough' },
      { label: 'Can she work when the AI brief is still unclear?', flowId: 'unclearBrief' },
    ],
    sources: [{ id: '1', citation: 'Amershi et al., CHI 2019' }],
  },

  supplyChainAgents: {
    id: 'supplyChainAgents',
    question: 'Agentic workflows and control',
    guideTitle: 'She defines control in agentic systems.',
    guideSubline:
      'Orchestration, guardrails, and operational surfaces — not autonomous demos alone.',
    why: [
      'Agent projects amplify risk when ownership, escalation, and control are undefined. The design problem includes how humans supervise, intervene, and trace outcomes.',
    ],
    howIntro: 'Case 03 focuses on:',
    how: [
      'agent orchestration steps and visibility',
      'control and configuration surfaces',
      'operational guardrails in enterprise context',
      'translating agent capability into manageable product structure',
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 03 · Supply Chain Agents',
        description: 'Primary evidence for agentic workflow control design.',
        action: { type: 'case', id: 'case03' },
      },
      {
        step: '02',
        label: 'Capabilities',
        description: 'Complex system structuring and AI workflow design.',
        action: { type: 'section', id: 'home-capabilities' },
      },
    ],
    followUps: [
      { label: 'Which case proves this best?', flowId: 'whichCaseProvesBest' },
      { label: 'What AI problems does she design for?', flowId: 'aiProblems' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0 — operational risk and accountability' }],
  },

  contractIntelligence: {
    id: 'contractIntelligence',
    question: 'Contract intelligence and reviewable judgment',
    guideTitle: 'She makes AI analysis inspectable.',
    guideSubline:
      'Source-backed answers, review states, and human validation in high-stakes work.',
    why: [
      'Legal and compliance contexts require more than confident output. Teams need traceability, review paths, and clear decision ownership.',
    ],
    howIntro: 'Case 02 demonstrates:',
    how: [
      'answer states tied to evidence and sources',
      'review flows for human judgment',
      'product structure for auditability',
      'AI as input to decision — not replacement for responsibility',
    ],
    evidence: [
      {
        step: '01',
        label: 'Case 02 · Contract Intelligence',
        description: 'Primary evidence for traceable AI judgment design.',
        action: { type: 'case', id: 'case02' },
      },
      {
        step: '02',
        label: 'Point of View',
        description: 'Design beliefs about responsibility and completion.',
        action: { type: 'section', id: 'home-approach' },
      },
    ],
    followUps: [
      { label: 'What does she do when AI output is not enough?', flowId: 'aiOutputNotEnough' },
      { label: 'How is this different from traditional UX work?', flowId: 'differentFromTraditionalUx' },
    ],
    sources: [{ id: '3', citation: 'NIST AI RMF 1.0 — transparency and documentation' }],
  },

  toolWorkflow: {
    id: 'toolWorkflow',
    question: 'AI build workflow and tools',
    guideTitle: 'She uses AI tools to accelerate structure — not replace judgment.',
    guideSubline:
      'Cursor, rapid prototyping, and vibe coding support exploration; product framing and evidence still lead.',
    why: [
      'Tool fluency matters, but hiring teams usually need to know whether she can define the right problem and operating layer — not only ship prototypes quickly.',
    ],
    howIntro: 'Her tool workflow supports:',
    how: [
      'fast structural exploration and flow validation',
      'translating ambiguity into testable product directions',
      'collaborating with engineering on agentic and workflow products',
      'keeping evidence and decision design central',
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'Product framing and complex system structuring.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Enterprise case evidence beyond prototype demos.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'How does she turn ambiguity into structure?', flowId: 'ambiguityToStructure' },
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
    ],
    sources: [],
  },

  fallback: {
    id: 'fallback',
    question: 'General inquiry',
    guideTitle: 'Start with a structured lens.',
    guideSubline: GUIDE_FALLBACK_MESSAGE,
    why: [
      'This guide works best with specific evaluation lenses — role fit, case evidence, workflow design, or ambiguity framing.',
    ],
    howIntro: 'Try one of these entry points:',
    how: [
      'unclear AI briefs and early project framing',
      'conversational AI and post-response workflow',
      'agentic control and orchestration',
      'reviewable judgment in high-stakes domains',
    ],
    evidence: [
      {
        step: '01',
        label: 'Capabilities',
        description: 'How she turns ambiguity into structure.',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        step: '02',
        label: 'Selected Work',
        description: 'Case evidence across three AI operating layers.',
        action: { type: 'section', id: 'home-work-narrative' },
      },
    ],
    followUps: [
      { label: 'Can she work when the AI brief is still unclear?', flowId: 'unclearBrief' },
      { label: 'Which case best proves her fit?', flowId: 'bestCaseFit' },
      { label: 'What role is she strongest for?', flowId: 'roleFitStrongest' },
    ],
    sources: [],
  },
};

/**
 * @param {string} flowId
 * @param {string} [questionOverride]
 * @returns {GuideFlow | null}
 */
export function getGuideFlow(flowId, questionOverride) {
  const flow = GUIDE_FLOWS[flowId] ?? GUIDE_FLOWS.fallback;
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
