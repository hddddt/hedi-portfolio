/** Small schematic per capability — native SVG, no WebGL */
export function CapabilitySystemDiagram({ kind }) {
  const stroke = 'rgba(250,248,243,.35)';
  const fill = 'rgba(120,180,140,.12)';
  const dim = 'rgba(250,248,243,.18)';

  switch (kind) {
    case 'mesh':
      return (
        <svg className="cap-dial__diagram-svg" viewBox="0 0 120 80" aria-hidden="true">
          <circle cx="60" cy="40" r="28" fill="none" stroke={stroke} strokeWidth="0.6" strokeDasharray="3 4" />
          {[0, 1, 2, 3, 4].map((i) => {
            const a = (i / 5) * Math.PI * 2;
            const x = 60 + Math.cos(a) * 18;
            const y = 40 + Math.sin(a) * 18;
            return <circle key={i} cx={x} cy={y} r="4" fill={fill} stroke={stroke} strokeWidth="0.5" />;
          })}
          <path d="M30 62 L90 62" stroke={dim} strokeWidth="0.5" />
        </svg>
      );
    case 'swim':
      return (
        <svg className="cap-dial__diagram-svg" viewBox="0 0 120 80" aria-hidden="true">
          <rect x="14" y="12" width="92" height="14" rx="3" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <rect x="14" y="33" width="92" height="14" rx="3" fill="none" stroke={stroke} strokeWidth="0.5" />
          <rect x="14" y="54" width="92" height="14" rx="3" fill="none" stroke={stroke} strokeWidth="0.5" />
          <path d="M44 12v56" stroke={dim} strokeWidth="0.5" strokeDasharray="2 3" />
          <path d="M76 12v56" stroke={dim} strokeWidth="0.5" strokeDasharray="2 3" />
        </svg>
      );
    case 'decision':
      return (
        <svg className="cap-dial__diagram-svg" viewBox="0 0 120 80" aria-hidden="true">
          <path d="M20 40h32l8 12 8-12h32" fill="none" stroke={stroke} strokeWidth="0.7" />
          <circle cx="40" cy="40" r="6" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="80" cy="40" r="6" fill="none" stroke={stroke} strokeWidth="0.5" />
          <path d="M60 18v14" stroke={dim} strokeWidth="0.5" />
        </svg>
      );
    case 'loop':
      return (
        <svg className="cap-dial__diagram-svg" viewBox="0 0 120 80" aria-hidden="true">
          <path
            d="M28 48c0-16 14-28 32-28s32 12 32 28-14 28-32 28-10 0-18-4"
            fill="none"
            stroke={stroke}
            strokeWidth="0.7"
          />
          <polygon points="52,22 58,14 64,22" fill={stroke} />
          <circle cx="88" cy="48" r="5" fill={fill} stroke={stroke} strokeWidth="0.5" />
          <circle cx="44" cy="52" r="4" fill="none" stroke={dim} strokeWidth="0.5" />
        </svg>
      );
    case 'roadmap':
      return (
        <svg className="cap-dial__diagram-svg" viewBox="0 0 120 80" aria-hidden="true">
          <line x1="18" y1="58" x2="102" y2="58" stroke={dim} strokeWidth="0.5" />
          {[18, 46, 74, 102].map((x, i) => (
            <g key={i}>
              <circle cx={x} cy={58 - i * 10} r="5" fill={i < 2 ? fill : 'none'} stroke={stroke} strokeWidth="0.5" />
              {i < 3 ? (
                <line x1={x} y1={58 - i * 10} x2={x + 28} y2={48 - i * 10} stroke={stroke} strokeWidth="0.45" />
              ) : null}
            </g>
          ))}
        </svg>
      );
    default:
      return (
        <svg className="cap-dial__diagram-svg" viewBox="0 0 120 80" aria-hidden="true">
          <rect x="20" y="22" width="80" height="36" rx="4" fill="none" stroke={stroke} strokeWidth="0.6" />
        </svg>
      );
  }
}
