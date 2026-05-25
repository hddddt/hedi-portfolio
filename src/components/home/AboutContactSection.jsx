export function AboutContactSection() {
  return (
    <div className="home-about__inner">
      <h2 id="home-contact-title" className="sr-only">
        Contact
      </h2>
      <div className="home-about__cta">
        <p className="home-about__cta-line reveal">Let&apos;s bring structure</p>
        <p className="home-about__cta-line reveal" style={{ transitionDelay: '0.1s' }}>
          to complex AI systems.
        </p>
      </div>
      <address className="home-about__aside">
        <p className="home-about__aside-block reveal">
          <span className="home-about__aside-label">Location</span>
          Hamburg, Germany
        </p>
        <p className="home-about__aside-block reveal" style={{ transitionDelay: '0.08s' }}>
          <span className="home-about__aside-label">Email</span>
          <a href="mailto:hello@example.com">hello@example.com</a>
        </p>
        <p className="home-about__aside-block reveal" style={{ transitionDelay: '0.16s' }}>
          <span className="home-about__aside-label">LinkedIn</span>
          <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        </p>
        <p className="home-about__aside-block reveal" style={{ transitionDelay: '0.24s' }}>
          <span className="home-about__aside-label">CV</span>
          <a href="#top">CV</a>
        </p>
        <p className="home-about__bio reveal" style={{ transitionDelay: '0.32s' }}>
          I work across domain-heavy products where product ambition, technical systems, business operations, and human
          judgment overlap.
        </p>
      </address>
    </div>
  );
}
