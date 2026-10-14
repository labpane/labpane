import {
  WindowControls,
  useFullscreen,
  useWindowFrame,
  type WindowHost,
} from "@labpane/os";
import { Demo } from "./workspace";

declare global {
  interface Window {
    calls: string[];
  }
}

window.calls = [];
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
  fullscreen: (on) => call(`fullscreen ${on}`),
};

export function DesktopDemo() {
  const [fullscreen] = useFullscreen(host);
  useWindowFrame(host);
  return (
    <Demo
      leading={
        platform === "macos" && !fullscreen && <div style={{ width: 72 }} />
      }
      trailing={<WindowControls host={host} />}
    />
  );
}
