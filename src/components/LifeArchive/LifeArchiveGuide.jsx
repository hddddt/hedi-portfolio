import { GuideOrbWithHat } from '../home/GuideOrb.jsx';
import { LIFE_ARCHIVE_COPY, LIFE_ARCHIVE_VIEWS } from '../../data/lifeArchiveViews.js';

export function LifeArchiveBrowseGuide({ onSelectView }) {
  return (
    <div className="life-archive-guide life-archive-guide--browse" aria-live="polite">
      <div className="life-archive-guide__orb" aria-hidden="true">
        <GuideOrbWithHat size={48} followCursor={false} blink bright open alive />
      </div>
      <p className="life-archive-guide__prompt">
        <span className="life-archive-guide__prompt-line">There are different ways to look at this archive.</span>
        <span className="life-archive-guide__prompt-line">Choose a view.</span>
      </p>
      <div className="life-archive-guide__views" role="group" aria-label="Archive views">
        {LIFE_ARCHIVE_VIEWS.map((view) => (
          <button
            key={view.id}
            type="button"
            className="life-archive-guide__view-btn"
            onClick={() => onSelectView(view.id)}
          >
            {view.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LifeArchiveViewHeader({ view, onClearView, compact = false }) {
  if (!view) return null;

  return (
    <header
      className={`life-archive-view-header${compact ? ' life-archive-view-header--compact' : ''}`}
    >
      <div className="life-archive-view-header__orb" aria-hidden="true">
        <GuideOrbWithHat size={compact ? 40 : 44} followCursor={false} blink bright open alive />
      </div>
      <div className="life-archive-view-header__copy">
        <dl className="life-archive-view-header__fields">
          <div className="life-archive-view-header__field">
            <dt>View</dt>
            <dd>{view.label}</dd>
          </div>
          <div className="life-archive-view-header__field">
            <dt>Lens</dt>
            <dd>{view.description}</dd>
          </div>
          <div className="life-archive-view-header__field life-archive-view-header__field--echo">
            <dt>Design echo</dt>
            <dd>{view.designEcho}</dd>
          </div>
        </dl>
        <button type="button" className="life-archive-view-header__back" onClick={onClearView}>
          {LIFE_ARCHIVE_COPY.changeView}
        </button>
      </div>
    </header>
  );
}
