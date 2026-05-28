import '../../styles/evidence-image.css';

function fitMode(variant) {
  if (variant === 'topCrop' || variant === 'detailCrop') return 'cover';
  return 'contain';
}

function EvidenceFigure({ item }) {
  if (!item?.src) return null;
  const style = {
    '--evidence-max-height': `${item.maxHeight ?? 560}px`,
    '--evidence-object-position': item.objectPosition ?? 'center center',
  };
  return (
    <figure
      className={`evidence-image evidence-image--${item.variant ?? 'containCard'}${
        item.visualWeight === 'highest' ? ' evidence-image--highest' : ''
      }`}
      style={style}
    >
      {item.label ? <p className="evidence-image__label">{item.label}</p> : null}
      <div className="evidence-image__frame">
        <img
          src={item.src}
          alt={item.label ?? 'Evidence screenshot'}
          className="evidence-image__img"
          loading="lazy"
          decoding="async"
          style={{
            objectFit: fitMode(item.variant),
            objectPosition: 'var(--evidence-object-position)',
          }}
        />
      </div>
      {item.caption ? <figcaption className="evidence-image__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

function HorizontalPair({ item }) {
  if (!item?.items?.length) return null;
  const style = {
    '--evidence-max-height': `${item.maxHeight ?? 500}px`,
  };
  return (
    <figure className="evidence-image evidence-image--horizontalPair" style={style}>
      {item.label ? <p className="evidence-image__label">{item.label}</p> : null}
      <div className="evidence-image__pair">
        {item.items.map((pairItem) => (
          <div key={pairItem.src} className="evidence-image__pair-item">
            <img
              src={pairItem.src}
              alt={pairItem.label ?? 'Evidence screenshot'}
              className="evidence-image__img evidence-image__img--pair"
              loading="lazy"
              decoding="async"
              style={{ objectFit: 'contain', objectPosition: 'center center' }}
            />
          </div>
        ))}
      </div>
      {item.caption ? <figcaption className="evidence-image__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

function HorizontalTriptych({ item }) {
  if (!item?.items?.length) return null;
  const style = {
    '--evidence-max-height': `${item.maxHeight ?? 240}px`,
  };
  return (
    <figure className="evidence-image evidence-image--horizontalTriptych" style={style}>
      {item.label ? <p className="evidence-image__label">{item.label}</p> : null}
      <div className="evidence-image__triptych">
        {item.items.map((triptychItem) => (
          <div key={triptychItem.src} className="evidence-image__triptych-item">
            <img
              src={triptychItem.src}
              alt={triptychItem.label ?? 'Evidence screenshot'}
              className="evidence-image__img evidence-image__img--triptych"
              loading="lazy"
              decoding="async"
              style={{ objectFit: 'contain', objectPosition: 'center center' }}
            />
          </div>
        ))}
      </div>
      {item.caption ? <figcaption className="evidence-image__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

export function EvidenceImage({ item }) {
  if (!item) return null;
  if (item.variant === 'horizontalPair') return <HorizontalPair item={item} />;
  if (item.variant === 'horizontalTriptych') return <HorizontalTriptych item={item} />;
  return <EvidenceFigure item={item} />;
}
