const CLUSTER_NOUN = {
  architecture_spatial_observation: 'spatial observations',
  art_exhibition_visual_culture: 'exhibition moments',
  ai_interaction_experiments: 'AI encounters',
  small_beings_urban_finds: 'small finds',
  animal_presence: 'animal moments',
  food_ritual_sensory_memory: 'food memories',
  strange_nature_edge: 'edge moments',
  human_scene_creative_work: 'human moments',
};

/** attentionType (normalized substring) → short label for option 2 */
const ATTENTION_SHORT_LABELS = [
  ['food texture', 'texture'],
  ['architecture / contrast', 'spatial reading'],
  ['architecture /', 'spatial reading'],
  ['animal encounter', 'animal presence'],
  ['animal presence', 'animal presence'],
  ['animal in urban', 'animal presence'],
  ['small being', 'found presence'],
  ['found design', 'found presence'],
  ['urban found', 'found presence'],
  ['ai interaction', 'AI encounter'],
  ['ai /', 'AI encounter'],
  ['strange natural', 'edge of nature'],
  ['landscape / strange', 'landscape edge'],
  ['light installation', 'light and space'],
  ['installation / light', 'light and space'],
  ['iconic sculpture', 'scale and form'],
  ['urban graphic mark', 'graphic mark'],
  ['urban graphic intervention', 'graphic mark'],
  ['graphic design', 'graphic mark'],
  ['body inside structure', 'body and space'],
  ['sacred architecture', 'ritual space'],
  ['food / homecoming', 'homecoming'],
  ['food / cultural', 'homecoming'],
  ['city atmosphere', 'city distance'],
  ['creative collaboration', 'making together'],
  ['human scene', 'making together'],
  ['professional community', 'making together'],
  ['professional event', 'making together'],
];

const CLUSTER_OBJECTIVE = {
  architecture_spatial_observation:
    'Built environments read through contrast, scale, atmosphere, and how space organizes bodies and ritual.',
  art_exhibition_visual_culture:
    'Artworks and exhibitions registered through staging, scale, graphic language, light, and institutional space.',
  ai_interaction_experiments:
    'AI, interaction, community, sound, and embodied experience — technology as contact, not interface alone.',
  small_beings_urban_finds:
    'Small designed, drawn, or character-like presences inserted into ordinary environments.',
  animal_presence:
    'Animals as calm, strange, open, or displaced presences — not only as subjects.',
  food_ritual_sensory_memory:
    'Food as homecoming, cultural symbol, texture, and sensory record.',
  strange_nature_edge:
    'Nature when it feels alien, elemental, edge-like, or visually unreal.',
  human_scene_creative_work:
    'People in contexts of work, exchange, presentation, collaboration, and creative production.',
};

const ATTENTION_LENS_COPY = {
  texture:
    'Attention to food as material:\ncolor, biological form, tactile surface.',
  'spatial reading':
    'Attention to built form:\ncontrast, scale, and how space is read.',
  'animal presence':
    'Attention to animals as presence:\nopen, calm, or briefly unguarded.',
  'found presence':
    'Attention to small designed presences\nin ordinary streets and rooms.',
  'AI encounter':
    'Attention to systems, prototypes,\nand embodied contact with machines.',
  'edge of nature':
    'Attention to nature at the edge:\nelemental, strange, or brightly unreal.',
  'light and space':
    'Attention to light, staging,\nand spatial graphic structure.',
  'scale and form':
    'Attention to scale, suspension,\nand form inside institutional space.',
  'graphic mark':
    'Attention to marks, signs,\nand graphic language in the city.',
  'body and space':
    'Attention to bodies inside structures:\nscale, suspension, and staging.',
  'ritual space':
    'Attention to sacred or ritual space:\ninterior, symbol, and gathering.',
  homecoming:
    'Attention to food and return:\nplace, season, and familiar ritual.',
  'city distance':
    'Attention to the city at a distance:\natmosphere, edge, and quiet register.',
  'making together':
    'Attention to collaboration, exchange,\nand people inside creative work.',
  'landscape edge':
    'Attention to landscape at the edge:\nhorizon, strangeness, and open air.',
};

