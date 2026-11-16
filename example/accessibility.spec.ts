import { fileURLToPath } from "node:url";
import { expect, test } from "@playwright/test";
import type axe from "axe-core";

for (const colorScheme of ["light", "dark"] as const) {
  for (const path of ["./", "palette/", "desktop/"]) {
    test(`${path} meets accessibility rules in ${colorScheme}`, async ({
      page,
    }) => {
      await page.emulateMedia({ colorScheme });
      await page.goto(path);
      await expect(page.getByRole("heading").first()).toBeVisible();
      await page.addScriptTag({
        path: fileURLToPath(import.meta.resolve("axe-core/axe.min.js")),
      });
      const violations = await page.evaluate(async () => {
        const engine = (window as unknown as { axe: typeof axe }).axe;
        const result = await engine.run({
          runOnly: {
            type: "tag",
            values: [
              "wcag2a",
              "wcag2aa",
              "wcag21a",
              "wcag21aa",
              "wcag22aa",
              "best-practice",
            ],
          },
        });
        return result.violations.map(({ id, nodes }) => ({
          id,
          nodes: nodes.map(({ target, failureSummary }) => ({
            target,
            failureSummary,
          })),
        }));
      });
      expect(violations).toEqual([]);
    });
  }
}

test("workspace tabs own only tabs, and closing still works with the keyboard", async ({
  page,
}) => {
  await page.goto("./");
  const welcome = page.getByRole("tab", { name: "Welcome", exact: true });
  await expect(welcome).toBeVisible();
  const session = await page.context().newCDPSession(page);
  const tree = await session.send("Accessibility.getFullAXTree");
  const nodes = new Map(tree.nodes.map((node) => [node.nodeId, node]));
  const lists = tree.nodes.filter((node) => node.role?.value === "tablist");
  expect(lists.length).toBeGreaterThan(0);
  for (const list of lists) {
    const children = list.childIds?.map((id) => nodes.get(id)?.role?.value);
    expect(children?.length).toBeGreaterThan(0);
    expect(children?.every((role) => role === "tab")).toBe(true);
  }
  expect(
    tree.nodes.some(
      (node) =>
        node.role?.value === "button" && node.name?.value === "Close Welcome",
    ),
  ).toBe(true);
  await session.detach();
  await welcome.focus();
  await welcome.press("ArrowRight");
  const selected = page.locator('[role="tab"]:focus');
  await expect(selected).toHaveAttribute("aria-selected", "true");
  const name = await selected.innerText();
  await selected.press("Delete");
  await expect(page.getByRole("tab", { name, exact: true })).toHaveCount(0);
  await expect(page.locator('[role="tab"]:focus')).toHaveAttribute(
    "aria-selected",
    "true",
  );
});

test("short timing spans have separate touch targets and preserve their duration", async ({
  page,
}) => {
  await page.goto("palette/#timing-tracks");
  const chart = page.locator('[data-slot="timing-tracks"]');
  const targets = await chart.getByRole("button").all();
  const boxes = [];
  for (const target of targets) {
    const box = await target.boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(24);
    expect(box!.height).toBeGreaterThanOrEqual(24);
    boxes.push(box!);
  }
  for (const [index, box] of boxes.entries()) {
    for (const other of boxes.slice(index + 1)) {
      const overlaps =
        box.x < other.x + other.width &&
        box.x + box.width > other.x &&
        box.y < other.y + other.height &&
        box.y + box.height > other.y;
      expect(overlaps).toBe(false);
    }
  }
  const dispatch = chart.getByRole("button", {
    name: "Dispatch, 120 to 160 ms",
    exact: true,
  });
  await dispatch.click();
  await expect(chart.locator('[aria-live="polite"]')).toContainText(
    "Dispatch, 40 ms",
  );
});
