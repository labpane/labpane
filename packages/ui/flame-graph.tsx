import * as React from "react";
import { Button } from "./button.js";
import { ChartFrame } from "./chart-frame.js";
import { Input } from "./input.js";
import {
  flameLayout,
  flamePath,
  indexFlameNodes,
  type FlameNode,
} from "./flame-graph-model.js";
import { useChartWidth } from "./use-chart-width.js";

export type { FlameNode } from "./flame-graph-model.js";

export type FlameGraphProps = {
  nodes: FlameNode[];
  label?: string;
  unit?: string;
  countLabel?: string;
  meanLabel?: string;
  focusId?: string | null;
  onFocusChange?: (id: string | null) => void;
};

const ROW_HEIGHT = 34;
const BAR_HEIGHT = 31;
const PLOT_PADDING = 16;
const MIN_HEIGHT = 170;
const MIN_PLOT_WIDTH = 180;
const SEARCH_LIMIT = 100;
const TOOLTIP_WIDTH = 282;
const TOOLTIP_HEIGHT = 170;
const PALETTE_SIZE = 5;

const formatValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 3 });
const percent = (part: number, total: number) =>
  total > 0 ? `${((part / total) * 100).toFixed(2)}%` : "0%";
const names = (path: FlameNode[]) => path.map((node) => node.name).join(" / ");

function paletteColor(name: string) {
  let hash = 0;
  for (const letter of name) hash = (hash * 31 + letter.charCodeAt(0)) >>> 0;
  return `var(--labui-chart-${1 + (hash % PALETTE_SIZE)})`;
}

function barText(node: FlameNode, width: number, rootTotal: number) {
  const text =
    width > 160
      ? `${node.name} (${percent(node.total, rootTotal)})`
      : node.name;
  return text.slice(0, Math.max(1, Math.floor((width - 14) / 7)));
}

function FlameDetails({
  node,
  root,
  parent,
  unit,
  countLabel,
  meanLabel,
}: {
  node: FlameNode;
  root: FlameNode;
  parent?: FlameNode;
  unit: string;
  countLabel: string;
  meanLabel: string;
}) {
  const term = "labui:text-muted-foreground";
  return (
    <>
      <div className="labui:font-mono labui:text-sm labui:font-semibold labui:break-all">
        {node.name}
      </div>
      <dl className="labui:mt-2 labui:grid labui:grid-cols-2 labui:gap-x-6 labui:gap-y-1 labui:text-xs labui:tabular-nums">
        <dt className={term}>Total (inclusive)</dt>
        <dd>
          {formatValue(node.total)} {unit}
        </dd>
        <dt className={term}>Self (exclusive)</dt>
        <dd>
          {formatValue(node.self)} {unit}
        </dd>
        <dt className={term}>Share of selection</dt>
        <dd>{percent(node.total, root.total)}</dd>
        <dt className={term}>Share of parent</dt>
        <dd>{percent(node.total, parent?.total ?? root.total)}</dd>
        <dt className={term}>{countLabel}</dt>
        <dd>{formatValue(node.calls)}</dd>
        <dt className={term}>{meanLabel}</dt>
        <dd>
          {formatValue(node.calls ? node.total / node.calls : 0)} {unit}
        </dd>
      </dl>
      {node.detail && (
        <p className="labui:mt-2 labui:font-mono labui:text-xs labui:break-all labui:text-muted-foreground">
          {node.detail}
        </p>
      )}
    </>
  );
}