const TONE_LENS_COPY = {
  earthy: 'Grounded, textured, close to material.',
  tactile: 'Grounded, textured, close to material.',
  curious: 'Grounded, textured, close to material.',
  calm: 'Distance and stillness.\nLooking without urgency.',
  quiet: 'Distance and stillness.\nLooking without urgency.',
  observational: 'Distance and stillness.\nLooking without urgency.',
  unbothered: 'Distance and stillness.\nLooking without urgency.',
  light: 'Distance and stillness.\nLooking without urgency.',
  warm: 'Warmth and return.\nFamiliar things held carefully.',
  familial: 'Warmth and return.\nFamiliar things held carefully.',
  grounded: 'Warmth and return.\nFamiliar things held carefully.',
  open: 'Warmth and return.\nFamiliar things held carefully.',
  playful: 'Small things that carry personality.',
  tender: 'Small things that carry personality.',
  delicate: 'Small things that carry personality.',
  alert: 'Small things that carry personality.',
  experimental: 'A sense of systems behaving like living things.',
  magical: 'A sense of systems behaving like living things.',
  uncanny: 'At the edge — beautiful, slightly alert.',
  strange: 'At the edge — beautiful, slightly alert.',
  raw: 'At the edge — beautiful, slightly alert.',
  structural: 'Distance and stillness.\nLooking without urgency.',
  aesthetic: 'Attention to form, light,\nand careful visual register.',
  precise: 'Attention to form, light,\nand careful visual register.',
  restrained: 'At the edge — beautiful, slightly alert.',
  still: 'Distance and stillness.\nLooking without urgency.',
};

const FOLLOWUP_CLUSTER =
  'The same habit in design work — finding recurring signals, then giving them structure.';

const FOLLOWUP_ATTENTION =
  'Material sensitivity — knowing what deserves weight and what should recede.';

const FOLLOWUP_TONE =
  'The same habit in design work — finding recurring signals, then giving them structure.';

