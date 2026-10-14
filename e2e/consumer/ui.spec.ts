import { expect, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("?page=ui");
  await expect(page.getByRole("heading", { name: "Admin" })).toBeVisible();
});

test("ui styles its own elements only and follows the app's tokens", async ({
  page,
}) => {
  const save = page.getByRole("button", { name: "Save" });
  await expect(save).toHaveCSS("background-color", "rgb(120, 40, 160)");
  await expect(save).toHaveCSS("height", "36px");
  await expect(page.getByRole("button", { name: "Compact" })).toHaveCSS(
    "height",
    "32px",
  );
  await expect(page.getByRole("textbox", { name: "Name" })).toHaveCSS(
    "border-top-width",
    "1px",
  );
  await expect(page.getByRole("heading", { name: "Host heading" })).toHaveCSS(
    "font-size",
    "20px",
  );
  const host = page.getByRole("button", { name: "Host button" });
  await expect(host).toHaveCSS("padding-top", "16px");
  await expect(host).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
});

test("the select picks an option and Escape returns focus to it", async ({
  page,
}) => {
  const select = page.getByRole("combobox", { name: "Plugin" });
  await select.click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("listbox")).toHaveCount(0);
  await expect(select).toBeFocused();
  await select.click();
  await page.getByRole("option", { name: "LiveKit" }).click();
  await expect(select).toHaveText("LiveKit");
});

test("the confirm dialog closes with Escape and confirms with its action", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "Delete" });
  await trigger.click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
  await trigger.click();
  await dialog.getByRole("button", { name: "Delete" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page.getByText("Deleted")).toBeVisible();
});

test("the menu opens from the app's trigger and Escape returns focus", async ({
  page,
}) => {
  const trigger = page.getByRole("button", { name: "More" });
  await trigger.click();
  await expect(page.getByRole("menuitem", { name: "Archive" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("the checkbox, switch, tabs and table respond to input", async ({
  page,
}) => {
  const checkbox = page.getByRole("checkbox", { name: "Enabled" });
  await checkbox.click();
  await expect(checkbox).toHaveAttribute("data-state", "checked");
  await expect(checkbox).toHaveCSS("background-color", "rgb(120, 40, 160)");
  const toggle = page.getByRole("switch", { name: "Notify" });
  await toggle.click();
  await expect(toggle).toHaveAttribute("data-state", "checked");
  await page.getByRole("tab", { name: "Log" }).click();
  await expect(page.getByText("Nothing logged yet.")).toBeVisible();
  await page.getByRole("tab", { name: "Rooms" }).click();
  const table = page.getByRole("table", { name: "Rooms" });
  await table.getByRole("button", { name: "Size" }).click();
  await expect(table.getByRole("row").nth(1)).toContainText("beta");
});
