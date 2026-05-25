/**
 * Chapter manifest for narrative rail + ambient state.
 * `ambient` keys map to AmbientBackdrop variants.
 * Landing + identity share `home-landing`; `#home-identity` is an in-band anchor.
 */
export const narrativeChapters = [
  { id: 'home-landing', num: '01', label: 'Recognition', ambient: 'warm' },
  { id: 'home-capabilities', num: '02', label: 'Behavior', ambient: 'signal' },
  { id: 'home-work-narrative', num: '03', label: 'Proof', ambient: 'work' },
  { id: 'home-approach', num: '04', label: 'Memory', ambient: 'depth' },
  { id: 'home-contact', num: '05', label: 'Action', ambient: 'contact' },
];
