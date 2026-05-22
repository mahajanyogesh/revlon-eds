# Header CSS Not Applied — Diagnosis Plan

## Symptom recap

- Whole header looks unstyled — like raw HTML (boilerplate fallback or no CSS).
- Surface: **AEM Coder chat preview pane** (`aemcoder.adobe.io/chat/content/preview`).
- User has hard-reloaded — so it's not a browser cache.
- We just confirmed via direct localhost:3000 inspection (last turn) that header.css **is** applying correctly there: tools at top:0, brand at top:68, sections at top:158, total header 196px, computed styles match the source. So the CSS is correct on the local server.

## Most likely root causes

Ranked by probability given "Everything in the header" + "AEM Coder chat preview" + "hard-reloaded":

1. **Preview iframe is loading from a different host than localhost:3000** — most likely. The AEM Coder chat preview may proxy to a hosted environment (your `aem.page` URL) instead of your local dev server. If that hosted environment hasn't picked up the latest commits (or you haven't pushed yet), it would still be running the unmodified boilerplate header.
2. **Local dev server stopped or restarted into a different mode** — the server we used earlier was launched with `--html-folder content --html-mount /`. If the chat preview is now hitting a fresh server without those flags, `nav.html` and `footer.html` 404 and the header degrades to nothing.
3. **CSS file itself has a parse error introduced after the last change** that drops all subsequent rules silently. We just lint-passed, but stylelint doesn't catch every runtime CSS issue.
4. **Stale service worker / cached fragment** — the chat preview iframe sometimes caches the loaded fragment (`nav.plain.html`) separately from the page.

## Plan

### Phase 1 — Confirm what the preview is actually loading

Goal: Determine whether the chat preview is hitting our local server or a hosted environment.

- Identify the URL the AEM Coder iframe is rendering (host + path).
- If it's not `localhost:3000`, that explains everything — the chat preview is showing whatever's deployed, not what we just edited.
- Check if the local dev server is still running (`pgrep aem-cli`) and whether it was started with `--html-folder content --html-mount /`.
- Curl `http://localhost:3000/blocks/header/header.css` and `http://localhost:3000/nav.plain.html` to verify the local server is serving the up-to-date files.

### Phase 2 — Read the actual rendered DOM in the broken preview

Goal: See what CSS is actually loaded (or missing) in the preview that's failing.

- Open the failing preview URL with Playwright.
- Inspect:
  - `<link rel="stylesheet">` URLs in `<head>` — are they pointing at our project?
  - `header` element's actual classList and dataset (is `data-block-status="loaded"` set, or did the header block fail to decorate?).
  - Whether `header > .header > .nav-wrapper > nav` exists or whether `<header>` is empty.
  - Console errors — are any of `nav.plain.html`, `footer.plain.html`, `header.css` returning 4xx or being blocked by CSP?

### Phase 3 — Match the preview to a working source

Based on Phase 1–2 findings, choose one:

**A. The chat preview hits a deployed branch (most likely)**
- Push current branch and wait for code-sync to refresh the `aem.page` preview.
- Ensure `content/nav.plain.html` and `content/footer.plain.html` are committed (currently only on disk locally).
- Re-test the chat preview after sync completes.

**B. The chat preview hits localhost but the dev server is misconfigured**
- Restart `aem up` with `--html-folder content --html-mount /` so `nav.plain.html` and `footer.plain.html` resolve.
- Confirm header.js can fetch `/nav.plain.html` and gets a 200.

**C. CSS rule dropped because of a syntax issue introduced post-lint**
- Reload `blocks/header/header.css` in DevTools "Sources" to see if any rules show as invalid.
- Validate manually with a quick CSS parse.

**D. Stale fragment cache**
- Hard-reload while DevTools is open with "Disable cache" toggled on.
- If the chat preview can't disable cache, append a cache-busting query string to the iframe URL (e.g. `?cb=now`).

### Phase 4 — Verify the fix

- Reload the chat preview.
- Confirm:
  - 3-row header (utility bar → logo → main nav)
  - Computed styles match what we already verified on localhost (Open Sans Condensed 20px navy uppercase nav links; 14px utility links; 158×54 logo).
- If still broken, surface the specific console errors and we iterate.

## What I need from you to take this further

(I'll ask via the AskUserQuestion tool if needed during execution. For now, this can run with what we know.)

## Out of scope

- Re-authoring nav/footer content; the files are already correct.
- Re-styling the header; the CSS is already correct (verified at localhost:3000).
- Anything in the preview tool itself — that's an Adobe-managed surface.

## Checklist

- [ ] Determine whether the AEM Coder chat preview hits localhost or a deployed host
- [ ] Verify local dev server is running with `--html-folder content --html-mount /`
- [ ] Curl `/nav.plain.html`, `/footer.plain.html`, `/blocks/header/header.css` from localhost to confirm they serve correctly
- [ ] In Playwright on the failing preview URL, list all `<link rel="stylesheet">` hrefs and any 4xx/blocked resources
- [ ] Inspect `<header>` DOM in the failing preview — does decoration complete (`data-block-status="loaded"`)?
- [ ] If the preview is a deployed surface, push branch and wait for code-sync, then retest
- [ ] If the preview is local but missing fragments, restart `aem up` with the correct flags, then retest
- [ ] If CSS is loaded but rules don't apply, validate `blocks/header/header.css` in DevTools for invalid rules
- [ ] Confirm the chat preview now shows the 3-row header with Open Sans Condensed nav links
- [ ] Report findings + final state

> **Note:** This is a diagnosis plan; nothing in this plan requires file edits. If Phase 1–2 surface a code-side fix needed, we'll switch to Execute mode and apply it.
