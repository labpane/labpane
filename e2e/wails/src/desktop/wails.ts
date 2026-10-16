import type { WindowHost } from "@labpane/os";

// The app owns this adapter. Labpane only sees the WindowHost callbacks.
type WailsRuntime = {
  WindowMinimise: () => void;
  WindowToggleMaximise: () => void;
  WindowFullscreen: () => void;
  WindowUnfullscreen: () => void;
  Quit: () => void;
};
type WindowOptions = {
  frame: "custom" | "native";
  platform: "windows" | "darwin" | "linux";
};
type WailsWindow = Window & {
  runtime?: WailsRuntime;
  go?: { main?: { Desktop?: { WindowOptions: () => Promise<WindowOptions> } } };
};

export async function readWailsHost(): Promise<WindowHost | undefined> {
  const bridge = window as WailsWindow;
  const desktop = bridge.go?.main?.Desktop;
  const runtime = bridge.runtime;
  // Query strings and browser preferences never opt a browser into native controls.
  if (!desktop || !runtime) return undefined;
  const options = await desktop.WindowOptions();
  if (options.frame === "native") return undefined;
  if (
    options.frame !== "custom" ||
    !["windows", "darwin", "linux"].includes(options.platform)
  ) {
    throw new Error("Unsupported desktop window configuration.");
  }
  document.documentElement.dataset.windowFrame = "custom";
  return {
    platform: options.platform === "darwin" ? "macos" : options.platform,
    minimize: () => runtime.WindowMinimise(),
    toggleMaximize: () => runtime.WindowToggleMaximise(),
    close: () => runtime.Quit(),
    fullscreen: (on) =>
      on ? runtime.WindowFullscreen() : runtime.WindowUnfullscreen(),
    // Wails owns drag and edge resize via its runtime/CSS support. Adding host
    // drag/resize handlers too would send duplicate native commands.
  };
}
