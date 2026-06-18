import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL("..", import.meta.url));
const legacyNames = ["service-introduction-materials", "service-materials"];

function findFiles(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? findFiles(path) : [path];
    });
}

test("renamed service paths are used by operational files", () => {
    const files = [
        join(rootDir, ".gitignore"),
        ...findFiles(join(rootDir, ".github")),
        ...findFiles(join(rootDir, "scripts")).filter(
            (path) => path !== fileURLToPath(import.meta.url),
        ),
    ];
    const staleReferences = files.flatMap((path) => {
        const source = readFileSync(path, "utf8");
        return legacyNames.flatMap((name) =>
            source.includes(name)
                ? [`${relative(rootDir, path)}: ${name}`]
                : [],
        );
    });

    assert.deepEqual(staleReferences, []);
    assert.equal(
        existsSync(join(rootDir, "pages", "service-guide", "vuddy", "index.html")),
        true,
    );
    assert.equal(existsSync(join(rootDir, "pages", "service-docs")), true);
});
