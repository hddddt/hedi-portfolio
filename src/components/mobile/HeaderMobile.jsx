import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';
import { scrollToGuideTarget } from '../../utils/portfolioGuideTarget.js';

const LINKS = [
  { targetId: 'capabilities', chapterId: 'home-capabilities', label: 'Capabilities' },
  { targetId: 'selected-work', chapterId: 'home-work-narrative', label: 'Work' },
  { targetId: 'point-of-view', chapterId: 'home-approach', label: 'Point of View' },
  { targetId: 'me', chapterId: 'home-life-archive', label: 'Beyond Work' },
];

function scrollToFirstScreen() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Compact mobile header — brand + menu, no multi-row nav links.
 */
export function HeaderMobile() {
  const { activeId } = useNarrativeScroll();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuBtnRef = useRef(null);
  const menuRef = useRef(null);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  const navigate = useCallback(
    (targetId) => {
      scrollToGuideTarget(targetId);
      closeMenu();
    },
    [closeMenu],
  );

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen, closeMenu]);

  useEffect(() => {
    document.body.classList.toggle('mobile-nav-open', menuOpen);
    return () => document.body.classList.remove('mobile-nav-open');
  }, [menuOpen]);

  const header = (
    <>
      <header className="mobile-header" role="banner">
        <a
          href="#top"
          className="mobile-header__brand"
          onClick={(e) => {
            e.preventDefault();
            scrollToFirstScreen();
          }}
        >
          HEDI
        </a>
        <button
          ref={menuBtnRef}
          type="button"
          className="mobile-header__menu-btn"
          aria-expanded={menuOpen}
          aria-controls="mobile-header-menu"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? 'Close' : 'Menu'}
        </button>
      </header>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="mobile-header__scrim"
            aria-label="Close menu"
            onClick={closeMenu}
          />
          <nav
            id="mobile-header-menu"
            ref={menuRef}
            className="mobile-header__menu"
            aria-label="Primary"
          >
            {LINKS.map((link) => (
              <a
                key={link.targetId}
                href={`#${link.targetId}`}
                className={`mobile-header__menu-link${activeId === link.chapterId ? ' is-active' : ''}`}
                aria-current={activeId === link.chapterId ? 'page' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(link.targetId);
                }}
              >
                {link.label}
              </a>
            ))}
          </nav>
        </>
      ) : null}
    </>
  );

  if (typeof document === 'undefined') return header;
  return createPortal(header, document.body);
}
