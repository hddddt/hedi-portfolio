/**
 * Cross-chapter handoff lock — blocks enter effects / panel resets while nav scroll runs.
 * @typedef {'cap-work' | 'work-pov'} ChapterTransitionId
 */

/** @type {ChapterTransitionId | null} */
let activeTransition = null;

/** @param {ChapterTransitionId} id */
export function beginChapterTransition(id) {
  activeTransition = id;
}

/** @param {ChapterTransitionId} [id] */
export function endChapterTransition(id) {
  if (!id || activeTransition === id) {
    activeTransition = null;
  }
}

/** @param {ChapterTransitionId} [id] */
export function isChapterTransition(id) {
  if (!activeTransition) return false;
  return id ? activeTransition === id : true;
}

export function currentChapterTransition() {
  return activeTransition;
}
