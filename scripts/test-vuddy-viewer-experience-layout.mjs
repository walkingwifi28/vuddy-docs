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

test("viewer experience copy aligns with the top of the slide content", () => {
    const copyRule =
        html.match(/\.experience-copy\s*\{([^}]*)\}/s)?.[1] ?? "";

    assert.match(copyRule, /align-self:\s*start;/);
});
