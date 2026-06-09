# Vuddy Footer Logo Alignment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Align every VARISTA footer logo 24px above the bottom of the 1280x720 Reveal.js slide frame.

**Architecture:** Make every top-level slide section occupy the full configured 720px logical height, then position the existing absolute footer logo from that stable containing block. Keep the HTML structure and PDF geometry-copying workflow unchanged.

**Tech Stack:** Static HTML/CSS, Reveal.js 5, Node.js built-in test runner

---

## Chunk 1: Footer alignment

### Task 1: Add a regression test

**Files:**
- Create: `scripts/test-vuddy-footer-logo.mjs`
- Test: `pages/service-introduction-materials/vuddy/index.html`

- [ ] Add assertions for a 720px top-level slide height and a 24px footer offset.
- [ ] Run `node --test scripts/test-vuddy-footer-logo.mjs`.
- [ ] Confirm the test fails because the slide height and footer offset are not implemented.

### Task 2: Apply the CSS layout

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html`
- Modify: `scripts/export-vuddy-pdf.mjs`
- Test: `scripts/test-vuddy-footer-logo.mjs`

- [ ] Set `.reveal .slides > section` to `height: 720px` and `min-height: 720px`.
- [ ] Set `.slide-footer-logo` to `bottom: 24px`.
- [ ] Remove the narrow-screen negative footer offset.
- [ ] Preserve each captured `source.height` in the PDF print layout.
- [ ] Run `node --test scripts/test-vuddy-footer-logo.mjs` and confirm it passes.

### Task 3: Verify generated output

**Files:**
- Verify: `pages/service-introduction-materials/vuddy/index.html`
- Verify: `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`

- [ ] Reload the page at 1280x720 and measure the logo against the slide frame.
- [ ] Run `node scripts/build-pages.mjs`.
- [ ] Run `node scripts/export-vuddy-pdf.mjs`.
- [ ] Confirm all slides retain the 16:9 layout and the PDF matches the browser geometry.
