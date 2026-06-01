import { useMemo } from 'react';
import { lifePhotoMetadata } from '../../data/lifePhotoMetadata.js';
import { buildConnectionView } from '../../utils/lifeArchiveConnections.js';
import '../../styles/life-archive-connection.css';

/**
 * @param {{
 *   selectedId: string;
 *   activeLens: import('../../utils/lifeArchiveConnections.js').ConnectionLensKey;
 *   onLensChange: (lens: import('../../utils/lifeArchiveConnections.js').ConnectionLensKey) => void;
 *   onSelectFragment: (id: string) => void;
 *   onBack: () => void;
 * }} props
 */
export function LifeArchiveConnectionView({
  selectedId,
  activeLens,
  onLensChange,
  onSelectFragment,
  onBack,
}) {
  const view = useMemo(
    () => buildConnectionView(selectedId, activeLens, lifePhotoMetadata),
    [selectedId, activeLens],
  );

  if (!view.anchor) return null;

  const { anchor, lenses, related, activeInsight } = view;

  return (
    <div className="life-archive-connect" role="region" aria-label="Connection view">
      <button type="button" className="life-archive-connect__back" onClick={onBack}>
        ← Back to archive
      </button>

      <div className="life-archive-connect__layout">
        <aside className="life-archive-connect__anchor" aria-label="Starting point">
          <p className="life-archive-connect__anchor-kicker">Starting from</p>
          <figure className="life-archive-connect__anchor-figure">
            <img
              src={anchor.imageSrc}
              alt=""
              className="life-archive-connect__anchor-img"
              decoding="async"
            />
          </figure>
          <h3 className="life-archive-connect__anchor-title">{anchor.title}</h3>
          <p className="life-archive-connect__anchor-caption">{anchor.microCaption}</p>
        </aside>

        <div className="life-archive-connect__field" aria-label="Connection field">
          <div className="life-archive-connect__tabs" role="tablist" aria-label="Connection lenses">
            {lenses.map((tab) => {
              const isActive = tab.key === activeLens;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  className={`life-archive-connect__tab${isActive ? ' is-active' : ''}`}
                  onClick={() => onLensChange(tab.key)}
                >
                  <span className="life-archive-connect__tab-label">{tab.label}</span>
                  <span className="life-archive-connect__tab-count">· {tab.count}</span>
                </button>
              );
            })}
          </div>

          {activeInsight ? (
            <p className="life-archive-connect__insight">{activeInsight}</p>
          ) : null}

          <div className="life-archive-connect__grid">
            {related.length === 0 ? (
              <p className="life-archive-connect__empty">No nearby fragments in this lens yet.</p>
            ) : (
              related.map((frag) => (
                <button
                  key={frag.id}
                  type="button"
                  className="life-archive-connect__card"
                  onClick={() => onSelectFragment(frag.id)}
                  aria-label={`${frag.title}, ${frag.microCaption}`}
                >
                  <img
                    src={frag.imageSrc}
                    alt=""
                    className="life-archive-connect__card-img"
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                  />
                  <span className="life-archive-connect__card-meta">
                    <span className="life-archive-connect__card-title">{frag.title}</span>
                    <span className="life-archive-connect__card-caption">{frag.microCaption}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
