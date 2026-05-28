import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';

export function ChapterRail() {
  const { chapters, activeId } = useNarrativeScroll();

  if (activeId === 'home-landing') {
    return null;
  }

  const railClass = [
    'chapter-rail',
    activeId === 'home-life-archive' ? 'chapter-rail--archive-muted' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <aside className={railClass} aria-label="Chapter index">
      <ol className="chapter-rail__list">
        {chapters.map((ch) => (
          <li key={ch.id} className={`chapter-rail__item ${activeId === ch.id ? 'is-active' : ''}`}>
            <a href={`#${ch.id}`} className="chapter-rail__link">
              <span className="chapter-rail__num">{ch.num}</span>
              <span className="chapter-rail__label">{ch.label}</span>
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
