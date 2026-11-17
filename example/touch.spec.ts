import { expect, test, type Page } from "@playwright/test";

type Point = { x: number; y: number };
async function gesture(
  page: Page,
  from: Point,
  to: Point,
  options: {
    hold?: number;
    cancel?: boolean;
    fingers?: number;
    interrupt?: boolean;
  } = {},
) {
  const session = await page.context().newCDPSession(page);
  const points = (point: Point) =>
    Array.from({ length: options.fingers ?? 1 }, (_, id) => ({
      ...point,
      x: point.x + id * 32,
      id,
      radiusX: 8,
      radiusY: 8,
    }));
  try {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: points(from),
    });
    if (options.hold) await page.waitForTimeout(options.hold);
    for (let step = 1; step <= 12; step++) {
      const point = {
        x: from.x + ((to.x - from.x) * step) / 12,
        y: from.y + ((to.y - from.y) * step) / 12,
      };
      // A second finger outside the original target must cancel the gesture,
      // even if it lifts again without moving.
      if (options.interrupt && step === 9) {
        await session.send("Input.dispatchTouchEvent", {
          type: "touchStart",
          touchPoints: [
            ...points(point),
            { x: point.x, y: point.y + 80, id: 1, radiusX: 8, radiusY: 8 },
          ],
        });
        await session.send("Input.dispatchTouchEvent", {
          type: "touchEnd",
          touchPoints: points(point),
        });
      }
      await session.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: points(point),
      });
      await page.waitForTimeout(20);
    }
    await session.send("Input.dispatchTouchEvent", {
      type: options.cancel ? "touchCancel" : "touchEnd",
      touchPoints: [],
    });
  } finally {
    await session.detach();
  }
}

test("a held tab reorders by touch without sliding back or losing selection", async ({
  page,
  isMobile,
}) => {
  await page.goto(isMobile ? "./" : "desktop/");
  const welcome = page.getByRole("tab", { name: "Welcome", exact: true });
  await expect(welcome).toBeVisible();
  const owner = welcome.locator("xpath=ancestor::*[@data-pane-header]");
  await welcome.scrollIntoViewIfNeeded();
  const first = (await welcome.boundingBox())!;
  const next = (await owner.getByRole("tab").nth(1).boundingBox())!;
  const from = { x: first.x + first.width / 2, y: first.y + first.height / 2 };
  await gesture(
    page,
    from,
    { x: next.x + next.width / 2, y: from.y },
    { hold: 400 },
  );
  await expect(owner.getByRole("tab").nth(1)).toHaveText("Welcome");
  await expect(welcome).toHaveAttribute("aria-selected", "true");
  await expect(page.locator(".lab-ghost")).toHaveCount(0);
  await expect(page.getByRole("menu")).toHaveCount(0);
  const committed = await owner.getByRole("tab").allTextContents();
  const moved = (await welcome.boundingBox())!;
  const back = { x: moved.x + moved.width / 2, y: moved.y + moved.height / 2 };
  for (const options of [{ cancel: true }, { interrupt: true }]) {
    await gesture(
      page,
      back,
      { x: back.x - Math.min(80, moved.width), y: back.y },
      { hold: 400, ...options },
    );
    await expect(owner.getByRole("tab")).toHaveText(committed);
    await expect(page.locator(".lab-ghost")).toHaveCount(0);
  }
});

test("a held tab docks into another pane by touch", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Docking needs space for split panes");
  await page.goto("desktop/");
  const draft = page.getByRole("tab", { name: "Draft", exact: true });
  const tab = (await draft.boundingBox())!;
  const right = (await page
    .getByRole("tabpanel", { name: "Layout", exact: true })
    .boundingBox())!;
  await gesture(
    page,
    { x: tab.x + tab.width / 2, y: tab.y + tab.height / 2 },
    { x: right.x + right.width / 2, y: right.y + right.height - 30 },
    { hold: 400 },
  );
  await expect(page.locator(".lab-divider")).toHaveCount(2);
  await expect(
    page.getByRole("tabpanel", { name: "Draft", exact: true }),
  ).not.toHaveAttribute("data-pane-sheet", "left");
  await expect(page.locator(".lab-ghost")).toHaveCount(0);
});

