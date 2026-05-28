import { getSignalIndex } from '../../utils/lifeArchiveIndex.js';

export function LifePhotoCard({ photo, layoutVariant }) {
  const index = getSignalIndex(photo);
  const hoverTags = photo.tags.slice(0, 5);

  return (
    <article
      id={photo.id}
      className={`life-photo-card life-photo-card--${layoutVariant}`}
      tabIndex={0}
    >
      <div className="life-photo-card__media">
        <img
          src={photo.imageSrc}
          alt={photo.title}
          loading="lazy"
          decoding="async"
          className="life-photo-card__img"
        />
        <div className="life-photo-card__reveal" aria-hidden="true">
          <p className="life-photo-card__reveal-summary">{photo.visualSummary}</p>
          <p className="life-photo-card__reveal-meaning">{photo.personalMeaning}</p>
          {hoverTags.length > 0 && (
            <ul className="life-photo-card__reveal-tags">
              {hoverTags.map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="life-photo-card__meta">
        <span className="life-photo-card__index">{index}</span>
        <h3 className="life-photo-card__title">{photo.title}</h3>
        <p className="life-photo-card__attention">{photo.attentionType}</p>
      </div>
    </article>
  );
}
