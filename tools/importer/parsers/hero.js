/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero variant.
 * Base block: hero
 * Source: https://www.omnihotels.com/
 * Generated: 2026-05-04
 *
 * Extracts hero text overlay content from the video hero slider.
 * Source has a video background (no static image easily extractable),
 * so only text content (eyebrow, heading, CTA) is captured.
 *
 * UE Model fields: image (reference), imageAlt (text), text (richtext)
 *
 * Validated selectors against live source DOM:
 * - .video-hero-slider__slide-content-flare -> "America is Calling"
 * - .video-hero-slider__slide-content-blurb h2 -> heading text
 * - a.video-primary-cta -> "Plan a Getaway" link
 */
export default function parse(element, { document }) {
  // Extract eyebrow text
  // Validated selector: .video-hero-slider__slide-content-flare
  const eyebrow = element.querySelector('.video-hero-slider__slide-content-flare');

  // Extract main heading
  // Validated selector: .video-hero-slider__slide-content-blurb h2
  // Fallbacks: h2, h1 (for variations across pages)
  const heading = element.querySelector('.video-hero-slider__slide-content-blurb h2, h2, h1');

  // Extract CTA link
  // Validated selector: a.video-primary-cta
  // Fallback: any anchor in the blurb area
  const cta = element.querySelector('a.video-primary-cta, .video-hero-slider__slide-content-blurb a');

  // Build text content for the richtext cell
  // UE model "text" field is richtext containing all text overlay content
  const textElements = [];

  // <!-- field:text --> hint for Universal Editor
  const fieldHint = document.createComment(' field:text ');
  textElements.push(fieldHint);

  if (eyebrow) {
    const p = document.createElement('p');
    p.textContent = eyebrow.textContent.trim();
    textElements.push(p);
  }

  if (heading) {
    const h = document.createElement('h2');
    h.textContent = heading.textContent.trim();
    textElements.push(h);
  }

  if (cta) {
    const p = document.createElement('p');
    const a = document.createElement('a');
    a.href = cta.href;
    a.textContent = cta.textContent.trim();
    p.appendChild(a);
    textElements.push(p);
  }

  // Hero block structure: single row with text content
  // Image column omitted since source uses video background (no static image)
  const cells = [
    [textElements],
  ];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
