import {
  useWorkspaceIds,
  useTabSize,
  fitTabWidth,
  type WorkspaceMenu,
} from "./context.js";
import {
  Fragment,
  memo,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  dockTab,
  dropRegion,
  layoutBoxes,
  minimum,
  minimumSize,
  panes,
  updateLayout,
  type Box,
  type Edge,
  type Layout,
  type Pane,
} from "./layout.js";
import type { TabDrag } from "./tabs.js";
import { hasOpenOverlay } from "./overlay.js";
import { frameTask } from "./frame-task.js";

export const position = (box: Box): CSSProperties => ({
  left: box.x,
  top: box.y,
  width: box.width,
  height: box.height,
});
export type Docking = {
  move: (drag: TabDrag) => boolean;
  drop: () => boolean;
  cancel: () => void;
  split: (key: string, edge: Edge) => boolean;
  next: (key: string) => void;
  paneCount: number;
  insertion?: number;
};
type Preview = { key: string; pane?: string; edge?: Edge; index?: number };
type Header = (
  pane: Pane,
  first: boolean,
  last: boolean,
  docking: Docking,
  surface: (key?: string) => HTMLElement | null,
) => ReactNode;

const PaneHeader = memo(function PaneHeader({
  pane,
  first,
  last,
  docking,
  insertion,
  board,
  render,
}: {
  pane: Pane;
  first: boolean;
  last: boolean;
  docking: Docking;
  insertion?: number;
  board: { current: HTMLDivElement | null };
  render: Header;
}) {
  const ids = useWorkspaceIds();
  return render(
    pane,
    first,
    last,
    { ...docking, insertion },
    (key = pane.active) =>
      board.current?.querySelector<HTMLElement>(
        key
          ? `#${CSS.escape(ids.panel(key))}`
          : `[data-pane-sheet="${CSS.escape(pane.id)}"]:not([hidden]):not([data-drag-content])`,
      ) ?? null,
  );
});

