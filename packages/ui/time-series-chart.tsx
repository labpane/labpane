import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { ChevronDownIcon } from "lucide-react";
import { Button } from "./button.js";
import { ChartFrame } from "./chart-frame.js";
import { Checkbox } from "./checkbox.js";
import { cn } from "./classes.js";
import { Input } from "./input.js";
import {
  DAY,
  FORECAST_DAYS,
  INDICATOR_PERIOD,
  chartModel,
  clampRange,
  nearestPoint,
  zoomRange,
  type ChartOptions,
  type Range,
  type SeriesPoint,
} from "./time-series-model.js";
import { useChartWidth } from "./use-chart-width.js";

export {
  DAY,
  DEFAULT_OPTIONS,
  type ChartOptions,
  type SeriesPoint,
} from "./time-series-model.js";

export type TimeSeriesChartProps = {
  points: SeriesPoint[];
  series: { key: string; color: string }[];
  start: number;
  options: ChartOptions;
  onOptionsChange: (options: ChartOptions) => void;
  title?: string;
  subtitle?: string;
  unit?: string;
  label: string;
};

type Series = TimeSeriesChartProps["series"][number];
type Model = ReturnType<typeof chartModel>;
type Indicator = Model["computed"][number];
type Selected = readonly [SeriesPoint, SeriesPoint];

const ZOOM_IN = 0.65;
const ZOOM_OUT = 1.5;
const WINDOWS = [
  ["1W", 7],
  ["1M", 30],
  ["3M", 90],
] as const;
const INDICATORS = [
  ["sma", `Moving average, ${INDICATOR_PERIOD} days`],
  ["ema", `Exponential average, ${INDICATOR_PERIOD} days`],
  ["bollinger", "Bollinger bands, 2 sigma"],
  ["forecast", `Trend forecast, ${FORECAST_DAYS} days`],
] as const;
const HANDLED_KEYS = [
  "ArrowLeft",
  "ArrowRight",
  "Home",
  "End",
  "+",
  "=",
  "-",
  "0",
  "r",
  "R",
  " ",
  "Escape",
];

const gutter = "labui:px-4 labui:sm:px-5";
const mutedSmall = "labui:text-[11px] labui:text-muted-foreground";
const settingsRow =
  "labui:flex labui:min-h-8 labui:cursor-pointer labui:items-center labui:gap-2 labui:text-xs";
const settingsHeading =
  "labui:mb-2 labui:text-[11px] labui:font-medium labui:text-muted-foreground";
const indicatorLine = {
  fill: "none",
  strokeWidth: 1.7,
  strokeLinejoin: "round",
} as const;
const crosshair = {
  stroke: "var(--labui-foreground)",
  strokeOpacity: 0.45,
  strokeDasharray: "3 4",
  strokeWidth: 1,
} as const;

const compactFormat = new Intl.NumberFormat(undefined, {
  notation: "compact",
  maximumFractionDigits: 1,
});
const formatNumber = (value: number) => Math.round(value).toLocaleString();
const formatCompact = (value: number) => compactFormat.format(value);
const formatDay = (time: number, withYear = false) =>
  new Date(time).toLocaleDateString(undefined, {
    timeZone: "UTC",
    month: "short",
    day: "numeric",
    ...(withYear ? { year: "numeric" } : {}),
  });
const formatSpan = (range: Range) =>
  `${formatDay(range[0], true)} to ${formatDay(range[1], true)}`;
const clampIndex = (index: number, length: number) =>
  Math.max(0, Math.min(length - 1, index));
const shownSeries = (series: Series[], point: SeriesPoint) =>
  series.filter((s) => point.values[s.key]);

function describeDelta(selected: Selected, unit: string) {
  const [from, to] = selected;
  const delta = to.total - from.total;
  const share = from.total
    ? ` (${((delta / from.total) * 100).toFixed(1)}%)`
    : ", percentage unavailable from zero";
  return `${delta >= 0 ? "+" : ""}${formatNumber(delta)} ${unit}${share}`;
}

