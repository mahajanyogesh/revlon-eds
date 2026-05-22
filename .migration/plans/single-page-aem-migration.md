# Single Page Migration Plan — rouxbeauty.com Homepage

## Overview

Migrate the homepage of `https://rouxbeauty.com/` to AEM Edge Delivery Services. The migration will produce:
- A page analysis (sections, blocks, authoring decisions)
- Block variants (reused or newly created)
- Import infrastructure (parsers, transformers, page template)
- Imported content rendered locally at `http://localhost:3000`
- A design decision made after analysis (full styling vs. content-only)

**Page URL:** `https://rouxbeauty.com/`

## Assumptions

- Single page scope — no template discovery or sibling page migration.
- Design approach will be chosen after the page analysis surfaces the block list.
- Local AEM dev server (`aem up`) will be running at `http://localhost:3000` during preview/verification.
- The repo is already an EDS project (boilerplate-based) with `tools/importer/` available for parsers/transformers.

## Phase 1 — Discovery & Analysis

Goal: Understand the homepage structure, sections, and required blocks before any code changes.

- Identify project type (doc / da / xwalk) and resolve the project's Block Library endpoint so block reuse can be evaluated.
- Run page analysis on `https://rouxbeauty.com/` to produce:
  - Cleaned HTML
  - Section boundaries and content sequences
  - List of authored content vs. block content
  - Candidate block variants with similarity matches against the existing local catalog
- Capture screenshots of the original homepage (full-page + per-section) for later visual comparison.

## Phase 2 — Design Decision Checkpoint

Goal: Choose the design approach now that the block list is known.

- Review the analysis output (block count, novelty, complexity, brand-specific styling needs).
- Decide between:
  - **Full design migration** — extract original computed styles and apply them block-by-block (likely needed given Roux Beauty has distinct brand styling).
  - **Content-only** — accept default boilerplate styling.
- Confirm the choice with the user before proceeding.

## Phase 3 — Block Variants

Goal: Ensure every block on the homepage has a working variant in the repo.

- For each candidate block (likely hero, product cards/grid, brand/feature sections, marquee, footer-area content blocks):
  - Reuse an existing variant if similarity ≥ 70%.
  - Otherwise, create a new variant under `blocks/<blockname>/` with `.js` + `.css`, mobile-first responsive styles, and selectors scoped to the block.
- If full design migration was chosen, run the design expert per new/changed block to lift exact styles from the source.

## Phase 4 — Import Infrastructure

Goal: Build the import pipeline so the homepage can be imported repeatably.

- Add a homepage template entry (name, URL `https://rouxbeauty.com/`, blocks, description) to `page-templates.json`.
- Generate per-variant block parsers in `tools/importer/parsers/`.
- Generate page-level transformers (cleanup, sections) in `tools/importer/transformers/`.
- Validate all generated files (lint + structural validation).

## Phase 5 — Content Import

Goal: Run the import and produce the local content file.

- Bundle and execute the import script against `https://rouxbeauty.com/`.
- Verify the resulting `index.html` lands at the homepage path under the local content directory.
- Confirm no parser/transformer errors in the import log.

## Phase 6 — Preview & Verification

Goal: Confirm the migrated homepage renders correctly.

- Start (or reuse) the local dev server.
- Navigate to the migrated homepage path and verify:
  - DOM structure via Playwright snapshot
  - Block-level styling via computed style checks
  - Images, links, and headings render correctly
- If full design was chosen, run page critique to compare visual fidelity against the original `rouxbeauty.com` homepage; iterate on CSS until aligned.
- If content-only, verify only structural correctness and authorability.

## Phase 7 — Final QA & Handoff

- Run `npm run lint` and fix any issues.
- Summarize what was migrated, which blocks were reused vs. newly created, and any remaining follow-ups.
- Surface the local preview path so the user can review.

## Checklist

- [x] Collect target page URL from user (`https://rouxbeauty.com/`)
- [ ] Identify project type and load block catalog
- [ ] Run page analysis on `https://rouxbeauty.com/`; produce cleaned HTML, sections, and block candidates
- [ ] Capture original-homepage screenshots for later comparison
- [ ] Review analysis with user; confirm design approach (full styling vs. content-only)
- [ ] Reuse existing block variants where similarity ≥ 70%
- [ ] Create new block variants for non-matching blocks
- [ ] If full design chosen, extract and apply original `rouxbeauty.com` styles per block
- [ ] Add homepage template entry to `page-templates.json`
- [ ] Generate block parsers in `tools/importer/parsers/`
- [ ] Generate page transformers in `tools/importer/transformers/`
- [ ] Validate parsers, transformers, and template schema
- [ ] Bundle and run the import script against `https://rouxbeauty.com/`
- [ ] Confirm imported content file is present at the homepage path locally
- [ ] Start local dev server and load the migrated homepage
- [ ] Verify DOM, blocks, images, and links via Playwright snapshot/evaluate
- [ ] If full design chosen, run page critique vs. live site and iterate CSS until visually aligned
- [ ] Run `npm run lint` and resolve any findings
- [ ] Report migration summary and preview path to user

> **Note:** Execution of this plan (running imports, creating files, starting servers) requires Execute mode. The plan above is complete and ready to run once Execute mode is active.
