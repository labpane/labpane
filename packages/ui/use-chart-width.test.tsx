import { afterEach, expect, it } from "bun:test";
import { act, cleanup, render, screen } from "@testing-library/react";
import { createRef } from "react";
import { ChartFrame } from "./chart-frame.js";
import { useChartWidth } from "./use-chart-width.js";

const RealResizeObserver = globalThis.ResizeObserver;
let notify: ResizeObserverCallback | undefined;

class FakeResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    notify = callback;
  }
  observe() {}
  unobserve() {}
  disconnect() {
    notify = undefined;
  }
}

function resize(width: number) {
  act(() => {
    notify?.(
      [{ contentRect: { width } } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
  });
}

function Probe() {
  const { container, width } = useChartWidth();
  return (
    <ChartFrame ref={container} aria-label="Probe">
      {width}
    </ChartFrame>
  );
}

afterEach(() => {
  cleanup();
  globalThis.ResizeObserver = RealResizeObserver;
});

it("tracks the measured width but ignores zero widths", () => {
  globalThis.ResizeObserver =
    FakeResizeObserver as unknown as typeof ResizeObserver;
  render(<Probe />);
  const frame = screen.getByRole("region", { name: "Probe" });
  expect(frame.textContent).toBe("900");
  resize(640);
  expect(frame.textContent).toBe("640");
  resize(0);
  expect(frame.textContent).toBe("640");
  resize(50);
  expect(frame.textContent).toBe("200");
});

it("forwards the frame element to callers", () => {
  const ref = createRef<HTMLDivElement>();
  render(<ChartFrame ref={ref} aria-label="Frame" />);
  expect(ref.current?.getAttribute("role")).toBe("region");
  expect(ref.current?.getAttribute("data-slot")).toBe("chart-frame");
});
