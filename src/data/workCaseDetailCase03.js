/**
 * Case 03 — Supply Chain Agents (D1 / D2 / D3 staged flow).
 */

import agentOrchestrationSteps from '../assets/case03/agent-orchestration-steps.png';
import manageAgentsDashboard from '../assets/case03/manage-agents-dashboard.png';
import agentDetailsModal from '../assets/case03/agent-details-modal.png';
import orchestratorAgentChat from '../assets/case03/orchestrator-agent-chat.png';

export const CASE03_FLOW = [
  {
    id: 'intro',
    type: 'case-intro',
    metadataStrip: {
      lead: 'Agentic supply chain workflow, one control contradiction: automation scaled execution, but also scaled monitoring.',
      body: '',
    },
    caseThesis: ['Autonomy was not the missing piece.', 'Control boundaries were.'],
    caseThesisSupport:
      'Agentic systems scale only when execution and control are deliberately separated.',
  },
  {
    id: 'scope',
    type: 'scope-clarification',
    paragraphs: [
      'The work was not about reducing human interaction or adding more automation.',
      'The real design problem was defining where human judgment still belongs in an agentic workflow — and making that boundary visible, structured, and operable.',
    ],
  },
  {
    id: 'decision-d1',
    type: 'decision',
    d: 'D1',
    slug: 'd1',
    title: 'Agent Ownership Boundary',
    subtitle: 'Define what agents own before letting them act.',
    coreMove: 'I defined what agents own before letting them act.',
    gap:
      'Without ownership boundaries, agent autonomy scales noise, not efficiency. Teams keep monitoring everything because nothing is clearly owned.',
    move:
      'I separated execution into what agents can complete independently — reversible, low-risk actions — and what requires human judgment: irreversible actions, conflicting signals, low confidence, critical tradeoffs, and accountability moments.',
    layout: 'text-left-image-right',
    artifacts: [
      {
        type: 'image',
        src: manageAgentsDashboard,
        size: 'large',
        featured: true,
        alt: 'Manage Agents dashboard with execution status, progress, and intervention visibility',
        caption:
          'Agent operations dashboard: execution status, progress, and intervention visibility without forcing users to monitor every action.',
      },
      {
        type: 'image',
        src: agentDetailsModal,
        size: 'medium',
        alt: 'Agent Details modal showing scope and access boundaries at configuration',
        caption:
          'Agent scope and access boundaries are defined at configuration, not discovered during execution.',
      },
    ],
    outcome:
      'Agents could act without constant supervision because their execution boundaries were explicit.',
  },
  {
    id: 'decision-d2',
    type: 'decision',
    d: 'D2',
    slug: 'd2',
    featured: true,
    visualWeight: 'highest',
    title: 'Decision Gate Model',
    subtitle: 'Turn alerts from notifications into structured decision points.',
    coreMove: 'I turned alerts from notifications into structured decision points.',
    gap:
      'Alerts create more monitoring when they only report risk without explaining whether action is needed, what decision is required, or what happens next.',
    move:
      'I redesigned alerts as workflow gates: each alert had to explain why the workflow paused, what decision was required, what the agent recommended, and how execution could resume.',
    layout: 'coreMove-full-width-then-images',
    artifacts: [
      {
        type: 'image',
        src: agentOrchestrationSteps,
        size: 'large',
        featured: true,
        alt: 'Agent orchestration steps showing alerts as decision gates with required judgment',
        caption:
          'Alerts are redesigned as decision gates: why attention is needed, what decision is required, what the agent recommends, and how execution can continue.',
      },
    ],
    outcome:
      'Human attention moved from continuous monitoring to specific control points where intervention changed the outcome.',
  },
  {
    id: 'decision-d3',
    type: 'decision',
    d: 'D3',
    slug: 'd3',
    title: 'Orchestration Control Layer',
    subtitle: 'Connect agents, alerts, chat, and human intervention through orchestration state.',
    coreMove:
      'I made orchestration state the control layer between agents, alerts, chat, and human intervention.',
    gap:
      'When agent execution, alerts, chatbot, and dashboards exist as separate surfaces, users see activity but cannot understand who owns the next step or where to intervene.',
    move:
      'The orchestrator connected agent state, decision moments, intervention points, and conversational support, so people did not need to watch every step — they entered at the right moment with the right context.',
    implementationNote:
      'Conversational entry → Orchestrator state → Agent execution surface → Human intervention point',
    layout: 'text-left-image-right',
    artifacts: [
      {
        type: 'image',
        src: orchestratorAgentChat,
        size: 'large',
        featured: true,
        alt: 'Orchestrator chat delegating tasks with visible reasoning and decision moments',
        caption:
          'The orchestrator delegates tasks, makes reasoning visible, and surfaces decision moments — human intervention becomes structured, not reactive.',
      },
      {
        type: 'image',
        src: manageAgentsDashboard,
        size: 'medium',
        alt: 'Dashboard showing workflow state and intervention points in one control structure',
        caption:
          'The dashboard shows workflow state and intervention points as part of one control structure, not as separate monitoring surfaces.',
      },
    ],
    outcome:
      'The system shifted from parallel AI touchpoints to one orchestrated workflow with defined control transfer.',
  },
  {
    id: 'resulting-value',
    type: 'resulting-value',
    outcome:
      '→ Agentic systems scale only when execution and control are deliberately separated.',
  },
];
