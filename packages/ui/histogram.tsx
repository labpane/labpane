import * as React from "react";
import { ChartFrame } from "./chart-frame.js";
import { useChartWidth } from "./use-chart-width.js";

/** Inclusive integer bounds, with a count of observations in each interval. */
export type HistogramBin = { from: number; to: number; count: number };

export type HistogramChartProps = {
  bins: HistogramBin[];
  label: string;
  xLabel: string;
  unit: string;
  selected?: number;
  onSelect: (index: number) => void;
};

const HEIGHT = 260;
const LEFT = 60;
const TOP = 16;
const BOTTOM = 206;
const SPARKLINE_WIDTH = 180;
const SPARKLINE_HEIGHT = 44;

const formatNumber = (value: number) => value.toLocaleString();
const describeBin = (bin: HistogramBin) =>
  bin.from === bin.to
    ? formatNumber(bin.from)
    : `${formatNumber(bin.from)} to ${formatNumber(bin.to)}`;
const tallest = (bins: HistogramBin[]) =>
  bins.reduce((max, bin) => Math.max(max, bin.count), 1);
const clampIndex = (index: number, length: number) =>
  Math.max(0, Math.min(length - 1, index));

function nextIndex(key: string, current: number, length: number) {
  if (key === "Home") return 0;
  if (key === "End") return length - 1;
  if (key === "ArrowLeft") return clampIndex(current - 1, length);
  if (key === "ArrowRight") return clampIndex(current + 1, length);
  return undefined;
}

/** Small presentation-only plot for a table cell. Its caller supplies the button. */
const HistogramSparkline = React.forwardRef<
  SVGSVGElement,
  { bins: HistogramBin[]; label: string }
>(function HistogramSparkline({ bins, label }, ref) {
  const max = tallest(bins);
  const slot = SPARKLINE_WIDTH / bins.length;
  const baseline = SPARKLINE_HEIGHT - 2;
  return (
    <svg
      ref={ref}
      role="img"
      aria-label={label}
      viewBox={`0 0 ${SPARKLINE_WIDTH} ${SPARKLINE_HEIGHT}`}
      className="labui:h-11 labui:w-44 labui:text-chart-2"
    >
      <title>{label}</title>
      {bins.map((bin, i) => {
        const barHeight = (bin.count / max) * (baseline - 2);
        return (
          <rect
            key={bin.from}
            x={i * slot}
            y={baseline - barHeight}
            width={Math.max(1, slot - 1)}
            height={barHeight}
            rx={1}
            fill="currentColor"
          />
        );
      })}
      <path
        d={`M0 ${baseline}H${SPARKLINE_WIDTH}`}
        stroke="var(--labui-border)"
      />
    </svg>
  );
});

