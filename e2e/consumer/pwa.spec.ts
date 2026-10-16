import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

type Geometry = {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
};
type TestWindow = Window & {
  setOverlay: (geometry: Partial<Geometry>) => void;
};

// Deterministic API simulation covers left/right controls on every platform.
// pwa-native.spec.ts separately verifies an actually installed Chromium PWA.
async function overlay(page: Page, initial: Partial<Geometry> = {}) {
  await page.addInitScript((initial) => {
    const geometry = {
      x: 0,
      y: 0,
      width: innerWidth - 180,
      height: 32,
      visible: true,
      ...initial,
    };
    const api = Object.assign(new EventTarget(), {
      get visible() {
        return geometry.visible;
      },
      getTitlebarAreaRect: () =>
        new DOMRect(geometry.x, geometry.y, geometry.width, geometry.height),
    });
    Object.defineProperty(api, "visible", { get: () => geometry.visible });
    Object.defineProperty(navigator, "windowControlsOverlay", { value: api });
    (window as unknown as TestWindow).setOverlay = (next) => {
      Object.assign(geometry, next);
      api.dispatchEvent(new Event("geometrychange"));
    };
  }, initial);
}
async function update(page: Page, value: Partial<Geometry>) {
  await page.evaluate(
    (value) => (window as unknown as TestWindow).setOverlay(value),
    value,
  );
}
const active = (page: Page) => page.locator("[data-window-controls-overlay]");

