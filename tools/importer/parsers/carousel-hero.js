/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: carousel-hero
 * Base block: carousel
 * Source: https://rouxbeauty.com/ (#home-slider)
 * Generated: 2026-05-21
 *
 * Source structure (Divi fullwidth slider):
 *   #home-slider .et_pb_fullwidth_slider_0 .et_pb_slides
 *     .et_pb_slide (one per slide)
 *       .et_pb_slide_image > img            -> column 1 (image)
 *       .et_pb_slide_description
 *         .et_pb_button_wrapper > a         -> column 2 (CTA link only)
 *
 * Target table (per library-example.md / library-description.txt):
 *   Row 1: block name "Carousel (hero)" — produced by createBlock with name 'carousel-hero'.
 *   Row 2..N: one row per slide; col 1 = image, col 2 = CTA link.
 */
export default function parse(element, { document }) {
  // The element matches the selector "#home-slider" (an et_pb_section wrapping the slider).
  // Find the slider container (handles either the section or the slider itself being passed in).
  const slider = element.matches('.et_pb_slider')
    ? element
    : element.querySelector('.et_pb_slider, .et_pb_fullwidth_slider_0');

  // Source for slides: prefer the slider's slides container, but fall back to the element itself.
  const slidesRoot = slider || element;
  const slides = Array.from(slidesRoot.querySelectorAll('.et_pb_slide'));

  const cells = [];

  slides.forEach((slide) => {
    // Column 1 — slide image (mandatory per library description)
    const image = slide.querySelector('.et_pb_slide_image img, img');

    // Column 2 — CTA link only (no title/description for rouxbeauty.com slides)
    const cta = slide.querySelector(
      '.et_pb_slide_description .et_pb_button_wrapper a, .et_pb_button_wrapper a, a.et_pb_button',
    );

    // Skip empty slides (no image and no CTA)
    if (!image && !cta) return;

    cells.push([
      image || '',
      cta || '',
    ]);
  });

  const block = WebImporter.Blocks.createBlock(document, {
    name: 'carousel-hero',
    cells,
  });

  element.replaceWith(block);
}
