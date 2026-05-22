/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for rouxbeauty.com.
 *
 * Iterates over `payload.template.sections` and, for each section after the
 * first, inserts an `<hr>` before the section element. For each section that
 * has a `style` set, appends a Section Metadata block immediately after the
 * section's content.
 *
 * Section selectors come from `tools/importer/page-templates.json` and are
 * verified to exist in the captured DOM (`migration-work/cleaned.html`):
 *   - `#home-slider`            (no style)
 *   - `#social-feed`            (style: light)
 *   - `#weightless-oils-banner` (style: light)
 */
const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;

  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;

  const document = element.ownerDocument;

  // Process sections in reverse so that DOM insertions for later sections do
  // not shift earlier elements we still need to find.
  for (let i = sections.length - 1; i >= 0; i -= 1) {
    const section = sections[i];
    if (!section || !section.selector) continue;

    const sectionEl = element.querySelector(section.selector);
    if (!sectionEl) continue;

    // Section Metadata: inserted AFTER the section content for sections that
    // declare a style. Helix imports treat the metadata block as belonging to
    // the preceding content.
    if (section.style) {
      const metaBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      sectionEl.after(metaBlock);
    }

    // Section break: a horizontal rule before every section except the first,
    // but only if there is sibling content above it (so we don't introduce a
    // leading <hr> at the top of <main>).
    if (i > 0 && sectionEl.previousElementSibling) {
      const hr = document.createElement('hr');
      sectionEl.before(hr);
    }
  }
}
