# Vuddy Before/After統合 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vuddy資料のComparisonとExampleを、業務フローに沿った1ページのBefore/After比較へ統合する。

**Architecture:** 現在の11ページを既存の`before-after-grid`／`before-after-card`構造へ置き換え、現在の12ページを削除する。既存のレイアウトテストを先に新しいスライド構成へ更新し、失敗を確認してからHTMLを最小変更する。

**Tech Stack:** HTML、CSS、Reveal.js、Node.js組み込みテストランナー

---

## Chunk 1: テストとHTMLの統合

### Task 1: 統合後のスライド構成をテストで定義する

**Files:**
- Modify: `scripts/test-vuddy-profile-layout-alignment.mjs`
- Test: `scripts/test-vuddy-profile-layout-alignment.mjs`

- [ ] **Step 1: profileレイアウト対象ページの期待値を更新する**

`expectedClasses`から11ページの`profile-comparison-layout`を削除し、削除される12ページ以降の番号を1つ繰り上げる。

```js
const expectedClasses = new Map([
    [4, "profile-solution-layout"],
    [6, "profile-viewer-layout"],
    [7, "profile-feature-layout"],
    [12, "profile-price-layout"],
    [16, "profile-cta-layout"],
]);
```

profileレイアウト数の期待値を`5`へ変更し、価格ページのインデックスを`slides[11]`へ変更する。

- [ ] **Step 2: Before/After統合ページの失敗テストを書く**

既存の「スライド11は参照版と同じ4カード2段構造を使用する」テストを、以下の統合要件へ置き換える。

```js
test("スライド11は業務フローに沿ったBeforeとAfterを表示する", () => {
    assert.equal(slides.length, 16);
    assert.match(slides[10], /class="eyebrow">Before \/ After</);
    assert.equal(slides[10].match(/class="before-after-card"/g)?.length, 4);
    assert.equal(slides[10].match(/>Before<|>導入前</g)?.length, 4);
    assert.equal(slides[10].match(/>After<|>導入後</g)?.length, 4);

    for (const heading of ["配信", "視聴", "分析", "フォロー"]) {
        assert.match(slides[10], new RegExp(`<h3>${heading}</h3>`));
    }

    assert.doesNotMatch(html, /class="eyebrow">Comparison</);
    assert.doesNotMatch(html, /class="eyebrow">Example</);
});
```

- [ ] **Step 3: テストを実行して期待どおり失敗することを確認する**

Run: `node --test scripts/test-vuddy-profile-layout-alignment.mjs`

Expected: FAIL。現在は17スライドあり、11ページが`comparison-card`を使用しているため、統合要件を満たさない。

### Task 2: 11ページへBefore/Afterを統合する

**Files:**
- Modify: `pages/service-introduction-materials/vuddy/index.html:1638`
- Test: `scripts/test-vuddy-profile-layout-alignment.mjs`

- [ ] **Step 1: 現在の11ページをBefore/Afterカードへ置き換える**

セクションの`profile-layout profile-comparison-layout`クラスを外し、次の見出し構成にする。

```html
<div class="eyebrow">Before / After</div>
<h2>配信からフォローまで、導入前後の変化を一目で比較。</h2>
```

`before-after-grid`内に4つの`before-after-card`を置き、次の内容を使用する。

| 項目 | Before | After |
| --- | --- | --- |
| 配信 | 一律の動画・資料を送付 | URL・QR・Webで選べる動画を配信 |
| 視聴 | 決められた情報を受動的に閲覧 | 関心に応じて情報を選択 |
| 分析 | 反応が見えず感覚で判断 | 選択率・離脱・遷移・CTAを分析 |
| フォロー | 全員に同じ内容で対応 | 関心に応じた提案・CTA・改善へ接続 |

各カードでは左側ラベルを`Before`、右側ラベルを`After`とする。

- [ ] **Step 2: 現在の12ページを削除する**

`<div class="eyebrow">Example</div>`を含むセクション全体を削除する。フッターロゴは統合後の11ページに1つだけ残す。

- [ ] **Step 3: 対象テストを実行して通ることを確認する**

Run: `node --test scripts/test-vuddy-profile-layout-alignment.mjs`

Expected: PASS。統合後は16スライド、11ページには4つのBefore/Afterカードが存在する。

### Task 3: 回帰確認を行う

**Files:**
- Verify: `pages/service-introduction-materials/vuddy/index.html`
- Verify: `scripts/test-vuddy-*.mjs`

- [ ] **Step 1: Vuddy関連テストをすべて実行する**

Run:

```powershell
Get-ChildItem scripts -Filter 'test-vuddy-*.mjs' |
    ForEach-Object { node --test $_.FullName }
```

Expected: すべてPASSし、失敗が0件である。

- [ ] **Step 2: 差分を確認する**

Run: `git diff -- pages/service-introduction-materials/vuddy/index.html scripts/test-vuddy-profile-layout-alignment.mjs`

Expected: ユーザーの既存変更を保持し、統合ページ、12ページ削除、必要なテスト期待値だけが追加変更されている。

- [ ] **Step 3: 実装変更をコミットする**

```powershell
git add -- pages/service-introduction-materials/vuddy/index.html scripts/test-vuddy-profile-layout-alignment.mjs
git commit -m "Vuddy比較ページをBefore Afterに統合"
```
