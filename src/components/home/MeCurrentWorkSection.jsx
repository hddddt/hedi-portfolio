const RESOA_BODY = [
  'An independent product where I turn pattern recognition',
  'into a behavior-awareness system.',
];

export function MeCurrentWorkSection() {
  return (
    <section
      className="home-me__current-work motion-reveal-group"
      aria-labelledby="home-me-current-work-title"
    >
      <div className="home-me__current-work-divider motion-reveal-child" aria-hidden="true" />
      <p className="home-me__current-work-label motion-reveal-child">Some other work</p>
      <h2 id="home-me-current-work-title" className="home-me__current-work-title motion-reveal-child">
        Resoa
      </h2>
      <div className="home-me__current-work-body motion-reveal-child">
        {RESOA_BODY.map((line) => (
          <p key={line} className="home-me__current-work-line">
            {line}
          </p>
        ))}
      </div>
      <p className="home-me__current-work-status motion-reveal-child">In development.</p>
      <a
        className="home-me__current-work-cta motion-reveal-child"
        href="https://getresoa.netlify.app/"
        target="_blank"
        rel="noreferrer"
      >
        → Early access
      </a>
    </section>
  );
}
