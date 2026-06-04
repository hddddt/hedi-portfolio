/** True while Portfolio Shortcut panel is open or closing (scroll / handoff freeze). */
export function isPortfolioGuidePanelLocked() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('portfolio-guide-panel-open');
}
