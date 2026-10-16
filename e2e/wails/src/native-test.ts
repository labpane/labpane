// Fixture-only smoke checks. Buttons invoke the same handlers a user does;
// assertions read the real window state from the host, not a mock call log.
type TestWindow = Window & {
  runtime: {
    WindowIsMaximised: () => Promise<boolean>;
    WindowIsMinimised: () => Promise<boolean>;
    WindowIsFullscreen: () => Promise<boolean>;
    WindowUnminimise: () => void;
    Quit: () => void;
  };
  go: {
    main: {
      Desktop: {
        WindowOptions: () => Promise<{ frame: string }>;
        ReportTest: (failure: string) => Promise<void>;
      };
    };
  };
};
const bridge = window as unknown as TestWindow;
const wait = (ms: number) => new Promise((done) => setTimeout(done, ms));
function assert(value: unknown, message: string): asserts value {
  if (!value) throw new Error(message);
}
async function until(check: () => boolean | Promise<boolean>, message: string) {
  const end = Date.now() + 5000;
  do {
    if (await check()) return;
    await wait(50);
  } while (Date.now() < end);
  throw new Error(message);
}
const controls = () => document.querySelectorAll(".lab-window-button");
function click(label: string) {
  const button = document.querySelector<HTMLButtonElement>(
    `.lab-window-button[aria-label="${label}"]`,
  );
  assert(button, `Missing ${label} button`);
  button.click();
}

export async function runNativeTest() {
  const api = bridge.runtime;
  const desktop = bridge.go.main.Desktop;
  try {
    await until(
      () => !!document.querySelector(".brand"),
      "React did not render",
    );
    // Allow React effects to attach window keyboard and double-click listeners.
    await wait(100);
    const { frame } = await desktop.WindowOptions();
    const settings =
      document.querySelector<HTMLElement>(
        '[role="tab"][data-key="settings"]',
      ) ??
      [...document.querySelectorAll<HTMLElement>('[role="tab"]')].find((el) =>
        el.textContent?.includes("Settings"),
      );
    assert(settings, "Missing settings tab");
    settings.click();
    await until(
      () =>
        [...document.querySelectorAll("h1,h2")].some(
          (el) =>
            el.textContent === "Settings" &&
            el.getBoundingClientRect().height > 0,
        ),
      "Tab selection failed",
    );
    const brand = document.querySelector<HTMLElement>(".brand")!;
    assert(
      !document.querySelector("[data-window-controls-overlay]"),
      "Wails must not enable PWA overlay spacing or drag regions",
    );
    if (frame === "custom") {
      assert(controls().length === 3, "Expected three caption buttons");
      assert(
        getComputedStyle(brand).getPropertyValue("--wails-draggable").trim() ===
          "drag",
        "Title bar must be draggable",
      );
      assert(
        getComputedStyle(settings)
          .getPropertyValue("--wails-draggable")
          .trim() === "no-drag",
        "Tabs must not drag the window",
      );
      const close = document
        .querySelector<HTMLElement>('.lab-window-button[aria-label="Close"]')!
        .getBoundingClientRect();
      assert(
        Math.abs(close.right - innerWidth) <= 1 && close.top === 0,
        "Caption controls must reach the window corner",
      );
      click("Maximize");
      await until(() => api.WindowIsMaximised(), "Window did not maximize");
      await until(
        () => !!document.querySelector('[aria-label="Restore"]'),
        "Caption did not update to Restore",
      );
      click("Restore");
      await until(
        async () => !(await api.WindowIsMaximised()),
        "Window did not restore",
      );
      brand.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      await until(
        () => api.WindowIsMaximised(),
        "Title bar double click did not maximize",
      );
      brand.dispatchEvent(new MouseEvent("dblclick", { bubbles: true }));
      await until(
        async () => !(await api.WindowIsMaximised()),
        "Title bar double click did not restore",
      );
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "F11" }));
      await until(
        () => api.WindowIsFullscreen(),
        "F11 did not enter fullscreen",
      );
      await until(
        () => controls().length === 0,
        "Caption controls must hide in fullscreen",
      );
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "F11" }));
      await until(
        async () => !(await api.WindowIsFullscreen()),
        "F11 did not leave fullscreen",
      );
      await until(
        () => controls().length === 3,
        "Caption controls did not return",
      );
      click("Minimize");
      await until(() => api.WindowIsMinimised(), "Window did not minimize");
      api.WindowUnminimise();
      await until(
        async () => !(await api.WindowIsMinimised()),
        "Window did not unminimize",
      );
      await desktop.ReportTest("");
      click("Close"); // The runner also requires the actual process to exit.
    } else {
      assert(
        controls().length === 0,
        "Native frame must not duplicate caption controls",
      );
      assert(
        !document.documentElement.dataset.windowFrame,
        "Native frame must not enable custom drag regions",
      );
      await desktop.ReportTest("");
      api.Quit();
    }
  } catch (error) {
    await desktop.ReportTest(
      error instanceof Error ? (error.stack ?? error.message) : String(error),
    );
    api.Quit();
  }
}
