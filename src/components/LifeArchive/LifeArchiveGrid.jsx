import { lifePhotoClusters } from '../../data/lifePhotoClusters.js';
import { lifePhotoMetadata } from '../../data/lifePhotoMetadata.js';
import { lifeArchiveClusterOrder } from '../../data/lifeArchiveCopy.js';
import {
  getClusterPhotoCount,
  getPhotoLayoutVariant,
  getPhotosForCluster,
} from '../../utils/lifeArchiveIndex.js';
import { LifePhotoCard } from './LifePhotoCard.jsx';

const ALL_FILTER = 'all';

const FILTER_OPTIONS = [
  { key: ALL_FILTER, label: 'All' },
  ...lifeArchiveClusterOrder.map((key) => ({
    key,
    label: lifePhotoClusters[key].label,
  })),
];

export function LifeArchiveGrid({ activeFilter, onFilterChange }) {
  const photos = getPhotosForCluster(activeFilter);

  const isFullArchive = photos.length === lifePhotoMetadata.length;

  return (
    <div className="life-archive-grid motion-reveal-group">
      <p className="life-archive-grid__stream-label motion-reveal-child" aria-live="polite">
        {isFullArchive
          ? `Signal stream · ${photos.length} indexed · life_01–life_50`
          : `${photos.length} signals · filtered · chronological order preserved`}
      </p>

      <div
        className="life-archive-grid__filters life-archive-grid__filters--secondary motion-reveal-child"
        role="toolbar"
        aria-label="Optional cluster filter"
      >
        {FILTER_OPTIONS.map(({ key, label }) => {
          const count = getClusterPhotoCount(key);
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              type="button"
              className={`life-archive-grid__chip${isActive ? ' is-active' : ''}`}
              onClick={() => onFilterChange(key)}
              aria-pressed={isActive}
            >
              <span className="life-archive-grid__chip-label">{label}</span>
              <span className="life-archive-grid__chip-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div
        className={`life-archive-grid__masonry motion-reveal-child${isFullArchive ? ' life-archive-grid__masonry--full' : ''}`}
        key={activeFilter}
      >
        {photos.map((photo, index) => (
          <LifePhotoCard
            key={photo.id}
            photo={photo}
            layoutVariant={getPhotoLayoutVariant(index)}
          />
        ))}
      </div>
    </div>
  );
}
