# Header & Footer Migration Plan — rouxbeauty.com

## Overview

Migrate the **header** and **footer** from `https://rouxbeauty.com/` into this AEM Edge Delivery project. AEM EDS uses content-driven nav/footer (authored as `nav.html` / `footer.html` and decorated by `blocks/header/` and `blocks/footer/`), so this plan touches both **content** (the authored nav/footer markdown-equivalent) and **block code** (decoration + CSS).

**Source:** `https://rouxbeauty.com/`
**Decisions captured (from your answers):**
- **Header scope:** Full header — top utility bar (social + Save / Store Locator / Search) + Roux logo + main category nav.
- **Footer scope:** Full footer — top row of category links + copyright + legal links + social icons.
- **Assets:** Self-host. Download logo + social icons into `icons/` (SVG preferred; PNG fallback for the Roux wordmark).

## Source structure (from prior analysis)

Header (`<header>`):
- Top utility bar:
  - 4 social links: Facebook, Twitter, YouTube, Instagram (Font Awesome icons in source)
  - Right-side utility links: `0 Save(s)`, `Store Locator`, `Search`
- Brand row: Roux logo (image) → links to `/`
- Main nav (about-roux / top-sellers / hair-color / hair-care / blog from the footer; the source's main nav was empty when scraped — we'll author the same links the footer uses)

Footer (`<footer>`):
- Top list: `About Roux | Top Sellers | Hair Color | Hair Care | Blog`
- Copyright: `© 2026 BrandCo Multicultural Group 2020 LLC. All rights reserved.`
- Legal list: `Privacy | Exercise Your Privacy Rights | Terms | Contact`
- Social row: same 4 icons as header

## Target files

Content (authored nav/footer):
- `content/nav.plain.html` — replace existing boilerplate placeholder with rouxbeauty-shaped nav content
- `content/footer.plain.html` — same for footer

Code (decoration + styling):
- `blocks/header/header.js` (existing — review; may need minor tweaks)
- `blocks/header/header.css` — restyle to match rouxbeauty (top utility bar + logo + nav)
- `blocks/footer/footer.js` (existing — review)
- `blocks/footer/footer.css` — restyle to match rouxbeauty (link rows + copyright + social)

