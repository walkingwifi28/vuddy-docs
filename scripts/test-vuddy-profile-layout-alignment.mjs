import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
    new URL("../pages/service-guide/vuddy/index.html", import.meta.url),
    "utf8",
);

const slides = html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

test("Vuddy資料のCSSは!importantに依存しない", () => {
    assert.doesNotMatch(html, /!important/);
});

test("指定スライドだけがprofile-vuddyレイアウトを使用する", () => {
    const expectedClasses = new Map([
        [4, "profile-solution-layout"],
        [6, "profile-viewer-layout"],
        [7, "profile-feature-layout"],
        [11, "profile-price-layout"],
        [15, "profile-cta-layout"],
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

test("スライド10は導入メリットごとのBeforeとAfterを表示する", () => {
    assert.equal(slides.length, 15);
    assert.match(slides[9], /class="eyebrow">Before \/ After</);
    assert.equal(slides[9].match(/class="before-after-card"/g)?.length, 4);
    assert.equal(slides[9].match(/>Before<|>導入前</g)?.length, 4);
    assert.equal(slides[9].match(/>After<|>導入後</g)?.length, 4);

    for (const heading of ["理解促進", "関心把握", "行動促進", "継続改善"]) {
        assert.match(slides[9], new RegExp(`<h3>${heading}</h3>`));
    }

    assert.doesNotMatch(html, /class="eyebrow">Comparison</);
    assert.doesNotMatch(html, /class="eyebrow">Example</);
});

test("対象ページの主要寸法をprofile-vuddyに合わせる", () => {
    assert.match(html, /\.profile-layout \.feature-card\s*\{[^}]*min-height:\s*410px;[^}]*padding:\s*20px;/s);
    assert.match(html, /\.profile-layout \.comparison-item\s*\{[^}]*margin-top:\s*14px;[^}]*padding:\s*12px;/s);
    assert.match(html, /\.profile-layout \.price-card\s*\{[^}]*min-height:\s*330px;/s);
    assert.equal(html.match(/style="font-size:\s*22px"/g)?.length, 2);
});

test("スライド7のカード内区切り線を同じ高さにそろえる", () => {
    assert.match(
        html,
        /\.profile-feature-layout \.feature-card\s*\{[^}]*display:\s*flex;[^}]*flex-direction:\s*column;/s,
    );
    assert.match(
        html,
        /\.profile-layout \.feature-benefit\s*\{[^}]*margin-top:\s*auto;[^}]*border-top:\s*1px solid var\(--vuddy-line\);/s,
    );
});