function describePoint(point: SeriesPoint, series: Series[], unit: string) {
  const breakdown = shownSeries(series, point).map(
    (s) => `${s.key}: ${formatNumber(point.values[s.key]!)}`,
  );
  return [
    `${formatDay(point.time, true)}, ${formatNumber(point.total)} total ${unit}.`,
    breakdown.length ? `${breakdown.join(", ")}.` : "",
    point.annotation ? `${point.annotation}.` : "",
    point.carried ? "Last captured value carried forward." : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function describeIndicators(options: ChartOptions, indicator?: Indicator) {
  const parts: string[] = [];
  if (options.sma && indicator?.sma != null)
    parts.push(`Moving average ${formatNumber(indicator.sma)}.`);
  if (options.ema)
    parts.push(`Exponential average ${formatNumber(indicator?.ema ?? 0)}.`);
  if (options.bollinger && indicator?.upper != null)
    parts.push(
      `Bollinger range ${formatNumber(indicator.lower!)} to ${formatNumber(indicator.upper)}.`,
    );
  return parts.join(" ");
}

function placeTooltip(
  model: Model,
  width: number,
  height: number,
  x: number,
  y: number,
  rows: number,
  withIndicators: boolean,
) {
  const boxWidth = Math.min(244, width - 74);
  const boxHeight = 116 + rows * 22 + (withIndicators ? 50 : 0);
  const preferredLeft =
    x + boxWidth + 24 > model.plot.right ? x - boxWidth - 16 : x + 16;
  const preferredTop = y > height / 2 ? y - boxHeight - 12 : y + 12;
  return {
    width: boxWidth,
    left: Math.max(
      model.plot.left,
      Math.min(width - boxWidth - 8, preferredLeft),
    ),
    top: Math.max(
      model.plot.top,
      Math.min(height - boxHeight - 42, preferredTop),
    ),
  };
}

function Swatch({ color }: { color: string }) {
  return (
    <i
      aria-hidden="true"
      className="labui:inline-block labui:size-[7px] labui:shrink-0 labui:rounded-[2px]"
      style={{ background: color }}
    />
  );
}

function Segmented({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div role="group" aria-label={label} className="labui:flex labui:gap-0.5">
      {children}
    </div>
  );
}

function ChartSettings({
  options,
  onOptionsChange,
  locked,
  onLockedChange,
  onForecastEnabled,
}: {
  options: ChartOptions;
  onOptionsChange: (options: ChartOptions) => void;
  locked: boolean;
  onLockedChange: (locked: boolean) => void;
  onForecastEnabled: () => void;
}) {
  const logBaseId = React.useId();
  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <Button
          variant="outline"
          size="sm"
          type="button"
          aria-label="Chart settings"
        >
          Settings
          <ChevronDownIcon aria-hidden="true" />
        </Button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align="end"
          sideOffset={8}
          collisionPadding={8}
          className="labui:z-50 labui:w-[min(276px,calc(100vw-2rem))] labui:rounded-lg labui:border labui:bg-popover labui:p-4 labui:text-popover-foreground labui:shadow-lg labui:outline-none"
        >
          <h3 className={settingsHeading}>Display</h3>
          <label className={settingsRow}>
            <Checkbox
              checked={options.logarithmic}
              onCheckedChange={(checked) =>
                onOptionsChange({ ...options, logarithmic: checked === true })
              }
            />
            Logarithmic scale
          </label>
          {options.logarithmic && (
            <div className={settingsRow}>
              <label htmlFor={logBaseId}>Log base</label>
              <Input
                id={logBaseId}
                className="labui:h-8 labui:w-16"
                type="number"
                min={2}
                max={100}
                value={options.logBase}
                onChange={(event) => {
                  const base = Number(event.target.value);
                  if (base >= 2 && base <= 100)
                    onOptionsChange({ ...options, logBase: base });
                }}
              />
            </div>
          )}
          <label className={settingsRow}>
            <Checkbox
              checked={locked}
              onCheckedChange={(checked) => onLockedChange(checked === true)}
            />
            Lock vertical scale
          </label>
          <h3
            className={cn(
              settingsHeading,
              "labui:mt-3 labui:border-t labui:pt-3.5",
            )}
          >
            Indicators
          </h3>
          {INDICATORS.map(([key, text]) => (
            <label key={key} className={settingsRow}>
              <Checkbox
                checked={options[key]}
                onCheckedChange={(checked) => {
                  onOptionsChange({ ...options, [key]: checked === true });
                  if (key === "forecast" && checked === true)
                    onForecastEnabled();
                }}
              />
              {text}
            </label>
          ))}
          <p className="labui:mt-3 labui:text-[11px] labui:leading-relaxed labui:text-muted-foreground">
            Forecasts describe the recent trend, not a target.
          </p>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function Legend({
  series,
  point,
  unit,
}: {
  series: Series[];
  point: SeriesPoint;
  unit: string;
}) {
  return (
    <div
      className={cn(
        "labui:flex labui:min-h-10 labui:flex-wrap labui:gap-x-5 labui:gap-y-2 labui:pt-1.5 labui:pb-4 labui:text-[11px]",
        gutter,
      )}
      aria-label={`Series on ${formatDay(point.time)}`}
    >
      {shownSeries(series, point).map((s) => (
        <span
          key={s.key}
          className="labui:inline-flex labui:items-center labui:gap-1.5"
        >
          <Swatch color={s.color} />
          <span>{s.key}</span>
          <b className="labui:font-normal labui:text-muted-foreground labui:tabular-nums">
            {formatCompact(point.values[s.key]!)}
          </b>
        </span>
      ))}
      {!point.total && <span>No {unit} on this day</span>}
    </div>
  );
}

function Tooltip({
  point,
  series,
  unit,
  options,
  indicator,
  maxRows,
  style,
}: {
  point: SeriesPoint;
  series: Series[];
  unit: string;
  options: ChartOptions;
  indicator?: Indicator;
  maxRows: number;
  style: React.CSSProperties;
}) {
  const breakdown = shownSeries(series, point);
  const row = "labui:flex labui:items-center labui:justify-between labui:gap-2";
  const note =
    "labui:mt-1.5 labui:flex labui:justify-between labui:text-[10px] labui:text-muted-foreground";
  return (
    <div
      className="labui:pointer-events-none labui:absolute labui:z-10 labui:rounded-lg labui:border labui:bg-popover labui:p-3 labui:text-[11px] labui:text-popover-foreground labui:shadow-lg"
      aria-hidden="true"
      style={style}
    >
      <div className={row}>
        <b className="labui:font-medium">{formatDay(point.time, true)}</b>
        <code className="labui:text-[10px] labui:text-muted-foreground">
          {point.annotation}
        </code>
      </div>
      <div className="labui:my-2.5 labui:flex labui:items-baseline labui:gap-2 labui:border-b labui:pb-2.5">
        <strong className="labui:text-[22px] labui:font-semibold labui:tracking-tight">
          {formatNumber(point.total)}
        </strong>
        <span className="labui:text-muted-foreground">{unit}</span>
      </div>
      {breakdown.slice(0, maxRows).map((s) => (
        <div
          className={cn(row, "labui:min-h-[22px] labui:tabular-nums")}
          key={s.key}
        >
          <span className="labui:flex labui:items-center labui:gap-1.5">
            <Swatch color={s.color} />
            {s.key}
          </span>
          <b className="labui:font-medium">
            {formatNumber(point.values[s.key]!)}
          </b>
        </div>
      ))}
      {breakdown.length > maxRows && (
        <small className={note}>
          +{breakdown.length - maxRows} more series
        </small>
      )}
      {options.sma && (
        <small className={note}>
          SMA {INDICATOR_PERIOD}
          <b>
            {indicator?.sma == null
              ? `${INDICATOR_PERIOD} days needed`
              : formatNumber(indicator.sma)}
          </b>
        </small>
      )}
      {options.ema && (
        <small className={note}>
          EMA {INDICATOR_PERIOD}
          <b>{formatNumber(indicator?.ema ?? 0)}</b>
        </small>
      )}
      {options.bollinger && (
        <small className={note}>
          Bollinger
          <b>
            {indicator?.upper == null
              ? `${INDICATOR_PERIOD} days needed`
              : `${formatCompact(indicator.lower!)} to ${formatCompact(indicator.upper)}`}
          </b>
        </small>
      )}
      {point.carried && (
        <small className={note}>Last capture carried forward</small>
      )}
    </div>
  );
}

function SelectionBar({
  selected,
  unit,
  onZoom,
  onClear,
}: {
  selected: Selected;
  unit: string;
  onZoom: () => void;
  onClear: () => void;
}) {
  return (
    <div
      className={cn(
        "labui:flex labui:flex-wrap labui:items-center labui:justify-between labui:gap-3 labui:border-t labui:bg-popover labui:py-3 labui:text-xs",
        gutter,
      )}
    >
      <span className="labui:flex labui:flex-wrap labui:gap-3">
        <b className="labui:font-medium">
          {formatDay(selected[0].time)} to {formatDay(selected[1].time)}
        </b>
        <span>{describeDelta(selected, unit)}</span>
      </span>
      <div className="labui:flex labui:gap-1.5">
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="labui:text-xs"
          onClick={onZoom}
        >
          Zoom to selection
        </Button>
        <Button
          variant="outline"
          size="sm"
          type="button"
          className="labui:text-xs"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
    </div>
  );
}

function Footer({
  range,
  locked,
  options,
  r2,
}: {
  range: Range;
  locked: boolean;
  options: ChartOptions;
  r2?: number;
}) {
  const scale = options.logarithmic
    ? `Log${options.logBase} (1 + value)`
    : "Linear scale";
  return (
    <div
      className={cn(
        "labui:flex labui:flex-col labui:gap-1 labui:border-t labui:py-3 labui:text-[11px] labui:text-muted-foreground labui:tabular-nums labui:sm:flex-row labui:sm:justify-between labui:sm:gap-3 labui:sm:py-3.5",
        gutter,
      )}
    >
      <span>
        {formatSpan(range)}
        {locked ? ", scale locked" : ""}
      </span>
      <span>
        {scale}
        {options.forecast && r2 !== undefined
          ? `, trend R² ${r2.toFixed(2)}`
          : ""}
      </span>
    </div>
  );
}

const TimeSeriesChart = React.forwardRef<HTMLDivElement, TimeSeriesChartProps>(
  function TimeSeriesChart(props, ref) {
    if (!props.points.length)
      return (
        <ChartFrame
          ref={ref}
          data-slot="time-series-chart"
          aria-label={props.label}
          className="labui:min-h-64 labui:items-center labui:justify-center labui:p-6 labui:text-sm labui:text-muted-foreground"
        >
          No data to display
        </ChartFrame>
      );
    return <TimeSeriesPlot {...props} frameRef={ref} />;
  },
);

function TimeSeriesPlot({
  points,
  series,
  start,
  options,
  onOptionsChange,
  title = "Composition",
  subtitle,
  unit = "units",
  label,
  frameRef,
}: TimeSeriesChartProps & { frameRef: React.ForwardedRef<HTMLDivElement> }) {
  const { container, width } = useChartWidth();
  React.useImperativeHandle(
    frameRef,
    () => container.current as HTMLDivElement,
    [container],
  );
  const svg = React.useRef<SVGSVGElement>(null);
  const ids = React.useId().replace(/\W/g, "");
  const clipId = `${ids}-clip`;
  const helpId = `${ids}-help`;
  const last = points.at(-1)!;
  const history: Range = [
    Math.min(start, points[0]!.time),
    Math.max(last.time, start + DAY),
  ];
  const bounds: Range = [
    history[0],
    history[1] + (options.forecast ? FORECAST_DAYS * DAY : 0),
  ];
  const [view, setView] = React.useState<Range>(bounds);
  const [from, to] = clampRange(view, bounds);
  const range = React.useMemo<Range>(() => [from, to], [from, to]);
  const [locked, setLocked] = React.useState<Range>();
  const [inspected, setInspected] = React.useState<number | null>(null);
  const [selection, setSelection] = React.useState<[number, number] | null>(
    null,
  );
  const [extending, setExtending] = React.useState(false);
  const pointers = React.useRef(new Map<number, number>());
  const drag = React.useRef<number | null>(null);
  const pinch = React.useRef<{
    distance: number;
    range: Range;
    anchor: number;
  } | null>(null);
  const height = width < 600 ? 360 : 430;
  const keys = React.useMemo(() => series.map((s) => s.key), [series]);
  const model = React.useMemo(
    () => chartModel(points, keys, range, width, height, options, locked),
    [points, keys, range, width, height, options, locked],
  );
  const activeIndex =
    inspected === null
      ? points.length - 1
      : clampIndex(inspected, points.length);
  const active = points[activeIndex]!;
  const indicator = model.computed[activeIndex];
  const selected: Selected | null = selection
    ? [points[Math.min(...selection)]!, points[Math.max(...selection)]!]
    : null;

  const nearest = (time: number) => nearestPoint(points, time);
  const pixelAt = (clientX: number) => {
    const rect = svg.current!.getBoundingClientRect();
    const scale = rect.width ? width / rect.width : 1;
    return Math.max(
      model.plot.left,
      Math.min(model.plot.right, (clientX - rect.left) * scale),
    );
  };
  const zoomBy = (factor: number, anchor: number) =>
    setView(zoomRange(range, factor, anchor, bounds));
  const showWindow = (days: number) =>
    setView(clampRange([last.time - days * DAY, last.time], bounds));

  const wheelHandler = React.useRef<(event: WheelEvent) => void>(() => {});
  wheelHandler.current = (event) => {
    event.preventDefault();
    if (event.shiftKey) {
      const offset = (event.deltaY / 700) * (range[1] - range[0]);
      setView(clampRange([range[0] + offset, range[1] + offset], bounds));
      return;
    }
    const factor = Math.exp(Math.max(-1, Math.min(1, event.deltaY * 0.002)));
    zoomBy(factor, model.timeAt(pixelAt(event.clientX)));
  };
  React.useEffect(() => {
    const element = svg.current;
    if (!element) return;
    const wheel = (event: WheelEvent) => wheelHandler.current(event);
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);

  function reset() {
    setView(history);
    setSelection(null);
    setInspected(null);
    setExtending(false);
  }
  function clearSelection() {
    setSelection(null);
    setExtending(false);
  }
  function moveInspection(index: number, extend = false) {
    index = clampIndex(index, points.length);
    if (extend) setSelection([selection?.[0] ?? activeIndex, index]);
    setInspected(index);
    const time = points[index]!.time,
      span = range[1] - range[0];
    if (time < range[0]) setView(clampRange([time, time + span], bounds));
    if (time > range[1]) setView(clampRange([time - span, time], bounds));
  }
  function keydown(event: React.KeyboardEvent<SVGSVGElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const { key } = event;
    if (HANDLED_KEYS.includes(key)) event.preventDefault();
    const extend = event.shiftKey || extending;
    if (key === "ArrowLeft") moveInspection(activeIndex - 1, extend);
    if (key === "ArrowRight") moveInspection(activeIndex + 1, extend);
    if (key === "Home") moveInspection(0, extend);
    if (key === "End") moveInspection(points.length - 1, extend);
    if (key === "+" || key === "=") zoomBy(ZOOM_IN, active.time);
    if (key === "-") zoomBy(ZOOM_OUT, active.time);
    if (key === "0" || key === "r" || key === "R") reset();
    if (key === "Escape") {
      clearSelection();
      setInspected(null);
    }
    if (key === " ") {
      setExtending(!extending);
      if (!extending) setSelection([activeIndex, activeIndex]);
    }
  }
  function pointerDown(event: React.PointerEvent<SVGSVGElement>) {
    if (event.button !== 0) return;
    svg.current?.focus({ preventScroll: true });
    event.currentTarget.setPointerCapture(event.pointerId);
    const px = pixelAt(event.clientX);
    pointers.current.set(event.pointerId, px);
    setSelection(null);
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()] as [number, number];
      pinch.current = {
        distance: Math.max(1, Math.abs(a - b)),
        range,
        anchor: model.timeAt((a + b) / 2),
      };
      drag.current = null;
      return;
    }
    drag.current = nearest(model.timeAt(px));
    setInspected(drag.current);
  }
  function pointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const px = pixelAt(event.clientX);
    if (pointers.current.has(event.pointerId))
      pointers.current.set(event.pointerId, px);
    if (pinch.current && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()] as [number, number];
      setView(
        zoomRange(
          pinch.current.range,
          pinch.current.distance / Math.max(1, Math.abs(a - b)),
          pinch.current.anchor,
          bounds,
        ),
      );
      return;
    }
    const index = nearest(model.timeAt(px));
    setInspected(index);
    if (drag.current !== null && drag.current !== index)
      setSelection([drag.current, index]);
  }
  function pointerEnd(event: React.PointerEvent<SVGSVGElement>) {
    pointers.current.delete(event.pointerId);
    drag.current = null;
    pinch.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
  }
  function pointerLeave() {
    if (drag.current === null && document.activeElement !== svg.current)
      setInspected(null);
  }

  const inspectX = model.x(active.time),
    inspectY = model.y(active.total);
  const showTooltip =
    inspected !== null &&
    inspectX >= model.plot.left &&
    inspectX <= model.plot.right;
  const maxRows = width < 600 ? 3 : 5;
  const tooltipStyle = placeTooltip(
    model,
    width,
    height,
    inspectX,
    inspectY,
    Math.min(maxRows, shownSeries(series, active).length),
    options.sma || options.ema || options.bollinger,
  );
  const forecastWidth = Math.max(
    0,
    model.x(last.time + FORECAST_DAYS * DAY) - model.x(last.time),
  );
  const plotHeight = model.plot.bottom - model.plot.top;
  const liveText = [
    selected
      ? `Selected ${formatSpan([selected[0].time, selected[1].time])}. ${describeDelta(selected, unit)}.`
      : "",
    describePoint(active, series, unit),
    describeIndicators(options, indicator),
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ChartFrame
      data-slot="time-series-chart"
      aria-label={label}
      ref={container}
    >
      <div
        className={cn(
          "labui:relative labui:flex labui:flex-wrap labui:items-center labui:justify-between labui:gap-3 labui:pt-4 labui:pb-3 labui:sm:pt-5",
          gutter,
        )}
      >
        <div className="labui:flex labui:flex-wrap labui:items-baseline labui:gap-3">
          <h2 className="labui:text-sm labui:font-medium">{title}</h2>
          {subtitle && <span className={mutedSmall}>{subtitle}</span>}
        </div>
        <div className="labui:flex labui:flex-wrap labui:items-center labui:gap-2">
          <Segmented label="Date window">
            {WINDOWS.map(([text, days]) => (
              <Button
                variant="outline"
                size="sm"
                type="button"
                key={text}
                onClick={() => showWindow(days)}
              >
                {text}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={reset}
              aria-label="Show all history"
            >
              All
            </Button>
          </Segmented>
          <Segmented label="Zoom controls">
            <Button
              variant="outline"
              size="sm"
              type="button"
              aria-label="Zoom out"
              onClick={() => zoomBy(ZOOM_OUT, (range[0] + range[1]) / 2)}
            >
              -
            </Button>
            <Button
              variant="outline"
              size="sm"
              type="button"
              aria-label="Zoom in"
              onClick={() => zoomBy(ZOOM_IN, (range[0] + range[1]) / 2)}
            >
              +
            </Button>
          </Segmented>
          <ChartSettings
            options={options}
            onOptionsChange={onOptionsChange}
            locked={!!locked}
            onLockedChange={(lock) =>
              setLocked(lock ? model.domain : undefined)
            }
            onForecastEnabled={() =>
              setView([range[0], last.time + FORECAST_DAYS * DAY])
            }
          />
        </div>
      </div>
      <Legend series={series} point={active} unit={unit} />
      <div className="labui:relative labui:w-full">
        <svg
          ref={svg}
          viewBox={`0 0 ${width} ${height}`}
          width={width}
          height={height}
          className="labui:block labui:max-w-full labui:cursor-crosshair labui:touch-none labui:rounded labui:outline-none labui:select-none labui:focus-visible:ring-2 labui:focus-visible:ring-ring labui:focus-visible:ring-inset"
          role="slider"
          tabIndex={0}
          aria-label={`${label}, ${formatSpan(range)}`}
          aria-describedby={helpId}
          aria-orientation="horizontal"
          aria-valuemin={0}
          aria-valuemax={points.length - 1}
          aria-valuenow={activeIndex}
          aria-valuetext={describePoint(active, series, unit)}
          onKeyDown={keydown}
          onFocus={() => setInspected(nearest(range[1]))}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerEnd}
          onPointerCancel={pointerEnd}
          onPointerLeave={pointerLeave}
        >
          <defs>
            <clipPath id={clipId}>
              <rect
                x={model.plot.left}
                y={model.plot.top}
                width={model.plot.right - model.plot.left}
                height={plotHeight}
              />
            </clipPath>
          </defs>
          <g aria-hidden="true">
            {model.yTicks.map((tick, i) => (
              <g key={i}>
                <line
                  x1={model.plot.left}
                  x2={model.plot.right}
                  y1={tick.pixel}
                  y2={tick.pixel}
                  stroke="var(--labui-border)"
                  strokeWidth={1}
                  strokeDasharray="2 5"
                />
                <text
                  className="labui:font-mono"
                  x={model.plot.left - 12}
                  y={tick.pixel + 4}
                  textAnchor="end"
                  fill="var(--labui-muted-foreground)"
                  fontSize={10}
                >
                  {formatCompact(tick.value)}
                </text>
              </g>
            ))}
            {model.xTicks.map((tick) => (
              <text
                className="labui:font-mono"
                key={tick.value}
                x={tick.pixel}
                y={height - 12}
                textAnchor="middle"
                fill="var(--labui-muted-foreground)"
                fontSize={10}
              >
                {formatDay(tick.value)}
              </text>
            ))}
            <g clipPath={`url(#${clipId})`}>
              {model.bands.map((band) => (
                <path
                  key={band.key}
                  d={band.path}
                  fill={series.find((s) => s.key === band.key)!.color}
                  fillOpacity={0.72}
                />
              ))}
              <path
                d={model.totalPath}
                fill="none"
                stroke="var(--labui-foreground)"
                strokeWidth={1.4}
                strokeLinejoin="round"
              />
              {options.sma && (
                <path
                  {...indicatorLine}
                  d={model.smaPath}
                  stroke="var(--labui-chart-2)"
                />
              )}
              {options.ema && (
                <path
                  {...indicatorLine}
                  d={model.emaPath}
                  stroke="var(--labui-chart-4)"
                />
              )}
              {options.bollinger &&
                [model.upperPath, model.lowerPath].map((d, i) => (
                  <path
                    {...indicatorLine}
                    key={i}
                    d={d}
                    stroke="var(--labui-chart-3)"
                    strokeDasharray="4 3"
                  />
                ))}
              {options.forecast && (
                <>
                  <rect
                    x={model.x(last.time)}
                    y={model.plot.top}
                    width={forecastWidth}
                    height={plotHeight}
                    fill="var(--labui-foreground)"
                    opacity={0.025}
                  />
                  <path
                    {...indicatorLine}
                    d={model.forecastPath}
                    stroke="var(--labui-foreground)"
                    strokeDasharray="5 5"
                  />
                </>
              )}
              {selected && (
                <rect
                  x={model.x(selected[0].time)}
                  y={model.plot.top}
                  width={Math.max(
                    1,
                    model.x(selected[1].time) - model.x(selected[0].time),
                  )}
                  height={plotHeight}
                  fill="var(--labui-primary)"
                  fillOpacity={0.15}
                  stroke="var(--labui-primary)"
                  strokeOpacity={0.7}
                />
              )}
              {showTooltip && (
                <>
                  <line
                    {...crosshair}
                    x1={inspectX}
                    x2={inspectX}
                    y1={model.plot.top}
                    y2={model.plot.bottom}
                  />
                  <line
                    {...crosshair}
                    x1={model.plot.left}
                    x2={model.plot.right}
                    y1={inspectY}
                    y2={inspectY}
                  />
                  <circle
                    cx={inspectX}
                    cy={inspectY}
                    r={4}
                    fill="var(--labui-foreground)"
                    stroke="var(--labui-background)"
                    strokeWidth={2}
                  />
                </>
              )}
            </g>
          </g>
        </svg>
        {showTooltip && (
          <Tooltip
            point={active}
            series={series}
            unit={unit}
            options={options}
            indicator={indicator}
            maxRows={maxRows}
            style={tooltipStyle}
          />
        )}
      </div>
      {selected && (
        <SelectionBar
          selected={selected}
          unit={unit}
          onZoom={() =>
            setView(clampRange([selected[0].time, selected[1].time], bounds))
          }
          onClear={clearSelection}
        />
      )}
      <Footer
        range={range}
        locked={!!locked}
        options={options}
        r2={model.forecast?.r2}
      />
      <p
        className={cn(
          "labui:pb-4 labui:text-[10px] labui:leading-relaxed labui:text-muted-foreground",
          gutter,
        )}
        id={helpId}
      >
        Scroll or pinch to zoom. Drag to compare. Arrow keys inspect, Shift and
        arrows select. Plus and minus zoom, R resets. Shift and scroll pans.
      </p>
      <div className="labui:sr-only" aria-live="polite" aria-atomic="true">
        {liveText}
      </div>
    </ChartFrame>
  );
}

export { TimeSeriesChart };
