// Run after building a generated app, with the repository's Playwright installed.
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";
import { chromium, expect } from "@playwright/test";

const root = resolve(process.argv[2] ?? ".work/cli-smoke");
const mime = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".webmanifest": "application/manifest+json",
  ".png": "image/png",
};

async function serve(directory) {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, "http://localhost").pathname,
      );
      const path = resolve(
        directory,
        "." + (pathname === "/" ? "/index.html" : pathname),
      );
      const child = relative(directory, path);
      if (child === ".." || child.startsWith(".." + sep) || isAbsolute(child)) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(path);
      response.writeHead(200, {
        "Content-Type": mime[extname(path)] ?? "application/octet-stream",
        "Cache-Control": "no-cache",
      });
      response.end(body);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolveListen, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolveListen);
  });
  return { server, url: `http://127.0.0.1:${server.address().port}` };
}

const browser = await chromium.launch({ headless: true });
async function matchingThemeColor(page) {
  await expect
    .poll(() =>
      page.evaluate(() => {
        const probe = document.createElement("span");
        probe.style.backgroundColor = document.querySelector(
          'meta[name="theme-color"]',
        ).content;
        document.body.append(probe);
        const color = getComputedStyle(probe).backgroundColor;
        probe.remove();
        return (
          color ===
          getComputedStyle(document.querySelector(".lab-workspace"))
            .backgroundColor
        );
      }),
    )
    .toBe(true);
}
try {
  for (const directory of ["dist", "dist-pwa"]) {
    const { server, url } = await serve(resolve(root, directory));
    const context = await browser.newContext({
      viewport: { width: 1200, height: 800 },
    });
    try {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(url + "/?desktop=windows");
      await expect(
        page.getByRole("heading", { name: "Your workspace" }),
      ).toBeVisible();
      await expect(page.locator(".lab-window-controls")).toHaveCount(0);
      await matchingThemeColor(page);
      assert.equal(
        await page.locator("html").getAttribute("data-window-frame"),
        null,
      );
      await page
        .getByRole("button", { name: "Open settings", exact: true })
        .click();
      await page
        .getByRole("textbox", { name: "Workspace name" })
        .fill("My local workspace");
      await expect(page.locator(".brand")).toHaveText("My local workspace");
      await page.getByRole("combobox", { name: "Theme" }).click();
      await page.getByRole("option", { name: "Dark", exact: true }).click();
      await expect(page.locator("main.app")).toHaveClass(/dark/);
      await matchingThemeColor(page);
      await page.getByRole("combobox", { name: "Theme" }).click();
      await page.getByRole("option", { name: "Light", exact: true }).click();
      await matchingThemeColor(page);
      await page.getByRole("tab", { name: "Welcome", exact: true }).click();
      if (directory === "dist-pwa") {
        await page.evaluate(() =>
          navigator.serviceWorker.ready.then(() => true),
        );
        await page.reload();
        await page.waitForFunction(
          () => navigator.serviceWorker.controller !== null,
        );
        await context.setOffline(true);
        await page.reload();
        await expect(
          page.getByRole("heading", { name: "Your workspace" }),
        ).toBeVisible();
        console.log(
          "PWA: worker controls the page and the app reloads offline.",
        );
      } else {
        assert.equal(
          await page.evaluate(
            async () =>
              (await navigator.serviceWorker.getRegistrations()).length,
          ),
          0,
        );
        await page.screenshot({
          path: resolve(root, "starter-preview.png"),
          fullPage: true,
        });
        await page.setViewportSize({ width: 375, height: 812 });
        await expect(
          page.getByRole("heading", { name: "Your workspace" }),
        ).toBeVisible();
        assert.ok(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= window.innerWidth,
          ),
        );
        console.log(
          "Web: UI components work, phone layout fits, and no worker is registered.",
        );
      }
      assert.deepEqual(errors, []);
    } finally {
      await context.close();
      server.closeAllConnections();
      await new Promise((resolveClose) => server.close(resolveClose));
    }
  }
} finally {
  await browser.close();
}
