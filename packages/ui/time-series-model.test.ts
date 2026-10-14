import { describe, expect, it } from "bun:test";
import {
  DAY,
  DEFAULT_OPTIONS,
  chartModel,
  clampRange,
  indicators,
  nearestPoint,
  regression,
  zoomRange,
} from "./time-series-model.js";

const points = Array.from({ length: 40 }, (_, i) => ({
  time: i * DAY,
  total: i + 1,
  values: { Rust: i + 1 },
  annotation: "",
}));

describe("time series model", () => {
  it("clamps pan and anchor zoom, including shorter-than-minimum histories", () => {
    expect(clampRange([-DAY, 5 * DAY], [0, 10 * DAY])).toEqual([0, 6 * DAY]);
    expect(zoomRange([0, 10 * DAY], 0.5, 5 * DAY, [0, 10 * DAY])).toEqual([
      2.5 * DAY,
      7.5 * DAY,
    ]);
    expect(clampRange([0, 1], [0, DAY])).toEqual([0, DAY]);
  });
  it("computes rolling indicators and a perfect anchored regression", () => {
    const result = indicators(points);
    expect(result[18]?.sma).toBeNull();
    expect(result[19]?.sma).toBe(10.5);
    expect(result[20]?.sma).toBe(11.5);
    expect(result[19]?.upper).toBeCloseTo(10.5 + 2 * Math.sqrt(33.25));
    expect(result[0]?.ema).toBe(1);
    expect(result[1]?.ema).toBeCloseTo(1 + 2 / 21);
    const fit = regression(points)!;
    expect(fit.slope).toBeCloseTo(1);
    expect(fit.r2).toBeCloseTo(1);
    expect(fit.points.at(-1)?.value).toBeCloseTo(130);
  });
  it("fits visible values, locks domain, and produces finite zero-safe log geometry", () => {
    const early = chartModel(
      points,
      ["Rust"],
      [0, DAY * 5],
      800,
      400,
      DEFAULT_OPTIONS,
    );
    expect(early.domain[1]).toBeLessThan(10);
    const locked = chartModel(
      points,
      ["Rust"],
      [20 * DAY, 30 * DAY],
      800,
      400,
      DEFAULT_OPTIONS,
      early.domain,
    );
    expect(locked.domain).toEqual(early.domain);
    const log = chartModel(
      [{ ...points[0]!, total: 0, values: { Rust: 0 } }, ...points],
      ["Rust"],
      [0, DAY * 40],
      800,
      400,
      { ...DEFAULT_OPTIONS, logarithmic: true, logBase: 2 },
    );
    expect(log.totalPath).not.toMatch(/NaN|Infinity/);
    expect(log.timeAt(log.x(DAY * 4))).toBeCloseTo(DAY * 4);
    expect(log.yTicks.every((t) => Number.isFinite(t.pixel))).toBe(true);
    const spike = [
      { ...points[0]!, total: 10 },
      { ...points[1]!, total: 10 },
      { ...points[2]!, total: 10000 },
    ];
    expect(
      chartModel(spike, [], [0, DAY], 800, 400, DEFAULT_OPTIONS).domain[1],
    ).toBeCloseTo(11.2);
  });
  it("finds the nearest point in irregular series and clamps edges", () => {
    const sparse = [points[0]!, points[10]!, points[30]!];
    expect(nearestPoint(sparse, -DAY)).toBe(0);
    expect(nearestPoint(sparse, 8 * DAY)).toBe(1);
    expect(nearestPoint(sparse, 99 * DAY)).toBe(2);
  });
});
