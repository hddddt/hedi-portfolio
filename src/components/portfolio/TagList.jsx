export function TagList({ tags, className = '', ariaLabel = 'Topics' }) {
  if (!tags?.length) return null;
  return (
    <ul className={`tag-list ${className}`.trim()} aria-label={ariaLabel}>
      {tags.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}