export function WorkspaceSurface({
  layout,
  change,
  header,
  content,
  menu,
}: {
  layout: Layout;
  change: (layout: Layout) => void;
  menu?: WorkspaceMenu;
  header: Header;
  content: (
    panes: { pane: Pane; box: Box }[],
    transition: boolean,
    lifted?: string,
  ) => ReactNode;
}) {
  const ids = useWorkspaceIds();
  const {
    height: tabHeight,
    width: tabWidth,
    columnGap,
    rowGap,
  } = useTabSize();
  const gutter = { x: columnGap, y: rowGap };
  const board = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [preview, setPreview] = useState<Preview>();
  const previewRef = useRef<Preview | undefined>(undefined);
  const [resizing, setResizing] = useState(false);
  type ResizeDraft = { base: Layout; layout: Layout };
  const [resizeDraft, setResizeDraft] = useState<ResizeDraft>();
  const resizeDraftRef = useRef<ResizeDraft | undefined>(undefined);
  const displayedLayout =
    resizeDraft?.base === layout ? resizeDraft.layout : layout;
  const cancelResize = () => {
    resizePointer.cancel();
    resizeDraftRef.current = undefined;
    setResizeDraft(undefined);
    setResizing(false);
  };
  const geometry = [
    size.width,
    size.height,
    tabHeight,
    columnGap,
    rowGap,
  ].join();
  const previousGeometry = useRef(geometry);
  const stableGeometry = previousGeometry.current === geometry;
  useLayoutEffect(() => {
    previousGeometry.current = geometry;
  }, [geometry]);
  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry!.contentRect;
      setSize({ width, height });
    });
    observer.observe(board.current!);
    return () => observer.disconnect();
  }, []);
  const { leaves, dividers } = layoutBoxes(
      displayedLayout,
      size.width,
      size.height,
      gutter,
    ),
    required = minimumSize(displayedLayout, gutter);
  const [resizePointer] = useState(() =>
    frameTask<() => void>((resize) => resize()),
  );
  useLayoutEffect(() => {
    addEventListener("blur", cancelResize);
    return () => {
      resizePointer.cancel();
      removeEventListener("blur", cancelResize);
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- cancellation only uses stable setters, refs, and the frame task
  }, [resizePointer]);
  const show = (next?: Preview) => {
    if (
      previewRef.current?.pane === next?.pane &&
      previewRef.current?.edge === next?.edge &&
      previewRef.current?.index === next?.index &&
      previewRef.current?.key === next?.key
    )
      return;
    previewRef.current = next;
    setPreview(next);
  };
  const canSplit = (box: Box, edge: Edge) =>
    edge === "bottom"
      ? box.height >= minimum.y * 2 + rowGap
      : box.width >= minimum.x * 2 + columnGap;
  const docking: Docking = {
    paneCount: leaves.length,
    next: (key) => {
      const index = leaves.findIndex((p) => p.pane.tabs.includes(key));
      change(
        dockTab(layout, key, leaves[(index + 1) % leaves.length]!.pane.id),
      );
    },
    move: ({ key, x, y, detached: wasDetached }) => {
      const bounds = board.current!.getBoundingClientRect(),
        localX = x - bounds.left,
        localY = y - bounds.top;
      const target = leaves.find(
        (p) =>
          localX >= p.x &&
          localX <= p.x + p.width &&
          localY >= p.y &&
          localY <= p.y + p.height,
      );
      const source = leaves.find((p) => p.pane.tabs.includes(key))!;
      const margin = wasDetached ? 8 : 24;
      const detached =
        localY > source.y + tabHeight + margin ||
        localY < source.y - margin ||
        (!!target &&
          (localX < source.x - margin ||
            localX > source.x + source.width + margin));
      if (!detached) {
        show();
        return false;
      }
      let edge: Edge | undefined;
      if (target && localY > target.y + tabHeight) {
        if (localY > target.y + target.height * 0.72) edge = "bottom";
        else if (localX < target.x + target.width * 0.28) edge = "left";
        else if (localX > target.x + target.width * 0.72) edge = "right";
      }
      const valid =
        target &&
        (!edge || canSplit(target, edge)) &&
        (!target.pane.tabs.includes(key) ||
          (!!edge && target.pane.tabs.length > 1));
      let index: number | undefined;
      if (valid && !edge) {
        const nav = board.current!.querySelector<HTMLElement>(
          `[data-pane-header="${CSS.escape(target.pane.id)}"] [role="tablist"]`,
        );
        const header = nav?.closest<HTMLElement>("[data-pane-header]");
        index = target.pane.tabs.length;
        if (nav && header && localY <= target.y + tabHeight) {
          const strip = nav.parentElement!;
          const inset =
            strip.getBoundingClientRect().left -
            header.getBoundingClientRect().left;
          const trailing =
            strip.parentElement!.nextElementSibling?.getBoundingClientRect()
              .width ?? 0;
          const available = target.width - inset - trailing - 4;
          const width = fitTabWidth(
            tabWidth,
            available,
            target.pane.tabs.length + 1,
          );
          const overflow =
            width * (target.pane.tabs.length + 1) + 16 - available;
          const arrows = overflow > 1 ? Math.min(28, tabHeight) : 0;
          const scroll = Math.min(
            nav.scrollLeft,
            Math.max(0, overflow + arrows * 2),
          );
          index = Math.max(
            0,
            Math.min(
              target.pane.tabs.length,
              Math.round(
                (localX - target.x - inset - arrows + scroll - 8) / width,
              ),
            ),
          );
        }
      }
      show(valid ? { pane: target.pane.id, key, edge, index } : { key });
      return true;
    },
    drop: () => {
      const target = previewRef.current;
      show();
      if (!target?.pane) return false;
      change(
        dockTab(layout, target.key, target.pane, target.edge, target.index),
      );
      return true;
    },
    cancel: () => show(),
    split: (key, edge) => {
      const target = leaves.find((p) => p.pane.tabs.includes(key));
      if (!target || target.pane.tabs.length < 2 || !canSplit(target, edge))
        return false;
      change(dockTab(layout, key, target.pane.id, edge));
      return true;
    },
  };
  const lifted = preview?.key;
  const operations = useRef(docking);
  useLayoutEffect(() => {
    operations.current = docking;
  });
  const paneCount = leaves.length;
  const stableDocking = useMemo<Docking>(
    () => ({
      paneCount,
      move: (drag) => operations.current.move(drag),
      drop: () => operations.current.drop(),
      cancel: () => operations.current.cancel(),
      split: (key, edge) => operations.current.split(key, edge),
      next: (key) => operations.current.next(key),
    }),
    [paneCount],
  );
  // Reuse the fallback pane until its layout or lifted tab changes.
  const sourcePreview = useMemo(() => {
    if (!lifted) return;
    const pane = panes(displayedLayout).find((pane) =>
      pane.tabs.includes(lifted),
    );
    if (!pane) return;
    const remaining = pane.tabs.filter((key) => key !== lifted);
    return {
      ...pane,
      active:
        remaining[Math.min(pane.tabs.indexOf(lifted), remaining.length - 1)],
    };
  }, [displayedLayout, lifted]);
  const regions = leaves.map(({ pane, ...box }) => {
    if (sourcePreview?.id === pane.id) pane = sourcePreview;
    if (preview?.pane !== pane.id || !preview.edge) return { pane, box };
    const drop = dropRegion(box, preview.edge, gutter);
    if (preview.edge === "left")
      return {
        pane,
        box: { ...box, x: drop.x + drop.width + columnGap, width: drop.width },
      };
    if (preview.edge === "right")
      return { pane, box: { ...box, width: drop.width } };
    return { pane, box: { ...box, height: drop.y - box.y - rowGap } };
  });
  const transition = !resizing && size.width > 0 && stableGeometry;
  const top = Math.min(...leaves.map((leaf) => leaf.y));
  const topRight = leaves
    .filter((leaf) => leaf.y === top)
    .reduce<(typeof leaves)[number] | undefined>(
      (best, leaf) => (!best || leaf.x > best.x ? leaf : best),
      undefined,
    )?.pane.id;
  return (
    <div className="lab-surface">
      <div
        ref={board}
        className="lab-board"
        style={{
          minWidth: required.x,
          minHeight: required.y,
        }}
      >
        {regions.map(({ pane, box }, index) => (
          <div
            key={pane.id}
            data-pane-header={pane.id}
            data-top={box.y === 0 || undefined}
            className="lab-pane-header"
            style={{
              ...position({ ...box, height: tabHeight }),
              transitionDuration: transition
                ? "var(--workspace-duration, 180ms)"
                : "0ms",
            }}
          >
            <PaneHeader
              pane={pane}
              first={index === 0}
              last={pane.id === topRight}
              docking={stableDocking}
              insertion={preview?.pane === pane.id ? preview.index : undefined}
              board={board}
              render={header}
            />
          </div>
        ))}
        {content(regions, transition, lifted)}
        {dividers.map(({ split, bounds, ratio, low, high, ...box }) => {
          const axis = split.axis,
            horizontal = axis === "x",
            dimension = horizontal ? "width" : "height";
          const primary = panes(split.first).filter((p) => p.active);
          const resize = (value: number, preview = false) => {
            const next = updateLayout(displayedLayout, split.id, (node) => ({
              ...node,
              ratio: Math.max(low, Math.min(high, value)),
            }));
            if (preview) {
              resizeDraftRef.current = { base: layout, layout: next };
              setResizeDraft(resizeDraftRef.current);
            } else {
              cancelResize();
              change(next);
            }
          };
          const target = (
            <div
              role="separator"
              aria-label={horizontal ? "Resize columns" : "Resize rows"}
              aria-labelledby={primary.map((p) => ids.tab(p.active!)).join(" ")}
              aria-controls={primary.map((p) => ids.panel(p.active!)).join(" ")}
              aria-valuetext={`${Math.round(ratio * 100)}% ${horizontal ? "width" : "height"}`}
              title={
                menu
                  ? "Drag to resize, use arrow keys, or open resize actions with right-click or Shift+F10"
                  : "Drag to resize or use arrow keys"
              }
              aria-orientation={horizontal ? "vertical" : "horizontal"}
              aria-valuenow={Math.round(ratio * 100)}
              aria-valuemin={Math.round(low * 100)}
              aria-valuemax={Math.round(high * 100)}
              tabIndex={0}
              className="lab-divider"
              style={position({
                ...box,
                [axis]: box[axis] + gutter[axis] / 2 - 12,
                [dimension]: 24,
              })}
              onDoubleClick={() => resize(horizontal ? 0.5 : 2 / 3)}
              onPointerDown={(event) => {
                if (event.button !== 0) return;
                event.preventDefault();
                event.currentTarget.setPointerCapture(event.pointerId);
                setResizing(true);
              }}
              onPointerMove={(event) => {
                if (!event.currentTarget.hasPointerCapture(event.pointerId))
                  return;
                const { clientX, clientY } = event;
                resizePointer.schedule(() => {
                  const b = board.current!.getBoundingClientRect();
                  const coordinate = horizontal
                    ? clientX - b.left
                    : clientY - b.top;
                  resize(
                    (coordinate - bounds[axis]) /
                      (bounds[dimension] - gutter[axis]),
                    true,
                  );
                });
              }}
              onPointerUp={() => {
                resizePointer.flush();
                const draft = resizeDraftRef.current;
                if (draft?.base === layout) change(draft.layout);
                cancelResize();
              }}
              onPointerCancel={cancelResize}
              onLostPointerCapture={cancelResize}
              onKeyDown={(event) => {
                if (hasOpenOverlay()) return;
                const step = event.shiftKey ? 0.1 : 0.02;
                const values: Record<string, number> = {
                  [horizontal ? "ArrowLeft" : "ArrowUp"]: ratio - step,
                  [horizontal ? "ArrowRight" : "ArrowDown"]: ratio + step,
                  Home: low,
                  End: high,
                };
                const value = values[event.key];
                if (value === undefined) return;
                event.preventDefault();
                resize(value);
              }}
            />
          );
          return (
            <Fragment key={split.id}>
              {menu
                ? menu(target, [
                    {
                      label: horizontal ? "Narrower" : "Shorter",
                      onSelect: () => resize(ratio - 0.1),
                    },
                    {
                      label: horizontal ? "Wider" : "Taller",
                      onSelect: () => resize(ratio + 0.1),
                    },
                    {
                      label: "Reset size",
                      onSelect: () => resize(horizontal ? 0.5 : 2 / 3),
                    },
                  ])
                : target}
            </Fragment>
          );
        })}
        <span role="status" className="lab-sr-only">
          {preview?.pane &&
            (preview.edge ? `Split ${preview.edge}` : "Move tab here")}
        </span>
      </div>
    </div>
  );
}
