import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { HistogramChart, HistogramSparkline } from "./histogram.js";

afterEach(cleanup);

it("inspects exact ranges and empty bins with the keyboard, then selects a bar", () => {
  const select = mock((_index: number) => {});
  const ref = createRef<HTMLDivElement>();
  render(
    <HistogramChart
      ref={ref}
      label="Measurements"
      xLabel="Value"
      unit="samples"
      onSelect={select}
      bins={[
        { from: 1, to: 2, count: 20 },
        { from: 3, to: 4, count: 0 },
        { from: 5, to: 6, count: 2 },
      ]}
    />,
  );
  expect(ref.current?.getAttribute("data-slot")).toBe("histogram-chart");
  const chart = screen.getByRole("slider", {
    name: "Measurements, interactive histogram",
  });
  fireEvent.keyDown(chart, { key: "ArrowRight" });
  expect(screen.getByText("0 samples")).toBeTruthy();
  expect(screen.getByText(/Value 3 to 4:/)).toBeTruthy();
  fireEvent.keyDown(chart, { key: "Enter" });
  expect(select).toHaveBeenLastCalledWith(1);
  fireEvent.keyDown(chart, { key: "End" });
  fireEvent.keyDown(chart, { key: " " });
  expect(select).toHaveBeenLastCalledWith(2);
  expect(screen.getByText("2 samples")).toBeTruthy();
});

it("has an explicit no-measurements state", () => {
  render(
    <HistogramChart
      label="Empty"
      xLabel="Value"
      unit="samples"
      onSelect={() => {}}
      bins={[]}
    />,
  );
  expect(screen.getByText("No measurements to display.")).toBeTruthy();
  expect(screen.queryByRole("slider")).toBeNull();
});

it("draws a labelled sparkline with one bar per bin", () => {
  const { container } = render(
    <HistogramSparkline
      label="Latency"
      bins={[
        { from: 0, to: 1, count: 3 },
        { from: 2, to: 3, count: 1 },
      ]}
    />,
  );
  expect(screen.getByRole("img", { name: "Latency" })).toBeTruthy();
  expect(container.querySelectorAll("rect")).toHaveLength(2);
});
