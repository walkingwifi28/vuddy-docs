import assert from "node:assert/strict";
import test from "node:test";

import {
    defaultBrowserStartTimeoutMs,
    getBrowserLaunchArgs,
} from "./export-vuddy-pdf.mjs";

test("browser launch waits long enough for slower GitHub Actions runners", () => {
    assert.equal(defaultBrowserStartTimeoutMs, 60_000);
});

test("browser launch uses Linux CI flags for headless Chrome", () => {
    const args = getBrowserLaunchArgs({
        platform: "linux",
        profileDir: "/tmp/vuddy-profile",
    });

    assert.ok(args.includes("--headless=new"));
    assert.ok(args.includes("--no-sandbox"));
    assert.ok(args.includes("--disable-setuid-sandbox"));
    assert.ok(args.includes("--disable-dev-shm-usage"));
    assert.ok(args.includes("--remote-debugging-port=0"));
    assert.ok(args.includes("--user-data-dir=/tmp/vuddy-profile"));
    assert.equal(args.at(-1), "about:blank");
});
