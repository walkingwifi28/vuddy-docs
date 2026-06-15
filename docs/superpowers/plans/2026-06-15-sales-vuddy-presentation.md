# Sales Vuddy Presentation Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a 17-slide Reveal.js sales-content presentation that follows the existing Vuddy service-introduction design and uses the sales use case from `pages/service-materials/index.md`.

**Architecture:** Add one self-contained static HTML presentation by reusing the existing Vuddy presentation's inline styles and Reveal.js setup, then replace all business-card content with sales-specific copy and an in-page branching mockup. Add one Node structural test that verifies the required slide structure, source concepts, shared assets, and absence of unrelated PDF and iframe dependencies.

**Tech Stack:** Static HTML/CSS, Reveal.js 5 CDN, Node.js `node:test`, existing static-site build script

---

## Chunk 1: Structural Contract

### Task 1: Add a failing sales-presentation test

**Files:**
- Create: `scripts/test-sales-vuddy-presentation.mjs`
- Reference: `pages/service-materials/index.md`
- Reference: `pages/service-introduction-materials/vuddy/index.html`

- [ ] **Step 1: Write the failing structural test**

Create `scripts/test-sales-vuddy-presentation.mjs` with tests that:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const presentationUrl = new URL(
    "../pages/service-introduction-materials/sales-vuddy/index.html",
    import.meta.url,
);

