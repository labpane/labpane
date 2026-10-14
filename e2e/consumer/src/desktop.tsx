import { desktopSlots, useWindowFrame, type WindowHost } from "@labpane/os";
import { Demo } from "./workspace";

declare global {
  interface Window {
    calls: string[];
    lights: number[];
  }
}

window.calls = [];
window.lights = [];
const call = (name: string) => window.calls.push(name);
const platform = new URLSearchParams(location.search).get(
  "desktop",
) as WindowHost["platform"];
const host: WindowHost = {
  platform,
  minimize: () => call("minimize"),
  toggleMaximize: () => call("toggleMaximize"),
  close: () => call("close"),
  drag: () => call("drag"),
  ...(platform !== "macos" && {
    resize: (edge) => call(`resize ${edge}`),
  }),
  ...(platform === "macos" && {
    trafficLights: (center) => window.lights.push(center),
  }),
  fullscreen: (on) => call(`fullscreen ${on}`),
};

export function DesktopDemo() {
  useWindowFrame(host);
  return (
    <Demo
      titleBar
      {...desktopSlots(host, (align) => (
        <button type="button" data-align={align}>
          Menu
        </button>
      ))}
    />
  );
}
