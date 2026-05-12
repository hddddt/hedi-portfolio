import { RichText } from './caseDetailHelpers.jsx';

export function Readout({ items }) {
  return (
    <div className="readout">
      {items.map((item, idx) =>
        item.proof ? (
          <div key={idx} className="proof">
            {item.proof}
          </div>
        ) : (
          <div key={idx}>
            <div className="ro-label">{item.label}</div>
            <p className="ro-text">
              <RichText parts={item.parts} />
            </p>
          </div>
        ),
      )}
    </div>
  );
}