test("sales presentation exists and keeps the 17-slide Reveal structure", async () => {
    const html = await readFile(presentationUrl, "utf8");
    const slides =
        html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

    assert.equal(slides.length, 17);
    assert.match(html, /Reveal\.initialize\(/);
    assert.match(html, /Vuddy_logo-01\.png/);
    assert.equal(
        html.match(/VARISTA_logo\.png/g)?.length,
        17,
    );
});

test("sales presentation contains the source use case and KPIs", async () => {
    const html = await readFile(presentationUrl, "utf8");

    for (const term of [
        "営業管理を効率化したい",
        "情報共有を改善したい",
        "機能を見る",
        "導入事例を見る",
        "料金を見る",
        "セキュリティを見る",
        "デモを依頼する",
        "動画視聴率",
        "商談予約率",
        "案件化率",
        "成約率",
    ]) {
        assert.match(html, new RegExp(term));
    }
});

test("sales presentation is self-contained and excludes business-card artifacts", async () => {
    const html = await readFile(presentationUrl, "utf8");

    assert.doesNotMatch(html, /名刺交換|紙の名刺|デジタル名刺/);
    assert.doesNotMatch(html, /class="pdf-download"/);
    assert.doesNotMatch(html, /<iframe\b/);
    assert.match(html, /class="sales-demo"/);
});
```

Use a top-level slide matcher that counts only direct Reveal slide sections. If
the simple expression above also counts nested markup after implementation,
replace it with a small tag-depth counter rather than weakening the assertion.

- [ ] **Step 2: Run the test and verify RED**

Run:

```powershell
node --test scripts/test-sales-vuddy-presentation.mjs
```

Expected: FAIL with `ENOENT` for
`pages/service-introduction-materials/sales-vuddy/index.html`.

- [ ] **Step 3: Commit the failing test**

```powershell
git add scripts/test-sales-vuddy-presentation.mjs
git commit -m "営業向けVuddy資料の構造テストを追加"
```

## Chunk 2: Presentation Implementation

### Task 2: Create the sales-content Reveal.js page

**Files:**
- Create: `pages/service-introduction-materials/sales-vuddy/index.html`
- Reference: `pages/service-introduction-materials/vuddy/index.html`
- Reference: `pages/service-materials/index.md`
- Test: `scripts/test-sales-vuddy-presentation.mjs`

- [ ] **Step 1: Reuse the presentation shell**

Create the target directory and copy the reference presentation as the starting
shell. Retain:

- Reveal.js CSS and JavaScript URLs.
- Inline typography, slide sizing, cards, grids, footer, print, and responsive
  styles.
- Vuddy and VARISTA relative asset paths.
- Reveal initialization settings.
- Exactly 17 top-level slide sections.

Remove the PDF download control and all associated `.pdf-download` CSS because
the new directory has no PDF artifact.

- [ ] **Step 2: Replace all business-card content**

Use the structure defined in
`docs/superpowers/specs/2026-06-15-sales-vuddy-presentation-design.md`:

- Cover: `Vuddy 営業コンテンツ紹介資料`.
- Introduction: personalize sales explanations before the meeting.
- Problem: uniform materials, unknown interests, repeated basic explanations,
  and disconnected next actions.
- Solution: prospect-selected information plus viewing analytics.
- Overview: prepare, branch, distribute, analyze, improve.
- Viewer Experience: current challenge, desired information, next action.
- Features: buttons, branching, analytics, URL distribution.
- Analytics: feature, case-study, pricing, and security interest.
- Use Cases: sales email, event follow-up, service site, pre-meeting sharing.
- Benefits: shorter explanations, clearer interests, better meetings, improved
  opportunity rate.
- Comparison: PDF/video/landing-page limitations versus Vuddy.
- Example: before/after for a SaaS sales process.
- Price, implementation, FAQ, company, and CTA: adapt wording to sales content.

- [ ] **Step 3: Replace the remote demo with an HTML sales mockup**

Add a `.sales-demo` element inside the existing phone frame. It must visually
show:

```text
現在の課題を選択してください
営業管理を効率化したい
情報共有を改善したい
集計・報告作業を削減したい

知りたい情報
機能を見る
導入事例を見る
料金を見る
セキュリティを見る

次の行動
詳しい資料を受け取る
デモを依頼する
営業担当者と相談する
```

Add only the CSS needed to fit the mockup inside the existing phone frame.
Include no iframe or new JavaScript.

- [ ] **Step 4: Run the sales test and verify GREEN**

Run:

```powershell
node --test scripts/test-sales-vuddy-presentation.mjs
```

Expected: all tests PASS.

- [ ] **Step 5: Run existing presentation regressions**

Run:

```powershell
node --test scripts/test-vuddy-cover-layout.mjs scripts/test-vuddy-footer-logo.mjs scripts/test-vuddy-viewer-experience-layout.mjs
```

Expected: all existing tests PASS.

- [ ] **Step 6: Commit the presentation**

```powershell
git add pages/service-introduction-materials/sales-vuddy/index.html
git commit -m "営業向けVuddy紹介資料を追加"
```

## Chunk 3: Build And Browser Verification

### Task 3: Verify generated output and presentation rendering

**Files:**
- Verify: `pages/service-introduction-materials/sales-vuddy/index.html`
- Verify: `_site/service-introduction-materials/sales-vuddy/index.html`
- Verify: `scripts/test-sales-vuddy-presentation.mjs`

- [ ] **Step 1: Run whitespace validation**

Run:

```powershell
git diff --check
```

Expected: exit code 0 with no output.

- [ ] **Step 2: Build the static site**

Run:

```powershell
node scripts/build-pages.mjs
```

Expected: exit code 0 and
`_site/service-introduction-materials/sales-vuddy/index.html` exists.

- [ ] **Step 3: Verify the generated page**

Run:

```powershell
Test-Path '_site/service-introduction-materials/sales-vuddy/index.html'
```

Expected: `True`.

- [ ] **Step 4: Open the generated presentation in the in-app browser**

Serve the repository with the existing or a temporary local static server and
open the sales presentation. Check:

- Cover logo and title alignment.
- Arrow-key and on-screen Reveal navigation.
- Sales-specific copy on representative slides.
- Phone mockup fits without clipping.
- VARISTA footer logo stays inside each 720px slide.
- No horizontal overflow at desktop size.
- Responsive layout remains readable at a narrow viewport.
- Browser console has no first-party errors.

- [ ] **Step 5: Run the complete focused verification**

Run:

```powershell
node --test scripts/test-sales-vuddy-presentation.mjs scripts/test-vuddy-cover-layout.mjs scripts/test-vuddy-footer-logo.mjs scripts/test-vuddy-viewer-experience-layout.mjs
```

Expected: all tests PASS with no warnings.

- [ ] **Step 6: Commit any verification-driven corrections**

If browser verification required corrections:

```powershell
git add pages/service-introduction-materials/sales-vuddy/index.html scripts/test-sales-vuddy-presentation.mjs
git commit -m "営業向けVuddy資料の表示を調整"
```
