import { expect, it } from "bun:test";
import {
  areaPath,
  bytesLabel,
  compactNumber,
  elapsedLabel,
  hasTimelineData,
  linePath,
  nearestIndex,
  niceStep,
  rates,
  summarize,
  timelineCSV,
  timelineModel,
  timelineValues,
  timeTicks,
  valueTicks,
  type TimelineSeries,
} from "./timeline-model.js";

it("picks clean value ticks that cover the maximum", () => {
  expect(niceStep(100, 4)).toBe(20);
  expect(niceStep(7, 4)).toBe(2);
  expect(niceStep(0.3, 4)).toBe(0.1);
  expect(niceStep(1, 4)).toBe(0.2);
  expect(valueTicks(736.3)).toEqual([0, 200, 400, 600, 800]);
  expect(valueTicks(24.6)).toEqual([0, 5, 10, 15, 20, 25]);
  expect(valueTicks(0)).toEqual([0, 1]);
  expect(valueTicks(3)).toEqual([0, 1, 2, 3]);
});

it("spaces time ticks and labels elapsed time", () => {
  expect(timeTicks(60_000)).toEqual([
    0, 10_000, 20_000, 30_000, 40_000, 50_000, 60_000,
  ]);
  expect(timeTicks(90_000)).toEqual([
    0, 15_000, 30_000, 45_000, 60_000, 75_000, 90_000,
  ]);
  expect(timeTicks(12 * 60_000).length).toBeLessThanOrEqual(7);
  expect(elapsedLabel(0)).toBe("0:00");
  expect(elapsedLabel(754_000)).toBe("12:34");
  expect(elapsedLabel(3_723_000)).toBe("1:02:03");
});

it("formats values compactly", () => {
  expect(compactNumber(736.34, 1)).toBe("736.3");
  expect(compactNumber(9094, 0)).toBe("9,094");
  expect(compactNumber(12_900, 1)).toBe("12.9K");
  expect(compactNumber(4_200_000, 1)).toBe("4.2M");
  expect(compactNumber(Number.NaN)).toBe("");
  expect(bytesLabel(875_000)).toBe("875 KB");
  expect(bytesLabel(54_200_000_000)).toBe("54.2 GB");
  expect(bytesLabel(12)).toBe("12 B");
});

it("builds line and area paths and finds the nearest time", () => {
  expect(linePath([0, 10, 20], [5, 6, 7])).toBe("M0.0 5.0L10.0 6.0L20.0 7.0");
  expect(areaPath([0, 10], [1, 2], [8, 9])).toBe(
    "M0.0 1.0L10.0 2.0L10.0 9.0L0.0 8.0Z",
  );
  expect(areaPath([0], [1], [2])).toBe("");
  const times = [1000, 2000, 3000, 4000];
  expect(nearestIndex(times, 0)).toBe(0);
  expect(nearestIndex(times, 2400)).toBe(1);
  expect(nearestIndex(times, 2600)).toBe(2);
  expect(nearestIndex(times, 9000)).toBe(3);
  expect(nearestIndex([], 1)).toBe(-1);
});

const series: TimelineSeries = {
  start: 0,
  interval: 1000,
  fields: ["t", "active", "viewers", "bitrate", "frames_lost"],
  points: [
    [1000, 1, 1, 1_000_000, 0],
    [2000, 2, 2, 2_000_000, 4],
    [4000, 2, 3, 3_000_000, 10],
  ],
};

it("derives per-second rates from cumulative counters", () => {
  expect(rates(series.points, 4, 0, 0)).toEqual([0, 4, 3]);
  expect(rates(series.points, 4, 0, 3000)).toEqual([0, 4, 10 / 3]);
  const counter = Array.from({ length: 10 }, (_, i) => [i * 1000, i % 2]);
  expect(rates(counter, 1).slice(6)).toEqual([0, 0.2, 0, 0.2]);
  const lost = timelineValues(series, {
    id: "lost",
    title: "Frames lost",
    unit: "/s",
    line: "frames_lost",
    rate: true,
  });
  expect(lost.times).toEqual([1000, 2000, 4000]);
  expect(lost.line).toEqual([0, 4, 10 / 3]);
  expect(lost.busy).toEqual([true, true, true]);
  const bitrate = timelineValues(series, {
    id: "bitrate",
    title: "Bitrate",
    unit: "Mbps",
    line: "bitrate",
    scale: 1e-6,
  });
  expect(bitrate.line).toEqual([1, 2, 3]);
  expect(bitrate.low).toBeUndefined();
  expect(
    timelineValues(series, { id: "x", title: "x", unit: "", line: "missing" })
      .line,
  ).toEqual([]);
});

