/**
 * Work case detail — AI Case Map (left) + Project Evidence Flow (right).
 * Verbatim copy; do not paraphrase.
 */

import contractExcelleratorHero from '../assets/case02/contract-excellerator-hero.png';
import orchestratorAgentChat from '../assets/case03/orchestrator-agent-chat.png';
import agentOrchestrationSteps from '../assets/case03/agent-orchestration-steps.png';
import manageAgentsDashboard from '../assets/case03/manage-agents-dashboard.png';
import agentDetailsModal from '../assets/case03/agent-details-modal.png';

export const WORK_CASE_DETAIL = {
  case01: {
    caseMap: {
      caseTitle: 'Conversational AI',
      aiValueLayer: 'Service-Flow Architecture for Conversational AI',
      provesLabel: 'WHAT THIS CASE PROVES',
      whyLayerMatters:
        'I design the layer where conversational AI becomes service work: routing the right context, recovering from failure, handing off with continuity, and making responses trustworthy enough to continue.',
      readingMap: {
        navLabel: 'ON THIS CASE',
        decisions: [
          { d: 'D1', slug: 'd1', title: 'Service-System Framing' },
          { d: 'D2', slug: 'd2', title: 'Flow, Recovery & Handoff Architecture' },
          { d: 'D3', slug: 'd3', title: 'Response, Trust & Repair Patterns' },
        ],
      },
      railMode: true,
      keySignals: [
        'Journey mapping',
        'Stakeholder tasks',
        'Knowledge routing',
        'Recovery & handoff',
        'Fallback',
        'Escalation',
        'Handoff',
        'Clarification pattern',
      ],
    },
    evidence: {
      staged: true,
    },
  },
  case02: {
    caseMap: {
      caseTitle: 'Contract Intelligence',
      aiValueLayer: 'Decision traceability for AI-assisted contract review',
      provesLabel: 'WHAT THIS CASE PROVES',
      whyLayerMatters:
        'I design the layer where AI-assisted contract analysis becomes reviewable judgment: separating generated insight from human edits, preserving source provenance, and making final decisions auditable.',
      readingMap: {
        navLabel: 'Navigation',
        decisions: [
          { d: 'D1', slug: 'd1', title: 'Review Context Framing' },
          { d: 'D2', slug: 'd2', title: 'Decision State Architecture' },
          { d: 'D3', slug: 'd3', title: 'Provenance & Auditability Layer' },
        ],
      },
      railMode: true,
      keySignals: [
        'Review workflow',
        'Answer states',
        'Human-AI collaboration',
        'Traceability',
        'Auditability',
        'Risk assessment',
      ],
    },
    evidence: {
      staged: true,
      projectContext: {
        lead: 'This project focused on an AI-assisted contract review product.\n\nThe system included multiple AI capabilities:',
        bullets: [
          'contract summarization',
          'clause extraction',
          'Q&A',
          'comparison',
          'drafting',
          'risk-related assessment',
          'questionnaire-based review',
        ],
        paragraphs: [
          'At first glance, this looked like a product with many powerful AI features.',
          'But the design challenge was not how to add more AI assistance. It was how to make AI-generated analysis usable inside a review process where human judgment, verification, and traceability matter.',
        ],
      },
      defaultDirection: {
        lead: 'The default direction would have been to improve each AI feature separately:',
        bullets: [
          'better summaries',
          'more accurate extraction',
          'clearer generated answers',
          'stronger Q&A',
          'faster drafting',
          'more review automation',
        ],
        paragraphs: [
          'That would improve local usability.',
          'But it would not solve the deeper workflow problem.',
          'The product already had AI capabilities. What it lacked was a structured way to preserve review judgment.',
        ],
      },
      turningPoint: {
        paragraphs: [
          'The turning point came when I saw that AI output, user edits, and confirmed review decisions could all collapse into the same field.',
          'At that point, the product was not only losing information.',
          'It was losing judgment.',
          'A reviewer could no longer easily see what AI originally generated, what the user changed, whether the answer had been verified, whether it was final, or how it contributed to the overall risk assessment.',
        ],
        shiftLead: 'So the question shifted from:',
        shiftFrom: 'How can AI support contract review?',
        shiftTo: 'How can the workflow preserve what kind of answer this is, who changed it, and whether it is final?',
      },
      designDecision: {
        paragraphs: [
          'I organized AI capabilities around the contract-review workflow, not around isolated AI functions.',
          'The key shift was from generating AI output to preserving reviewable judgment.',
        ],
        emphasis: 'strong',
      },
      whatIDesigned: [
        {
          num: '01',
          title: 'Feature-to-workflow structure',
          body: 'I mapped multiple AI capabilities into the main review process:\n\ncontract content → question-level review → answer judgment → overall risk evaluation',
          designValue: 'The product moved from parallel AI tools to one structured review flow.',
        },
        {
          num: '02',
          title: 'Human-AI collaboration model',
          body: 'I separated AI roles across the workflow:\n\nsummarize · retrieve · suggest · compare · support assessment · draft\n\nBut these were not equal contributions. Some outputs were informational, some were suggestions, and some directly influenced judgment.',
          designValue: 'AI support and human responsibility became distinguishable at each review step.',
        },
        {
          num: '03',
          title: 'Answer state model',
          body: 'I introduced explicit answer states:\n\nAI-generated → User-modified → Confirmed\n\nThis changed the answer from generated content into a decision artifact.',
          designValue: 'The system could preserve authorship, review status, and decision meaning.',
        },
        {
          num: '04',
          title: 'Traceable review artifact',
          body: 'The answer field needed to show:\n\nsource · classification · reasoning · AI-generated status · user modification · confirmation state',
          designValue: 'The review process became easier to understand, verify, and audit.',
        },
      ],
      heroEvidence: {
        title: 'Hero Evidence｜Answer State Model',
        states: [
          {
            label: 'AI-generated',
            lines: ['Proposed by the system', 'Not yet verified'],
          },
          {
            label: 'User-modified',
            lines: ['Reviewed and adjusted by a human', 'Human judgment entered the answer'],
          },
          {
            label: 'Confirmed',
            lines: ['Accepted as the current decision state', 'Ready to contribute to review outcome'],
          },
        ],
        sideLabels: ['authorship', 'review status', 'decision meaning', 'traceability', 'decision readiness'],
        caption:
          'The answer field became a stateful decision artifact, not just a text container.',
      },
      evidenceModules: [
        {
          title: 'Contract Excellerator — Risk Summary & Topics',
          image: contractExcelleratorHero,
          alt: 'Contract Excellerator with contract preview, overall risk summary, BRC topic counts, and topic cards showing AI-generated vs You edited states',
          caption:
            'The primary review surface: contract text, overall assessment, BRC-level signals, and topic cards where + AI generated and You edited stay visible in one workflow.',
        },
        {
          label: 'Supporting',
          title: 'Human-AI collaboration matrix',
          whatToShow: 'Review step / AI role / human role / status meaning',
          table: {
            headers: ['Review Step', 'AI Role', 'Human Role', 'Status Meaning'],
            rows: [
              ['Clause review', 'Retrieve relevant clause', 'Check relevance', 'Informational'],
              ['Question answer', 'Suggest classification', 'Edit or confirm', 'Review in progress'],
              ['Risk assessment', 'Aggregate signals', 'Validate judgment', 'Confirmed decision'],
            ],
          },
          caption: 'Each AI contribution was mapped to a human review responsibility.',
        },
      ],
      resultingValue: {
        paragraphs: [
          'This case shows how AI-generated analysis can become reviewable, editable, confirmable, and auditable inside a real workflow.',
          'The value is not more AI content.',
          'It is preserving the judgment behind the content.',
        ],
      },
      closingLine: 'In contract intelligence, the output is only useful when the judgment behind it remains visible.',
    },
  },
  case03: {
    caseMap: {
      caseTitle: 'Supply Chain Agents',
      aiValueLayer: 'Human-agent control for agentic workflows',
      provesLabel: 'WHAT THIS CASE PROVES',
      whyLayerMatters:
        'I design the layer where agentic workflows become controllable: defining what agents own, when humans intervene, and how execution resumes after judgment.',
      readingMap: {
        navLabel: 'ON THIS CASE',
        decisions: [
          { d: 'D1', slug: 'd1', title: 'Agent Ownership Boundary' },
          { d: 'D2', slug: 'd2', title: 'Decision Gate Model' },
          { d: 'D3', slug: 'd3', title: 'Orchestration Control Layer' },
        ],
      },
      railMode: true,
      keySignals: [
        'Agentic workflow',
        'Decision gates',
        'Control transfer',
        'Human-in-the-loop',
        'Alert logic',
        'Role separation',
      ],
    },
    evidence: {
      staged: true,
      projectContext: {
        lead: 'This project explored a supply chain agent system combining:',
        bullets: [
          'AI agents',
          'alerts',
          'chatbot interaction',
          'workflow automation',
          'human monitoring',
          'exception handling',
        ],
        paragraphs: [
          'The initial ambition was to reduce human involvement and let agents handle more of the workflow.',
          'On the surface, that sounded like the right direction for an agentic system.',
          'If agents can act, the product should require less user interaction.',
          'But in a complex enterprise workflow, automation alone does not guarantee scalability.',
        ],
      },
      defaultDirection: {
        lead: 'The default direction was:',
        bullets: ['automate more → reduce interaction → make the system feel more intelligent'],
        paragraphs: [
          'This assumed that less human involvement automatically meant a better agentic system.',
          'But in supply chain workflows, this assumption was risky.',
          'Too much human access meant agents never truly owned execution.',
          'Too little human access meant humans lost control over business-critical decisions.',
          'The product could appear automated while still increasing cognitive load.',
        ],
      },
      turningPoint: {
        paragraphs: [
          'The turning point was recognizing a control contradiction.',
          'The system wanted agent autonomy, but it also kept users continuously involved.',
          'Agents executed, but users still felt responsible.',
          'Alerts notified, but did not clarify whether action was needed.',
          'The chatbot existed, but its operational role was unclear.',
          'Users could intervene, but did not know when they should.',
          'Automation scaled activity, but it also scaled monitoring.',
          'So the issue was not interaction volume.',
          'The issue was control structure.',
        ],
      },
      designDecision: {
        paragraphs: [
          'I reframed the product from minimizing human involvement to defining where human judgment belongs.',
          'The goal was not to remove users from the workflow.',
          'The goal was to let agents own execution where appropriate, while reserving human intervention for moments where business judgment, risk, uncertainty, or accountability required it.',
          'This led to the decision-gate model.',
        ],
        emphasis: 'strong',
      },
      whatIDesigned: [
        {
          num: '01',
          title: 'Execution vs control separation',
          body: 'I defined where agents should execute independently and where human judgment is required.\n\nAgents should execute when the system has enough confidence, the action is manageable, and the business impact is reversible or low-risk.\n\nHumans should intervene when the decision involves irreversible impact, conflicting signals, low confidence, business-critical trade-offs, or accountability.',
          designValue: 'Human involvement became intentional instead of constant.',
        },
        {
          num: '02',
          title: 'Decision gate model',
          body: 'I proposed decision gates as structured moments of control transfer.\n\nA decision gate is not a notification. It is the point where the system pauses, surfaces relevant context, and asks for human judgment before continuing.',
          designValue: 'The system brings users in when their judgment changes the outcome.',
        },
        {
          num: '03',
          title: 'Alerts as gate triggers',
          body: 'I reframed alerts from passive notifications into triggers for decision gates.\n\nAn alert should clarify why attention is needed, what decision is required, what the agent recommends, what options exist, and whether the agent can continue.',
          designValue: 'Alerts became operational signals, not noise.',
        },
        {
          num: '04',
          title: 'Chatbot as decision support',
          body: 'I repositioned the chatbot as a support layer around decision moments.\n\nIts role is to help users understand context, retrieve information, compare options, and decide what should happen next.',
          designValue: 'The chatbot stopped being a parallel interface and became decision support.',
        },
        {
          num: '05',
          title: 'Human intervention as control transfer',
          body: 'I treated human intervention as a transfer of control, not generic approval.\n\nApproval says: “Please confirm this action.”\n\nControl transfer says: “The system has reached a point where human judgment is required before execution can continue responsibly.”',
          designValue: 'The user’s role became clearer and less continuous.',
        },
      ],
      evidenceModules: [
        {
          title: 'Orchestrator task delegation',
          image: orchestratorAgentChat,
          alt: 'Chat where an orchestrator assigns capacity alerts to a Capacity Agent with analysis in progress',
          caption:
            'Execution starts with delegated tasks and visible agent reasoning—not a black-box automation layer users cannot follow.',
        },
        {
          title: 'Multi-agent execution flow',
          image: agentOrchestrationSteps,
          alt: 'Capacity Agent workflow showing orchestrated steps, sub-agents, completed results, and in-progress conflict resolution',
          caption:
            'A master orchestrator runs staged steps across specialized agents, surfacing results and status so users see where execution is—and where judgment may be needed.',
        },
        {
          title: 'Agent operations dashboard',
          image: manageAgentsDashboard,
          alt: 'Manage Agents dashboard listing running, completed, and failed agents with progress and controls',
          caption:
            'Operational control scales through agent status, progress, and intervention actions—not continuous monitoring of every step.',
        },
        {
          title: 'Agent configuration & access',
          image: agentDetailsModal,
          alt: 'Agent Details modal with name, description, location, access mode, and shared users',
          caption:
            'Agents are configured with explicit scope and access boundaries before they enter the workflow—control is structured at setup, not only at runtime.',
        },
        {
          label: 'Supporting',
          title: 'Control contradiction',
          table: {
            headers: ['Too much human access', 'Too little human access'],
            rows: [
              ['Agents cannot own execution', 'Humans lose business control'],
              ['Users keep monitoring', 'System acts without enough judgment'],
              ['Automation does not reduce responsibility', 'Trust becomes fragile'],
            ],
          },
          caption: 'Agent autonomy and continuous human access created a control contradiction the UI had to resolve.',
        },
      ],
      resultingValue: {
        paragraphs: [
          'This case shows how agentic systems can scale without turning users into full-time supervisors.',
          'The value is not simply reducing human involvement.',
          'It is placing human control where it creates the most operational value.',
        ],
      },
      closingLine: 'Agentic systems scale only when execution and control are deliberately separated.',
    },
  },
  case04: {
    caseMap: {
      caseTitle: 'AI Companion',
      aiValueLayer: 'Presence continuity for AI companions',
      provesLabel: 'WHAT THIS CASE PROVES',
      whyLayerMatters:
        'I design the layer where AI companions become returnable: separating visible interaction from attachment signals, making presence persistent, and turning isolated sessions into continuity that carries forward.',
      readingMap: {
        navLabel: 'ON THIS CASE',
        decisions: [
          { d: 'D1', slug: 'd1', title: 'Interaction ≠ Engagement' },
          { d: 'D2', slug: 'd2', title: 'Presence as the Core Layer' },
          { d: 'D3', slug: 'd3', title: 'Low-Friction Return & Continuity' },
        ],
      },
      railMode: true,
      keySignals: [
        'AI companion',
        'Engagement model',
        'Presence',
        'Continuity',
        'Return behavior',
        'Session persistence',
      ],
    },
    evidence: {
      staged: true,
      projectContext: {
        lead: 'This project explored an AI companion product where the original engagement logic relied heavily on visible interaction:',
        bullets: ['environment', 'avatar', 'chat', 'explicit user actions', 'interaction entry points'],
        paragraphs: [
          'The product assumption was clear:',
          'more interaction creates stronger engagement',
          'At first, that assumption made sense.',
          'Companion products often try to become more engaging by adding more things to do, more ways to interact, and more visible signs of presence.',
          'But user behavior suggested that the engagement mechanism might be different.',
        ],
      },
      defaultDirection: {
        lead: 'The default product direction would have been to add more:',
        bullets: [
          'richer environment',
          'more avatar behavior',
          'more chat prompts',
          'more explicit actions',
          'more interaction loops',
          'more things for users to do',
        ],
        paragraphs: [
          'This would make the product feel more active.',
          'But more activity does not automatically create stronger attachment.',
          'For an AI companion, too many explicit interaction demands can make the product feel heavier. The user has to enter, act, respond, and restart the relationship every time.',
          'A product can have many interactions and still fail to create continuity.',
        ],
      },
      turningPoint: {
        paragraphs: [
          'The turning point was not simply that engagement remained stable after environment-heavy interaction was reduced.',
          'The shift came from how I interpreted that signal.',
          'Instead of seeing reduced interaction as a product weakness, I treated it as evidence that the engagement mechanism might be different from what we assumed.',
          'If users still returned when visible interaction became lighter, then return behavior was probably not driven by interaction density alone.',
          'Users were not necessarily coming back because there was more to do.',
          'They may have been returning because the companion state felt persistent enough to re-enter.',
        ],
        shiftLead: 'So the question shifted from:',
        shiftFrom: 'How do we make users interact more?',
        shiftTo: 'What makes the companion worth returning to even when there is not much to do?',
      },
      designDecision: {
        paragraphs: [
          'I treated the reduced-environment signal as a product hypothesis, not a limitation.',
          'Instead of adding more interaction back into the core loop, I reframed the product around presence, continuity, and low-friction return.',
        ],
        pullQuote:
          'The product should not reset every time the user returns.\nIt should carry something forward.',
        emphasis: 'quote',
      },
      whatIDesigned: [
        {
          num: '01',
          title: 'Interaction does not equal engagement',
          body: 'I separated visible interaction from actual return behavior.\n\nA user sending more messages does not automatically mean the companion relationship is stronger.',
          designValue: 'Engagement was evaluated through return behavior and continuity, not only interaction volume.',
        },
        {
          num: '02',
          title: 'Presence as the primary layer',
          body: 'I reframed the companion experience around persistent presence rather than feature density.\n\nThe product needed to support the feeling that:\n\nthe companion is still there\nthe relationship has not reset\nreturning does not require starting from zero\nthe user can re-enter without pressure',
          designValue: 'Presence became the core product layer.',
        },
        {
          num: '03',
          title: 'Environment as supporting layer',
          body: 'I demoted environment, avatar, and explicit interaction from the core loop into a supporting role.\n\nThese elements still mattered, but they should not define the main engagement model.',
          designValue: 'The product form became lighter and more return-oriented.',
        },
        {
          num: '04',
          title: 'Low-friction return loop',
          body: 'I shifted the loop from:\n\nfeature → interaction → response → session ends\n\nto:\n\npresence → recognition → low-friction return → continuity accumulation',
          designValue: 'The product became something users return to, not just something users operate.',
        },
        {
          num: '05',
          title: 'Accumulated companion state',
          body: 'I shifted the product logic from isolated sessions to continuity that carries forward over time.\n\nThe companion needed to feel persistent enough for users to re-enter, even when the interaction itself was light.',
          designValue: 'Engagement accumulated instead of resetting.',
        },
      ],
      evidenceModules: [
        {
          label: 'Evidence 01',
          title: 'Old engagement assumption',
          whatToShow: 'More environment + more avatar + more chat → expected stronger engagement.',
          caption:
            'The original model assumed that more visible interaction would create stronger engagement.',
        },
        {
          label: 'Evidence 02',
          title: 'Behavior signal',
          whatToShow:
            'Reduced visible interaction → engagement did not collapse → return signal remained.',
          caption:
            'Reduced interaction did not weaken the return signal, which challenged the original engagement assumption.',
        },
        {
          label: 'Evidence 03',
          title: 'New engagement loop',
          whatToShow: 'Presence → recognition → low-friction return → continuity accumulation.',
          caption: 'The engagement loop moved from interaction-triggered to continuity-driven.',
        },
        {
          label: 'Evidence 04',
          title: 'Feature hierarchy shift',
          whatToShow: 'Before / After core vs supporting layers',
          hierarchyTables: {
            before: {
              headers: ['Core', 'Supporting'],
              rows: [['Environment / avatar / chat', 'Continuity']],
            },
            after: {
              headers: ['Core', 'Supporting'],
              rows: [['Presence / continuity / return', 'Environment / avatar / chat']],
            },
          },
          caption: 'Visible interaction became a supporting layer; continuity became the core product logic.',
        },
      ],
      resultingValue: {
        paragraphs: [
          'This case shows how AI companion engagement can be designed around continuity instead of interaction volume.',
          'The value is not more things to do.',
          'It is a stronger reason to come back.',
        ],
      },
      closingLine: 'Return does not always come from more interaction. It can come from a stronger sense of continuity.',
    },
  },
};
