/**
 * Life Archive — AI-assisted pattern reading (5 clusters, curated field set).
 */

/** 12 representative photos for State 1 overlapping field */
export const LIFE_PATTERN_FIELD_IDS = [
  'life_01',
  'life_03',
  'life_04',
  'life_07',
  'life_09',
  'life_13',
  'life_16',
  'life_21',
  'life_27',
  'life_35',
  'life_42',
  'life_47',
];

/** Overlap layout: offset % and slight rotation per card index */
export const LIFE_PATTERN_FIELD_LAYOUT = [
  { x: 0, y: 0, rotate: -2.2, z: 1 },
  { x: 7.5, y: -1.2, rotate: 1.4, z: 2 },
  { x: 15, y: 0.8, rotate: -1.1, z: 3 },
  { x: 22.5, y: -0.6, rotate: 2, z: 4 },
  { x: 30, y: 1, rotate: -1.6, z: 5 },
  { x: 37.5, y: -0.4, rotate: 0.8, z: 6 },
  { x: 45, y: 0.6, rotate: -2.4, z: 7 },
  { x: 52.5, y: -0.8, rotate: 1.2, z: 8 },
  { x: 60, y: 0.4, rotate: -0.9, z: 9 },
  { x: 67.5, y: -0.2, rotate: 1.8, z: 10 },
  { x: 75, y: 0.5, rotate: -1.3, z: 11 },
  { x: 82.5, y: 0, rotate: 2.1, z: 12 },
];

export const LIFE_PATTERN_COPY = {
  title: '50 images from the past year',
  subtitle: 'A visual archive of what kept catching Hedi’s attention.',
  aiPrompt: 'These aren’t grouped yet. Want to see what they reveal?',
  cta: 'Read this as a pattern',
  clusterIntro:
    'These images are grouped by what keeps returning — not by date or place.',
  backToField: 'Back to the field',
  panelSections: {
    pattern: 'Pattern',
    returning: 'What keeps returning',
    suggests: 'What this suggests about Hedi',
    matters: 'Why this matters for her work',
    followUpLabel: 'Go deeper',
  },
};

