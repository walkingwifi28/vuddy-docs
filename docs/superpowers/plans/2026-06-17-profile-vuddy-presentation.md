# ホームページ活用向け Vuddy 営業資料 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** BtoC・小規模事業者が Vuddy をホームページに活用する価値を伝える17枚の営業資料を作成する。

**Architecture:** 既存の名刺用途向け Reveal.js 資料を表示基盤として再利用し、コピー、図表、比較、活用例、FAQ、CTA をホームページ用途へ置き換える。専用の Node.js テストで構造、訴求、対象読者、残存文言、主要UI要素を検証し、ブラウザで表示と操作を確認する。

**Tech Stack:** HTML5、CSS、Reveal.js 5、Node.js `node:test`、ブラウザ検証

---

## Chunk 1: 要件テストと営業資料実装

### Task 1: profile-vuddy 専用要件テスト

**Files:**
- Create: `scripts/test-profile-vuddy-presentation.mjs`
- Test: `scripts/test-profile-vuddy-presentation.mjs`

- [ ] `profile-vuddy/index.html` の存在と17スライド構成を検査するテストを書く。
- [ ] 表現力、第一印象、BtoC・小規模事業者向け活用、予約・問い合わせ、分析指標を検査するテストを書く。
- [ ] 名刺用途の文言が残っていないこと、Reveal.js、PDFボタン、デモiframe、相対アセットが維持されることを検査するテストを書く。
- [ ] `node scripts/test-profile-vuddy-presentation.mjs` を実行し、対象ファイル不在を理由に失敗することを確認する。

### Task 2: ホームページ用途向け営業資料

**Files:**
- Create: `pages/service-introduction-materials/profile-vuddy/index.html`
- Reference: `pages/service-introduction-materials/vuddy/index.html`
- Test: `scripts/test-profile-vuddy-presentation.mjs`

- [ ] 既存のReveal.js表示基盤、CSS、PDFボタン、ロゴ、デモiframeを出力先へ複製する。
- [ ] 全17スライドを設計仕様どおりホームページ用途へ改稿する。
- [ ] BtoC・小規模事業者向けに、サロン・スクール・店舗・個人事業などの活用シーンと予約・体験申込・相談導線を記載する。
- [ ] 通常のホームページより豊かな表現力と強い第一印象を複数スライドで訴求する。
- [ ] `node scripts/test-profile-vuddy-presentation.mjs` を実行し、全テストが通ることを確認する。
- [ ] `git diff --check` を実行する。

## Chunk 2: 表示検証と完成確認

### Task 3: ブラウザ表示と操作検証

**Files:**
- Verify: `pages/service-introduction-materials/profile-vuddy/index.html`

- [ ] ローカルHTTPサーバーでページを開き、17スライドが読み込まれることを確認する。
- [ ] デスクトップ表示で表紙、主要スライド、最終CTAを目視確認する。
- [ ] スマートフォン幅で横方向のはみ出しと主要テキストの重なりがないことを確認する。
- [ ] キーボード操作、PDFボタン、デモiframe、コンソールエラーを確認する。
- [ ] 要件テストと `git diff --check` を再実行し、変更内容をコミットする。
