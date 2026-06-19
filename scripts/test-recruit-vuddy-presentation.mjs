import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const recruitUrl = new URL(
    "../pages/service-guide/recruit-vuddy/index.html",
    import.meta.url,
);
const profileUrl = new URL(
    "../pages/service-guide/profile-vuddy/index.html",
    import.meta.url,
);

async function readRecruit() {
    return readFile(recruitUrl, "utf8");
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

test("recruit presentation uses the 15-slide profile structure", async () => {
    const [html, profileHtml] = await Promise.all([
        readRecruit(),
        readFile(profileUrl, "utf8"),
    ]);
    const slides =
        html.match(/<section(?:\s[^>]*)?>[\s\S]*?<\/section>/g) ?? [];

    assert.equal(slides.length, 15);
    assert.equal(html.match(/VARISTA_logo\.png/g)?.length, 15);
    assert.deepEqual(
        bodyElementSignature(html),
        bodyElementSignature(profileHtml),
    );
});

test("recruit presentation consolidates three chapters into four before-after cards", async () => {
    const html = await readRecruit();

    assert.match(html, /<div class="eyebrow">Before \/ After<\/div>/);
    assert.doesNotMatch(
        html,
        /<div class="eyebrow">(?:Benefits|Comparison|Example)<\/div>/,
    );
    assert.equal(html.match(/class="before-after-card"/g)?.length, 4);

    for (const heading of ["情報提供", "興味把握", "改善材料", "次の行動"]) {
        assert.match(html, new RegExp(`<h3>${heading}</h3>`));
    }
});

test("recruit presentation uses the profile CSS and BIZ UDPGothic setup", async () => {
    const [html, profileHtml] = await Promise.all([
        readRecruit(),
        readFile(profileUrl, "utf8"),
    ]);
    const css = html.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";
    const profileCss =
        profileHtml.match(/<style>([\s\S]*?)<\/style>/)?.[1] ?? "";

    assert.equal(css, profileCss);
    assert.match(
        html,
        /family=BIZ\+UDPGothic:wght@400;700&display=swap/,
    );
});

test("recruit presentation uses an iframe and keeps recruit-specific content", async () => {
    const html = await readRecruit();

    assert.match(html, /<iframe\b/);
    assert.doesNotMatch(html, /class="recruit-demo"/);
    assert.match(html, /recruit-vuddy-service-introduction\.pdf/);

    for (const term of [
        "候補者",
        "仕事内容",
        "技術スタック",
        "社員の雰囲気",
        "働き方",
        "募集要項確認",
        "面談予約",
    ]) {
        assert.match(html, new RegExp(term));
    }
});
