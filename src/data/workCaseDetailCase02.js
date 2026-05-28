/**
 * Case 02 — Contract Intelligence (D1 / D2 / D3 staged flow).
 */

import contractExcelleratorHero from '../assets/case02/contract-excellerator-hero.png';
import contractReviewAnswerStates from '../assets/case02/contract-review-answer-states.png';
import contractReviewSourceReferences from '../assets/case02/contract-review-source-references.png';

export const CASE02_HERO_SCREEN = {
  type: 'image',
  title: 'Contract Excellerator — Risk Summary & Topics',
  src: contractExcelleratorHero,
  alt: 'Contract Excellerator with contract preview, overall risk summary, BRC topic counts, and topic cards showing AI-generated vs You edited states',
  featured: true,
  caption:
    'The primary review surface: contract text on the left, Risk Summary and Topics on the right—overall assessment, BRC-level signals, and per-topic cards where + AI generated and You edited stay visible before answers go deeper.',
};

export const CASE02_HERO_EVIDENCE = {
  title: 'Answer state model',
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
};

const COLLAB_MATRIX = {
  headers: ['Review Step', 'AI Role', 'Human Role', 'Status Meaning'],
  rows: [
    ['Clause review', 'Retrieve relevant clause', 'Check relevance', 'Informational'],
    ['Question answer', 'Suggest classification', 'Edit or confirm', 'Review in progress'],
    ['Risk assessment', 'Aggregate signals', 'Validate judgment', 'Confirmed decision'],
  ],
};

export const CASE02_FLOW = [
  {
    id: 'intro',
    type: 'intro',
    metadataStrip: {
      lead: 'AI-assisted contract review, one structural risk:',
      body: 'analysis was generated, but judgment needed to stay traceable.',
    },
    caseThesis: [
      'The AI could surface the risk.',
      'The workflow still had to prove who judged it, why, and from what source.',
    ],
    scopeParagraphs: [
      'The work was not only about showing AI-generated answers, summaries, or risk scores.',
      'The real design scope was separating AI analysis from human judgment, preserving source provenance, and turning each review answer into a confirmable decision record.',
    ],
    heroArtifact: CASE02_HERO_SCREEN,
  },
  {
    id: 'decision-overview',
    type: 'decision-overview',
    columns: [
      {
        num: 'D1',
        title: 'Review Context Framing',
        text: 'Make contract context explicit before AI judgment enters the workflow.',
      },
      {
        num: 'D2',
        title: 'Decision State Architecture',
        text: 'Separate AI insight, human edits, and confirmed judgment into explicit states.',
      },
      {
        num: 'D3',
        title: 'Provenance & Auditability Layer',
        text: 'Turn each review answer into an auditable decision record.',
      },
    ],
  },
  {
    id: 'decision-d1',
    type: 'decision',
    d: 'D1',
    slug: 'd1',
    title: 'Review Context Framing',
    subtitle: 'Make contract context explicit before AI judgment enters the workflow.',
    coreMove: 'I made contract context explicit before AI judgment entered the workflow.',
    aiProblem:
      'AI contract review can flag clauses and risks, but the meaning of an answer changes by document type, project context, party role, and review use case.',
    solution:
      'I structured the review setup around document type, project information, parties, and use-case mapping so AI output could be interpreted inside the right contract context.',
    evidenceNotes: [
      'Document setup / review context',
      'Project and use-case mapping',
      'See case hero — Risk Summary & Topics workspace',
    ],
    outcome:
      'AI analysis became grounded in review context instead of appearing as a generic answer.',
  },
  {
    id: 'decision-d2',
    type: 'decision',
    d: 'D2',
    slug: 'd2',
    featured: true,
    title: 'Decision State Architecture',
    subtitle:
      'Separate AI-generated analysis, human modification, and confirmed legal judgment into explicit states.',
    coreMove:
      'I separated AI-generated analysis, human modification, and confirmed legal judgment into explicit states.',
    aiProblem:
      'When AI output, reviewer edits, and final answers live in the same editable field, the workflow loses who said what and whether the judgment is still provisional or final.',
    solution:
      'I designed answer states — AI-generated, user-modified, and confirmed — so each review item could move from suggestion to owned decision.',
    heroEvidence: CASE02_HERO_EVIDENCE,
    artifacts: [
      {
        type: 'image',
        title: 'Topic review — answer states in context',
        src: contractReviewAnswerStates,
        alt: 'Contract topic review showing AI-generated summary, You edited and AI-generated question cards, and YES/NO classification',
        featured: true,
        caption:
          'Topic-level AI summary, subcategory progress, and per-question cards: + AI generated vs You edited, classification badges, and desired outcome (e.g. Desired YES) stay visible in one review surface.',
      },
    ],
    evidenceNotes: ['Review item anatomy', 'Source-linked answer field'],
    outcome:
      'Reviewers could distinguish AI insight from human judgment and know when an answer became a confirmed decision.',
  },
  {
    id: 'decision-d3',
    type: 'decision',
    d: 'D3',
    slug: 'd3',
    title: 'Provenance & Auditability Layer',
    subtitle: 'Turn each review answer into an auditable decision record.',
    coreMove: 'I turned each review answer into an auditable decision record.',
    aiProblem:
      'A contract answer is not enough if reviewers cannot trace the source, understand the reasoning, or reconstruct why the final judgment was accepted.',
    solution:
      'I connected classification, reasoning, source references, and confirmation status into one reviewable answer structure.',
    artifacts: [
      {
        type: 'image',
        title: 'References — source-linked review output',
        src: contractReviewSourceReferences,
        alt: 'Contract review question with linked reference cards citing contract sections and pages',
        caption:
          'Each judgment stays tied to contract sections and page anchors—reviewers can trace the answer back to highlighted source text, not only the AI narrative.',
      },
    ],
    evidenceNotes: ['Confirmed answer state', 'Audit-ready review output'],
    table: {
      title: 'Human-AI collaboration matrix',
      ...COLLAB_MATRIX,
      caption: 'Each AI contribution was mapped to a human review responsibility.',
    },
    outcome:
      'The workflow preserved not only the answer, but the reasoning and source boundary behind the answer.',
  },
];
