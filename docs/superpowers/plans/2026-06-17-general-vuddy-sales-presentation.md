# Vuddy 統合営業資料 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 既存の名刺用途向け Vuddy 資料を、汎用営業、法人提案、サービス紹介の三用途を含む17枚の統合営業資料へ刷新する。

**Architecture:** `pages/service-introduction-materials/vuddy/index.html` の Reveal.js、インライン CSS、PDF 出力、既存アセットを維持し、スライド本文と用途依存の図解を全面改稿する。Node.js の構造テストで、17枚構成、中核メッセージ、三用途、既存機能の維持、名刺用途への偏りの解消を固定し、既存レイアウトテストとブラウザ検証で回帰を確認する。

**Tech Stack:** Static HTML/CSS, Reveal.js 5 CDN, Node.js `node:test`, PowerShell, existing static-site build script

---

### Task 1: 統合営業資料の構造契約を追加する

**Files:**
- Create: `scripts/test-vuddy-general-sales-presentation.mjs`
- Reference: `docs/superpowers/specs/2026-06-17-general-vuddy-sales-presentation-design.md`
- Test: `pages/service-introduction-materials/vuddy/index.html`

- [ ] **Step 1: 現行資料では失敗する構造テストを書く**

Create `scripts/test-vuddy-general-sales-presentation.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
    new URL(
        "../pages/service-introduction-materials/vuddy/index.html",
        import.meta.url,
    ),
    "utf8",
);

function countTopLevelSlides(source) {
    const slidesStart = source.indexOf('<div class="slides">');
    const revealScript = source.indexOf("Reveal.initialize", slidesStart);
    const slidesMarkup = source.slice(slidesStart, revealScript);
    const tags = slidesMarkup.match(/<\/?section\b[^>]*>/g) ?? [];
    let depth = 0;
    let count = 0;

    for (const tag of tags) {
        if (tag.startsWith("</")) {
            depth -= 1;
        } else {
            if (depth === 0) count += 1;
            depth += 1;
        }
    }

    return count;
}

test("統合資料は既存の17枚構成と配布機能を維持する", () => {
    assert.equal(countTopLevelSlides(html), 17);
    assert.match(html, /Reveal\.initialize\(/);
    assert.match(html, /class="pdf-download"/);
    assert.match(html, /Vuddy_logo-01\.png/);
    assert.equal(html.match(/VARISTA_logo\.png/g)?.length, 17);
});

test("統合資料はサービスの中核価値を説明する", () => {
    for (const term of [
        "選べる",
        "視聴完了率",
        "選択率",
        "離脱",
        "CTA",
        "改善",
        "問い合わせ",
        "予約",
        "資料請求",
    ]) {
        assert.match(html, new RegExp(term));
    }
});

test("統合資料は三つの代表用途を同列に扱う", () => {
    for (const term of [
        "法人営業",
        "ホームページ",
        "展示会",
        "交流会",
    ]) {
        assert.match(html, new RegExp(term));
    }

    assert.doesNotMatch(
        html,
        /導入メリットは、名刺交換後の関係づくりにあります/,
    );
    assert.doesNotMatch(
        html,
        /想定活用例：名刺交換後のフォローを改善する場合/,
    );
});
```

- [ ] **Step 2: テストを実行して RED を確認する**

Run:

```powershell
node --test scripts/test-vuddy-general-sales-presentation.mjs
```

Expected: 17枚構成と既存機能のテストは PASS、中核価値または三用途のテストは FAIL。

- [ ] **Step 3: 失敗するテストをコミットする**

```powershell
git add scripts/test-vuddy-general-sales-presentation.mjs
git commit -m "Vuddy統合営業資料の構造テストを追加"
```

