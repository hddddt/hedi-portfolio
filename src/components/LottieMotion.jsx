import { useRef, useSyncExternalStore } from 'react';
import Lottie from 'lottie-react';

function getPrefersReducedMotionSnapshot() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

function subscribePrefersReducedMotion(onStoreChange) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', onStoreChange);
  return () => mq.removeEventListener('change', onStoreChange);
}

/**
 * Thin wrapper around lottie-react with reduced-motion handling.
 * Intended for one-off imports (e.g. hero); keep usage scoped in product code.
 */
export function LottieMotion({
  animationData,
  className,
  style,
  loop = true,
  autoplay = true,
  rendererSettings,
  'aria-hidden': ariaHidden = true,
}) {
  const lottieRef = useRef(null);
  const prefersReducedMotion = useSyncExternalStore(
    subscribePrefersReducedMotion,
    getPrefersReducedMotionSnapshot,
    () => false,
  );

  const handleDOMLoaded = () => {
    if (!prefersReducedMotion || !lottieRef.current) return;
    lottieRef.current.goToAndStop(0, true);
    lottieRef.current.pause();
  };

  return (
    <Lottie
      lottieRef={lottieRef}
      animationData={animationData}
      loop={!prefersReducedMotion && loop}
      autoplay={!prefersReducedMotion && autoplay}
      className={className}
      style={style}
      renderer="svg"
      rendererSettings={{
        preserveAspectRatio: 'xMidYMid meet',
        ...rendererSettings,
      }}
      onDOMLoaded={handleDOMLoaded}
      aria-hidden={ariaHidden}
    />
  );
}
