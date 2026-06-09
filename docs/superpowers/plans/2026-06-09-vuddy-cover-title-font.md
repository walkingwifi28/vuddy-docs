# Vuddy Cover Title Font Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 表紙タイトルにほかのスライドと同じフォントファミリーを明示し、現在のサイズと太さを維持する。

**Architecture:** 既存のインラインCSSに限定してフォントスタックを明示する。既存のNode.js静的テストで指定値を固定し、意図しないサイズ・太さの変更を防ぐ。

**Tech Stack:** HTML, CSS, Node.js `node:test`

---

## Chunk 1: Cover Title Font

### Task 1: Add Regression Coverage

**Files:**
- Modify: `scripts/test-vuddy-cover-layout.mjs`

- [ ] **Step 1: Write the failing test**

`.cover-title` のCSSに共通フォントスタック、`34px`、`500` が含まれることを検証する。

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test scripts/test-vuddy-cover-layout.mjs`

Expected: FAIL because `.cover-title` does not explicitly declare `font-family`.

### Task 2: Apply the Font Stack

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html`

- [ ] **Step 1: Write the minimal implementation**

`.cover-title` に次を追加する。

```css
font-family: "Vuddy Noto Sans JP", "Noto Sans JP", sans-serif;
```

- [ ] **Step 2: Run the focused test**

Run: `node --test scripts/test-vuddy-cover-layout.mjs`

Expected: PASS.

- [ ] **Step 3: Run all repository tests**

Run: `node --test scripts/test-vuddy-cover-layout.mjs scripts/test-vuddy-footer-logo.mjs`

Expected: All tests pass.
