import { useEffect, useRef } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { mapOpeningShaderGradientProps } from '../../utils/openingShaderGradientScroll.js';
import { OPENING_PRESENTATION_MS } from '../../utils/openingHeroPresentation.js';

const CANVAS_STYLE = {
  position: 'absolute',
  inset: 0,
};

/**
 * @param {{
 *   progress?: number,
 *   openingCapHandoff?: number,
 *   openingCapExitWipe?: number,
 *   canMountShader?: boolean,
 *   canRevealField?: boolean,
 *   shaderVisualReady?: boolean,
 *   fieldReveal?: { opacity?: number, scale?: number, blurPx?: number, brightness?: number, posterOpacity?: number, progress?: number },
 *   onShaderReady?: () => void,
 *   onShaderVisualReady?: () => void,
 *   onShaderTimeout?: () => void,
 * }} props
 */
export function OpeningShaderGradientHero({
  progress = 0,
  openingCapHandoff = 0,
  openingCapExitWipe = 0,
  canMountShader = true,
  canRevealField = false,
  shaderVisualReady = false,
  fieldReveal = {},
  onShaderReady,
  onShaderVisualReady,
  onShaderTimeout,
}) {
  const hideForCap = openingCapHandoff > 0.12 || openingCapExitWipe > 0.28;
  const readyRef = useRef({ context: false, visual: false, timeout: false });
  const mountAtRef = useRef(0);
  const { canvas, gradient } = mapOpeningShaderGradientProps(progress);

  const revealOpacity = canRevealField ? clamp01(fieldReveal.opacity ?? 0) : 0;
  const scale = fieldReveal.scale ?? 1;
  const blurPx = fieldReveal.blurPx ?? 0;
  const brightness = fieldReveal.brightness ?? 1;
  const liveBlend = shaderVisualReady ? revealOpacity : 0;
  const posterOpacity = canRevealField
    ? Math.max(0, revealOpacity * (shaderVisualReady ? (fieldReveal.posterOpacity ?? 0.2) : 1))
    : 0;

  useEffect(() => {
    if (hideForCap) return undefined;
    const tReady = window.setTimeout(() => {
      if (!readyRef.current.context) {
        readyRef.current.context = true;
        onShaderReady?.();
      }
    }, 48);
    const tTimeout = window.setTimeout(() => {
      if (!readyRef.current.timeout) {
        readyRef.current.timeout = true;
        onShaderTimeout?.();
      }
    }, OPENING_PRESENTATION_MS.SHADER_TIMEOUT);
    return () => {
      clearTimeout(tReady);
      clearTimeout(tTimeout);
    };
  }, [hideForCap, onShaderReady, onShaderTimeout]);

  useEffect(() => {
    if (hideForCap || !canMountShader) return undefined;
    mountAtRef.current = performance.now();
    readyRef.current.visual = false;

    let frames = 0;
    let raf = 0;
    const confirmVisual = () => {
      if (readyRef.current.visual) return;
      readyRef.current.visual = true;
      onShaderVisualReady?.();
    };

    const tick = () => {
      frames += 1;
      const sinceMount = performance.now() - mountAtRef.current;
      if (
        frames >= 6 &&
        sinceMount >= OPENING_PRESENTATION_MS.SHADER_PAINT_MIN_MS * 0.65
      ) {
        confirmVisual();
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const tFallback = window.setTimeout(
      confirmVisual,
      OPENING_PRESENTATION_MS.SHADER_PAINT_MIN_MS + 200,
    );
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tFallback);
    };
  }, [hideForCap, canMountShader, onShaderVisualReady]);

  if (hideForCap) return null;

  const liveStyle = {
    opacity: liveBlend,
    transform: `scale(${scale})`,
    filter:
      blurPx > 0.1 && liveBlend > 0.02
        ? `blur(${blurPx}px) brightness(${brightness})`
        : `brightness(${brightness})`,
    visibility: liveBlend > 0.02 ? 'visible' : 'hidden',
  };

  return (
    <div className="opening-shader-gradient-hero" aria-hidden="true">
      <div
        className={[
          'opening-shader-gradient-hero__poster',
          !shaderVisualReady && canRevealField
            ? 'opening-shader-gradient-hero__poster--preview'
            : '',
        ]
          .filter(Boolean)
          .join(' ')}
        aria-hidden="true"
        style={{
          opacity: posterOpacity,
          visibility: posterOpacity > 0.02 ? 'visible' : 'hidden',
        }}
      />
      {canMountShader ? (
        <div
          className={[
            'opening-shader-gradient-hero__live',
            shaderVisualReady ? 'is-revealed' : 'is-preparing',
          ].join(' ')}
          style={liveStyle}
          aria-hidden={liveBlend < 0.04}
        >
          <ShaderGradientCanvas
            style={CANVAS_STYLE}
            pixelDensity={canvas.pixelDensity}
            fov={canvas.fov}
            pointerEvents="none"
          >
            <ShaderGradient control="props" {...gradient} />
          </ShaderGradientCanvas>
        </div>
      ) : null}
    </div>
  );
}

function clamp01(t) {
  return Math.max(0, Math.min(1, t ?? 0));
}
