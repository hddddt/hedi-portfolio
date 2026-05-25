export function Nav({ hidden, logo = 'HE DI', links }) {
  return (
    <header className={hidden ? 'nav nav--hidden' : 'nav'}>
      <a href="#top" className="nav-logo">
        {logo}
      </a>
      <nav className="nav-links" aria-label="Primary">
        {links.map((l) => (
          <a key={l.href} href={l.href}>
            {l.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
