/** Default capability panel crossfade blur (production). */
export const DEFAULT_CAPABILITY_BLUR_TUNE = {
  blurPeakPx: 11,
  /** Dist from panel rest: no blur (sharp). */
  restSharp: 0.05,
  /** Dist from panel rest: full handoff blur. */
  restSoft: 0.22,
  /** Aliases for tune UI sliders */
  clearInner: 0.05,
  clearOuter: 0.22,
  onsetStart: 0,
  onsetEnd: 0.12,
  blurCutoffPx: 0.12,
  yTravel: 14,
  hiddenDist: 1,
  pointerDist: 0.36,
  opacityPower: 1.05,
};

const STORAGE_KEY = 'portfolio-cap-blur-tune';

let sessionTune = null;

export function getCapabilityBlurTune() {
  if (sessionTune) return { ...DEFAULT_CAPABILITY_BLUR_TUNE, ...sessionTune };

  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return { ...DEFAULT_CAPABILITY_BLUR_TUNE, ...JSON.parse(raw) };
      }
    } catch {
      /* ignore */
    }
  }

  return { ...DEFAULT_CAPABILITY_BLUR_TUNE };
}

export function setCapabilityBlurTune(partial) {
  sessionTune = { ...getCapabilityBlurTune(), ...partial };
}

export function resetCapabilityBlurTune() {
  sessionTune = null;
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export function persistCapabilityBlurTune(tune) {
  sessionTune = { ...tune };
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tune));
  }
}

export function exportTuneSnippet(tune = getCapabilityBlurTune()) {
  return `// capabilityBlurTune.js — DEFAULT_CAPABILITY_BLUR_TUNE
${JSON.stringify(tune, null, 2)};`;
}
