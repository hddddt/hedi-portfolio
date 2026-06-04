import { useEffect, useRef } from 'react';
import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react';
import { mapOpeningShaderGradientProps } from '../../utils/openingShaderGradientScroll.js';

const CANVAS_STYLE = {
  position: 'absolute',
  inset: 0,
};

/**
 * Opening screens 1–2 — ShaderGradient source of truth; container-only reveal (no recolor).
 * @param {{
 *   progress?: number,
 *   openingCapHandoff?: number,
 *   openingCapExitWipe?: number,
 *   canMountShader?: boolean,
 *   canRevealField?: boolean,
 *   fieldReveal?: { opacity?: number, scale?: number, blurPx?: number, brightness?: number, posterOpacity?: number },
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
  fieldReveal = {},
  onShaderReady,
  onShaderVisualReady,
  onShaderTimeout,
}) {
  const hideForCap = openingCapHandoff > 0.12 || openingCapExitWipe > 0.28;
  const readyRef = useRef({ context: false, visual: false, timeout: false });
  const { canvas, gradient } = mapOpeningShaderGradientProps(progress);

  const opacity = canRevealField ? (fieldReveal.opacity ?? 1) : 0;
  const scale = fieldReveal.scale ?? 1;
  const blurPx = fieldReveal.blurPx ?? 0;
  const brightness = fieldReveal.brightness ?? 1;
  /** No colored poster during white/pulse — avoids legacy blue-green flash at 0s */
  const posterOpacity = canRevealField ? (fieldReveal.posterOpacity ?? 0) : 0;

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
    }, 2500);
    return () => {
      clearTimeout(tReady);
      clearTimeout(tTimeout);
    };
  }, [hideForCap, onShaderReady, onShaderTimeout]);

  useEffect(() => {
    if (hideForCap || !canMountShader) return undefined;
    let frames = 0;
    let raf = 0;
    const tick = () => {
      frames += 1;
      if (frames >= 3) {
        if (!readyRef.current.visual) {
          readyRef.current.visual = true;
          onShaderVisualReady?.();
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    const tFallback = window.setTimeout(() => {
      if (!readyRef.current.visual) {
        readyRef.current.visual = true;
        onShaderVisualReady?.();
      }
    }, 900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(tFallback);
    };
  }, [hideForCap, canMountShader, onShaderVisualReady]);

  if (hideForCap) return null;

  const canvasStyle = {
    opacity,
    transform: `scale(${scale})`,
    filter: blurPx > 0.1 ? `blur(${blurPx}px) brightness(${brightness})` : `brightness(${brightness})`,
    visibility: opacity > 0.02 ? 'visible' : 'hidden',
  };

  return (
    <div className="opening-shader-gradient-hero" aria-hidden="true">
      <div
        className="opening-shader-gradient-hero__poster"
        aria-hidden="true"
        style={{
          opacity: posterOpacity,
          visibility: posterOpacity > 0.02 ? 'visible' : 'hidden',
        }}
      />
      {canMountShader ? (
        <div className="opening-shader-gradient-hero__live" style={canvasStyle}>
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
