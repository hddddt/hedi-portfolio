import { contactSection } from '../../data/portfolio.js';

export function ContactSection() {
  const { title, closingLine, links } = contactSection;

  return (
    <section
      className="portfolio-section portfolio-section--contact contact-end"
      id="contact"
      aria-labelledby="contact-title"
    >
      <div className="contact-end__layout">
        <div className="contact-end__main">
          <h2 className="contact-end__title" id="contact-title">
            {title}
          </h2>
          <p className="contact-end__line">{closingLine}</p>
          <ul className="contact-end__links">
            {links.map((link) => (
              <li key={link.id} className={link.optional ? 'contact-end__links-item contact-end__links-item--optional' : 'contact-end__links-item'}>
                <a
                  href={link.href}
                  className={`contact-end__link${link.optional ? ' contact-end__link--optional' : ''}`}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
        <aside className="contact-end__mark" aria-hidden="true">
          <div className="contact-end__mark-frame">
            <span className="contact-end__mark-corner contact-end__mark-corner--tl" />
            <span className="contact-end__mark-corner contact-end__mark-corner--tr" />
            <span className="contact-end__mark-corner contact-end__mark-corner--bl" />
            <span className="contact-end__mark-corner contact-end__mark-corner--br" />
            <span className="contact-end__mark-letter">H</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
