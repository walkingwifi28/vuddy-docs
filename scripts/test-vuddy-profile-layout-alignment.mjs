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
        [11, "profile-comparison-layout"],
        [13, "profile-price-layout"],
        [17, "profile-cta-layout"],
    ]);

    for (const [number, pageClass] of expectedClasses) {
        assert.match(slides[number - 1], new RegExp(`class="[^"]*profile-layout[^"]*${pageClass}`));
    }

    assert.equal(
        html.match(/<section[^>]*class="[^"]*\bprofile-layout\b/g)?.length,
        6,
    );
});

test("スライド2の右図だけがprofile-vuddyの縦並び指標を使用する", () => {
    assert.match(slides[1], /class="panel hero-panel accent profile-stat-panel"/);
    assert.match(html, /\.profile-stat-panel \.stat-row\s*\{[^}]*grid-template-columns:\s*1fr;/s);
    assert.match(html, /\.profile-stat-panel \.stat\s*\{[^}]*display:\s*flex;[^}]*justify-content:\s*space-between;/s);
});

test("スライド11は参照版と同じ4カード2段構造を使用する", () => {
    assert.equal(slides[10].match(/class="comparison-card"/g)?.length, 4);
    assert.equal(slides[10].match(/class="comparison-item(?: vuddy)?"/g)?.length, 8);
});

test("対象ページの主要寸法をprofile-vuddyに合わせる", () => {
    assert.match(html, /\.profile-layout \.feature-card\s*\{[^}]*min-height:\s*410px;[^}]*padding:\s*20px;/s);
    assert.match(html, /\.profile-layout \.comparison-item\s*\{[^}]*margin-top:\s*14px;[^}]*padding:\s*12px;/s);
    assert.match(html, /\.profile-layout \.price-card\s*\{[^}]*min-height:\s*330px;/s);
    assert.equal(slides[12].match(/font-size:\s*22px !important/g)?.length, 2);
});
