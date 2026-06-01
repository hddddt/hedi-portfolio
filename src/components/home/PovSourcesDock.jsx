import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { POV_SOURCES } from '../../data/povSources.js';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';

const POV_CHAPTER_ID = 'home-approach';

export function PovSourcesDock() {
  const { activeId } = useNarrativeScroll();
  const panelId = useId();
  const dockRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const visible = activeId === POV_CHAPTER_ID;
  const count = POV_SOURCES.length;

  useEffect(() => {
    if (!visible) {
      setOpen(false);
      setExpandedId(null);
    }
  }, [visible]);

  useEffect(() => {
    const onOpenFromGuide = () => {
      if (visible) setOpen(true);
    };
    window.addEventListener('portfolio-guide-open-sources', onOpenFromGuide);
    return () => window.removeEventListener('portfolio-guide-open-sources', onOpenFromGuide);
  }, [visible]);

  const close = useCallback(() => {
    setOpen(false);
    setExpandedId(null);
  }, []);

  useEffect(() => {
    if (!open) return undefined;

    const onKey = (e) => {
      if (e.key === 'Escape') close();
    };

    const onPointer = (e) => {
      if (dockRef.current && !dockRef.current.contains(e.target)) {
        close();
      }
    };

    window.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      window.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open, close]);

  const toggleSource = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!visible) return null;

  return (
    <div
      ref={dockRef}
      className={`pov-sources-dock${open ? ' pov-sources-dock--open' : ''}`}
    >
      {open ? (
        <div
          id={panelId}
          className="pov-sources-dock__panel"
          role="region"
          aria-label="Sources"
        >
          <p className="pov-sources-dock__header">
            Sources <span className="pov-sources-dock__count">[{count}]</span>
          </p>
          <ol className="pov-sources-dock__list">
            {POV_SOURCES.map((source) => {
              const isExpanded = expandedId === source.id;
              return (
                <li key={source.id} className="pov-sources-dock__item">
                  <button
                    type="button"
                    className="pov-sources-dock__citation"
                    aria-expanded={isExpanded}
                    onClick={() => toggleSource(source.id)}
                  >
                    <span className="pov-sources-dock__num" aria-hidden="true">
                      {source.id}
                    </span>
                    <span className="pov-sources-dock__cite">{source.citation}</span>
                  </button>
                  {isExpanded ? (
                    <p className="pov-sources-dock__detail">{source.detail}</p>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      <button
        type="button"
        className="pov-sources-dock__trigger"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        Sources <span className="pov-sources-dock__count">[{count}]</span>
      </button>
    </div>
  );
}
