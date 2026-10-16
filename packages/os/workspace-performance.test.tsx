import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import {
  Workspace,
  useUnsavedChanges,
  type Layout,
  type WorkspaceProps,
} from "./index.js";

afterEach(cleanup);
const tabs = Array.from({ length: 50 }, (_, index) => ({
  key: `${index}`,
  label: `Page ${index}`,
}));
const layout: Layout = {
  id: "columns",
  axis: "x",
  ratio: 0.5,
  first: {
    id: "left",
    tabs: tabs.slice(0, 25).map((tab) => tab.key),
    active: "0",
  },
  second: {
    id: "right",
    tabs: tabs.slice(25).map((tab) => tab.key),
    active: "25",
  },
};
const props = {
  tabs,
  layout,
  active: "0",
  onSelect: () => {},
  onClose: () => {},
  onLayoutChange: () => {},
  empty: () => null,
};
type Tab = (typeof tabs)[number];

it("does not call page renderers for geometry-only layout changes", () => {
  let calls = 0;
  const content: WorkspaceProps<Tab>["children"] = (tab) => {
    calls++;
    return <input aria-label={`Draft ${tab.key}`} defaultValue="Draft" />;
  };
  const view = render(<Workspace {...props}>{content}</Workspace>);
  expect(calls).toBe(50);
  fireEvent.change(screen.getByLabelText("Draft 0"), {
    target: { value: "Keep me" },
  });
  view.rerender(
    <Workspace {...props} layout={{ ...layout, ratio: 0.7 }}>
      {content}
    </Workspace>,
  );
  expect(calls).toBe(50);
  expect((screen.getByLabelText("Draft 0") as HTMLInputElement).value).toBe(
    "Keep me",
  );
});
it("updates changed tab data and application render callbacks", () => {
  const content: WorkspaceProps<Tab>["children"] = (tab) => (
    <span data-testid={`content-${tab.key}`}>{tab.label}</span>
  );
  const view = render(<Workspace {...props}>{content}</Workspace>);
  view.rerender(
    <Workspace
      {...props}
      tabs={tabs.map((tab) =>
        tab.key === "0" ? { ...tab, label: "Changed" } : tab,
      )}
    >
      {content}
    </Workspace>,
  );
  expect(screen.getByTestId("content-0").textContent).toBe("Changed");
  view.rerender(
    <Workspace {...props}>
      {(tab) => (
        <span data-testid={`content-${tab.key}`}>New callback {tab.label}</span>
      )}
    </Workspace>,
  );
  expect(screen.getByTestId("content-0").textContent).toBe(
    "New callback Page 0",
  );
});
it("updates the public pane descriptor when tabs move or selection changes", () => {
  const content: WorkspaceProps<Tab>["children"] = (tab, pane) => (
    <output
      data-testid={`content-${tab.key}`}
    >{`${pane.id}:${pane.active}:${pane.tabs.join()}`}</output>
  );
  const view = render(<Workspace {...props}>{content}</Workspace>);
  view.rerender(
    <Workspace {...props} active="1">
      {content}
    </Workspace>,
  );
  expect(screen.getByTestId("content-0").textContent).toStartWith("left:1:");
  const moved: Layout = {
    ...layout,
    first: {
      ...layout.first,
      tabs: ["1", "0", ...tabs.slice(2, 25).map((tab) => tab.key)],
    },
  };
  view.rerender(
    <Workspace {...props} layout={moved}>
      {content}
    </Workspace>,
  );
  expect(screen.getByTestId("content-0").textContent).toStartWith(
    "left:0:1,0,2",
  );
});
it("renders the selected page before refreshing hidden pane consumers", () => {
  const calls: string[] = [];
  const content: WorkspaceProps<Tab>["children"] = (tab, pane) => {
    calls.push(tab.key);
    return <output data-testid={`page-${tab.key}`}>{pane.active}</output>;
  };
  const view = render(<Workspace {...props}>{content}</Workspace>);
  calls.length = 0;
  view.rerender(
    <Workspace {...props} active="1">
      {content}
    </Workspace>,
  );
  expect(calls[0]).toBe("1");
  expect(calls).toHaveLength(25);
  for (let index = 0; index < 25; index++)
    expect(screen.getByTestId(`page-${index}`).textContent).toBe("1");
});
it("shows current callback data when revealing a previously hidden page", () => {
  const view = render(
    <Workspace {...props}>
      {(tab) => (
        <output data-testid={`page-${tab.key}`}>Old {tab.label}</output>
      )}
    </Workspace>,
  );
  view.rerender(
    <Workspace {...props} active="2">
      {(tab, pane) => (
        <output data-testid={`page-${tab.key}`}>
          New {tab.label}, selected {pane.active}
        </output>
      )}
    </Workspace>,
  );
  expect(screen.getByTestId("page-2").textContent).toBe(
    "New Page 2, selected 2",
  );
  expect(screen.getByTestId("page-0").textContent).toBe(
    "New Page 0, selected 2",
  );
});
it("keeps dirty tracking and the latest close callback after memoized updates", async () => {
  function DirtyPage() {
    useUnsavedChanges(true);
    return <p>Unsaved draft</p>;
  }
  const content = () => <DirtyPage />;
  const closed: string[] = [];
  const confirmed: string[] = [];
  const confirmClose = (tab: Tab) => {
    confirmed.push(tab.key);
    return true;
  };
  const view = render(
    <Workspace {...props} confirmClose={confirmClose}>
      {content}
    </Workspace>,
  );
  view.rerender(
    <Workspace
      {...props}
      layout={{ ...layout, ratio: 0.6 }}
      confirmClose={confirmClose}
      onClose={(key) => closed.push(key)}
    >
      {content}
    </Workspace>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Close Page 0" }));
  await Promise.resolve();
  expect(confirmed).toEqual(["0"]);
  expect(closed).toEqual(["0"]);
});
