const PATH_OPENING = [
  'I started in software engineering.',
  'After a year, I left',
  'not because I disliked the logic,',
  'but because I became more drawn to the questions around it:',
  'from how to build systems to what those systems should make possible.',
];

const PATH_MIDDLE = [
  'That question led to my design path in Germany',
  'from industrial design, then to the boundary where objects meet behavior:',
  'hardware-software interaction, HMI, enterprise SaaS.',
];

const PATH_REFLECTION = [
  'Across each shift, the question stayed the same:',
  'when does making start to matter beyond the act of making?',
  'Looking back, the path was less a series of switches',
  'than a repeated search for the point',
  'where creation becomes consequential:',
];

const PATH_PULL = [
  'where ideas become products,',
  'products shape behavior,',
  'and behavior becomes part of how people live, work, and decide.',
];

const PATH_THESIS = [
  'AI makes that question sharper.',
  'When making becomes easier,',
  'judgment becomes the real constraint.',
];

function PathLines({ lines, linesClassName = '' }) {
  return (
    <div className={`home-me-path__lines${linesClassName ? ` ${linesClassName}` : ''}`.trim()}>
      {lines.map((line) => (
        <p key={line} className="home-me-path__p">
          {line}
        </p>
      ))}
    </div>
  );
}

export function MePathSection() {
  return (
    <section className="home-me__path" aria-labelledby="home-me-path-title">
      <h2 id="home-me-path-title" className="sr-only">
        Path
      </h2>

      <div className="home-me-path__inner">
        <p className="home-me-path__kicker" aria-hidden="true">
          01 / PATH
        </p>

        <div className="home-me-path__part home-me-path__part--opening">
          <PathLines lines={PATH_OPENING} />
        </div>

        <div className="home-me-path__part home-me-path__part--middle">
          <PathLines lines={PATH_MIDDLE} />
          <PathLines lines={PATH_REFLECTION} linesClassName="home-me-path__lines--tight" />
        </div>

        <div className="home-me-path__pull">
          <PathLines lines={PATH_PULL} />
        </div>

        <div className="home-me-path__part home-me-path__part--thesis">
          <PathLines lines={PATH_THESIS} />
        </div>
      </div>
    </section>
  );
}