test("both divider orientations resize from the edge of their touch targets and cancel cleanly", async ({
  page,
  isMobile,
}) => {
  test.skip(isMobile, "Both split orientations need desktop space");
  await page.goto("desktop/");
  await page.getByRole("tab", { name: "Draft", exact: true }).focus();
  await page.keyboard.press("Alt+Shift+ArrowDown");
  for (const orientation of ["vertical", "horizontal"]) {
    const divider = page.locator(
      `.lab-divider[aria-orientation="${orientation}"]`,
    );
    await expect(divider).toHaveCount(1);
    const box = (await divider.boundingBox())!;
    const vertical = orientation === "vertical";
    expect(vertical ? box.width : box.height).toBeGreaterThanOrEqual(44);
    const from = {
      x: box.x + (vertical ? 3 : box.width / 2),
      y: box.y + (vertical ? box.height / 2 : 3),
    };
    const before = Number(await divider.getAttribute("aria-valuenow"));
    await gesture(page, from, {
      x: from.x + (vertical ? 65 : 0),
      y: from.y + (vertical ? 0 : 55),
    });
    await expect
      .poll(async () => Number(await divider.getAttribute("aria-valuenow")))
      .toBeGreaterThan(before + 2);
    const committed = await divider.getAttribute("aria-valuenow");
    const moved = (await divider.boundingBox())!;
    const center = {
      x: moved.x + moved.width / 2,
      y: moved.y + moved.height / 2,
    };
    await gesture(
      page,
      center,
      { x: center.x - (vertical ? 60 : 0), y: center.y - (vertical ? 0 : 50) },
      { cancel: true },
    );
    await expect(divider).toHaveAttribute("aria-valuenow", committed!);
  }
});

test("swiping switches neighboring tabs and Back preserves an open draft", async ({
  page,
  isMobile,
}) => {
  await page.goto(isMobile ? "./" : "desktop/");
  await page.getByRole("tab", { name: "Draft", exact: true }).tap();
  await page
    .getByRole("textbox", { name: "Title", exact: true })
    .fill("Keep my touch draft");
  const panel = page.getByRole("tabpanel", { name: "Draft", exact: true });
  const paragraph = panel.locator(".demo-text").first();
  await paragraph.scrollIntoViewIfNeeded();
  const box = (await paragraph.boundingBox())!;
  const from = { x: box.x + box.width * 0.65, y: box.y + box.height / 2 };
  await gesture(page, from, { x: from.x - 120, y: from.y });
  await expect(
    page.getByRole("tab", { name: "Keyboard", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page
    .getByRole("tabpanel", { name: "Keyboard", exact: true })
    .getByRole("button", { name: "Back to previous view" })
    .tap();
  await expect(
    page.getByRole("textbox", { name: "Title", exact: true }),
  ).toHaveValue("Keep my touch draft");
  await expect(
    page.getByRole("tab", { name: "Draft", exact: true }),
  ).toBeFocused();
  await panel.getByRole("button", { name: "Back to previous view" }).tap();
  await expect(
    page.getByRole("tab", { name: "Welcome", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(
    page.getByRole("tab", { name: "Draft", exact: true }),
  ).toHaveCount(1);
  await page.getByRole("tab", { name: "Draft", exact: true }).tap();
  await expect(
    page.getByRole("textbox", { name: "Title", exact: true }),
  ).toHaveValue("Keep my touch draft");
});

test("vertical scrolling, form gestures, multiple fingers, and cancellations do not switch tabs", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 420 });
  await page.goto("desktop/");
  await page.getByRole("tab", { name: "Keyboard", exact: true }).tap();
  const panel = page.getByRole("tabpanel", { name: "Keyboard", exact: true });
  const box = (await panel.boundingBox())!;
  const from = { x: box.x + box.width * 0.6, y: box.y + box.height - 35 };
  await gesture(page, from, { x: from.x, y: box.y + 50 });
  await expect
    .poll(() => panel.evaluate((node) => node.scrollTop))
    .toBeGreaterThan(20);
  await expect(
    page.getByRole("tab", { name: "Keyboard", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
  await page.getByRole("tab", { name: "Draft", exact: true }).tap();
  const input = page.getByRole("textbox", { name: "Title", exact: true });
  const field = (await input.boundingBox())!;
  await gesture(
    page,
    { x: field.x + field.width * 0.7, y: field.y + field.height / 2 },
    { x: field.x + 20, y: field.y + field.height / 2 },
  );
  const draft = page.getByRole("tabpanel", { name: "Draft", exact: true });
  const paragraph = draft.locator(".demo-text").first();
  await paragraph.scrollIntoViewIfNeeded();
  const draftBox = (await paragraph.boundingBox())!;
  const start = {
    x: draftBox.x + draftBox.width * 0.65,
    y: draftBox.y + draftBox.height / 2,
  };
  for (const options of [{ fingers: 2 }, { cancel: true }, { interrupt: true }])
    await gesture(page, start, { x: start.x - 120, y: start.y }, options);
  await expect(
    page.getByRole("tab", { name: "Draft", exact: true }),
  ).toHaveAttribute("aria-selected", "true");
});
