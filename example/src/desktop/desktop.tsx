import { useEffect } from "react";
import type { WindowHost } from "@labpane/os";
import { Demo } from "../home/demo";
import { emit, wailsHost } from "./wails";

const platforms: WindowHost["platform"][] = ["windows", "macos", "linux"];
const asked = new URLSearchParams(location.search).get("platform");
const platform = platforms.find((name) => name === asked) ?? "windows";
const host = wailsHost(platform);

const box = (selector: string) =>
  document.querySelector(selector)?.getBoundingClientRect();

// layoutProblems checks where the window's controls landed: macOS keeps its traffic lights at the
// start and the menu after the tabs; elsewhere the menu comes first and the window buttons sit flush
// in the top-right corner
function layoutProblems() {
  const tabs = document.querySelectorAll('[role="tab"]');
  const first = tabs[0]?.getBoundingClientRect();
  const last = tabs[tabs.length - 1]?.getBoundingClientRect();
  const menu = box('button[aria-label="Labpane"]');
  const buttons = box(".lab-window-buttons");
  const lights = box(".lab-traffic-lights");
  if (!first || !last || !menu) return ["the workspace did not render"];
  const problems: string[] = [];
  if (platform === "macos") {
    if (buttons) problems.push("window buttons are shown on macOS");
    if (!lights?.width)
      problems.push("there is no room for the traffic lights");
    if (menu.left < last.right) problems.push("the menu is not after the tabs");
  } else {
    if (!buttons) problems.push("there are no window buttons");
    else if (Math.abs(buttons.right - innerWidth) > 1 || buttons.top !== 0)
      problems.push(
        `the window buttons end at ${buttons.right},${buttons.top}, not the top-right corner`,
      );
    if (lights) problems.push("there is room for traffic lights off macOS");
    if (menu.right > first.left)
      problems.push("the menu is not before the tabs");
  }
  return problems;
}

// DesktopPage is the example's workspace filling a Wails window that has no system title bar.
// It reports its layout to the window, for e2e/desktop's smoke test
export function DesktopPage() {
  useEffect(() => {
    let frame = 0;
    const timer = setTimeout(() => {
      frame = requestAnimationFrame(() =>
        emit("layout", { platform, problems: layoutProblems() }),
      );
    }, 500);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <Demo host={host} />;
}
