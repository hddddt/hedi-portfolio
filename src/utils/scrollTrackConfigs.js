/**
 * Explicit phase configs for homepage sticky tracks.
 */

import { TRACK_PANEL_VH, TRACK_RELEASE_VH } from './scrollTrack.js';
import {
  WORK_TRACK_LEAD_IN_VH,
  WORK_TRACK_RELEASE_VH,
} from './workChoreography.js';
import { trackHeightVhFromPhases } from './scrollTimeline.js';

/** Opening — 420vh total (CSS); phases describe scroll narrative segments only. */
export const OPENING_TRACK_VH = 420;

export const OPENING_SCROLL_PHASES = [
  { id: 'immersion', vh: 92, kind: 'scroll' },
  { id: 'formation', vh: 96, kind: 'scroll' },
  { id: 'thesis-dwell', vh: 136, kind: 'scroll' },
  { id: 'exit-handoff', vh: 96, kind: 'scroll' },
];

/** Capabilities — panel-0 … panel-4 + explicit release. */
export function capabilityPhases(panelCount = 5) {
  const panels = Array.from({ length: panelCount }, (_, i) => ({
    id: `panel-${i}`,
    vh: TRACK_PANEL_VH,
    kind: 'panel',
    index: i,
  }));
  return [...panels, { id: 'release', vh: TRACK_RELEASE_VH, kind: 'release' }];
}

export function capabilityTrackHeightVh(panelCount = 5) {
  return trackHeightVhFromPhases(capabilityPhases(panelCount));
}

/** Work — explicit approach lead-in + cases + release. */
export function workPhases(caseCount) {
  const n = Math.max(1, caseCount ?? 1);
  const cases = Array.from({ length: n }, (_, i) => ({
    id: `case-${i}`,
    vh: TRACK_PANEL_VH,
    kind: 'panel',
    index: i,
  }));
  return [
    { id: 'approach', vh: WORK_TRACK_LEAD_IN_VH, kind: 'approach', index: 0 },
    ...cases,
    { id: 'release', vh: WORK_TRACK_RELEASE_VH, kind: 'release' },
  ];
}

export function workTrackHeightVhFromPhases(caseCount) {
  return trackHeightVhFromPhases(workPhases(caseCount));
}

/** POV — one phase per beat + corridor handoff to archive. */
export const POV_CORRIDOR_VH = 38;

export function povPhases(beatCount) {
  const n = Math.max(1, beatCount ?? 1);
  const beats = Array.from({ length: n }, (_, i) => ({
    id: `beat-${i}`,
    vh: TRACK_PANEL_VH,
    kind: 'panel',
    index: i,
  }));
  return [...beats, { id: 'corridor', vh: POV_CORRIDOR_VH, kind: 'release' }];
}

export function povTrackHeightVhFromPhases(beatCount, corridorVh = POV_CORRIDOR_VH) {
  const phases = povPhases(beatCount);
  const corridor = phases.find((p) => p.id === 'corridor');
  if (corridor && corridorVh !== POV_CORRIDOR_VH) {
    corridor.vh = corridorVh;
  }
  return trackHeightVhFromPhases(phases);
}

/** Document chapter ids aligned with narrativeChapters.js */
export const HOME_CHAPTER_IDS = [
  'home-landing',
  'home-capabilities',
  'home-work-narrative',
  'home-approach',
  'home-life-archive',
];
