# Vuddy PDF Direct Download Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fixed `PDF` download button to the Vuddy presentation and distribute a pre-generated one-slide-per-page 16:9 PDF.

**Architecture:** The presentation HTML owns only the download link and its visual states. A standalone Node.js exporter launches installed Chrome or Edge with remote debugging, waits for presentation readiness, generates the committed PDF through the DevTools protocol, and verifies its page geometry. The existing site builder explicitly copies colocated PDF assets beside static presentation HTML.

**Tech Stack:** HTML/CSS, Reveal.js 5, Node.js 20 built-ins, Chrome/Edge headless printing, `node:test`.

---

## Chunk 1: Download UI And Site Build

### Task 1: Add structural tests

**Files:**
- Create: `tests/vuddy-pdf-download.test.mjs`
- Test: `pages/service-introduction-materials/vuddy/index.html`
- Test: `scripts/build-pages.mjs`

- [x] Write a failing `node:test` test that requires a direct download link to `vuddy-service-introduction.pdf`, a Japanese accessible label, and print-hidden download-control CSS.
- [x] Write a failing test that runs `scripts/build-pages.mjs` and requires `_site/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`.
- [x] Run `node --test tests/vuddy-pdf-download.test.mjs` and confirm both tests fail for the missing feature.

### Task 2: Implement the UI and build copy

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html`
- Modify: `scripts/build-pages.mjs`
- Create: `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`

- [x] Add the fixed white `PDF` link before `.reveal`, including inline SVG, `download`, and Japanese `aria-label`.
- [x] Add normal, hover, focus-visible, responsive, and print-hidden styles.
- [x] Extend the static-file build pass to copy `.pdf` files while preserving relative paths.
- [x] Run the structural tests and confirm they pass with the generated PDF artifact.

## Chunk 2: Repeatable PDF Export

### Task 3: Add exporter tests

**Files:**
- Modify: `tests/vuddy-pdf-download.test.mjs`
- Create: `scripts/export-vuddy-pdf.mjs`

- [x] Add a failing test for exported file existence, PDF page count, and 16:9 page dimensions.
- [x] Count the presentation's top-level slide `<section>` elements for the expected page count.
- [x] Run the focused export test and confirm failure because the exporter is absent.

### Task 4: Implement PDF generation

**Files:**
- Create: `scripts/export-vuddy-pdf.mjs`
- Modify: `pages/service-introduction-materials/vuddy/index.html`
- Create: `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`
- Modify: `README.md`

- [x] Implement a temporary local HTTP server with Node built-ins.
- [x] Discover installed Chrome or Edge and launch it in headless mode against `?print-pdf`.
- [x] Wait for Reveal.js, fonts, and first-party images in the presentation before signaling print readiness.
- [x] Configure Reveal.js with `pdfMaxPagesPerSlide: 1`.
- [x] Write the PDF atomically and always close browser/server resources.
- [x] Document `node scripts/export-vuddy-pdf.mjs`.
- [x] Run the exporter test and confirm it passes.

## Chunk 3: Verification And Delivery

### Task 5: Verify behavior

**Files:**
- Verify: `pages/service-introduction-materials/vuddy/index.html`
- Verify: `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`
- Verify: `_site/service-introduction-materials/vuddy/`

- [x] Run `node --test tests/vuddy-pdf-download.test.mjs`.
- [x] Run `node scripts/build-pages.mjs`.
- [x] Confirm the source and built PDFs have the expected page count and 16:9 dimensions.
- [x] Open the built presentation in the in-app browser and verify fixed upper-right placement and direct-download attributes; verify the PDF response separately because the in-app browser does not support download events.
- [x] Review `git diff --check` and `git status --short`.
- [x] Commit all implementation files with a Japanese commit message.
