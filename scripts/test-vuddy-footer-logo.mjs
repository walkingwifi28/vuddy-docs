import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const presentationPath = new URL(
    "../pages/service-introduction-materials/vuddy/index.html",
    import.meta.url,
);
const html = await readFile(presentationPath, "utf8");
const exportScript = await readFile(
    new URL("./export-vuddy-pdf.mjs", import.meta.url),
    "utf8",
);

test("VARISTA footer logos align inside the 720px slide frame", () => {
    assert.match(
        html,
        /\.reveal \.slides > section\s*\{[^}]*height:\s*720px;[^}]*min-height:\s*720px;/s,
    );
    assert.match(
        html,
        /\.slide-footer-logo\s*\{[^}]*bottom:\s*24px;/s,
    );
    assert.doesNotMatch(
        html,
        /\.slide-footer-logo\s*\{[^}]*bottom:\s*-\d+px;/s,
    );
});

test("PDF sections preserve the captured 720px screen height", () => {
    assert.match(
        exportScript,
        /\["height",\s*source\.height \+ "px"\]/,
    );
    assert.doesNotMatch(
        exportScript,
        /\["height",\s*"auto"\]/,
    );
});
