import { expect, test } from "./fixtures";

test.skip(process.platform !== "win32", "Windows Chromium paint baselines");

// Paint regressions: DOM bounds alone cannot detect a pane outline clipped by
// an ancestor. Crop the quiet pane edge, including the entire reserved area,
// rather than recording text/font-dependent screenshots of the whole app.
for (const scale of [1, 1.25]) {
  test.describe(`pane outlines at ${scale}x`, () => {
    test.use({
      deviceScaleFactor: scale,
      viewport: { width: 1000, height: 600 },
    });
    for (const side of ["right", "left", "toolbar"] as const) {
      test(`${side} clipping preserves the full pane border`, async ({
        page,
      }) => {
        if (side !== "toolbar") {
          await page.addInitScript((side) => {
            Object.defineProperty(navigator, "windowControlsOverlay", {
              value: Object.assign(new EventTarget(), {
                visible: true,
                getTitlebarAreaRect: () =>
                  new DOMRect(
                    side === "left" ? 88 : 0,
                    0,
                    innerWidth - (side === "left" ? 88 : 180),
                    32,
                  ),
              }),
            });
          }, side);
        }
        await page.goto(`?page=pwa${side === "toolbar" ? "&no-overlay" : ""}`);
        if (side === "toolbar")
          await page.addStyleTag({
            content: ".lab-toolbar { overflow: clip; }",
          });
        await expect(page.getByRole("tab")).toHaveCount(3);
        await expect(page.locator(".lab-pane-frame")).toHaveCSS(
          "visibility",
          "visible",
        );
        const clip = () => ({
          x: side === "left" ? 0 : page.viewportSize()!.width - 220,
          y: 40,
          width: side === "left" ? 128 : 220,
          height: page.viewportSize()!.height - 40,
        });
        const edge = side === "left" ? "left" : "right";
        await expect(page).toHaveScreenshot(`${edge}-pane.png`, {
          clip: clip(),
          animations: "disabled",
          scale: "css",
        });

        // The same border must survive selection, docking, and resizing.
        await page
          .getByRole("tab", { name: "Settings 2", exact: true })
          .focus();
        await page.keyboard.press("Alt+Shift+ArrowRight");
        await expect(page.getByRole("tabpanel")).toHaveCount(2);
        await page.setViewportSize({ width: 1100, height: 640 });
        await page.mouse.move(700, 500);
        await expect(page).toHaveScreenshot(`${edge}-split.png`, {
          clip: clip(),
          animations: "disabled",
          scale: "css",
        });
      });
    }
  });
}
