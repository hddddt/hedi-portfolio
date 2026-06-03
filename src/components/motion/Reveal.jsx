/**
 * In-view reveal — pairs with motion.css (.motion-reveal).
 */

export function Reveal({
  as: Tag = 'div',
  className = '',
  variant = '',
  children,
  ...rest
}) {
  const variantClass = variant ? ` motion-reveal--${variant}` : '';
  return (
    <Tag className={`motion-reveal${variantClass} ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}

export function RevealGroup({ className = '', stagger = 'sm', children, ...rest }) {
  const staggerClass = stagger === 'md' ? ' motion-reveal-group--md' : '';
  return (
    <div className={`motion-reveal-group${staggerClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

export function RevealChild({ as: Tag = 'div', className = '', children, ...rest }) {
  return (
    <Tag className={`motion-reveal-child ${className}`.trim()} {...rest}>
      {children}
    </Tag>
  );
}
