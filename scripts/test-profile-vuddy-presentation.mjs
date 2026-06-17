import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const presentationUrl = new URL(
    "../pages/service-introduction-materials/profile-vuddy/index.html",
    import.meta.url,
);

async function readPresentation() {
    return readFile(presentationUrl, "utf8");
}

test("profile-vuddy presentation exists and keeps the 17-slide Reveal structure", async () => {
    const html = await readPresentation();
    const slides =
        html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

    assert.equal(slides.length, 17);
    assert.match(html, /<title>Vuddy ホームページ活用紹介資料<\/title>/);
    assert.match(html, /Reveal\.initialize\(/);
    assert.match(html, /Vuddy_logo-01\.png/);
    assert.equal(html.match(/VARISTA_logo\.png/g)?.length, 17);
});

test("profile-vuddy presentation communicates expression and a strong first impression", async () => {
    const html = await readPresentation();

    for (const term of [
        "表現力",
        "第一印象",
        "文章と静止画",
        "動画",
        "分岐",
        "選べる",
    ]) {
        assert.match(html, new RegExp(term));
    }
});

test("profile-vuddy presentation addresses BtoC and small-business outcomes", async () => {
    const html = await readPresentation();

    for (const term of [
        "サロン",
        "スクール",
        "店舗",
        "個人事業",
        "来店予約",
        "体験申込",
        "相談予約",
        "問い合わせ",
    ]) {
        assert.match(html, new RegExp(term));
    }
});

test("profile-vuddy presentation includes actionable website analytics", async () => {
    const html = await readPresentation();

    for (const term of [
        "視聴完了率",
        "選択肢クリック率",
        "離脱ポイント",
        "CTAクリック率",
        "Sample",
    ]) {
        assert.match(html, new RegExp(term));
    }
});

test("profile-vuddy presentation excludes business-card messaging and retains key UI", async () => {
    const html = await readPresentation();

    assert.doesNotMatch(html, /名刺交換|紙の名刺|デジタル名刺/);
    assert.match(html, /class="pdf-download"/);
    assert.match(html, /<iframe\b/);
    assert.match(html, /class="viewer-experience"/);
    assert.match(html, /\.\.\/\.\.\/\.\.\/assets\/fonts\/noto-sans-jp-vuddy\.woff2/);
    assert.match(html, /\.\.\/\.\.\/\.\.\/assets\/images\/Vuddy_logo-01\.png/);
});

test("FAQ cards fit two rows inside a 720px slide", async () => {
    const html = await readPresentation();
    const faqRule = html.match(/\.faq\s*\{([^}]*)\}/s)?.[1] ?? "";

    assert.match(faqRule, /min-height:\s*165px;/);
    assert.match(faqRule, /padding:\s*14px 18px;/);
});
