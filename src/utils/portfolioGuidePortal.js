/** Dedicated body portal — keeps Portfolio Shortcut above scroll-home field layers. */

export const PORTFOLIO_GUIDE_PORTAL_ID = 'portfolio-guide-portal';

/**
 * @returns {HTMLElement}
 */
export function getPortfolioGuidePortalNode() {
  if (typeof document === 'undefined') {
    throw new Error('getPortfolioGuidePortalNode requires document');
  }
  let node = document.getElementById(PORTFOLIO_GUIDE_PORTAL_ID);
  if (!node) {
    node = document.createElement('div');
    node.id = PORTFOLIO_GUIDE_PORTAL_ID;
    node.setAttribute('data-layer', 'portfolio-guide');
    document.body.appendChild(node);
  } else if (node.parentNode === document.body && node !== document.body.lastElementChild) {
    document.body.appendChild(node);
  }
  return node;
}
