import { heroSection } from '../../data/portfolio.js';

export function HeroSection() {
  return (
    <section className="hero-identity" id="hero" aria-label="Identity">
      <div className="hero-identity__grid">
        <div className="hero-identity__copy reveal">
          <p className="hero-identity__eyebrow">{heroSection.eyebrow}</p>
          <p className="hero-identity__positioning">{heroSection.positioning}</p>
          <ul className="hero-identity__tags" aria-label="Focus areas">
            {heroSection.tags.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>

        <aside className="hero-identity__mark reveal" aria-label="Identity stage">
          {/*
            TODO: Replace this static identity stage with a corrected Jitter / Lottie export when ready
            (see src/assets/animations/hero-name-motion.json — not rendered until asset is suitable).
          */}
          <div className="hero-identity__stage-frame" role="presentation">
            <span className="hero-identity__stage-corner hero-identity__stage-corner--tl" aria-hidden />
            <span className="hero-identity__stage-corner hero-identity__stage-corner--tr" aria-hidden />
            <span className="hero-identity__stage-corner hero-identity__stage-corner--bl" aria-hidden />
            <span className="hero-identity__stage-corner hero-identity__stage-corner--br" aria-hidden />
            <div className="hero-identity__stage-trace" aria-hidden="true">
              <svg
                className="hero-identity__stage-orbit"
                viewBox="0 0 800 420"
                preserveAspectRatio="xMidYMid meet"
                xmlns="http://www.w3.org/2000/svg"
              >
                <ellipse
                  cx="400"
                  cy="210"
                  rx="320"
                  ry="150"
                  fill="none"
                  stroke="rgba(10,9,8,.1)"
                  strokeWidth="1"
                  transform="rotate(-8 400 210)"
                />
                <path
                  fill="none"
                  stroke="rgba(10,9,8,.07)"
                  strokeWidth="1"
                  strokeDasharray="5 9"
                  d="M 40 320 Q 260 80 520 260 T 780 140"
                />
                <path
                  fill="none"
                  stroke="rgba(10,9,8,.06)"
                  strokeWidth="1"
                  d="M 120 60 C 280 200 480 40 680 180"
                />
              </svg>
            </div>
            <div className="hero-identity__stage-body">
              <h1 className="hero-identity__stage-name">{heroSection.name}</h1>
              <div className="hero-identity__stage-role">
                {heroSection.stageRoleLines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
