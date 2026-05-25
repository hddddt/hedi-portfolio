export function SectionLabel({ children, className = '', id }) {
  return (
    <p className={`section-label ${className}`.trim()} id={id}>
      {children}
    </p>
  );
}
