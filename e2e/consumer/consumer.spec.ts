import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const tab = (page: Page, name: string) =>
  page.getByRole("tab", { name, exact: true });
const scrollButtons = (page: Page) =>
  page.getByRole("button", { name: /^Scroll tabs (left|right)$/ });
const tabWidth = async (page: Page) =>
  (await page.getByRole("tab").first().boundingBox())!.width;
const commits = (page: Page) => page.evaluate(() => window.lab.commits);

test("mounts tabs and measures overflow", async ({ page }) => {
  await page.goto("?tabs=3");
  await expect(page.getByRole("tab")).toHaveCount(3);
  await expect(tab(page, "Overview 0")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(scrollButtons(page)).toHaveCount(0);

  await page.setViewportSize({ width: 700, height: 800 });
  await page.goto("?tabs=12");
  await expect(page.getByRole("tab")).toHaveCount(12);
  await expect(
    page.getByRole("button", { name: "Scroll tabs left" }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Scroll tabs right" }),
  ).toBeEnabled();
});

test("fits tabs to the header as it shrinks and grows", async ({ page }) => {
  await page.goto("?tabs=6");
  await expect.poll(() => tabWidth(page)).toBe(192);
  await page.setViewportSize({ width: 1000, height: 800 });
  await expect.poll(() => tabWidth(page)).toBeLessThan(192);
  expect(await tabWidth(page)).toBeGreaterThan(128);
  await expect(scrollButtons(page)).toHaveCount(0);
  await page.setViewportSize({ width: 1400, height: 800 });
  await expect.poll(() => tabWidth(page)).toBe(192);
});

test("dragging a tab shows an inert ghost and reorders", async ({ page }) => {
  await page.goto("?tabs=3");
  const box = (await tab(page, "Overview 0").boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 1.6, box.y + box.height / 2, {
    steps: 10,
  });
  await expect(page.locator("[data-dragged-tab]")).toHaveJSProperty(
    "inert",
    true,
  );
  await page.mouse.up();
  await expect(page.getByRole("tab")).toHaveText([
    "Notes 1",
    "Overview 0",
    "Settings 2",
  ]);
});

test("os styles win over the app's Tailwind 3 preflight and follow its theme", async ({
  page,
}) => {
  await page.goto("?tabs=3");
  const workspace = page.getByRole("region", { name: "Workspace" });
  await expect(workspace).toHaveCSS("background-color", "rgb(244, 241, 234)");
  await expect(workspace).toHaveCSS("font-family", "Georgia, serif");
  await page.getByRole("button", { name: "Close Notes 1" }).click();
  await expect(
    page.getByRole("button", { name: "Discard and close" }),
  ).toHaveCSS("background-color", "rgb(255, 240, 241)");
  await expect(page.getByRole("button", { name: "Keep tab" })).toHaveCSS(
    "border-top-width",
    "1px",
  );
  await page.keyboard.press("Escape");
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  await page.emulateMedia({ forcedColors: "active" });
  const token = () =>
    page.evaluate(() =>
      getComputedStyle(document.documentElement)
        .getPropertyValue("--lab-background")
        .trim(),
    );
  await expect.poll(token).toBe("Canvas");
  await page.emulateMedia({ forcedColors: "none" });
  await expect.poll(token).toBe("rgb(244, 241, 234)");
});

test("the new-tab menu opens tabs and Escape returns focus to its trigger", async ({
  page,
}) => {
  await page.goto("?tabs=3");
  const trigger = page.getByRole("button", { name: "Open a tab" });
  await trigger.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();

  await trigger.click();
  await page.getByRole("menuitem", { name: "More" }).hover();
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(tab(page, "Settings 3")).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(tab(page, "Settings 3")).toBeFocused();
});

test("the tab context menu acts on a tab and Escape returns focus to it", async ({
  page,
}) => {
  await page.goto("?tabs=3");
  await tab(page, "Overview 0").click({ button: "right" });
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(tab(page, "Overview 0")).toBeFocused();

  await tab(page, "Overview 0").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Move right" }).click();
  await expect(page.getByRole("tab")).toHaveText([
    "Notes 1",
    "Overview 0",
    "Settings 2",
  ]);
  await expect(tab(page, "Overview 0")).toBeFocused();
});

test("closing an unsaved tab asks first and Escape keeps it", async ({
  page,
}) => {
  await page.goto("?tabs=3");
  await page.getByRole("button", { name: "Close Notes 1" }).click();
  const dialog = page.getByRole("alertdialog", {
    name: "Discard changes in Notes 1?",
  });
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(tab(page, "Notes 1")).toBeFocused();

  await tab(page, "Notes 1").press("Delete");
  await dialog.getByRole("button", { name: "Discard and close" }).click();
  await expect(tab(page, "Notes 1")).toHaveCount(0);
});

test("the app's own Radix menu and dialog still close with Escape", async ({
  page,
}) => {
  await page.goto("?tabs=3");
  const menu = page.getByRole("button", { name: "App", exact: true });
  await menu.click();
  await expect(page.getByRole("menu")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(menu).toBeFocused();

  const about = page.getByRole("button", { name: "About", exact: true });
  await about.click();
  await expect(page.getByRole("dialog", { name: "About" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(about).toBeFocused();
});

test("settles while a transition is pending", async ({ page }) => {
  await page.goto("?tabs=3&transition");
  const status = page.locator("[data-pending]");
  await page.getByRole("button", { name: "Open a tab" }).click();
  await page.getByRole("menuitem", { name: "Report" }).click();
  await expect(status).toHaveAttribute("data-pending", "true");

  await tab(page, "Notes 1").click();
  await page.setViewportSize({ width: 900, height: 800 });
  await page.waitForTimeout(500);
  const before = await commits(page);
  await page.waitForTimeout(1000);
  expect(await commits(page)).toBe(before);
  await expect(status).toHaveAttribute("data-pending", "true");

  await page.evaluate(() => window.lab.resolveReport());
  await expect(status).toHaveAttribute("data-pending", "false");
  await expect(tab(page, "Notes 1")).toHaveAttribute("aria-selected", "true");
  await tab(page, "Report 3").click();
  await expect(page.getByText("Report ready")).toBeVisible();
});

test("keeps rendering while the app re-renders during a pending transition", async ({
  page,
}) => {
  await page.goto("?tabs=3&transition&ticks");
  const status = page.locator("[data-pending]");
  await page.getByRole("button", { name: "Open a tab" }).click();
  await page.getByRole("menuitem", { name: "Report" }).click();
  await expect(status).toHaveAttribute("data-pending", "true");
  const ticks = () => status.getAttribute("data-ticks").then(Number);
  const start = await ticks();
  await expect.poll(ticks).toBeGreaterThan(start + 20);
  await page.evaluate(() => window.lab.resolveReport());
  await expect(status).toHaveAttribute("data-pending", "false");
  await expect(page.getByText("Report ready")).toBeVisible();
});
