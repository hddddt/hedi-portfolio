const CASE_01_SCOPE = [];

export const WORK_CASE_IMAGES = {
  case01: {
    scope: CASE_01_SCOPE,
    decisions: {
      d1: [
        {
          id: 'case01-d1-primary',
          src: '/images/case1/Case1-02.jpg',
          label: 'Ecosystem and service-stage framing',
          caption:
            'Service-system framing came before conversation design: personas, ecosystem stages, and service moments defined where AI should enter the workflow.',
          variant: 'heroImage',
        },
        {
          id: 'case01-d1-supporting-pair-primary',
          label: 'D1 supporting evidence',
          caption:
            'Stakeholder mapping and target-group segmentation clarified who the AI system needed to support and under which knowledge boundaries.',
          variant: 'horizontalPair',
          maxHeight: 300,
          items: [
            { src: '/images/case1/case1-01.jpg', label: 'Project 1 stakeholder map' },
            { src: '/images/case1/Case1-04.jpg', label: 'Project 2 target-group segmentation' },
          ],
        },
        {
          id: 'case01-d1-supporting-pair-secondary',
          label: 'D1 implementation direction',
          caption:
            'Opportunity mapping and phase planning turned the service framing into an implementation direction.',
          variant: 'horizontalPair',
          maxHeight: 240,
          items: [
            { src: '/images/case1/Case1-05.jpg', label: 'Map opportunities' },
            { src: '/images/case1/Case1-06.jpg', label: 'Phase plan' },
          ],
        },
      ],
      d1Bridge: [
        {
          id: 'case01-d1-d2-bridge',
          src: '/images/case1/Case1-03.jpg',
          label: 'From chat surface to operational service surface',
          caption:
            'The gap was not solved by chat alone. The system direction expanded toward a dashboard / operational surface where service work could continue.',
          variant: 'containCard',
          maxHeight: 420,
        },
      ],
      d2: [
        {
          id: 'case01-d2-primary',
          src: '/images/case1/Case1-09.jpg',
          label: 'Cognigy recovery and handoff flow',
          caption:
            'The Cognigy flow defines how the conversation continues through intent capture, validation, fallback, escalation, and handoff instead of stopping at an AI answer.',
          variant: 'heroImage',
        },
      ],
      d3: [
        {
          id: 'case01-d3-primary',
          src: '/images/case1/Case1-13.jpg',
          label: 'Source-aware knowledge response',
          caption:
            'The knowledgebase result shows how answers expose source boundaries and handbook references, turning the response into a verifiable continuation point rather than a standalone AI answer.',
          variant: 'heroImage',
          maxHeight: 420,
        },
        {
          id: 'case01-d3-supporting-pair',
          label: 'Source-aware response and guidance patterns',
          caption:
            'Response design became part of the service flow: answers needed to expose boundaries, guide next steps, and help users continue.',
          variant: 'horizontalPair',
          maxHeight: 420,
          items: [
            { src: '/images/case1/Case1-07.jpg', label: 'Design outcome detail' },
            { src: '/images/case1/Case1-08.jpg', label: 'Response pattern detail' },
          ],
        },
        {
          id: 'case01-d3-supporting-strip',
          label: 'Response-level repair patterns',
          caption:
            'Response-level repair patterns: the conversational layer guides users through status checks, rescheduling, clarification, and escalation.',
          variant: 'horizontalTriptych',
          maxHeight: 220,
          items: [
            { src: '/images/case1/Case1-10.jpg', label: 'DHL conversational repair screen A' },
            { src: '/images/case1/Case1-11.jpg', label: 'DHL conversational repair screen B' },
            { src: '/images/case1/Case1-12.jpg', label: 'DHL conversational repair screen C' },
          ],
        },
      ],
    },
  },
  case02: {
    decisions: {
      d1: [
        {
          id: 'case02-d1-primary',
          src: '/images/case2/Case2-05.jpg',
          label: 'D1 primary evidence',
          caption:
            'The review starts from contract context, topic structure, and risk overview — not from an isolated AI answer.',
          variant: 'topCrop',
          maxHeight: 520,
          objectPosition: 'top center',
        },
        {
          id: 'case02-d1-supporting',
          src: '/images/case2/Case2-04.jpg',
          label: 'D1 supporting evidence',
          caption: 'Project preview defines the review context before AI analysis enters the workflow.',
          variant: 'containCard',
          maxHeight: 460,
        },
      ],
      d2: [
        {
          id: 'case02-d2-primary',
          src: '/images/case2/Case2-02.jpg',
          label: 'D2 primary evidence',
          caption:
            'Topics, classifications, generated answers, and review progress make the AI-assisted answer part of a structured decision workflow.',
          variant: 'heroImage',
        },
      ],
      d3: [
        {
          id: 'case02-d3-primary',
          src: '/images/case2/Case2-03.jpg',
          label: 'D3 detail evidence',
          caption: 'Mark as done — the moment human judgment is recorded as a decision state.',
          variant: 'detailCrop',
          maxHeight: 460,
          objectPosition: 'center center',
        },
      ],
    },
  },
  case03: {
    scope: [
      {
        id: 'case03-scope-context',
        src: '/images/case3/case3-00.jpg',
        label: 'Scope context',
        caption: 'The original system: spreadsheet-based operations with no agent execution layer.',
        variant: 'smallStrip',
        maxHeight: 240,
      },
    ],
    decisions: {
      d1: [
        {
          id: 'case03-d1-primary',
          src: '/images/case3/case3-04.jpg',
          label: 'Agent operations dashboard',
          caption:
            'Agent operations dashboard: execution status, progress, and intervention visibility without forcing users to monitor every action.',
          variant: 'heroImage',
        },
      ],
      d2: [
        {
          id: 'case03-d2-primary',
          src: '/images/case3/case3-02.jpg',
          label: 'Agent orchestration steps',
          caption:
            'Agent execution becomes controllable through orchestration steps, sub-agents, and explicit decision gates.',
          variant: 'heroImage',
          visualWeight: 'highest',
        },
        {
          id: 'case03-d2-supporting',
          src: '/images/case3/case3-03.jpg',
          label: 'Alert as decision trigger',
          caption:
            'Notifications become actionable only when they clarify whether to monitor, solve, or continue execution.',
          variant: 'containCard',
          maxHeight: 420,
        },
      ],
      d3: [
        {
          id: 'case03-d3-primary',
          src: '/images/case3/case3-01.jpg',
          label: 'Conversational orchestration entry',
          caption:
            'The conversational entry point connects user intent to agent execution state; chat becomes part of the control layer, not a separate interface.',
          variant: 'containCard',
          maxHeight: 460,
        },
      ],
    },
  },
  case04: {
    decisions: {
      d1: [
        {
          id: 'case04-d1-primary',
          src: '/images/case4/case4-01.jpg',
          label: 'D1 primary evidence',
          caption:
            'The original product direction: environment density and visible interaction as the primary engagement model. This assumption was what the design challenged.',
          variant: 'heroImage',
        },
      ],
      d2: [
        {
          id: 'case04-d2-primary',
          src: '/images/case4/case4-02.jpg',
          label: 'D2 primary evidence',
          caption: 'Presence as the core layer: the companion remains, even when interaction is minimal.',
          variant: 'heroImage',
          visualWeight: 'highest',
        },
      ],
      d3: [
        {
          id: 'case04-d3-primary',
          src: '/images/case4/case4-03.jpg',
          label: 'D3 primary evidence',
          caption:
            'Accumulated companion state: the relationship carries forward across sessions rather than resetting.',
          variant: 'containCard',
          maxHeight: 420,
        },
      ],
    },
  },
};

export function getScopeEvidenceImages(caseId) {
  return WORK_CASE_IMAGES[caseId]?.scope ?? [];
}

export function getDecisionEvidenceImages(caseId, slug) {
  if (!slug) return [];
  return WORK_CASE_IMAGES[caseId]?.decisions?.[slug] ?? [];
}
