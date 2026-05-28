import { useCallback, useMemo, useState } from 'react';
import { getPhotoById } from '../../utils/lifeArchiveIndex.js';
import {
  LIFE_PATTERN_CLUSTER_ORDER,
  LIFE_PATTERN_CLUSTERS,
  LIFE_PATTERN_COPY,
  LIFE_PATTERN_FIELD_IDS,
  LIFE_PATTERN_FIELD_LAYOUT,
} from '../../data/lifePatternReading.js';
import { LifePatternAiPresence } from './LifePatternAiPresence.jsx';
import { LifePatternInsightPanel } from './LifePatternInsightPanel.jsx';

export function LifePatternExperience() {
  const [phase, setPhase] = useState('field');
  const [activeClusterId, setActiveClusterId] = useState(null);
  const [followUpId, setFollowUpId] = useState(null);

  const fieldPhotos = useMemo(
    () => LIFE_PATTERN_FIELD_IDS.map((id) => getPhotoById(id)).filter(Boolean),
    [],
  );

  const onReadPattern = useCallback(() => {
    setPhase('clusters');
    setActiveClusterId(null);
    setFollowUpId(null);
  }, []);

  const onBackToField = useCallback(() => {
    setPhase('field');
    setActiveClusterId(null);
    setFollowUpId(null);
  }, []);

  const onSelectCluster = useCallback((clusterId) => {
    setActiveClusterId(clusterId);
    setFollowUpId(null);
  }, []);

  const onClosePanel = useCallback(() => {
    setActiveClusterId(null);
    setFollowUpId(null);
  }, []);

  const activeCluster = useMemo(
    () => LIFE_PATTERN_CLUSTERS.find((c) => c.id === activeClusterId) ?? null,
    [activeClusterId],
  );

  const isClusters = phase === 'clusters';

  return (
    <div
      className={`life-pattern${isClusters ? ' life-pattern--clusters' : ''}${activeClusterId ? ' life-pattern--panel-open' : ''}`}
    >
      <div className="life-pattern__main">
        <header className="life-pattern__header">
          <h2 id="life-archive-title" className="life-pattern__title">
            {LIFE_PATTERN_COPY.title}
          </h2>
          <p className="life-pattern__subtitle">{LIFE_PATTERN_COPY.subtitle}</p>

          {!isClusters && (
            <div className="life-pattern__ai-entry">
              <LifePatternAiPresence greetKey="field" className="life-ai-presence--inline" />
              <div className="life-pattern__ai-entry-copy">
                <p className="life-pattern__ai-prompt">{LIFE_PATTERN_COPY.aiPrompt}</p>
                <button type="button" className="life-pattern__cta" onClick={onReadPattern}>
                  {LIFE_PATTERN_COPY.cta}
                </button>
              </div>
            </div>
          )}

          {isClusters && (
            <button type="button" className="life-pattern__back" onClick={onBackToField}>
              {LIFE_PATTERN_COPY.backToField}
            </button>
          )}
        </header>

        {!isClusters ? (
          <div className="life-pattern__field" aria-label="Curated photo field">
            <div className="life-pattern__field-track">
              {fieldPhotos.map((photo, i) => {
                const layout = LIFE_PATTERN_FIELD_LAYOUT[i] ?? LIFE_PATTERN_FIELD_LAYOUT[0];
                return (
                  <figure
                    key={photo.id}
                    className="life-pattern__card"
                    style={{
                      '--lp-x': `${layout.x}%`,
                      '--lp-y': `${layout.y}%`,
                      '--lp-r': `${layout.rotate}deg`,
                      '--lp-z': layout.z,
                    }}
                  >
                    <img
                      src={photo.imageSrc}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="life-pattern__card-img"
                    />
                  </figure>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="life-pattern__clusters" role="list" aria-label="Pattern clusters">
            {LIFE_PATTERN_CLUSTERS.map((cluster) => {
              const thumbs = cluster.photos
                .slice(0, 3)
                .map((id) => getPhotoById(id))
                .filter(Boolean);
              const isActive = activeClusterId === cluster.id;
              return (
                <button
                  key={cluster.id}
                  type="button"
                  role="listitem"
                  className={`life-pattern__cluster${isActive ? ' is-active' : ''}`}
                  onClick={() => onSelectCluster(cluster.id)}
                  aria-pressed={isActive}
                >
                  <span className="life-pattern__cluster-index" aria-hidden="true">
                    {String(LIFE_PATTERN_CLUSTER_ORDER.indexOf(cluster.id) + 1).padStart(2, '0')}
                  </span>
                  <span className="life-pattern__cluster-label">{cluster.label}</span>
                  <span className="life-pattern__cluster-thumbs" aria-hidden="true">
                    {thumbs.map((photo, ti) => (
                      <img
                        key={photo.id}
                        src={photo.imageSrc}
                        alt=""
                        loading="lazy"
                        className="life-pattern__cluster-thumb"
                        style={{ '--thumb-i': ti }}
                      />
                    ))}
                  </span>
                  <span className="life-pattern__cluster-count">
                    {cluster.photos.length} signals
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {isClusters && activeCluster && (
        <LifePatternInsightPanel
          cluster={activeCluster}
          followUpId={followUpId}
          onSelectFollowUp={setFollowUpId}
          onClose={onClosePanel}
          showClusterIntro={false}
        />
      )}

      {isClusters && !activeClusterId && (
        <aside
          className="life-ai-panel life-pattern-panel life-pattern-panel--intro"
          aria-labelledby="life-pattern-intro-title"
        >
          <div className="life-pattern-panel__intro-head">
            <LifePatternAiPresence greetKey="clusters-intro" className="life-ai-presence--panel" />
            <h3 id="life-pattern-intro-title" className="life-ai-panel__title">
              Pattern reading
            </h3>
          </div>
          <p className="life-ai-panel__description">{LIFE_PATTERN_COPY.clusterIntro}</p>
          <p className="life-ai-panel__description life-pattern-panel__hint">
            Select a cluster to see what keeps returning — and what it suggests for design work.
          </p>
        </aside>
      )}
    </div>
  );
}
