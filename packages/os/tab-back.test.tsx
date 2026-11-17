import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { createPaneBack } from "./tab-back.js";
import { Workspace, useTabBack, useTabHistory, type Layout } from "./index.js";

afterEach(cleanup);

it("walks backward through selections instead of toggling the last two tabs", () => {
  const history = createPaneBack();
  const keys = ["a", "b", "c"];
  let active = "a";
  const select = (key: string) => {
    active = key;
    history.update(key, keys, select);
  };
  select("a");
  select("b");
  select("c");
  history.get().back();
  expect(active).toBe("b");
  history.get().back();
  expect(active).toBe("a");
  expect(history.get().canGoBack).toBe(false);
});

it("skips tabs that were closed or moved to another pane", () => {
  const history = createPaneBack();
  const chosen: string[] = [];
  const select = (key: string) => chosen.push(key);
  for (const key of ["a", "b", "c"])
    history.update(key, ["a", "b", "c"], select);
  history.update("c", ["a", "c"], select);
  history.get().back();
  expect(chosen).toEqual(["a"]);
  history.update("a", ["a", "c"], select);
  expect(history.get().canGoBack).toBe(false);
});

it("keeps selection history independent between panes", () => {
  const left = createPaneBack(),
    right = createPaneBack();
  const select = () => {};
  left.update("a", ["a", "b"], select);
  right.update("c", ["c", "d"], select);
  left.update("b", ["a", "b"], select);
  expect(left.get().canGoBack).toBe(true);
  expect(right.get().canGoBack).toBe(false);
});

function Page({ name }: { name: string }) {
  const navigation = useTabBack();
  const history = useTabHistory();
  return (
    <>
      <button disabled={!navigation.canGoBack} onClick={navigation.back}>
        Back from {name}
      </button>
      <button onClick={() => history.navigate("/detail")}>
        Details in {name}
      </button>
      <output>
        {name}: {history.path}
      </output>
      <input aria-label={`Draft ${name}`} defaultValue="" />
    </>
  );
}
function Harness() {
  const tabs = [
    { key: "a", label: "A", href: "/a" },
    { key: "b", label: "B", href: "/b" },
  ];
  const [active, select] = useState("a");
  const [layout, change] = useState<Layout>({
    id: "main",
    tabs: ["a", "b"],
    active: "a",
  });
  return (
    <Workspace
      tabs={tabs}
      active={active}
      onSelect={select}
      onClose={() => {
        throw new Error("Back must not close a tab");
      }}
      layout={layout}
      onLayoutChange={change}
      empty={() => null}
    >
      {(tab) => <Page name={tab.label} />}
    </Workspace>
  );
}

it("returns through detail history before switching tabs and preserves the open draft", () => {
  render(<Harness />);
  fireEvent.click(screen.getByRole("tab", { name: "B" }));
  fireEvent.change(screen.getByRole("textbox", { name: "Draft B" }), {
    target: { value: "Keep this" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Details in B" }));
  expect(screen.getByText("B: /detail")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Back from B" }));
  expect(screen.getByText("B: /b")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Back from B" }));
  expect(
    screen.getByRole("tab", { name: "A" }).getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.getAllByRole("tab")).toHaveLength(2);
  fireEvent.click(screen.getByRole("tab", { name: "B" }));
  expect(
    (screen.getByRole("textbox", { name: "Draft B" }) as HTMLInputElement)
      .value,
  ).toBe("Keep this");
});
