import '../../styles/evidence-image.css';

function frameStage(caseId, variant) {
  if (caseId === 'case04') return 'evidence-frame--dark';
  if (variant === 'topCrop' || variant === 'detailCrop') return 'evidence-frame--light evidence-frame--screen';
  return 'evidence-frame--light';
}

function frameShapeClass(variant) {
  if (variant === 'heroImage') return 'evidence-frame--hero';
  return 'evidence-frame--supporting';
}

function fitClass(variant) {
  if (variant === 'topCrop') return 'evidence-frame--board';
  if (variant === 'detailCrop') return 'evidence-frame--screen';
  if (variant === 'containCard' || variant === 'smallStrip') return 'evidence-frame--diagram';
  return 'evidence-frame--diagram';
}

function EvidenceFigure({ item, caseId }) {
  if (!item?.src) return null;
  return (
    <figure className={`evidence-image${item.visualWeight === 'highest' ? ' evidence-image--highest' : ''}`}>
      {item.label ? <p className="evidence-image__label">{item.label}</p> : null}
      <div
        className={`evidence-frame ${frameStage(caseId, item.variant)} ${frameShapeClass(item.variant)} ${fitClass(item.variant)}`}
      >
        <img
          src={item.src}
          alt={item.label ?? 'Evidence screenshot'}
          className="evidence-frame__img"
          loading="lazy"
          decoding="async"
          style={{ objectPosition: item.objectPosition ?? 'center center' }}
        />
      </div>
      {item.caption ? <figcaption className="evidence-image__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

function HorizontalPair({ item, caseId }) {
  if (!item?.items?.length) return null;
  return (
    <figure className="evidence-image evidence-image--horizontalPair">
      {item.label ? <p className="evidence-image__label">{item.label}</p> : null}
      <div className="evidence-image__pair">
        {item.items.map((pairItem) => (
          <div
            key={pairItem.src}
            className={`evidence-frame evidence-frame--supporting ${frameStage(caseId, item.variant)} ${fitClass(item.variant)}`}
          >
            <img
              src={pairItem.src}
              alt={pairItem.label ?? 'Evidence screenshot'}
              className="evidence-frame__img"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
      {item.caption ? <figcaption className="evidence-image__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

function HorizontalTriptych({ item, caseId }) {
  if (!item?.items?.length) return null;
  return (
    <figure className="evidence-image evidence-image--horizontalTriptych">
      {item.label ? <p className="evidence-image__label">{item.label}</p> : null}
      <div className="evidence-image__triptych">
        {item.items.map((triptychItem) => (
          <div
            key={triptychItem.src}
            className={`evidence-frame evidence-frame--supporting ${frameStage(caseId, item.variant)} ${fitClass(item.variant)}`}
          >
            <img
              src={triptychItem.src}
              alt={triptychItem.label ?? 'Evidence screenshot'}
              className="evidence-frame__img"
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>
      {item.caption ? <figcaption className="evidence-image__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

export function EvidenceImage({ item, caseId = 'case01' }) {
  if (!item) return null;
  if (item.variant === 'horizontalPair') return <HorizontalPair item={item} caseId={caseId} />;
  if (item.variant === 'horizontalTriptych') return <HorizontalTriptych item={item} caseId={caseId} />;
  return <EvidenceFigure item={item} caseId={caseId} />;
}