/** Interactive flame graph over caller-supplied data: hover or focus to inspect, click to zoom. */
const FlameGraph = React.forwardRef<HTMLDivElement, FlameGraphProps>(
  function FlameGraph(
    {
      nodes,
      label = "Flame graph",
      unit = "ms",
      countLabel = "Calls observed",
      meanLabel = "Mean per call",
      focusId,
      onFocusChange,
    },
    ref,
  ) {
    const { container, width } = useChartWidth();
    React.useImperativeHandle(ref, () => container.current as HTMLDivElement, [
      container,
    ]);
    const svg = React.useRef<SVGSVGElement>(null);
    const helpId = React.useId();
    const [ownFocus, setOwnFocus] = React.useState<string | null>(null);
    const [inspected, setInspected] = React.useState<string | null>(null);
    const [search, setSearch] = React.useState("");
    const [tooltip, setTooltip] = React.useState<{
      x: number;
      y: number;
    } | null>(null);
    const byId = React.useMemo(() => indexFlameNodes(nodes), [nodes]);
    const root = nodes.find((node) => node.parentId === null);
    const requestedId = focusId === undefined ? ownFocus : focusId;
    const focusedId =
      requestedId !== null && byId.has(requestedId)
        ? requestedId
        : (root?.id ?? "");
    const focused = byId.get(focusedId);
    const active = (inspected && byId.get(inspected)) || focused;
    const plotWidth = Math.max(MIN_PLOT_WIDTH, width - 32);
    const rects = React.useMemo(
      () => flameLayout(nodes, focusedId, plotWidth),
      [nodes, focusedId, plotWidth],
    );
    const depth = rects.reduce((max, rect) => Math.max(max, rect.depth), 0);
    const height = Math.max(
      MIN_HEIGHT,
      (depth + 1) * ROW_HEIGHT + PLOT_PADDING,
    );
    const query = search.trim().toLowerCase();
    const matches = query
      ? nodes.filter((node) => node.name.toLowerCase().includes(query))
      : [];
    const ancestry = (id: string) => flamePath(byId, id);
    const parentOf = (node: FlameNode) =>
      node.parentId === null ? undefined : byId.get(node.parentId);

    function zoom(node: FlameNode) {
      setOwnFocus(node.id);
      onFocusChange?.(node.id);
      setInspected(node.id);
      setTooltip(null);
    }
    function reset() {
      setOwnFocus(null);
      onFocusChange?.(null);
      setInspected(null);
      setTooltip(null);
    }
    function focusBar(id: string) {
      setInspected(id);
      const bars = svg.current?.querySelectorAll<SVGGElement>("[data-node-id]");
      for (const bar of bars ?? []) if (bar.dataset.nodeId === id) bar.focus();
    }
    function keyboardTarget(key: string, node: FlameNode) {
      if (key === "Home") return focused;
      if (key === "ArrowDown") return parentOf(node);
      if (key === "ArrowUp")
        return rects.find((rect) => rect.node.parentId === node.id)?.node;
      if (key === "ArrowLeft" || key === "ArrowRight") {
        const siblings = rects.filter(
          (rect) => rect.node.parentId === node.parentId,
        );
        const index = siblings.findIndex((rect) => rect.node.id === node.id);
        return siblings[index + (key === "ArrowLeft" ? -1 : 1)]?.node;
      }
      return undefined;
    }
    function keydown(event: React.KeyboardEvent<SVGGElement>, node: FlameNode) {
      const { key } = event;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        zoom(node);
        return;
      }
      if (key === "Escape" || key === "Backspace") {
        event.preventDefault();
        const parent = focused && parentOf(focused);
        if (parent) zoom(parent);
        else reset();
        return;
      }
      if (key.startsWith("Arrow") || key === "Home") event.preventDefault();
      const target = keyboardTarget(key, node);
      if (target && rects.some((rect) => rect.node.id === target.id))
        focusBar(target.id);
    }
    function showTooltip(x: number, y: number) {
      setTooltip({
        x: Math.min(x + 24, Math.max(0, plotWidth - TOOLTIP_WIDTH)),
        y: Math.max(8, Math.min(y + 50, height - TOOLTIP_HEIGHT)),
      });
    }

    const details = active && root && (
      <FlameDetails
        node={active}
        root={root}
        parent={parentOf(active)}
        unit={unit}
        countLabel={countLabel}
        meanLabel={meanLabel}
      />
    );

    return (
      <ChartFrame data-slot="flame-graph" aria-label={label} ref={container}>
        <div className="labui:flex labui:flex-wrap labui:items-center labui:justify-between labui:gap-3 labui:border-b labui:p-4">
          <div>
            <h2 className="labui:text-sm labui:font-semibold">{label}</h2>
            <p className="labui:text-xs labui:text-muted-foreground">
              Width is inclusive time, gaps are self time
            </p>
          </div>
          <div className="labui:flex labui:items-center labui:gap-2">
            <Input
              aria-label="Search flame graph"
              placeholder="Find a function or phase"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="labui:w-44"
            />
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={reset}
              disabled={!ownFocus && !focusId}
            >
              Reset zoom
            </Button>
          </div>
        </div>
        {!root || !focused || !rects.length ? (
          <p className="labui:p-8 labui:text-sm labui:text-muted-foreground">
            No timing data in this selection.
          </p>
        ) : (
          <>
            <nav
              aria-label="Flame graph ancestry"
              className="labui:flex labui:flex-wrap labui:items-center labui:gap-1 labui:border-b labui:px-4 labui:py-2"
            >
              {ancestry(focused.id).map((node, index) => (
                <React.Fragment key={node.id}>
                  {index > 0 && (
                    <span
                      aria-hidden="true"
                      className="labui:text-muted-foreground"
                    >
                      /
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    onClick={() => zoom(node)}
                    aria-current={
                      node.id === focused.id ? "location" : undefined
                    }
                  >
                    {node.name}
                  </Button>
                </React.Fragment>
              ))}
            </nav>
            {query && (
              <div className="labui:max-h-48 labui:overflow-y-auto labui:border-b labui:p-3">
                <p
                  role="status"
                  className="labui:mb-2 labui:text-xs labui:text-muted-foreground"
                >
                  {matches.length} matching entries
                  {matches.length > SEARCH_LIMIT
                    ? `, showing first ${SEARCH_LIMIT}`
                    : ""}
                </p>
                {matches.slice(0, SEARCH_LIMIT).map((node) => (
                  <button
                    key={node.id}
                    type="button"
                    className="labui:block labui:w-full labui:rounded labui:px-2 labui:py-1 labui:text-left labui:text-xs labui:hover:bg-accent labui:focus-visible:outline-2"
                    onClick={() => zoom(node)}
                  >
                    {names(ancestry(node.id))}{" "}
                    <span className="labui:text-muted-foreground">
                      {formatValue(node.total)} {unit}
                    </span>
                  </button>
                ))}
              </div>
            )}
            <div
              className="labui:relative labui:overflow-x-auto labui:p-4"
              onPointerLeave={() => setTooltip(null)}
            >
              <svg
                ref={svg}
                viewBox={`0 0 ${plotWidth} ${height}`}
                width="100%"
                height={height}
                aria-label="Timing call tree"
                aria-describedby={helpId}
              >
                {rects
                  .filter(
                    (rect) => rect.width >= 0.5 || rect.node.id === focused.id,
                  )
                  .map(({ node, x, width: barWidth, depth }) => {
                    const y = height - PLOT_PADDING - (depth + 1) * ROW_HEIGHT;
                    const matched =
                      !query || node.name.toLowerCase().includes(query);
                    const current = node.id === (active?.id ?? focused.id);
                    return (
                      <g
                        key={node.id}
                        role="button"
                        tabIndex={current ? 0 : -1}
                        data-node-id={node.id}
                        aria-label={`${node.name}, total ${formatValue(node.total)} ${unit}, self ${formatValue(node.self)} ${unit}. Press to zoom in`}
                        className="labui:cursor-pointer labui:outline-none labui:focus-visible:[&>rect]:stroke-foreground labui:focus-visible:[&>rect]:stroke-2"
                        onClick={() => zoom(node)}
                        onKeyDown={(event) => keydown(event, node)}
                        onFocus={() => {
                          setInspected(node.id);
                          setTooltip(null);
                        }}
                        onPointerMove={() => {
                          setInspected(node.id);
                          showTooltip(x, y);
                        }}
                      >
                        <title>{`${names(ancestry(node.id))}\nTotal ${formatValue(node.total)} ${unit}; self ${formatValue(node.self)} ${unit}; ${node.calls} ${countLabel.toLowerCase()}`}</title>
                        <rect
                          x={x}
                          y={y}
                          width={Math.max(0, barWidth - 1)}
                          height={BAR_HEIGHT}
                          rx={3}
                          fill={node.color || paletteColor(node.name)}
                          opacity={matched ? 1 : 0.25}
                          stroke={
                            node.id === active?.id
                              ? "var(--labui-foreground)"
                              : "transparent"
                          }
                        />
                        {barWidth > 38 && (
                          <text
                            x={x + 7}
                            y={y + 20}
                            fill="var(--labui-primary-foreground)"
                            fontSize={12}
                            pointerEvents="none"
                          >
                            {barText(node, barWidth, root.total)}
                          </text>
                        )}
                      </g>
                    );
                  })}
              </svg>
              {tooltip && (
                <div
                  role="tooltip"
                  className="labui:pointer-events-none labui:absolute labui:z-10 labui:w-64 labui:rounded-lg labui:border labui:bg-popover labui:p-3 labui:text-popover-foreground labui:shadow-lg"
                  style={{
                    left: tooltip.x + 16,
                    top: tooltip.y,
                    maxWidth: plotWidth,
                  }}
                >
                  {details}
                </div>
              )}
            </div>
            <div className="labui:grid labui:gap-4 labui:border-t labui:bg-muted/20 labui:p-4 labui:sm:grid-cols-2">
              <div aria-live="polite" aria-atomic="true">
                {details}
              </div>
              <div className="labui:text-xs labui:leading-relaxed labui:text-muted-foreground">
                {active && (
                  <p className="labui:mb-2 labui:font-mono labui:break-words">
                    {names(ancestry(active.id))}
                  </p>
                )}
                <p id={helpId}>
                  Hover or focus to inspect. Click or press Enter to zoom. Use
                  arrow keys to move through the tree, Escape to return to the
                  caller, and the breadcrumbs to return further. Horizontal
                  position groups calls; it is not a timeline.
                </p>
              </div>
            </div>
          </>
        )}
      </ChartFrame>
    );
  },
);

export { FlameGraph };
