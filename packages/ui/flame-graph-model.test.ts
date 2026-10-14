import { describe, expect, it } from "bun:test";
import {
  flameLayout,
  flamePath,
  indexFlameNodes,
  type FlameNode,
} from "./flame-graph-model.js";

const tree: FlameNode[] = [
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

describe("flame layout", () => {
  it("uses inclusive widths, leaves self gaps, and rescales a focused subtree", () => {
    const rects = flameLayout(tree, "root", 1000);
    expect(rects.find((r) => r.node.id === "sim")?.width).toBe(300);
    expect(rects.find((r) => r.node.id === "move")?.width).toBe(200);
    expect(
      rects.filter((r) => r.depth === 1).reduce((sum, r) => sum + r.width, 0),
    ).toBe(900);
    const zoom = flameLayout(tree, "sim", 900);
    expect(zoom.map((r) => r.node.id)).toEqual(["sim", "move"]);
    expect(zoom[1]?.width).toBe(600);
    expect(flamePath(tree, "move").map((n) => n.id)).toEqual([
      "root",
      "sim",
      "move",
    ]);
    expect(flamePath(indexFlameNodes(tree), "move")).toEqual(
      flamePath(tree, "move"),
    );
  });
  it("handles empty, zero and cyclic inputs without looping", () => {
    expect(flameLayout([], "root", 100)).toEqual([]);
    expect(flameLayout([{ ...tree[0]!, total: 0 }], "root", 100)).toEqual([]);
    const cycle = [{ ...tree[0]!, parentId: "sim" }, tree[1]!];
    expect(flameLayout(cycle, "root", 100)).toHaveLength(2);
    expect(flamePath(cycle, "sim")).toHaveLength(2);
  });
});
