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
