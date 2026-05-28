/** Short guide replies for the portfolio orb input (no external API). */

const DEFAULT_REPLY =
  'I can point you to a section — try 03 · Work, 04 · Point of View, or 05 · Life Archive.';

export function getPortfolioGuideReply(query) {
  const q = query.trim().toLowerCase();
  if (!q) return '';

  if (/contact|email|linkedin|reach|hire/.test(q)) {
    return 'Scroll to the end of 05 · Life Archive — contact links are there.';
  }
  if (/work|case|project|enterprise|ai work|portfolio/.test(q)) {
    return '03 · Work is the place for systems she has shaped — flows, agents, and governance.';
  }
  if (/think|belief|point of view|philosophy|why|approach/.test(q)) {
    return '04 · Point of View walks through what she believes and how she designs.';
  }
  if (/life|world|photo|archive|beyond|personal|who is/.test(q)) {
    return '05 · Life Archive is her way of seeing — pick a view and explore the fragments.';
  }
  if (/capabilit|skill|framing|experience design/.test(q)) {
    return '02 · Capabilities maps how she frames products — start at Product Framing.';
  }
  if (/hello|hi|hey/.test(q)) {
    return 'Hi. Pick a path above, or ask about work, thinking, or her world.';
  }

  return DEFAULT_REPLY;
}
