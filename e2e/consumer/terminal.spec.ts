import { expect, test } from "./fixtures";

test("ui's terminal runs just-bash on the Ghostty core in a Vite app", async ({
  page,
}) => {
  const wasm = page.waitForResponse((response) =>
    /ghostty-vt.*\.wasm$/.test(new URL(response.url()).pathname),
  );
  await page.goto("?page=terminal");
  expect((await wasm).status()).toBe(200);
  const screen = page.locator(".wterm");
  await expect(screen).toContainText("Fixture shell");
  await expect(page.getByRole("status")).toHaveText("Connected");

  await screen.click();
  await page.keyboard.type("cat hello.txt");
  await page.keyboard.press("Enter");
  await expect(screen).toContainText("hello from just-bash");

  const monokai = page.getByRole("button", { name: "Monokai", exact: true });
  await monokai.click();
  await expect(screen).toHaveCSS("background-color", "rgb(39, 40, 34)");

  const full = page.getByRole("button", { name: "Full screen", exact: true });
  const frame = page.locator('[data-slot="terminal"]');
  await full.click();
  await expect
    .poll(() => frame.evaluate((el) => el.matches(":popover-open")))
    .toBe(true);
  await page.keyboard.type("echo still here");
  await page.keyboard.press("Enter");
  await expect(screen).toContainText("still here");
  await full.click();
  await expect
    .poll(() => frame.evaluate((el) => el.matches(":popover-open")))
    .toBe(false);
});
