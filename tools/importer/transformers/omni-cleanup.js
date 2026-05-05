/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Omni Hotels site-wide cleanup.
 * Removes non-authorable elements (navigation, header chrome, footer, scripts,
 * tracking pixels, slick carousel artifacts, accessibility-hidden elements).
 * Selectors validated against migration-work/cleaned.html and live site DOM.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Move hero wrapper from header into main so it is available for block parsing
    // and section detection. On live site, .plp-hero-wrapper is inside <header> (outside <main>).
    const main = element.querySelector('main');
    const heroWrapper = element.querySelector('.plp-hero-wrapper');
    if (main && heroWrapper) {
      main.insertBefore(heroWrapper, main.firstChild);
    }

    // Remove elements that interfere with block parsing
    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'iframe',
      'svg',
      '.svg-sprites',
      '.sr-only',
      '.slick-dots',
      '.slick-cloned',
      '[aria-hidden="true"]',
      '.accordion-btn',
      '.custom-slick-arrow',
      '.gallery-360',
      '.video-loader',
      'link[rel="stylesheet"]',
    ]);
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome
    WebImporter.DOMUtils.remove(element, [
      'nav',
      'header',
      'footer',
    ]);
  }
}
