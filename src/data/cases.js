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
      layerPill: "Post-response workflow",
      signal:
        "Turns conversation into operational progress after the response.",
      graphicVariant: "case01-card",
    },
    bar: {
      num: "Case 01",
      title: "Conversational AI",
      layer: "Post-response workflow",
    },
    aside: {
      num: "Case 01",
      title: "Conversational AI",
      layer: "Post-response workflow",
      judgeLead: "AI response is not completion.",
      judgeRest: "Conversation must define what happens next.",
      path: [
        { n: "01", t: "Route before answer" },
        { n: "02", t: "Recover before failure" },
        { n: "03", t: "Orchestrate support work" },
      ],
      signal:
        "Buildable conversational AI logic for enterprise support environments.",
      tags: ["3 systems", "support workflow", "dashboard"],
    },
    hero: {
      kicker: "Case 01 · Post-response workflow layer",
      title: "Conversational design does not end at the answer.",
      intro:
        "Across three conversational AI systems, the key design work was not response copy. It was defining how conversation routes the request, recovers from bad input, connects to operational context, and moves unresolved work into support.",
      graphicVariant: "case01-hero",
      caption:
        "Responsibility moves after understanding — toward resolution, clarity, or escalation. The point is not a better chat surface; it is post-response operational continuation.",
    },
    decisions: [
      {
        dNum: "Decision 01",
        dTitle: "Route before answer",
        dThesis:
          "The first job of the system was not answering. It was deciding where the request belonged.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "User selects the right handbook before asking.",
          },
          {
            strong: "But",
            but: true,
            text: "The system routes to the correct knowledge domain before answer generation.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C1-1 + C1-2 sequence",
        slotLines: ["C1-1 Handbook entry", "+", "C1-2 AI recommendation"],
        readout: [
          {
            label: "Why this matters",
            parts: [
              {
                text: "The user no longer needs to understand the internal handbook structure before the conversation can begin. ",
                bold: false,
              },
              { text: "Routing becomes system responsibility.", bold: true },
              { text: " ", bold: false },
            ],
          },
          {
            proof:
              "Caption: From user description to routed handbook. The system identifies topic and keywords before answer generation.",
          },
        ],
      },
      {
        dNum: "Decision 02",
        dTitle: "Recover before failure",
        dThesis:
          "If conversational support only works on clean input, it fails where support is needed most.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "Invalid input leads to a dead-end error message.",
          },
          {
            strong: "But",
            but: true,
            text: "Validation, clarification, retry, and support handoff become one executable recovery chain.",
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
            label: "Logic",
            parts: [
              {
                text: "The main path includes uncertainty. The system can move from bad input to clarification, from problem branch to support, and from explanation to action.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "Supporting proof: C1-7 is stronger than a welcome screen because it shows action continuation, not just chat entry.",
          },
        ],
      },
      {
        dNum: "Decision 03",
        dTitle: "Orchestrate support work from conversation",
        dThesis:
          "The support system needed more than a chat surface. It needed a conversational entry point into the operational ecosystem.",
        nb: [
          {
            strong: "Not",
            but: false,
            text: "A larger chat with more answers.",
          },
          {
            strong: "But",
            but: true,
            text: "Conversation explains and locates the issue while dashboard carries state, context, and follow-up work.",
          },
        ],
        flip: false,
        evidenceTitle: "Hero evidence · C1-4 dashboard + C1-5 chat inset",
        slotLines: ["C1-4 Dashboard home", "", "Inset: C1-5 Orchestrator chat"],
        readout: [
          {
            label: "Repositioning",
            parts: [
              {
                text: "Conversation becomes an orchestration layer inside a broader support ecosystem — not the whole product surface.",
                bold: false,
              },
            ],
          },
          {
            proof:
              "The dashboard gives visibility across tickets, device status, and follow-up work while conversation remains the intelligent entry point.",
          },
        ],
      },
    ],
    outcome: {
      paragraph:
        "Across three systems, conversational AI became operationally usable because responsibility after the response was defined: routing before answer, recovery before failure, and orchestration before escalation.",
      hiring:
        "I can design the post-response workflow layer that turns conversational AI into operational progress across enterprise support environments.",
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
      layerPill: "Decision traceability",
      signal: "Makes AI-assisted contract decisions reviewable and auditable.",
      graphicVariant: "case02-card",
    },
    bar: {
      num: "Case 02",
      title: "Contract Intelligence",
      layer: "Decision traceability",
    },
    aside: {
      num: "Case 02",
      title: "Contract Intelligence",
      layer: "Decision traceability",
      judgeLead: "AI analysis is not judgment.",
      judgeRest: "The workflow must define unit, source, state, and owner.",
      path: [
        { n: "01", t: "Define the review context" },
        { n: "02", t: "Separate AI from human judgment" },
        { n: "03", t: "Preserve provenance and confirmation" },
      ],
      signal: "Auditable AI-assisted decision design for contract workflows.",
      tags: ["contract review", "state", "audit trail"],
    },
    hero: {
      kicker: "Case 02 · Decision traceability layer",
      title: "AI analysis is not the decision.",
      intro:
        "In contract review, the real design problem was not generating insight. It was deciding how AI analysis, human judgment, source context, and confirmation state coexist inside one review workflow without collapsing into an untraceable answer field.",
      graphicVariant: "case02-hero",
      caption:
        "Traceability comes from separation: AI analysis, reviewer judgment, and confirmation state are distinct, then preserved as one reviewable decision record.",
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
      layerPill: "Human-in-the-loop control",
      signal:
        "Defines how agent execution, control, and human judgment work together.",
      graphicVariant: "case03-card",
    },
    bar: {
      num: "Case 03",
      title: "Supply Chain Agents",
      layer: "Human-in-the-loop control",
    },
    aside: {
      num: "Case 03",
      title: "Supply Chain Agents",
      layer: "Human-in-the-loop control",
      judgeLead:
        "Autonomy does not reduce work when control remains undefined.",
      judgeRest:
        "Agentic systems need explicit ownership of execution, intervention, and escalation.",
      path: [
        { n: "01", t: "Delegate execution with scope" },
        { n: "02", t: "Turn alerts into decision gates" },
        { n: "03", t: "Govern agents through orchestration state" },
      ],
      signal: "Control design for enterprise agent workflows.",
      tags: ["agentic workflow", "orchestration", "gates"],
    },
    hero: {
      kicker: "Case 03 · Human-in-the-loop control layer",
      title: "Autonomy needs a control architecture.",
      intro:
        "The challenge was not adding more agents. It was defining how agents, orchestrator, alerts, chat, and human judgment work together so the system can execute without forcing people to monitor everything.",
      graphicVariant: "case03-hero",
      caption:
        "The orchestrator owns workflow state. Agents execute within scope; alerts trigger gates; chat carries context; humans enter where judgment is required.",
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
      layerPill: "Presence & continuity",
      signal:
        "Redesigns companion engagement around continuity, return, and presence.",
      graphicVariant: "case04-card",
    },
    bar: {
      num: "Case 04",
      title: "AI Companion",
      layer: "Presence & continuity",
    },
    aside: {
      num: "Case 04",
      title: "AI Companion",
      layer: "Presence & continuity",
      judgeLead: "Engagement does not come from more interaction.",
      judgeRest: "It comes from continuity and low-friction return.",
      path: [
        { n: "01", t: "Demote visible interaction" },
        { n: "02", t: "Redefine engagement as continuity" },
        { n: "03", t: "Maintain presence without demanding attention" },
      ],
      signal:
        "Companion system design beyond chat volume and surface activity.",
      tags: ["consumer AI", "continuity", "presence"],
    },
    hero: {
      kicker: "Case 04 · Presence & continuity layer",
      title: "The real lever turned out to be presence.",
      intro:
        "The original system assumed that a richer environment and more visible interaction would drive engagement. What emerged instead was a different design problem: how to create continuity, lower re-entry friction, and keep the relationship present even when the user is not actively interacting.",
      graphicVariant: "case04-hero",
      caption:
        "The key area is not the visible session. It is what persists between sessions, so returning feels like continuation instead of starting from zero.",
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
