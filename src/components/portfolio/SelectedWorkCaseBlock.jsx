/**
 * Large horizontal evidence block for the selected-work sequence.
 * Copy comes from portfolio `selectedWorkCases`; opens full case via id.
 */
export function SelectedWorkCaseBlock({ item, onOpenCase }) {
  const { id, num, title, layer, tension, signal, cta, openAria, visualKey } = item;

  return (
    <button
      type="button"
      className="sw-case reveal"
      onClick={() => onOpenCase(id)}
      aria-label={openAria}
    >
      <div className="sw-case__body">
        <div className="sw-case__lead">
          <span className="sw-case__num">{num}</span>
          <h3 className="sw-case__title">{title}</h3>
          <p className="sw-case__layer">{layer}</p>
        </div>
        <div className="sw-case__tail">
          <div className="sw-case__block sw-case__block--tension">
            <span className="sw-case__k">Tension</span>
            <p className="sw-case__text">{tension}</p>
          </div>
          <div className="sw-case__block sw-case__block--signal">
            <span className="sw-case__k">Signal</span>
            <p className="sw-case__text sw-case__text--signal">{signal}</p>
          </div>
          <span className="sw-case__cta">{cta}</span>
        </div>
      </div>
      <div className={`sw-case__visual sw-case__visual--${visualKey}`} aria-hidden="true">
        <div className="sw-case__visual-ph">
          <span className="sw-case__ph sw-case__ph--a" />
          <span className="sw-case__ph sw-case__ph--b" />
          <span className="sw-case__ph sw-case__ph--c" />
        </div>
      </div>
    </button>
  );
}
