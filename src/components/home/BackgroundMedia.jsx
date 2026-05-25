/**
 * Placeholder for future WebM / canvas backgrounds.
 * Prototype: soft glow + optional grain via CSS only.
 */
export function BackgroundMedia({ variant = 'default', className = '', children }) {
  return (
    <div className={`home-bg-media home-bg-media--${variant} ${className}`.trim()} aria-hidden="true">
      <span className="home-bg-media__glow" />
      {children}
    </div>
  );
}
