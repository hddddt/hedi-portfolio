/** Floating case index when a case is open — flat labels, no duplicated titles or arrows. */
export function CaseBar({ cases, activeCaseId, onSelectCase, onOverview }) {
  return (
    <nav
      className="case-switch-dock"
      aria-label="Case index"
      title="Switch case or return to overview · Escape closes case view"
    >
      <div className="case-switch-dock__inner">
        {cases.map((c) => {
          const active = c.id === activeCaseId;
          return (
            <button
              key={c.id}
              type="button"
              className={`case-switch-dock__btn${active ? ' is-active' : ''}`}
              onClick={() => onSelectCase(c.id)}
              aria-current={active ? 'page' : undefined}
            >
              {c.overview.num}
            </button>
          );
        })}
        <span className="case-switch-dock__rule" aria-hidden="true" />
        <button type="button" className="case-switch-dock__btn" onClick={onOverview}>
          Overview
        </button>
      </div>
    </nav>
  );
}
