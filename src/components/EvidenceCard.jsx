import { SlotName } from './caseDetailHelpers.jsx';

export function EvidenceCard({ evidenceTitle, slotLines }) {
  return (
    <div className="evidence-card">
      <div className="ev-title">{evidenceTitle}</div>
      <div className="image-slot large">
        <SlotName lines={slotLines} />
      </div>
    </div>
  );
}
