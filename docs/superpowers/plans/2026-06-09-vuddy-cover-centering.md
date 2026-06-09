# Vuddy Cover Centering Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vertically center the Vuddy cover logo in the 1280x720 slide frame and place the title beneath it.

**Architecture:** Position the cover logo and title independently against the fixed-height cover section. This bypasses Reveal.js's inline `display: block` override while preserving the existing footer layout.

**Tech Stack:** Static HTML/CSS, Reveal.js 5, Node.js built-in test runner

---

## Chunk 1: Cover alignment

### Task 1: Add a regression test

**Files:**
- Create: `scripts/test-vuddy-cover-layout.mjs`
- Test: `pages/service-introduction-materials/vuddy/index.html`

- [ ] Assert that the cover logo is absolutely positioned at `top: 50%`.
- [ ] Assert that the logo uses `translateY(-50%)`.
- [ ] Assert that the title has a separate absolute offset below the logo.
- [ ] Run the test and confirm it fails against the current translated group.

### Task 2: Apply the cover CSS

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html`
- Test: `scripts/test-vuddy-cover-layout.mjs`

- [ ] Remove the group-level vertical translation and padding compensation.
- [ ] Center `.cover-logo` vertically against the slide frame.
- [ ] Position `.cover-title` below the centered logo with the approved gap.
- [ ] Add the narrow-screen title gap override.
- [ ] Run the regression tests and confirm they pass.

### Task 3: Verify browser and PDF output

**Files:**
- Verify: `pages/service-introduction-materials/vuddy/index.html`
- Verify: `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`

- [ ] Measure cover logo center against the 720px slide center.
- [ ] Confirm the title and VARISTA footer do not overlap.
- [ ] Run the PDF exporter and site build.
- [ ] Confirm all layout tests and generated output checks pass.
