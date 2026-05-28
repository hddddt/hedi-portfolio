import { useEffect, useRef, useState } from 'react';
import { useFieldNarrative } from '../../context/FieldNarrativeContext.jsx';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { povBeats } from '../../data/pointOfViewChapters.js';
import { formatPovMarkers } from '../../data/povSources.js';

const BEAT_VH = 100;
const LINE_STAGGER_S = 0.12;

function PovMarkers({ markers }) {
  if (!markers) return null;
  return <span className="pov-footnote-marker">{formatPovMarkers(markers)}</span>;
}

function PovLine({ role, text, markers, index, isCurrent }) {
  return (
    <p className={`pov-line pov-line--${role}`} style={animStyle(isCurrent, index)}>
      {text}
      <PovMarkers markers={markers} />
    </p>
  );
}

function animStyle(isCurrent, index) {
  return isCurrent
    ? { '--line-i': index, '--stagger': `${LINE_STAGGER_S}s` }
    : undefined;
}

function PovSlide({ beat, isCurrent }) {
  let animIndex = 0;
  const nextAnim = () => {
    const i = animIndex;
    animIndex += 1;
    return animStyle(isCurrent, i);
  };

  if (beat.id === 'design-close') {
    const practice = beat.lines.find((l) => l.role === 'practice');
    const closingLead = beat.lines.find((l) => l.role === 'closingLead');
    const closingGravity = beat.lines.find((l) => l.role === 'closingGravity');

    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-design__upper">
          {practice && (
            <p className="pov-line pov-line--practice" style={nextAnim()}>
              {practice.text}
              <PovMarkers markers={practice.markers} />
            </p>
          )}
          <div className="pov-boundaries">
            {beat.lines
              .filter((l) => l.role === 'boundary')
              .map((line) => (
                <p key={line.text} className="pov-line pov-line--boundary">
                  {line.text}
                </p>
              ))}
          </div>
        </div>
        <div className="pov-closing">
          {closingLead && (
            <p className="pov-line pov-line--closingLead" style={nextAnim()}>
              {closingLead.text}
            </p>
          )}
          {closingGravity && (
            <p className="pov-line pov-line--closingGravity" style={nextAnim()}>
              {closingGravity.text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (beat.id === 'saw') {
    const setup = beat.lines.find((l) => l.role === 'setup');
    const core = beat.lines.find((l) => l.role === 'core');

    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-zone pov-zone--setup">
          {setup && (
            <p className="pov-line pov-line--setup" style={nextAnim()}>
              {setup.text}
            </p>
          )}
        </div>
        <div className="pov-zone pov-zone--weight">
          {core && (
            <p className="pov-line pov-line--core" style={nextAnim()}>
              {core.text}
              {core.markers ? <span className="pov-footnote-marker">{core.markers}</span> : null}
            </p>
          )}
          <div className="pov-pairs" style={nextAnim()}>
            {beat.lines
              .filter((l) => l.role === 'pair')
              .map((line) => (
                <p key={line.text} className="pov-line pov-line--pair">
                  {line.text}
                </p>
              ))}
          </div>
        </div>
      </div>
    );
  }

  if (beat.id === 'thesis-origin') {
    const label = beat.lines.find((l) => l.role === 'label');
    const gravity = beat.lines.find((l) => l.role === 'gravity');
    const origin = beat.lines.find((l) => l.role === 'origin');

    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-zone pov-zone--declare">
          {label && (
            <p className="pov-line pov-line--label" style={nextAnim()}>
              {label.text}
            </p>
          )}
          {gravity && (
            <p className="pov-line pov-line--gravity" style={nextAnim()}>
              {gravity.text}
              <PovMarkers markers={gravity.markers} />
            </p>
          )}
        </div>
        {origin && (
          <p className="pov-line pov-line--origin pov-zone--provenance" style={nextAnim()}>
            {origin.text}
          </p>
        )}
      </div>
    );
  }

  if (beat.id === 'believe') {
    return (
      <div
        className={`pov-slide pov-slide--${beat.id} ${isCurrent ? 'is-current' : ''}`}
        aria-hidden={!isCurrent}
      >
        <div className="pov-zone pov-zone--stance">
          {beat.lines.map((line) => (
            <PovLine
              key={`${line.role}-${line.text}`}
              role={line.role}
              text={line.text}
              markers={line.markers}
              index={animIndex++}
              isCurrent={isCurrent}
            />
          ))}
        </div>
      </div>
    );
  }

  return null;
}

export function ApproachSection() {
  const wrapRef = useRef(null);
  const { activeId } = useNarrativeScroll();
  const { setDepthFloat } = useFieldNarrative();
  const [beatIndex, setBeatIndex] = useState(0);
  const [scrollFloat, setScrollFloat] = useState(0);
  const beatIndexRef = useRef(0);

  const n = povBeats.length;
  const trackVh = n * BEAT_VH;

  useEffect(() => {
    beatIndexRef.current = beatIndex;
  }, [beatIndex]);

  useEffect(() => {
    if (activeId === 'home-approach') {
      setDepthFloat(scrollFloat);
    } else {
      setDepthFloat(null);
    }
    return () => setDepthFloat(null);
  }, [activeId, scrollFloat, setDepthFloat]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;

    const onScroll = () => {
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      const rect = el.getBoundingClientRect();
      const t = Math.min(Math.max(-rect.top, 0), total);
      const p = t / total;
      const fi = n <= 1 ? 0 : p * (n - 1);
      const bi = Math.min(n - 1, Math.max(0, Math.round(fi)));
      setScrollFloat(fi);
      if (bi !== beatIndexRef.current) {
        setBeatIndex(bi);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [n]);

  return (
    <section
      ref={wrapRef}
      className="pov-scroll"
      style={{ height: `${trackVh}vh`, minHeight: `${trackVh}vh` }}
      aria-labelledby="home-pov-title"
    >
      <h2 id="home-pov-title" className="sr-only">
        Point of View
      </h2>

      <div className="pov-scroll__snaps" aria-hidden="true">
        {povBeats.map((beat) => (
          <div key={beat.id} className="pov-scroll__snap" />
        ))}
      </div>

      <div className="pov-atmosphere" aria-hidden="true">
        <svg className="pov-curve" viewBox="0 0 400 800" preserveAspectRatio="none">
          <path
            d="M 300 48 Q 140 400 300 752"
            fill="none"
            stroke="rgba(255,255,255,0.035)"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="pov-pin">
        <div className="pov-pin__stage" key={beatIndex}>
          {povBeats.map((beat, i) => (
            <PovSlide key={beat.id} beat={beat} isCurrent={beatIndex === i} />
          ))}
        </div>
      </div>
    </section>
  );
}
