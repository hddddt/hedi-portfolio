import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { NAV_CHAPTER_FIELD_HUE } from '../../data/fieldSemanticStates.js';

const LINKS = [
  { href: '#home-capabilities', chapterId: 'home-capabilities', label: 'Capabilities' },
  { href: '#home-work-narrative', chapterId: 'home-work-narrative', label: 'Work' },
  { href: '#home-approach', chapterId: 'home-approach', label: 'View' },
  { href: '#home-life-archive', chapterId: 'home-life-archive', label: 'Me' },
];

function scrollToSection(href) {
  const id = href.replace('#', '');
  const target = document.getElementById(id);
  if (!target) return;
  const rectTop = target.getBoundingClientRect().top + window.scrollY;
  const nudge =
    id === 'home-life-archive'
      ? Math.max(24, Math.round(window.innerHeight * 0.04))
      : 0;
  window.scrollTo({
    top: Math.max(0, rectTop + nudge),
    behavior: 'smooth',
  });
}

function scrollToFirstScreen() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function Header() {
  const { activeId } = useNarrativeScroll();
  const { setNavFieldHint } = useOrbScene();

  return (
    <header className="home-header" role="banner">
      <span className="home-header__spacer" aria-hidden="true" />
      <a
        href="#top"
        className="home-header__mark"
        onClick={(e) => {
          e.preventDefault();
          scrollToFirstScreen();
        }}
      >
        HE&nbsp;DI
      </a>
      <nav className="home-header__nav" aria-label="Primary">
        {LINKS.map((l) => (
          <a
            key={l.href}
            href={l.href}
            className={`home-header__link${activeId === l.chapterId ? ' is-active' : ''}`}
            data-nav-hue={NAV_CHAPTER_FIELD_HUE[l.chapterId]}
            aria-current={activeId === l.chapterId ? 'true' : undefined}
            onMouseEnter={() =>
              setNavFieldHint({ hue: NAV_CHAPTER_FIELD_HUE[l.chapterId], strength: 0.28 })
            }
            onMouseLeave={() => setNavFieldHint(null)}
            onFocus={() =>
              setNavFieldHint({ hue: NAV_CHAPTER_FIELD_HUE[l.chapterId], strength: 0.28 })
            }
            onBlur={() => setNavFieldHint(null)}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection(l.href);
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
