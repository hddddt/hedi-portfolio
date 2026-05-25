const PARAGRAPHS = [
  [
    'I bring structure to complex products where AI, workflows, decisions, and ownership',
    'need to become usable in real operations.',
  ],
  [
    'My work sits between product design, enterprise workflows, and human-AI collaboration —',
    'defining how systems support decisions, handoffs, control, and completion.',
  ],
];

export function IdentitySection() {
  let lineIndex = 0;

  return (
    <>
      <div className="home-identity__blob" aria-hidden="true" />
      <div className="home-identity__inner">
        <h2 id="home-identity-title" className="sr-only">
          Positioning
        </h2>
        <div className="home-identity__statement">
          {PARAGRAPHS.map((lines, pi) => (
            <div key={pi} className="home-identity__para">
              {lines.map((line) => {
                const i = lineIndex;
                lineIndex += 1;
                return (
                  <span
                    key={`${pi}-${i}`}
                    className="home-identity__line reveal"
                    style={{ transitionDelay: `${i * 0.12}s` }}
                  >
                    {line}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
