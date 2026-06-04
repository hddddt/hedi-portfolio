import { ShaderGradient, ShaderGradientCanvas } from '@shadergradient/react';
import {
  SHORTCUT_MARKER_CANVAS,
  SHORTCUT_MARKER_GRADIENT,
} from '../../data/shortcutMarkerGradient.js';

const CANVAS_STYLE = {
  position: 'absolute',
  inset: 0,
  width: '100%',
  height: '100%',
};

/**
 * Edge-docked shortcut gem — ShaderGradient sphere, tight mask (no CSS halo stack).
 */
export function ShortcutMarkerShader() {
  return (
    <span className="portfolio-guide__marker-shader" aria-hidden="true">
      <ShaderGradientCanvas
        style={CANVAS_STYLE}
        pixelDensity={SHORTCUT_MARKER_CANVAS.pixelDensity}
        fov={SHORTCUT_MARKER_CANVAS.fov}
        pointerEvents="none"
        preserveDrawingBuffer={false}
        powerPreference="low-power"
      >
        <ShaderGradient control="props" {...SHORTCUT_MARKER_GRADIENT} />
      </ShaderGradientCanvas>
    </span>
  );
}
