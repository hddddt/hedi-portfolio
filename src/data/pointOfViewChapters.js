/** Section 04 — Point of View (four scroll beats) */

/**
 * @typedef {'label' | 'gravity' | 'origin' | 'setup' | 'core' | 'pair' | 'statement' | 'statementEmphasis' | 'practice' | 'boundary' | 'closingLead' | 'closingGravity'} PovLineRole
 */

/**
 * @typedef {{ role: PovLineRole, text: string, markers?: string }} PovLine
 */

/**
 * @typedef {{ type: 'next', title: string, hint?: string } | { type: 'continue', title: string, targetId: string }} PovPreview
 */

/**
 * @typedef {{ id: string, navLabel: string, preview: PovPreview | null, lines: PovLine[] }} PovBeat
 */

/** @type {PovBeat[]} */
export const povBeats = [
  {
    id: 'thesis-origin',
    navLabel: 'Point of View',
    preview: {
      type: 'next',
      title: 'What I saw',
      hint: 'It was unowned responsibility.',
    },
    lines: [
      { role: 'gravity', text: 'AI changes what products are responsible for.', markers: '1 2' },
      {
        role: 'origin',
        text: 'I learned to see AI through enterprise workflows, where capability was never the same as completion.',
      },
    ],
  },
  {
    id: 'saw',
    navLabel: 'What I saw',
    preview: {
      type: 'next',
      title: 'What I believe',
      hint: 'Human judgment is not a backup layer for AI.',
    },
    lines: [
      { role: 'setup', text: 'The gap was never interface complexity.' },
      { role: 'core', text: 'It was unowned responsibility.', markers: '1 3 4' },
      { role: 'pair', text: 'outputs without sources' },
      { role: 'pair', text: 'decisions without states' },
      { role: 'pair', text: 'failures without recovery paths' },
    ],
  },
  {
    id: 'believe',
    navLabel: 'What I believe',
    preview: {
      type: 'next',
      title: 'What I design',
      hint: 'Completion is not an output.',
    },
    lines: [
      { role: 'statement', text: 'Human judgment is not a backup layer for AI.' },
      { role: 'statementEmphasis', text: 'It is part of the product architecture.', markers: '3 4' },
    ],
  },
  {
    id: 'design-close',
    navLabel: 'What I design',
    preview: {
      type: 'continue',
      title: 'Life Archive',
      targetId: 'home-life-archive',
    },
    lines: [
      { role: 'practice', text: 'I design the operating boundaries of AI products.', markers: '1 2 3 4' },
      { role: 'boundary', text: 'where AI belongs' },
      { role: 'boundary', text: 'what it can own' },
      { role: 'boundary', text: 'when it must stop' },
      { role: 'boundary', text: 'how humans intervene' },
      { role: 'boundary', text: 'how work continues after the output' },
      { role: 'closingLead', text: 'Completion is not an output.' },
      { role: 'closingGravity', text: 'It is a responsibility structure.' },
    ],
  },
];
