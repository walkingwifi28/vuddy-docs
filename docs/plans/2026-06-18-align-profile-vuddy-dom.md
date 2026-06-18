# Align Profile Vuddy DOM Implementation Plan

> **For Codex:** Use `executing-plans` to implement this plan task-by-task.

**Goal:** Make the `profile-vuddy` slide DOM structure match `vuddy` while preserving all existing profile text, image/video sources, and links.

**Architecture:** Treat `vuddy/index.html` as the structural template for each slide. Transplant profile-specific text and content attributes into that structure, then verify structural equality independently from content equality.

**Tech Stack:** Static HTML, Python standard-library HTML parsing, repository verification commands.

## Task 1: Capture and verify the failing structural requirement

**Files:**
- Modify: `pages/service-introduction-materials/profile-vuddy/index.html`
- Reference: `pages/service-introduction-materials/vuddy/index.html`

1. Compare the element tree of every `.slides > section`, ignoring text and content-specific `src`/`href` values.
2. Confirm the comparison fails before implementation.
3. Record the profile text nodes and `src`/`href` values that must remain unchanged.

## Task 2: Align the DOM

1. Apply the `vuddy` element hierarchy, tags, classes, and layout attributes to `profile-vuddy`.
2. Reinsert the recorded profile text and content-specific `src`/`href` values.
3. Do not alter the CSS or scripts.

## Task 3: Verify

1. Confirm all slide element trees match.
2. Confirm profile text and `src`/`href` values are unchanged.
3. Run `git diff --check` and inspect the final diff scope.
