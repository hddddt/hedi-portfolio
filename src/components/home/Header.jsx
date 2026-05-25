const LINKS = [
  { href: '#home-capabilities', label: 'Services' },
  { href: '#home-work-narrative', label: 'Work' },
  { href: '#home-contact', label: 'Me' },
];

export function Header() {
  return (
    <header className="home-header" role="banner">
      <span className="home-header__spacer" aria-hidden="true" />
      <a href="#home-landing" className="home-header__mark">
        HE&nbsp;DI
      </a>
      <nav className="home-header__nav" aria-label="Primary">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="home-header__link">
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
