import * as React from "react";
import { ChartFrame } from "./chart-frame.js";
import { cn } from "./classes.js";
import {
  clockLabel,
  compactNumber,
  elapsedLabel,
  formatMetric,
  linePath,
  nearestIndex,
  summarize,
  timelineModel,
  type TimelineMetric,
  type TimelineSeries,
} from "./timeline-model.js";
import { useChartWidth } from "./use-chart-width.js";

export {
  bytesLabel,
  clockLabel,
  compactNumber,
  elapsedLabel,
  fieldIndex,
  formatMetric,
  hasTimelineData,
  nearestIndex,
  rates,
  summarize,
  timelineCSV,
  timelineModel,
  timelineValues,
  timeTicks,
  valueTicks,
  type TimelineMetric,
  type TimelineModel,
  type TimelineSeries,
} from "./timeline-model.js";

export type TimelineChartProps = {
  series: TimelineSeries;
  metric: TimelineMetric;
  start?: number;
  live?: boolean;
  height?: number;
  hover?: number | null;
  onHover?: (time: number | null) => void;
  colors?: string[];
  label?: string;
  className?: string;
};

const lineColor = "var(--labui-chart-2)";
const contextColor = "var(--labui-muted-foreground)";
const statusColor = "var(--labui-destructive)";
const thresholdColor = "var(--labui-warning)";
const surfaceColor = "var(--labui-card)";
const stackColors = [
  "var(--labui-chart-step-1)",
  "var(--labui-chart-step-2)",
  "var(--labui-chart-step-3)",
];
const HANDLED_KEYS = ["ArrowLeft", "ArrowRight", "Home", "End", "Escape"];

function Key({ color, label }: { color: string; label: string }) {
  return (
    <span className="labui:inline-flex labui:items-center labui:gap-1">
      <span
        aria-hidden="true"
        className="labui:inline-block labui:h-0.5 labui:w-3 labui:rounded"
        style={{ background: color }}
      />
      {label}
    </span>
  );
}

function Row({
  color,
  swatch,
  value,
  label,
}: {
  color: string;
  swatch?: boolean;
  value: string;
  label: string;
}) {
  return (
    <div className="labui:flex labui:items-center labui:gap-1.5">
      <span
        aria-hidden="true"
        className={cn(
          "labui:inline-block labui:rounded",
          swatch ? "labui:size-2.5 labui:rounded-sm" : "labui:h-0.5 labui:w-3",
        )}
        style={{ background: color }}
      />
      <strong className="labui:tabular-nums">{value}</strong>
      <span className="labui:text-muted-foreground">{label}</span>
    </div>
  );
}

