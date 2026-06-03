import { useMemo } from 'react';
import { usePovArchiveHandoff } from '../../context/PovArchiveHandoffContext.jsx';
import { pathArchiveCorridorStyle } from '../../utils/povArchiveHandoff.js';

const CORRIDOR_KICKER = '02 / KEPT IN VIEW';
const CORRIDOR_LEAD =
  'When the professional frame loosens, attention still leaves traces — not as argument, but as image.';
const CORRIDOR_BEAT = 'Scroll when you are ready to look.';

export function BeyondWorkCorridor() {
  const { handoff, reducedMotion } = usePovArchiveHandoff();
  const layers = useMemo(
    () => pathArchiveCorridorStyle(handoff, reducedMotion),
    [handoff, reducedMotion],
  );

  return (
    <div
      className="home-beyond-work__corridor"
      aria-label="Transition from path to life archive"
      style={layers.root}
    >
      <div className="home-beyond-work__corridor-axis" aria-hidden="true" style={layers.axis} />
      <p className="home-beyond-work__corridor-kicker" style={layers.kicker}>
        {CORRIDOR_KICKER}
      </p>
      <p className="home-beyond-work__corridor-lead" style={layers.lead}>
        {CORRIDOR_LEAD}
      </p>
      <p className="home-beyond-work__corridor-beat" style={layers.beat}>
        {CORRIDOR_BEAT}
      </p>
    </div>
  );
}
