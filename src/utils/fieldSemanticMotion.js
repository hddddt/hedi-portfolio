/**
 * Apply scroll / interaction semantic weights on top of orb scene layout.
 */

import { fieldIdForHue, WORK_CASE_FIELD_ANCHOR } from '../data/fieldSemanticStates.js';

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function applyFieldBias(field, anchor, strength, boost) {
  const u = Math.max(0, Math.min(1, strength));
  if (u < 0.02) return field;
  return {
    ...field,
    centerX: lerp(field.centerX, anchor.x, u * 0.22),
    centerY: lerp(field.centerY, anchor.y, u * 0.18),
    opacity: field.opacity * lerp(1, boost.opacity, u),
    scale: field.scale * lerp(1, boost.scale, u),
  };
}

function recessField(field, strength) {
  const u = Math.max(0, Math.min(1, strength)) * 0.42;
  return {
    ...field,
    opacity: field.opacity * (1 - u),
    scale: field.scale * (1 - u * 0.06),
  };
}

/**
 * Work chapter — elevate case hue, recess others; pull toward card anchor.
 * @param {import('../components/home/organicFieldMotion.js').MotionTargets} targets
 * @param {{ caseId?: string | null, hue?: string | null, strength?: number }} focus
 */
export function applyWorkCaseFieldActivation(targets, focus) {
  const strength = focus?.strength ?? 0;
  const hue = focus?.hue ?? null;
  if (!hue || strength < 0.02) return targets;

  const anchor =
    (focus.caseId && WORK_CASE_FIELD_ANCHOR[focus.caseId]) ||
    WORK_CASE_FIELD_ANCHOR.case01;
  const boost = { opacity: 1.22, scale: 1.08 };
  const activeId = fieldIdForHue(hue);

  const mapField = (key, field) => {
    if (key === activeId) return applyFieldBias(field, anchor, strength, boost);
    return recessField(field, strength);
  };

  return {
    ...targets,
    a: mapField('a', targets.a),
    b: mapField('b', targets.b),
    c: mapField('c', targets.c),
  };
}

/**
 * Global nav hover — very subtle hue lift.
 * @param {import('../components/home/organicFieldMotion.js').MotionTargets} targets
 * @param {{ hue?: string | null, strength?: number }} hint
 */
export function applyNavFieldHint(targets, hint) {
  const strength = (hint?.strength ?? 0) * 0.55;
  const hue = hint?.hue ?? null;
  if (!hue || strength < 0.01) return targets;

  const id = fieldIdForHue(hue);
  const lift = 1 + strength * 0.12;
  const dip = 1 - strength * 0.06;

  return {
    ...targets,
    a: {
      ...targets.a,
      opacity: targets.a.opacity * (id === 'a' ? lift : dip),
    },
    b: {
      ...targets.b,
      opacity: targets.b.opacity * (id === 'b' ? lift : dip),
    },
    c: {
      ...targets.c,
      opacity: targets.c.opacity * (id === 'c' ? lift : dip),
    },
  };
}
