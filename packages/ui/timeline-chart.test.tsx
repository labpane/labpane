import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { Sparkline, TimelineChart } from "./timeline-chart.js";
import type { TimelineMetric, TimelineSeries } from "./timeline-model.js";

afterEach(cleanup);

const series: TimelineSeries = {
  start: 0,
  interval: 1000,
  fields: ["t", "active", "viewers", "bitrate", "below"],
  points: [
    [1000, 1, 1, 1_000_000, 0],
    [2000, 2, 2, 2_000_000, 1],
    [3000, 2, 3, 3_000_000, 0],
    [4000, 0, 3, 0, 0],
  ],
};
const bitrate: TimelineMetric = {
  id: "bitrate",
  title: "Bitrate",
  unit: "Mbps",
  line: "bitrate",
  scale: 1e-6,
  digits: 1,
  summary: "peak",
};

it("shows the latest value while live and a summary once finished", () => {
  const ref = createRef<HTMLDivElement>();
  const view = render(
    <TimelineChart ref={ref} series={series} metric={bitrate} live />,
  );
  expect(ref.current?.getAttribute("data-slot")).toBe("timeline-chart");
  expect(
    screen.getByRole("region", { name: "Bitrate over time" }),
  ).toBeTruthy();
  expect(screen.getByText("0 Mbps")).toBeTruthy();
  view.rerender(<TimelineChart series={series} metric={bitrate} />);
  expect(screen.getByText("3 Mbps")).toBeTruthy();
  expect(screen.getByText("peak")).toBeTruthy();
  view.rerender(
    <TimelineChart
      series={series}
      metric={{ ...bitrate, summary: "mean" }}
      label="Egress"
    />,
  );
  expect(screen.getByRole("region", { name: "Egress" })).toBeTruthy();
  expect(screen.getByText("2 Mbps")).toBeTruthy();
  expect(screen.getByText("mean")).toBeTruthy();
});

const viewers: TimelineMetric = {
  id: "viewers",
  title: "Viewers",
  unit: "",
  line: "active",
  lineLabel: "active",
  context: "viewers",
  contextLabel: "joined",
  status: "below",
  statusLabel: "below threshold",
  threshold: 2.5,
  thresholdLabel: "min",
  digits: 0,
};

it("inspects moments with the keyboard and reports them to a shared hover", () => {
  const onHover = mock((_time: number | null) => {});
  const view = render(
    <TimelineChart
      series={series}
      metric={viewers}
      hover={null}
      onHover={onHover}
    />,
  );
  const plot = screen.getByRole("slider", {
    name: "Viewers over time, interactive timeline",
  });
  expect(plot.getAttribute("aria-valuemax")).toBe("3");
  fireEvent.keyDown(plot, { key: "ArrowLeft" });
  expect(onHover).toHaveBeenLastCalledWith(3000);
  view.rerender(
    <TimelineChart
      series={series}
      metric={viewers}
      hover={2000}
      onHover={onHover}
    />,
  );
  expect(plot.getAttribute("aria-valuenow")).toBe("1");
  expect(plot.getAttribute("aria-valuetext")).toContain("0:02,");
  expect(plot.getAttribute("aria-valuetext")).toContain("active 2.");
  expect(plot.getAttribute("aria-valuetext")).toContain("joined 2.");
  expect(plot.getAttribute("aria-valuetext")).toContain("below threshold 1.");
  expect(screen.getByText("at 0:02")).toBeTruthy();
  expect(screen.getByText("min 2.5")).toBeTruthy();
  expect(screen.getAllByText("joined").length).toBeGreaterThan(0);
  fireEvent.keyDown(plot, { key: "Escape" });
  expect(onHover).toHaveBeenLastCalledWith(null);
});

it("stacks layers and reads the top layer's share", () => {
  render(
    <TimelineChart
      series={series}
      metric={{
        id: "layers",
        title: "Layers",
        unit: "",
        line: "viewers",
        stack: [
          { field: "active", label: "S0" },
          { field: "viewers", label: "S1" },
        ],
      }}
      colors={["red", "blue"]}
    />,
  );
  expect(screen.getByText("53% on S1")).toBeTruthy();
  expect(screen.getByText("S0")).toBeTruthy();
  const plot = screen.getByRole("slider");
  fireEvent.keyDown(plot, { key: "Home" });
  expect(plot.getAttribute("aria-valuetext")).toContain("S0 1. S1 1.");
});

it("has an explicit no-data state and a sparkline for cells", () => {
  render(
    <TimelineChart series={{ ...series, points: [] }} metric={bitrate} live />,
  );
  expect(screen.queryByRole("slider")).toBeNull();
  expect(screen.getByText("No data to display")).toBeTruthy();
  const { rerender } = render(
    <Sparkline values={[1, 3, 2]} label="Bitrate trend for viewer-001" />,
  );
  const spark = screen.getByRole("img", {
    name: "Bitrate trend for viewer-001",
  });
  expect(spark.querySelector("path")).toBeTruthy();
  rerender(<Sparkline values={[1]} label="Bitrate trend for viewer-001" />);
  expect(spark.querySelector("path")).toBeNull();
  expect(spark.querySelector("line")).toBeTruthy();
});
