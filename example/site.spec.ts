import { test as base, expect, type Page } from "@playwright/test";

const test = base.extend<{ quiet: void }>({
  quiet: [
    async ({ page }, use) => {
      const messages: string[] = [];
      page.on("pageerror", (error) => messages.push(`error: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning")
          messages.push(`${message.type()}: ${message.text()}`);
      });
      await use();
      expect(messages, "Browser errors and warnings").toEqual([]);
    },
    { auto: true },
  ],
});

const fits = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth <=
      document.documentElement.clientWidth,
  );

const tab = (page: Page, name: string) =>
  page.getByRole("tab", { name, exact: true });

test("the home page runs a live workspace", async ({ page }, info) => {
  await page.goto("./");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Labpane");
  await expect(page.getByRole("region", { name: "Workspace" })).toBeVisible();
  await expect(page.getByRole("tab")).toHaveCount(5);
  expect(await fits(page)).toBe(true);

  await tab(page, "Keyboard").click();
  await expect(tab(page, "Keyboard")).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("table", { name: "Keyboard shortcuts" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Close Keyboard" }).click();
  await expect(tab(page, "Keyboard")).toHaveCount(0);
  await page.getByRole("button", { name: "Open a tab" }).first().click();
  await page.getByRole("menuitem", { name: "Keyboard" }).click();
  await expect(tab(page, "Keyboard")).toBeFocused();

  await tab(page, "Draft").click();
  await page.getByRole("textbox", { name: "Title" }).fill("Changed");
  await page.getByRole("button", { name: "Close Draft" }).click();
  const discard = page.getByRole("alertdialog", {
    name: "Discard changes in Draft?",
  });
  await discard.getByRole("button", { name: "Keep tab" }).click();
  await expect(tab(page, "Draft")).toHaveCount(1);
  await page.getByRole("button", { name: "Close Draft" }).click();
  await discard.getByRole("button", { name: "Discard and close" }).click();
  await expect(tab(page, "Draft")).toHaveCount(0);

  await page.getByRole("button", { name: "Dark theme" }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await tab(page, "Layout").click();
  await page.getByRole("button", { name: "Reset demo" }).click();
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(tab(page, "Welcome")).toBeFocused();

  if (info.project.name !== "desktop") return;
  const strips = page.locator(".lab-tablist");
  await expect(strips).toHaveCount(2);

  const from = (await tab(page, "Keyboard").boundingBox())!;
  const panels = await page.locator(".lab-panel:not([hidden])").all();
  const boxes = await Promise.all(panels.map((panel) => panel.boundingBox()));
  const into = boxes.reduce((a, b) => (b!.x > a!.x ? b : a))!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  for (let step = 1; step <= 12; step++)
    await page.mouse.move(
      from.x + ((into.x + into.width / 2 - from.x) * step) / 12,
      from.y + ((into.y + into.height / 3 - from.y) * step) / 12,
    );
  await page.mouse.up();
  await expect(
    strips.nth(1).getByRole("tab", { name: "Keyboard" }),
  ).toHaveCount(1);

  await tab(page, "Keyboard").focus();
  await page.keyboard.press("Alt+Shift+ArrowDown");
  await expect(strips).toHaveCount(3);

  await tab(page, "Settings").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Close tab" }).click();
  await expect(tab(page, "Settings")).toHaveCount(0);
});

test("the palette shows every section and its overlays work", async ({
  page,
}) => {
  await page.goto("palette/");
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(18);
  await expect(page.locator(".swatch")).not.toHaveCount(0);
  expect(await fits(page)).toBe(true);

  await page.locator("#select").getByRole("combobox").first().click();
  await page.getByRole("option", { name: "Pear" }).click();
  await expect(
    page.locator("#select").getByRole("combobox").first(),
  ).toHaveText("Pear");

  await page.getByRole("button", { name: "Rename “Layout”" }).click();
  const rename = page.getByRole("dialog", { name: "Rename tab" });
  await expect(rename).toHaveAccessibleDescription(
    "The new name shows on the tab and in its menus.",
  );
  await rename.getByRole("textbox", { name: "Name" }).fill("Notes");
  await rename.getByRole("button", { name: "Rename" }).click();
  await expect(
    page.getByRole("button", { name: "Rename “Notes”" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Delete with typeToConfirm" }).click();
  const confirm = page.getByRole("alertdialog");
  await expect(confirm.getByRole("button", { name: "Delete" })).toBeDisabled();
  await confirm.getByRole("textbox", { name: "Name" }).fill("orion");
  await confirm.getByRole("button", { name: "Delete" }).click();
  await expect(page.getByText("Deleted: orion")).toBeVisible();

  await page.getByRole("button", { name: "New", exact: true }).click();
  await page.getByRole("menuitem", { name: "Folder" }).click();
  await expect(page.getByText("Picked: folder")).toBeVisible();

  await page.getByText("Right-click here").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await expect(page.getByText("Chose: Rename")).toBeVisible();

  const terminal = page.locator("[data-slot=terminal]");
  await expect(terminal).toContainText("Type help");
  await terminal.click();
  await page.keyboard.type("help");
  await page.keyboard.press("Enter");
  await expect(terminal).toContainText("Commands: help, echo");
});
