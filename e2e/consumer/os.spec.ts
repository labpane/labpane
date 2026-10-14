import { expect, test } from "./fixtures";

test("os alone loads no Radix or ui styles and asks the browser before closing unsaved work", async ({
  page,
}, info) => {
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const prompts: string[] = [];
  let accept = false;
  page.on("dialog", (dialog) => {
    prompts.push(dialog.message());
    void (accept ? dialog.accept() : dialog.dismiss());
  });
  await page.goto("?page=os&tabs=3");
  const tab = (name: string) => page.getByRole("tab", { name, exact: true });
  await expect(page.getByRole("tab")).toHaveCount(3);
  await expect(page.getByRole("region", { name: "Workspace" })).toHaveCSS(
    "background-color",
    "rgb(244, 241, 234)",
  );
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue(
        "--labui-background",
      ),
    ),
  ).toBe("");

  await tab("Overview 0").click({ button: "right" });
  await expect(page.getByRole("menu")).toHaveCount(0);

  await page.getByRole("button", { name: "Close Notes 1" }).click();
  await expect.poll(() => prompts).toEqual(["Discard changes in Notes 1?"]);
  await expect(tab("Notes 1")).toBeFocused();

  accept = true;
  await tab("Notes 1").press("Delete");
  await expect(tab("Notes 1")).toHaveCount(0);
  expect(prompts).toHaveLength(2);

  if (info.project.name !== "dev") return;
  const ui = () =>
    requests.filter((url) => /radix|labpane_ui|@labpane\/ui/.test(url));
  expect(ui()).toEqual([]);
  await page.goto("?tabs=3");
  await expect(page.getByRole("button", { name: "Open a tab" })).toBeVisible();
  expect(ui()).not.toEqual([]);
});
