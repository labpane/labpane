import * as React from "react";
import { ChartFrame } from "./chart-frame.js";

export type TimingSpan = {
  id: string;
  start: number;
  end: number;
  label: string;
  detail?: string;
  color?: string;
  /** A bound or observation window, not a measured execution interval. */
  uncertain?: boolean;
};
export type TimingTrack = { id: string; label: string; spans: TimingSpan[] };

export type TimingTracksProps = {
  tracks: TimingTrack[];
  from: number;
  to: number;
  label?: string;
  unit?: string;
  onSelect?: (span: TimingSpan) => void;
};

const TICKS = 5;
const formatValue = (value: number) =>
  value.toLocaleString(undefined, { maximumFractionDigits: 3 });

/** Shared-clock tracks supplied by the caller. Deliberately no clock conversion. */
const TimingTracks = React.forwardRef<HTMLDivElement, TimingTracksProps>(
  function TimingTracks(
    { tracks, from, to, label = "Timeline", unit = "ms", onSelect },
    ref,
  ) {
    const [active, setActive] = React.useState<TimingSpan | null>(null);
    const range = Math.max(0.001, to - from);
    const visible = (span: TimingSpan) => span.end >= from && span.start <= to;
    const placement = (span: TimingSpan) => {
      const left = Math.max(from, span.start);
      const right = Math.min(to, span.end);
      return {
        left: `${((left - from) / range) * 100}%`,
        width: `max(3px, ${((right - left) / range) * 100}%)`,
      };
    };
    const duration = (span: TimingSpan) =>
      `${formatValue(span.end - span.start)} ${unit}`;

    return (
      <ChartFrame data-slot="timing-tracks" aria-label={label} ref={ref}>
        <div className="labui:border-b labui:px-4 labui:py-3 labui:text-sm labui:font-semibold">
          {label}
        </div>
        <div className="labui:overflow-x-auto labui:p-4">
          <div className="labui:min-w-[560px]">
            <div className="labui:mb-2 labui:ml-36 labui:flex labui:justify-between labui:text-xs labui:text-muted-foreground labui:tabular-nums">
              {Array.from({ length: TICKS }, (_, i) => (
                <span key={i}>
                  {formatValue(from + (range * i) / (TICKS - 1))} {unit}
                </span>
              ))}
            </div>
            {tracks.map((track) => (
              <div
                key={track.id}
                className="labui:mb-2 labui:flex labui:items-center labui:gap-3"
              >
                <span className="labui:w-32 labui:shrink-0 labui:text-xs labui:font-medium">
                  {track.label}
                </span>
                <div
                  className="labui:relative labui:h-9 labui:flex-1 labui:rounded labui:border labui:bg-muted/30"
                  aria-label={track.label}
                >
                  {track.spans.filter(visible).map((span) => (
                    <button
                      key={span.id}
                      type="button"
                      className="labui:absolute labui:top-1 labui:h-7 labui:overflow-hidden labui:rounded labui:px-1 labui:text-left labui:text-[11px] labui:text-primary-foreground labui:outline-offset-2 labui:focus-visible:outline-2"
                      style={{
                        ...placement(span),
                        background: span.color || "var(--labui-chart-4)",
                        border: span.uncertain
                          ? "1px dashed currentColor"
                          : undefined,
                        opacity: span.uncertain ? 0.65 : 1,
                      }}
                      title={`${span.label}: ${duration(span)}. ${span.detail ?? ""}`}
                      onPointerEnter={() => setActive(span)}
                      onFocus={() => setActive(span)}
                      onClick={() => {
                        setActive(span);
                        onSelect?.(span);
                      }}
                      aria-label={`${span.label}, ${formatValue(span.start)} to ${formatValue(span.end)} ${unit}${span.uncertain ? ", observation window" : ""}`}
                    >
                      {span.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div
          className="labui:min-h-14 labui:border-t labui:bg-muted/20 labui:px-4 labui:py-3 labui:text-xs"
          aria-live="polite"
        >
          {active ? (
            <>
              <strong>{active.label}</strong>, {duration(active)}
              <span className="labui:ml-2 labui:text-muted-foreground">
                {active.detail}
              </span>
            </>
          ) : (
            <span className="labui:text-muted-foreground">
              Hover or focus a span for its timing. Dashed spans indicate
              observation windows.
            </span>
          )}
        </div>
      </ChartFrame>
    );
  },
);

export { TimingTracks };
