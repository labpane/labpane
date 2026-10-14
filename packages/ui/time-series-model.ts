/** Pure chart geometry: no DOM, React, clock or storage. */
export const DAY = 86_400_000;
export type Range = [number, number];
export type SeriesPoint = {
  time: number;
  total: number;
  values: Record<string, number>;
  annotation?: string;
  carried?: boolean;
};
export type ChartOptions = {
  logarithmic: boolean;
  logBase: number;
  sma: boolean;
  ema: boolean;
  bollinger: boolean;
  forecast: boolean;
};
export const DEFAULT_OPTIONS: ChartOptions = {
  logarithmic: false,
  logBase: 10,
  sma: false,
  ema: false,
  bollinger: false,
  forecast: false,
};

export const FORECAST_DAYS = 90;
export const INDICATOR_PERIOD = 20;
const MIN_SPAN = 3 * DAY;

export function nearestPoint(points: SeriesPoint[], time: number): number {
  let lo = 0,
    hi = points.length - 1;
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (points[mid]!.time < time) lo = mid + 1;
    else hi = mid;
  }
  return lo > 0 && time - points[lo - 1]!.time <= points[lo]!.time - time
    ? lo - 1
    : lo;
}

export function clampRange(
  range: Range,
  bounds: Range,
  minimum = MIN_SPAN,
): Range {
  const size = Math.max(1, bounds[1] - bounds[0]);
  const span = Math.min(
    size,
    Math.max(Math.min(minimum, size), range[1] - range[0]),
  );
  const start = Math.max(bounds[0], Math.min(bounds[1] - span, range[0]));
  return [start, start + span];
}

export function zoomRange(
  range: Range,
  factor: number,
  anchor: number,
  bounds: Range,
): Range {
  const ratio = Math.max(
    0,
    Math.min(1, (anchor - range[0]) / (range[1] - range[0])),
  );
  const size = bounds[1] - bounds[0];
  const span = Math.max(
    Math.min(MIN_SPAN, size),
    Math.min(size, (range[1] - range[0]) * factor),
  );
  return clampRange(
    [anchor - span * ratio, anchor + span * (1 - ratio)],
    bounds,
  );
}

export function indicators(points: SeriesPoint[], period = INDICATOR_PERIOD) {
  let sum = 0,
    squares = 0,
    ema = points[0]?.total ?? 0;
  return points.map((p, i) => {
    sum += p.total;
    squares += p.total * p.total;
    if (i >= period) {
      const old = points[i - period]!.total;
      sum -= old;
      squares -= old * old;
    }
    ema += ((p.total - ema) * 2) / (period + 1);
    const mean = sum / period;
    const sigma = Math.sqrt(Math.max(0, squares / period - mean * mean));
    const complete = i + 1 >= period;
    return {
      time: p.time,
      ema,
      sma: complete ? mean : null,
      upper: complete ? mean + 2 * sigma : null,
      lower: complete ? Math.max(0, mean - 2 * sigma) : null,
    };
  });
}

/** Fits the last 90 daily values, then anchors the projection to the latest actual value. */
export function regression(points: SeriesPoint[]) {
  const sample = points.slice(-FORECAST_DAYS),
    last = sample.at(-1);
  if (!last || sample.length < 2) return null;
  let sx = 0,
    sy = 0,
    sxx = 0,
    sxy = 0,
    syy = 0;
  for (const p of sample) {
    const x = (p.time - last.time) / DAY;
    sx += x;
    sy += p.total;
    sxx += x * x;
    sxy += x * p.total;
    syy += p.total ** 2;
  }
  const n = sample.length,
    variance = n * sxx - sx * sx;
  const slope = variance ? (n * sxy - sx * sy) / variance : 0;
  const denom = variance * (n * syy - sy * sy);
  const r2 =
    denom > 0 ? Math.max(0, Math.min(1, (n * sxy - sx * sy) ** 2 / denom)) : 1;
  return {
    slope,
    r2,
    points: [
      { time: last.time, value: last.total },
      {
        time: last.time + FORECAST_DAYS * DAY,
        value: Math.max(0, last.total + slope * FORECAST_DAYS),
      },
    ],
  };
}

export function niceTicks(maximum: number, count = 5): number[] {
  const rough = Math.max(1, maximum) / count,
    magnitude = 10 ** Math.floor(Math.log10(rough));
  const step =
    [1, 2, 2.5, 5, 10].find((n) => n * magnitude >= rough)! * magnitude;
  return Array.from(
    { length: Math.floor(maximum / step) + 1 },
    (_, i) => i * step,
  );
}

