/**
 * Portfolio Shortcut — discovery layer copy, angles, proof points, structured results.
 */

/** @typedef {{ type: 'section' | 'case', id: string }} ShortcutAction */

/** @typedef {{
 *   id: string,
 *   title: string,
 *   subtitle: string,
 *   shortAnswer: string,
 *   proofPoints: { label: string, signal: string, action: ShortcutAction }[],
 *   continueRoutes: { label: string, action: ShortcutAction }[],
 * }} ShortcutAngleResult
 */

export const SHORTCUT_KEY_ANGLES = [
  {
    id: 'ambiguity-structure',
    title: 'Ambiguity → Structure',
    subtitle: 'Starts before the interface.',
  },
  {
    id: 'ai-usable-work',
    title: 'AI → Usable Work',
    subtitle: 'Turns capability into workflow.',
  },
  {
    id: 'design-role-expansion',
    title: 'Design Role Expansion',
    subtitle: 'Shapes operating conditions.',
  },
  {
    id: 'human-belonging',
    title: 'Human Belonging',
    subtitle: 'Defines where people still belong.',
  },
];

/** @type {Record<string, ShortcutAngleResult>} */
export const SHORTCUT_ANGLE_RESULTS = {
  'ambiguity-structure': {
    id: 'ambiguity-structure',
    title: 'Ambiguity → Structure',
    subtitle: 'Starts before the interface.',
    shortAnswer:
      'I start before the interface by framing task logic, workflow conditions, handoff, and completion before deciding what the UI should be.',
    proofPoints: [
      {
        label: 'Conversational AI',
        signal: 'Routing and recovery before response polish',
        action: { type: 'case', id: 'case01' },
      },
      {
        label: 'Contract Intelligence',
        signal: 'Turning review ambiguity into traceable decision states',
        action: { type: 'case', id: 'case02' },
      },
      {
        label: 'Supply Chain Agents',
        signal: 'Defining control gates before automation scales',
        action: { type: 'case', id: 'case03' },
      },
    ],
    continueRoutes: [
      { label: 'Method', action: { type: 'section', id: 'home-capabilities' } },
      { label: 'Proof', action: { type: 'section', id: 'home-work-narrative' } },
      { label: 'POV', action: { type: 'section', id: 'home-approach' } },
    ],
  },
  'ai-usable-work': {
    id: 'ai-usable-work',
    title: 'AI → Usable Work',
    subtitle: 'Turns capability into workflow.',
    shortAnswer:
      'I design the layer where AI output becomes usable work: decisions, handoffs, escalation, continuity, and completion.',
    proofPoints: [
      {
        label: 'Conversational AI',
        signal: 'Post-response workflow',
        action: { type: 'case', id: 'case01' },
      },
      {
        label: 'Contract Intelligence',
        signal: 'Decision traceability',
        action: { type: 'case', id: 'case02' },
      },
      {
        label: 'Supply Chain Agents',
        signal: 'Agent control and intervention gates',
        action: { type: 'case', id: 'case03' },
      },
      {
        label: 'AI Companion',
        signal: 'Continuity beyond interaction',
        action: { type: 'case', id: 'case04' },
      },
    ],
    continueRoutes: [
      { label: 'Proof', action: { type: 'section', id: 'home-work-narrative' } },
      { label: 'Method', action: { type: 'section', id: 'home-capabilities' } },
      { label: 'Boundary', action: { type: 'section', id: 'home-approach' } },
    ],
  },
  'design-role-expansion': {
    id: 'design-role-expansion',
    title: 'Design Role Expansion',
    subtitle: 'Shapes operating conditions.',
    shortAnswer:
      'In AI systems, design expands from shaping interfaces to shaping the operating conditions under which AI, humans, and workflows can work together.',
    proofPoints: [
      {
        label: 'Capabilities',
        signal: 'AI operating layers',
        action: { type: 'section', id: 'home-capabilities' },
      },
      {
        label: 'Supply Chain Agents',
        signal: 'Human-in-the-loop control',
        action: { type: 'case', id: 'case03' },
      },
      {
        label: 'Contract Intelligence',
        signal: 'Review ownership and traceability',
        action: { type: 'case', id: 'case02' },
      },
    ],
    continueRoutes: [
      { label: 'Role Fit', action: { type: 'section', id: 'home-capabilities' } },
      { label: 'Method', action: { type: 'section', id: 'home-capabilities' } },
      { label: 'POV', action: { type: 'section', id: 'home-approach' } },
    ],
  },
  'human-belonging': {
    id: 'human-belonging',
    title: 'Human Belonging',
    subtitle: 'Defines where people still belong.',
    shortAnswer:
      'AI expands what systems can do. Design defines where people still belong: in judgment, accountability, intervention, and meaning.',
    proofPoints: [
      {
        label: 'Point of View',
        signal: 'Completion and responsibility',
        action: { type: 'section', id: 'home-approach' },
      },
      {
        label: 'Supply Chain Agents',
        signal: 'Human checkpoints',
        action: { type: 'case', id: 'case03' },
      },
      {
        label: 'Contract Intelligence',
        signal: 'Human confirmation and review ownership',
        action: { type: 'case', id: 'case02' },
      },
      {
        label: 'Conversational AI',
        signal: 'Escalation and handoff',
        action: { type: 'case', id: 'case01' },
      },
    ],
    continueRoutes: [
      { label: 'POV', action: { type: 'section', id: 'home-approach' } },
      { label: 'Boundary', action: { type: 'section', id: 'home-approach' } },
      { label: 'Proof', action: { type: 'section', id: 'home-work-narrative' } },
    ],
  },
};

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

/**
 * @param {string} angleId
 * @returns {ShortcutAngleResult | null}
 */
export function getShortcutAngleResult(angleId) {
  return SHORTCUT_ANGLE_RESULTS[angleId] ?? null;
}
