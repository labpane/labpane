import { test, expect, type Locator, type Page } from "@playwright/test";

test.beforeEach(async ({ isMobile }) => {
  test.skip(!isMobile, "These checks use touch-enabled phone browsers");
});

async function fits(element: Locator) {
  const measurement = await element.evaluate((node) => {
    const overflow = node.scrollWidth - node.clientWidth;
    const edge = node.getBoundingClientRect().right;
    return {
      overflow,
      element: node.tagName,
      width: node.clientWidth,
      font: getComputedStyle(node).font,
      overflowing:
        overflow > 1
          ? [...node.querySelectorAll<HTMLElement>("*")]
              .filter((child) => {
                if (child.getBoundingClientRect().right <= edge + 1)
                  return false;
                for (
                  let parent = child.parentElement;
                  parent && parent !== node;
                  parent = parent.parentElement
                ) {
                  if (getComputedStyle(parent).overflowX !== "visible")
                    return false;
                }
                return true;
              })
              .map((child) => ({
                tag: child.tagName,
                section: child.closest("section")?.id,
                class:
                  typeof child.className === "string" ? child.className : "svg",
                text: child.children.length
                  ? undefined
                  : child.textContent?.slice(0, 80),
                right: child.getBoundingClientRect().right,
              }))
          : [],
    };
  });
  expect(measurement.overflow, JSON.stringify(measurement)).toBeLessThanOrEqual(
    1,
  );
}
async function contained(control: Locator, container: Locator) {
  const outer = (await container.boundingBox())!;
  const inner = (await control.boundingBox())!;
  expect(inner.x).toBeGreaterThanOrEqual(outer.x);
  expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width);
}

async function swipe(
  page: Page,
  from: { x: number; y: number },
  to: { x: number; y: number },
) {
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [from],
  });
  for (let step = 1; step <= 12; step++) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [
        {
          x: from.x + ((to.x - from.x) * step) / 12,
          y: from.y + ((to.y - from.y) * step) / 12,
        },
      ],
    });
    await page.waitForTimeout(20);
  }
  // Pause the finger before lifting, so this tests a swipe without a fling.
  await page.waitForTimeout(200);
  await session.send("Input.dispatchTouchEvent", {
    type: "touchEnd",
    touchPoints: [],
  });
  await session.detach();
}

test("all tabs can be selected by touch without losing draft state", async ({
  page,
}) => {
  await page.goto("./");
  await expect(page.locator(".site-nav-section").first()).toBeHidden();
  await expect(page.locator(".pointer-help")).toBeHidden();
  await expect(page.locator(".touch-help")).toBeVisible();
  const picker = page.getByRole("combobox", { name: "Switch tab" });
  await expect(picker).toBeVisible();
  await expect(picker.locator("option")).toHaveCount(5);
  await picker.selectOption("draft");
  const title = page.getByRole("textbox", { name: "Title" });
  await title.fill("A mobile draft");
  await picker.selectOption("settings");
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true }),
  ).toBeVisible();
  await picker.selectOption("draft");
  await expect(title).toHaveValue("A mobile draft");
  await fits(page.getByRole("tabpanel", { name: "Draft", exact: true }));
  await page.getByRole("button", { name: "Close Draft", exact: true }).tap();
  const discard = page.getByRole("alertdialog");
  await discard.getByRole("button", { name: "Keep tab" }).tap();
  await expect(title).toHaveValue("A mobile draft");
  await page.getByRole("button", { name: "Open a tab" }).tap();
  await page.getByRole("menuitem", { name: "Welcome", exact: true }).tap();
  await expect(
    page.getByRole("tab", { name: "Welcome 2", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});

test("swiping tabs scrolls without selecting or dragging; tapping still selects", async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName !== "chromium",
    "CDP provides native swipe input in Chromium",
  );
  await page.goto("./");
  const strip = page.getByRole("tablist");
  await strip.scrollIntoViewIfNeeded();
  const box = (await strip.boundingBox())!;
  const selected = page.getByRole("tab", { selected: true });
  await expect(selected).toHaveText("Welcome");
  await swipe(
    page,
    { x: box.x + box.width - 12, y: box.y + box.height / 2 },
    { x: box.x + 12, y: box.y + box.height / 2 },
  );
  await expect
    .poll(() => strip.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(50);
  await expect(selected).toHaveText("Welcome");
  await expect(page.locator(".lab-ghost")).toHaveCount(0);
  // A tap during native momentum stops scrolling instead of activating a link.
  await strip.evaluate(
    (node) =>
      new Promise<void>((resolve) => {
        let previous = node.scrollLeft;
        let stable = 0;
        const frame = () => {
          stable = Math.abs(node.scrollLeft - previous) < 0.5 ? stable + 1 : 0;
          previous = node.scrollLeft;
          if (stable >= 8) resolve();
          else requestAnimationFrame(frame);
        };
        requestAnimationFrame(frame);
      }),
  );
  await page.getByRole("tab", { name: "Keyboard", exact: true }).tap();
  await expect(selected).toHaveText("Keyboard");
});

