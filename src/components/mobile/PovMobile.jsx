const MOBILE_POV_BEATS = [
  {
    num: '01',
    text: 'AI output still needs ownership.',
  },
  {
    num: '02',
    text: 'Human judgment needs visible checkpoints.',
  },
  {
    num: '03',
    text: 'Automation needs recovery paths.',
  },
  {
    num: '04',
    text: 'Completion is a designed operating layer.',
  },
];

/**
 * Mobile Point of View — article-like editorial blocks.
 */
export function PovMobile() {
  return (
    <div className="mobile-pov" aria-labelledby="mobile-pov-title">
      <header className="mobile-section-head">
        <h2 id="mobile-pov-title" className="mobile-section-head__title">
          Point of View
        </h2>
        <p className="mobile-section-head__lede">The gap is not capability. It is completion.</p>
      </header>

      <ol className="mobile-pov__list">
        {MOBILE_POV_BEATS.map((beat) => (
          <li key={beat.num} className="mobile-pov__item">
            <span className="mobile-pov__num">{beat.num}</span>
            <p className="mobile-pov__text">{beat.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
