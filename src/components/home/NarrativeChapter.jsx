import { useEffect, useRef, useState } from 'react';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';

export function NarrativeChapter({
  id,
  guideTargetId,
  sectionClassName = '',
  chapterNum,
  chapterLabel,
  ambientKey,
  children,
  ariaLabel,
  scrollMinHeight,
  hideRibbon = false,
  /** Sticky scroll track element — used for chapter active detection. */
  measureRef,
  /** Query inside chapter root (e.g. `.work-scroll`). */
  measureSelector,
}) {
  const domId = guideTargetId ?? id;
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  /** Ch 05 is very tall — IO ratio often dips while reading lower blocks; keep visible once mounted. */
  const [revealed, setRevealed] = useState(id === 'home-life-archive');
  const { registerChapter, activeId } = useNarrativeScroll();

  useEffect(() => {
    return registerChapter(
      id,
      () => {
        if (measureRef?.current) return measureRef.current;
        const root = ref.current;
        if (!root) return null;
        if (measureSelector) return root.querySelector(measureSelector);
        return root;
      },
      ambientKey,
    );
  }, [id, ambientKey, measureRef, measureSelector, registerChapter]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;
    const io = new IntersectionObserver(
      ([e]) => {
        const ratio = e?.intersectionRatio ?? 0;
        setInView(e.isIntersecting && ratio > (id === 'home-life-archive' ? 0.04 : 0.12));
      },
      {
        threshold: [0, 0.04, 0.12, 0.25, 0.5],
        rootMargin: id === 'home-life-archive' ? '120px 0px 240px 0px' : '0px',
      },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [id]);

  useEffect(() => {
    if (inView) setRevealed(true);
  }, [inView]);

  const isActive = activeId === id;

  return (
    <section
      ref={ref}
      id={domId}
      data-narrative-chapter={id}
      style={
        scrollMinHeight
          ? { minHeight: scrollMinHeight, height: scrollMinHeight }
          : undefined
      }
      className={`narrative-chapter home-section ${sectionClassName} ${inView ? 'narrative-chapter--inview' : ''} ${revealed ? 'narrative-chapter--revealed' : ''} ${isActive ? 'narrative-chapter--active' : ''} ${hideRibbon ? 'narrative-chapter--ribbonless' : ''}`.trim()}
      aria-label={ariaLabel ?? chapterLabel}
    >
      {!hideRibbon && (
        <header
          className={`narrative-chapter__ribbon motion-reveal${revealed ? ' is-visible' : ''}`}
        >
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
