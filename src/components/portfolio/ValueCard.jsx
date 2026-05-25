import { TagList } from './TagList.jsx';

export function ValueCard({ num, title, explanation, tags }) {
  return (
    <article className="value-card reveal">
      <div className="value-card__mark" aria-hidden="true" />
      <div className="value-card__meta">
        <span className="value-card__num">{num}</span>
        <span className="value-card__rule" aria-hidden="true" />
      </div>
      <h3 className="value-card__title">{title}</h3>
      <p className="value-card__explanation">{explanation}</p>
      <TagList tags={tags} className="tag-list--value" ariaLabel="Capabilities" />
    </article>
  );
}
