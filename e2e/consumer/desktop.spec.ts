import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

test.use({ screen: { width: 1920, height: 1080 } });

const calls = (page: Page) => page.evaluate(() => window.calls.splice(0));
const stripPoint = async (page: Page) => {
  const strip = (await page
    .locator(".lab-toolbar-tabs")
    .first()
    .boundingBox())!;
  return { x: strip.x + strip.width + 24, y: strip.y + strip.height / 2 };
};

test("window controls sit in the corner and drive the host", async ({
  page,
}) => {
  await page.goto("?page=desktop&desktop=windows");
  await expect(page.getByRole("tab")).toHaveCount(3);

  const close = page.getByRole("button", { name: "Close", exact: true });
  const box = (await close.boundingBox())!;
  expect(box.x + box.width).toBe(page.viewportSize()!.width);
  expect(box.y).toBe(0);
  const panelTop = await page.evaluate(
    () =>
      document
        .querySelector(".lab-panel:not([hidden])")!
        .getBoundingClientRect().top,
  );
  expect(box.height).toBeGreaterThan(40);
  expect(Math.abs(box.y + box.height - panelTop)).toBeLessThanOrEqual(1);
  const lastTab = (await page.getByRole("tab").last().boundingBox())!;
  const minimize = page.getByRole("button", { name: "Minimize", exact: true });
  expect((await minimize.boundingBox())!.x).toBeGreaterThan(
    lastTab.x + lastTab.width,
  );
  await expect(minimize).toHaveAttribute("tabindex", "-1");

  for (const [name, expected] of [
    ["Minimize", "minimize"],
    ["Maximize", "toggleMaximize"],
    ["Close", "close"],
  ]) {
    await page.getByRole("button", { name, exact: true }).click();
    expect(await calls(page)).toEqual([expected]);
  }

  const { x, y } = await stripPoint(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 40, y + 10);
  await page.mouse.up();
  expect(await calls(page)).toEqual(["drag"]);
  await page.mouse.dblclick(x, y);
  expect(await calls(page)).toContain("toggleMaximize");

  const tab = (await page.getByRole("tab").first().boundingBox())!;
  await page.mouse.move(tab.x + 20, tab.y + tab.height / 2);
  await page.mouse.down();
  await page.mouse.move(tab.x + 60, tab.y + tab.height / 2 + 4);
  await page.mouse.up();
  expect(await calls(page)).toEqual([]);

  await page.mouse.move(2, 400);
  await expect(page.locator("html")).toHaveCSS("cursor", "w-resize");
  await page.mouse.down();
  await page.mouse.up();
  expect(await calls(page)).toEqual(["resize w"]);
  await page.mouse.move(700, 400);
  await expect(page.locator("html")).not.toHaveCSS("cursor", "w-resize");

  await page.keyboard.press("F11");
  expect(await calls(page)).toEqual(["fullscreen true"]);
});

test("macOS keeps its traffic lights and native resizing", async ({ page }) => {
  await page.goto("?page=desktop&desktop=macos");
  await expect(page.getByRole("tab")).toHaveCount(3);
  await expect(
    page.getByRole("button", { name: "Close", exact: true }),
  ).toHaveCount(0);
  expect(
    (await page.getByRole("tab").first().boundingBox())!.x,
  ).toBeGreaterThan(72);

  await page.mouse.move(2, 400);
  await page.mouse.down();
  await page.mouse.up();
  const { x, y } = await stripPoint(page);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + 40, y + 10);
  await page.mouse.up();
  await page.keyboard.press("F11");
  await page.keyboard.press("Control+Meta+f");
  expect(await calls(page)).toEqual(["drag", "fullscreen true"]);
});
