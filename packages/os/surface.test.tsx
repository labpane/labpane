import { afterEach, expect, it } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WorkspaceSurface, type Docking } from "./surface.js";
import type { Box, Layout, Pane } from "./layout.js";

afterEach(cleanup);
const layout = {
  id: "columns",
  axis: "x",
  ratio: 0.5,
  first: { id: "left", tabs: ["a", "b"], active: "a" },
  second: { id: "right", tabs: ["c"], active: "c" },
} satisfies Layout;
const content = () => null;

it("keeps headers stable through geometry changes and uses current docking callbacks", () => {
  let renders = 0;
  const changes: Layout[] = [];
  const header = (
    pane: Pane,
    _first: boolean,
    _last: boolean,
    docking: Docking,
  ) => {
    renders++;
    return (
      <button onClick={() => docking.next(pane.active!)}>Move {pane.id}</button>
    );
  };
  const oldChange = () => {
    throw new Error("Stale layout callback");
  };
  const view = render(
    <WorkspaceSurface
      layout={layout}
      change={oldChange}
      header={header}
      content={content}
    />,
  );
  expect(renders).toBe(2);
  view.rerender(
    <WorkspaceSurface
      layout={{ ...layout, ratio: 0.7 }}
      change={(next) => changes.push(next)}
      header={header}
      content={content}
    />,
  );
  expect(renders).toBe(2);
  view.rerender(
    <WorkspaceSurface
      layout={{ ...layout, ratio: 0.7 }}
      change={(next) => changes.push(next)}
      header={header}
      content={content}
      titlebarArea={{ left: 80, right: 700, height: 32, insetRight: 100 }}
    />,
  );
  expect(renders).toBe(2);
  expect(
    screen.getByText("Move left").closest<HTMLElement>("[data-pane-header]")!
      .style.left,
  ).toBe("80px");
  fireEvent.click(screen.getByText("Move left"));
  expect(changes).toHaveLength(1);
  expect(changes[0]).toMatchObject({
    ratio: 0.7,
    first: { tabs: ["b"] },
    second: { tabs: ["c", "a"] },
  });
});

it("refreshes pane inputs and replacement header renderers", () => {
  const rendered: string[] = [];
  const header = (pane: Pane) => {
    rendered.push(pane.id);
    return (
      <span>
        {pane.id}:{pane.active}
      </span>
    );
  };
  const change = () => {};
  const view = render(
    <WorkspaceSurface
      layout={layout}
      change={change}
      header={header}
      content={content}
    />,
  );
  rendered.length = 0;
  view.rerender(
    <WorkspaceSurface
      layout={{ ...layout, first: { ...layout.first, active: "b" } }}
      change={change}
      header={header}
      content={content}
    />,
  );
  expect(rendered).toEqual(["left"]);
  expect(screen.getByText("left:b")).toBeTruthy();
  view.rerender(
    <WorkspaceSurface
      layout={layout}
      change={change}
      header={(pane) => <span>New {pane.id}</span>}
      content={content}
    />,
  );
  expect(screen.getByText("New left")).toBeTruthy();
  expect(screen.getByText("New right")).toBeTruthy();
});

it("reuses the lifted source descriptor across zones and refreshes changed layouts", () => {
  let source: Pane | undefined;
  const header = (
    pane: Pane,
    _first: boolean,
    _last: boolean,
    docking: Docking,
  ) =>
    pane.id === "left" ? (
      <>
        <button
          onClick={() =>
            docking.move({ key: "a", x: 150, y: 80, detached: true })
          }
        >
          Lift
        </button>
        <button
          onClick={() =>
            docking.move({ key: "a", x: 430, y: 80, detached: true })
          }
        >
          Target
        </button>
      </>
    ) : null;
  const content = (regions: { pane: Pane }[]) => {
    source = regions[0]!.pane;
    return null;
  };
  const view = render(
    <WorkspaceSurface
      layout={layout}
      change={() => {}}
      header={header}
      content={content}
    />,
  );
  fireEvent.click(screen.getByText("Lift"));
  const lifted = source;
  expect(lifted?.active).toBe("b");
  fireEvent.click(screen.getByText("Target"));
  expect(source).toBe(lifted);
  fireEvent.click(screen.getByText("Lift"));
  expect(source).toBe(lifted);
  const changed = {
    ...layout,
    first: { ...layout.first, tabs: ["a", "d", "b"] },
  };
  view.rerender(
    <WorkspaceSurface
      layout={changed}
      change={() => {}}
      header={header}
      content={content}
    />,
  );
  expect(source).not.toBe(lifted);
  expect(source?.active).toBe("d");
  expect(source?.tabs).toEqual(["a", "d", "b"]);
});

it("sizes panes from the board before the first paint", () => {
  const original = Element.prototype.getBoundingClientRect;
  Element.prototype.getBoundingClientRect = function (this: Element) {
    return this.classList.contains("lab-board")
      ? new DOMRect(0, 0, 900.5, 600.25)
      : original.call(this);
  };
  try {
    const painted: { box: Box; transition: boolean }[] = [];
    render(
      <WorkspaceSurface
        layout={{ id: "only", tabs: ["a"], active: "a" }}
        change={() => {}}
        header={(pane) => <span>{pane.id}</span>}
        content={(regions, transition) => {
          painted.push({ box: regions[0]!.box, transition });
          return null;
        }}
      />,
    );
    expect(painted.at(-1)).toEqual({
      box: { x: 0, y: 0, width: 900.5, height: 600.25 },
      transition: false,
    });
    expect(
      screen.getByText("only").closest<HTMLElement>("[data-pane-header]")!.style
        .width,
    ).toBe("900.5px");
  } finally {
    Element.prototype.getBoundingClientRect = original;
  }
});
