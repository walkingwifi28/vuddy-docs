# Vuddy Profile Layout Alignment Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 指定されたVuddy資料スライドを、本文を維持したままprofile-vuddyの対応スライドと同じ視覚構造へ揃える。

**Architecture:** 対象スライドに限定クラスを付け、profile-vuddyの値をVuddy側のCSS変数へ対応付けたスコープ付きスタイルで上書きする。ページ11のみ比較カードを参照版と同じ2段構造へまとめ、既存文言は残す。

**Tech Stack:** HTML、CSS、Reveal.js、Node.js標準テストランナー

---

## Chunk 1: 構造要件と実装

### Task 1: レイアウト契約テスト

**Files:**
- Create: `scripts/test-vuddy-profile-layout-alignment.mjs`
- Test: `scripts/test-vuddy-profile-layout-alignment.mjs`

- [ ] 指定ページの限定クラス、ページ2の図専用クラス、ページ11の2段比較構造、ページ13の文字サイズを検証するテストを書く。
- [ ] `node --test scripts/test-vuddy-profile-layout-alignment.mjs` を実行し、限定クラスが未実装で失敗することを確認する。

### Task 2: 対象ページのレイアウト統一

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html`
- Test: `scripts/test-vuddy-profile-layout-alignment.mjs`

- [ ] 2ページ目の右図に `profile-stat-panel` を付ける。
- [ ] 4、6、7、11、13、17ページ目に `profile-layout` とページ固有クラスを付ける。
- [ ] ページ11の各比較カードを2段へ整理し、既存の比較文言を保持する。
- [ ] profile-vuddyの余白、カード、文字、グリッド、背景を対象ページだけへ適用するCSSを追加する。
- [ ] ページ13の説明文字を参照版と同じ `22px !important` にする。
- [ ] 対象テストと既存のVuddy資料テストを実行し、すべて通ることを確認する。

## Chunk 2: 表示検証

### Task 3: 同一条件での表示比較

**Files:**
- Verify: `pages/service-introduction-materials/vuddy/index.html`
- Reference: `pages/service-introduction-materials/profile-vuddy/index.html`

- [ ] アプリ内ブラウザで両資料を同じビューポートに表示する。
- [ ] 2、4、6、7、11、13、17ページ目の位置、余白、カード、文字切れ、はみ出しを確認する。
- [ ] 差異があれば対象ページ限定CSSを修正し、テストと表示確認を再実行する。
- [ ] `git diff --check` と全関連テストを実行する。
