import { afterEach, expect, it } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { useState } from "react";
import {
  Workspace,
  useUnsavedChanges,
  type Layout,
  type WorkspaceAction,
  type WorkspaceTab,
} from "./index.js";

afterEach(cleanup);

const initial = ["a", "b", "c", "d", "e"].map((key) => ({ key, label: key }));
const split: Layout = {
  id: "split",
  axis: "x",
  ratio: 0.5,
  first: { id: "left", tabs: ["c", "a", "b"], active: "a" },
  second: { id: "right", tabs: ["d", "e"], active: "d" },
};
const menus = new Map<string, WorkspaceAction[]>();

function Content({ dirty }: { dirty: boolean }) {
  useUnsavedChanges(dirty);
  return <p>Content</p>;
}

function Harness({
  dirty = [],
  confirmClose,
  closed = () => {},
  selected = "a",
}: {
  dirty?: string[];
  confirmClose?: (tab: WorkspaceTab) => boolean | Promise<boolean>;
  closed?: (key: string, next?: string) => void;
  selected?: string;
}) {
  const [tabs, setTabs] = useState(initial);
  const [active, setActive] = useState<string | undefined>(selected);
  const [layout, setLayout] = useState(split);
  return (
    <>
      <output data-testid="active">{active}</output>
      <output data-testid="layout">{JSON.stringify(layout)}</output>
      <button
        onClick={() =>
          setTabs((tabs) => [...tabs, { key: "new", label: "new" }])
        }
      >
        New tab
      </button>
      <Workspace
        tabs={tabs}
        active={active}
        layout={layout}
        onSelect={setActive}
        onLayoutChange={setLayout}
        onClose={(key, next) => {
          closed(key, next);
          setTabs((tabs) => tabs.filter((tab) => tab.key !== key));
          setActive((current) => (current === key ? next : current));
        }}
        menu={(target, actions, _restoreFocus, key) => {
          if (key) menus.set(key, actions);
          return target;
        }}
        confirmClose={confirmClose}
        empty={() => <p>No tabs open</p>}
      >
        {(tab) => <Content dirty={dirty.includes(tab.key)} />}
      </Workspace>
    </>
  );
}

function closeAction(key: string, label: string) {
  const menu = menus.get(key)?.find((action) => action?.label === "Close");
  if (!menu || !("items" in menu)) throw Error("Missing Close submenu");
  const item = menu.items.find((action) => action?.label === label);
  if (!item || !("onSelect" in item)) throw Error(`Missing ${label}`);
  return item;
}

const open = () => screen.queryAllByRole("tab").map((tab) => tab.textContent);

for (const [label, expected] of [
  ["Tabs to the left", ["a", "b", "d", "e"]],
  ["Tabs to the right", ["c", "a", "d", "e"]],
  ["Others in this pane", ["a", "d", "e"]],
  ["All others", ["a"]],
  ["All tabs and panes", []],
] as const) {
  it(`closes ${label.toLowerCase()} in pane order`, async () => {
    const neighbors: (string | undefined)[] = [];
    render(
      <Harness selected="b" closed={(_key, next) => neighbors.push(next)} />,
    );
    await act(async () => {
      closeAction("a", label).onSelect();
    });
    expect(open()).toEqual([...expected]);
    expect(
      neighbors.every(
        (key) =>
          key === undefined || (expected as readonly string[]).includes(key),
      ),
    ).toBe(true);
    expect(screen.getByTestId("active").textContent).toBe(
      expected.length ? "a" : "",
    );
    if (!expected.length) {
      expect(JSON.parse(screen.getByTestId("layout").textContent!)).toEqual({
        id: "primary",
        tabs: [],
      });
      expect(screen.getByText("No tabs open")).toBeTruthy();
    } else {
      await waitFor(() =>
        expect(document.activeElement).toBe(
          screen.getByRole("tab", { name: "a" }),
        ),
      );
    }
  });
}

it("disables close actions that have no tabs to close", async () => {
  render(<Harness />);
  expect(closeAction("c", "Tabs to the left").disabled).toBe(true);
  expect(closeAction("b", "Tabs to the right").disabled).toBe(true);
  await act(async () => {
    closeAction("a", "All others").onSelect();
  });
  for (const label of [
    "Tabs to the left",
    "Tabs to the right",
    "Others in this pane",
    "All others",
  ])
    expect(closeAction("a", label).disabled).toBe(true);
  expect(closeAction("a", "All tabs and panes").disabled).not.toBe(true);
});

it("asks about dirty tabs in sequence and keeps declined tabs", async () => {
  const asked: string[] = [];
  let resolve!: (value: boolean) => void;
  const closed: string[] = [];
  render(
    <Harness
      dirty={["b", "d"]}
      closed={(key) => closed.push(key)}
      confirmClose={(tab) => {
        asked.push(tab.key);
        return new Promise((done) => {
          resolve = done;
        });
      }}
    />,
  );
  await act(async () => {
    closeAction("a", "All tabs and panes").onSelect();
  });
  expect(asked).toEqual(["b"]);
  expect(closed).toEqual([]);
  await act(async () => {
    resolve(false);
  });
  expect(asked).toEqual(["b", "d"]);
  await act(async () => {
    resolve(true);
  });
  expect(open()).toEqual(["b"]);
  expect(screen.getByTestId("active").textContent).toBe("b");
  await waitFor(() =>
    expect(document.activeElement).toBe(screen.getByRole("tab", { name: "b" })),
  );
});

it("uses current callbacks and leaves newly opened tabs alone during confirmation", async () => {
  let resolve!: (value: boolean) => void;
  const confirmClose = () =>
    new Promise<boolean>((done) => {
      resolve = done;
    });
  const closed: string[] = [];
  const view = render(<Harness dirty={["a"]} confirmClose={confirmClose} />);
  await act(async () => {
    closeAction("a", "All tabs and panes").onSelect();
  });
  fireEvent.click(screen.getByRole("button", { name: "New tab" }));
  view.rerender(
    <Harness
      dirty={["a"]}
      confirmClose={confirmClose}
      closed={(key) => closed.push(key)}
    />,
  );
  await act(async () => {
    resolve(true);
  });
  expect(open()).toEqual(["new"]);
  expect(closed).toEqual(["a", "b", "c", "d", "e"]);
  expect(screen.getByTestId("active").textContent).toBe("new");
});
