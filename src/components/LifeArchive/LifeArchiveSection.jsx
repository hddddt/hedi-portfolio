import '../../styles/guide-orb.css';
import '../../styles/life-archive-intent.css';
import { LifeArchiveExperience } from './LifeArchiveExperience.jsx';

export function LifeArchiveSection({ framingLine }) {
  return (
    <div className="life-archive">
      <div className="life-archive__atmosphere" aria-hidden="true" />
      {framingLine ? (
        <p className="life-archive__framing-line motion-reveal">{framingLine}</p>
      ) : null}
      <LifeArchiveExperience />
    </div>
  );
}