Assets:
- `icons/roux-logo.svg` (or `.png` if SVG isn't available) — Roux wordmark
- `icons/facebook.svg`, `icons/twitter.svg` (X), `icons/youtube.svg`, `icons/instagram.svg` — social icons (small, optimized SVG)
- `icons/search.svg` — search affordance for the utility bar

Other:
- `head.html` — preconnect already covers Open Sans Condensed; no new font work needed
- `migration-work/header-footer-tokens.json` — extracted dimensions/colors/spacing (for traceability)

## Constraints / non-negotiables

- AEM EDS pattern: `nav.html` / `footer.html` are authored content, decorated by `blocks/header/` and `blocks/footer/` JS. The block JS owns DOM transforms; CSS lives in the block's `.css`.
- No new global tokens unless missing — reuse the brand tokens already in `styles/styles.css` (navy `#192f5b`, slate `#5f779b`, Open Sans Condensed, etc.).
- Mobile-first; min-width breakpoints at 600/900/1200.
- Block selectors stay scoped (`.header …`, `.footer …`); no `*-container` / `*-wrapper` class names.
- Self-hosted images optimized (each ≤ ~10 KB SVG; PNG only if SVG unavailable).
- Don't touch the carousel-hero block or migrated content (`content/index.plain.html`).

## Phase 1 — Discovery & Asset Capture

Goal: Capture exact computed dimensions/colors/spacing and download assets.

- Open `https://rouxbeauty.com/` with Playwright; sample computed styles on:
  - `header` and its top utility bar (height, bg, padding, gap)
  - Logo `<img>` (rendered width/height, alt)
  - Top utility links (font, size, color, separator style)
  - Main nav links (font, size, weight, color, hover)
  - Footer container (bg, padding)
  - Footer category list (font, size, separator style)
  - Footer copyright (font, color, alignment)
  - Footer legal list (font, separator style)
  - Footer social icon size/color
- Identify the Roux logo asset URL; download it into `icons/`. If the source serves PNG only, keep PNG; if it has an SVG variant (likely), prefer SVG.
- Identify social icon source. Source uses Font Awesome — we'll **substitute** with our own SVG copies to avoid pulling in the FA stylesheet.
- Save findings to `migration-work/header-footer-tokens.json`.

## Phase 2 — Inventory Existing Blocks

Goal: Decide whether to extend the boilerplate's `header`/`footer` blocks or rewrite them.

- Read `blocks/header/header.js` + `header.css` to understand the existing decoration pattern.
- Read `blocks/footer/footer.js` + `footer.css`.
- Read `content/nav.plain.html` and `content/footer.plain.html` so we know the content shape the existing JS expects.
- Decision rule: keep the existing decoration shape if it's flexible enough; only rewrite if it gets in the way. Most boilerplate header blocks already support a top-row + brand + nav layout via authored sections — usually a content rewrite + targeted CSS is enough.

## Phase 3 — Author Header Content

Goal: Replace `content/nav.plain.html` with rouxbeauty-shaped content the existing `blocks/header/header.js` can decorate.

Structure (rouxbeauty pattern, expressed as authored sections):

- Section 1 — Top utility bar:
  - List of 4 social links (Facebook, Twitter, YouTube, Instagram)
  - List of 3 utility links (Save, Store Locator, Search)
- Section 2 — Brand:
  - Roux logo image linked to `/`
- Section 3 — Main nav:
  - Single-level list of category links: About Roux, Top Sellers, Hair Color, Hair Care, Blog
  - (No mega-menu; matches rouxbeauty.com's flat top-level nav)

Authored as the standard EDS `nav.plain.html` (sections separated by `<hr>` like a normal EDS doc).

## Phase 4 — Style Header

Goal: Match the rouxbeauty visual.

- Top utility bar: full-width, light navy text on white (or light grey strip), small font (~14px), social icons left-aligned, utility links right-aligned, `|` separators between utility links.
- Brand row: centered Roux logo, comfortable vertical padding.
- Main nav: horizontal row, uppercase or sentence-case (match source), Open Sans Condensed 500-ish, navy color, with hover state moving to slate-blue.
- Mobile (<600px): collapse social/utility into a hamburger or compact layout; ensure logo + nav remain accessible.
- Use brand tokens: `var(--text-color)`, `var(--brand-secondary)`, etc.
- Keep existing block decoration JS hooks intact (e.g. `data-block-status="loaded"`).

## Phase 5 — Author Footer Content

Goal: Replace `content/footer.plain.html` with rouxbeauty-shaped content.

Structure:

- Section 1 — Category list: `About Roux | Top Sellers | Hair Color | Hair Care | Blog`
- Section 2 — Copyright + legal links + social:
  - Copyright text
  - Legal list: `Privacy | Exercise Your Privacy Rights | Terms | Contact`
  - Social list (same 4 icons as header)

## Phase 6 — Style Footer

Goal: Match the rouxbeauty footer visual.

- Background: light grey or white (match source).
- Top row: centered list of category links separated by `|`, navy color, hover slate-blue.
- Copyright row: small, centered, navy.
- Legal links: same separator style as category list.
- Social icons: 24px, navy fill on hover slate-blue.
- Mobile-first stacking; horizontal at >=600px.

## Phase 7 — Verification

- Reload `http://localhost:3000/index` (server should still be running from prior sessions).
- Sample computed styles on header logo, utility links, main nav, footer category list, copyright, social icons; compare against rouxbeauty.com.
- Snapshot DOM via Playwright to confirm structure.
- Optional single screenshot for visual sanity check.
- Iterate up to 2 times on divergences before flagging gaps.

## Phase 8 — Final QA & Handoff

- `npm run lint` and resolve any findings.
- Summary: assets added, content files replaced, block CSS changes, tokens reused, any open gaps (e.g. mobile hamburger if intentionally deferred).
- Preview path: `http://localhost:3000/index` (header + footer now render around the migrated homepage content).

## Out of scope

- Mega-menu / multi-level dropdowns (rouxbeauty.com's main nav is single-level on this snapshot).
- Search modal/overlay behavior — `Search` link will navigate to `#` placeholder (matches source) or to a TBD `/search` page.
- Live social-feed or dynamic save count — `Save(s)` shows `0` matching the static state we observed.
- Any header/footer migration on pages other than the homepage (header/footer applies globally once authored).

## Checklist

- [ ] Capture header + footer computed styles from rouxbeauty.com via Playwright
- [ ] Identify and download Roux logo (SVG preferred) into `icons/`
- [ ] Add SVG social icons (Facebook, Twitter/X, YouTube, Instagram) into `icons/`
- [ ] Add SVG search icon into `icons/`
- [ ] Save findings to `migration-work/header-footer-tokens.json`
- [ ] Read existing `blocks/header/header.js`, `header.css`, `content/nav.plain.html`
- [ ] Read existing `blocks/footer/footer.js`, `footer.css`, `content/footer.plain.html`
- [ ] Decide: extend existing decoration vs minor rewrite
- [ ] Author replacement `content/nav.plain.html` (utility bar + logo + main nav)
- [ ] Style `blocks/header/header.css` to match rouxbeauty (utility bar, brand row, main nav, mobile)
- [ ] Author replacement `content/footer.plain.html` (categories + copyright + legal + social)
- [ ] Style `blocks/footer/footer.css` to match rouxbeauty (category row, copyright, legal, social)
- [ ] Reload `http://localhost:3000/index`; verify DOM via Playwright snapshot
- [ ] Compare key computed styles (logo size, utility text, nav links, footer rows, copyright, icons) vs source
- [ ] Iterate up to 2 times on divergences
- [ ] Run `npm run lint` and resolve findings
- [ ] Report concise summary (assets, content changes, block CSS, gaps)

> **Note:** Execution of this plan (downloading assets, rewriting content files, editing block CSS) requires Execute mode. The plan above is complete and ready to run.
