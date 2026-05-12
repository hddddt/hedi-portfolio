export function CaseAside({ aside: a }) {
  return (
    <aside className="case-aside">
      <div className="aside-num">{a.num}</div>
      <h2 className="aside-title">{a.title}</h2>
      <div className="aside-layer">{a.layer}</div>
      <p className="aside-judge">
        <b>{a.judgeLead}</b>
        <br />
        {a.judgeRest}
      </p>
      <div className="aside-label">Decision path</div>
      <div className="aside-path">
        {a.path.map((step) => (
          <div key={step.n}>
            <span>{step.n}</span>
            <span>{step.t}</span>
          </div>
        ))}
      </div>
      <div className="aside-label">Signal</div>
      <p className="aside-signal">{a.signal}</p>
      <div className="aside-tags">
        {a.tags.map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </aside>
  );
}
