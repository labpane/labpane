import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useRef, useState } from "react";
import {
  Workspace,
  useLeaveTab,
  type Layout,
  type WorkspaceTab,
} from "./index.js";

afterEach(cleanup);

function Page({ name, open }: { name: string; open: () => void }) {
  const leave = useLeaveTab();
  return (
    <>
      <button onClick={open}>Open from {name}</button>
      <button onClick={leave}>Leave {name}</button>
    </>
  );
}

function Harness({
  initial,
  layout: start,
}: {
  initial: WorkspaceTab[];
  layout: Layout;
}) {
  const [tabs, setTabs] = useState(initial);
  const [active, setActive] = useState<string | undefined>(initial[0]!.key);
  const [layout, setLayout] = useState(start);
  const count = useRef(0);
  return (
    <>
      <output data-testid="active">{active}</output>
      <Workspace
        tabs={tabs}
        active={active}
        onSelect={setActive}
        onClose={(key, next) => {
          setTabs((tabs) => tabs.filter((tab) => tab.key !== key));
          setActive((current) => (current === key ? next : current));
        }}
        layout={layout}
        onLayoutChange={setLayout}
        empty={() => null}
      >
        {(tab) => (
          <Page
            name={tab.label}
            open={() => {
              const key = `new${++count.current}`;
              setTabs((tabs) => [...tabs, { key, label: key }]);
              setActive(key);
            }}
          />
        )}
      </Workspace>
    </>
  );
}
const active = () => screen.getByTestId("active").textContent;
const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));
const select = (label: string) =>
  fireEvent.click(screen.getByRole("tab", { name: label }));
const open = () => screen.getAllByRole("tab").map((tab) => tab.textContent);

it("leaves to the tab it was opened from, or was last switched to from", () => {
  const tabs: WorkspaceTab[] = [
    { key: "a", label: "A" },
    { key: "b", label: "B" },
  ];
  render(
    <Harness
      initial={tabs}
      layout={{ id: "main", tabs: ["a", "b"], active: "a" }}
    />,
  );
  click("Open from A");
  expect(active()).toBe("new1");
  select("B");
  select("new1");
  click("Leave new1");
  expect(open()).toEqual(["A", "B"]);
  expect(active()).toBe("b");
  click("Open from B");
  select("A");
  click("Leave A");
  expect(open()).toEqual(["B", "new2"]);
  expect(active()).toBe("new2");
});

it("closes like any tab when its opener has gone, and honours the opener field across panes", () => {
  const tabs: WorkspaceTab[] = [
    { key: "a", label: "A" },
    { key: "b", label: "B" },
    { key: "c", label: "C", opener: "a" },
  ];
  render(
    <Harness
      initial={tabs}
      layout={{
        id: "split",
        axis: "x",
        ratio: 0.5,
        first: { id: "left", tabs: ["a", "b"], active: "a" },
        second: { id: "right", tabs: ["c"], active: "c" },
      }}
    />,
  );
  click("Open from A");
  select("B");
  click("Leave B");
  expect(open()).toEqual(["A", "new1", "C"]);
  expect(active()).toBe("new1");
  click("Leave new1");
  expect(active()).toBe("a");
  select("C");
  click("Leave C");
  expect(open()).toEqual(["A"]);
  expect(active()).toBe("a");
});