const CENTER_W_MAX = 420;
const SIDE_W_MAX = 220;
const GAP_MIN = 32;
const STACK_SHIFT = 16;
const CLUSTER_MAX_VW = 0.9;

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeAttention(attentionType) {
  const n = norm(attentionType);
  if (!n) return [];
  return n
    .split(/[/,]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function toneOverlapCount(a, b) {
  const ta = (a?.emotionalTone ?? []).map(norm).filter(Boolean);
  const tb = new Set((b?.emotionalTone ?? []).map(norm).filter(Boolean));
  let n = 0;
  ta.forEach((t) => {
    if (tb.has(t)) n += 1;
  });
  return n;
}

function setOverlapRatio(idsA, idsB) {
  const a = new Set(idsA);
  const b = new Set(idsB);
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  a.forEach((id) => {
    if (b.has(id)) inter += 1;
  });
  return inter / Math.min(a.size, b.size);
}

export function getAttentionShortLabel(photo) {
  const n = norm(photo?.attentionType);
  if (!n) return 'this focus';
  for (const [needle, label] of ATTENTION_SHORT_LABELS) {
    if (n.includes(needle)) return label;
  }
  const parts = tokenizeAttention(photo.attentionType);
  return parts[0] || 'this focus';
}

export function getPrimaryToneWord(photo) {
  const tones = (photo?.emotionalTone ?? []).map(norm).filter(Boolean);
  return tones[0] || 'this';
}

export function countClusterPhotos(selected, all) {
  if (!selected?.cluster) return 0;
  return all.filter((p) => p.cluster === selected.cluster).length;
}

export function matchLensCluster(selected, all) {
  if (!selected?.cluster) return [selected.id];
  const same = all.filter((p) => p.cluster === selected.cluster);
  const rest = same.filter((p) => p.id !== selected.id);
  return [selected.id, ...rest.map((p) => p.id)];
}

export function matchLensAttention(selected, all) {
  if (!selected) return [];
  const key = norm(selected.attentionType);
  const tokens = tokenizeAttention(selected.attentionType);
  const matched = all.filter((p) => {
    if (p.id === selected.id) return true;
    const pk = norm(p.attentionType);
    if (pk === key) return true;
    const pt = tokenizeAttention(p.attentionType);
    return tokens.some((t) => pt.some((pTok) => pTok.includes(t) || t.includes(pTok)));
  });
  const rest = matched.filter((p) => p.id !== selected.id);
  return [selected.id, ...rest.map((p) => p.id)];
}

export function matchLensTone(selected, all) {
  if (!selected) return [selected.id];
  const matched = all.filter((p) => p.id === selected.id || toneOverlapCount(selected, p) >= 1);
  const rest = matched.filter((p) => p.id !== selected.id);
  return [selected.id, ...rest.map((p) => p.id)];
}

export function matchForLens(lens, selected, all) {
  if (lens === 'cluster') return matchLensCluster(selected, all);
  if (lens === 'attention') return matchLensAttention(selected, all);
  if (lens === 'tone') return matchLensTone(selected, all);
  return [selected?.id].filter(Boolean);
}

export function getDynamicLabelCluster(selected, all) {
  if (!selected?.cluster) return 'Show what connects';
  const n = countClusterPhotos(selected, all);
  const other = Math.max(0, n - 1);
  const noun = CLUSTER_NOUN[selected.cluster] || 'fragments';
  return `Show the other ${other} ${noun}`;
}

export function getDynamicLabelAttention(selected) {
  const short = getAttentionShortLabel(selected);
  return `Show what shares this ${short}`;
}

export function getDynamicLabelTone(selected) {
  const word = getPrimaryToneWord(selected);
  return `Show what feels this ${word}`;
}

/**
 * Up to 3 exploration options; drops tone if attention/tone sets overlap >80%.
 * @returns {{ lens: 'cluster'|'attention'|'tone', label: string }[]}
 */
export function getExplorationOptions(selected, all) {
  if (!selected) return [];

  const options = [];
  const clusterIds = matchLensCluster(selected, all);
  if (clusterIds.length > 1 || selected.cluster) {
    options.push({
      lens: 'cluster',
      label: getDynamicLabelCluster(selected, all),
    });
  }

  const attentionIds = matchLensAttention(selected, all);
  const toneIds = matchLensTone(selected, all);

  const attnOthers = attentionIds.filter((id) => id !== selected.id);
  const toneOthers = toneIds.filter((id) => id !== selected.id);

  if (attnOthers.length > 0) {
    options.push({
      lens: 'attention',
      label: getDynamicLabelAttention(selected),
    });
  }

  const overlap = setOverlapRatio(attentionIds, toneIds);
  if (toneOthers.length > 0 && overlap <= 0.8) {
    options.push({
      lens: 'tone',
      label: getDynamicLabelTone(selected),
    });
  }

  return options;
}

export function getSelectionOpeningText(selected, all) {
  if (!selected) return '';
  const n = countClusterPhotos(selected, all) || 1;
  const theme =
    CLUSTER_OBJECTIVE[selected.cluster]?.split('.')[0] ||
    getAttentionShortLabel(selected);
  const quality =
    selected.motifs?.[0] || selected.personalMeaning?.trim() || selected.title;
  return `One of ${n}. ${theme} — ${quality}.`;
}

export function getLensMainText(lens, selected) {
  if (!selected) return '';
  if (lens === 'cluster') {
    return (
      CLUSTER_OBJECTIVE[selected.cluster] ||
      'Recurring signals across different days and places — form and habit.'
    );
  }
  if (lens === 'attention') {
    const short = getAttentionShortLabel(selected);
    return (
      ATTENTION_LENS_COPY[short] ||
      'Attention held on a recurring type of scene or contact.'
    );
  }
  const word = getPrimaryToneWord(selected);
  return TONE_LENS_COPY[word] || 'Fragments that share a common emotional register.';
}

export function getLensFollowUp(lens) {
  if (lens === 'attention') return FOLLOWUP_ATTENTION;
  if (lens === 'tone') return FOLLOWUP_TONE;
  return FOLLOWUP_CLUSTER;
}

function hashId(id, seed = 31) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * seed + id.charCodeAt(i)) >>> 0;
  return h;
}

