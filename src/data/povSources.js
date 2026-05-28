/** Section 04 — bibliographic sources (short citation + optional detail) */

/** @typedef {{ id: string, citation: string, detail: string }} PovSource */

/** @type {PovSource[]} */
export const POV_SOURCES = [
  {
    id: '1',
    citation: 'Amershi et al., CHI 2019',
    detail:
      'Guidelines for Human-AI Interaction — supports defining AI behavior across initial use, regular use, failure, feedback, and long-term interaction.',
  },
  {
    id: '2',
    citation: 'Google PAIR People + AI Guidebook',
    detail:
      'Frames Human-AI interaction as a bidirectional feedback loop shaped by user mental models, feedback, and adaptation.',
  },
  {
    id: '3',
    citation: 'NIST AI RMF 1.0',
    detail:
      'Artificial Intelligence Risk Management Framework — documentation, human review, transparency, accountability, and operational risk management.',
  },
  {
    id: '4',
    citation: 'EU Ethics Guidelines for Trustworthy AI',
    detail:
      'High-Level Expert Group on AI — human agency and oversight, transparency, and accountability.',
  },
];

const SUPERSCRIPT = {
  '1': '\u00B9',
  '2': '\u00B2',
  '3': '\u00B3',
  '4': '\u2074',
  '5': '\u2075',
  '6': '\u2076',
  '7': '\u2077',
  '8': '\u2078',
  '9': '\u2079',
};

/** @param {string | undefined} markers Space-separated source ids, e.g. "1 2" */
export function formatPovMarkers(markers) {
  if (!markers) return '';
  return markers
    .trim()
    .split(/\s+/)
    .map((id) => SUPERSCRIPT[id] ?? id)
    .join('\u2009');
}
