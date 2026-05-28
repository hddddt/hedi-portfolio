import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { resolveGuideOrbMood } from '../../utils/guideOrbMood.js';
import { startIdleDrift } from '../../utils/guideOrbIdle.js';
import '../../styles/guide-orb.css';

const BLINK_MIN_MS = 3200;
const BLINK_MAX_MS = 5200;
const BLINK_HOLD_MS = 250;
const MAX_EYE_OFFSET = 2.2;

const BLOB_PATH_D =
  'M50,8 C72,5 88,18 90,38 C92,58 78,78 58,82 C38,86 12,74 8,54 C4,34 18,11 50,8 Z';

function EyeDot({ x, y, r, className }) {
  return <circle className={className} cx={x} cy={y} r={r} />;
}

/**
 * Handmade blob guide character (no gradients, no shadows).
 * @param {{
 *  size?: number;
 *  className?: string;
 *  followCursor?: boolean;
 *  blink?: boolean;
 *  bright?: boolean;
 *  open?: boolean;
 *  thinking?: boolean;
 *  speaking?: boolean;
 *  hovered?: boolean;
 *  emotionalTone?: string[];
 *  alive?: boolean;
 *  mood?: string;
 * }} props
 */
export function GuideOrb({
  size = 44,
  className = '',
  followCursor = false,
  blink = true,
  bright = false,
  open = false,
  thinking = false,
  speaking = false,
  hovered = false,
  emotionalTone,
  alive = true,
  mood = 'neutral',
}) {
  const rootRef = useRef(null);
  const [eye, setEye] = useState({ x: 0, y: 0 });
  const [blinking, setBlinking] = useState(false);
  const [drift, setDrift] = useState({ x: 0, y: 0 });
  const reducedMotion = useRef(
    typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  const photoMood = useMemo(() => resolveGuideOrbMood(emotionalTone), [emotionalTone]);
  const hasPhotoMood = Boolean(emotionalTone?.length);
  const displayMood = hasPhotoMood ? photoMood : mood || 'neutral';

  const updateEye = useCallback(
    (clientX, clientY) => {
      const el = rootRef.current;
      if (!el || !followCursor || reducedMotion.current) {
        setEye({ x: 0, y: 0 });
        return;
      }
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = clientX - cx;
      const dy = clientY - cy;
      const tX = Math.max(-MAX_EYE_OFFSET, Math.min(MAX_EYE_OFFSET, dx / 20));
      const tY = Math.max(-MAX_EYE_OFFSET, Math.min(MAX_EYE_OFFSET, dy / 20));
      setEye({ x: tX, y: tY });
    },
    [followCursor],
  );

  useEffect(() => {
    if (!followCursor || reducedMotion.current) return undefined;
    const onMove = (e) => updateEye(e.clientX, e.clientY);
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, [followCursor, updateEye]);

  useEffect(() => {
    if (!blink || reducedMotion.current || thinking) return undefined;

    let timeoutId = 0;
    let blinkId = 0;

    const scheduleBlink = () => {
      const delay = BLINK_MIN_MS + Math.random() * (BLINK_MAX_MS - BLINK_MIN_MS);
      timeoutId = window.setTimeout(() => {
        setBlinking(true);
        blinkId = window.setTimeout(() => {
          setBlinking(false);
          scheduleBlink();
        }, BLINK_HOLD_MS);
      }, delay);
    };

    scheduleBlink();
    return () => {
      window.clearTimeout(timeoutId);
      window.clearTimeout(blinkId);
    };
  }, [blink, thinking]);

  useEffect(() => {
    if (!alive || reducedMotion.current || thinking) {
      setDrift({ x: 0, y: 0 });
      return undefined;
    }
    return startIdleDrift(setDrift);
  }, [alive, thinking]);

  const sizeW = size;
  const sizeH = Math.round(size * 1.05);
  const isHovered = hovered || bright;
  const isAlive = alive && !reducedMotion.current && !thinking;

  return (
    <span
      ref={rootRef}
      className={[
        'guide-orb',
        `guide-orb--mood-${displayMood}`,
        isAlive ? 'is-alive' : '',
        followCursor ? 'is-following' : '',
        blinking ? 'is-blinking' : '',
        thinking ? 'is-thinking' : '',
        speaking ? 'is-speaking' : '',
        isHovered ? 'is-hovered' : '',
        className ? ` ${className}` : '',
      ]
        .filter(Boolean)
        .join(' ')}
      data-mood={displayMood}
      style={{
        width: sizeW,
        height: sizeH,
        '--guide-drift-x': `${drift.x}px`,
        '--guide-drift-y': `${drift.y}px`,
      }}
      aria-hidden="true"
    >
      <svg className="guide-orb__svg" viewBox="0 0 100 90" role="presentation">
        <g className="guide-orb__float">
          <g className="guide-orb__body-wrap">
            <path className="guide-orb__body" d={BLOB_PATH_D} />
          </g>

          <g className="guide-orb__texture" aria-hidden="true">
            <path d="M22 42 Q32 38 42 44" />
            <path d="M58 48 Q68 44 76 50" />
            <path d="M30 58 Q40 62 48 56" />
          </g>

          <g
            className="guide-orb__eyes-move"
            style={{ transform: `translate(${eye.x}px, ${eye.y}px)` }}
          >
            <g className="guide-orb__eyes-blink">
              <g className="guide-orb__eyes-look">
                <EyeDot x={48} y={26} r={2.5} className="guide-orb__eye" />
                <EyeDot x={58} y={27} r={2.5} className="guide-orb__eye" />
              </g>
            </g>
          </g>

          <g className="guide-orb__freckles" aria-hidden="true">
            <circle cx={40} cy={38} r={1.2} fill="#0a0a0a" />
            <circle cx={44} cy={41} r={0.9} fill="#0a0a0a" />
            <circle cx={38} cy={43} r={1} fill="#0a0a0a" />
          </g>

          <g className="guide-orb__spark" aria-hidden="true">
            <path
              d="M66 20 L67.2 23.2 L70.5 24 L67.2 24.8 L66 28 L64.8 24.8 L61.5 24 L64.8 23.2 Z"
              fill="#0a0a0a"
            />
          </g>

          <path
            className="guide-orb__mouth guide-orb__mouth--neutral"
            d="M44 56 L56 56"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="guide-orb__mouth guide-orb__mouth--warm"
            d="M46 55 Q50 59 54 55"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="guide-orb__mouth guide-orb__mouth--playful"
            d="M42 54 Q48 62 56 59 Q62 57 64 53"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="guide-orb__mouth guide-orb__mouth--calm"
            d="M45 56 L55 56"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="guide-orb__mouth guide-orb__mouth--uncanny"
            d="M44 56 Q48 53 52 57 Q56 60 60 56"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle
            className="guide-orb__mouth guide-orb__mouth--experimental"
            cx={50}
            cy={57}
            r={2.2}
            fill="#0a0a0a"
            stroke="none"
          />
          <path
            className="guide-orb__mouth guide-orb__mouth--stark"
            d="M46 57 Q50 54 54 57"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            className="guide-orb__mouth guide-orb__mouth--wonder"
            d="M47 55 Q50 52 53 55"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />

          <path
            className="guide-orb__mouth guide-orb__mouth--hover"
            d="M42 55 C 48 61, 58 61, 64 55"
            fill="none"
            stroke="#0a0a0a"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
    </span>
  );
}

export function GuideOrbWithHat(props) {
  return <GuideOrb {...props} />;
}
