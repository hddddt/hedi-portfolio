/**
 * Portfolio Shortcut — intent-to-evidence routing (not chat / FAQ / sitemap).
 */

/** @typedef {{ type: 'section' | 'case' | 'capability', id: string }} ShortcutAction */

/** @typedef {{
 *   label: string,
 *   relevance: string,
 *   action: ShortcutAction,
 * }} ShortcutSecondaryLink
 */

/** @typedef {{
 *   label: string,
 *   helper: string,
 *   destinationLabel: string,
 *   action: ShortcutAction,
 * }} ShortcutPrimaryAction
 */

/** @typedef {'framing' | 'operationalization' | 'scope' | 'relationship'} ShortcutPanelVisualKind
 */

/** @typedef {{
 *   id: string,
 *   title: string,
 *   eyebrow: string,
 *   oneLiner: string,
 *   question: string,
 *   intent: string,
 * }} ShortcutRoute
 */

/** @typedef {{
 *   routeId: string,
 *   panelType: string,
 *   meaning: string,
 *   visual: ShortcutPanelVisualKind,
 *   primary: ShortcutPrimaryAction,
 *   secondary: ShortcutSecondaryLink[],
 *   tertiaryChip?: ShortcutSecondaryLink | null,
 * }} ShortcutRoutePanel
 */

export const SHORTCUT_ROUTES = [
  {
    id: 'ambiguity-structure',
    title: 'Ambiguity → Structure',
    eyebrow: 'How she starts',
    oneLiner: 'Frames unclear AI needs before the interface.',
    question: 'How does she move from ambiguity to structure?',
    intent: 'method / framing-first',
  },
  {
    id: 'ai-usable-work',
    title: 'AI → Usable Work',
    eyebrow: 'What she designs',
    oneLiner: 'Turns AI capability into usable product work.',
    question: 'What AI work does she actually do?',
    intent: 'AI work / operationalization-first',
  },
  {
    id: 'design-role-expansion',
    title: 'Design Role Expansion',
    eyebrow: 'Where design expands',
    oneLiner: 'Shapes operating conditions beyond screens.',
    question: 'How is design expanding in the AI era?',
    intent: 'role scope / positioning-first',
  },
  {
    id: 'human-ai-relationship',
    title: 'Human-AI Relationship',
    eyebrow: 'How people stay involved',
    oneLiner: 'Defines how people stay informed, involved, and able to act with AI.',
    question: 'What is the relationship between people and AI in her work?',
    intent: 'human-AI relation / POV-first',
  },
];

/** @deprecated alias — use SHORTCUT_ROUTES */
export const SHORTCUT_KEY_ANGLES = SHORTCUT_ROUTES;

