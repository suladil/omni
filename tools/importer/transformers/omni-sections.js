/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Omni Hotels section breaks and section metadata.
 * Inserts <hr> between sections and adds Section Metadata blocks for styled sections.
 * Section selectors from page-templates.json, validated against live DOM.
 *
 * Sections (from template):
 *   1. hero - selector: .plp-hero-wrapper | style: "dark"
 *   2. welcome - selector: [data-component='loyalty-signup'] | style: null
 *   3. special-offers - selector: .plp-offers-wrapper | style: null
 *   4. featured-destinations - selector: .widget-wrapper--featured-destinations-slider | style: "light"
 *   5. enriching-experiences - selector: .widget-wrapper--distinctively-omni-slider | style: null
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Ensure hero wrapper (.plp-hero-wrapper) is inside main for section detection.
    // On the live site, .plp-hero-wrapper is inside <header> (outside <main>).
    const doc = element.ownerDocument || document;
    const main = element.querySelector('main') || element;
    const heroWrapper = doc.querySelector('.plp-hero-wrapper');
    if (heroWrapper && !main.contains(heroWrapper)) {
      main.insertBefore(heroWrapper, main.firstChild);
    }
  }

  if (hookName === H.after) {
    const doc = element.ownerDocument || document;
    const template = payload.template;
    const sections = template && template.sections ? template.sections : [];

    if (sections.length < 2) return;

    // Determine the search root - use main element if available, otherwise element itself
    const main = element.querySelector('main') || element;

    // Find section elements that exist in the DOM
    const foundSections = [];
    sections.forEach((section, index) => {
      const el = main.querySelector(section.selector) || element.querySelector(section.selector);
      foundSections.push({ section, index, el });
    });

    // Count how many section elements were found
    const matchedSections = foundSections.filter((s) => s.el);

    // If we found section elements, insert breaks and metadata at their positions
    if (matchedSections.length > 0) {
      // Process in reverse order to avoid DOM position shifts
      const reversed = [...foundSections].reverse();
      reversed.forEach((item) => {
        if (!item.el) return;

        // Add Section Metadata block after the section element if section has a style
        if (item.section.style) {
          const sectionMetadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: 'Section Metadata',
            cells: { style: item.section.style },
          });
          item.el.after(sectionMetadataBlock);
        }

        // Insert <hr> before the section element if not the first section
        if (item.index > 0) {
          const hr = doc.createElement('hr');
          item.el.before(hr);
        }
      });
    } else {
      // Fallback: No section selectors matched (e.g., page not fully rendered).
      // Insert section breaks and metadata at the end of main based on template definition.
      // This ensures structural correctness even when content is not fully loaded.
      const container = main.children.length > 0 ? main : element;
      const lastChild = container.lastElementChild || container;

      sections.forEach((section, index) => {
        // Insert <hr> for every section after the first
        if (index > 0) {
          const hr = doc.createElement('hr');
          lastChild.parentNode.insertBefore(hr, lastChild.nextSibling || null);
        }

        // Add Section Metadata block if section has a style
        if (section.style) {
          const sectionMetadataBlock = WebImporter.Blocks.createBlock(doc, {
            name: 'Section Metadata',
            cells: { style: section.style },
          });
          // Insert after the last hr or at the end
          const insertPoint = container.lastElementChild;
          if (insertPoint) {
            insertPoint.after(sectionMetadataBlock);
          } else {
            container.appendChild(sectionMetadataBlock);
          }
        }
      });
    }
  }
}
