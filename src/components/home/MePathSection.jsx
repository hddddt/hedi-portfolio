import { useMemo } from 'react';
import { usePovArchiveHandoff } from '../../context/PovArchiveHandoffContext.jsx';
import {
  pathBlockStyle,
  pathDividerStyle,
  pathKickerStyle,
  pathLineStyle,
  pathPortraitStyle,
} from '../../utils/povArchiveHandoff.js';

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

function PathLines({ lines, blockIndex, handoff, reducedMotion, linesClassName = '', lineOffset = 0 }) {
  return (
    <div className={`home-me-path__lines${linesClassName ? ` ${linesClassName}` : ''}`.trim()}>
      {lines.map((line, i) => (
        <p
          key={line}
          className="home-me-path__p"
          style={pathLineStyle(handoff, blockIndex, lineOffset + i, reducedMotion)}
        >
          {line}
        </p>
      ))}
    </div>
  );
}

export function MePathSection() {
  const { handoff, reducedMotion } = usePovArchiveHandoff();

  return (
    <section className="home-me__path" aria-labelledby="home-me-path-title">
      <h2 id="home-me-path-title" className="sr-only">
        Path
      </h2>

      <div className="home-me-path__inner">
        <p
          className="home-me-path__kicker"
          aria-hidden="true"
          style={pathKickerStyle(handoff, reducedMotion)}
        >
          01 / PATH
        </p>

        <div
          className="home-me-path__part home-me-path__part--opening"
          style={pathBlockStyle(handoff, 0, reducedMotion)}
        >
          <PathLines lines={PATH_OPENING} blockIndex={0} handoff={handoff} reducedMotion={reducedMotion} />
        </div>

        <div
          className="home-me-path__part home-me-path__part--middle"
          style={pathBlockStyle(handoff, 1, reducedMotion)}
        >
          <PathLines lines={PATH_MIDDLE} blockIndex={1} handoff={handoff} reducedMotion={reducedMotion} />
          <PathLines
            lines={PATH_REFLECTION}
            blockIndex={1}
            handoff={handoff}
            reducedMotion={reducedMotion}
            linesClassName="home-me-path__lines--tight"
            lineOffset={PATH_MIDDLE.length}
          />
        </div>

        <div
          className="home-me-path__pull"
          style={pathBlockStyle(handoff, 2, reducedMotion)}
        >
          <PathLines lines={PATH_PULL} blockIndex={2} handoff={handoff} reducedMotion={reducedMotion} />
        </div>

        <div
          className="home-me-path__part home-me-path__part--thesis"
          style={pathBlockStyle(handoff, 3, reducedMotion)}
        >
          <PathLines lines={PATH_THESIS} blockIndex={3} handoff={handoff} reducedMotion={reducedMotion} />
        </div>
      </div>
    </section>
  );
}

export function MePathPortrait() {
  const { handoff, reducedMotion } = usePovArchiveHandoff();

  return (
    <figure className="home-me-path__portrait" style={pathPortraitStyle(handoff, reducedMotion)}>
      <img
        src="/images/case1/hedi.jpg"
        alt="Hedi"
        width={480}
        height={640}
        decoding="async"
      />
    </figure>
  );
}

export function MePathDivider() {
  const { handoff, reducedMotion } = usePovArchiveHandoff();
  const style = useMemo(
    () => pathDividerStyle(handoff, reducedMotion),
    [handoff, reducedMotion],
  );
  return <div className="home-me__path-divider" aria-hidden="true" style={style} />;
}