test("palette preserves the entry point and supports section history", async ({
  page,
}) => {
  await page.goto("palette/");
  await expect(
    page.getByRole("heading", { name: "Palette", exact: true }),
  ).toBeInViewport();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  const picker = page.getByRole("combobox", { name: "Sections", exact: true });
  await picker.selectOption("settings");
  await expect(page).toHaveURL(/#settings$/);
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true, level: 2 }),
  ).toBeInViewport();
  await expect(picker).toHaveValue("settings");
  await picker.selectOption("side-panel");
  await expect(
    page.getByRole("heading", { name: "SidePanel", exact: true }),
  ).toBeInViewport();
  await expect(picker).toHaveValue("side-panel");
  await page.goBack();
  await expect(page).toHaveURL(/#settings$/);
  await expect(
    page.getByRole("heading", { name: "Settings", exact: true, level: 2 }),
  ).toBeInViewport();
  await expect(picker).toHaveValue("settings");
  await page.goto("palette/#button");
  await expect(
    page.getByRole("heading", { name: "Button", exact: true }),
  ).toBeInViewport();
  await expect(picker).toBeInViewport();
  await expect(picker).toHaveValue("button");
});

test("phone layouts keep controls inside the visible content, including at 320px", async ({
  page,
}) => {
  for (const width of [402, 320]) {
    await page.setViewportSize({ width, height: 874 });
    await page.goto("palette/#rail");
    const rail = page.locator("#rail .layout-frame");
    await contained(rail.getByRole("button", { name: "Book time" }), rail);
    await fits(rail.locator('[data-slot="topbar"]'));
    await page
      .getByRole("combobox", { name: "Sections", exact: true })
      .selectOption("side-panel");
    const frame = page.locator("#side-panel .layout-frame");
    const toggle = frame.getByRole("button", { name: "Close details" });
    await contained(toggle, frame);
    await toggle.tap();
    await frame.getByRole("button", { name: "Open details" }).tap();
    await expect(frame.getByRole("heading", { name: "Run 043" })).toBeVisible();
    await fits(frame);
    await fits(page.locator("html"));
    await fits(page.locator(".site-header-row"));
    await contained(
      page.getByRole("button", { name: "Dark theme" }),
      page.locator(".site-header-row"),
    );
    await page.goto("./");
    await fits(page.locator("html"));
    await fits(page.locator(".site-header-row"));
    await contained(
      page.getByRole("button", { name: "Dark theme" }),
      page.locator(".site-header-row"),
    );
    await fits(page.getByRole("tabpanel", { name: "Welcome", exact: true }));
    const picker = page.getByRole("combobox", { name: "Switch tab" });
    for (const name of ["layout", "draft", "keyboard", "settings"]) {
      await picker.selectOption(name);
      await fits(page.getByRole("tabpanel"));
    }
  }
});

test("inline commands still support keyboard selection after starting unselected", async ({
  page,
}) => {
  await page.goto("palette/#command");
  const input = page.getByRole("combobox", {
    name: "Search pages and actions",
  });
  await input.fill("Invoices");
  await expect(input).toHaveValue("Invoices");
  await expect(
    page
      .locator("#command")
      .getByRole("option", { name: "Invoices", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await input.press("Enter");
  await expect(page.locator("#command")).toContainText("Chosen: Invoices");
});