function yOffsetFromId(id) {
  return (hashId(id, 17) % 41) - 20;
}

function rotFromId(id, side) {
  const t = (hashId(id) % 41) / 10;
  if (side === 'left') return -(4 + t);
  if (side === 'right') return 4 + t;
  return 0;
}

/** Cluster photo widths from viewport (px). */
export function getClusterDimensions(viewportW) {
  const vw = Math.max(320, viewportW || 1200);
  let centerW = Math.min(CENTER_W_MAX, vw * 0.52);
  let sideW = Math.min(SIDE_W_MAX, vw * 0.26);
  const gap = GAP_MIN;
  const span = centerW + 2 * (gap + sideW);
  let scale = 1;
  if (span > vw * CLUSTER_MAX_VW) {
    scale = (vw * CLUSTER_MAX_VW) / span;
    centerW *= scale;
    sideW *= scale;
  }
  return { centerW, sideW, gap, scale };
}

function partitionRelated(relatedIds) {
  const n = relatedIds.length;
  if (n === 0) return { left: [], right: [] };
  if (n === 1) return { left: [relatedIds[0]], right: [] };
  const leftCount = Math.ceil(n / 2);
  return {
    left: relatedIds.slice(0, leftCount),
    right: relatedIds.slice(leftCount),
  };
}

function layoutSideStack(ids, side, centerX, centerY, dims) {
  const { centerW, sideW, gap } = dims;
  const baseX =
    side === 'left'
      ? centerX - centerW / 2 - gap - sideW / 2
      : centerX + centerW / 2 + gap + sideW / 2;
  const layouts = {};

  ids.forEach((id, stackIndex) => {
    const stackX =
      side === 'left'
        ? baseX - stackIndex * STACK_SHIFT
        : baseX + stackIndex * STACK_SHIFT;
    const stackY = centerY + yOffsetFromId(id) + stackIndex * 6;
    const baseRot = rotFromId(id, side);
    const extraRot = stackIndex * 2.5 * (side === 'left' ? -1 : 1);
    layouts[id] = {
      x: stackX,
      y: stackY,
      rot: baseRot + extraRot,
      z: Math.max(1, 2 - stackIndex),
    };
  });

  return layouts;
}

export function clusterTargetLayout(
  photoId,
  selectedId,
  matchedIds,
  centerX,
  centerY,
  viewportW,
) {
  if (photoId === selectedId) {
    return { x: centerX, y: centerY, rot: 0, z: 3, isCenter: true };
  }

  const dims = getClusterDimensions(viewportW);
  const related = matchedIds.filter((id) => id !== selectedId);
  const { left, right } = partitionRelated(related);
  const leftLayouts = layoutSideStack(left, 'left', centerX, centerY, dims);
  const rightLayouts = layoutSideStack(right, 'right', centerX, centerY, dims);
  const layout = leftLayouts[photoId] ?? rightLayouts[photoId];

  if (!layout) {
    return { x: centerX, y: centerY, rot: 0, z: 2, isCenter: false };
  }

  return { ...layout, isCenter: false, scale: dims.scale };
}

/** Min field height hint from matched count */
export function clusterFieldMinHeight(matchedCount, viewportW) {
  const { centerW, sideW } = getClusterDimensions(viewportW);
  const base = centerW + sideW * 0.35 + 80;
  if (matchedCount <= 3) return Math.max(420, base);
  if (matchedCount <= 6) return Math.max(520, base + 60);
  return Math.max(640, base + 120);
}

export function rotationFromId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ((h % 700) / 100) - 3.5;
}

export function scaleFromId(id) {
  let h = 0;
  for (let i = 0; i < id.length; i += 1) h = (h * 17 + id.charCodeAt(i)) >>> 0;
  return 0.94 + (h % 130) / 1000;
}
