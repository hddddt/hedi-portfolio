export function WorkChapter({
  id,
  num,
  title,
  layer,
  tension,
  signal,
  accent,
}) {
  return (
    <section
      className="home-section home-chapter"
      id={id}
      style={{ '--home-ch-accent': accent }}
      aria-labelledby={`${id}-title`}
    >
      <div className="home-chapter__visual reveal" aria-hidden="true">
        <div className="home-chapter__visual-blob" />
        <div className="home-chapter__visual-ring" />
      </div>
      <div className="home-chapter__meta">
        <h2 className="home-chapter__title reveal" id={`${id}-title`}>
          {title}
        </h2>
        <p className="home-chapter__row reveal">
          <span className="home-chapter__k">Layer</span>
          <span className="home-chapter__v">{layer}</span>
        </p>
        <p className="home-chapter__row reveal">
          <span className="home-chapter__k">Tension</span>
          <span className="home-chapter__v">{tension}</span>
        </p>
        <p className="home-chapter__row reveal">
          <span className="home-chapter__k">Signal</span>
          <span className="home-chapter__v">{signal}</span>
        </p>
      </div>
      <span className="home-chapter__num">{num}</span>
    </section>
  );
}
