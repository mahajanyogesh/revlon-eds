# Site Style Migration Plan — rouxbeauty.com

## Overview

Migrate the **global site styles** from `https://rouxbeauty.com/` to AEM Edge Delivery Services and re-align the existing `carousel-hero` block CSS to use the extracted design tokens.

**Source:** `https://rouxbeauty.com/` (live site)
**Target files:**
- `styles/styles.css` — global tokens (colors, spacing, typography), heading/paragraph/link/button defaults, section utilities
- `styles/lazy-styles.css` — below-the-fold styles (e.g. footer-area defaults)
- `styles/fonts.css` — `@font-face` declarations for self-hosted fonts
- `fonts/` — self-hosted font binaries (woff2 preferred)
- `head.html` — preconnect / preload hints if needed
- `blocks/carousel-hero/carousel-hero.css` — re-aligned to use the new tokens

## Decisions Captured

- **Scope:** Global + re-align blocks (carousel-hero only — it's the one custom variant in the repo).
- **Fonts:** Self-host. Download woff2 files (and optional woff fallback) under `fonts/`, license permitting; if a font is unlicensed for self-hosting, fall back to the original CDN URL with a noted exception.

## Assumptions

- The local AEM dev server (`aem up --html-folder content --html-mount /`) is running at `http://localhost:3000` and serving `content/index.plain.html` for verification.
- Existing infrastructure (parsers, transformers, page templates, imported content) remains unchanged — only style files and `blocks/carousel-hero/carousel-hero.css` will be touched.
- Brand-specific tokens will be added as CSS custom properties on `:root` (no Tailwind / no preprocessor — pure CSS per AGENTS.md).
- Styles must follow the project conventions: mobile-first, `min-width` breakpoints at 600/900/1200, scoped block selectors, no `*-container` / `*-wrapper` classnames.

## Phase 1 — Style Discovery

Goal: Understand the source site's visual language end-to-end.

- Inventory the existing `styles/` files in this repo so we know the boilerplate baseline we're modifying.
- Inspect `https://rouxbeauty.com/` with Playwright + computed-style queries to extract:
  - Color palette (primary, secondary, accent, text, surface, link/hover, button bg/fg)
  - Typography (font families with weights used, base font-size, line-height, h1–h6 sizes/weights/letter-spacing)
  - Spacing scale (paragraph margins, section padding, container max-width)
  - Buttons (background, color, border, radius, padding, hover/focus states, text-transform, letter-spacing)
  - Links (default + hover color, underline behavior)
  - Section backgrounds and dividers
  - Header/footer typographic treatment (only insofar as it informs base typography; nav itself is out of scope here)
- Identify the @font-face URLs / family names actually loaded (look at `<link rel="stylesheet">`, `@font-face` rules, network panel).
- Save findings as a design-tokens summary in `migration-work/design-tokens.json` (and a screenshot reference in `migration-work/`) for traceability.

## Phase 2 — Font Acquisition

Goal: Self-host the fonts so the site renders without external font requests.

- For each `@font-face` discovered:
  - Download woff2 (preferred) and woff fallback if available, into `fonts/`.
  - Verify each file is < 50–100 KB; trim weights/styles to only those actually used.
  - License check: if a font's license forbids self-hosting (e.g. some Google "premium"/Adobe Fonts are not redistributable), document it and fall back to CDN with a note. **Do not commit non-redistributable binaries.**
- Write `styles/fonts.css` with the `@font-face` rules pointing at `/fonts/<file>.woff2`, with `font-display: swap`.
- Add `<link rel="preload" as="font" type="font/woff2" crossorigin>` hints for the LCP-critical fonts in `head.html` (only if needed for LCP).

## Phase 3 — Global Token Application

Goal: Apply discovered tokens to global styles.

- In `styles/styles.css`, add or update CSS custom properties on `:root`:
  - `--background-color`, `--text-color`, `--link-color`, `--link-hover-color`
  - `--body-font-family`, `--heading-font-family`
  - `--body-font-size-*`, `--heading-font-size-*` (xs/s/m/l/xl/xxl), `--line-height-*`
  - `--brand-primary`, `--brand-accent`
  - Spacing scale (`--spacing-1..6`) and section padding tokens
- Update `body`, headings (`h1`–`h6`), paragraphs, lists, and the boilerplate `.button` class to consume the tokens.
- Move below-the-fold defaults (footer typography, secondary heading sizes) into `styles/lazy-styles.css`.
- Keep all `min-width` breakpoints at 600/900/1200 to align with the boilerplate convention.

## Phase 4 — carousel-hero Re-alignment

Goal: Ensure the homepage's only block uses the new global tokens.

- Update `blocks/carousel-hero/carousel-hero.css`:
  - Swap hard-coded colors (`#fff`, `#333`, `#c9c9c9`, `rgb(0 0 0 / 35%)`, etc.) for the new CSS variables (e.g. `var(--text-color)`, `var(--brand-primary)`).
  - Use the new spacing tokens for slide content padding/margins.
  - Use the new button typography tokens for the CTA `a.button` rule.
  - Preserve scoped selectors (`.carousel-hero ...`) and existing breakpoints; do **not** change DOM expectations.
- Re-run linters to verify no `no-descending-specificity` regressions.

## Phase 5 — Verification

Goal: Confirm the migrated homepage matches rouxbeauty.com's general look.

- Reload `http://localhost:3000/index` in Playwright; capture a snapshot.
- Sample computed styles on `body`, `h2.SOCIAL & BEAUTIFUL`, `.carousel-hero a` (CTA), and the section-metadata-styled regions; compare side-by-side against rouxbeauty.com computed values.
- Take a single full-page screenshot for record (token-aware visual sanity check) — only if computed-style checks indicate close visual parity is plausible.
- If divergences are material, iterate Phase 3/4 (cap at 2 iterations) before flagging remaining gaps to the user.

## Phase 6 — Final QA & Handoff

- Run `npm run lint` and resolve any findings.
- Summarize:
  - New tokens added (table of name → value)
  - Fonts self-hosted vs. CDN-fallback
  - Block CSS files re-aligned
  - Preview path: `http://localhost:3000/index`
- Note any outstanding issues (e.g. fonts that couldn't be self-hosted; tokens deferred for follow-up like nav/footer once those are migrated).

## Out of Scope (this plan)

- Header/navigation visuals — handled by `excat-navigation-expert` separately.
- Footer block visuals beyond default typography.
- Other pages or blocks not currently in the repo.
- Brand identity changes (logo, marketing imagery).

## Checklist

- [ ] Inspect existing `styles/styles.css`, `styles/lazy-styles.css`, `styles/fonts.css` to capture baseline
- [ ] Open `https://rouxbeauty.com/` in Playwright; extract color palette via computed styles
- [ ] Extract typography (families, sizes, weights, line-heights, letter-spacing) for body + h1–h6
- [ ] Extract spacing scale, container max-width, and section padding
- [ ] Extract button + link styling (default + hover/focus)
- [ ] Identify all loaded `@font-face` families and source URLs
- [ ] Save findings to `migration-work/design-tokens.json` for traceability
- [ ] Determine which fonts are self-hostable (license check) vs CDN-only
- [ ] Download self-hostable fonts (woff2 + woff fallback) into `fonts/`
- [ ] Author `styles/fonts.css` with `@font-face` rules and `font-display: swap`
- [ ] Add `<link rel="preload">` font hints to `head.html` if needed for LCP
- [ ] Add/update CSS custom properties on `:root` in `styles/styles.css`
- [ ] Apply tokens to body, headings, paragraphs, lists, and `.button` in `styles/styles.css`
- [ ] Move below-the-fold defaults into `styles/lazy-styles.css`
- [ ] Re-align `blocks/carousel-hero/carousel-hero.css` to consume the new tokens
- [ ] Reload preview at `http://localhost:3000/index` and snapshot DOM/computed styles
- [ ] Compare key computed values vs. rouxbeauty.com; iterate up to 2 times on divergences
- [ ] Run `npm run lint` and resolve findings
- [ ] Report a concise summary of tokens, fonts, block changes, and any open gaps

> **Note:** Execution of this plan (running scripts, downloading fonts, writing CSS) requires Execute mode. The plan above is complete and ready to run.
