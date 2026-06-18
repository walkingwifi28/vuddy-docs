import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const html = await readFile(
    new URL(
        "../pages/service-guide/vuddy/index.html",
        import.meta.url,
    ),
    "utf8",
);

test("the cover logo is centered independently from the title", () => {
    const logoRule =
        html.match(/\.reveal \.cover-logo\s*\{([^}]*)\}/s)?.[1] ?? "";
    const titleRule = html.match(/\.cover-title\s*\{([^}]*)\}/s)?.[1] ?? "";
    const contentRule =
        html.match(/\.cover-content\s*\{([^}]*)\}/s)?.[1] ?? "";

    assert.match(logoRule, /position:\s*absolute;/);
    assert.match(logoRule, /top:\s*50%;/);
    assert.match(logoRule, /transform:\s*translateY\(-50%\);/);
    assert.match(logoRule, /margin:\s*0;/);
    assert.match(titleRule, /position:\s*absolute;/);
    assert.match(titleRule, /top:\s*calc\(50% \+ 174px\);/);
    assert.doesNotMatch(contentRule, /translateY\(/);
});

test("the cover title explicitly uses the presentation font without changing its size or weight", () => {
    const titleRule = html.match(/\.cover-title\s*\{([^}]*)\}/s)?.[1] ?? "";

    assert.match(
        titleRule,
        /font-family:\s*"Vuddy Noto Sans JP",\s*"Noto Sans JP",\s*sans-serif;/,
    );
    assert.match(titleRule, /font-size:\s*34px;/);
    assert.match(titleRule, /font-weight:\s*500;/);
});
