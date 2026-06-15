import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const presentationUrl = new URL(
    "../pages/service-introduction-materials/sales-vuddy/index.html",
    import.meta.url,
);

async function readPresentation() {
    return readFile(presentationUrl, "utf8");
}

test("sales presentation exists and keeps the 17-slide Reveal structure", async () => {
    const html = await readPresentation();
    const slides =
        html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

    assert.equal(slides.length, 17);
    assert.match(html, /Reveal\.initialize\(/);
    assert.match(html, /Vuddy_logo-01\.png/);
    assert.equal(html.match(/VARISTA_logo\.png/g)?.length, 17);
});

test("sales presentation contains the source use case and KPIs", async () => {
    const html = await readPresentation();

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
    const html = await readPresentation();

    assert.doesNotMatch(html, /名刺交換|紙の名刺|デジタル名刺/);
    assert.doesNotMatch(html, /class="pdf-download"/);
    assert.doesNotMatch(html, /<iframe\b/);
    assert.match(html, /class="sales-demo"/);
});
