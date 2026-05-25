const LINES = ['The gap is not capability.', 'It is completion.'];

export function ApproachSection() {
  return (
    <div className="home-approach__inner">
      <h2 id="home-approach-title" className="sr-only">
        Approach
      </h2>
      <div className="home-approach__stack">
        {LINES.map((line, i) => (
          <p key={line} className="home-approach__line reveal" style={{ transitionDelay: `${i * 0.14}s` }}>
            {line}
          </p>
        ))}
      </div>
      <p className="home-approach__support reveal">
        AI systems do not become useful when they produce outputs. They become useful when work can continue through
        decisions, handoffs, control, and accountable completion.
      </p>
    </div>
  );
}
