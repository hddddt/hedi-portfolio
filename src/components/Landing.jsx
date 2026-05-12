export default function Landing() {
  return (
    <section className="landing" aria-label="Portfolio landing">
      <div className="hero-copy reveal">
        <div className="hero-eyebrow">AI Systems Portfolio</div>
        <h1 className="hero-title">
          Every
          <br />
          autonomous
          <br />
          system contains
          <br />
          a decision about
          <br />
          humanity.
        </h1>
        <p className="hero-sub">I design the boundaries where responsibility remains legible.</p>
        <p className="hero-body">
          AI systems do not only generate outputs. They define who acts, when humans intervene, what remains visible, and where responsibility moves.
        </p>
      </div>
      <div className="hero-field" aria-hidden="true">
        <div className="boundary-line" />
        <div className="trace" />
      </div>
      <a className="scroll-cue" href="#overview">
        <span className="line" />
        <span>View selected work</span>
      </a>
    </section>
  );
}
