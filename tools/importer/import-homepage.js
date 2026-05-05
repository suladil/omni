/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import carouselParser from './parsers/carousel.js';

// TRANSFORMER IMPORTS
import omniCleanupTransformer from './transformers/omni-cleanup.js';
import omniSectionsTransformer from './transformers/omni-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'cards': cardsParser,
  'carousel': carouselParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  omniCleanupTransformer,
  omniSectionsTransformer,
];

// PAGE TEMPLATE CONFIGURATION
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Omni Hotels homepage with hero, booking widget, property showcases, loyalty program, and promotional content',
  urls: ['https://www.omnihotels.com/'],
  blocks: [
    {
      name: 'hero',
      instances: ['.video-hero-slider-content-wrapper']
    },
    {
      name: 'cards',
      instances: ['.horizontal-accordion']
    },
    {
      name: 'carousel',
      instances: ['#featured-destinations-slider', '#distinctively-omni-slider']
    }
  ],
  sections: [
    {
      id: 'hero',
      name: 'Hero Section',
      selector: '.plp-hero-wrapper',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: []
    },
    {
      id: 'welcome',
      name: 'Welcome Section',
      selector: "[data-component='loyalty-signup']",
      style: null,
      blocks: [],
      defaultContent: ['.digex-loyalty-signup-header h2', '.digex-loyalty-signup-header p']
    },
    {
      id: 'special-offers',
      name: 'Special Offers Section',
      selector: '.plp-offers-wrapper',
      style: null,
      blocks: ['cards'],
      defaultContent: ['.plp-offers-heading-container h2', '.plp-offers-heading-container p']
    },
    {
      id: 'featured-destinations',
      name: 'Featured Destinations Section',
      selector: '.widget-wrapper--featured-destinations-slider',
      style: 'light',
      blocks: ['carousel'],
      defaultContent: ['.widget-container-heading-container h2', '.widget-container-heading-container a', '.widget-container-heading-container p']
    },
    {
      id: 'enriching-experiences',
      name: 'Enriching Experiences Section',
      selector: '.widget-wrapper--distinctively-omni-slider',
      style: null,
      blocks: ['carousel'],
      defaultContent: ['.widget-container-heading-container h2', '.widget-container-heading-container p']
    }
  ]
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = {
    ...payload,
    template: PAGE_TEMPLATE
  };

  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach(blockDef => {
    blockDef.instances.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach(element => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

// EXPORT DEFAULT CONFIGURATION
export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;

    const main = document.body;

    // 1. Execute beforeTransform transformers (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach(block => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform transformers (final cleanup + section breaks)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path: path || '/index',
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map(b => b.name),
      }
    }];
  }
};
