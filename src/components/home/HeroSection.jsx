export function HeroSection() {
  return (
    <div className="home-hero__stage">
      <div className="home-hero__card">
        <div className="home-hero__blob" aria-hidden="true" />
        <svg className="home-hero__orbit" viewBox="0 0 400 400" aria-hidden="true">
          <circle
            cx="200"
            cy="200"
            r="168"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.75"
            strokeDasharray="3 9"
            opacity="0.35"
          />
          <circle
            cx="200"
            cy="200"
            r="132"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.5"
            strokeDasharray="2 12"
            opacity="0.22"
          />
        </svg>
        <div className="home-hero__content">
          <h1 className="home-hero__name reveal">Hedi</h1>
          <p className="home-hero__sub reveal">
            Product Designer
            <br />
            AI systems &amp; workflow
          </p>
        </div>
      </div>
    </div>
  );
}
