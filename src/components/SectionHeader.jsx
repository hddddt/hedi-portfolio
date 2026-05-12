export function SectionHeader({
  kicker,
  titleLines,
  sub,
  kickerClassName = 'section-kicker reveal',
  headClassName = 'ov-head reveal',
}) {
  return (
    <>
      <div className={kickerClassName}>{kicker}</div>
      <div className={headClassName}>
        <h2 className="ov-title">
          {titleLines.map((line, i) => (
            <span key={i}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
        </h2>
        <p className="ov-sub">{sub}</p>
      </div>
    </>
  );
}
