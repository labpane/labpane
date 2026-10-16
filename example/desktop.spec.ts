import { expect, test } from "@playwright/test";

test.use({
  viewport: { width: 960, height: 640 },
  screen: { width: 1920, height: 1080 },
});

test("desktop reporting waits for the initial tab widths to settle", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "desktop windows are wide");
  await page.addInitScript(() => {
    const sent: string[] = [];
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.id = "initial-tab-widths";
      // Reproduce the 192px initial widths captured on the macOS runner.
      style.textContent = ".lab-tab-link { width: 192px !important; }";
      document.head.append(style);
    });
    Object.assign(window, {
      sent,
      chrome: {
        webview: { postMessage: (message: string) => sent.push(message) },
      },
    });
  });
  await page.goto("desktop/?platform=macos");
  const reports = () =>
    page.evaluate(() =>
      (window as unknown as { sent: string[] }).sent.filter((message) =>
        message.startsWith('EE{"name":"layout"'),
      ),
    );
  // Deliberately exceed the previous 500ms startup delay while layout is pending.
  await page.waitForTimeout(800);
  expect(await reports()).toEqual([]);
  await page
    .locator("#initial-tab-widths")
    .evaluate((element) => element.remove());
  await expect
    .poll(reports)
    .toEqual([
      'EE{"name":"layout","data":[{"platform":"macos","problems":[]}]}',
    ]);
});

test("desktop reporting still fails when the controls really overlap", async ({
  page,
}, info) => {
  test.skip(info.project.name !== "desktop", "desktop windows are wide");
  await page.addInitScript(() => {
    const sent: string[] = [];
    Object.assign(window, {
      sent,
      chrome: {
        webview: { postMessage: (message: string) => sent.push(message) },
      },
    });
    document.addEventListener("DOMContentLoaded", () => {
      const style = document.createElement("style");
      style.textContent = ".lab-trailing { right: 50% !important; }";
      document.head.append(style);
    });
  });
  await page.goto("desktop/?platform=macos");
  await expect
    .poll(() =>
      page.evaluate(() =>
        (window as unknown as { sent: string[] }).sent.find((message) =>
          message.startsWith('EE{"name":"layout"'),
        ),
      ),
    )
    .toContain("the menu is not after the tabs");
});
