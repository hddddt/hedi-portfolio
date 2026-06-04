import { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { animateRouteVisual } from '../../utils/portfolioGuideMotion.js';

gsap.registerPlugin(useGSAP);

/**
 * Second-level route mini visuals (80–110px, system-line aesthetic).
 */

/**
 * @param {{ kind: 'convergence' | 'operationalization' | 'scope' | 'relationship' }} props
 */
export function ShortcutRouteVisual({ kind }) {
  const visualRef = useRef(null);

  useGSAP(
    () => {
      const root = visualRef.current;
      if (!root) return undefined;
      return animateRouteVisual(root, kind);
    },
    { scope: visualRef, dependencies: [kind], revertOnUpdate: true },
  );

  return (
    <div
      ref={visualRef}
      className={`shortcut-route-visual shortcut-route-visual--${kind}`}
      aria-hidden="true"
    >
      {kind === 'convergence' ? <ConvergenceStrip /> : null}
      {kind === 'operationalization' ? <OperationalizationGrid /> : null}
      {kind === 'scope' ? <ScopeRings /> : null}
      {kind === 'relationship' ? <AgencyRelation /> : null}
    </div>
  );
}

function ConvergenceStrip() {
  return (
    <svg viewBox="0 0 280 96" className="shortcut-route-visual__svg" preserveAspectRatio="xMidYMid meet">
      <g className="shortcut-route-visual__scatter">
        <circle cx="28" cy="22" r="2.5" className="shortcut-route-visual__dot" />
        <circle cx="52" cy="58" r="2" className="shortcut-route-visual__dot" />
        <circle cx="18" cy="72" r="2" className="shortcut-route-visual__dot" />
        <circle cx="72" cy="34" r="2" className="shortcut-route-visual__dot" />
        <line x1="28" y1="22" x2="168" y2="48" className="shortcut-route-visual__line shortcut-route-visual__line--faint" />
        <line x1="52" y1="58" x2="168" y2="48" className="shortcut-route-visual__line shortcut-route-visual__line--faint" />
        <line x1="18" y1="72" x2="168" y2="48" className="shortcut-route-visual__line shortcut-route-visual__line--faint" />
        <line x1="72" y1="34" x2="168" y2="48" className="shortcut-route-visual__line" />
      </g>
      <rect
        x="158"
        y="32"
        width="96"
        height="52"
        rx="4"
        className="shortcut-route-visual__frame shortcut-route-visual__frame--accent"
      />
      <circle cx="206" cy="58" r="4" className="shortcut-route-visual__node shortcut-route-visual__node--accent" />
    </svg>
  );
}

function OperationalizationGrid() {
  return (
    <svg viewBox="0 0 280 96" className="shortcut-route-visual__svg" preserveAspectRatio="xMidYMid meet">
      <rect x="86" y="6" width="108" height="20" rx="3" className="shortcut-route-visual__block" />
      <text x="140" y="20" textAnchor="middle" className="shortcut-route-visual__label">
        AI capability
      </text>
      <line x1="140" y1="26" x2="140" y2="34" className="shortcut-route-visual__line" />
      <rect x="24" y="36" width="232" height="22" rx="3" className="shortcut-route-visual__chip-row" />
      <text x="140" y="51" textAnchor="middle" className="shortcut-route-visual__chip-label">
        role · workflow · state · boundary · completion
      </text>
      <line x1="140" y1="58" x2="140" y2="66" className="shortcut-route-visual__line" />
      <rect x="86" y="68" width="108" height="20" rx="3" className="shortcut-route-visual__block shortcut-route-visual__block--accent" />
      <text x="140" y="82" textAnchor="middle" className="shortcut-route-visual__label shortcut-route-visual__label--accent">
        usable work
      </text>
    </svg>
  );
}

function ScopeRings() {
  const layers = [
    { w: 56, h: 28, label: 'interface', y: 58 },
    { w: 88, h: 36, label: 'workflow', y: 44 },
    { w: 120, h: 44, label: 'control', y: 28 },
    { w: 152, h: 52, label: 'operating', y: 12 },
  ];
  return (
    <svg viewBox="0 0 280 96" className="shortcut-route-visual__svg" preserveAspectRatio="xMidYMid meet">
      {layers.map((layer, i) => (
        <g key={layer.label}>
          <rect
            x={140 - layer.w / 2}
            y={layer.y}
            width={layer.w}
            height={layer.h}
            rx="3"
            className={`shortcut-route-visual__ring shortcut-route-visual__ring--${i}`}
          />
          <text
            x={140}
            y={layer.y + layer.h / 2 + 4}
            textAnchor="middle"
            className="shortcut-route-visual__ring-label"
          >
            {layer.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

function AgencyRelation() {
  const states = [
    { label: 'informed', y: 36 },
    { label: 'involved', y: 52 },
    { label: 'able to act', y: 68 },
  ];
  return (
    <svg viewBox="0 0 280 96" className="shortcut-route-visual__svg" preserveAspectRatio="xMidYMid meet">
      <rect x="16" y="38" width="56" height="26" rx="4" className="shortcut-route-visual__block" />
      <text x="44" y="55" textAnchor="middle" className="shortcut-route-visual__label">
        Human
      </text>
      <rect x="208" y="38" width="56" height="26" rx="4" className="shortcut-route-visual__block" />
      <text x="236" y="55" textAnchor="middle" className="shortcut-route-visual__label">
        AI system
      </text>
      {states.map((state, i) => (
        <g key={state.label}>
          <line
            x1="72"
            y1={state.y}
            x2="208"
            y2={state.y}
            className={`shortcut-route-visual__line shortcut-route-visual__line--rel-${i}`}
          />
          <text x="140" y={state.y + 4} textAnchor="middle" className="shortcut-route-visual__rel-label">
            {state.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
