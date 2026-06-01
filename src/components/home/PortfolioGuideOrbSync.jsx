import { useEffect } from 'react';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';

/** Keeps viewport orb scene in sync with portfolio guide panel open state. */
export function PortfolioGuideOrbSync({ open }) {
  const { setGuideOpen } = useOrbScene();

  useEffect(() => {
    setGuideOpen(open);
    return () => setGuideOpen(false);
  }, [open, setGuideOpen]);

  return null;
}
