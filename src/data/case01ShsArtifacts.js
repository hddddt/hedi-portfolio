/**
 * SHS UX strategy board — artifact evidence for Decision 01.
 * Assets: src/assets/case01/shs/
 */

import boardFull from '../assets/case01/shs/ux-strategy-board-full.png';
import cropJourney from '../assets/case01/shs/crop-02-service-journey.png';
import cropCombined from '../assets/case01/shs/crop-02-03-combined.png';
import stakeholderOverlap from '../assets/case01/shs/stakeholder-overlap.png';
import personaMap from '../assets/case01/shs/persona-map.png';
import personaJourneyMatrix from '../assets/case01/shs/persona-journey-trigger-matrix.png';
import cognigyShipmentFlow from '../assets/case01/cognigy-shipment-support-flow.png';
import aiRecommendationRouting from '../assets/case01/ai-recommendation-routing.png';
import domainHandbookExamples from '../assets/case01/domain-handbook-examples.png';
import conversationalDashboardHome from '../assets/case01/conversational-dashboard-home.png';

/** Zoom into left-column JTBD / persona on the journey crop (crop 01). */
const CROP_01_FOCUS = { scale: 2.55, x: 34, y: 4 };
/** Bottom half of combined board slide (crop 03). */
const CROP_03_FOCUS = { scale: 2, x: 0, y: 52 };

export const DECISION_01_UX_ARTIFACT = {
  title: 'UX Strategy artifact',
  intro:
    'To define the POC scope, I mapped stakeholder needs, service entry points, response patterns, and the current chatbot demo before moving into detailed conversational flows.',
  boardSrc: boardFull,
  overview: {
    alt: 'SHS Customer Service AI UX strategy board — service journey and response patterns',
    caption: 'Full UX strategy board used to frame the SHS Customer Service AI concept.',
  },
  crops: [
    {
      id: 'stakeholders',
      title: 'Stakeholder needs before chatbot behavior',
      caption:
        'Different roles carried different jobs-to-be-done, which made a generic chatbot flow too narrow as a starting point.',
      src: cropJourney,
      dedicated: true,
      focus: CROP_01_FOCUS,
      alt: 'Different stakeholders and jobs-to-be-done on the customer service AI strategy board',
    },
    {
      id: 'journey',
      title: 'Service journey and AI entry points',
      caption:
        'AI support moments were mapped across the service journey before conversation patterns were refined.',
      src: cropJourney,
      dedicated: true,
      alt: 'Scaling UX journey, multi-agent entry points, response use cases, and ticket system',
    },
    {
      id: 'poc-patterns',
      title: 'From Q&A POC to response pattern exploration',
      caption:
        'The existing demo showed a basic Q&A pattern, while the strategy work explored follow-up, citation, suggestion, and escalation patterns.',
      src: cropCombined,
      dedicated: true,
      focus: CROP_03_FOCUS,
      alt: 'Current POC and response pattern exploration — ask, answer, follow-up, citations, suggestions',
    },
  ],
  inset: {
    title: 'Stakeholder overlap model',
    caption:
      'The early framing separated stakeholder roles and identified shared system needs before moving into chatbot behavior.',
    src: stakeholderOverlap,
    dedicated: true,
    alt: 'Stakeholder overlap model — aligned around a shared system',
  },
  panels: [
    {
      id: 'conversational-dashboard-home',
      title: 'Defined service dashboard',
      src: conversationalDashboardHome,
      alt: 'Conversational AI home with user role context, task shortcuts, recent chats, and chat entry',
      caption:
        'Conversation is the entry point, not the whole product—role, location, and task shortcuts (tickets, daily check, OEM process) frame support work before the user asks.',
    },
  ],
};

/** Knowledge-base framing for Decision 01 — Enterprise Knowledge Routing tab. */
export const DECISION_01_KNOWLEDGE_ARTIFACT = {
  panels: [
    {
      id: 'persona-map',
      title: 'Persona model',
      src: personaMap,
      alt: 'Compliance expert, control specialist, and general user personas with goals, pain points, and interpretive vs. procedural vs. guided modes',
      caption:
        'Expert and general users need different answer modes—interpretive depth, procedural guidance, or quick reassurance—before a single chatbot can route safely.',
    },
    {
      id: 'persona-journey-matrix',
      title: 'Persona & journey trigger matrix',
      src: personaJourneyMatrix,
      alt: 'Matrix mapping compliance officer, specialist, and general employee personas to case-driven, task-driven, and reference-driven mindsets',
      caption:
        'One entry point must unify three mindsets—case-driven interpretation, task completion, and quick reference—across roles before answers are generated.',
    },
    {
      id: 'ai-recommendation-routing',
      title: 'AI recommendation routing',
      src: aiRecommendationRouting,
      alt: 'AI recommendation screen routing a user question to the Legal Handbook with detected topic and keywords',
      caption:
        'From natural-language description to routed handbook: detected topic and keyword signals stay visible before the user enters a domain.',
    },
    {
      id: 'domain-handbook-examples',
      title: 'Domain handbook examples',
      src: domainHandbookExamples,
      alt: 'Legal, Compliance, and ICP Export Control handbook cards with example questions by domain',
      caption:
        'Knowledge domains stay separated at entry—Legal, Compliance, and export-control contexts do not collapse into one generic chatbot.',
    },
  ],
};

/** Cognigy support-flow architecture for Decision 02. */
export const DECISION_02_FLOW_ARTIFACT = {
  panels: [
    {
      id: 'cognigy-shipment-flow',
      title: 'Cognigy Flow — Shipment Support Agent',
      src: cognigyShipmentFlow,
      alt: 'Cognigy flow diagram for shipment support — entry, validation, lookup, recovery loops, escalation, and handoff context package',
      caption:
        'Transactional support as a testable flow: intent and entity capture, validation before lookup, repair loops, escalation when automation stops, and handoff with full context—not a happy-path demo.',
    },
  ],
};
