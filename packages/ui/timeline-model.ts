export type TimelineSeries = {
  start: number;
  interval: number;
  fields: string[];
  points: number[][];
};

export type TimelineMetric = {
  id: string;
  title: string;
  unit: string;
  line: string;
  lineLabel?: string;
  band?: [string, string];
  bandLabel?: string;
  context?: string;
  contextLabel?: string;
  status?: string;
  statusLabel?: string;
  stack?: { field: string; label: string }[];
  threshold?: number;
  thresholdLabel?: string;
  rate?: boolean;
  scale?: number;
  digits?: number;
  summary?: "peak" | "mean";
  optional?: boolean;
};

export const MINUTE = 60_000;
export const HOUR = 3_600_000;
export const RATE_WINDOW = 5000;

export const fieldIndex = (series: Pick<TimelineSeries, "fields">) =>
  Object.fromEntries(series.fields.map((field, i) => [field, i])) as Record<
    string,
    number | undefined
  >;

export function niceStep(span: number, count: number) {
  if (span <= 0 || count <= 0) return 1;
  const rough = span / count;
  const power = 10 ** Math.floor(Math.log10(rough));
  const unit = rough / power;
  const factor =
    unit >= Math.sqrt(50)
      ? 10
      : unit >= Math.sqrt(10)
        ? 5
        : unit >= Math.sqrt(2)
          ? 2
          : 1;
  return factor * power;
}

export function valueTicks(max: number, count = 4): number[] {
  if (!(max > 0)) return [0, 1];
  const step = niceStep(max, count);
  const ticks: number[] = [];
  for (let value = 0; value < max + step / 2; value += step)
    ticks.push(Number(value.toFixed(10)));
  if (ticks.at(-1)! < max)
    ticks.push(Number((ticks.at(-1)! + step).toFixed(10)));
  return ticks;
}

const timeSteps = [
  1000,
  2000,
  5000,
  10_000,
  15_000,
  30_000,
  MINUTE,
  2 * MINUTE,
  5 * MINUTE,
  10 * MINUTE,
  15 * MINUTE,
  30 * MINUTE,
  HOUR,
  2 * HOUR,
  3 * HOUR,
  6 * HOUR,
  12 * HOUR,
  24 * HOUR,
];

export function timeTicks(span: number, count = 6): number[] {
  const step = timeSteps.find((s) => span / s <= count) ?? timeSteps.at(-1)!;
  const ticks: number[] = [];
  for (let t = 0; t <= span; t += step) ticks.push(t);
  return ticks;
}

export function elapsedLabel(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return hh ? `${hh}:${pad(mm)}:${pad(ss)}` : `${mm}:${pad(ss)}`;
}

export const clockLabel = (t: number) =>
  new Date(t).toLocaleTimeString(undefined, { hour12: false });

export function compactNumber(value: number, digits = 1) {
  if (!Number.isFinite(value)) return "";
  const abs = Math.abs(value);
  const fixed = (v: number) =>
    Number(v.toFixed(digits)).toLocaleString(undefined, {
      maximumFractionDigits: digits,
    });
  if (abs >= 1e6) return `${fixed(value / 1e6)}M`;
  if (abs >= 1e4) return `${fixed(value / 1e3)}K`;
  return fixed(value);
}

export function bytesLabel(bytes: number) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = Math.max(0, bytes);
  let unit = 0;
  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit++;
  }
  return `${compactNumber(value, unit ? 1 : 0)} ${units[unit]}`;
}

export function linePath(xs: number[], ys: number[]) {
  let path = "";
  for (let i = 0; i < xs.length; i++)
    path += `${i ? "L" : "M"}${xs[i]!.toFixed(1)} ${ys[i]!.toFixed(1)}`;
  return path;
}

export function areaPath(xs: number[], highs: number[], lows: number[]) {
  if (xs.length < 2) return "";
  let path = linePath(xs, highs);
  for (let i = xs.length - 1; i >= 0; i--)
    path += `L${xs[i]!.toFixed(1)} ${lows[i]!.toFixed(1)}`;
  return path + "Z";
}

export function nearestIndex(times: number[], t: number) {
  if (!times.length) return -1;
  let low = 0;
  let high = times.length - 1;
  while (low < high) {
    const mid = (low + high) >> 1;
    if (times[mid]! < t) low = mid + 1;
    else high = mid;
  }
  if (low > 0 && t - times[low - 1]! <= times[low]! - t) return low - 1;
  return low;
}

export function rates(
  points: number[][],
  index: number,
  timeIndex = 0,
  window = RATE_WINDOW,
) {
  return points.map((p, i) => {
    if (!i) return 0;
    let j = i - 1;
    while (j > 0 && p[timeIndex]! - points[j]![timeIndex]! < window) j--;
    const previous = points[j]!;
    const seconds = (p[timeIndex]! - previous[timeIndex]!) / 1000;
    return seconds > 0
      ? Math.max(0, (p[index]! - previous[index]!) / seconds)
      : 0;
  });
}

