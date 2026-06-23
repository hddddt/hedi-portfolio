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
  tagline: 'Choose what you want to verify — or ask about Hedi\u2019s work.',
  freeInputPlaceholder: 'e.g. How does she handle complex requirements?',
  submitLabel: 'Ask',
  askHelper: 'Ask about AI workflow, role fit, human control, traceability, or complex requirements.',
};

export const SHORTCUT_SECTIONS = {
  guidedRoutes: 'Guided routes',
  askAboutWork: 'Ask about the work',
  directCases: 'Direct cases',
  openEvidence: 'Evidence to open',
  continueWith: 'Continue',
  allRoutes: 'All routes',
  bestMatchingRoute: 'Best matching route',
  relevantEvidence: 'Evidence to open',
  matchReason: 'Best answer',
  keyAngles: 'Guided routes',
  proofPoints: 'Direct cases',
  search: 'Ask about the work',
  shortAnswer: 'Best answer',
  whyHediFits: 'Why Hedi fits',
  relatedProof: 'Evidence to open',
  continueWithLegacy: 'Continue with',
};

export {
  SHORTCUT_ASK_CHIPS,
  SHORTCUT_DIRECT_CASES,
  SHORTCUT_KEY_ANGLES,
  SHORTCUT_ROUTES,
  SHORTCUT_PROOF_POINTS,
  SHORTCUT_ROUTE_PANELS,
  SHORTCUT_ANGLE_RESULTS,
  getShortcutRoute,
  getShortcutRoutePanel,
  getShortcutAngleResult,
  matchShortcutRoute,
  SHORTCUT_CHIP_QUERIES,
} from './portfolioShortcutContent.js';

/** @deprecated use SHORTCUT_PROOF_POINTS */
export { SHORTCUT_PROOF_POINTS as SHORTCUT_RECOMMENDED_EVIDENCE } from './portfolioShortcutContent.js';

/** @deprecated use SHORTCUT_ENTRY */
export const GUIDE_ENTRY = SHORTCUT_ENTRY;

export const GUIDE_SYSTEM = {
  purpose:
    'Portfolio evidence routing — role positioning, capabilities, project proof, and answer boundaries. Not open-ended chat.',
  audiences: ['recruiters', 'hiring managers', 'design leads', 'PM / engineering teams', 'AI product teams'],
  answerPrinciples: [
    'One concise best answer first.',
    'Connect to capabilities with 2\u20133 why-Hedi-fits bullets.',
    'Point to 2\u20133 clickable evidence rows from portfolio proof only.',
    'Stay within shown work — no invented metrics or generic AI advice.',
  ],
};

export const GUIDE_RESULT_SECTIONS = {
  youAsked: 'Query',
  takeaway: 'Best answer',
  shortMeaning: 'Best answer',
  focus: 'Focus',
  relatedPaths: 'Evidence to open',
  askFromAngle: 'Refine',
  followUp: 'Answer',
  whyHediFits: 'Why Hedi fits',
  whereToLook: 'Evidence to open',
  matchReason: 'Best answer',
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
