import { useNarrativeScroll } from '../../context/NarrativeScrollContext.jsx';

export function AmbientBackdrop() {
  const { ambientKey } = useNarrativeScroll();

  return (
    <div className={`ambient-backdrop ambient-backdrop--${ambientKey || 'default'}`} aria-hidden="true">
      <div className="ambient-backdrop__blob ambient-backdrop__blob--a" />
      <div className="ambient-backdrop__blob ambient-backdrop__blob--b" />
      <div className="ambient-backdrop__mesh" />
    </div>
  );
}
