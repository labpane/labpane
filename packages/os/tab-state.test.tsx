import { afterEach, expect, it } from "bun:test";
import {
  cleanup,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import {
  Workspace,
  useShownOnce,
  useTabActive,
  useTabVisible,
  type Layout,
  type WorkspaceTab,
} from "./index.js";

afterEach(cleanup);

function Status({ name }: { name: string }) {
  const active = useTabActive();
  const visible = useTabVisible();
  return (
    <output data-testid={name}>
      {`${active ? "active" : "idle"} ${visible ? "visible" : "hidden"}`}
    </output>
  );
}
const tabs: WorkspaceTab[] = [
  { key: "a", label: "A" },
  { key: "b", label: "B" },
  { key: "c", label: "C" },
];
const split: Layout = {
  id: "split",
  axis: "x",
  ratio: 0.5,
  first: { id: "left", tabs: ["a", "b"], active: "a" },
  second: { id: "right", tabs: ["c"], active: "c" },
};

function Harness() {
  const [active, setActive] = useState<string | undefined>("a");
  const [layout, setLayout] = useState(split);
  return (
    <Workspace
      tabs={tabs}
      active={active}
      onSelect={setActive}
      onClose={() => {}}
      layout={layout}
      onLayoutChange={setLayout}
      empty={() => null}
    >
      {(tab) => <Status name={tab.key} />}
    </Workspace>
  );
}
const status = (name: string) => screen.getByTestId(name).textContent;
const select = (label: string) =>
  fireEvent.click(screen.getByRole("tab", { name: label }));

it("marks the focused pane's front tab active and every pane's front tab visible", () => {
  render(<Harness />);
  expect(status("a")).toBe("active visible");
  expect(status("c")).toBe("idle visible");
  select("C");
  expect(status("a")).toBe("idle visible");
  expect(status("c")).toBe("active visible");
  select("B");
  expect(status("b")).toBe("active visible");
  expect(status("a")).toBe("idle hidden");
  expect(status("c")).toBe("idle visible");
});

it("keeps background tabs mounted and tells them they are hidden", () => {
  render(<Harness />);
  expect(status("b")).toBe("idle hidden");
  select("B");
  expect(status("b")).toBe("active visible");
  select("A");
  expect(status("b")).toBe("idle hidden");
});

it("reads active and visible as true outside a workspace", () => {
  render(<Status name="free" />);
  expect(status("free")).toBe("active visible");
});

it("useShownOnce turns on the first time it is shown and stays on", () => {
  const { result, rerender } = renderHook(
    ({ visible }: { visible: boolean }) => useShownOnce(visible),
    { initialProps: { visible: false } },
  );
  expect(result.current).toBe(false);
  rerender({ visible: true });
  expect(result.current).toBe(true);
  rerender({ visible: false });
  expect(result.current).toBe(true);
});