/** Discrete, equal-width bins. Pointer and keyboard inspection share one selection. */
const HistogramChart = React.forwardRef<HTMLDivElement, HistogramChartProps>(
  function HistogramChart(
    { bins, label, xLabel, unit, selected, onSelect },
    ref,
  ) {
    const { container, width } = useChartWidth();
    React.useImperativeHandle(ref, () => container.current as HTMLDivElement, [
      container,
    ]);
    const [inspected, setInspected] = React.useState(0);
    const helpId = React.useId();
    const activeIndex = Math.min(inspected, bins.length - 1);
    const active = bins[activeIndex];
    const right = width - 20;
    const max = tallest(bins);
    const total = bins.reduce((sum, bin) => sum + bin.count, 0);
    const barWidth = (right - LEFT) / bins.length;
    const count = active ? `${formatNumber(active.count)} ${unit}` : "";
    const share =
      active && total > 0
        ? ` (${((active.count / total) * 100).toFixed(1)}%)`
        : "";

    const binAt = (clientX: number, element: SVGSVGElement) => {
      const rect = element.getBoundingClientRect();
      const scale = rect.width ? width / rect.width : 1;
      const x = (clientX - rect.left) * scale;
      return clampIndex(
        Math.floor(((x - LEFT) / (right - LEFT)) * bins.length),
        bins.length,
      );
    };
    function keydown(event: React.KeyboardEvent<SVGSVGElement>) {
      const target = nextIndex(event.key, activeIndex, bins.length);
      if (target !== undefined) {
        event.preventDefault();
        setInspected(target);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        onSelect(activeIndex);
      }
    }
    function click(event: React.MouseEvent<SVGSVGElement>) {
      const index = binAt(event.clientX, event.currentTarget);
      setInspected(index);
      onSelect(index);
    }

    return (
      <ChartFrame
        data-slot="histogram-chart"
        aria-label={label}
        ref={container}
      >
        <div className="labui:flex labui:flex-wrap labui:items-center labui:justify-between labui:gap-2 labui:border-b labui:px-4 labui:py-3 labui:text-sm">
          <span className="labui:font-medium">{label}</span>
          <span className="labui:text-muted-foreground labui:tabular-nums">
            {formatNumber(total)} {unit}
          </span>
        </div>
        {active ? (
          <>
            <div
              className="labui:px-4 labui:pt-3 labui:text-sm labui:tabular-nums"
              aria-live="polite"
            >
              {xLabel} {describeBin(active)}: <strong>{count}</strong>
              {share}
            </div>
            <svg
              viewBox={`0 0 ${width} ${HEIGHT}`}
              className="labui:block labui:w-full labui:touch-pan-y labui:outline-none labui:focus-visible:ring-2 labui:focus-visible:ring-ring labui:focus-visible:ring-inset"
              role="slider"
              aria-label={`${label}, interactive histogram`}
              aria-describedby={helpId}
              aria-orientation="horizontal"
              aria-valuemin={0}
              aria-valuemax={bins.length - 1}
              aria-valuenow={activeIndex}
              aria-valuetext={`${xLabel} ${describeBin(active)}: ${count}${share}`}
              tabIndex={0}
              onPointerMove={(event) =>
                setInspected(binAt(event.clientX, event.currentTarget))
              }
              onClick={click}
              onKeyDown={keydown}
            >
              {[0, 0.5, 1].map((fraction) => {
                const y = BOTTOM - fraction * (BOTTOM - TOP);
                return (
                  <g key={fraction} aria-hidden="true">
                    <path
                      d={`M${LEFT} ${y}H${right}`}
                      stroke="var(--labui-border)"
                    />
                    <text
                      x={LEFT - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="var(--labui-muted-foreground)"
                      fontSize={11}
                    >
                      {formatNumber(Math.round(max * fraction))}
                    </text>
                  </g>
                );
              })}
              {bins.map((bin, i) => {
                const barHeight = (bin.count / max) * (BOTTOM - TOP);
                const highlighted = i === activeIndex || selected === i;
                return (
                  <g key={bin.from} aria-hidden="true">
                    <rect
                      x={LEFT + i * barWidth + 1}
                      y={BOTTOM - barHeight}
                      width={Math.max(1, barWidth - 2)}
                      height={barHeight}
                      fill={
                        selected === i
                          ? "var(--labui-chart-1)"
                          : "var(--labui-chart-2)"
                      }
                      opacity={highlighted ? 1 : 0.65}
                      rx={2}
                    />
                    {i === activeIndex && (
                      <rect
                        x={LEFT + i * barWidth}
                        y={TOP}
                        width={barWidth}
                        height={BOTTOM - TOP}
                        fill="var(--labui-foreground)"
                        opacity={0.06}
                      />
                    )}
                  </g>
                );
              })}
              <text
                x={LEFT}
                y={BOTTOM + 20}
                fill="var(--labui-muted-foreground)"
                fontSize={11}
              >
                {formatNumber(bins[0]!.from)}
              </text>
              <text
                x={right}
                y={BOTTOM + 20}
                textAnchor="end"
                fill="var(--labui-muted-foreground)"
                fontSize={11}
              >
                {formatNumber(bins.at(-1)!.to)}
              </text>
              <text
                x={(LEFT + right) / 2}
                y={HEIGHT - 8}
                textAnchor="middle"
                fill="var(--labui-muted-foreground)"
                fontSize={12}
              >
                {xLabel}
              </text>
            </svg>
            <p
              id={helpId}
              className="labui:border-t labui:px-4 labui:py-2 labui:text-xs labui:text-muted-foreground"
            >
              Hover to inspect. Click a bar to select. Arrow keys inspect, Enter
              selects.
            </p>
          </>
        ) : (
          <p className="labui:p-6 labui:text-sm labui:text-muted-foreground">
            No measurements to display.
          </p>
        )}
      </ChartFrame>
    );
  },
);

export { HistogramChart, HistogramSparkline };
