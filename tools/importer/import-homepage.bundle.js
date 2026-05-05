/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-homepage.js
  var import_homepage_exports = {};
  __export(import_homepage_exports, {
    default: () => import_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const eyebrow = element.querySelector(".video-hero-slider__slide-content-flare");
    const heading = element.querySelector(".video-hero-slider__slide-content-blurb h2, h2, h1");
    const cta = element.querySelector("a.video-primary-cta, .video-hero-slider__slide-content-blurb a");
    const textElements = [];
    const fieldHint = document2.createComment(" field:text ");
    textElements.push(fieldHint);
    if (eyebrow) {
      const p = document2.createElement("p");
      p.textContent = eyebrow.textContent.trim();
      textElements.push(p);
    }
    if (heading) {
      const h = document2.createElement("h2");
      h.textContent = heading.textContent.trim();
      textElements.push(h);
    }
    if (cta) {
      const p = document2.createElement("p");
      const a = document2.createElement("a");
      a.href = cta.href;
      a.textContent = cta.textContent.trim();
      p.appendChild(a);
      textElements.push(p);
    }
    const cells = [
      [textElements]
    ];
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse2(element, { document: document2 }) {
    const cards = element.querySelectorAll(".horizontal-accordion-card");
    const cells = [];
    cards.forEach((card) => {
      const image = card.querySelector(".horizontal-accordion-content img, .horizontal-accordion-content picture");
      const title = card.querySelector(".horizontal-accordion-content-text-panel-content-header h3, .horizontal-accordion-content h3");
      const subtitle = card.querySelector(".horizontal-accordion-content-text-panel-content-header h4, .horizontal-accordion-content h4");
      const description = card.querySelector("p.horizontal-accordion-content-detail, .horizontal-accordion-content-text-panel-content p");
      const cta = card.querySelector("a.horizontal-accordion-content-cta, .horizontal-accordion-content-text-panel > a");
      const imageHint = document2.createComment(" field:image ");
      const imageCell = [imageHint];
      if (image) {
        imageCell.push(image);
      }
      const textHint = document2.createComment(" field:text ");
      const textCell = [textHint];
      if (title) textCell.push(title);
      if (subtitle && subtitle.textContent.trim()) textCell.push(subtitle);
      if (description) textCell.push(description);
      if (cta) textCell.push(cta);
      cells.push([imageCell, textCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/carousel.js
  function parse3(element, { document: document2 }) {
    const isFeaturedDestinations = element.id === "featured-destinations-slider" || element.classList.contains("featured-destinations-slider");
    const isExperiences = element.id === "distinctively-omni-slider" || element.classList.contains("distinctively-omni-slider");
    let slideElements;
    if (isFeaturedDestinations) {
      slideElements = element.querySelectorAll(".slick-slide:not(.slick-cloned) .featured-destinations-outer-slide");
      if (!slideElements.length) {
        slideElements = element.querySelectorAll(".featured-destinations-outer-slide");
      }
    } else if (isExperiences) {
      slideElements = element.querySelectorAll(".slick-slide:not(.slick-cloned) .distinctively-omni-slider-item");
      if (!slideElements.length) {
        slideElements = element.querySelectorAll(".distinctively-omni-slider-item");
      }
    } else {
      slideElements = element.querySelectorAll(".slick-slide:not(.slick-cloned) .slide");
      if (!slideElements.length) {
        slideElements = element.querySelectorAll(".slide");
      }
    }
    const cells = [];
    Array.from(slideElements).forEach((slide) => {
      const imageCellContent = [];
      const fieldHintImage = document2.createComment(" field:media_image ");
      imageCellContent.push(fieldHintImage);
      if (isFeaturedDestinations) {
        const picture = slide.querySelector(".featured-destinations-slider-image picture");
        const img = slide.querySelector(".featured-destinations-slider-image img");
        if (picture) {
          imageCellContent.push(picture.cloneNode(true));
        } else if (img) {
          imageCellContent.push(img.cloneNode(true));
        }
      } else {
        const picture = slide.querySelector("picture");
        const img = slide.querySelector("img.distinctively-omni-slider-image, img");
        if (picture) {
          imageCellContent.push(picture.cloneNode(true));
        } else if (img) {
          imageCellContent.push(img.cloneNode(true));
        }
      }
      const contentCellContent = [];
      const fieldHintText = document2.createComment(" field:content_text ");
      contentCellContent.push(fieldHintText);
      if (isFeaturedDestinations) {
        const titleLink = slide.querySelector(".featured-destinations-slider-title a");
        const heading = slide.querySelector(".featured-destinations-slider-title h4");
        const description = slide.querySelector(".featured-destinations-slider-description p");
        if (heading && titleLink) {
          const a = document2.createElement("a");
          a.href = titleLink.href;
          const h = document2.createElement("h4");
          h.textContent = heading.textContent.trim();
          a.appendChild(h);
          contentCellContent.push(a);
        } else if (heading) {
          const h = document2.createElement("h4");
          h.textContent = heading.textContent.trim();
          contentCellContent.push(h);
        }
        if (description) {
          const p = document2.createElement("p");
          p.textContent = description.textContent.trim();
          contentCellContent.push(p);
        }
      } else {
        const heading = slide.querySelector("h3");
        const description = slide.querySelector("p.distinctively-omni-slider-detail, .distinctively-omni-slider-text-wrapper p");
        const cta = slide.querySelector("a.newBtnStyling, .distinctively-omni-slider-text-wrapper a");
        if (heading) {
          const h = document2.createElement("h3");
          h.textContent = heading.textContent.trim();
          contentCellContent.push(h);
        }
        if (description) {
          const p = document2.createElement("p");
          p.textContent = description.textContent.trim();
          contentCellContent.push(p);
        }
        if (cta) {
          const a = document2.createElement("a");
          a.href = cta.href;
          a.textContent = cta.textContent.trim();
          contentCellContent.push(a);
        }
      }
      cells.push([imageCellContent, contentCellContent]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "carousel", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/omni-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      const main = element.querySelector("main");
      const heroWrapper = element.querySelector(".plp-hero-wrapper");
      if (main && heroWrapper) {
        main.insertBefore(heroWrapper, main.firstChild);
      }
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "iframe",
        "svg",
        ".svg-sprites",
        ".sr-only",
        ".slick-dots",
        ".slick-cloned",
        '[aria-hidden="true"]',
        ".accordion-btn",
        ".custom-slick-arrow",
        ".gallery-360",
        ".video-loader",
        'link[rel="stylesheet"]'
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "nav",
        "header",
        "footer"
      ]);
    }
  }

  // tools/importer/transformers/omni-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.before) {
      const doc = element.ownerDocument || document;
      const main = element.querySelector("main") || element;
      const heroWrapper = doc.querySelector(".plp-hero-wrapper");
      if (heroWrapper && !main.contains(heroWrapper)) {
        main.insertBefore(heroWrapper, main.firstChild);
      }
    }
    if (hookName === H2.after) {
      const doc = element.ownerDocument || document;
      const template = payload.template;
      const sections = template && template.sections ? template.sections : [];
      if (sections.length < 2) return;
      const main = element.querySelector("main") || element;
      const foundSections = [];
      sections.forEach((section, index) => {
        const el = main.querySelector(section.selector) || element.querySelector(section.selector);
        foundSections.push({ section, index, el });
      });
      const matchedSections = foundSections.filter((s) => s.el);
      if (matchedSections.length > 0) {
        const reversed = [...foundSections].reverse();
        reversed.forEach((item) => {
          if (!item.el) return;
          if (item.section.style) {
            const sectionMetadataBlock = WebImporter.Blocks.createBlock(doc, {
              name: "Section Metadata",
              cells: { style: item.section.style }
            });
            item.el.after(sectionMetadataBlock);
          }
          if (item.index > 0) {
            const hr = doc.createElement("hr");
            item.el.before(hr);
          }
        });
      } else {
        const container = main.children.length > 0 ? main : element;
        const lastChild = container.lastElementChild || container;
        sections.forEach((section, index) => {
          if (index > 0) {
            const hr = doc.createElement("hr");
            lastChild.parentNode.insertBefore(hr, lastChild.nextSibling || null);
          }
          if (section.style) {
            const sectionMetadataBlock = WebImporter.Blocks.createBlock(doc, {
              name: "Section Metadata",
              cells: { style: section.style }
            });
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

  // tools/importer/import-homepage.js
  var parsers = {
    "hero": parse,
    "cards": parse2,
    "carousel": parse3
  };
  var transformers = [
    transform,
    transform2
  ];
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Omni Hotels homepage with hero, booking widget, property showcases, loyalty program, and promotional content",
    urls: ["https://www.omnihotels.com/"],
    blocks: [
      {
        name: "hero",
        instances: [".video-hero-slider-content-wrapper"]
      },
      {
        name: "cards",
        instances: [".horizontal-accordion"]
      },
      {
        name: "carousel",
        instances: ["#featured-destinations-slider", "#distinctively-omni-slider"]
      }
    ],
    sections: [
      {
        id: "hero",
        name: "Hero Section",
        selector: ".plp-hero-wrapper",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "welcome",
        name: "Welcome Section",
        selector: "[data-component='loyalty-signup']",
        style: null,
        blocks: [],
        defaultContent: [".digex-loyalty-signup-header h2", ".digex-loyalty-signup-header p"]
      },
      {
        id: "special-offers",
        name: "Special Offers Section",
        selector: ".plp-offers-wrapper",
        style: null,
        blocks: ["cards"],
        defaultContent: [".plp-offers-heading-container h2", ".plp-offers-heading-container p"]
      },
      {
        id: "featured-destinations",
        name: "Featured Destinations Section",
        selector: ".widget-wrapper--featured-destinations-slider",
        style: "light",
        blocks: ["carousel"],
        defaultContent: [".widget-container-heading-container h2", ".widget-container-heading-container a", ".widget-container-heading-container p"]
      },
      {
        id: "enriching-experiences",
        name: "Enriching Experiences Section",
        selector: ".widget-wrapper--distinctively-omni-slider",
        style: null,
        blocks: ["carousel"],
        defaultContent: [".widget-container-heading-container h2", ".widget-container-heading-container p"]
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), {
      template: PAGE_TEMPLATE
    });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
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
  var import_homepage_default = {
    transform: (payload) => {
      const { document: document2, url, html, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path: path || "/index",
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
