/** Short guide replies for the portfolio orb input (no external API). */

const DEFAULT_REPLY =
  'Ask about AI workflow, role fit, human control, traceability, complex requirements, or open 03 · Work.';

export function getPortfolioGuideReply(query) {
  const q = query.trim().toLowerCase();
  if (!q) return '';

  if (/contact|email|linkedin|reach|hire/.test(q)) {
    return 'Scroll to the end of 05 · Life Archive — contact links are there.';
  }
  if (/work|case|project|enterprise|ai work|portfolio/.test(q)) {
    return '03 · Work is the place for systems she has shaped — workflows, agents, and governance.';
  }
  if (/think|belief|point of view|philosophy|why|approach/.test(q)) {
    return '04 · Point of View walks through what she believes and how she designs.';
  }
  if (/life|world|photo|archive|beyond|personal|who is/.test(q)) {
    return '05 · Life Archive is her way of seeing — pick a view and explore the fragments.';
  }
  if (/capabilit|what i structure|skill|framing|requirement|product logic/.test(q)) {
    return '02 · What I structure maps how she turns complexity into product logic — start at requirements → product logic.';
  }
  if (/traceability|audit|reviewable/.test(q)) {
    return 'Try Contract Intelligence or From decisions to traceable systems in What I structure.';
  }
  if (/human.?in.?the.?loop|human control|intervention/.test(q)) {
    return 'Try Supply Chain Agents or From automation to human control in What I structure.';
  }
  if (/beyond ui|not just ui|screen only/.test(q)) {
    return 'Ask Portfolio Shortcut: what shows she works beyond UI screens?';
  }
  if (/hello|hi|hey/.test(q)) {
    return 'Use a guided route, ask a focused question, or jump to a case.';
  }

  return DEFAULT_REPLY;
}
