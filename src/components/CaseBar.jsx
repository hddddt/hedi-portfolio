export function CaseBar({ bar, prevCase, nextCase, prevId, nextId, onClose, onSwitch }) {
  return (
    <div className="case-bar">
      <div className="cb-left">
        <span className="cb-num">{bar.num}</span>
        <span className="cb-title">{bar.title}</span>
        <span className="cb-layer">{bar.layer}</span>
      </div>
      <div className="cb-actions">
        <button
          type="button"
          className="cb-switch"
          onClick={() => onSwitch(prevId)}
          aria-label={`Go to previous case`}
        >
          ← {prevCase?.overview.num}
        </button>
        <button type="button" className="cb-back" onClick={onClose}>
          Overview
        </button>
        <button
          type="button"
          className="cb-switch"
          onClick={() => onSwitch(nextId)}
          aria-label={`Go to next case`}
        >
          {nextCase?.overview.num} →
        </button>
      </div>
    </div>
  );
}
