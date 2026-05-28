export function HeroAnswerStateModel({ hero }) {
  if (!hero) return null;
  return (
    <figure className="work-case-detail__hero-evidence case01-hero-evidence">
      <h4 className="work-case-detail__hero-evidence-title">{hero.title}</h4>
      <div className="work-case-detail__state-model">
        <div className="work-case-detail__state-track">
          {hero.states.map((state, i) => (
            <div key={state.label} className="work-case-detail__state-step">
              <div className="work-case-detail__state-card">
                <p className="work-case-detail__state-label">{state.label}</p>
                {state.lines.map((line) => (
                  <p key={line} className="work-case-detail__state-line">
                    {line}
                  </p>
                ))}
              </div>
              {i < hero.states.length - 1 ? (
                <span className="work-case-detail__state-arrow" aria-hidden="true">
                  ↓
                </span>
              ) : null}
            </div>
          ))}
        </div>
        <ul className="work-case-detail__state-labels" aria-label="State dimensions">
          {hero.sideLabels.map((label) => (
            <li key={label}>{label}</li>
          ))}
        </ul>
      </div>
      <figcaption className="work-case-detail__hero-caption">{hero.caption}</figcaption>
    </figure>
  );
}
