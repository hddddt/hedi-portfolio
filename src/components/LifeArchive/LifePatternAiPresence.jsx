import { useEffect, useRef, useState } from 'react';
import { GuideOrbWithHat } from '../home/GuideOrb.jsx';
import '../../styles/guide-orb.css';

const GREETING_HOLD_MS = 2800;

/**
 * Pattern-reading AI presence — orb + red hat + brief "Hi" on appear.
 */
export function LifePatternAiPresence({
  greet = true,
  greetKey = 'default',
  size = 50,
  className = '',
  greeting = 'Hi',
}) {
  const [entered, setEntered] = useState(false);
  const [hiVisible, setHiVisible] = useState(false);
  const lastGreetKey = useRef(null);

  useEffect(() => {
    if (!greet) {
      setHiVisible(false);
      return undefined;
    }

    const shouldGreet = lastGreetKey.current !== greetKey;
    lastGreetKey.current = greetKey;

    const enterRaf = requestAnimationFrame(() => setEntered(true));

    if (shouldGreet) {
      setHiVisible(true);
      const hideTimer = window.setTimeout(() => setHiVisible(false), GREETING_HOLD_MS);
      return () => {
        cancelAnimationFrame(enterRaf);
        window.clearTimeout(hideTimer);
      };
    }

    return () => cancelAnimationFrame(enterRaf);
  }, [greet, greetKey]);

  return (
    <div
      className={`life-ai-presence${entered ? ' is-entered' : ''}${className ? ` ${className}` : ''}`}
    >
      {hiVisible && (
        <p className="life-ai-presence__hi" role="status" aria-live="polite">
          {greeting}
        </p>
      )}
      <GuideOrbWithHat
        size={size}
        followCursor={false}
        blink
        bright={entered}
        open={entered}
        alive
      />
    </div>
  );
}
