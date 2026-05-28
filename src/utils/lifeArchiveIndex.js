import { lifePhotoMetadata } from '../data/lifePhotoMetadata.js';
import { lifePhotoClusters } from '../data/lifePhotoClusters.js';

const photoById = Object.fromEntries(lifePhotoMetadata.map((p) => [p.id, p]));

export function getPhotoById(id) {
  return photoById[id] ?? null;
}

/** All photos in life_01 … life_50 order; optional cluster filter */
export function getPhotosForCluster(clusterKey) {
  if (clusterKey === 'all') {
    return [...lifePhotoMetadata];
  }
  const cluster = lifePhotoClusters[clusterKey];
  if (!cluster) return [];
  const ids = new Set(cluster.photos);
  return lifePhotoMetadata.filter((p) => ids.has(p.id));
}

export function getClusterLabel(clusterKey) {
  return lifePhotoClusters[clusterKey]?.label ?? clusterKey;
}

export function getClusterPattern(clusterKey) {
  return lifePhotoClusters[clusterKey]?.pattern ?? '';
}

export function getClusterPhotoCount(clusterKey) {
  if (clusterKey === 'all') return lifePhotoMetadata.length;
  return lifePhotoClusters[clusterKey]?.photos.length ?? 0;
}

export function getSignalIndex(photo) {
  const n = parseInt(photo.id.replace('life_', ''), 10);
  return Number.isFinite(n) ? String(n).padStart(2, '0') : photo.id;
}

/** Editorial masonry rhythm — no image analysis */
export function getPhotoLayoutVariant(index) {
  const variants = ['standard', 'tall', 'compact', 'wide', 'standard', 'tall'];
  return variants[index % variants.length];
}
