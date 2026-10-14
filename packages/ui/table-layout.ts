import * as React from "react";
import { clampColumnWidth, visibleRowRange } from "./table-model.js";

const margin = 32;

// Fixed-height rows render only the viewport; other tables keep natural heights
export function useTableWindow(count: number, rowHeight?: number) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = React.useState({ top: 0, height: 0 });

  React.useLayoutEffect(() => {
    const node = scrollRef.current;
    if (!node || !rowHeight) return;
    const measure = () =>
      setViewport({
        top: Math.max(0, node.scrollTop - margin),
        height: node.clientHeight,
      });
    measure();
    node.addEventListener("scroll", measure, { passive: true });
    const observer =
      typeof ResizeObserver === "undefined"
        ? undefined
        : new ResizeObserver(measure);
    observer?.observe(node);
    return () => {
      node.removeEventListener("scroll", measure);
      observer?.disconnect();
    };
  }, [rowHeight]);

  const range = rowHeight
    ? visibleRowRange(count, viewport.top, viewport.height, rowHeight)
    : { start: 0, end: count };

  function reveal(index: number) {
    const node = scrollRef.current;
    if (!node || !rowHeight) return;
    const top = index * rowHeight;
    const height = node.clientHeight || 360;
    if (top < node.scrollTop) node.scrollTop = top;
    else if (top + rowHeight > node.scrollTop + height - margin)
      node.scrollTop = top + rowHeight - height + margin;
    setViewport({ top: Math.max(0, node.scrollTop - margin), height });
  }

  return { scrollRef, range, reveal, viewportHeight: viewport.height || 360 };
}

export function useColumnResize() {
  const [widths, setWidths] = React.useState<Record<string, number>>({});
  const stop = React.useRef<() => void>(() => {});
  React.useEffect(() => () => stop.current(), []);

  function change(id: string, width: number) {
    setWidths((previous) => ({ ...previous, [id]: clampColumnWidth(width) }));
  }

  function start(
    event: React.PointerEvent<HTMLElement>,
    id: string,
    initial: number,
  ) {
    event.preventDefault();
    event.stopPropagation();
    stop.current();
    const origin = event.clientX;
    const move = (next: PointerEvent) =>
      change(id, initial + next.clientX - origin);
    stop.current = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop.current);
      window.removeEventListener("pointercancel", stop.current);
      stop.current = () => {};
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop.current);
    window.addEventListener("pointercancel", stop.current);
  }

  return { widths, change, start };
}

// Loads the next chunk once the sentinel nears the bottom, one chunk at a time
export function useLoadMore(
  root: React.RefObject<HTMLElement | null>,
  onLoadMore: (() => void | Promise<void>) | undefined,
  hasMore: boolean,
) {
  const sentinel = React.useRef<HTMLTableRowElement>(null);
  const [loading, setLoading] = React.useState(false);
  const pending = React.useRef(false);

  React.useEffect(() => {
    const target = sentinel.current;
    if (!target || !onLoadMore || !hasMore) return;
    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting || pending.current) return;
        pending.current = true;
        setLoading(true);
        try {
          await onLoadMore();
        } finally {
          pending.current = false;
          setLoading(false);
        }
      },
      { root: root.current, rootMargin: "0px 0px 200px 0px" },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [root, onLoadMore, hasMore]);

  return { sentinel, loading };
}
