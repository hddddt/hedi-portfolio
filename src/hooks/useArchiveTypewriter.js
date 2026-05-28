import { useEffect, useRef, useState } from 'react';

/**
 * Typewriter with optional thinking pause before typing.
 * @param {string} text
 * @param {boolean} active — when false, clears output
 * @param {{ speed?: number; thinkMs?: number; enabled?: boolean }} opts
 */
export function useArchiveTypewriter(text, active, opts = {}) {
  const { speed = 28, thinkMs = 400, enabled = true } = opts;
  const [displayed, setDisplayed] = useState('');
  const [thinking, setThinking] = useState(false);
  const [complete, setComplete] = useState(false);
  const timerRef = useRef(0);

  useEffect(() => {
    window.clearTimeout(timerRef.current);
    if (!active || !text) {
      setDisplayed('');
      setThinking(false);
      setComplete(false);
      return undefined;
    }

    if (!enabled) {
      setDisplayed(text);
      setThinking(false);
      setComplete(true);
      return undefined;
    }

    setDisplayed('');
    setComplete(false);
    setThinking(true);

    let charIndex = 0;
    timerRef.current = window.setTimeout(() => {
      setThinking(false);
      const tick = () => {
        charIndex += 1;
        setDisplayed(text.slice(0, charIndex));
        if (charIndex < text.length) {
          timerRef.current = window.setTimeout(tick, speed);
        } else {
          setComplete(true);
        }
      };
      tick();
    }, thinkMs);

    return () => window.clearTimeout(timerRef.current);
  }, [text, active, speed, thinkMs, enabled]);

  return { displayed, thinking, complete };
}