/** @type {Record<string, ShortcutRoutePanel>} */
export const SHORTCUT_ROUTE_PANELS = {
  'ambiguity-structure': {
    routeId: 'ambiguity-structure',
    panelType: 'Framing Panel',
    meaning:
      'Turns unclear AI needs into task logic, workflow gaps, and completion criteria before the interface.',
    visual: 'convergence',
    primary: {
      label: 'View AI Problem Framing',
      helper: 'See how unclear AI briefs become role definition, workflow gaps, and success criteria.',
      destinationLabel: 'Capabilities · AI Problem Framing',
      action: { type: 'capability', id: 'ai-problem-framing' },
    },
    secondary: [
      {
        label: 'Conversational AI',
        relevance: 'Ambiguity in unresolved conversations',
        action: { type: 'case', id: 'case01' },
      },
      {
        label: 'Contract Intelligence',
        relevance: 'Ambiguity in AI-assisted review decisions',
        action: { type: 'case', id: 'case02' },
      },
    ],
  },
  'ai-usable-work': {
    routeId: 'ai-usable-work',
    panelType: 'Operationalization Panel',
    meaning:
      'Turns AI capability into usable product work: role, workflow fit, system states, boundaries, and completion paths.',
    visual: 'operationalization',
    primary: {
      label: 'See AI work examples',
      helper: 'How different AI capabilities become workflow, review, control, and continuity.',
      destinationLabel: 'Work section start / Work overview',
      action: { type: 'section', id: 'home-work-narrative' },
    },
    secondary: [
      {
        label: 'Conversational AI',
        relevance: 'Conversation capability becomes routing, recovery, continuation, and handoff',
        action: { type: 'case', id: 'case01' },
      },
      {
        label: 'Contract Intelligence',
        relevance: 'AI analysis becomes reviewable, traceable work',
        action: { type: 'case', id: 'case02' },
      },
    ],
    tertiaryChip: {
      label: 'Supply Chain Agents',
      relevance: 'Automation becomes controlled enterprise execution',
      action: { type: 'case', id: 'case03' },
    },
  },
  'design-role-expansion': {
    routeId: 'design-role-expansion',
    panelType: 'Scope Panel',
    meaning:
      'Design moves beyond screens into the operating conditions where AI, people, workflows, control, and responsibility meet.',
    visual: 'scope',
    primary: {
      label: 'Explore operating layers',
      helper: 'See the capability layers behind AI product and workflow design.',
      destinationLabel: 'Capabilities section',
      action: { type: 'section', id: 'home-capabilities' },
    },
    secondary: [
      {
        label: 'Supply Chain Agents',
        relevance: 'Design at the level of checkpoints and execution boundaries',
        action: { type: 'case', id: 'case03' },
      },
      {
        label: 'Point of View',
        relevance: 'Why AI design moves beyond interface into responsibility and completion',
        action: { type: 'section', id: 'home-approach' },
      },
    ],
  },
  'human-ai-relationship': {
    routeId: 'human-ai-relationship',
    panelType: 'Relationship Panel',
    meaning: 'Defines how people stay informed, involved, responsible, and able to act with AI.',
    visual: 'relationship',
    primary: {
      label: 'Read the human-AI stance',
      helper: 'How her POV defines the relationship between AI capability and human agency.',
      destinationLabel: 'Point of View section',
      action: { type: 'section', id: 'home-approach' },
    },
    secondary: [
      {
        label: 'AI Companion',
        relevance: 'Continuity and presence in repeated human-AI interaction',
        action: { type: 'case', id: 'case04' },
      },
      {
        label: 'Supply Chain Agents',
        relevance: 'People stay involved through checkpoints, escalation, and control',
        action: { type: 'case', id: 'case03' },
      },
    ],
  },
};

/**
 * @param {string} routeId
 * @returns {ShortcutRoute | null}
 */
export function getShortcutRoute(routeId) {
  return SHORTCUT_ROUTES.find((r) => r.id === routeId) ?? null;
}

/**
 * @param {string} routeId
 * @returns {ShortcutRoutePanel | null}
 */
export function getShortcutRoutePanel(routeId) {
  return SHORTCUT_ROUTE_PANELS[routeId] ?? null;
}

/** @deprecated */
export const SHORTCUT_ANGLE_RESULTS = SHORTCUT_ROUTE_PANELS;

/** @deprecated */
export function getShortcutAngleResult(routeId) {
  return getShortcutRoutePanel(routeId);
}

/** Legacy — kept for optional direct evidence jumps from search flows */
export const SHORTCUT_PROOF_POINTS = [
  {
    id: 'case01',
    num: '01',
    title: 'Conversational AI',
    signal: 'Routing · recovery · post-response workflow',
    action: { type: 'case', id: 'case01' },
  },
  {
    id: 'case02',
    num: '02',
    title: 'Contract Intelligence',
    signal: 'Traceability · review ownership · source evidence',
    action: { type: 'case', id: 'case02' },
  },
  {
    id: 'case03',
    num: '03',
    title: 'Supply Chain Agents',
    signal: 'Agent control · intervention gates · orchestration',
    action: { type: 'case', id: 'case03' },
  },
  {
    id: 'case04',
    num: '04',
    title: 'AI Companion',
    signal: 'Continuity · return behavior · presence layer',
    action: { type: 'case', id: 'case04' },
  },
];