it("reads thresholds, status series and stacks off a series", () => {
  const limited = timelineValues(series, {
    id: "active",
    title: "Active",
    unit: "",
    line: "active",
    status: "viewers",
    threshold: 2.5,
  });
  expect(limited.threshold).toBe(2.5);
  expect(limited.status).toEqual([1, 2, 3]);
  const unset = timelineValues(series, {
    id: "active",
    title: "Active",
    unit: "",
    line: "active",
    threshold: 0,
  });
  expect(unset.threshold).toBeUndefined();
  expect(unset.status).toBeUndefined();
  const layers = timelineValues(series, {
    id: "layers",
    title: "Layers",
    unit: "",
    line: "viewers",
    stack: [
      { field: "active", label: "S0" },
      { field: "viewers", label: "S1" },
    ],
  });
  expect(layers.stack).toEqual([
    [1, 2, 2],
    [1, 2, 3],
  ]);
  const optional = {
    id: "rtt",
    title: "RTT",
    unit: "ms",
    line: "frames_lost",
    optional: true,
  };
  expect(hasTimelineData(series, optional)).toBe(true);
  expect(
    hasTimelineData({ ...series, points: [[1000, 1, 1, 1, 0]] }, optional),
  ).toBe(false);
  expect(hasTimelineData(series, { ...optional, optional: false })).toBe(true);
});

it("summarizes finished runs over their busy points", () => {
  expect(summarize([0, 4, 8, 0], [false, true, true, false], "peak")).toBe(8);
  expect(summarize([0, 4, 8, 0], [false, true, true, false], "mean")).toBe(6);
  expect(summarize([1, 2], [false, false], "mean")).toBeUndefined();
});

it("exports CSV with ISO times and elapsed seconds", () => {
  const csv = timelineCSV(series).split("\n");
  expect(csv[0]).toBe("time,elapsed_s,active,viewers,bitrate,frames_lost");
  expect(csv[1]).toBe("1970-01-01T00:00:01.000Z,1.000,1,1,1000000,0");
  expect(csv[3]).toBe("1970-01-01T00:00:04.000Z,4.000,2,3,3000000,10");
  expect(csv).toHaveLength(5);
});

it("lays out lines, bands, stacks and limits within the plot", () => {
  const model = timelineModel(
    series,
    {
      id: "active",
      title: "Active",
      unit: "",
      line: "active",
      band: ["active", "viewers"],
      context: "viewers",
      threshold: 5,
      digits: 0,
    },
    600,
    200,
  );
  expect(model.x0).toBe(0);
  expect(model.x1).toBe(60_000);
  expect(model.yTicks.at(-1)).toBe(5);
  expect(model.linePath.startsWith("M")).toBe(true);
  expect(model.bandPath.endsWith("Z")).toBe(true);
  expect(model.contextPath).not.toBe("");
  expect(model.stackPaths).toEqual([]);
  expect(model.xTicks).toEqual(timeTicks(60_000));
  expect(model.y(0)).toBe(200 - model.bottom);
  expect(model.y(5)).toBe(model.top);
  const stacked = timelineModel(
    series,
    {
      id: "layers",
      title: "Layers",
      unit: "",
      line: "viewers",
      stack: [
        { field: "active", label: "S0" },
        { field: "viewers", label: "S1" },
      ],
    },
    600,
    200,
    500,
  );
  expect(stacked.x0).toBe(500);
  expect(stacked.totals).toEqual([2, 4, 5]);
  expect(stacked.stackPaths).toHaveLength(2);
  expect(stacked.separatorPaths).toHaveLength(1);
  expect(stacked.linePath).toBe("");
  expect(stacked.yTicks.at(-1)).toBe(5);
});
