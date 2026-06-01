import { useCallback, useMemo, useState } from 'react';
import { homeCapabilities } from '../data/homeScrollChapters.js';
import {
  DEFAULT_CAPABILITY_BLUR_TUNE,
  exportTuneSnippet,
  getCapabilityBlurTune,
  persistCapabilityBlurTune,
  resetCapabilityBlurTune,
} from '../config/capabilityBlurTune.js';
import {
  capabilityPanelCrossfade,
  sampleCapabilityBlurCurve,
} from '../utils/capabilitiesChoreography.js';
import '../styles/capability-blur-tune.css';

function TuneSlider({ label, value, min, max, step, onChange, hint }) {
  return (
    <div className="cap-blur-tune__field">
      <label>
        <span>{label}</span>
        <span>{typeof value === 'number' ? value.toFixed(step < 0.01 ? 3 : 2) : value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {hint ? <p className="cap-blur-tune__hint">{hint}</p> : null}
    </div>
  );
}

function BlurChart({ tune }) {
  const samples = useMemo(() => sampleCapabilityBlurCurve(tune, 100), [tune]);
  const w = 480;
  const h = 120;
  const pad = 8;

  const blurPath = samples
    .map((s, i) => {
      const x = pad + (s.dist / 1.04) * (w - pad * 2);
      const y = h - pad - (s.blurPx / (tune.blurPeakPx || 1)) * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const opacityPath = samples
    .map((s, i) => {
      const x = pad + (s.dist / 1.04) * (w - pad * 2);
      const y = h - pad - s.opacity * (h - pad * 2);
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  return (
    <svg className="cap-blur-tune__chart" viewBox={`0 0 ${w} ${h}`} aria-hidden>
      {[0.25, 0.5, 0.75].map((g) => (
        <line
          key={g}
          x1={pad + g * (w - pad * 2)}
          x2={pad + g * (w - pad * 2)}
          y1={pad}
          y2={h - pad}
        />
      ))}
      <path className="opacity" d={opacityPath} />
      <path className="blur" d={blurPath} />
    </svg>
  );
}

export function CapabilityBlurTunePage() {
  const [tune, setTune] = useState(() => getCapabilityBlurTune());
  const [floatIndex, setFloatIndex] = useState(1.35);
  const [fromPanel, setFromPanel] = useState(1);
  const [copied, setCopied] = useState(false);

  const n = homeCapabilities.length;
  const toPanel =
    floatIndex > fromPanel
      ? Math.min(fromPanel + 1, n - 1)
      : floatIndex < fromPanel
        ? Math.max(fromPanel - 1, 0)
        : fromPanel;
  const fromCap = homeCapabilities[fromPanel];
  const toCap = homeCapabilities[toPanel];

  const patch = useCallback((key, value) => {
    setTune((prev) => ({ ...prev, [key]: value }));
  }, []);

  const fromStyle = capabilityPanelCrossfade(floatIndex, fromPanel, false, tune);
  const toStyle = capabilityPanelCrossfade(floatIndex, toPanel, false, tune);

  const distFrom = Math.abs(floatIndex - fromPanel);
  const distTo = Math.abs(floatIndex - toPanel);

  const handlePersist = () => {
    persistCapabilityBlurTune(tune);
    alert('已保存到 localStorage。刷新首页 Capabilities 即可预览。');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(exportTuneSnippet(tune));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="cap-blur-tune">
      <header className="cap-blur-tune__header">
        <h1 className="cap-blur-tune__title">Capabilities blur tune (temp)</h1>
        <div className="cap-blur-tune__actions">
          <a href="/">← 回首页</a>
          <button type="button" onClick={handlePersist}>
            应用到首页 (localStorage)
          </button>
          <button type="button" onClick={handleCopy}>
            {copied ? '已复制' : '复制 JSON'}
          </button>
          <button
            type="button"
            onClick={() => {
              resetCapabilityBlurTune();
              setTune({ ...DEFAULT_CAPABILITY_BLUR_TUNE });
            }}
          >
            重置默认
          </button>
        </div>
      </header>

      <div className="cap-blur-tune__layout">
        <aside>
          <div className="cap-blur-tune__panel">
            <h2>Scroll 模拟</h2>
            <TuneSlider
              label="floatIndex（滚动进度）"
              value={floatIndex}
              min={0}
              max={n - 1}
              step={0.01}
              onChange={setFloatIndex}
              hint="拖动模拟从一个 capability 滚到下一个。"
            />
            <TuneSlider
              label="对比：离场 panel"
              value={fromPanel}
              min={0}
              max={n - 1}
              step={1}
              onChange={(v) => setFromPanel(Math.round(v))}
            />
          </div>

          <div className="cap-blur-tune__panel" style={{ marginTop: 16 }}>
            <h2>Blur 时机</h2>
            <TuneSlider
              label="restSharp — 落点清晰区"
              value={tune.restSharp ?? tune.clearInner}
              min={0}
              max={0.2}
              step={0.01}
              onChange={(v) => {
                patch('restSharp', v);
                patch('clearInner', v);
              }}
              hint="距 panel 多近时完全无 blur。"
            />
            <TuneSlider
              label="restSoft — blur 峰值区"
              value={tune.restSoft ?? tune.clearOuter}
              min={0.1}
              max={0.45}
              step={0.01}
              onChange={(v) => {
                const sharp = tune.restSharp ?? tune.clearInner ?? 0.05;
                const next = Math.max(v, sharp + 0.04);
                patch('restSoft', next);
                patch('clearOuter', next);
              }}
              hint="越小 = 每次 scroll 后 blur 收得越快。"
            />
            <TuneSlider
              label="blurPeakPx"
              value={tune.blurPeakPx}
              min={0}
              max={16}
              step={0.5}
              onChange={(v) => patch('blurPeakPx', v)}
            />
            <TuneSlider
              label="blurCutoffPx"
              value={tune.blurCutoffPx}
              min={0}
              max={2}
              step={0.05}
              onChange={(v) => patch('blurCutoffPx', v)}
            />
            <TuneSlider
              label="yTravel"
              value={tune.yTravel}
              min={0}
              max={32}
              step={1}
              onChange={(v) => patch('yTravel', v)}
            />
          </div>
        </aside>

        <div className="cap-blur-tune__preview">
          <div className="cap-blur-tune__scroll-sim">
            <h2>实时预览</h2>
            <p className="cap-blur-tune__hint">
              floatIndex={floatIndex.toFixed(2)} · 离场 dist={distFrom.toFixed(2)} · 入场 dist=
              {distTo.toFixed(2)}
            </p>
            <div className="cap-blur-tune__cards">
              <div
                className="cap-blur-tune__card"
                style={{
                  opacity: fromStyle.opacity,
                  transform: fromStyle.transform,
                  filter: fromStyle.filter,
                  visibility: fromStyle.visibility,
                }}
              >
                <p className="cap-blur-tune__card-label">离场 · {fromCap.label}</p>
                <h3>{fromCap.headline}</h3>
                <p className="cap-blur-tune__metrics">
                  blur: {fromStyle.filter ?? 'none'} · opacity: {fromStyle.opacity?.toFixed(2)}
                </p>
              </div>
              <div
                className="cap-blur-tune__card"
                style={{
                  opacity: toStyle.opacity,
                  transform: toStyle.transform,
                  filter: toStyle.filter,
                  visibility: toStyle.visibility,
                }}
              >
                <p className="cap-blur-tune__card-label">入场 · {toCap.label}</p>
                <h3>{toCap.headline}</h3>
                <p className="cap-blur-tune__metrics">
                  blur: {toStyle.filter ?? 'none'} · opacity: {toStyle.opacity?.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <div className="cap-blur-tune__panel">
            <h2>曲线（横轴 = 距 panel 距离 dist）</h2>
            <p className="cap-blur-tune__hint">绿 = opacity · 蓝 = blur(px)</p>
            <BlurChart tune={tune} />
            <pre className="cap-blur-tune__snippet">{exportTuneSnippet(tune)}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
