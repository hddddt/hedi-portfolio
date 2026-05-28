import { lifePhotoClusters } from '../../data/lifePhotoClusters.js';
import { lifePhotoMetadata } from '../../data/lifePhotoMetadata.js';
import { getPhotoById } from '../../utils/lifeArchiveIndex.js';

/** Preset questions for the interpretive panel */
export const LIFE_ARCHIVE_QUESTIONS = [
  { id: 'what_did_you_keep_noticing', label: 'What did you keep noticing?' },
  { id: 'where_did_the_year_move', label: 'Where did the year move?' },
  { id: 'what_kind_of_moments', label: 'What kind of moments did you collect?' },
  {
    id: 'what_connects_work_travel_everyday',
    label: 'What connects work, travel, and everyday life?',
  },
];

const photoById = Object.fromEntries(lifePhotoMetadata.map((p) => [p.id, p]));

const QUESTION_RESULTS = {
  what_did_you_keep_noticing: {
    label: 'What did you keep noticing?',
    clusterIds: [
      'architecture_spatial_observation',
      'small_beings_urban_finds',
      'animal_presence',
      'food_ritual_sensory_memory',
      'strange_nature_edge',
    ],
    interpretation:
      'You kept returning to moments where ordinary things started to carry a signal. Buildings were not just buildings; they appeared through contrast, geometry, scale, and atmosphere. Small creatures, street marks, animals, food, and volcanic landscapes kept showing up as presences rather than objects. The archive suggests a way of seeing that looks for structure, aliveness, and slight displacement inside everyday scenes.',
    photoIds: [
      'life_01',
      'life_04',
      'life_05',
      'life_09',
      'life_13',
      'life_15',
      'life_21',
      'life_31',
      'life_35',
      'life_42',
    ],
  },
  where_did_the_year_move: {
    label: 'Where did the year move?',
    clusterIds: [
      'architecture_spatial_observation',
      'art_exhibition_visual_culture',
      'strange_nature_edge',
      'food_ritual_sensory_memory',
      'human_scene_creative_work',
    ],
    interpretation:
      'The year moved between work cities, exhibitions, travel landscapes, family rituals, and professional rooms. It moves from Berlin office architecture and AI-related installations to Xi’an New Year food, Lanzarote volcanic edges, Paris creative work, and women-in-tech events. The movement is not only geographic. It shows a shift between systems, bodies, places, and moments where attention becomes anchored.',
    photoIds: [
      'life_01',
      'life_03',
      'life_07',
      'life_12',
      'life_14',
      'life_16',
      'life_27',
      'life_30',
      'life_41',
      'life_45',
    ],
  },
  what_kind_of_moments: {
    label: 'What kind of moments did you collect?',
    clusterIds: [
      'small_beings_urban_finds',
      'animal_presence',
      'food_ritual_sensory_memory',
      'art_exhibition_visual_culture',
    ],
    interpretation:
      'You collected moments where something small, strange, designed, or alive interrupted the surface of the day. A snowman, a blue cat, a robbed marshmallow, a calm pigeon, a white deer, a fish dish, and a spider sculpture all become signals in the same archive. These are not conventional highlights. They are moments where attention stopped because something felt charged, misplaced, tender, symbolic, or visually precise.',
    photoIds: [
      'life_04',
      'life_13',
      'life_15',
      'life_17',
      'life_20',
      'life_23',
      'life_31',
      'life_33',
      'life_35',
      'life_48',
    ],
  },
  what_connects_work_travel_everyday: {
    label: 'What connects work, travel, and everyday life?',
    clusterIds: [
      'ai_interaction_experiments',
      'architecture_spatial_observation',
      'human_scene_creative_work',
      'art_exhibition_visual_culture',
      'small_beings_urban_finds',
    ],
    interpretation:
      'What connects them is not topic, but pattern recognition. In work, you notice interaction, systems, and community; in travel, you notice architecture, exhibitions, and strange landscapes; in everyday life, you notice small beings and visual interventions. The archive makes the same habit visible across contexts: you read environments for signals, boundaries, atmospheres, and hidden structures.',
    photoIds: [
      'life_02',
      'life_12',
      'life_14',
      'life_16',
      'life_22',
      'life_24',
      'life_28',
      'life_30',
      'life_43',
      'life_49',
    ],
  },
};

const CLUSTER_SHORT_LABELS = {
  architecture_spatial_observation: 'architecture',
  art_exhibition_visual_culture: 'exhibition & visual culture',
  ai_interaction_experiments: 'AI interaction',
  small_beings_urban_finds: 'small beings',
  animal_presence: 'animal presence',
  food_ritual_sensory_memory: 'food rituals',
  strange_nature_edge: 'strange nature',
  human_scene_creative_work: 'human creative work',
};

/**
 * Local metadata interpreter — deterministic, no API.
 * Replace this function (or this module) when wiring an external model.
 *
 * @param {string} questionId
 * @returns {{ interpretation: string, photoIds: string[], clusterIds: string[] } | null}
 */
export function interpretLifeArchiveQuestion(questionId) {
  const spec = QUESTION_RESULTS[questionId];
  if (!spec) return null;

  return {
    interpretation: spec.interpretation,
    photoIds: spec.photoIds.filter((id) => photoById[id]),
    clusterIds: spec.clusterIds.filter((id) => lifePhotoClusters[id]),
  };
}

/** Optional metadata footnote for the panel UI */
export function formatInterpretationClusterLine(clusterIds) {
  const names = clusterIds.map(
    (id) => CLUSTER_SHORT_LABELS[id] ?? lifePhotoClusters[id]?.label ?? id,
  );
  if (names.length === 0) return '';
  if (names.length === 1) return `Based on ${names[0]} cluster.`;
  const last = names.pop();
  return `Based on ${names.join(', ')}, and ${last} clusters.`;
}

/** Resolve photo records for panel thumbnails (metadata ids → imageSrc) */
export function getInterpretationPhotos(photoIds) {
  return photoIds.map((id) => getPhotoById(id)).filter(Boolean);
}
