import { useEffect } from 'react';
import { useOrbScene } from '../../context/OrbSceneContext.jsx';

/** Keeps viewport orb scene in sync with portfolio guide panel open state. */
export function PortfolioGuideOrbSync({ open }) {
  const { setGuideOpen } = useOrbScene();

  useEffect(() => {
    setGuideOpen(open);
    const root = document.documentElement;
    if (open) root.classList.add('guide-intelligence-open');
    else root.classList.remove('guide-intelligence-open');
    return () => {
      setGuideOpen(false);
      root.classList.remove('guide-intelligence-open');
    };
  }, [open, setGuideOpen]);

  return null;
}
