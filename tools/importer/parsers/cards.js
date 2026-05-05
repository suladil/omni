/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards variant.
 * Base block: cards (container block with card items)
 * Source: https://www.omnihotels.com/
 * Selector: .horizontal-accordion
 * Generated: 2026-05-04
 *
 * Source structure (live DOM):
 *   section.horizontal-accordion
 *     > .horizontal-accordion-background
 *       > .horizontal-accordion-container
 *         > .horizontal-accordion-card (x4)
 *           > .horizontal-accordion-content
 *             > a.horizontal-accordion-content-image-link > picture > img
 *             > .horizontal-accordion-content-text-panel
 *               > .horizontal-accordion-content-text-panel-content
 *                 > .horizontal-accordion-content-text-panel-content-header > h3, h4
 *                 > p.horizontal-accordion-content-detail
 *               > a.horizontal-accordion-content-cta
 *
 * Target structure (from _cards.json model):
 *   Container block "Cards" with child items "card"
 *   Each row = one card with 2 columns: [image, text]
 *   Model fields: image (reference), text (richtext)
 */
export default function parse(element, { document }) {
  // Select all card items - cards are nested inside .horizontal-accordion-container
  const cards = element.querySelectorAll('.horizontal-accordion-card');

  const cells = [];

  cards.forEach((card) => {
    // Extract image from the content area (not the thumbnail button)
    const image = card.querySelector('.horizontal-accordion-content img, .horizontal-accordion-content picture');

    // Extract text content from the text panel
    const title = card.querySelector('.horizontal-accordion-content-text-panel-content-header h3, .horizontal-accordion-content h3');
    const subtitle = card.querySelector('.horizontal-accordion-content-text-panel-content-header h4, .horizontal-accordion-content h4');
    const description = card.querySelector('p.horizontal-accordion-content-detail, .horizontal-accordion-content-text-panel-content p');
    const cta = card.querySelector('a.horizontal-accordion-content-cta, .horizontal-accordion-content-text-panel > a');

    // Build image cell with field hint
    const imageHint = document.createComment(' field:image ');
    const imageCell = [imageHint];
    if (image) {
      imageCell.push(image);
    }

    // Build text cell with field hint - combines title, subtitle, description, and CTA
    const textHint = document.createComment(' field:text ');
    const textCell = [textHint];
    if (title) textCell.push(title);
    if (subtitle && subtitle.textContent.trim()) textCell.push(subtitle);
    if (description) textCell.push(description);
    if (cta) textCell.push(cta);

    // Each card is one row with 2 columns: [image, text]
    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
