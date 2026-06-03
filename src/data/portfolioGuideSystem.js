/**
 * Portfolio Guide — four understanding layers (belief · problems · method · trajectory).
 */

/** @typedef {'beliefStance' | 'problemDomain' | 'methodLogic' | 'trajectory'} GuideDecisionAreaId */

/** @type {Record<GuideDecisionAreaId, { id: GuideDecisionAreaId, label: string, question: string }>} */
export const GUIDE_DECISION_AREAS = {
  beliefStance: {
    id: 'beliefStance',
    label: 'Belief & stance',
    question: 'What does she believe about AI and design?',
  },
  problemDomain: {
    id: 'problemDomain',
    label: 'Problem domain',
    question: 'What AI problems does she actually work on?',
  },
  methodLogic: {
    id: 'methodLogic',
    label: 'Method',
    question: 'How does she move from ambiguity to structure?',
  },
  trajectory: {
    id: 'trajectory',
    label: 'Expanded design boundary',
    question: 'How is her designer boundary expanding in the AI era?',
  },
};

/** User-facing Portfolio Shortcut shell copy */
export const SHORTCUT_ENTRY = {
  label: 'Portfolio Shortcut',
  tagline: 'Choose an angle, then jump to the evidence that answers it.',
  freeInputPlaceholder: 'Search by AI topic, role question, or design signal',
  submitLabel: 'Find',
};

export const SHORTCUT_SECTIONS = {
  keyAngles: 'Review angles',
  proofPoints: 'Proof points',
  search: 'Search evidence',
  shortAnswer: 'Short answer',
  relatedProof: 'Related proof points',
  continueWith: 'Continue with',
};

export {
  SHORTCUT_KEY_ANGLES,
  SHORTCUT_ROUTES,
  SHORTCUT_PROOF_POINTS,
  SHORTCUT_ROUTE_PANELS,
  SHORTCUT_ANGLE_RESULTS,
  getShortcutRoute,
  getShortcutRoutePanel,
  getShortcutAngleResult,
} from './portfolioShortcutContent.js';

/** @deprecated use SHORTCUT_PROOF_POINTS */
export { SHORTCUT_PROOF_POINTS as SHORTCUT_RECOMMENDED_EVIDENCE } from './portfolioShortcutContent.js';

/** @deprecated use SHORTCUT_ENTRY */
export const GUIDE_ENTRY = SHORTCUT_ENTRY;

export const GUIDE_SYSTEM = {
  purpose:
    'Four lenses into belief, problem domain, method, and expanded design boundary — interpretive, not a recruiter checklist.',
  audiences: ['recruiters', 'hiring managers', 'design leads', 'PM / engineering teams', 'AI product teams'],
  answerPrinciples: [
    'Start with the judgment.',
    'Keep each layer distinct — belief, problems, method, expanded boundary.',
    'Point to evidence and method lenses, not only case menus.',
    'Stay sharp and human — not generic AI copy.',
  ],
};

export const GUIDE_RESULT_SECTIONS = {
  youAsked: 'Query',
  takeaway: 'Summary',
  shortMeaning: 'Summary',
  focus: 'Focus',
  relatedPaths: 'Matched evidence',
  askFromAngle: 'Refine',
  followUp: 'Related',
  whereToLook: 'Matched evidence',
  matchReason: 'Why it matches',
};

/** Maps flow id → decision area (including legacy follow-up flows). */
export const FLOW_DECISION_AREA = /** @type {Record<string, GuideDecisionAreaId>} */ ({
  aiBeliefDesign: 'beliefStance',
  aiProblemDomain: 'problemDomain',
  ambiguityToStructure: 'methodLogic',
  designerTrajectory: 'trajectory',

  unclearBrief: 'methodLogic',
  aiProblems: 'problemDomain',
  postResponseWorkflow: 'problemDomain',
  decisionTraceability: 'problemDomain',
  humanInTheLoopControl: 'problemDomain',
  differentFromAiUi: 'problemDomain',
  conversationalAi: 'problemDomain',
  supplyChainAgents: 'problemDomain',
  contractIntelligence: 'problemDomain',

  bestCaseFit: 'problemDomain',
  whichCaseProvesBest: 'problemDomain',
  threeMinuteCase: 'problemDomain',
  systemsThinkingCase: 'problemDomain',
  enterpriseAiCase: 'problemDomain',

  roleFit: 'trajectory',
  enterpriseAiRoleFit: 'trajectory',
  conversationalAiRoleFit: 'trajectory',
  differentFromTraditionalUx: 'trajectory',

  collaborationPmEng: 'methodLogic',
  toolWorkflow: 'methodLogic',

  fallback: 'beliefStance',
});

/** @type {Record<string, string>} */
export const GUIDE_FLOW_ALIASES = {
  unclearBrief: 'ambiguityToStructure',
  aiProblems: 'aiProblemDomain',
  roleFit: 'designerTrajectory',
};

/**
 * @param {string} flowId
 * @returns {GuideDecisionAreaId}
 */
/** @type {Record<string, GuideDecisionAreaId>} */
export const LEGACY_DECISION_AREA = {
  roleFit: 'trajectory',
  caseEvidence: 'problemDomain',
  workingLogic: 'methodLogic',
  aiProblemSpace: 'problemDomain',
};

/**
 * @param {string} flowId
 * @param {string} [decisionAreaOnFlow]
 * @returns {GuideDecisionAreaId}
 */
export function resolveDecisionArea(flowId, decisionAreaOnFlow) {
  if (decisionAreaOnFlow && GUIDE_DECISION_AREAS[decisionAreaOnFlow]) {
    return decisionAreaOnFlow;
  }
  if (decisionAreaOnFlow && LEGACY_DECISION_AREA[decisionAreaOnFlow]) {
    return LEGACY_DECISION_AREA[decisionAreaOnFlow];
  }
  return getFlowDecisionArea(flowId);
}

export function getFlowDecisionArea(flowId) {
  const resolved = GUIDE_FLOW_ALIASES[flowId] ?? flowId;
  return FLOW_DECISION_AREA[resolved] ?? FLOW_DECISION_AREA[flowId] ?? 'beliefStance';
}
