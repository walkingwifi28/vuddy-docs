import { spawn, spawnSync } from "node:child_process";
import {
    createReadStream,
    existsSync,
    mkdtempSync,
    renameSync,
    rmSync,
    statSync,
    writeFileSync,
} from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { extname, join, normalize, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

if (typeof WebSocket === "undefined") {
    const result = spawnSync(
        process.execPath,
        ["--experimental-websocket", fileURLToPath(import.meta.url)],
        {
            cwd: process.cwd(),
            env: process.env,
            stdio: "inherit",
        },
    );
    process.exit(result.status ?? 1);
}

const rootDir = process.cwd();
const presentationPath =
    "/pages/service-introduction-materials/vuddy/index.html";
const outputPath = resolve(
    process.env.VUDDY_PDF_OUTPUT ??
        join(
            rootDir,
            "pages",
            "service-introduction-materials",
            "vuddy",
            "vuddy-service-introduction.pdf",
        ),
);
const temporaryOutputPath = `${outputPath}.tmp`;
const browserProfileDir = mkdtempSync(
    join(tmpdir(), "vuddy-pdf-browser-profile-"),
);

const mimeTypes = new Map([
    [".css", "text/css; charset=utf-8"],
    [".html", "text/html; charset=utf-8"],
    [".js", "text/javascript; charset=utf-8"],
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".svg", "image/svg+xml"],
    [".webp", "image/webp"],
]);

class CdpConnection {
    constructor(url) {
        this.nextId = 1;
        this.pending = new Map();
        this.eventWaiters = [];
        this.socket = new WebSocket(url);

        this.ready = new Promise((resolvePromise, reject) => {
            this.socket.addEventListener("open", resolvePromise, {
                once: true,
            });
            this.socket.addEventListener("error", reject, { once: true });
        });

        this.socket.addEventListener("message", (event) => {
            const message = JSON.parse(event.data);

            if (message.id) {
                const pending = this.pending.get(message.id);
                if (!pending) return;
                this.pending.delete(message.id);
                if (message.error) {
                    pending.reject(new Error(message.error.message));
                } else {
                    pending.resolve(message.result);
                }
                return;
            }

            this.eventWaiters = this.eventWaiters.filter((waiter) => {
                if (
                    waiter.method !== message.method ||
                    waiter.sessionId !== message.sessionId
                ) {
                    return true;
                }
                clearTimeout(waiter.timeout);
                waiter.resolve(message.params);
                return false;
            });
        });
    }

    async send(method, params = {}, sessionId) {
        await this.ready;
        const id = this.nextId++;

        return new Promise((resolvePromise, reject) => {
            this.pending.set(id, { resolve: resolvePromise, reject });
            this.socket.send(
                JSON.stringify({
                    id,
                    method,
                    params,
                    ...(sessionId ? { sessionId } : {}),
                }),
            );
        });
    }

    waitFor(method, sessionId, timeoutMs = 30_000) {
        return new Promise((resolvePromise, reject) => {
            const waiter = {
                method,
                sessionId,
                resolve: resolvePromise,
                timeout: setTimeout(() => {
                    this.eventWaiters = this.eventWaiters.filter(
                        (candidate) => candidate !== waiter,
                    );
                    reject(new Error(`Timed out waiting for ${method}.`));
                }, timeoutMs),
            };
            this.eventWaiters.push(waiter);
        });
    }

    close() {
        this.socket.close();
    }
}

function findBrowser() {
    const candidates = [
        process.env.CHROME_PATH,
        process.env.EDGE_PATH,
        process.platform === "win32"
            ? join(
                  process.env.ProgramFiles ?? "C:\\Program Files",
                  "Google",
                  "Chrome",
                  "Application",
                  "chrome.exe",
              )
            : null,
        process.platform === "win32"
            ? join(
                  process.env["ProgramFiles(x86)"] ??
                      "C:\\Program Files (x86)",
                  "Microsoft",
                  "Edge",
                  "Application",
                  "msedge.exe",
              )
            : null,
        process.platform === "darwin"
            ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
            : null,
        process.platform === "linux" ? "/usr/bin/google-chrome" : null,
        process.platform === "linux" ? "/usr/bin/chromium" : null,
    ].filter(Boolean);

    const browser = candidates.find(existsSync);
    if (!browser) {
        throw new Error(
            "Chrome or Edge was not found. Set CHROME_PATH or EDGE_PATH.",
        );
    }

    return browser;
}

function resolveRequestPath(url) {
    const pathname = decodeURIComponent(new URL(url, "http://localhost").pathname);
    const requestedPath = resolve(rootDir, `.${pathname}`);
    const relativePath = relative(rootDir, requestedPath);

    if (relativePath.startsWith("..")) return null;
    return normalize(requestedPath);
}

function createStaticServer() {
    return createServer((request, response) => {
        const filePath = resolveRequestPath(request.url ?? "/");

        if (!filePath || !existsSync(filePath) || !statSync(filePath).isFile()) {
            response.writeHead(404);
            response.end("Not found");
            return;
        }

        response.writeHead(200, {
            "Content-Type":
                mimeTypes.get(extname(filePath).toLowerCase()) ??
                "application/octet-stream",
            "Cache-Control": "no-store",
        });
        createReadStream(filePath).pipe(response);
    });
}

