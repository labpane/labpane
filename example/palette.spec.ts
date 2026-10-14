import { readdirSync, readFileSync } from "node:fs";
import { test as base, expect, type Page } from "@playwright/test";
import * as ui from "@labpane/ui";

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

const frame = (page: Page, table: string) =>
  page.locator("[data-slot=table-frame]", {
    has: page.getByRole("table", { name: table, exact: true }),
  });

const palette = new URL("./src/palette/", import.meta.url);
const componentTypes = new Set([
  Symbol.for("react.forward_ref"),
  Symbol.for("react.memo"),
]);
const isComponent = (value: unknown) =>
  typeof value === "function" ||
  (typeof value === "object" &&
    value !== null &&
    componentTypes.has((value as { $$typeof?: symbol }).$$typeof as symbol));

base("the palette shows every component that @labpane/ui exports", () => {
  const source = readdirSync(palette)
    .filter((name) => /\.tsx?$/.test(name))
    .map((name) => readFileSync(new URL(name, palette), "utf8"))
    .join("\n");
  const components = Object.entries(ui)
    .filter(([name, value]) => /^[A-Z][a-z]/.test(name) && isComponent(value))
    .map(([name]) => name);
  expect(components.length).toBeGreaterThan(100);
  const missing = components.filter(
    (name) => !new RegExp(`<${name}[\\s/>]`).test(source),
  );
  expect(
    missing,
    "Components exported by @labpane/ui but missing from the palette",
  ).toEqual([]);
});

test("the palette shows every section and its overlays work", async ({
  page,
}) => {
  await page.goto("palette/");
  await expect(page.locator(".palette-section > h2")).toHaveCount(48);
  await expect(page.locator(".palette-toc a")).toHaveCount(48);
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

test("the palette's theme, sheet, tooltip, command palette, and tables respond", async ({
  page,
}) => {
  await page.goto("palette/");

  const button = page
    .locator("#button")
    .getByRole("button", { name: "Button", exact: true })
    .first();
  await expect(button).toHaveCSS("background-color", "rgb(5, 105, 122)");
  await page.getByRole("combobox", { name: "Theme" }).click();
  await page.getByRole("option", { name: "Crimson" }).click();
  await expect(button).toHaveCSS("background-color", "rgb(159, 18, 57)");

  await page
    .locator("#sheet")
    .getByRole("button", { name: "Right", exact: true })
    .click();
  const sheet = page.getByRole("dialog", { name: "Sample details" });
  await expect(sheet).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();

  await page
    .locator("#tooltip")
    .getByRole("button", { name: "Save", exact: true })
    .hover();
  await expect(page.locator("[data-slot=tooltip-content]")).toHaveText(
    "Save the notebook",
  );

  await page.getByRole("button", { name: "Open the command palette" }).click();
  const commands = page.getByRole("dialog", { name: "Command palette" });
  await commands.getByRole("combobox").fill("inv");
  await expect(
    commands.getByRole("option", { name: "Invoices" }),
  ).toBeVisible();
  await expect(commands.getByRole("option", { name: "Datasets" })).toHaveCount(
    0,
  );
  await page.keyboard.press("Enter");
  await expect(commands).toBeHidden();
  await expect(page.getByText("Chosen: Invoices")).toBeVisible();

  const paged = frame(page, "Samples by page");
  await expect(paged.getByText("1 to 5 of 23")).toBeVisible();
  await paged.getByRole("button", { name: "Next page" }).click();
  await expect(paged.getByText("6 to 10 of 23")).toBeVisible();

  const windowed = frame(page, "Three hundred samples");
  await expect(windowed.getByRole("table")).toHaveAttribute(
    "aria-rowcount",
    "301",
  );
  expect(await windowed.locator("tbody tr[data-key]").count()).toBeLessThan(80);

  const streamed = frame(page, "Samples loading as you scroll");
  await expect(streamed.getByText("30 of 300 loaded")).toBeVisible();
  await streamed
    .locator("[data-slot=table-container]")
    .evaluate((node) => node.scrollTo(0, node.scrollHeight));
  await expect(streamed.getByText("50 of 300 loaded")).toBeVisible();
  expect(await fits(page)).toBe(true);
});
