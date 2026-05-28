const LINKS = [
  { href: '#home-capabilities', label: 'Capabilities' },
  { href: '#home-work-narrative', label: 'Work' },
  { href: '#home-approach', label: 'View' },
  { href: '#home-life-archive', label: 'Me' },
];

function scrollToSection(href) {
  const id = href.replace('#', '');
  const target = document.getElementById(id);
  if (!target) return;
  const block =
    id === 'home-work-narrative' || id === 'home-life-archive'
      ? 'start'
      : 'center';
  target.scrollIntoView({ behavior: 'smooth', block });
}

function scrollToFirstScreen() {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function Header() {
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
            className="home-header__link"
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
