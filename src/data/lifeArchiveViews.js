import { lifePhotoMetadata } from './lifePhotoMetadata.js';

/** @typedef {'what_she_notices' | 'what_she_is_drawn_to' | 'how_she_sees_systems' | 'how_she_holds_presence'} ViewId */

export const LIFE_ARCHIVE_COPY = {
  title: 'Kept in view',
  subtitle: '50 fragments from last year',
  meta: '50 images · one year',
  aiPrompt:
    'There are different ways to look at this archive.\nWhich view do you want to enter?',
  changeView: 'Choose another view',
  backToStream: 'Back to the full stream',
  photoDetailClose: 'Close',
  detailLabel: 'Reflection',
  noteLabel: 'Note',
};

export const LIFE_ARCHIVE_VIEWS = [
  {
    id: 'what_she_notices',
    label: 'What she notices',
    description:
      'Edges, contrasts, and small shifts in ordinary scenes — what catches attention before it has a name.',
    characterReading:
      'Hedi’s eye lands on difference: a form against another form, a gesture about to happen, light changing the read of a room. The archive is full of moments where something is slightly out of place or about to change — not drama, but alertness.',
    designEcho:
      'In product work this shows up as sensitivity to state change, empty moments, and thresholds — designing for what people notice before they can articulate it.',
  },
  {
    id: 'what_she_is_drawn_to',
    label: 'What she is drawn to',
    description:
      'Presence, strangeness, tenderness, and visual charge — images that feel magnetized rather than merely documented.',
    characterReading:
      'She collects scenes with pull: animals mid-pause, food as ritual, characters in the street, color that feels intentional. The draw is aesthetic and emotional without becoming sentimental — curiosity with taste.',
    designEcho:
      'That pull translates to knowing where to place emphasis in an interface: what deserves weight, what should stay quiet, and when delight is earned rather than decorative.',
  },
  {
    id: 'how_she_sees_systems',
    label: 'How she sees systems',
    description:
      'Rhythm, infrastructure, rooms, and flows — environments that already behave like organized systems.',
    characterReading:
      'Repeatedly, the camera finds grids, facades, exhibition logic, meeting rooms, and tools that imply coordination. She reads places as structures doing work — legibility before expression.',
    designEcho:
      'For complex products, this is instinct for scaffolding: navigation, roles, handoffs, and operational clarity under load — making systems feel trustworthy before they feel clever.',
  },
  {
    id: 'how_she_holds_presence',
    label: 'How she holds presence',
    description:
      'Material, body, food, and creature — attention anchored in the physical world.',
    characterReading:
      'Texture, fur, ceramic, shared meals, marine forms, snow figures: the archive grounds abstraction in what can be touched, eaten, or cared for. Even digital experiments are photographed as embodied contact.',
    designEcho:
      'It keeps enterprise and AI work humane — timing, friction, and finish that respect bodily rhythm rather than treating users as disembodied tasks.',
  },
];

const CLUSTER_TO_VIEWS = {
  architecture_spatial_observation: ['what_she_notices', 'how_she_sees_systems'],
  art_exhibition_visual_culture: ['what_she_notices', 'what_she_is_drawn_to'],
  ai_interaction_experiments: ['what_she_notices', 'how_she_sees_systems'],
  small_beings_urban_finds: ['what_she_is_drawn_to', 'how_she_holds_presence'],
  animal_presence: ['what_she_is_drawn_to', 'how_she_holds_presence'],
  food_ritual_sensory_memory: ['how_she_holds_presence', 'what_she_is_drawn_to'],
  strange_nature_edge: ['what_she_notices', 'what_she_is_drawn_to'],
  human_scene_creative_work: ['what_she_notices', 'how_she_sees_systems'],
};

const STREAM_LAYOUT_CYCLE = [
  { rotate: -2.8, y: 0, scale: 1 },
  { rotate: 1.6, y: -10, scale: 1.05 },
  { rotate: -1.2, y: 8, scale: 0.96 },
  { rotate: 2.4, y: -6, scale: 1.03 },
  { rotate: -1.8, y: 12, scale: 0.98 },
  { rotate: 0.9, y: -8, scale: 1.06 },
  { rotate: -2.1, y: 4, scale: 1 },
  { rotate: 1.3, y: -12, scale: 1.04 },
];

/** @param {number} index */
export function getStreamCardLayout(index) {
  const L = STREAM_LAYOUT_CYCLE[index % STREAM_LAYOUT_CYCLE.length];
  return {
    rotate: L.rotate,
    y: L.y,
    scale: L.scale,
    z: index + 1,
  };
}

/** @param {number} index @param {number} total */
export function getFocusCardLayout(index, total) {
  const mid = (total - 1) / 2;
  const offset = index - mid;
  return {
    rotate: offset * 2.2,
    x: offset * 28,
    y: Math.abs(offset) * 6,
    z: index + 1,
    scale: 1.08 - Math.abs(offset) * 0.03,
  };
}

function buildArchivePhoto(meta) {
  const views = CLUSTER_TO_VIEWS[meta.cluster] ?? ['what_she_notices'];
  const note = meta.personalMeaning?.trim() || meta.userContext?.trim() || '';
  const detail =
    [meta.visualSummary, meta.userContext].filter(Boolean).join(' ').trim() || note;

  return {
    id: meta.id,
    src: meta.imageSrc,
    alt: meta.title || 'Archive photograph',
    views,
    note,
    detail,
    title: meta.title,
  };
}

export const LIFE_ARCHIVE_PHOTOS = lifePhotoMetadata.map(buildArchivePhoto);

export function getArchiveView(id) {
  return LIFE_ARCHIVE_VIEWS.find((v) => v.id === id) ?? null;
}

export function getPhotosForView(viewId) {
  if (!viewId) return [];
  return LIFE_ARCHIVE_PHOTOS.filter((p) => p.views.includes(viewId));
}

export function getArchivePhotoById(id) {
  return LIFE_ARCHIVE_PHOTOS.find((p) => p.id === id) ?? null;
}
