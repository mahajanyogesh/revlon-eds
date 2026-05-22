/* eslint-disable */
/* global WebImporter */

// Parser imports
import carouselHeroParser from './parsers/carousel-hero.js';

// Transformer imports
import rouxbeautyCleanupTransformer from './transformers/rouxbeauty-cleanup.js';
import rouxbeautySectionsTransformer from './transformers/rouxbeauty-sections.js';

// Parser registry: block name -> parser function
const parsers = {
  'carousel-hero': carouselHeroParser,
};

// Embedded page template (mirrors tools/importer/page-templates.json -> homepage)
const PAGE_TEMPLATE = {
  name: 'homepage',
  description: 'Homepage of rouxbeauty.com — landing page with hero, product features, brand storytelling, and footer-area content',
  urls: [
    'https://rouxbeauty.com/',
  ],
  blocks: [
    {
      name: 'carousel-hero',
      instances: ['#home-slider'],
    },
  ],
  sections: [
    {
      id: 'home-slider',
      name: 'Home Slider',
      selector: '#home-slider',
      style: null,
      blocks: ['carousel-hero'],
      defaultContent: [],
    },
    {
      id: 'social-feed',
      name: 'Social & Beautiful',
      selector: '#social-feed',
      style: 'light',
      blocks: [],
      defaultContent: ['#social-feed h2', '#social-feed p'],
    },
    {
      id: 'weightless-oils-banner',
      name: 'Weightless Oils Banner',
      selector: '#weightless-oils-banner',
      style: 'light',
      blocks: [],
      defaultContent: ['#weightless-oils-banner a'],
    },
  ],
};

// Transformer registry: section transformer runs only when there are 2+ sections
const transformers = [
  rouxbeautyCleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1
    ? [rouxbeautySectionsTransformer]
    : []),
];

/**
 * Run all page transformers for a given hook.
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Locate all block instances on the page based on the embedded template.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. beforeTransform — initial cleanup (remove cookie banners, scripts, duplicate sliders, etc.)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on the page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Run each block's parser
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (!parser) {
        console.warn(`No parser registered for block: ${block.name}`);
        return;
      }
      try {
        parser(block.element, { document, url, params });
      } catch (e) {
        console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
      }
    });

    // 4. afterTransform — final cleanup + section breaks/metadata
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in WebImporter rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitize the output path (strip trailing slash and any .html extension)
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '') || '/index',
    );

    return [
      {
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
        },
      },
    ];
  },
};
