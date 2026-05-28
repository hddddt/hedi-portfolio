export function MeContactActions() {
  return (
    <div className="home-about__actions">
      <a
        className="home-about__cta-btn"
        href="https://www.linkedin.com/"
        target="_blank"
        rel="noreferrer"
      >
        LinkedIn ↗
      </a>
      <a className="home-about__cta-btn home-about__cta-btn--secondary" href="mailto:hedi-de@outlook.com">
        Email ↗
      </a>
    </div>
  );
}

export function AboutContactSection() {
  return (
    <div className="home-about__inner">
      <h2 id="home-contact-title" className="sr-only">
        Contact
      </h2>
      <MeContactActions />
    </div>
  );
}
