/* eslint-disable */
/* global WebImporter */

/**
 * Site-wide cleanup transformer for rouxbeauty.com.
 *
 * All selectors below are derived from the captured DOM in
 * `migration-work/cleaned.html` for the homepage of rouxbeauty.com.
 * Each removal is annotated with the source location / element it targets.
 *
 * Goals:
 * 1. Strip non-authorable site chrome (header, footer, navs, cookie banners,
 *    accessibility widgets, lightbox overlays, scripts, etc.).
 * 2. Remove Divi/WordPress responsive-breakpoint duplicates of the homepage
 *    fullwidth slider — only the first slider module is authorable content.
 * 3. Replace the empty Facebook-feed widget (`.cff-wrapper`) with just its
 *    visible "No more posts" text so the social-feed section ends up with the
 *    H2 + paragraph default content described in the page template.
 */
const TransformHook = {
  beforeTransform: 'beforeTransform',
  afterTransform: 'afterTransform',
};

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // ── Cookie / consent banner (captured DOM lines 647-688)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '#ot-sdk-btn-floating',
      '.onetrust-pc-dark-filter',
    ]);

    // ── AccessiBe accessibility widget (captured DOM lines 2-11, 689)
    WebImporter.DOMUtils.remove(element, [
      'access-widget-ui',
      '.acsb-trigger',
      '.acsb-sr-alert',
      '.acsb-sr-only',
      '.acsb-widget',
    ]);

    // ── Facebook Comments-Feed lightbox & overlay (captured DOM lines 587-630)
    //     These are empty offscreen widgets, not authorable content.
    WebImporter.DOMUtils.remove(element, [
      '#cff-lightbox-overlay',
      '#cff-lightbox-wrapper',
    ]);

    // ── reCAPTCHA badge / hidden iframes (captured DOM lines 631-646)
    WebImporter.DOMUtils.remove(element, [
      '.grecaptcha-badge',
      '.grecaptcha-logo',
      '.grecaptcha-error',
      '#g-recaptcha-response-100000',
    ]);

    // ── Divi fullwidth-slider responsive duplicates.
    //     The homepage has 3 identical fullwidth-slider modules
    //     (`.et_pb_fullwidth_slider_0`, `_1`, `_2`) used by Divi for
    //     responsive breakpoints. Only `_0` is the authorable carousel —
    //     remove the duplicates (captured DOM lines 263, 367).
    WebImporter.DOMUtils.remove(element, [
      '.et_pb_fullwidth_slider_1',
      '.et_pb_fullwidth_slider_2',
    ]);

    // ── Social-feed widget cleanup.
    //     `.cff-wrapper` is the Custom-Facebook-Feed widget (captured DOM
    //     lines 484-498). On this homepage it has no posts; only the
    //     visible "No more posts" message should remain so the
    //     #social-feed section keeps an H2 + paragraph as default content.
    const cffWrapper = element.querySelector('.cff-wrapper');
    if (cffWrapper) {
      const noMore = cffWrapper.querySelector('.cff-no-more-posts');
      if (noMore) {
        const replacement = element.ownerDocument.createElement('p');
        replacement.textContent = noMore.textContent.trim();
        cffWrapper.replaceWith(replacement);
      } else {
        cffWrapper.remove();
      }
    }

    // ── Stray top-level decorative image rendered above #page-container
    //     (captured DOM line 13) — it sits outside any authored section
    //     and is not authorable content.
    const strayTopImg = element.querySelector('#page-container > img:first-child');
    if (strayTopImg) strayTopImg.remove();
  }

  if (hookName === TransformHook.afterTransform) {
    // ── Site chrome (captured DOM lines 14-151 header, 520-582 footer)
    WebImporter.DOMUtils.remove(element, [
      'header#main-header',
      'footer#main-footer',
      '#et-mobile-nav-menu',
      '#et-top-navigation',
      '#top-links',
      '#et-footer-nav',
      '#footer-bottom',
      '#search-link',
    ]);

    // ── Slider widget chrome — arrows + dot controllers inside the
    //     authorable carousel (captured DOM lines 246-261).
    WebImporter.DOMUtils.remove(element, [
      '.et-pb-slider-arrows',
      '.et-pb-controllers',
    ]);

    // ── Generic safe element removal (scripts, iframes, links, noscript,
    //     <source>, comments-feed leftover SVG strings).
    WebImporter.DOMUtils.remove(element, [
      'script',
      'noscript',
      'iframe',
      'link',
      'source',
      'style',
    ]);

    // ── Attribute hygiene: drop tracking/inline-handler attributes.
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('onclick');
      el.removeAttribute('onload');
      el.removeAttribute('data-track');
      el.removeAttribute('data-tracking');
    });
  }
}
