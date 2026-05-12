import { CaseGraphic } from './CaseGraphic.jsx';

export function CaseHero({ hero }) {
  return (
    <>
      <div className="case-hero-copy reveal">
        <div>
          <div className="case-kicker">{hero.kicker}</div>
          <h2 className="case-title">{hero.title}</h2>
        </div>
        <p className="case-intro">{hero.intro}</p>
      </div>
      <div className="hero-graphic reveal">
        <CaseGraphic variant={hero.graphicVariant} />
        <p className="hero-caption">{hero.caption}</p>
      </div>
    </>
  );
}
