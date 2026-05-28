/**
 * Case 01 — Conversational AI (D1 / D2 / D3 design decisions).
 */

import {
  DECISION_01_UX_ARTIFACT,
  DECISION_01_KNOWLEDGE_ARTIFACT,
  DECISION_02_FLOW_ARTIFACT,
} from './case01ShsArtifacts.js';

export const CASE01_FLOW = [
  {
    id: 'project-inputs',
    title: 'Project Inputs',
    type: 'project-inputs',
    body:
      'This case is built from three related conversational AI contexts. They are not the structure of the case; they are the project inputs used to examine the same service-system problem.',
    projects: [
      {
        tag: 'Customer Service AI Strategy',
        body: 'Multi-stakeholder service vision beyond a single chatbot POC.',
      },
      {
        tag: 'Enterprise Knowledge Routing',
        body:
          'Domain-aware knowledge access across separate knowledge bases, expertise levels, and source boundaries.',
      },
      {
        tag: 'Transactional Support Flow',
        body:
          'Shipment-status support with validation, fallback, escalation, and human handoff logic.',
      },
    ],
  },
  {
    id: 'design-scope',
    title: 'Design Scope',
    type: 'design-scope',
    mainTitle: ['The chat was only the surface.', 'The service system was the real design scope.'],
    bodyParagraphs: [
      'Conversation patterns still mattered: intent definition, response writing, happy paths, fallback copy, and tone refinement.',
      'But they were only one layer of the work.',
    ],
    layersLead: 'This case follows three design decisions:',
    columns: [
      {
        num: 'D1',
        title: 'Service-System Framing',
        text: 'Where should conversational AI create value in the service system?',
      },
      {
        num: 'D2',
        title: 'Flow, Recovery & Handoff Architecture',
        text: 'How should the AI flow continue when uncertainty, failure, or human handoff appears?',
      },
      {
        num: 'D3',
        title: 'Response, Trust & Repair Patterns',
        text: 'How should answers guide users, expose source boundaries, and repair breakdowns?',
      },
    ],
  },
  {
    id: 'project-map',
    type: 'project-map',
    intro:
      'Three separate projects.\nEach surfaces the same structural problem\nfrom a different angle.',
    rows: [
      {
        name: 'Customer Service AI Strategy',
        decisions: ['D1'],
      },
      {
        name: 'Enterprise Knowledge Routing',
        decisions: ['D1', 'D3'],
      },
      {
        name: 'Transactional Support Flow',
        decisions: ['D2', 'D3'],
      },
    ],
  },
  {
    id: 'decision-d1',
    type: 'decision',
    d: 'D1',
    slug: 'd1',
    module: true,
    title: 'Service-System Framing',
    subtitle: 'Define where conversational AI creates value before designing the chat flow.',
    aiProblem:
      'Conversational AI POCs often start from visible chat behavior before the service system is understood.',
    coreMove:
      'I reframed the starting point from chatbot behavior to service-system structure.',
    appliedInCases: [
      {
        caseNum: 1,
        id: 'customer-service-ai',
        label: 'Customer Service AI Strategy',
        question:
          'How should AI support multiple roles and service tasks before becoming a chatbot?',
        grid: {
          challenge:
            'The product vision involved multiple stakeholder groups and service tasks: ticket handling, onboarding, training, knowledge sharing, and stakeholder-specific support.',
          focus:
            'Locate AI entry points across the service journey before defining conversation patterns.',
          role: 'Mapped stakeholder needs, task lines, and AI support opportunities to clarify the POC scope.',
          solution:
            'The work shifted from “build a chatbot demo” to “define the service paths AI should support.”',
        },
        artifacts: [
          { type: 'artifact-inset', label: 'Stakeholder overlap model' },
          { type: 'artifact-journey', label: 'Service journey and AI entry points' },
          {
            type: 'artifact-image',
            artifactId: 'conversational-dashboard-home',
            label: 'Defined service dashboard',
          },
        ],
        outcome:
          'AI value became tied to service moments, not only chatbot interaction.',
      },
      {
        caseNum: 2,
        id: 'enterprise-knowledge',
        label: 'Enterprise Knowledge Routing',
        question:
          'When the target is “all users,” what structure needs to be separated before the AI answers?',
        grid: {
          challenge:
            '“All users” hid different knowledge bases, domains, expertise levels, and source-boundary risks.',
          focus:
            'Separate user context, knowledge domain, and source boundary before generating answers.',
          role: 'Reframed generic knowledge access as a domain-aware routing problem.',
          solution:
            'One entry point should route by intent, domain, user expertise, and source boundary before returning an answer.',
        },
        artifacts: [
          { type: 'artifact-image', artifactId: 'persona-map', label: 'Persona model' },
          {
            type: 'artifact-image',
            artifactId: 'persona-journey-matrix',
            label: 'Persona & journey trigger matrix',
          },
          {
            type: 'artifact-image',
            artifactId: 'ai-recommendation-routing',
            label: 'AI recommendation routing',
          },
          {
            type: 'artifact-image',
            artifactId: 'domain-handbook-examples',
            label: 'Domain handbook entry',
          },
        ],
        outcome:
          'The chatbot direction shifted from “answer everyone” to safer knowledge access across domains and expertise levels.',
      },
    ],
    uxArtifact: DECISION_01_UX_ARTIFACT,
    knowledgeArtifact: DECISION_01_KNOWLEDGE_ARTIFACT,
  },
  {
    id: 'decision-d2',
    type: 'decision',
    d: 'D2',
    slug: 'd2',
    module: true,
    contextReminder: 'D2 draws from Transactional Support Flow',
    title: 'Flow, Recovery & Handoff Architecture',
    subtitle: 'Design how the system continues when the happy path breaks.',
    aiProblem: 'Many conversational AI demos only work when the user gives the expected input.',
    grid: {
      challenge:
        'Real support flows break when the user gives incomplete information, confidence is low, backend data is needed, or automation can no longer resolve the case.',
      focus:
        'Define the states that allow the flow to continue: intent, entity capture, validation, backend lookup, repair loop, escalation, and handoff context.',
      role: 'I designed the flow from a CX perspective: what the user wants to complete, what the system needs to check, and when AI should clarify, act, or hand over.',
      solution:
        'Structured the support flow as: intent → entity capture → validation → backend / knowledge lookup → response → repair loop → escalation → handoff with context.',
    },
    appliedIn: [
      {
        project: 'Transactional Support Flow',
        text: 'Shipment-status support designed with validation, fallback, escalation, and human handoff logic.',
      },
    ],
    artifacts: [
      {
        type: 'artifact-image',
        artifactId: 'cognigy-shipment-flow',
        label: 'Cognigy Flow — Shipment Support Agent',
      },
    ],
    flowArtifact: DECISION_02_FLOW_ARTIFACT,
    implementationNote:
      'Cognigy was the prototyping environment; the design value was the support-flow architecture.',
    outcome:
      'The prototype became a testable support-flow architecture, not just a conversational demo.',
  },
  {
    id: 'decision-d3',
    type: 'decision',
    d: 'D3',
    slug: 'd3',
    module: true,
    contextReminder: 'D3 draws from Enterprise Knowledge Routing · Transactional Support Flow',
    title: 'Response, Trust & Repair Patterns',
    subtitle: 'Turn responses into guidance, source visibility, and repair mechanisms.',
    aiProblem:
      'A response can sound clear and still fail if the user cannot verify it, recover from it, or understand what happens next.',
    grid: {
      challenge:
        'Knowledge answers needed source boundaries. Invalid input needed recoverable clarification. Voice interactions needed confirmation and repair. Escalation needed to feel efficient instead of making users start over.',
      focus: 'Define response patterns by situation, not by tone alone.',
      role: 'I translated flow states into response patterns for source-aware answers, clarification, confirmation, and escalation handoff.',
      solution: 'Created three pattern types: source-aware answer, recoverable clarification, efficient escalation.',
    },
    appliedIn: [
      {
        project: 'Enterprise Knowledge Routing',
        text: 'Source-aware answers and citation boundaries.',
      },
      {
        project: 'Transactional Support Flow',
        text: 'Clarification, voice repair, and escalation handoff messages.',
      },
    ],
    artifacts: [
      {
        type: 'diagram',
        diagram: 'source-pattern',
        label: 'Source-aware answer anatomy',
      },
      {
        type: 'diagram',
        diagram: 'recovery-compare',
        label: 'Recoverable clarification pattern',
      },
      {
        type: 'diagram',
        diagram: 'escalation-pattern',
        label: 'Escalation handoff copy pattern',
      },
    ],
    outcome:
      'The response layer became part of the service flow: it helped users verify, recover, and continue instead of only reading an AI answer.',
  },
];