export function summarize(
  values: number[],
  busy: boolean[],
  summary: "peak" | "mean",
) {
  const active = values.filter((_, i) => busy[i]);
  if (!active.length) return undefined;
  return summary === "peak"
    ? Math.max(...active)
    : active.reduce((sum, v) => sum + v, 0) / active.length;
}

export function timelineValues(series: TimelineSeries, metric: TimelineMetric) {
  const index = fieldIndex(series);
  const field = (name: string | undefined) => {
    const i = name === undefined ? undefined : index[name];
    if (i === undefined) return undefined;
    const raw = metric.rate
      ? rates(series.points, i)
      : series.points.map((p) => p[i] ?? 0);
    return metric.scale ? raw.map((v) => v * metric.scale!) : raw;
  };
  return {
    times: series.points.map((p) => p[index.t ?? 0] ?? 0),
    line: field(metric.line) ?? [],
    low: metric.band ? field(metric.band[0]) : undefined,
    high: metric.band ? field(metric.band[1]) : undefined,
    context: field(metric.context),
    status: field(metric.status),
    stack: metric.stack?.map((layer) => field(layer.field) ?? []),
    threshold:
      metric.threshold !== undefined && metric.threshold > 0
        ? metric.threshold
        : undefined,
    busy: series.points.map((p) =>
      index.active === undefined ? true : (p[index.active] ?? 0) > 0,
    ),
  };
}

export function hasTimelineData(
  series: TimelineSeries,
  metric: TimelineMetric,
) {
  if (!metric.optional) return true;
  const { line, stack } = timelineValues(series, metric);
  return line.some((v) => v > 0) || !!stack?.some((s) => s.some((v) => v > 0));
}

export const formatMetric = (
  metric: Pick<TimelineMetric, "unit" | "digits">,
  value: number | undefined,
) =>
  value === undefined || !Number.isFinite(value)
    ? "–"
    : `${compactNumber(value, metric.digits ?? 1)}${metric.unit ? ` ${metric.unit}` : ""}`;

export function timelineCSV(series: TimelineSeries) {
  const t = series.fields.indexOf("t");
  const fields = series.fields.filter((_, i) => i !== t);
  const header = ["time", "elapsed_s", ...fields].join(",");
  const rows = series.points.map((p) => {
    const time = t >= 0 ? p[t]! : 0;
    const values = p.filter((_, i) => i !== t);
    return [
      new Date(time).toISOString(),
      ((time - series.start) / 1000).toFixed(3),
      ...values,
    ].join(",");
  });
  return [header, ...rows].join("\n") + "\n";
}

export const MIN_SPAN = MINUTE;

export function timelineModel(
  series: TimelineSeries,
  metric: TimelineMetric,
  width: number,
  height: number,
  start = series.start,
) {
  const values = timelineValues(series, metric);
  const { times, line, low, high, context, status, stack, threshold } = values;
  const x0 = start;
  const x1 = Math.max(times.at(-1) ?? x0, x0 + MIN_SPAN);
  const totals = stack?.length
    ? times.map((_, i) => stack.reduce((sum, s) => sum + (s[i] ?? 0), 0))
    : [];
  const max = Math.max(
    0,
    ...line,
    ...(high ?? []),
    ...(context ?? []),
    ...(status ?? []),
    ...totals,
    threshold ?? 0,
  );
  const yTicks = valueTicks(max);
  const yMax = yTicks.at(-1)!;
  const labels = yTicks.map((v) => compactNumber(v, metric.digits ?? 1));
  const left = 10 + Math.max(...labels.map((l) => l.length)) * 6.5;
  const right = 14;
  const top = 10;
  const bottom = 24;
  const x = (t: number) =>
    left + ((t - x0) / (x1 - x0)) * (width - left - right);
  const y = (v: number) => top + (1 - v / yMax) * (height - top - bottom);
  const xs = times.map(x);
  const cumulative: number[][] = [];
  stack?.forEach((layer, k) => {
    const below = cumulative[k - 1];
    cumulative.push(layer.map((v, i) => v + (below?.[i] ?? 0)));
  });
  return {
    ...values,
    x0,
    x1,
    left,
    right,
    top,
    bottom,
    x,
    y,
    xs,
    yTicks,
    labels,
    totals,
    linePath: stack ? "" : linePath(xs, line.map(y)),
    bandPath: low && high ? areaPath(xs, high.map(y), low.map(y)) : "",
    contextPath: context ? linePath(xs, context.map(y)) : "",
    statusPath: status ? linePath(xs, status.map(y)) : "",
    stackPaths: cumulative.map((upper, k) =>
      areaPath(
        xs,
        upper.map(y),
        (cumulative[k - 1] ?? upper.map(() => 0)).map(y),
      ),
    ),
    separatorPaths: cumulative
      .slice(0, -1)
      .map((upper) => linePath(xs, upper.map(y))),
    xTicks: timeTicks(x1 - x0),
  };
}

export type TimelineModel = ReturnType<typeof timelineModel>;
