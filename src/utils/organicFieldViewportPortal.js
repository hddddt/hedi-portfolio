/** Viewport WebGL host on `body` (behind #root) — avoids scroll-root stacking when shortcut panel opens. */

export const ORGANIC_FIELD_VIEWPORT_PORTAL_ID = 'organic-field-viewport-portal';

/**
 * @returns {HTMLElement}
 */
export function getOrganicFieldViewportPortalNode() {
  if (typeof document === 'undefined') {
    throw new Error('getOrganicFieldViewportPortalNode requires document');
  }
  let node = document.getElementById(ORGANIC_FIELD_VIEWPORT_PORTAL_ID);
  if (!node) {
    node = document.createElement('div');
    node.id = ORGANIC_FIELD_VIEWPORT_PORTAL_ID;
    node.className = 'organic-field-host organic-field-host--viewport';
    node.setAttribute('data-layer', 'organic-field-viewport');
    node.setAttribute('aria-hidden', 'true');
    const appRoot = document.getElementById('root');
    if (appRoot?.parentNode === document.body) {
      document.body.insertBefore(node, appRoot);
    } else {
      document.body.prepend(node);
    }
  } else {
    const appRoot = document.getElementById('root');
    if (appRoot?.parentNode === document.body && node.nextElementSibling !== appRoot) {
      document.body.insertBefore(node, appRoot);
    }
  }
  return node;
}
