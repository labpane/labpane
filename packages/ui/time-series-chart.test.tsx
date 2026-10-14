import { afterEach, describe, expect, it } from "bun:test";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { useState } from "react";
import { DAY, DEFAULT_OPTIONS, TimeSeriesChart } from "./time-series-chart.js";

const points = Array.from({ length: 40 }, (_, i) => ({
  time: i * DAY,
  total: 100 + i,
  values: { Example: 100 + i },
}));
const series = [{ key: "Example", color: "var(--labui-chart-2)" }];

function Example() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  return (
    <TimeSeriesChart
      points={points}
      series={series}
      start={0}
      label="Example volume"
      unit="events"
      options={options}
      onOptionsChange={setOptions}
    />
  );
}

afterEach(cleanup);

describe("TimeSeriesChart", () => {
  it("renders an empty series without breaking its host", () => {
    render(
      <TimeSeriesChart
        points={[]}
        series={series}
        start={0}
        label="Empty volume"
        options={DEFAULT_OPTIONS}
        onOptionsChange={() => {}}
      />,
    );
    expect(
      screen.getByRole("region", { name: "Empty volume" }).textContent,
    ).toContain("No data to display");
  });
  it("inspects and compares using the keyboard with a spoken equivalent", () => {
    const { container } = render(<Example />);
    const plot = screen.getByRole("slider", { name: /Example volume,/ });
    fireEvent.focus(plot);
    fireEvent.keyDown(plot, { key: "ArrowLeft" });
    fireEvent.keyDown(plot, { key: "ArrowLeft", shiftKey: true });
    const live = container.querySelector('[aria-live="polite"]');
    expect(live?.textContent).toContain("Selected");
    expect(live?.textContent).toContain("+1 events");
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(
      screen.queryByRole("button", { name: "Zoom to selection" }),
    ).toBeNull();
  });
  it("controls display options without owning persistence", async () => {
    render(<Example />);
    await act(async () => {
      fireEvent.click(screen.getByLabelText("Chart settings"));
    });
    fireEvent.click(screen.getByLabelText("Logarithmic scale"));
    expect(screen.getByText("Log10 (1 + value)")).toBeTruthy();
    fireEvent.click(screen.getByLabelText("Trend forecast, 90 days"));
    expect(screen.getByText(/trend R² 1\.00/)).toBeTruthy();
  });
});
