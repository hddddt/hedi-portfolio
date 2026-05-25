import { useEffect, useRef, useState } from 'react';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';

export function NarrativeChapter({
  id,
  sectionClassName = '',
  chapterNum,
  chapterLabel,
  ambientKey,
  children,
  ariaLabel,
  scrollMinHeight,
  hideRibbon = false,
}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  const { registerChapter, activeId } = useNarrativeScroll();

  useEffect(() => {
    return registerChapter(id, () => ref.current, ambientKey);
  }, [id, ambientKey, registerChapter]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting && e.intersectionRatio > 0.12),
      { threshold: [0, 0.12, 0.25, 0.5] },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const isActive = activeId === id;

  return (
    <section
      ref={ref}
      id={id}
      data-narrative-chapter={id}
      style={
        scrollMinHeight
          ? { minHeight: scrollMinHeight, height: scrollMinHeight }
          : undefined
      }
      className={`narrative-chapter home-section ${sectionClassName} ${inView ? 'narrative-chapter--inview' : ''} ${isActive ? 'narrative-chapter--active' : ''} ${hideRibbon ? 'narrative-chapter--ribbonless' : ''}`.trim()}
      aria-label={ariaLabel ?? chapterLabel}
    >
      {!hideRibbon && (
        <header className="narrative-chapter__ribbon">
          <span className="narrative-chapter__ribbon-num">{chapterNum}</span>
          <span className="narrative-chapter__ribbon-sep" aria-hidden="true">
            ·
          </span>
          <span className="narrative-chapter__ribbon-label">{chapterLabel}</span>
        </header>
      )}
      <div className="narrative-chapter__body">{children}</div>
    </section>
  );
}