### Task 2: 17枚を統合営業ストーリーへ改稿する

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html`
- Test: `scripts/test-vuddy-general-sales-presentation.mjs`
- Reference: `docs/superpowers/specs/2026-06-17-general-vuddy-sales-presentation-design.md`

- [ ] **Step 1: 表紙と導入部分を用途非依存のメッセージへ変更する**

Update slides 1-4 with these messages:

```text
1. Vuddy サービス紹介資料
2. 一方的に見せる情報を、相手が選べる体験へ。
3. 相手ごとに知りたい情報は違うのに、同じ説明を届けていませんか？
4. Vuddyは、選べる動画体験と分析で情報提供を変えます。
```

Slide 3 must cover differing interests, invisible reactions, repeated explanations,
and disconnected next actions. Slide 4 must pair viewer-selected information with
interest analytics and CTA routing.

- [ ] **Step 2: 共通の利用体験・機能・分析へ変更する**

Update slides 5-8:

```text
5. 準備 -> 分岐設計 -> 公開・配信 -> 分析 -> 改善
6. 選ぶ -> 理解する -> 行動する
7. 動画内ボタン / 分岐シナリオ / 視聴分析 / URL・QR・Web配信
8. 視聴完了率 / 選択率 / 遷移 / 離脱 / CTAクリック
```

Keep the existing phone frame on slide 6, but replace business-card-specific copy
with a neutral sequence that lets a viewer choose `サービス`, `事例`, `料金`, or
`導入方法`, then continue to `問い合わせ`, `予約`, or `資料請求`.

- [ ] **Step 3: 三用途と導入メリットを同列に示す**

Update slides 9-12:

```text
9. 法人営業 / ホームページ / 展示会・交流会 / 採用・案内
10. 理解促進 / 関心把握 / 行動促進 / 継続改善
11. 一律の動画・資料・通常のWebページとVuddyの比較
12. 配信 -> 視聴・選択 -> 分析 -> フォロー・改善
```

Slide 9 must include concrete examples for each use case. Slide 11 must compare
information selection, reaction visibility, CTA placement, and improvement data.
Slide 12 must use one neutral customer journey rather than a business-card-only
scenario.

- [ ] **Step 4: 導入判断と次の行動を統合用途へ変更する**

Update slides 13-17:

```text
13. 初期制作費 / 月額利用料 / 個別見積もり
14. ヒアリング -> 構成設計 -> 制作・設定 -> 公開 -> 分析・改善
15. 既存動画 / スマートフォン / 分析項目 / 制作依頼 / 導入期間 / 配信方法
16. 株式会社VARISTA / お問い合わせ
17. デモ・活用相談のCTA
```

Slide 17 must ask the prospect to prepare the intended audience, content to convey,
and desired next action. Keep all existing logo fallbacks, Reveal.js initialization,
responsive CSS, print CSS, and PDF download behavior unchanged.

- [ ] **Step 5: 構造テストを実行して GREEN を確認する**

Run:

```powershell
node --test scripts/test-vuddy-general-sales-presentation.mjs
```

Expected: 3 tests PASS.

- [ ] **Step 6: 既存レイアウトテストを実行する**

Run:

```powershell
node --test scripts/test-vuddy-cover-layout.mjs scripts/test-vuddy-footer-logo.mjs scripts/test-vuddy-viewer-experience-layout.mjs
```

Expected: all tests PASS.

- [ ] **Step 7: 資料改稿をコミットする**

```powershell
git add pages/service-introduction-materials/vuddy/index.html
git commit -m "Vuddy資料を統合営業向けに刷新"
```

### Task 3: ビルドと実表示を検証する

**Files:**
- Verify: `pages/service-introduction-materials/vuddy/index.html`
- Verify: `_site/service-introduction-materials/vuddy/index.html`
- Verify: `pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf`
- Test: `scripts/test-vuddy-general-sales-presentation.mjs`

- [ ] **Step 1: 集中テストをまとめて実行する**

Run:

```powershell
node --test scripts/test-vuddy-general-sales-presentation.mjs scripts/test-vuddy-cover-layout.mjs scripts/test-vuddy-footer-logo.mjs scripts/test-vuddy-viewer-experience-layout.mjs
```

Expected: all tests PASS with no warnings.

- [ ] **Step 2: 静的サイトをビルドする**

Run:

```powershell
node scripts/build-pages.mjs
```

Expected: exit code 0 and `_site/service-introduction-materials/vuddy/index.html` exists.

- [ ] **Step 3: PDF を再生成する**

Run:

```powershell
node scripts/export-vuddy-pdf.mjs
```

Expected: exit code 0 and
`pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf` is updated.

- [ ] **Step 4: ローカルサーバーでデスクトップ表示を確認する**

Serve the repository on an unused local port, open
`/pages/service-introduction-materials/vuddy/index.html`, and verify at a desktop
viewport:

- Cover logo and title are centered.
- All 17 slides are reachable with arrow keys and on-screen controls.
- Slides 6, 8, 9, 11, 12, and 17 have no clipping or overlap.
- Footer logos remain inside the 720px slide frame.
- PDF button remains visible and functional.
- The browser console has no first-party errors.

- [ ] **Step 5: モバイル表示を確認する**

At a narrow mobile viewport, verify that headings and cards fit inside each slide,
the phone mockup remains visible, controls do not cover content, and no horizontal
overflow occurs.

- [ ] **Step 6: 差分検証を実行する**

Run:

```powershell
git diff --check
git status --short
```

Expected: `git diff --check` exits 0. Status contains only the intended HTML, test,
plan, and regenerated PDF changes or commits.

- [ ] **Step 7: 表示確認で必要になった修正と PDF をコミットする**

```powershell
git add pages/service-introduction-materials/vuddy/index.html pages/service-introduction-materials/vuddy/vuddy-service-introduction.pdf scripts/test-vuddy-general-sales-presentation.mjs
git commit -m "Vuddy統合営業資料の表示とPDFを更新"
```
