import assert from "node:assert/strict";
import {
    existsSync,
    mkdtempSync,
    readFileSync,
    rmSync,
    writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

const rootDir = process.cwd();
const presentationDir = join(
    rootDir,
    "pages",
    "service-introduction-materials",
    "vuddy",
);
const presentationPath = join(presentationDir, "index.html");
const pdfPath = join(presentationDir, "vuddy-service-introduction.pdf");

function inspectPdf(path) {
    const pdf = readFileSync(path).toString("latin1");
    const pageCount = (pdf.match(/\/Type\s*\/Page\b/g) ?? []).length;
    const mediaBoxes = [
        ...pdf.matchAll(
            /\/MediaBox\s*\[\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\]/g,
        ),
    ].map((match) => ({
        width: Number(match[3]) - Number(match[1]),
        height: Number(match[4]) - Number(match[2]),
    }));

    return { pageCount, mediaBoxes };
}

test("Vuddy presentation exposes an accessible direct PDF download", () => {
    const html = readFileSync(presentationPath, "utf8");

    assert.match(
        html,
        /<a[^>]+class=["'][^"']*pdf-download[^"']*["'][^>]+href=["']vuddy-service-introduction\.pdf["'][^>]*>/i,
    );
    assert.match(html, /\sdownload(?:=|\s|>)/i);
    assert.match(html, /aria-label=["'][^"']*PDF[^"']*ダウンロード[^"']*["']/i);
    assert.match(
        html,
        /@media\s+print[\s\S]*?\.pdf-download[\s\S]*?display\s*:\s*none/i,
    );
});

test("site build copies colocated presentation PDFs", () => {
    const builtPdf = join(
        rootDir,
        "_site",
        "service-introduction-materials",
        "vuddy",
        "vuddy-service-introduction.pdf",
    );

    const result = spawnSync(process.execPath, ["scripts/build-pages.mjs"], {
        cwd: rootDir,
        encoding: "utf8",
    });

    assert.equal(
        result.status,
        0,
        `build failed:\n${result.stdout}\n${result.stderr}`,
    );
    assert.equal(existsSync(builtPdf), true);
    assert.deepEqual(readFileSync(builtPdf), readFileSync(pdfPath));
});

test(
    "PDF exporter creates one 16:9 page per slide",
    { timeout: 60_000 },
    () => {
        const outputDir = mkdtempSync(join(tmpdir(), "vuddy-pdf-test-"));
        const testPdfPath = join(outputDir, "vuddy-service-introduction.pdf");
        const committedPdf = readFileSync(pdfPath);

        try {
            const result = spawnSync(
                process.execPath,
                ["scripts/export-vuddy-pdf.mjs"],
                {
                    cwd: rootDir,
                    encoding: "utf8",
                    env: {
                        ...process.env,
                        VUDDY_PDF_OUTPUT: testPdfPath,
                    },
                    timeout: 55_000,
                },
            );

            assert.equal(
                result.status,
                0,
                `export failed:\n${result.stdout}\n${result.stderr}`,
            );
            assert.match(
                result.stdout,
                /Matched desktop layout for 17 slides/,
            );
            assert.equal(existsSync(testPdfPath), true);

            const html = readFileSync(presentationPath, "utf8");
            const slideCount = (
                html.match(/^\s*<section(?:\s|>)/gm) ?? []
            ).length;
            const { pageCount, mediaBoxes } = inspectPdf(testPdfPath);

            assert.equal(pageCount, slideCount);
            assert.ok(mediaBoxes.length > 0, "PDF has no readable MediaBox");
            for (const { width, height } of mediaBoxes) {
                assert.ok(
                    Math.abs(width / height - 16 / 9) < 0.01,
                    `expected 16:9 page, received ${width} x ${height}`,
                );
            }
            assert.deepEqual(readFileSync(pdfPath), committedPdf);
        } finally {
            writeFileSync(pdfPath, committedPdf);
            rmSync(outputDir, { recursive: true, force: true });
        }
    },
);
