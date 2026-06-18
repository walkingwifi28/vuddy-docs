# Vuddy Features Card Border Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vuddy資料のFeaturesセクションにある4カードの枠線を、参照画像と同じ共通1px枠へ明示的に統一する。

**Architecture:** 既存のHTML構造と共通アクセントクラスは維持し、`.profile-feature-layout` 配下だけに限定したCSS上書きを追加する。既存のNodeテストへ回帰テストを追加し、他セクションへ影響しないスコープを固定する。

**Tech Stack:** HTML, CSS, Node.js `node:test`

---

## Chunk 1: Featuresカード枠線の統一

### Task 1: スコープ付き枠線ルールを追加する

**Files:**
- Modify: `scripts/test-vuddy-profile-layout-alignment.mjs`
- Modify: `pages/service-introduction-materials/vuddy/index.html:937`

- [ ] **Step 1: 失敗する回帰テストを書く**

`scripts/test-vuddy-profile-layout-alignment.mjs` に、`.profile-feature-layout .feature-card` が `border-top: 1px solid var(--vuddy-line)` を指定することを検証するテストを追加する。

```js
test("スライド7の4カードは同じ細い枠線を使用する", () => {
    assert.match(
        html,
        /\.profile-feature-layout \.feature-card\s*\{[^}]*border-top:\s*1px solid var\(--vuddy-line\);/s,
    );
});
```

- [ ] **Step 2: テストが期待どおり失敗することを確認する**

Run: `node --test scripts/test-vuddy-profile-layout-alignment.mjs`

Expected: 新規テストが、対象セレクタ未定義のためFAILする。

- [ ] **Step 3: 最小のCSSを追加する**

`pages/service-introduction-materials/vuddy/index.html` のprofile用スタイルへ次を追加する。

```css
.profile-feature-layout .feature-card {
    border-top: 1px solid var(--vuddy-line);
}
```

- [ ] **Step 4: 回帰テストを再実行する**

Run: `node --test scripts/test-vuddy-profile-layout-alignment.mjs`

Expected: 全テストPASS。

- [ ] **Step 5: 関連するVuddyテストを実行する**

Run: `node --test scripts/test-vuddy-*.mjs`

Expected: 全テストPASS。

- [ ] **Step 6: ブラウザで表示を確認する**

対象スライドで、4枚の全辺が同じ1px枠であり、既存のミント影・高さ・余白・文言が維持されていることを確認する。

- [ ] **Step 7: 実装をコミットする**

```bash
git add pages/service-introduction-materials/vuddy/index.html scripts/test-vuddy-profile-layout-alignment.mjs
git commit -m "VuddyのFeaturesカード枠線を統一"
```
