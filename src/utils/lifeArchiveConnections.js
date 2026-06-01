import { lifePhotoMetadata } from '../data/lifePhotoMetadata.js';

/** @typedef {'category' | 'feeling' | 'unexpected'} ConnectionLensKey */

/**
 * @typedef {object} ConnectionLensTab
 * @property {ConnectionLensKey} key
 * @property {string} label
 * @property {number} count
 * @property {string} insight
 */

/**
 * @typedef {object} ConnectionFragmentCard
 * @property {string} id
 * @property {string} title
 * @property {string} microCaption
 * @property {string} imageSrc
 */

const CLUSTER_META = {
  art_exhibition_visual_culture: {
    categoryTab: 'More exhibitions',
    categoryInsight: 'Objects, bodies, and light staged inside institutional space.',
    feelingInsight: 'Things held slightly apart from ordinary use.',
    unexpectedInsight:
      'Different subjects, same pull: a body, object, or glow held in attention.',
  },
  animal_presence: {
    categoryTab: 'More animals',
    categoryInsight: 'Calm presences that meet the eye without performance.',
    feelingInsight: 'Warmth, stillness, or openness held in a small frame.',
    unexpectedInsight: 'Not the species — the quiet atmosphere around them.',
  },
  food_ritual_sensory_memory: {
    categoryTab: 'More food moments',
    categoryInsight: 'Taste, ritual, and return gathered on a plate.',
    feelingInsight: 'Home and memory carried through texture and color.',
    unexpectedInsight: 'Food as light, form, or ceremony in disguise.',
  },
  architecture_spatial_observation: {
    categoryTab: 'More city fragments',
    categoryInsight: 'Facades, contrast, and how the city organizes attention.',
    feelingInsight: 'Distance, structure, and atmosphere at street level.',
    unexpectedInsight: 'Buildings that feel like objects under a spotlight.',
  },
  small_beings_urban_finds: {
    categoryTab: 'More objects',
    categoryInsight: 'Small designed presences dropped into ordinary streets.',
    feelingInsight: 'Charm, tenderness, or oddness in a passing glance.',
    unexpectedInsight: 'Objects that borrow the energy of a living thing.',
  },
  strange_nature_edge: {
    categoryTab: 'More edge moments',
    categoryInsight: 'Nature when it turns bright, raw, or slightly unreal.',
    feelingInsight: 'Wide air, elemental color, and alert stillness.',
    unexpectedInsight: 'Landscape as stage — scale without explanation.',
  },
  ai_interaction_experiments: {
    categoryTab: 'More encounters',
    categoryInsight: 'Hands, screens, and prototypes in first contact.',
    feelingInsight: 'Curiosity held lightly at the threshold of machines.',
    unexpectedInsight: 'Technology read through glow, gesture, or ritual.',
  },
  human_scene_creative_work: {
    categoryTab: 'More human moments',
    categoryInsight: 'People inside exchange, work, and shared focus.',
    feelingInsight: 'Collaboration as a visible temperature in the room.',
    unexpectedInsight: 'Crowds and objects sharing the same attentive pause.',
  },
};

const LIGHT_CLUSTERS = new Set([
  'art_exhibition_visual_culture',
  'strange_nature_edge',
]);

const VISUAL_PULL_WORDS = [
  'light',
  'glow',
  'suspension',
  'suspended',
  'body',
  'scale',
  'staged',
  'still',
  'texture',
  'warm',
  'attention',
  'installation',
  'museum',
  'hanging',
  'reflection',
  'neon',
  'form',
  'object',
  'presence',
  'atmospheric',
];

/** Curated fallbacks for stronger editorial sets */
const RELATED_OVERRIDES = {
  life_06: {
    category: ['life_03', 'life_19', 'life_20', 'life_44', 'life_12'],
    feeling: ['life_03', 'life_20', 'life_44', 'life_22'],
    unexpected: ['life_02', 'life_09', 'life_27', 'life_35', 'life_04'],
  },
};

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function toneSet(photo) {
  return new Set((photo?.emotionalTone ?? []).map(norm).filter(Boolean));
}

function toneOverlap(a, b) {
  const tb = toneSet(b);
  let n = 0;
  toneSet(a).forEach((t) => {
    if (tb.has(t)) n += 1;
  });
  return n;
}

function textBlob(photo) {
  return norm(
    [
      photo.title,
      photo.attentionType,
      ...(photo.motifs ?? []),
      photo.visualSummary,
    ].join(' '),
  );
}

function visualPullScore(selected, candidate) {
  if (candidate.id === selected.id) return -1;
  if (candidate.cluster === selected.cluster) return 0;
  const blob = textBlob(candidate);
  let score = toneOverlap(selected, candidate) * 2;
  VISUAL_PULL_WORDS.forEach((w) => {
    if (blob.includes(w)) score += 1;
  });
  const selBlob = textBlob(selected);
  VISUAL_PULL_WORDS.forEach((w) => {
    if (selBlob.includes(w) && blob.includes(w)) score += 2;
  });
  return score;
}

