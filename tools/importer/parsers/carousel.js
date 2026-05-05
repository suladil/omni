/* eslint-disable */
/* global WebImporter */

/**
 * Parser: carousel
 * Base block: carousel
 * Source: https://www.omnihotels.com/
 * Generated: 2026-05-04
 *
 * Handles two carousel instances:
 *   1. #featured-destinations-slider — destination slides (img, linked h4, description)
 *   2. #distinctively-omni-slider — experience slides (img, h3, description, CTA)
 *
 * UE Model fields per slide (carousel-item):
 *   - media_image (reference) — slide image
 *   - media_imageAlt (collapsed into img alt — not hinted)
 *   - content_text (richtext) — title, description, link
 *
 * Output: One row per slide, two cells: [image, text content]
 */
export default function parse(element, { document }) {
  // Determine which carousel instance based on element id/class
  const isFeaturedDestinations = element.id === 'featured-destinations-slider' ||
    element.classList.contains('featured-destinations-slider');
  const isExperiences = element.id === 'distinctively-omni-slider' ||
    element.classList.contains('distinctively-omni-slider');

  let slideElements;

  if (isFeaturedDestinations) {
    // Featured Destinations: slides inside slick track, exclude cloned slides
    slideElements = element.querySelectorAll('.slick-slide:not(.slick-cloned) .featured-destinations-outer-slide');
    // Fallback if slick hasn't initialized
    if (!slideElements.length) {
      slideElements = element.querySelectorAll('.featured-destinations-outer-slide');
    }
  } else if (isExperiences) {
    // Enriching Experiences: slides inside slick track, exclude cloned slides
    slideElements = element.querySelectorAll('.slick-slide:not(.slick-cloned) .distinctively-omni-slider-item');
    // Fallback if slick hasn't initialized
    if (!slideElements.length) {
      slideElements = element.querySelectorAll('.distinctively-omni-slider-item');
    }
  } else {
    // Generic fallback
    slideElements = element.querySelectorAll('.slick-slide:not(.slick-cloned) .slide');
    if (!slideElements.length) {
      slideElements = element.querySelectorAll('.slide');
    }
  }

  const cells = [];

  Array.from(slideElements).forEach((slide) => {
    // --- Image cell ---
    const imageCellContent = [];
    const fieldHintImage = document.createComment(' field:media_image ');
    imageCellContent.push(fieldHintImage);

    if (isFeaturedDestinations) {
      const picture = slide.querySelector('.featured-destinations-slider-image picture');
      const img = slide.querySelector('.featured-destinations-slider-image img');
      if (picture) {
        imageCellContent.push(picture.cloneNode(true));
      } else if (img) {
        imageCellContent.push(img.cloneNode(true));
      }
    } else {
      const picture = slide.querySelector('picture');
      const img = slide.querySelector('img.distinctively-omni-slider-image, img');
      if (picture) {
        imageCellContent.push(picture.cloneNode(true));
      } else if (img) {
        imageCellContent.push(img.cloneNode(true));
      }
    }

    // --- Content/text cell ---
    const contentCellContent = [];
    const fieldHintText = document.createComment(' field:content_text ');
    contentCellContent.push(fieldHintText);

    if (isFeaturedDestinations) {
      // Extract title (h4 inside a link), description, and link href
      const titleLink = slide.querySelector('.featured-destinations-slider-title a');
      const heading = slide.querySelector('.featured-destinations-slider-title h4');
      const description = slide.querySelector('.featured-destinations-slider-description p');

      if (heading && titleLink) {
        const a = document.createElement('a');
        a.href = titleLink.href;
        const h = document.createElement('h4');
        h.textContent = heading.textContent.trim();
        a.appendChild(h);
        contentCellContent.push(a);
      } else if (heading) {
        const h = document.createElement('h4');
        h.textContent = heading.textContent.trim();
        contentCellContent.push(h);
      }

      if (description) {
        const p = document.createElement('p');
        p.textContent = description.textContent.trim();
        contentCellContent.push(p);
      }
    } else {
      // Enriching Experiences: h3 title, description, CTA
      const heading = slide.querySelector('h3');
      const description = slide.querySelector('p.distinctively-omni-slider-detail, .distinctively-omni-slider-text-wrapper p');
      const cta = slide.querySelector('a.newBtnStyling, .distinctively-omni-slider-text-wrapper a');

      if (heading) {
        const h = document.createElement('h3');
        h.textContent = heading.textContent.trim();
        contentCellContent.push(h);
      }

      if (description) {
        const p = document.createElement('p');
        p.textContent = description.textContent.trim();
        contentCellContent.push(p);
      }

      if (cta) {
        const a = document.createElement('a');
        a.href = cta.href;
        a.textContent = cta.textContent.trim();
        contentCellContent.push(a);
      }
    }

    cells.push([imageCellContent, contentCellContent]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'carousel', cells });
  element.replaceWith(block);
}
