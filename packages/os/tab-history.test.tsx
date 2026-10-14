import { afterEach, beforeEach, expect, it, spyOn } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import {
  Workspace,
  useTabHistory,
  type Layout,
  type WorkspaceTab,
} from "./index.js";
import { createTabHistory } from "./tab-history.js";

afterEach(cleanup);

// happy-dom's history drops forward entries on replaceState, so the tests run on one that keeps
// them like a browser does
const { happyDOM } = window as unknown as {
  happyDOM: { setURL(url: string): void };
};
const setURL = (url: string) => happyDOM.setURL(url);
const original = Object.getOwnPropertyDescriptor(window, "history")!;
beforeEach(() => {
  setURL("http://localhost/start");
  const entries = [{ state: null as unknown, url: location.href }];
  let index = 0;
  const show = () => setURL(entries[index]!.url);
  const traverse = (delta: number) => {
    if (index + delta < 0 || index + delta >= entries.length) return;
    index += delta;
    show();
    dispatchEvent(new PopStateEvent("popstate", { state: history.state }));
  };
  const fake = {
    get length() {
      return entries.length;
    },
    get state() {
      return entries[index]!.state;
    },
    pushState(state: unknown, _: string, url: string) {
      entries.splice(++index, Infinity, { state, url });
      show();
    },
    replaceState(state: unknown, _: string, url: string) {
      entries[index] = { state, url };
      show();
    },
    back: () => traverse(-1),
    forward: () => traverse(1),
  };
  Object.defineProperty(window, "history", { value: fake, configurable: true });
});
afterEach(() => Object.defineProperty(window, "history", original));

it("keeps a path per tab, clears forward on a new path, and skips repeats", () => {
  const store = createTabHistory("/a");
  const read = () => store.get();
  read().navigate("/b");
  expect(read()).toMatchObject({
    path: "/b",
    canGoBack: true,
    canGoForward: false,
  });
  read().back();
  expect(read()).toMatchObject({
    path: "/a",
    canGoBack: false,
    canGoForward: true,
  });
  read().forward();
  expect(read().path).toBe("/b");
  read().back();
  read().navigate("/c");
  read().navigate("/c");
  expect(read()).toMatchObject({ path: "/c", canGoForward: false });
  read().back();
  expect(read().path).toBe("/a");
  read().forward();
  read().forward();
  expect(read().path).toBe("/c");
});

function Page({ name }: { name: string }) {
  const { path, canGoBack, canGoForward, navigate, back } = useTabHistory();
  return (
    <>
      <output data-testid={name}>
        {`${path} ${canGoBack ? "back" : "-"} ${canGoForward ? "forward" : "-"}`}
      </output>
      <button onClick={() => navigate(`${path}/next`)}>Go {name}</button>
      <button onClick={back}>Back {name}</button>
    </>
  );
}
const tabs: WorkspaceTab[] = [
  { key: "one", label: "One", href: "/one" },
  { key: "two", label: "Two", href: "/two" },
];

function Harness() {
  const [active, setActive] = useState<string | undefined>("one");
  const [layout, setLayout] = useState<Layout>({
    id: "main",
    tabs: ["one", "two"],
    active: "one",
  });
  return (
    <Workspace
      history
      tabs={tabs}
      active={active}
      onSelect={setActive}
      onClose={() => {}}
      layout={layout}
      onLayoutChange={setLayout}
      empty={() => null}
    >
      {(tab) => <Page name={tab.key} />}
    </Workspace>
  );
}
const status = (name: string) => screen.getByTestId(name).textContent;
const click = (name: string) =>
  fireEvent.click(screen.getByRole("button", { name }));
const select = (label: string) =>
  fireEvent.click(screen.getByRole("tab", { name: label }));
const traverse = (direction: "back" | "forward") =>
  act(() => history[direction]());

it("shows the front tab's path and switches tabs without adding entries", () => {
  render(<Harness />);
  const entries = history.length;
  expect(location.pathname).toBe("/one");
  select("Two");
  expect(location.pathname).toBe("/two");
  expect(status("two")).toBe("/two - -");
  select("One");
  expect(location.pathname).toBe("/one");
  expect(history.length).toBe(entries);
});

it("steps the front tab with browser Back and Forward, then leaves when it has no history", () => {
  render(<Harness />);
  const entries = history.length;
  click("Go one");
  expect(status("one")).toBe("/one/next back -");
  expect(location.pathname).toBe("/one/next");
  expect(history.length).toBe(entries + 1);
  traverse("back");
  expect(status("one")).toBe("/one - forward");
  expect(location.pathname).toBe("/one");
  traverse("forward");
  expect(status("one")).toBe("/one/next back -");
  traverse("back");
  select("Two");
  expect(location.pathname).toBe("/two");
  const leave = spyOn(history, "back");
  traverse("back");
  expect(leave).toHaveBeenCalledTimes(2);
  leave.mockRestore();
  expect(status("two")).toBe("/two - -");
});

it("offers browser Forward after a step back in the app, and takes it away on a new path", () => {
  render(<Harness />);
  click("Go one");
  click("Back one");
  expect(status("one")).toBe("/one - forward");
  expect(location.pathname).toBe("/one");
  traverse("forward");
  expect(status("one")).toBe("/one/next back -");
  click("Back one");
  click("Go one");
  expect(status("one")).toBe("/one/next back -");
  traverse("forward");
  expect(status("one")).toBe("/one/next back -");
  expect(location.pathname).toBe("/one/next");
});

it("keeps each tab's history apart across switches", () => {
  render(<Harness />);
  click("Go one");
  select("Two");
  click("Go two");
  expect(status("two")).toBe("/two/next back -");
  traverse("back");
  expect(status("two")).toBe("/two - forward");
  select("One");
  expect(status("one")).toBe("/one/next back -");
  expect(location.pathname).toBe("/one/next");
  traverse("back");
  expect(status("one")).toBe("/one - forward");
  expect(location.pathname).toBe("/one");
  select("Two");
  traverse("forward");
  expect(status("two")).toBe("/two/next back -");
  expect(location.pathname).toBe("/two/next");
});
