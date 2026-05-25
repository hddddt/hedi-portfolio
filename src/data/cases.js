/** Portfolio case content migrated from old-version.html */
export const overviewIntro = {
  kicker: "Selected work · Responsibility layers",
  titleLines: ["Four AI gaps.", "Four missing layers."],
  sub: "Each case defines a missing responsibility layer in an AI system — from post-response workflow to decision traceability, agent control, and long-term presence.",
};
export const questionsBlock = {
  kicker: "AI Questions",
  titleLines: ["What each case makes visible."],
  sub: "How work continues, how decisions remain reviewable, how autonomous agents stay governable, and how relationships persist beyond interaction.",
};
export const cases = [
  {
    id: "case01",
    prevId: "case04",
    nextId: "case02",
    overview: {
      openAria: "Open Conversational AI case",
      num: "Case 01",
      title: "Conversational AI",
      layer: "Enterprise Conversational UX & Workflow Alignment",
      tension:
        "Chat had to anticipate needs, clarify roles, and hand off to real systems—not stop at the reply.",
      signal:
        "Workflow-aligned conversation strategy, human–AI interaction design, system integration.",
    },
    bar: {
      num: "Case 01",
      title: "Conversational AI",
      layer: "Enterprise Conversational UX & Workflow Alignment",
    },
    aside: {
      num: "Case 01",
      title: "Conversational AI",
      layer: "Enterprise Conversational UX & Workflow Alignment",
      judgeLead: "Conversation strategy has to align with how work actually moves.",
      judgeRest:
        "Map goals and touchpoints, define patterns that always resolve toward a task, then wire dialogue into handoffs, agents, APIs, and flows.",
      path: [
        { n: "01", t: "Strategy: goals, touchpoints, outcomes" },
        { n: "02", t: "Patterns: intent, fallback, validation, escalation" },
        { n: "03", t: "Integration: handoffs, agents, APIs, Cognigy flows" },
      ],
      signal:
        "Workflow-aligned conversation strategy, human–AI interaction design, system integration.",
      tags: ["3 systems", "support workflow", "dashboard"],
    },
    hero: {
      kicker: "Case 01 · Enterprise conversational UX & workflows",
      title: "Conversational strategy tied to real outcomes.",
      intro:
        "Mapped user goals and service touchpoints into a coherent conversational strategy that anticipates needs, clarifies roles, and aligns AI interventions with real outcomes. Defined interaction patterns—intent, fallback, validation, escalation—so conversations reliably lead to task resolution rather than dead ends. Integrated dialogue outputs with downstream systems (handoffs, agents, APIs, Cognigy flows) so AI responses trigger meaningful operational actions.",
      graphicVariant: "case01-hero",
      caption:
        "Intent → validation → escalation → orchestration. The thread continues into systems, not only messages.",
    },
    decisionsIntro:
      "Three decisions turned the assistant from an answer surface into a support flow: route the request, recover the journey, and continue the work beyond conversation.",
    decisions: [
      {
        dNum: "Decision 01",
        dTitle: "Route before response generation",
        dThesis:
          "Support requests were not treated as one generic intent. Before the assistant could answer, the system needed to identify the relevant scenario, knowledge domain, and request context.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "User selects the right handbook or support domain before asking.",
          },
          {
            strong: "But",
            but: true,
            text: "The system routes the request to the relevant scenario and knowledge domain before generating a response.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C1-1 + C1-2 sequence",
        slotLines: ["C1-1 Handbook entry", "+", "C1-2 AI recommendation"],
        readout: [
          {
            label: "Why this matters",
            parts: [
              { text: "Routing becomes system responsibility. ", bold: true },
              {
                text: "Users no longer need to understand the internal knowledge structure before the conversation can begin.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "From user description to routed domain: the system identifies topic, context, and knowledge source before response generation.",
          },
        ],
      },
      {
        dNum: "Decision 02",
        dTitle: "Design recovery as part of the support flow",
        dThesis:
          "Invalid, incomplete, or ambiguous inputs were treated as expected support conditions. The flow needed validation, clarification, retry, fallback, and handoff paths that keep the user moving.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Invalid input leads to a dead-end error message.",
          },
          {
            strong: "But",
            but: true,
            text: "Validation, clarification, retry, fallback, and handoff become one continuous recovery path.",
          },
        ],
        flip: true,
        evidenceTitle: "Recovery chain SVG + C1-7 support proof",
        slotLines: [
          "Validation → clarification → retry → problem branch → escalation",
          "",
          "Inset: C1-7 DHL action continuation",
        ],
        readout: [
          {
            label: "Why this matters",
            parts: [
              {
                text: "Recovery is part of the journey. The system can keep the user moving even when the initial request is incomplete, unclear, or not immediately answerable.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Recovery chain: validation → clarification → retry → fallback → handoff, instead of a single failure message.",
          },
        ],
      },
      {
        dNum: "Decision 03",
        dTitle: "Continue support work beyond conversation",
        dThesis:
          "Conversation was positioned as the entry point, not the whole product surface. When the request required action, follow-up, or human support, the flow needed to carry context into tickets, dashboards, handoff paths, or workflow states.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "A larger chat interface with more answers.",
          },
          {
            strong: "But",
            but: true,
            text: "Conversation captures and routes the request while operational systems carry state, context, and follow-up work.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C1-4 dashboard + C1-5 chat inset",
        slotLines: ["C1-4 Dashboard home", "", "Inset: C1-5 Orchestrator chat"],
        readout: [
          {
            label: "Why this matters",
            parts: [
              {
                text: "The assistant does not only respond. It helps move requests toward resolution, handoff, and follow-up action.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Conversation as entry point; dashboard, ticket state, and handoff paths carry the operational continuation.",
          },
        ],
      },
    ],
    outcome: {
      paragraph:
        "Across three implementations, the through-line was the same: define the support journey first—then routing, recovery, and orchestration become buildable, reviewable logic aligned with how conversational AI platforms expect flows to behave.",
      hiring:
        "I can design the AI support journey logic that turns conversational AI into operational progress across enterprise support environments.",
    },
  },
  {
    id: "case02",
    prevId: "case01",
    nextId: "case03",
    overview: {
      openAria: "Open Contract Intelligence case",
      num: "Case 02",
      title: "Contract Intelligence",
      layer: "Human-in-the-Loop & Auditable Workflow Design",
      tension:
        "AI could analyze contracts; judgment still had to stay visible, owned, and traceable.",
      signal:
        "Human-in-the-loop design, governance UX, traceability in AI workflows.",
    },
    bar: {
      num: "Case 02",
      title: "Contract Intelligence",
      layer: "Human-in-the-Loop & Auditable Workflow Design",
    },
    aside: {
      num: "Case 02",
      title: "Contract Intelligence",
      layer: "Human-in-the-Loop & Auditable Workflow Design",
      judgeLead: "Review is not one opaque answer—it is structured, actionable units.",
      judgeRest:
        "Clause, classification, answer, rationale, and state separate suggestion from legal decision and keep audit paths explicit.",
      path: [
        { n: "01", t: "Structure review units for actionability" },
        { n: "02", t: "Separate AI suggestions from human judgment" },
        { n: "03", t: "Audit paths and explicit decision boundaries" },
      ],
      signal:
        "Human-in-the-loop design, governance UX, traceability in AI workflows.",
      tags: ["contract review", "state", "audit trail"],
    },
    hero: {
      kicker: "Case 02 · Human-in-the-loop & auditable workflows",
      title: "Judgment stays visible, owned, and traceable.",
      intro:
        "Translated contract review processes into structured units (clause, classification, answer, rationale, state) that make AI output actionable and reviewable. Separated AI suggestions, user edits, and legal decisions so judgment remains visible, owned, and traceable throughout the workflow. Built clear audit paths and decision boundaries so reviewers can verify, correct, and own contract outcomes.",
      graphicVariant: "case02-hero",
      caption:
        "Structured units, separated roles, and preserved provenance—so every outcome can be reviewed and defended.",
    },
    decisions: [
      {
        dNum: "Decision 01",
        dTitle: "Define the review context",
        dThesis:
          "Before AI could analyze the contract, the system had to know what it was analyzing, in what project context, and for what use case.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "AI starts from a raw document upload.",
          },
          {
            strong: "But",
            but: true,
            text: "Document, project, parties, and use case become structured review context.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C2-1 + C2-2 foundation pair",
        slotLines: [
          "C2-1 Set up this document",
          "+",
          "C2-2 Project preview / info",
        ],
        readout: [
          {
            label: "Role of setup",
            parts: [
              {
                text: "Project setup is part of the intelligence workflow, not an administrative pre-step.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Caption: The contract first becomes a structured review object before AI-driven analysis begins.",
          },
        ],
      },
      {
        dNum: "Decision 02",
        dTitle: "Separate AI analysis from human judgment",
        dThesis:
          "AI output had to stop pretending to be the decision. The workflow needed to distinguish suggestion from judgment.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "AI output, edits, and final answer merge into one mutable field.",
          },
          {
            strong: "But",
            but: true,
            text: "AI-generated insight and reviewer judgment occupy distinct parts of the review unit.",
          },
        ],
        flip: true,
        evidenceTitle: "Hero evidence · C2-3 / C2-4 review screen",
        slotLines: [
          "Contract text + risk summary",
          "Topic-level AI analysis surface",
        ],
        readout: [
          {
            label: "Boundary",
            parts: [
              {
                text: "The system no longer treats “writing an answer” as the task. It supports forming a reviewable judgment.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Use the clearest C2-3 / C2-4 screen showing contract text plus risk summary / topic overview.",
          },
        ],
      },
      {
        dNum: "Decision 03",
        dTitle: "Preserve provenance and confirmation",
        dThesis:
          "A contract decision is only trustworthy when its source, state, and confirmation are still visible after review.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Review ends with a polished answer.",
          },
          {
            strong: "But",
            but: true,
            text: "Source-linked issues, AI interpretation, reviewer action, and confirmation state remain visible.",
          },
        ],
        flip: false,
        evidenceTitle: "Annotated crop · decision record anatomy",
        slotLines: [
          "C2 topic overview crop",
          "state · source · owner · confirmation",
        ],
        readout: [
          {
            label: "Traceability",
            parts: [
              {
                text: "Traceability is designed into the review object itself, not added later as reporting.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Caption: Topic-level review keeps the contract auditable after analysis.",
          },
        ],
      },
    ],
    outcome: {
      paragraph:
        "The system no longer treated AI analysis as a disposable answer layer. It turned contract review into a structured decision workflow grounded in context, separated judgment, and preserved traceability.",
      hiring:
        "I can design AI-assisted review systems where human judgment remains visible, decisions remain auditable, and AI insight becomes operationally trustworthy.",
    },
  },
  {
    id: "case03",
    prevId: "case02",
    nextId: "case04",
    overview: {
      openAria: "Open Supply Chain Agents case",
      num: "Case 03",
      title: "Supply Chain Agents",
      layer: "Agentic Workflow & Human Control Integration",
      tension:
        "Agents needed explicit rules for when to act, defer, or pull humans in.",
      signal: "Agentic workflows, control design, exception handling UX.",
    },
    bar: {
      num: "Case 03",
      title: "Supply Chain Agents",
      layer: "Agentic Workflow & Human Control Integration",
    },
    aside: {
      num: "Case 03",
      title: "Supply Chain Agents",
      layer: "Agentic Workflow & Human Control Integration",
      judgeLead: "Autonomy without control boundaries only scales noise.",
      judgeRest:
        "Define autonomy vs deferral vs human intervention; turn exceptions into gates; unify agents, alerts, and conversation in one execution model.",
      path: [
        { n: "01", t: "When agents act, defer, or escalate to humans" },
        { n: "02", t: "Alerts & exceptions as decision gates" },
        { n: "03", t: "Unified execution: agents, alerts, conversation" },
      ],
      signal: "Agentic workflows, control design, exception handling UX.",
      tags: ["agentic workflow", "orchestration", "gates"],
    },
    hero: {
      kicker: "Case 03 · Agentic workflow & human control",
      title: "Autonomy balanced with explicit intervention.",
      intro:
        "Defined when AI agents act autonomously, when they defer, and when humans intervene to maintain control in operational flows. Turned alerts and exceptions into decision gates with context and explicit intervention points. Unified agents, alerts, and conversational touchpoints into an execution model that balances autonomy with oversight.",
      graphicVariant: "case03-hero",
      caption:
        "Same spine: scoped autonomy, gated exceptions, and humans where judgment belongs.",
    },
    decisions: [
      {
        dNum: "Decision 01",
        dTitle: "Delegate execution with scope",
        dThesis:
          "Autonomy only becomes useful when the agent owns a defined portion of execution.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Humans shadow every agent action.",
          },
          {
            strong: "But",
            but: true,
            text: "Routine execution is delegated to agents with visible scope, state, and progress.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C3-3 Manage Agents",
        slotLines: [
          "C3-3 Manage Agents screen",
          "agent state · progress · runtime",
        ],
        readout: [
          {
            label: "Delegation",
            parts: [
              {
                text: "Delegation is scoped execution, not vague automation.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Each agent operates within visible boundaries instead of requiring continuous human shadowing.",
          },
        ],
      },
      {
        dNum: "Decision 02",
        dTitle: "Turn alerts into decision gates",
        dThesis:
          "An alert only matters when it creates a meaningful control point.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Alerts pull people back into constant monitoring.",
          },
          {
            strong: "But",
            but: true,
            text: "Risk signals stop the system at defined gates with context and options.",
          },
        ],
        flip: true,
        evidenceTitle: "Hero evidence · C3-1 decision gate",
        slotLines: [
          "C3-1 Capacity Agent orchestration",
          "High Capacity Risk Detected",
          "Open Decision Gate",
        ],
        readout: [
          {
            label: "Control point",
            parts: [
              {
                text: "Intervention is redesigned around defined gates, not constant supervision.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "C3-1 is the strongest evidence: High Capacity Risk Detected + Open Decision Gate.",
          },
        ],
      },
      {
        dNum: "Decision 03",
        dTitle: "Govern agents through orchestration state",
        dThesis:
          "Humans do not need to monitor every action. They need visibility into state, context, and intervention points.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "A chat UI becomes the control system.",
          },
          {
            strong: "But",
            but: true,
            text: "Chat, agent state, task progress, notifications, and intervention are organized through an orchestrator layer.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C3-2 + C3-3",
        slotLines: [
          "C3-2 Chat landing",
          "+",
          "C3-3 Manage Agents governance surface",
        ],
        readout: [
          {
            label: "Governance",
            parts: [
              {
                text: "The system shifts from automation without ownership to orchestration with visible state and controlled human entry.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Chat acts as entry and context layer; orchestration and agent-management views provide control.",
          },
        ],
      },
    ],
    outcome: {
      paragraph:
        "The system no longer relied on undefined autonomy plus human monitoring. It became a controlled agent workflow where execution, escalation, and intervention were distributed across orchestrator, agents, alerts, and human decision points.",
      hiring:
        "I can design control architectures for agentic enterprise systems — defining how orchestration, alerts, agent state, and human judgment work together.",
    },
  },
  {
    id: "case04",
    prevId: "case03",
    nextId: "case01",
    overview: {
      openAria: "Open AI Companion case",
      num: "Case 04",
      title: "AI Companion",
      layer: "Presence & Continuity-Driven Engagement Design",
      tension:
        "Engagement had to persist beyond isolated sessions—through continuity, not more prompts.",
      signal:
        "Companion experience design, continuity UX, adaptive engagement.",
    },
    bar: {
      num: "Case 04",
      title: "AI Companion",
      layer: "Presence & Continuity-Driven Engagement Design",
    },
    aside: {
      num: "Case 04",
      title: "AI Companion",
      layer: "Presence & Continuity-Driven Engagement Design",
      judgeLead: "The lever is presence and continuity—not interaction volume.",
      judgeRest:
        "Ground the companion in context; use memory and state for low-friction return; measure relationship, not single sessions.",
      path: [
        { n: "01", t: "From isolated interactions to persistent presence" },
        { n: "02", t: "Continuity signals & personalized return paths" },
        { n: "03", t: "Metrics: relational indicators over single sessions" },
      ],
      signal:
        "Companion experience design, continuity UX, adaptive engagement.",
      tags: ["consumer AI", "continuity", "presence"],
    },
    hero: {
      kicker: "Case 04 · Presence & continuity-driven engagement",
      title: "Engagement as an ongoing relationship.",
      intro:
        "Shifted design focus from isolated interactions to persistent companion presence grounded in user context and behavior. Used continuity signals (memory, session state, preference cues) to create low-friction return paths and personalized engagement. Reframed engagement metrics from single sessions to accumulated relational indicators.",
      graphicVariant: "case04-hero",
      caption:
        "What persists between visits shapes whether the product feels like a companion—or a reset every time.",
    },
    decisions: [
      {
        dNum: "Decision 01",
        dTitle: "Demote visible interaction",
        dThesis:
          "The most visible parts of the product were not the parts creating sustained engagement.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Make the environment and avatar more dominant.",
          },
          {
            strong: "But",
            but: true,
            text: "Treat them as original-model evidence and stop assuming visible interaction equals engagement.",
          },
        ],
        flip: false,
        evidenceTitle: "Original model evidence · C4-1",
        slotLines: [
          "C4-1 3D room / avatar / study environment",
          "Before: interaction-heavy model",
        ],
        readout: [
          {
            label: "Insight",
            parts: [
              {
                text: "The most obvious surface was not the deepest lever.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Caption: The original product centered the environment and visible interaction, tying engagement to deliberate activity.",
          },
        ],
      },
      {
        dNum: "Decision 02",
        dTitle: "Redefine engagement as continuity",
        dThesis:
          "Engagement became more meaningful when it was defined as continuity across time, not intensity within a session.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Measure engagement only as visible activity during one session.",
          },
          {
            strong: "But",
            but: true,
            text: "Optimize for persistent state, re-entry ease, and continuity across sessions.",
          },
        ],
        flip: true,
        evidenceTitle: "Continuity timeline SVG",
        slotLines: [
          "Session 1 → presence persists → Session 2 resumes with context",
        ],
        readout: [
          {
            label: "Model",
            parts: [
              {
                text: "The system begins to optimize for return, not just interaction.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Use an SVG continuity timeline rather than fake product UI.",
          },
        ],
      },
      {
        dNum: "Decision 03",
        dTitle: "Maintain presence without demanding attention",
        dThesis:
          "A companion system should remain present without requiring constant attention.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Push more interaction pressure onto the user.",
          },
          {
            strong: "But",
            but: true,
            text: "Calibrate presence between pressure and disappearance.",
          },
        ],
        flip: false,
        evidenceTitle: "Presence spectrum SVG",
        slotLines: ["Too active → balanced presence → too passive"],
        readout: [
          {
            label: "Tuning",
            parts: [
              {
                text: "Designing for presence means tuning the relationship, not increasing interaction volume.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Caption: Presence is a calibrated state between pressure and disappearance.",
          },
        ],
      },
    ],
    outcome: {
      paragraph:
        "The system shifted from an interaction-heavy product to a continuity-driven companion model. Visible features were demoted, return friction was reduced, and the relationship was redefined around ongoing presence rather than repeated re-entry.",
      hiring:
        "I can redesign AI companion systems around presence, continuity, and long-term engagement — not just interaction volume or surface novelty.",
    },
  },
];
export function getCaseById(id) {
  return cases.find((c) => c.id === id) ?? null;
}
