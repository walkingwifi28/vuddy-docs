import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
    new URL("../pages/service-introduction-materials/vuddy/index.html", import.meta.url),
    "utf8",
);

const slides = html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

test("指定スライドだけがprofile-vuddyレイアウトを使用する", () => {
    const expectedClasses = new Map([
        [4, "profile-solution-layout"],
        [6, "profile-viewer-layout"],
        [7, "profile-feature-layout"],
        [12, "profile-price-layout"],
        [16, "profile-cta-layout"],
    ]);

    for (const [number, pageClass] of expectedClasses) {
        assert.match(slides[number - 1], new RegExp(`class="[^"]*profile-layout[^"]*${pageClass}`));
    }

    assert.equal(
        html.match(/<section[^>]*class="[^"]*\bprofile-layout\b/g)?.length,
        5,
    );
});

test("スライド2の右図だけがprofile-vuddyの縦並び指標を使用する", () => {
    assert.match(slides[1], /class="panel hero-panel accent profile-stat-panel"/);
    assert.match(html, /\.profile-stat-panel \.stat-row\s*\{[^}]*grid-template-columns:\s*1fr;/s);
    assert.match(html, /\.profile-stat-panel \.stat\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s);
});

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

test("対象ページの主要寸法をprofile-vuddyに合わせる", () => {
    assert.match(html, /\.profile-layout \.feature-card\s*\{[^}]*min-height:\s*410px;[^}]*padding:\s*20px;/s);
    assert.match(html, /\.profile-layout \.comparison-item\s*\{[^}]*margin-top:\s*14px;[^}]*padding:\s*12px;/s);
    assert.match(html, /\.profile-layout \.price-card\s*\{[^}]*min-height:\s*330px;/s);
    assert.equal(slides[11].match(/font-size:\s*22px !important/g)?.length, 2);
});

test("スライド7のカード内区切り線を同じ高さにそろえる", () => {
    assert.match(
        html,
        /\.profile-feature-layout \.feature-card\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
    );
    assert.match(
        html,
        /\.profile-layout \.feature-benefit\s*\{[^}]*margin-top:\s*auto !important;[^}]*border-top:\s*1px solid var\(--vuddy-line\);/s,
    );
});
