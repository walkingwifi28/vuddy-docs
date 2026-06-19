import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const presentationUrl = new URL(
    "../pages/service-guide/sales-vuddy/index.html",
    import.meta.url,
);
const profilePresentationUrl = new URL(
    "../pages/service-guide/profile-vuddy/index.html",
    import.meta.url,
);

async function readPresentation() {
    return readFile(presentationUrl, "utf8");
}

function bodyElementSignature(html) {
    const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "";

    return [...body.matchAll(/<(\/)?([a-z][\w-]*)([^>]*)>/gi)].map(
        ([, closing, tag, attributes]) => {
            if (closing) return `/${tag.toLowerCase()}`;
            const classes =
                attributes.match(/\bclass="([^"]*)"/i)?.[1].trim() ?? "";
            return `${tag.toLowerCase()}.${classes}`;
        },
    );
}

function normalizedBodyText(html) {
    return (html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? "")
        .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
        .replace(/<!--[\s\S]*?-->/g, " ")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ")
        .trim();
}

test("sales presentation exists and keeps the 15-slide Reveal structure", async () => {
    const html = await readPresentation();
    const slides =
        html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

    assert.equal(slides.length, 15);
    assert.match(html, /Reveal\.initialize\(/);
    assert.match(html, /Vuddy_logo-01\.png/);
    assert.equal(html.match(/VARISTA_logo\.png/g)?.length, 15);
});

test("sales presentation consolidates benefits, comparison, and example into four before-after cards", async () => {
    const html = await readPresentation();

    assert.match(html, /<div class="eyebrow">Before \/ After<\/div>/);
    assert.doesNotMatch(html, /<div class="eyebrow">(?:Benefits|Comparison|Example)<\/div>/);
    assert.equal(html.match(/class="before-after-card"/g)?.length, 4);
    assert.equal(html.match(/class="before-after-label"/g)?.length, 12);

    for (const heading of ["情報提供", "興味把握", "改善材料", "次の行動"]) {
        assert.match(html, new RegExp(`<h3>${heading}</h3>`));
    }
});

test("sales presentation uses exactly the same CSS as the profile presentation", async () => {
    const [html, profileHtml] = await Promise.all([
        readPresentation(),
        readFile(profilePresentationUrl, "utf8"),
    ]);
    const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
    const profileCss =
        profileHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

    assert.equal(css, profileCss);
});

test("sales presentation matches the profile presentation DOM elements without changing body text", async () => {
    const [html, profileHtml] = await Promise.all([
        readPresentation(),
        readFile(profilePresentationUrl, "utf8"),
    ]);
    const bodyTextHash = createHash("sha256")
        .update(normalizedBodyText(html))
        .digest("hex");

    assert.deepEqual(
        bodyElementSignature(html),
        bodyElementSignature(profileHtml),
    );
    assert.equal(
        bodyTextHash,
        "58035177c445cfa730db5d2b784b7b5d58978da6492429a36ff80e38042e1c43",
    );
});

test("sales presentation contains the source use case", async () => {
    const html = await readPresentation();

    for (const term of [
        "営業管理を効率化したい",
        "情報共有を改善したい",
        "機能を見る",
        "導入事例を見る",
        "料金を見る",
        "セキュリティを見る",
        "デモを依頼する",
    ]) {
        assert.match(html, new RegExp(term));
    }
});

test("sales presentation keeps distribution controls and uses the profile iframe structure", async () => {
    const html = await readPresentation();

    assert.doesNotMatch(html, /名刺交換|紙の名刺|デジタル名刺/);
    assert.match(html, /class="pdf-download"/);
    assert.match(html, /<iframe\b/);
    assert.doesNotMatch(html, /class="sales-demo"/);
});
