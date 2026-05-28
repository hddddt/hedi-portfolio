const RESOA_BODY = [
  'An independent product where I turn pattern recognition',
  'into a behavior-awareness system.',
];

export function MeCurrentWorkSection() {
  return (
    <section className="home-me__current-work" aria-labelledby="home-me-current-work-title">
      <div className="home-me__current-work-divider" aria-hidden="true" />
      <p className="home-me__current-work-label">Some other work</p>
      <h2 id="home-me-current-work-title" className="home-me__current-work-title">
        Resoa
      </h2>
      <div className="home-me__current-work-body">
        {RESOA_BODY.map((line) => (
          <p key={line} className="home-me__current-work-line">
            {line}
          </p>
        ))}
      </div>
      <p className="home-me__current-work-status">In development.</p>
      <a
        className="home-me__current-work-cta"
        href="https://getresoa.netlify.app/"
        target="_blank"
        rel="noreferrer"
      >
        → Early access
      </a>
    </section>
  );
}