test("right-hand native controls reserve only the title row, including split panes", async ({
  page,
}) => {
  await overlay(page);
  await page.goto("?page=pwa");
  await expect(active(page)).toHaveCount(1);
  await expect(page.locator(".lab-window-controls")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Account" })).toBeVisible();
  const safeRight = page.viewportSize()!.width - 180;
  await expect
    .poll(async () => {
      const box = (await page.locator(".lab-trailing").boundingBox())!;
      return box.x + box.width;
    })
    .toBe(safeRight);
  const panel = (await page.getByRole("tabpanel").boundingBox())!;
  expect(panel.x).toBe(0);
  expect(panel.width).toBe(page.viewportSize()!.width);
  const settings = page.getByRole("tab", { name: "Settings 2", exact: true });
  await settings.focus();
  await page.keyboard.press("Alt+Shift+ArrowRight");
  await expect(page.locator("[data-titlebar-overlay]")).toHaveCount(2);
  for (const header of await page.locator("[data-pane-header]").all()) {
    const box = (await header.boundingBox())!;
    expect(box.x + box.width).toBeLessThanOrEqual(safeRight);
  }
  await page
    .locator("[data-pane-header]")
    .last()
    .getByRole("button", { name: "Add settings" })
    .click();
  await settings.focus();
  await page.keyboard.press("Alt+Shift+ArrowDown");
  await expect(page.getByRole("tabpanel")).toHaveCount(3);
  const bottom = page.locator(
    "[data-pane-header]:not([data-titlebar-overlay])",
  );
  await expect(bottom).toHaveCount(1);
  const box = (await bottom.boundingBox())!;
  expect(box.x + box.width).toBe(page.viewportSize()!.width);
});

test("left-hand controls, resize, density, and hiding restore the available space", async ({
  page,
}) => {
  await overlay(page, { x: 88, width: 1312, height: 38 });
  await page.goto("?page=pwa&density=0");
  await expect(active(page)).toHaveCount(1);
  await expect
    .poll(
      async () => (await page.locator("[data-pane-header]").boundingBox())!.x,
    )
    .toBe(88);
  expect(
    (await page.getByRole("tab").first().boundingBox())!.x,
  ).toBeGreaterThanOrEqual(88);
  expect((await page.getByRole("tabpanel").boundingBox())!.y).toBe(37);
  await page.setViewportSize({ width: 1000, height: 700 });
  await update(page, { x: 0, width: 820, height: 32 });
  await expect
    .poll(
      async () =>
        (await page.locator("[data-pane-header]").boundingBox())!.width,
    )
    .toBe(820);
  expect((await page.getByRole("tabpanel").boundingBox())!.y).toBe(31);
  await update(page, { visible: false, width: 0, height: 0 });
  await expect(active(page)).toHaveCount(0);
  expect((await page.locator("[data-pane-header]").boundingBox())!.width).toBe(
    1000,
  );
  expect((await page.getByRole("tabpanel").boundingBox())!.y).toBe(25);
  await expect(page.locator(".lab-toolbar")).not.toHaveCSS(
    "-webkit-app-region",
    "drag",
  );
  await update(page, { visible: true, x: 88, width: 912, height: 32 });
  await expect(active(page)).toHaveCount(1);
});

test("interactive slots and tabs stay clickable and draggable without duplicate caption buttons", async ({
  page,
}) => {
  await overlay(page);
  await page.goto("?page=pwa");
  await expect(page.locator(".lab-toolbar")).toHaveCSS(
    "-webkit-app-region",
    "drag",
  );
  await expect(page.locator("[data-window-drag]")).toHaveCSS(
    "-webkit-app-region",
    "drag",
  );
  for (const item of [
    page.getByRole("tab").first(),
    page.getByRole("button", { name: "Account" }),
    page.getByRole("button", { name: "Add settings" }),
  ])
    await expect(item).toHaveCSS("-webkit-app-region", "no-drag");
  await page.getByRole("button", { name: "Account" }).click();
  await expect(page.getByRole("button", { name: "Clicked" })).toBeVisible();
  await page.getByRole("button", { name: "Add settings" }).click();
  await expect(page.getByRole("tab")).toHaveCount(4);
  await page.getByRole("tab", { name: "Overview 0", exact: true }).click();
  await expect(page.getByRole("tabpanel")).toHaveText("Overview 0 content");
  const tab = page.getByRole("tab", { name: "Settings 2", exact: true });
  const box = (await tab.boundingBox())!;
  await page.mouse.move(box.x + 24, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(350, 500, { steps: 12 });
  await page.keyboard.press("Escape");
  await page.mouse.up();
  await expect(page.getByRole("tab")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Minimize", exact: true }),
  ).toHaveCount(0);
});

test("geometry is relative to the workspace and not applied below the title row", async ({
  page,
}) => {
  await overlay(page, { x: 88, width: 1312 });
  await page.goto("?page=pwa");
  await page.locator(".lab-workspace").evaluate((el) => {
    el.style.marginLeft = "20px";
  });
  await expect
    .poll(
      async () => (await page.locator("[data-pane-header]").boundingBox())!.x,
    )
    .toBe(88);
  await page.locator(".lab-workspace").evaluate((el) => {
    el.style.marginTop = "50px";
  });
  await page.setViewportSize({ width: 1400, height: 700 });
  await expect(active(page)).toHaveCount(0);
  expect((await page.locator("[data-pane-header]").boundingBox())!.x).toBe(20);
});

test("fullscreen removes overlay spacing and restores it on exit", async ({
  page,
}) => {
  await overlay(page);
  await page.goto("?page=pwa");
  await expect(active(page)).toHaveCount(1);
  await page.getByRole("tab").first().click();
  await page.evaluate(() => document.documentElement.requestFullscreen());
  await expect(active(page)).toHaveCount(0);
  await page.evaluate(() => document.exitFullscreen());
  await expect(active(page)).toHaveCount(1);
});

for (const mode of ["unsupported", "hidden", "opt-out"] as const) {
  test(`${mode} uses an ordinary browser workspace`, async ({ page }) => {
    if (mode === "unsupported")
      await page.addInitScript(() =>
        Object.defineProperty(navigator, "windowControlsOverlay", {
          value: undefined,
        }),
      );
    else await overlay(page, { visible: mode !== "hidden" });
    await page.goto(`?page=pwa${mode === "opt-out" ? "&no-overlay" : ""}`);
    await expect(page.getByRole("tab")).toHaveCount(3);
    await expect(active(page)).toHaveCount(0);
    await expect(page.locator(".lab-toolbar")).not.toHaveCSS(
      "-webkit-app-region",
      "drag",
    );
    await expect(page.locator(".lab-window-controls")).toHaveCount(0);
    expect(
      (await page.locator("[data-pane-header]").boundingBox())!.width,
    ).toBe(page.viewportSize()!.width);
  });
}
