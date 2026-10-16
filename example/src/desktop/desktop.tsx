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
    if (menu.left < last.right)
      problems.push(
        `the menu is not after the tabs: menu left ${menu.left}, last tab right ${last.right}, viewport ${innerWidth}x${innerHeight}`,
      );
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
    let readyFrames = 0;
    const report = (problems: string[]) => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      emit("layout", {
        platform,
        problems,
        ...(problems.length && {
          geometry: Array.from(
            document.querySelectorAll(
              ".lab-toolbar, .lab-toolbar > *, [role=tab], .lab-trailing",
            ),
            (element) => ({
              className: element.className,
              ...element.getBoundingClientRect().toJSON(),
            }),
          ),
        }),
      });
    };
    // WebKit can present its first frame after the old fixed delay has elapsed.
    // Let ResizeObserver and React fit the tabs before reporting their geometry.
    const check = () => {
      const problems = layoutProblems();
      readyFrames = problems.length ? 0 : readyFrames + 1;
      if (readyFrames >= 2) report(problems);
      else frame = requestAnimationFrame(check);
    };
    const timer = setTimeout(() => report(layoutProblems()), 5_000);
    frame = requestAnimationFrame(check);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, []);
  return <Demo host={host} />;
}
