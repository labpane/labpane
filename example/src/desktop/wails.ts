import type { WindowHost } from "@labpane/os";

type Bridge = { postMessage: (message: string) => void };
declare global {
  interface Window {
    chrome?: { webview?: Bridge };
    webkit?: { messageHandlers?: { external?: Bridge } };
  }
}

// send posts a Wails v2 window message; e2e/desktop pins the Wails version these match
const send = (message: string) =>
  (
    window.chrome?.webview ?? window.webkit?.messageHandlers?.external
  )?.postMessage(message);

// emit raises a Wails event that the Go side can listen for
export const emit = (name: string, ...data: unknown[]) =>
  send("EE" + JSON.stringify({ name, data }));

// wailsHost drives the Wails window the page runs in
export function wailsHost(platform: WindowHost["platform"]): WindowHost {
  return {
    platform,
    minimize: () => send("Wm"),
    toggleMaximize: () => send("Wt"),
    close: () => send("Q"),
    drag: () => send("drag"),
    ...(platform !== "macos" && {
      resize: (edge) => send(`resize:${edge}-resize`),
    }),
    fullscreen: (on) => send(on ? "WF" : "Wf"),
    ...(platform === "macos" && {
      trafficLights: (center) => emit("traffic-lights", center),
    }),
  };
}
