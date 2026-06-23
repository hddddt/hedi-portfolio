/**
 * Chapter manifest for narrative rail + ambient state.
 * `ambient` keys map to AmbientBackdrop variants.
 * Landing + identity share `home-landing`; `#home-identity` is an in-band anchor.
 */
export const narrativeChapters = [
  { id: 'home-landing', num: '01', label: 'Position', ambient: 'warm' },
  { id: 'home-capabilities', num: '02', label: 'What I structure', ambient: 'signal' },
  { id: 'home-work-narrative', num: '03', label: 'Work', ambient: 'work' },
  { id: 'home-approach', num: '04', label: 'Point of View', ambient: 'depth' },
  { id: 'home-life-archive', num: '05', label: 'Beyond the Work', ambient: 'archive' },
];