/**
 * @param {typeof lifePhotoMetadata[number]} photo
 */
export function getMicroCaption(photo) {
  if (photo?.microCaption) return photo.microCaption;
  const raw = photo?.attentionType || '';
  const primary = raw.split('/')[0].trim().toLowerCase();
  const words = primary.split(/\s+/).filter(Boolean).slice(0, 4);
  if (words.length >= 2) return words.join(' ');
  const motif = photo?.motifs?.[0];
  if (motif) {
    return motif
      .toLowerCase()
      .split(/\s+/)
      .slice(0, 4)
      .join(' ');
  }
  return 'archive moment';
}

/**
 * @param {typeof lifePhotoMetadata[number]} photo
 */
export function getFragmentCategory(photo) {
  if (photo?.category) return photo.category;
  return photo?.cluster ?? 'default';
}

/**
 * @param {typeof lifePhotoMetadata[number]} photo
 */
function clusterMeta(photo) {
  return CLUSTER_META[photo?.cluster] ?? CLUSTER_META.art_exhibition_visual_culture;
}

/**
 * @param {typeof lifePhotoMetadata[number]} photo
 */
export function getCategoryTabLabel(photo) {
  const meta = clusterMeta(photo);
  if (LIGHT_CLUSTERS.has(photo.cluster) && photo.attentionType?.toLowerCase().includes('light')) {
    return 'More light moments';
  }
  return meta.categoryTab;
}

function resolveIds(photo, lensKey, all) {
  const override = RELATED_OVERRIDES[photo.id]?.[lensKey];
  if (override?.length) {
    return override.filter((id) => id !== photo.id && all.some((p) => p.id === id));
  }

  if (lensKey === 'category') {
    return all
      .filter((p) => p.cluster === photo.cluster && p.id !== photo.id)
      .map((p) => p.id);
  }

  if (lensKey === 'feeling') {
    return all
      .filter((p) => p.id !== photo.id && toneOverlap(photo, p) >= 1)
      .sort((a, b) => toneOverlap(photo, b) - toneOverlap(photo, a))
      .map((p) => p.id);
  }

  return all
    .filter((p) => p.id !== photo.id && p.cluster !== photo.cluster)
    .sort((a, b) => visualPullScore(photo, b) - visualPullScore(photo, a))
    .map((p) => p.id);
}

/**
 * @param {string} photoId
 * @param {ConnectionLensKey} activeLens
 * @param {typeof lifePhotoMetadata} [allPhotos]
 */
export function buildConnectionView(photoId, activeLens = 'category', allPhotos = lifePhotoMetadata) {
  const photo = allPhotos.find((p) => p.id === photoId) ?? null;
  if (!photo) {
    return { anchor: null, lenses: [], related: [], activeInsight: '' };
  }

  const meta = clusterMeta(photo);
  const categoryIds = resolveIds(photo, 'category', allPhotos);
  const feelingIds = resolveIds(photo, 'feeling', allPhotos);
  const unexpectedIds = resolveIds(photo, 'unexpected', allPhotos);

  const lenses = /** @type {ConnectionLensTab[]} */ ([
    {
      key: 'category',
      label: getCategoryTabLabel(photo),
      count: categoryIds.length,
      insight: meta.categoryInsight,
    },
    {
      key: 'feeling',
      label: 'Same feeling',
      count: feelingIds.length,
      insight: meta.feelingInsight,
    },
    {
      key: 'unexpected',
      label: 'Unexpected link',
      count: unexpectedIds.length,
      insight: meta.unexpectedInsight,
    },
  ]);

  const lensMap = {
    category: categoryIds,
    feeling: feelingIds,
    unexpected: unexpectedIds,
  };

  const activeIds = (lensMap[activeLens] ?? categoryIds).slice(0, 5);
  const activeLensMeta = lenses.find((l) => l.key === activeLens) ?? lenses[0];

  const related = activeIds
    .map((id) => allPhotos.find((p) => p.id === id))
    .filter(Boolean)
    .map((p) => ({
      id: p.id,
      title: p.title,
      microCaption: getMicroCaption(p),
      imageSrc: p.imageSrc,
    }));

  return {
    anchor: {
      id: photo.id,
      title: photo.title,
      microCaption: getMicroCaption(photo),
      imageSrc: photo.imageSrc,
      category: getFragmentCategory(photo),
      feelings: photo.emotionalTone ?? [],
    },
    lenses,
    related,
    activeInsight: activeLensMeta?.insight ?? '',
  };
}
