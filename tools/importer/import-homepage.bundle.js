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

  // tools/importer/parsers/carousel-hero.js
  function parse(element, { document }) {
    const slider = element.matches(".et_pb_slider") ? element : element.querySelector(".et_pb_slider, .et_pb_fullwidth_slider_0");
    const slidesRoot = slider || element;
    const slides = Array.from(slidesRoot.querySelectorAll(".et_pb_slide"));
    const cells = [];
    slides.forEach((slide) => {
      const image = slide.querySelector(".et_pb_slide_image img, img");
      const cta = slide.querySelector(
        ".et_pb_slide_description .et_pb_button_wrapper a, .et_pb_button_wrapper a, a.et_pb_button"
      );
      if (!image && !cta) return;
      cells.push([
        image || "",
        cta || ""
      ]);
    });
    const block = WebImporter.Blocks.createBlock(document, {
      name: "carousel-hero",
      cells
    });
    element.replaceWith(block);
  }

  // tools/importer/transformers/rouxbeauty-cleanup.js
  var TransformHook = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        "#ot-sdk-btn-floating",
        ".onetrust-pc-dark-filter"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "access-widget-ui",
        ".acsb-trigger",
        ".acsb-sr-alert",
        ".acsb-sr-only",
        ".acsb-widget"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "#cff-lightbox-overlay",
        "#cff-lightbox-wrapper"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".grecaptcha-badge",
        ".grecaptcha-logo",
        ".grecaptcha-error",
        "#g-recaptcha-response-100000"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".et_pb_fullwidth_slider_1",
        ".et_pb_fullwidth_slider_2"
      ]);
      const cffWrapper = element.querySelector(".cff-wrapper");
      if (cffWrapper) {
        const noMore = cffWrapper.querySelector(".cff-no-more-posts");
        if (noMore) {
          const replacement = element.ownerDocument.createElement("p");
          replacement.textContent = noMore.textContent.trim();
          cffWrapper.replaceWith(replacement);
        } else {
          cffWrapper.remove();
        }
      }
      const strayTopImg = element.querySelector("#page-container > img:first-child");
      if (strayTopImg) strayTopImg.remove();
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        "header#main-header",
        "footer#main-footer",
        "#et-mobile-nav-menu",
        "#et-top-navigation",
        "#top-links",
        "#et-footer-nav",
        "#footer-bottom",
        "#search-link"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".et-pb-slider-arrows",
        ".et-pb-controllers"
      ]);
      WebImporter.DOMUtils.remove(element, [
        "script",
        "noscript",
        "iframe",
        "link",
        "source",
        "style"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("onclick");
        el.removeAttribute("onload");
        el.removeAttribute("data-track");
        el.removeAttribute("data-tracking");
      });
    }
  }

  // tools/importer/transformers/rouxbeauty-sections.js
  var TransformHook2 = {
    beforeTransform: "beforeTransform",
    afterTransform: "afterTransform"
  };
  function transform2(hookName, element, payload) {
    if (hookName !== TransformHook2.afterTransform) return;
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument;
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section || !section.selector) continue;
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue;
      if (section.style) {
        const metaBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        sectionEl.after(metaBlock);
      }
      if (i > 0 && sectionEl.previousElementSibling) {
        const hr = document.createElement("hr");
        sectionEl.before(hr);
      }
    }
  }

  // tools/importer/import-homepage.js
  var parsers = {
    "carousel-hero": parse
  };
  var PAGE_TEMPLATE = {
    name: "homepage",
    description: "Homepage of rouxbeauty.com \u2014 landing page with hero, product features, brand storytelling, and footer-area content",
    urls: [
      "https://rouxbeauty.com/"
    ],
    blocks: [
      {
        name: "carousel-hero",
        instances: ["#home-slider"]
      }
    ],
    sections: [
      {
        id: "home-slider",
        name: "Home Slider",
        selector: "#home-slider",
        style: null,
        blocks: ["carousel-hero"],
        defaultContent: []
      },
      {
        id: "social-feed",
        name: "Social & Beautiful",
        selector: "#social-feed",
        style: "light",
        blocks: [],
        defaultContent: ["#social-feed h2", "#social-feed p"]
      },
      {
        id: "weightless-oils-banner",
        name: "Weightless Oils Banner",
        selector: "#weightless-oils-banner",
        style: "light",
        blocks: [],
        defaultContent: ["#weightless-oils-banner a"]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "") || "/index"
      );
      return [
        {
          element: main,
          path,
          report: {
            title: document.title,
            template: PAGE_TEMPLATE.name,
            blocks: pageBlocks.map((b) => b.name)
          }
        }
      ];
    }
  };
  return __toCommonJS(import_homepage_exports);
})();
