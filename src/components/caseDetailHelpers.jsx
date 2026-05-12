export function RichText({ parts }) {
  return (
    <>
      {parts.map((p, i) => (p.bold ? <b key={i}>{p.text}</b> : <span key={i}>{p.text}</span>))}
    </>
  );
}

export function SlotName({ lines }) {
  const els = [];
  lines.forEach((line, i) => {
    if (line === '') {
      els.push(<br key={`${i}-e1`} />);
      els.push(<br key={`${i}-e2`} />);
      return;
    }
    if (line === '+') {
      els.push(<br key={`${i}-p1`} />);
      els.push('+');
      els.push(<br key={`${i}-p2`} />);
      return;
    }
    if (els.length) {
      const prev = lines[i - 1];
      if (prev !== '' && prev !== '+') {
        els.push(<br key={`${i}-j`} />);
      }
    }
    els.push(line);
  });
  return <span className="slot-name">{els}</span>;
}