function launchBrowser(browserPath) {
    const browser = spawn(
        browserPath,
        [
            "--headless",
            "--disable-gpu",
            "--hide-scrollbars",
            "--remote-debugging-port=0",
            `--user-data-dir=${browserProfileDir}`,
            "about:blank",
        ],
        { stdio: ["ignore", "ignore", "pipe"] },
    );

    const endpoint = new Promise((resolvePromise, reject) => {
        let stderr = "";
        const timeout = setTimeout(() => {
            reject(new Error(`Timed out starting browser.\n${stderr.trim()}`));
        }, 15_000);

        browser.stderr.on("data", (chunk) => {
            stderr += chunk;
            const match = stderr.match(/DevTools listening on (ws:\/\/\S+)/);
            if (match) {
                clearTimeout(timeout);
                resolvePromise(match[1]);
            }
        });
        browser.on("error", reject);
        browser.on("exit", (code) => {
            if (code !== null && code !== 0) {
                clearTimeout(timeout);
                reject(
                    new Error(
                        `Browser exited with code ${code}.\n${stderr.trim()}`,
                    ),
                );
            }
        });
    });

    return { browser, endpoint };
}

function waitForExit(process, timeoutMs = 5_000) {
    if (process.exitCode !== null) return Promise.resolve();

    return new Promise((resolvePromise) => {
        const timeout = setTimeout(resolvePromise, timeoutMs);
        process.once("exit", () => {
            clearTimeout(timeout);
            resolvePromise();
        });
    });
}

async function closeServer(server) {
    if (!server.listening) return;
    await new Promise((resolvePromise) => server.close(resolvePromise));
}

const server = createStaticServer();
let browserProcess;
let cdp;

try {
    const browserPath = findBrowser();
    rmSync(temporaryOutputPath, { force: true });

    await new Promise((resolvePromise, reject) => {
        server.once("error", reject);
        server.listen(0, "127.0.0.1", resolvePromise);
    });

    const address = server.address();
    if (!address || typeof address === "string") {
        throw new Error("Could not determine the local server port.");
    }

    const url = `http://127.0.0.1:${address.port}${presentationPath}?print-pdf`;
    const launched = launchBrowser(browserPath);
    browserProcess = launched.browser;
    cdp = new CdpConnection(await launched.endpoint);

    const { targetId } = await cdp.send("Target.createTarget", {
        url: "about:blank",
    });
    const { sessionId } = await cdp.send("Target.attachToTarget", {
        targetId,
        flatten: true,
    });

    await cdp.send("Page.enable", {}, sessionId);
    await cdp.send("Runtime.enable", {}, sessionId);
    await cdp.send(
        "Emulation.setEmulatedMedia",
        { media: "print" },
        sessionId,
    );

    const loaded = cdp.waitFor("Page.loadEventFired", sessionId);
    await cdp.send("Page.navigate", { url }, sessionId);
    await loaded;

    const ready = await cdp.send(
        "Runtime.evaluate",
        {
            expression: `(async () => {
                const deadline = Date.now() + 20000;
                while (
                    (!(window.Reveal && Reveal.isReady())) &&
                    Date.now() < deadline
                ) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                }
                if (!(window.Reveal && Reveal.isReady())) {
                    throw new Error("Reveal.js did not initialize");
                }
                await document.fonts.ready;
                await Promise.all(
                    [...document.images].map((image) =>
                        image.complete
                            ? undefined
                            : new Promise((resolve) => {
                                  image.addEventListener("load", resolve, {
                                      once: true,
                                  });
                                  image.addEventListener("error", resolve, {
                                      once: true,
                                  });
                              }),
                    ),
                );
                await new Promise((resolve) => setTimeout(resolve, 500));
                return {
                    count: document.querySelectorAll(".reveal section").length,
                    href: location.href,
                    title: document.title,
                    bodyStart: document.body?.innerText.slice(0, 160) ?? "",
                };
            })()`,
            awaitPromise: true,
            returnByValue: true,
        },
        sessionId,
    );

    if (ready.exceptionDetails) {
        throw new Error(
            ready.exceptionDetails.exception?.description ??
                "Presentation readiness check failed.",
        );
    }
    if (ready.result.value.count === 0) {
        throw new Error(
            `Presentation contains no slides: ${JSON.stringify(ready.result.value)}`,
        );
    }

    const { data } = await cdp.send(
        "Page.printToPDF",
        {
            displayHeaderFooter: false,
            printBackground: true,
            preferCSSPageSize: true,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 0,
            marginRight: 0,
        },
        sessionId,
    );

    writeFileSync(temporaryOutputPath, Buffer.from(data, "base64"));
    if (statSync(temporaryOutputPath).size === 0) {
        throw new Error("Browser completed without writing a PDF.");
    }

    rmSync(outputPath, { force: true });
    renameSync(temporaryOutputPath, outputPath);
    console.log(`Wrote ${relative(rootDir, outputPath)}`);

    await cdp.send("Browser.close");
} catch (error) {
    console.error(
        `Failed to export Vuddy PDF: ${error instanceof Error ? error.message : error}`,
    );
    process.exitCode = 1;
} finally {
    cdp?.close();
    browserProcess?.kill();
    if (browserProcess) await waitForExit(browserProcess);
    await closeServer(server);
    rmSync(temporaryOutputPath, { force: true });
    try {
        rmSync(browserProfileDir, { recursive: true, force: true });
    } catch {
        // Chrome crash reporting may briefly retain a file handle on Windows.
    }
}
