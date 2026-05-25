import { useEffect, useRef, useState } from 'react';
import { WorkCaseDetail } from './WorkCaseDetail.jsx';

function visualRole(i, activeIdx) {
  const offset = i - activeIdx;
  if (offset === 0) return 'is-active';
  if (Math.abs(offset) === 1) return 'is-adjacent';
  return 'is-far';
}

function caseOnesDigit(num) {
  const digits = String(num ?? '').replace(/\D/g, '');
  return digits.slice(-1) || '1';
}

function caseOpenLabel(item) {
  const title = item.narrativeBlock?.title ?? item.title;
  return `Open ${title} case study`;
}

export function WorkNarrativeSection({ cases = [] }) {
  const wrapRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [openCaseId, setOpenCaseId] = useState(null);
  const prevIdxRef = useRef(0);
  const [flipDir, setFlipDir] = useState(1);

  const n = cases.length;
  const idx = n ? Math.min(activeIdx, n - 1) : 0;
  const c = n ? cases[idx] : null;

  useEffect(() => {
    if (idx === prevIdxRef.current) return;
    setFlipDir(idx > prevIdxRef.current ? 1 : -1);
    prevIdxRef.current = idx;
  }, [idx]);

  useEffect(() => {
    if (!n || openCaseId) return undefined;
    const onScroll = () => {
      const el = wrapRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const scrollable = Math.max(1, rect.height - window.innerHeight);
      const traveled = Math.min(Math.max(-rect.top, 0), scrollable);
      const step = scrollable / n;
      const nextIdx = n <= 1 ? 0 : Math.min(n - 1, Math.floor(traveled / step));
      setActiveIdx(nextIdx);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, [n, openCaseId]);

  useEffect(() => {
    if (!openCaseId) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpenCaseId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [openCaseId]);

  if (!n || !c) {
    return (
      <div className="work-narrative work-narrative--empty">
        <p className="work-narrative__empty">No case studies to show yet.</p>
      </div>
    );
  }

  const openItem = openCaseId ? cases.find((item) => item.id === openCaseId) : null;
  const trackVh = n * 100;

  return (
    <>
    <section
      ref={wrapRef}
      className={`work-scroll${openItem ? ' work-scroll--detail-open' : ''}`}
      aria-hidden={openItem ? true : undefined}
      inert={openItem ? true : undefined}
      style={{ height: `${trackVh}vh`, minHeight: `${trackVh}vh` }}
      aria-roledescription="carousel"
      aria-label="Selected work"
    >
      <div className="work-sticky">
        <div className="work-narrative__glow" style={{ '--wn-accent': c.accent }} aria-hidden="true" />
        <div className="work-narrative__frame">
          <div className="work-narrative__rail" aria-label={`Case 0${idx + 1} of 0${n}`}>
            <div className="work-narrative__rail-meter" aria-hidden="true">
              <span className="work-narrative__rail-digit work-narrative__rail-digit--lead">0</span>
              <span
                className="work-narrative__rail-flip"
                data-flip-dir={flipDir > 0 ? 'forward' : 'back'}
              >
                <span
                  key={`${idx}-${flipDir}`}
                  className="work-narrative__rail-digit work-narrative__rail-digit--ones"
                >
                  {caseOnesDigit(cases[idx]?.num)}
                </span>
              </span>
            </div>
            <span className="sr-only" aria-live="polite">
              {`0${idx + 1}`}
            </span>
          </div>

          <div className="work-narrative__stage">
            {cases.map((item, i) => {
              const offset = i - idx;
              if (Math.abs(offset) > 1) return null;
              const role = visualRole(i, idx);
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`work-narrative__visual ${role}`}
                  style={{
                    '--slide-offset': offset,
                    zIndex: offset === 0 ? 10 : 8 - Math.abs(offset),
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenCaseId(item.id);
                  }}
                  aria-label={caseOpenLabel(item)}
                >
                  <span className="work-narrative__visual-inner">
                    {item.coverSrc ? (
                      <img
                        className="work-narrative__cover"
                        src={item.coverSrc}
                        alt=""
                        loading={offset === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    ) : null}
                    <span className="work-narrative__visual-hint">View case</span>
                  </span>
                </button>
              );
            })}
          </div>

          <div className="work-narrative__copy">
            {cases.map((item, i) => (
              <article
                key={item.id}
                className={`work-narrative__layer ${i === idx ? 'is-active' : ''}`}
                aria-hidden={i !== idx}
              >
                {item.narrativeBlock ? (
                  <>
                    <h3 className="work-narrative__title">{item.title}</h3>
                    <p className="work-narrative__intro">{item.narrativeBlock.subtitle}</p>
                    <ul className="work-narrative__bullets">
                      {item.narrativeBlock.bullets.map((line) => (
                        <li key={line} className="work-narrative__bullet">
                          {line}
                        </li>
                      ))}
                    </ul>
                    <ul className="work-narrative__tags" aria-label="Key signals">
                      {item.narrativeBlock.tags.map((tag) => (
                        <li key={tag}>
                          <span className="work-narrative__tag">{tag}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h3 className="work-narrative__title">{item.title}</h3>
                    <p className="work-narrative__intro">{item.layer}</p>
                    <p className="work-narrative__intro work-narrative__intro--muted">
                      {item.tension}
                    </p>
                    <ul className="work-narrative__tags">
                      <li>
                        <span className="work-narrative__tag">{item.signal}</span>
                      </li>
                    </ul>
                  </>
                )}
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
    {openItem ? (
      <WorkCaseDetail
        key={openItem.id}
        item={openItem}
        allCases={cases}
        onSelectCase={setOpenCaseId}
        onClose={() => {
          setOpenCaseId(null);
          requestAnimationFrame(() => {
            wrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          });
        }}
      />
    ) : null}
    </>
  );
}