export const LIFE_PATTERN_CLUSTERS = [
  {
    id: 'thresholds_transitions',
    label: 'Thresholds / Transitions',
    shortLabel: 'Thresholds',
    photos: ['life_01', 'life_09', 'life_27', 'life_41', 'life_47', 'life_36'],
    pattern:
      'Edges, passages, and in-between states — where one condition gives way to another.',
    whatKeepsReturning:
      'Doorways without people, volcanic rims, color shifts at boundaries, and architecture that reads as a threshold rather than a destination. The attention lands where something is about to change scale, material, or atmosphere.',
    whatThisSuggests:
      'Hedi notices systems at the moment of handoff: when context is still readable but no longer stable. That habit shows up as comfort with ambiguity, interface states, and product moments between modes.',
    whyItMatters:
      'Product and service design are full of thresholds — onboarding, approval, escalation, empty-to-loaded. This pattern is practice in seeing where users cross without forcing the crossing to feel abrupt.',
    followUps: [
      {
        id: 'threshold_product',
        label: 'Where does this show up in product flows?',
        response:
          'In flows, you tend to design the “almost there” states carefully: first value, first risk, first human review. The archive suggests you treat transitions as designed objects, not leftover screens.',
      },
      {
        id: 'threshold_ai',
        label: 'How does this relate to AI handoffs?',
        response:
          'AI adds invisible thresholds — model confidence, tool invocation, human override. Your eye for edges maps to designing when automation should feel provisional, legible, and reversible.',
      },
      {
        id: 'threshold_team',
        label: 'What should a team learn from this?',
        response:
          'Teams can borrow your framing: name the threshold, design the crossing, measure drop-off at the edge — not only at the destination.',
      },
    ],
  },
  {
    id: 'human_traces',
    label: 'Human Traces',
    shortLabel: 'Human traces',
    photos: ['life_02', 'life_14', 'life_16', 'life_28', 'life_29', 'life_30', 'life_13'],
    pattern:
      'Evidence of people without always showing the whole person — gesture, work, gathering, mark.',
    whatKeepsReturning:
      'Hands on screens, presentation rooms, collaborative tables, and street interventions that imply a body just left or is about to arrive. People are present as trace, not portrait.',
    whatThisSuggests:
      'Hedi reads social and professional systems through residue: what a scene implies about roles, intent, and coordination. The archive favors observation over performance.',
    whyItMatters:
      'Enterprise and AI products are judged in situ — in meetings, handoffs, and shared surfaces. Designing for trace means designing for how work actually leaves evidence.',
    followUps: [
      {
        id: 'trace_stakeholder',
        label: 'How does this inform stakeholder alignment?',
        response:
          'You design artifacts that hold alignment without requiring everyone in the room — traces that survive email, time zones, and partial attention.',
      },
      {
        id: 'trace_research',
        label: 'Does this change how research should be framed?',
        response:
          'It suggests contextual inquiry over staged tests: watch what people leave behind in real workflows, not only what they say in interviews.',
      },
    ],
  },
  {
    id: 'quiet_systems',
    label: 'Quiet Systems',
    shortLabel: 'Quiet systems',
    photos: ['life_21', 'life_24', 'life_25', 'life_32', 'life_37', 'life_38', 'life_43', 'life_49'],
    pattern:
      'Order, repetition, and infrastructure read calmly — grids, facades, and rooms that behave like systems.',
    whatKeepsReturning:
      'Facades with rhythm, office massing, exhibition layouts, and urban blocks that feel legible before they feel expressive. The signal is structure you can trust.',
    whatThisSuggests:
      'Hedi is drawn to environments where rules are visible — where design is already doing organizational work. That aligns with product systems thinking and IA discipline.',
    whyItMatters:
      'Complex products need quiet scaffolding: navigation, density, and state that do not compete with the task. This pattern is appetite for clarity under load.',
    followUps: [
      {
        id: 'quiet_ia',
        label: 'How should this shape information architecture?',
        response:
          'Favor hierarchies that read at a glance, progressive disclosure that respects rhythm, and components that repeat predictably so cognitive load stays low.',
      },
      {
        id: 'quiet_ops',
        label: 'What does this mean for operations-heavy tools?',
        response:
          'Operations tools should feel infrastructural — dashboards and queues that calm rather than alarm, unless alarm is the designed exception.',
      },
      {
        id: 'quiet_brand',
        label: 'Is there a brand or tone implication?',
        response:
          'Yes: restrained typography, consistent spacing, and color used as signal not decoration — the same discipline visible in these photographs.',
      },
    ],
  },
  {
    id: 'movement_flow',
    label: 'Movement / Flow',
    shortLabel: 'Movement',
    photos: ['life_03', 'life_11', 'life_17', 'life_22', 'life_35', 'life_40', 'life_12'],
    pattern:
      'Direction, circulation, and sequences — exhibitions, animals in motion, routes through space.',
    whatKeepsReturning:
      'Curves that lead the eye, birds and deer as vectors, museum paths, and scenes where the photograph itself feels mid-sequence. Still images carry motion.',
    whatThisSuggests:
      'Hedi tracks how attention moves through a scene — useful for journeys, service blueprints, and multi-step AI workflows where sequence matters more than single screens.',
    whyItMatters:
      'Products are experienced in time. This pattern supports narrative design, animation restraint, and knowing where to place decision points along a path.',
    followUps: [
      {
        id: 'flow_journey',
        label: 'How does this apply to journey design?',
        response:
          'Map the flow first, then the screens: your archive habit is to see the connective tissue before the UI chrome.',
      },
      {
        id: 'flow_ai',
        label: 'What about multi-agent or chained AI tasks?',
        response:
          'Chain visibility — what step is running, what just finished, what needs human input — mirrors how you read movement in still images.',
      },
    ],
  },
  {
    id: 'presence_material',
    label: 'Presence / Material',
    shortLabel: 'Presence',
    photos: ['life_04', 'life_07', 'life_08', 'life_10', 'life_15', 'life_18', 'life_20', 'life_23', 'life_31', 'life_48'],
    pattern:
      'Texture, ritual, small objects, and beings that anchor attention in the physical world.',
    whatKeepsReturning:
      'Food as ritual, fur and ceramic surfaces, drawn characters, snow figures, and marine forms. The archive grounds abstraction in material presence.',
    whatThisSuggests:
      'Hedi balances systems work with sensory anchoring — remembering that products are still touched, eaten, carried, and cared for. That keeps enterprise work humane.',
    whyItMatters:
      'AI and workflow tools risk feeling disembodied. This pattern is the counterweight: design that respects material consequence and bodily rhythm.',
    followUps: [
      {
        id: 'presence_craft',
        label: 'How does material awareness improve UI craft?',
        response:
          'It shows up as weight, friction, and finish — buttons that feel placed, not floating; feedback that respects timing like a ritual step.',
      },
      {
        id: 'presence_trust',
        label: 'Does this connect to trust in AI systems?',
        response:
          'Trust is often material: provenance, source, who touched the data. Your attention to presence maps to making AI outputs feel situated, not hallucinated in a void.',
      },
    ],
  },
];

export const LIFE_PATTERN_CLUSTER_ORDER = LIFE_PATTERN_CLUSTERS.map((c) => c.id);

export function getPatternCluster(id) {
  return LIFE_PATTERN_CLUSTERS.find((c) => c.id === id) ?? null;
}
