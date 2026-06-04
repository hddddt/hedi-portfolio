import { createPortal } from 'react-dom';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';
import { NAV_CHAPTER_FIELD_HUE } from '../../data/fieldSemanticStates.js';
import { scrollToGuideTarget } from '../../utils/portfolioGuideTarget.js';

/** href matches NarrativeChapter `guideTargetId` (see portfolioGuideTarget.js). */
const LINKS = [
  { href: '#capabilities', targetId: 'capabilities', chapterId: 'home-capabilities', label: 'Capabilities' },
  { href: '#selected-work', targetId: 'selected-work', chapterId: 'home-work-narrative', label: 'Work' },
  { href: '#point-of-view', targetId: 'point-of-view', chapterId: 'home-approach', label: 'View' },
  { href: '#me', targetId: 'me', chapterId: 'home-life-archive', label: 'Me' },
];

function scrollToSection(targetId) {
  scrollToGuideTarget(targetId);
}

function scrollToFirstScreen() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function Header() {
  const { activeId } = useNarrativeScroll();
  const { setNavFieldHint } = useOrbScene();

  const header = (
    <header className="home-header home-header--portaled" role="banner">
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
              scrollToSection(l.targetId);
            }}
          >
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );

  if (typeof document === 'undefined') return header;
  return createPortal(header, document.body);
}
