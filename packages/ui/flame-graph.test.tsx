import { afterEach, describe, expect, it } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { FlameGraph } from "./flame-graph.js";

const tree = [
  { id: "root", parentId: null, name: "Frame", total: 10, self: 1, calls: 2 },
  { id: "sim", parentId: "root", name: "Sim", total: 3, self: 1, calls: 2 },
  {
    id: "move",
    parentId: "sim",
    name: "Movement",
    total: 2,
    self: 2,
    calls: 4,
  },
  {
    id: "render",
    parentId: "root",
    name: "Render",
    total: 6,
    self: 6,
    calls: 2,
  },
];

afterEach(cleanup);

describe("flame graph interaction", () => {
  it("shows statistical observations and source details without claiming invocation counts", () => {
    render(
      <FlameGraph
        nodes={tree.map((n) => ({ ...n, detail: "synthetic.wasm:32" }))}
        countLabel="Stack observations"
        meanLabel="Mean sample weight"
      />,
    );
    fireEvent.pointerMove(screen.getByRole("button", { name: /^Sim, total/ }));
    const tooltip = within(screen.getByRole("tooltip"));
    expect(tooltip.getByText("Stack observations")).toBeTruthy();
    expect(tooltip.getByText("Mean sample weight")).toBeTruthy();
    expect(tooltip.getByText("synthetic.wasm:32")).toBeTruthy();
    expect(tooltip.queryByText("Calls observed")).toBeNull();
  });
  it("inspects self/total, zooms, searches hidden descendants and resets", () => {
    render(<FlameGraph nodes={tree} />);
    const sim = screen.getByRole("button", { name: /^Sim, total/ });
    fireEvent.pointerMove(sim);
    expect(within(screen.getByRole("tooltip")).getByText("1 ms")).toBeTruthy();
    fireEvent.click(sim);
    expect(screen.queryByRole("button", { name: /^Render, total/ })).toBeNull();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Search flame graph" }),
      { target: { value: "Render" } },
    );
    fireEvent.click(screen.getByRole("button", { name: /Frame \/ Render/ }));
    expect(screen.getByRole("button", { name: /^Render, total/ })).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Reset zoom" }));
    expect(screen.getByRole("button", { name: /^Sim, total/ })).toBeTruthy();
  });
  it("supports keyboard inspection, zoom and returning to ancestors", () => {
    render(<FlameGraph nodes={tree} />);
    const root = screen.getByRole("button", { name: /^Frame, total/ });
    act(() => root.focus());
    fireEvent.keyDown(root, { key: "ArrowUp" });
    const renderNode = screen.getByRole("button", { name: /^Render, total/ });
    expect(document.activeElement).toBe(renderNode);
    fireEvent.keyDown(renderNode, { key: "Enter" });
    fireEvent.keyDown(renderNode, { key: "ArrowDown" });
    expect(renderNode.getAttribute("tabindex")).toBe("0");
    fireEvent.keyDown(renderNode, { key: "Escape" });
    expect(screen.getByRole("button", { name: /^Sim, total/ })).toBeTruthy();
  });
});