const line = (points: { x: number; y: number }[]) =>
  points
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(2)},${p.y.toFixed(2)}`)
    .join(" ");

function visibleMaximum(
  points: { time: number; value: number | null }[],
  range: Range,
): number {
  let maximum = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i]!,
      next = points[i + 1];
    if (p.value === null) continue;
    if (p.time >= range[0] && p.time <= range[1])
      maximum = Math.max(maximum, p.value);
    if (!next || next.value === null || next.time === p.time) continue;
    for (const edge of range)
      if (p.time < edge && next.time > edge)
        maximum = Math.max(
          maximum,
          p.value +
            ((next.value - p.value) * (edge - p.time)) / (next.time - p.time),
        );
  }
  return maximum;
}

export function chartModel(
  points: SeriesPoint[],
  keys: string[],
  range: Range,
  width: number,
  height: number,
  options: ChartOptions,
  lockedDomain?: Range,
) {
  const plot = {
    left: width < 600 ? 48 : 64,
    right: Math.max(100, width - 20),
    top: 20,
    bottom: height - 40,
  };
  const x = (time: number) =>
    plot.left +
    ((time - range[0]) / Math.max(1, range[1] - range[0])) *
      (plot.right - plot.left);
  const timeAt = (pixel: number) =>
    range[0] +
    ((pixel - plot.left) / (plot.right - plot.left)) * (range[1] - range[0]);
  // Include the immediate neighbors so clipped paths meet the plot edge without a gap.
  const visible = (time: number, i: number) =>
    (time >= range[0] && time <= range[1]) ||
    (time < range[0] && (points[i + 1]?.time ?? Infinity) >= range[0]) ||
    (time > range[1] && (points[i - 1]?.time ?? -Infinity) <= range[1]);
  const shown = points.filter((p, i) => visible(p.time, i));
  const computed = indicators(points),
    forecast = options.forecast ? regression(points) : null;
  let maximum = Math.max(
    1,
    visibleMaximum(
      points.map((p) => ({ time: p.time, value: p.total })),
      range,
    ),
  );
  for (const key of ["sma", "ema", "bollinger"] as const)
    if (options[key])
      maximum = Math.max(
        maximum,
        visibleMaximum(
          computed.map((p) => ({
            time: p.time,
            value: key === "bollinger" ? p.upper : p[key],
          })),
          range,
        ),
      );
  if (forecast && range[1] > forecast.points[0]!.time) {
    maximum = Math.max(
      maximum,
      forecast.points[0]!.value,
      forecast.points[0]!.value +
        forecast.slope *
          Math.min(FORECAST_DAYS, (range[1] - forecast.points[0]!.time) / DAY),
    );
  }
  const domain: Range = lockedDomain ?? [0, maximum * 1.12];
  const base =
    Number.isFinite(options.logBase) && options.logBase > 1
      ? options.logBase
      : 10;
  const transform = (v: number) =>
    options.logarithmic ? Math.log1p(Math.max(0, v)) / Math.log(base) : v;
  const y = (value: number) =>
    plot.bottom -
    ((transform(value) - transform(domain[0])) /
      Math.max(1e-9, transform(domain[1]) - transform(domain[0]))) *
      (plot.bottom - plot.top);
  const totals = shown.map((p) => ({ x: x(p.time), y: y(p.total) }));
  const cumulative = shown.map(() => 0);
  const bands = keys.map((key) => {
    const lower = shown.map((p, i) => ({ x: x(p.time), y: y(cumulative[i]!) }));
    const upper = shown.map((p, i) => {
      cumulative[i] = cumulative[i]! + (p.values[key] ?? 0);
      return { x: x(p.time), y: y(cumulative[i]!) };
    });
    return {
      key,
      path: `${line(upper)} ${line(lower.reverse()).replace(/^M/, "L")} Z`,
    };
  });
  const overlay = (key: "sma" | "ema" | "upper" | "lower") =>
    line(
      computed
        .filter((p, i) => p[key] !== null && visible(p.time, i))
        .map((p) => ({ x: x(p.time), y: y(p[key]!) })),
    );
  const tickCount = Math.max(2, Math.floor((plot.right - plot.left) / 125));
  const dayStep = Math.max(
    1,
    Math.ceil((range[1] - range[0]) / DAY / tickCount),
  );
  const firstTick = Math.ceil(range[0] / DAY) * DAY;
  const xTicks = Array.from(
    {
      length: Math.max(
        1,
        Math.floor((range[1] - firstTick) / (dayStep * DAY)) + 1,
      ),
    },
    (_, i) => ({
      value: firstTick + i * dayStep * DAY,
      pixel: x(firstTick + i * dayStep * DAY),
    }),
  );
  const logSteps = Math.max(0, Math.floor(transform(domain[1])));
  const logStride = Math.max(1, Math.ceil(logSteps / 6));
  const yTicks = options.logarithmic
    ? Array.from(
        { length: Math.floor(logSteps / logStride) + 1 },
        (_, i) => base ** (i * logStride) - 1,
      )
    : niceTicks(domain[1]);
  if (yTicks.length === 1) yTicks.push(domain[1]);
  return {
    plot,
    domain,
    x,
    y,
    timeAt,
    bands,
    totalPath: line(totals),
    xTicks,
    yTicks: yTicks.map((value) => ({ value, pixel: y(value) })),
    positions: points.map((p) => ({ x: x(p.time), y: y(p.total) })),
    computed,
    smaPath: overlay("sma"),
    emaPath: overlay("ema"),
    upperPath: overlay("upper"),
    lowerPath: overlay("lower"),
    forecast,
    forecastPath: forecast
      ? line(forecast.points.map((p) => ({ x: x(p.time), y: y(p.value) })))
      : "",
  };
}
