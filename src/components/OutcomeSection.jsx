export function OutcomeSection({ outcome }) {
  return (
    <section className="outcome reveal">
      <div>
        <h3>Outcome</h3>
      </div>
      <div>
        <p>{outcome.paragraph}</p>
        <div className="hiring">
          <div className="hiring-label">Hiring signal</div>
          <div className="hiring-text">{outcome.hiring}</div>
        </div>
      </div>
    </section>
  );
}
