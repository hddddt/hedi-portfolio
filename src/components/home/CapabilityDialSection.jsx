import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { homeCapabilities } from '../../data/homeScrollChapters.js';

const ARC_PATH_D = 'M 108 36 Q 12 400 108 764';

export function CapabilityDialSection() {
  const wrapRef = useRef(null);
  const pathRef = useRef(null);
  const [floatIndex, setFloatIndex] = useState(0);
  const [panelIndex, setPanelIndex] = useState(0);
  const [dot, setDot] = useState({ x: 108, y: 400 });
  const n = homeCapabilities.length;

  useEffect(() => {
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = Math.max(1, rect.height - window.innerHeight);
      const t = Math.min(Math.max(-rect.top, 0), total);
      const p = t / total;
      const fi = n <= 1 ? 0 : p * (n - 1);
      const pi = Math.min(n - 1, Math.max(0, Math.round(fi)));
      setFloatIndex(fi);
      setPanelIndex(pi);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [n]);

  useLayoutEffect(() => {
    const path = pathRef.current;
    if (!path) return;
    const len = path.getTotalLength();
    const tAlong = n <= 1 ? 0 : (floatIndex / (n - 1)) * len;
    const pt = path.getPointAtLength(tAlong);
    setDot({ x: pt.x, y: pt.y });
  }, [floatIndex, n]);

  const bumpScroll = useCallback(
    (dir) => {
      const el = wrapRef.current;
      if (!el) return;
      const total = Math.max(1, el.offsetHeight - window.innerHeight);
      if (total <= 0) return;
      const step = total / Math.max(1, n - 1);
      window.scrollBy({ top: step * dir, behavior: 'smooth' });
    },
    [n],
  );

  const onKey = useCallback(
    (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        bumpScroll(1);
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        bumpScroll(-1);
      }
    },
    [bumpScroll],
  );

  return (
    <section ref={wrapRef} className="capability-scroll">
      <div className="capability-sticky">
        <div
          className="cap-dial cap-dial--wheel"
          tabIndex={0}
          role="region"
          aria-label="What I do. Scroll this chapter to move through capabilities, or use arrow keys."
          aria-valuemin={1}
          aria-valuemax={n}
          aria-valuenow={panelIndex + 1}
          onKeyDown={onKey}
        >
          <div className="cap-dial__grain" aria-hidden="true" />
          <p className="cap-dial__kicker">product behavior</p>

          <div className="cap-dial__stage">
            <div className="cap-dial__wheel cap-dial__wheel--minimal" aria-hidden="true">
              <svg
                className="cap-dial__arc cap-dial__arc--interactive"
                viewBox="0 0 120 800"
                preserveAspectRatio="xMinYMid slice"
              >
                <path
                  ref={pathRef}
                  d={ARC_PATH_D}
                  fill="none"
                  stroke="rgba(255,255,255,0.38)"
                  strokeWidth="1"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  className="cap-dial__arc-dot-circle"
                  cx={dot.x}
                  cy={dot.y}
                  r={4.5}
                />
              </svg>
            </div>

            <div className="cap-dial__main">
              <div className="cap-dial__state-stack" aria-live="polite">
                {homeCapabilities.map((cap, i) => (
                  <div
                    key={cap.id}
                    className={`cap-dial__state-layer ${panelIndex === i ? 'is-active' : ''}`}
                    aria-hidden={panelIndex !== i}
                  >
                    <h2 className="cap-dial__headline">{cap.headline}</h2>
                    <p className="cap-dial__lede">{cap.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="cap-dial__aside">
              <div className="cap-dial__pill-stack">
                {homeCapabilities.map((cap, i) => (
                  <ul
                    key={cap.id}
                    className={`cap-dial__pills cap-dial__pill-group ${panelIndex === i ? 'is-active' : ''}`}
                    aria-hidden={panelIndex !== i}
                  >
                    {cap.pills.map((pill, j) => (
                      <li
                        key={pill}
                        className="cap-dial__pill"
                        style={{ transitionDelay: panelIndex === i ? `${j * 40}ms` : '0ms' }}
                      >
                        {pill}
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
