/** Viewport WebGL host inside `.home-scroll-root` (above ::before, below scroll content). */

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
  }

  const scrollRoot = document.querySelector('.home-scroll-root');
  if (scrollRoot) {
    if (node.parentNode !== scrollRoot) {
      scrollRoot.insertBefore(node, scrollRoot.firstChild);
    }
    return node;
  }

  const appRoot = document.getElementById('root');
  if (appRoot?.parentNode === document.body && node.parentNode !== document.body) {
    document.body.insertBefore(node, appRoot);
  } else if (!node.parentNode) {
    document.body.appendChild(node);
  }
  return node;
}
