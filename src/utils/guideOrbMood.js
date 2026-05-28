/** @typedef {'neutral'|'warm'|'playful'|'calm'|'uncanny'|'experimental'|'stark'|'sensory'} GuideOrbMood */

const MOOD_RULES = [
  { mood: 'sensory', match: ['sensory', 'vivid', 'direct', 'visceral'] },
  { mood: 'stark', match: ['stark', 'distant', 'melancholic'] },
  { mood: 'uncanny', match: ['uncanny', 'strange', 'raw'] },
  { mood: 'warm', match: ['warm', 'familial', 'grounded'] },
  { mood: 'experimental', match: ['experimental', 'curious', 'magical'] },
  { mood: 'playful', match: ['playful', 'tender'] },
  { mood: 'calm', match: ['calm', 'quiet', 'observational'] },
];

function normTone(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function toneMatches(tones, key) {
  return tones.some((t) => t === key || t.includes(key) || key.includes(t));
}

/**
 * Map photo emotionalTone tags to guide character mood.
 * @param {string[] | undefined} emotionalTone
 * @returns {GuideOrbMood}
 */
export function resolveGuideOrbMood(emotionalTone) {
  if (!emotionalTone?.length) return 'neutral';
  const tones = emotionalTone.map(normTone).filter(Boolean);
  if (!tones.length) return 'neutral';

  for (const rule of MOOD_RULES) {
    if (rule.match.some((key) => toneMatches(tones, key))) {
      return /** @type {GuideOrbMood} */ (rule.mood);
    }
  }
  return 'neutral';
}
