import { useEffect, useState } from 'react';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { useProjectAccess } from '../../context/ProjectAccessContext.jsx';
import { WorkCaseDetailMobile } from './WorkCaseDetailMobile.jsx';

function formatCaseNum(num) {
  const digits = String(num ?? '').replace(/\D/g, '');
  return digits ? digits.padStart(2, '0').slice(-2) : '01';
}

function titleCase(str) {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bAi\b/g, 'AI');
}

/**
 * Mobile work section — linear case list, no pinned stage.
 */
export function WorkMobile({ cases = [] }) {
  const { unlocked, requestAccess } = useProjectAccess();
  const { setCaseDetailOpen } = useOrbScene();
  const [openCaseId, setOpenCaseId] = useState(null);

  const openItem = openCaseId ? cases.find((item) => item.id === openCaseId) : null;

  useEffect(() => {
    setCaseDetailOpen(Boolean(openCaseId));
    return () => setCaseDetailOpen(false);
  }, [openCaseId, setCaseDetailOpen]);

  if (!cases.length) {
    return (
      <div className="mobile-work mobile-work--empty">
        <p>No case studies to show yet.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-work" aria-labelledby="mobile-work-title">
        <header className="mobile-section-head">
          <h2 id="mobile-work-title" className="mobile-section-head__title">
            Selected Work
          </h2>
          <p className="mobile-section-head__lede">
            Four cases showing AI workflow, traceability, control, and continuity.
          </p>
        </header>

        <ol className="mobile-work__list">
          {cases.map((item, i) => {
            const block = item.narrativeBlock;
            const subtitle = block?.subtitle ?? item.layer;
            const signals = block?.primaryTags?.slice(0, 3) ?? [item.signal].filter(Boolean);
            const locked = !unlocked;

            return (
              <li key={item.id} id={`case-0${i + 1}`} className="mobile-work__item">
                <article className="mobile-work__card">
                  <div className="mobile-work__card-head">
                    <span className="mobile-work__code">{formatCaseNum(item.num)}</span>
                    <h3 className="mobile-work__title">{titleCase(block?.title ?? item.title)}</h3>
                    {subtitle ? <p className="mobile-work__subtitle">{subtitle}</p> : null}
                  </div>

                  {signals.length ? (
                    <p className="mobile-work__signals">{signals.join(' · ')}</p>
                  ) : null}

                  {item.coverSrc ? (
                    <div className="mobile-work__preview">
                      <img
                        src={item.coverSrc}
                        alt=""
                        loading={i <= 1 ? 'eager' : 'lazy'}
                        decoding="async"
                        className="mobile-work__cover"
                      />
                    </div>
                  ) : null}

                  <button
                    type="button"
                    className="mobile-work__open"
                    onClick={() => {
                      if (locked) {
                        requestAccess(item.id);
                        return;
                      }
                      setOpenCaseId(item.id);
                    }}
                    aria-label={locked ? `${item.title} — enter key to unlock` : `Open ${item.title}`}
                  >
                    {locked ? 'Enter key to unlock' : 'Open case →'}
                  </button>
                </article>
              </li>
            );
          })}
        </ol>
      </div>

      {openItem ? (
        <WorkCaseDetailMobile
          item={openItem}
          allCases={cases}
          onSelectCase={setOpenCaseId}
          onClose={() => {
            setOpenCaseId(null);
            window.requestAnimationFrame(() => {
              document.getElementById('selected-work')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
          }}
        />
      ) : null}
    </>
  );
}
