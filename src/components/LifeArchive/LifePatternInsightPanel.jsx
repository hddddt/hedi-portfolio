import { useMemo } from 'react';
import { getPhotoById } from '../../utils/lifeArchiveIndex.js';
import { LIFE_PATTERN_COPY } from '../../data/lifePatternReading.js';
import { LifePatternAiPresence } from './LifePatternAiPresence.jsx';

export function LifePatternInsightPanel({
  cluster,
  followUpId,
  onSelectFollowUp,
  onClose,
  showClusterIntro = false,
}) {
  const followUp = useMemo(
    () => cluster?.followUps?.find((f) => f.id === followUpId) ?? null,
    [cluster, followUpId],
  );

  const samplePhotos = useMemo(
    () => (cluster?.photos ?? []).slice(0, 4).map((id) => getPhotoById(id)).filter(Boolean),
    [cluster],
  );

  if (!cluster) return null;

  const { panelSections: s } = LIFE_PATTERN_COPY;

  return (
    <aside
      className="life-ai-panel life-pattern-panel"
      aria-labelledby="life-pattern-panel-title"
    >
      <div className="life-pattern-panel__head">
        <div className="life-pattern-panel__head-main">
          <LifePatternAiPresence
            greetKey={cluster.id}
            className="life-ai-presence--panel"
            size={40}
          />
          <h3 id="life-pattern-panel-title" className="life-ai-panel__title">
            {cluster.label}
          </h3>
        </div>
        <button type="button" className="life-pattern-panel__close" onClick={onClose}>
          Close
        </button>
      </div>

      {showClusterIntro && (
        <p className="life-pattern-panel__cluster-intro">{LIFE_PATTERN_COPY.clusterIntro}</p>
      )}

      <div className="life-pattern-panel__body">
        <section className="life-pattern-panel__block">
          <h4 className="life-pattern-panel__label">{s.pattern}</h4>
          <p className="life-ai-panel__interpretation">{cluster.pattern}</p>
        </section>

        <section className="life-pattern-panel__block">
          <h4 className="life-pattern-panel__label">{s.returning}</h4>
          <p className="life-ai-panel__interpretation">{cluster.whatKeepsReturning}</p>
        </section>

        <section className="life-pattern-panel__block">
          <h4 className="life-pattern-panel__label">{s.suggests}</h4>
          <p className="life-ai-panel__interpretation">{cluster.whatThisSuggests}</p>
        </section>

        <section className="life-pattern-panel__block">
          <h4 className="life-pattern-panel__label">{s.matters}</h4>
          <p className="life-ai-panel__interpretation">{cluster.whyItMatters}</p>
        </section>

        {samplePhotos.length > 0 && (
          <ul className="life-ai-panel__photos" aria-label="Images in this pattern">
            {samplePhotos.map((photo) => (
              <li key={photo.id}>
                <div className="life-ai-panel__photo-link">
                  <img
                    src={photo.imageSrc}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="life-ai-panel__photo-img"
                  />
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="life-ai-panel__questions" role="group" aria-label={s.followUpLabel}>
          <p className="life-pattern-panel__followup-heading">{s.followUpLabel}</p>
          {cluster.followUps.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`life-ai-panel__question${followUpId === item.id ? ' is-active' : ''}`}
              onClick={() => onSelectFollowUp(item.id)}
              aria-pressed={followUpId === item.id}
            >
              {item.label}
            </button>
          ))}
        </div>

        {followUp && (
          <div className="life-ai-panel__result life-pattern-panel__followup-result" aria-live="polite">
            <p className="life-pattern-panel__followup-q">{followUp.label}</p>
            <p className="life-ai-panel__interpretation">{followUp.response}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
