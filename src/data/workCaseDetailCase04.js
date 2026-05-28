/**
 * Case 04 — AI Companion (D1 / D2 / D3 staged flow).
 */

export const CASE04_FLOW = [
  {
    id: 'intro',
    type: 'case-intro',
    metadataStrip: {
      lead: 'AI companion product, one engagement shift:',
      body: 'return behavior came from continuity, not interaction density.',
    },
    caseThesis: ['More interaction was not the missing piece.', 'Continuity was.'],
    caseThesisSupport:
      'The companion became stronger when the experience carried presence forward instead of asking users to restart the relationship every session.',
  },
  {
    id: 'scope',
    type: 'scope-clarification',
    paragraphs: [
      'The work was not about adding more avatar behavior, environment detail, chat prompts, or explicit actions.',
      'The real design problem was defining what makes an AI companion worth returning to when there is not much to do: persistent presence, low-friction re-entry, and accumulated companion state.',
    ],
  },
  {
    id: 'decision-overview',
    type: 'decision-overview',
    columns: [
      {
        num: 'D1',
        title: 'Engagement Signal Reframing',
        text: 'Separate visible interaction from actual return behavior.',
      },
      {
        num: 'D2',
        title: 'Presence Layer Redefinition',
        text: 'Make persistent presence the core layer instead of environment, avatar, or chat density.',
      },
      {
        num: 'D3',
        title: 'Continuity-Driven Return Loop',
        text: 'Redesign the engagement loop from interaction-triggered to continuity-driven.',
      },
    ],
  },
  {
    id: 'decision-d1',
    type: 'decision',
    d: 'D1',
    slug: 'd1',
    title: 'Engagement Signal Reframing',
    subtitle: 'Separate visible interaction from actual return behavior.',
    coreMove: 'I separated visible interaction from actual return behavior.',
    gap:
      'A companion product can create many things to do while still failing to create a reason to return.',
    move:
      'I treated reduced visible interaction as a behavioral signal, not a product weakness, and reframed engagement around return behavior rather than interaction volume.',
    evidence: [
      {
        title: 'Old engagement assumption',
        whatToShow:
          'More environment + more avatar + more chat → expected stronger engagement.',
        caption:
          'The original model assumed that more visible interaction would create stronger engagement.',
      },
      {
        title: 'Behavior signal',
        whatToShow:
          'Reduced visible interaction → engagement did not collapse → return signal remained.',
        caption:
          'Reduced interaction did not weaken the return signal, which challenged the original engagement assumption.',
      },
    ],
    outcome:
      'Engagement was evaluated through continuity and return behavior, not only interaction volume.',
  },
  {
    id: 'decision-d2',
    type: 'decision',
    d: 'D2',
    slug: 'd2',
    featured: true,
    title: 'Presence Layer Redefinition',
    subtitle:
      'Make persistent presence the core layer instead of environment, avatar, or chat density.',
    coreMove:
      'I made persistent presence the core layer instead of environment, avatar, or chat density.',
    gap:
      'If every visit starts from explicit action, the companion relationship feels like a session to operate, not a presence to return to.',
    move:
      'I demoted environment, avatar, and explicit interaction into supporting layers, and made presence / continuity / return the core hierarchy of the companion experience.',
    evidence: [
      {
        title: 'Feature hierarchy shift',
        before: {
          core: 'Environment / avatar / chat',
          supporting: 'Continuity',
        },
        after: {
          core: 'Presence / continuity / return',
          supporting: 'Environment / avatar / chat',
        },
        caption:
          'Visible interaction became a supporting layer; continuity became the core product logic.',
      },
    ],
    outcome:
      'The product became lighter and more return-oriented without losing the companion relationship.',
  },
  {
    id: 'decision-d3',
    type: 'decision',
    d: 'D3',
    slug: 'd3',
    title: 'Continuity-Driven Return Loop',
    subtitle: 'Redesign the engagement loop from interaction-triggered to continuity-driven.',
    coreMove: 'I redesigned the engagement loop from interaction-triggered to continuity-driven.',
    gap: 'Session-based interaction resets the relationship every time users leave and return.',
    move:
      'I shifted the loop from feature → interaction → response → session ends to presence → recognition → low-friction return → continuity accumulation.',
    evidence: [
      {
        title: 'New engagement loop',
        whatToShow:
          'Presence → recognition → low-friction return → continuity accumulation.',
        caption: 'The engagement loop moved from interaction-triggered to continuity-driven.',
      },
      {
        title: 'Accumulated companion state',
        whatToShow: 'The companion carries something forward instead of restarting from zero.',
        caption: 'Engagement accumulated instead of resetting.',
      },
    ],
    outcome: 'The product became something users return to, not just something users operate.',
  },
];