const TimelineChart = React.forwardRef<HTMLDivElement, TimelineChartProps>(
  function TimelineChart(
    {
      series,
      metric,
      start,
      live = false,
      height = 190,
      hover,
      onHover,
      colors = stackColors,
      label,
      className,
    },
    ref,
  ) {
    const { container, width } = useChartWidth();
    const id = React.useId();
    const [local, setLocal] = React.useState<number | null>(null);
    const [focused, setFocused] = React.useState(false);
    const shared = onHover !== undefined;
    const hoverTime = shared ? (hover ?? null) : local;
    const setHover = (time: number | null) => {
      if (shared) onHover(time);
      else setLocal(time);
    };
    const model = React.useMemo(
      () => timelineModel(series, metric, width, height, start),
      [series, metric, width, height, start],
    );
    const digits = metric.digits ?? 1;
    const thresholdDigits = Math.max(
      digits,
      Math.min(2, (String(model.threshold ?? 0).split(".")[1] ?? "").length),
    );
    const lineLabel = metric.lineLabel ?? metric.title.toLowerCase();
    const last = model.times.length - 1;
    const index =
      hoverTime === null || last < 0
        ? null
        : nearestIndex(model.times, hoverTime);
    const at = index ?? last;
    const stackShare = (i: number) => {
      const total = model.totals[i] ?? 0;
      const top = model.stack?.at(-1)?.[i] ?? 0;
      return total ? (top / total) * 100 : undefined;
    };
    const readout = (i: number) =>
      metric.stack ? stackShare(i) : model.line[i];
    const summary = metric.stack ? "mean" : (metric.summary ?? "peak");
    const headline =
      index !== null
        ? readout(index)
        : live
          ? at >= 0
            ? readout(at)
            : undefined
          : summarize(
              metric.stack
                ? model.times.map((_, i) => stackShare(i) ?? 0)
                : model.line,
              model.busy,
              summary,
            );
    const headlineText = metric.stack
      ? headline === undefined
        ? "–"
        : `${compactNumber(headline, 0)}% on ${metric.stack.at(-1)?.label}`
      : formatMetric(metric, headline);
    const point =
      at >= 0
        ? {
            t: model.times[at]!,
            value: model.line[at],
            low: model.low?.[at],
            high: model.high?.[at],
            context: model.context?.[at],
            status: model.status?.[at],
            stack: model.stack?.map((s) => s[at] ?? 0),
          }
        : undefined;
    const describe = () => {
      if (!point) return "";
      const parts = [
        `${elapsedLabel(point.t - model.x0)}, ${clockLabel(point.t)}.`,
      ];
      if (metric.stack)
        metric.stack.forEach((layer, k) =>
          parts.push(
            `${layer.label} ${compactNumber(point.stack?.[k] ?? 0, 0)}.`,
          ),
        );
      else parts.push(`${lineLabel} ${formatMetric(metric, point.value)}.`);
      if (point.low !== undefined && point.high !== undefined)
        parts.push(
          `${metric.bandLabel ?? "p10–p90"} ${compactNumber(point.low, digits)} to ${compactNumber(point.high, digits)}.`,
        );
      if (point.context !== undefined)
        parts.push(
          `${metric.contextLabel ?? metric.context} ${compactNumber(point.context, digits)}.`,
        );
      if (point.status !== undefined)
        parts.push(
          `${metric.statusLabel ?? metric.status} ${compactNumber(point.status, digits)}.`,
        );
      return parts.join(" ");
    };
    const move = (event: React.PointerEvent<SVGSVGElement>) => {
      if (last < 0) return;
      const rect = event.currentTarget.getBoundingClientRect();
      const scale = rect.width ? width / rect.width : 1;
      const px = (event.clientX - rect.left) * scale;
      const t =
        model.x0 +
        ((px - model.left) / (width - model.left - model.right)) *
          (model.x1 - model.x0);
      setFocused(true);
      setHover(model.times[nearestIndex(model.times, t)]!);
    };
    const key = (event: React.KeyboardEvent<SVGSVGElement>) => {
      if (last < 0 || !HANDLED_KEYS.includes(event.key)) return;
      event.preventDefault();
      const current = index ?? last;
      const next =
        event.key === "ArrowLeft"
          ? Math.max(0, current - 1)
          : event.key === "ArrowRight"
            ? Math.min(last, current + 1)
            : event.key === "Home"
              ? 0
              : event.key === "End"
                ? last
                : null;
      setFocused(next !== null);
      setHover(next === null ? null : model.times[next]!);
    };
    const leave = () => {
      setFocused(false);
      setHover(null);
    };
    const crosshair = index !== null && point;
    const tooltipLeft = point ? model.x(point.t) : 0;
    const flip = tooltipLeft > width - 190;
    const legend = metric.stack
      ? metric.stack.map((layer, k) => (
          <Key
            key={layer.field}
            color={colors[k] ?? lineColor}
            label={layer.label}
          />
        ))
      : [
          (metric.context || model.status) && (
            <Key key="line" color={lineColor} label={lineLabel} />
          ),
          metric.context && (
            <Key
              key="context"
              color={contextColor}
              label={metric.contextLabel ?? metric.context}
            />
          ),
          model.status && (
            <Key
              key="status"
              color={statusColor}
              label={metric.statusLabel ?? metric.status!}
            />
          ),
          model.threshold !== undefined && (
            <Key
              key="threshold"
              color={thresholdColor}
              label={metric.thresholdLabel ?? "limit"}
            />
          ),
        ].filter(Boolean);
    const name = label ?? `${metric.title} over time`;

    return (
      <ChartFrame
        ref={ref}
        data-slot="timeline-chart"
        aria-label={name}
        className={cn("labui:gap-2 labui:px-4 labui:py-3", className)}
      >
        <div className="labui:flex labui:flex-wrap labui:items-baseline labui:justify-between labui:gap-x-3 labui:gap-y-1">
          <span className="labui:flex labui:flex-wrap labui:items-baseline labui:gap-x-3 labui:gap-y-1">
            <span className="labui:text-sm labui:font-medium">
              {metric.title}
            </span>
            {legend.length > 0 && (
              <span className="labui:inline-flex labui:flex-wrap labui:items-center labui:gap-x-3 labui:gap-y-1 labui:text-xs labui:text-muted-foreground">
                {legend}
              </span>
            )}
          </span>
          <span className="labui:text-base labui:font-semibold labui:tabular-nums">
            {headlineText}
            {index !== null && point ? (
              <span className="labui:ml-2 labui:text-xs labui:font-normal labui:text-muted-foreground">
                at {elapsedLabel(point.t - model.x0)}
              </span>
            ) : (
              !live &&
              headline !== undefined && (
                <span className="labui:ml-2 labui:text-xs labui:font-normal labui:text-muted-foreground">
                  {summary}
                </span>
              )
            )}
          </span>
        </div>
        <div ref={container} className="labui:relative labui:w-full">
          {last < 0 ? (
            <p
              className="labui:flex labui:items-center labui:justify-center labui:text-sm labui:text-muted-foreground"
              style={{ height }}
            >
              No data to display
            </p>
          ) : (
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              role="slider"
              aria-label={`${name}, interactive timeline`}
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={last}
              aria-valuenow={at}
              aria-valuetext={describe()}
              aria-describedby={`${id}-help`}
              tabIndex={0}
              className="labui:block labui:w-full labui:touch-none labui:rounded labui:outline-none labui:focus-visible:ring-2 labui:focus-visible:ring-ring labui:focus-visible:ring-inset"
              onPointerMove={move}
              onPointerLeave={leave}
              onKeyDown={key}
              onBlur={leave}
            >
              {model.yTicks.map((tick, i) => (
                <g key={tick} aria-hidden="true">
                  <line
                    x1={model.left}
                    x2={width - model.right}
                    y1={model.y(tick)}
                    y2={model.y(tick)}
                    stroke="var(--labui-border)"
                    strokeWidth={1}
                  />
                  <text
                    x={model.left - 6}
                    y={model.y(tick) + 3}
                    textAnchor="end"
                    fontSize={10}
                    fill={contextColor}
                  >
                    {model.labels[i]}
                  </text>
                </g>
              ))}
              {model.xTicks.map((offset) => (
                <text
                  key={offset}
                  aria-hidden="true"
                  x={model.x(model.x0 + offset)}
                  y={height - 8}
                  textAnchor={offset === 0 ? "start" : "middle"}
                  fontSize={10}
                  fill={contextColor}
                >
                  {elapsedLabel(offset)}
                </text>
              ))}
              {model.stackPaths.map((path, k) => (
                <path key={k} d={path} fill={colors[k] ?? lineColor} />
              ))}
              {model.separatorPaths.map((path, k) => (
                <path
                  key={k}
                  d={path}
                  fill="none"
                  stroke={surfaceColor}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ))}
              {model.bandPath && (
                <path d={model.bandPath} fill={lineColor} fillOpacity={0.15} />
              )}
              {model.contextPath && (
                <path
                  d={model.contextPath}
                  fill="none"
                  stroke={contextColor}
                  strokeWidth={1.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  strokeOpacity={0.7}
                />
              )}
              {model.linePath && (
                <path
                  d={model.linePath}
                  fill="none"
                  stroke={lineColor}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {model.statusPath && (
                <path
                  d={model.statusPath}
                  fill="none"
                  stroke={statusColor}
                  strokeWidth={2}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              )}
              {model.threshold !== undefined && (
                <g aria-hidden="true">
                  <line
                    x1={model.left}
                    x2={width - model.right}
                    y1={model.y(model.threshold)}
                    y2={model.y(model.threshold)}
                    stroke={thresholdColor}
                    strokeWidth={1.5}
                    strokeDasharray="4 3"
                  />
                  <text
                    x={width - model.right}
                    y={model.y(model.threshold) - 4}
                    textAnchor="end"
                    fontSize={10}
                    fill={contextColor}
                  >
                    {metric.thresholdLabel ?? "limit"}{" "}
                    {compactNumber(model.threshold, thresholdDigits)}
                  </text>
                </g>
              )}
              {live && point && index === null && !metric.stack && (
                <circle
                  cx={model.x(point.t)}
                  cy={model.y(point.value ?? 0)}
                  r={4}
                  fill={lineColor}
                  stroke={surfaceColor}
                  strokeWidth={2}
                />
              )}
              {crosshair && (
                <g aria-hidden="true">
                  <line
                    x1={model.x(point.t)}
                    x2={model.x(point.t)}
                    y1={model.top}
                    y2={height - model.bottom}
                    stroke={contextColor}
                    strokeWidth={1}
                  />
                  {!metric.stack && (
                    <circle
                      cx={model.x(point.t)}
                      cy={model.y(point.value ?? 0)}
                      r={4}
                      fill={lineColor}
                      stroke={surfaceColor}
                      strokeWidth={2}
                    />
                  )}
                </g>
              )}
            </svg>
          )}
          {crosshair && focused && (
            <div
              className="labui:pointer-events-none labui:absolute labui:top-2 labui:z-10 labui:rounded-md labui:border labui:bg-popover labui:px-2.5 labui:py-1.5 labui:text-xs labui:text-popover-foreground labui:shadow-md"
              style={
                flip
                  ? { right: width - tooltipLeft + 10 }
                  : { left: tooltipLeft + 10 }
              }
            >
              <div className="labui:text-muted-foreground labui:tabular-nums">
                {elapsedLabel(point.t - model.x0)} · {clockLabel(point.t)}
              </div>
              {metric.stack ? (
                [...metric.stack].reverse().map((layer, r) => {
                  const k = metric.stack!.length - 1 - r;
                  return (
                    <Row
                      key={layer.field}
                      swatch
                      color={colors[k] ?? lineColor}
                      value={compactNumber(point.stack?.[k] ?? 0, 0)}
                      label={layer.label}
                    />
                  );
                })
              ) : (
                <Row
                  color={lineColor}
                  value={formatMetric(metric, point.value)}
                  label={lineLabel}
                />
              )}
              {point.low !== undefined && point.high !== undefined && (
                <div className="labui:text-muted-foreground labui:tabular-nums">
                  {metric.bandLabel ?? "p10–p90"}{" "}
                  {compactNumber(point.low, digits)}–
                  {compactNumber(point.high, digits)}
                </div>
              )}
              {point.context !== undefined && (
                <Row
                  color={contextColor}
                  value={compactNumber(point.context, digits)}
                  label={metric.contextLabel ?? metric.context!}
                />
              )}
              {point.status !== undefined && (
                <Row
                  color={statusColor}
                  value={compactNumber(point.status, digits)}
                  label={metric.statusLabel ?? metric.status!}
                />
              )}
            </div>
          )}
        </div>
        <p id={`${id}-help`} className="labui:sr-only">
          Hover or use the arrow keys to inspect a moment. Home and End jump to
          the ends, Escape clears.
        </p>
      </ChartFrame>
    );
  },
);

export type SparklineProps = {
  values: number[];
  label: string;
  width?: number;
  height?: number;
  className?: string;
};

const Sparkline = React.forwardRef<SVGSVGElement, SparklineProps>(
  function Sparkline(
    { values, label, width = 96, height = 24, className },
    ref,
  ) {
    const path = React.useMemo(() => {
      if (values.length < 2) return undefined;
      let min = Math.min(...values);
      let max = Math.max(...values);
      if (max === min) {
        min -= 1;
        max += 1;
      }
      const pad = 3;
      const xs = values.map(
        (_, i) => pad + (i / (values.length - 1)) * (width - 2 * pad),
      );
      const ys = values.map(
        (v) => pad + (1 - (v - min) / (max - min)) * (height - 2 * pad),
      );
      return { d: linePath(xs, ys), x: xs.at(-1)!, y: ys.at(-1)! };
    }, [values, width, height]);
    return (
      <svg
        ref={ref}
        role="img"
        aria-label={label}
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className={cn("labui:shrink-0", className)}
      >
        <title>{label}</title>
        {path ? (
          <>
            <path
              d={path.d}
              fill="none"
              stroke={lineColor}
              strokeWidth={1.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={path.x}
              cy={path.y}
              r={2.5}
              fill={lineColor}
              stroke={surfaceColor}
              strokeWidth={1.5}
            />
          </>
        ) : (
          <line
            x1={3}
            x2={width - 3}
            y1={height / 2}
            y2={height / 2}
            stroke="var(--labui-border)"
            strokeWidth={1}
          />
        )}
      </svg>
    );
  },
);

export { Sparkline, TimelineChart };
