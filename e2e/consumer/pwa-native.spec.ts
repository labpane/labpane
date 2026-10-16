import { chromium, expect, test } from "@playwright/test";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { execFileSync } from "node:child_process";

test("installed PWA uses real browser titlebar geometry through native window changes", async ({
  baseURL,
}, info) => {
  test.skip(
    process.platform !== "win32",
    "Native PWA smoke currently runs on Windows; geometry simulations are cross-platform.",
  );
  test.setTimeout(90_000);
  // A separate disposable profile, never the developer's browser/profile.
  // Keep the profile path short: Chromium's PWA icon paths can exceed MAX_PATH
  // when nested beneath a long Playwright test-output directory on Windows.
  const profile = await mkdtemp(join(tmpdir(), "labpane-pwa-"));
  const context = await chromium.launchPersistentContext(profile, {
    channel: "chromium",
    headless: false,
    viewport: null,
    args: ["--no-first-run", "--no-default-browser-check", "--lang=en-US"],
  });
  const cdp = await context.browser()!.newBrowserCDPSession();
  const manifestId = new URL("/labpane-pwa-e2e", baseURL).href;
  let installed = false;
  try {
    await cdp.send("PWA.install", {
      manifestId,
      installUrlOrBundleUrl: new URL("/?page=pwa", baseURL).href,
    });
    installed = true;
    await cdp.send("PWA.changeAppUserSettings", {
      manifestId,
      displayMode: "standalone",
    });
    const pending = context.waitForEvent("page");
    const { targetId } = await cdp.send("PWA.launch", { manifestId });
    const page = await pending;
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.waitForURL(/page=pwa/);
    await expect(page.getByRole("tab")).toHaveCount(3);
    const browserProcess = (
      await cdp.send("SystemInfo.getProcessInfo")
    ).processInfo.find((item) => item.type === "browser")!;
    const control = (name: string) =>
      execFileSync(
        "powershell.exe",
        [
          "-NoProfile",
          "-ExecutionPolicy",
          "Bypass",
          "-File",
          "pwa-window.ps1",
          "-BrowserProcessId",
          String(browserProcess.id),
          "-Name",
          name,
        ],
        { encoding: "utf8", timeout: 10000, windowsHide: true },
      );
    // Chromium starts with its title bar visible. Exercise the same native
    // toggle that a user chooses, without emulation or browser preference edits.
    control("Hide title bar");
    await expect(page.locator("[data-window-controls-overlay]")).toHaveCount(1);
    await expect(page.locator(".lab-window-controls")).toHaveCount(0);
    const check = async () => {
      await expect
        .poll(() =>
          page.evaluate(() => {
            const overlay = (
              navigator as Navigator & {
                windowControlsOverlay: {
                  visible: boolean;
                  getTitlebarAreaRect(): DOMRect;
                };
              }
            ).windowControlsOverlay;
            const safe = overlay.getTitlebarAreaRect();
            const header = document
              .querySelector("[data-pane-header]")!
              .getBoundingClientRect();
            const account = document
              .querySelector(".lab-trailing")!
              .getBoundingClientRect();
            return (
              overlay.visible &&
              safe.width > 0 &&
              // Chromium can round DOMRects by ~0.00005 CSS px at 125% DPI.
              header.left >= safe.left - 0.01 &&
              header.right <= safe.right + 0.01 &&
              account.right <= safe.right + 0.01
            );
          }),
        )
        .toBe(true);
    };
    await check();
    control("Show title bar");
    await expect(page.locator("[data-window-controls-overlay]")).toHaveCount(0);
    control("Hide title bar");
    await expect(page.locator("[data-window-controls-overlay]")).toHaveCount(1);
    await check();
    await page.getByRole("button", { name: "Add settings" }).click();
    await expect(page.getByRole("tab")).toHaveCount(4);
    await page.getByRole("button", { name: "Account" }).click();
    await expect(page.getByRole("button", { name: "Clicked" })).toBeVisible();
    await page.screenshot({ path: info.outputPath("installed-pwa.png") });
    const { windowId } = await cdp.send("Browser.getWindowForTarget", {
      targetId,
    });
    control("Maximize");
    await expect
      .poll(
        async () =>
          (await cdp.send("Browser.getWindowBounds", { windowId })).bounds
            .windowState,
      )
      .toBe("maximized");
    await check();
    control("Restore");
    await cdp.send("Browser.setWindowBounds", {
      windowId,
      bounds: { width: 900, height: 650 },
    });
    await check();
    await page.getByRole("tab").first().click();
    await page.evaluate(() => document.documentElement.requestFullscreen());
    await expect(page.locator("[data-window-controls-overlay]")).toHaveCount(0);
    await page.evaluate(() => document.exitFullscreen());
    await expect(page.locator("[data-window-controls-overlay]")).toHaveCount(1);
    await check();
    control("Minimize");
    await expect
      .poll(
        async () =>
          (await cdp.send("Browser.getWindowBounds", { windowId })).bounds
            .windowState,
      )
      .toBe("minimized");
    await cdp.send("Browser.setWindowBounds", {
      windowId,
      bounds: { windowState: "normal" },
    });
    await check();
    expect(errors).toEqual([]);
    const closed = page.waitForEvent("close");
    control("Close");
    await closed;
    expect(page.isClosed()).toBe(true);
  } finally {
    // Remove OS registration before closing/deleting the temporary profile.
    try {
      if (installed) await cdp.send("PWA.uninstall", { manifestId });
      installed = false;
    } finally {
      await context.close();
      if (!installed) {
        expect(dirname(resolve(profile))).toBe(resolve(tmpdir()));
        expect(basename(profile)).toMatch(/^labpane-pwa-/);
        await rm(profile, {
          recursive: true,
          force: true,
          maxRetries: 5,
          retryDelay: 200,
        });
      }
    }
  }
});
