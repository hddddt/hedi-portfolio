import { LIFE_ARCHIVE_COPY } from '../../data/lifeArchiveViews.js';

export function LifeArchivePhotoDetail({ photo, onClose, embedded = false }) {
  if (!photo) return null;

  return (
    <aside
      className={`life-archive-fragment${embedded ? ' life-archive-fragment--embedded' : ''}`}
      aria-labelledby="life-archive-fragment-title"
    >
      <button type="button" className="life-archive-fragment__back" onClick={onClose}>
        ← Back to this view
      </button>
      <div className="life-archive-fragment__media">
        <img src={photo.src} alt={photo.alt} className="life-archive-fragment__img" loading="lazy" decoding="async" />
      </div>
      <div className="life-archive-fragment__copy">
        {photo.title ? (
          <h3 id="life-archive-fragment-title" className="life-archive-fragment__title">
            {photo.title}
          </h3>
        ) : null}
        {photo.note ? (
          <div className="life-archive-fragment__block">
            <p className="life-archive-fragment__label">Why it stayed</p>
            <p className="life-archive-fragment__text">{photo.note}</p>
          </div>
        ) : null}
        {photo.detail ? (
          <div className="life-archive-fragment__block">
            <p className="life-archive-fragment__label">What this reveals</p>
            <p className="life-archive-fragment__text">{photo.detail}</p>
          </div>
        ) : null}
      </div>
      <button type="button" className="life-archive-fragment__close" onClick={onClose}>
        {LIFE_ARCHIVE_COPY.photoDetailClose}
      </button>
    </aside>
  );
}
