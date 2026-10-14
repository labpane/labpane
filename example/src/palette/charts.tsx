import { useState } from "react";
import {
  ChartFrame,
  DAY,
  DEFAULT_OPTIONS,
  FlameGraph,
  HistogramChart,
  HistogramSparkline,
  Table,
  TimeSeriesChart,
  TimingTracks,
  column,
  type FlameNode,
  type HistogramBin,
  type SeriesPoint,
  type TimingTrack,
} from "@labpane/ui";
import { Section, Specimen } from "./section";

// Monday 5 January 2026, so weekends fall on days 5 and 6 of each week
const start = Date.UTC(2026, 0, 5);
const platforms = [
  { key: "Sequencing", color: "var(--labui-chart-1)" },
  { key: "Imaging", color: "var(--labui-chart-2)" },
  { key: "Assays", color: "var(--labui-chart-4)" },
];
const samplesPerDay: SeriesPoint[] = Array.from({ length: 120 }, (_, day) => {
  const quiet = day % 7 >= 5 ? 0.3 : 1;
  const values = {
    Sequencing: Math.round(quiet * (38 + day * 0.25 + 9 * Math.sin(day / 6))),
    Imaging: Math.round(quiet * (24 + 6 * Math.cos(day / 9))),
    Assays: Math.round(quiet * (15 + day * 0.1 + 5 * Math.sin(day / 4 + 1))),
  };
  return {
    time: start + day * DAY,
    total: values.Sequencing + values.Imaging + values.Assays,
    values,
    ...(day === 64 ? { annotation: "Sequencer serviced" } : {}),
  };
});

export function TimeSeries() {
  const [options, setOptions] = useState(DEFAULT_OPTIONS);
  return (
    <Section
      id="time-series"
      intro={
        <>
          Stacked daily series with a crosshair, a drag selection, zoom windows,
          and optional indicators from the settings menu. The caller owns{" "}
          <code>options</code>.
        </>
      }
    >
      <Specimen label="TimeSeriesChart with three series over 120 days" stack>
        <TimeSeriesChart
          points={samplesPerDay}
          series={platforms}
          start={start}
          options={options}
          onOptionsChange={setOptions}
          title="Samples processed"
          subtitle="Daily, by platform"
          unit="samples"
          label="Samples processed per day"
        />
      </Specimen>
    </Section>
  );
}

const buildBins: HistogramBin[] = [
  { from: 0, to: 59, count: 4 },
  { from: 60, to: 119, count: 18 },
  { from: 120, to: 179, count: 41 },
  { from: 180, to: 239, count: 57 },
  { from: 240, to: 299, count: 36 },
  { from: 300, to: 359, count: 19 },
  { from: 360, to: 419, count: 9 },
  { from: 420, to: 479, count: 3 },
  { from: 480, to: 539, count: 1 },
];

const spark = (counts: number[]): HistogramBin[] =>
  counts.map((count, index) => ({
    from: index * 30,
    to: index * 30 + 29,
    count,
  }));

type Pipeline = { name: string; runs: number; bins: HistogramBin[] };
const pipelines: Pipeline[] = [
  { name: "Ingest", runs: 188, bins: spark([2, 9, 31, 58, 44, 25, 12, 7]) },
  { name: "Transform", runs: 188, bins: spark([0, 3, 12, 27, 49, 52, 30, 15]) },
  { name: "Publish", runs: 61, bins: spark([14, 22, 13, 6, 3, 2, 1, 0]) },
];

const pipelineColumns = (onOpen: (name: string) => void) => [
  {
    ...column<Pipeline>("name", "Pipeline", (row) => row.name),
    rowHeader: true,
  },
  {
    ...column<Pipeline>("runs", "Runs", (row) => row.runs),
    numeric: true,
  },
  {
    id: "durations",
    header: "Duration distribution",
    cell: (row: Pipeline) => (
      <button
        type="button"
        className="spark-button"
        onClick={() => onOpen(row.name)}
      >
        <HistogramSparkline
          bins={row.bins}
          label={`Duration distribution for ${row.name}, press to open`}
        />
      </button>
    ),
  },
];

export function Histograms() {
  const [selected, setSelected] = useState<number>();
  const [opened, setOpened] = useState("");
  const bin = selected === undefined ? undefined : buildBins[selected];
  return (
    <Section
      id="histogram"
      intro={
        <>
          <code>HistogramChart</code> plots equal bins; hover inspects, a click
          or Enter selects. <code>HistogramSparkline</code> is the same shape in
          miniature for a table cell.
        </>
      }
    >
      <Specimen label="HistogramChart with selected and onSelect" stack>
        <HistogramChart
          bins={buildBins}
          label="Build durations"
          xLabel="Seconds"
          unit="builds"
          selected={selected}
          onSelect={setSelected}
        />
        <span className="muted" role="status">
          {bin
            ? `Selected builds of ${bin.from} to ${bin.to} seconds`
            : "Click a bar to select it."}
        </span>
      </Specimen>
      <Specimen
        label="HistogramSparkline in a table cell, inside a button of the caller's"
        stack
      >
        <Table
          label="Pipeline durations"
          rows={pipelines}
          rowKey={(row) => row.name}
          columns={pipelineColumns(setOpened)}
        />
        <span className="muted" role="status">
          {opened && `Opened ${opened}`}
        </span>
      </Specimen>
    </Section>
  );
}

const pipelineNodes: FlameNode[] = [
  {
    id: "run",
    parentId: null,
    name: "pipeline.run",
    total: 1240,
    self: 20,
    calls: 1,
    detail: "pipeline/run.py:12",
  },
  {
    id: "ingest",
    parentId: "run",
    name: "ingest",
    total: 420,
    self: 20,
    calls: 1,
    detail: "pipeline/ingest.py:8",
  },
  {
    id: "fetch",
    parentId: "ingest",
    name: "fetch_sources",
    total: 300,
    self: 300,
    calls: 12,
    detail: "pipeline/ingest.py:31",
  },
  {
    id: "parse",
    parentId: "ingest",
    name: "parse_records",
    total: 100,
    self: 100,
    calls: 12,
    detail: "pipeline/ingest.py:58",
  },
  {
    id: "transform",
    parentId: "run",
    name: "transform",
    total: 560,
    self: 40,
    calls: 1,
    detail: "pipeline/transform.py:9",
  },
  {
    id: "normalize",
    parentId: "transform",
    name: "normalize",
    total: 180,
    self: 180,
    calls: 4812,
  },
  {
    id: "join",
    parentId: "transform",
    name: "join_metadata",
    total: 280,
    self: 280,
    calls: 4812,
  },
  {
    id: "dedupe",
    parentId: "transform",
    name: "deduplicate",
    total: 60,
    self: 60,
    calls: 1,
  },
  {
    id: "load",
    parentId: "run",
    name: "load",
    total: 240,
    self: 10,
    calls: 1,
    detail: "pipeline/load.py:5",
  },
  {
    id: "write",
    parentId: "load",
    name: "write_parquet",
    total: 200,
    self: 200,
    calls: 3,
  },
  {
    id: "index",
    parentId: "load",
    name: "update_index",
    total: 30,
    self: 30,
    calls: 1,
  },
];

export function FlameGraphs() {
  const [focus, setFocus] = useState<string | null>(null);
  return (
    <Section
      id="flame-graph"
      intro={
        <>
          A profile of a data pipeline. Hover or focus a bar to inspect it,
          click to zoom in, and search by name. The caller may own{" "}
          <code>focusId</code>.
        </>
      }
    >
      <Specimen label="FlameGraph with focusId and onFocusChange" stack>
        <FlameGraph
          nodes={pipelineNodes}
          label="Pipeline run 1842"
          unit="ms"
          countLabel="Calls"
          meanLabel="Mean per call"
          focusId={focus}
          onFocusChange={setFocus}
        />
        <span className="muted" role="status">
          {focus ? `Zoomed to ${focus}` : "Showing the whole run"}
        </span>
      </Specimen>
    </Section>
  );
}

const tracks: TimingTrack[] = [
  {
    id: "scheduler",
    label: "Scheduler",
    spans: [
      {
        id: "queue",
        start: 0,
        end: 120,
        label: "Queued",
        detail: "Waiting for a free worker",
      },
      {
        id: "dispatch",
        start: 120,
        end: 160,
        label: "Dispatch",
        color: "var(--labui-chart-5)",
      },
    ],
  },
  {
    id: "worker-a",
    label: "Worker A",
    spans: [
      {
        id: "fetch",
        start: 160,
        end: 460,
        label: "Fetch",
        detail: "12 source files",
        color: "var(--labui-chart-1)",
      },
      {
        id: "parse",
        start: 460,
        end: 560,
        label: "Parse",
        color: "var(--labui-chart-1)",
      },
    ],
  },
  {
    id: "worker-b",
    label: "Worker B",
    spans: [
      {
        id: "normalize",
        start: 560,
        end: 740,
        label: "Normalize",
        color: "var(--labui-chart-3)",
      },
      {
        id: "join",
        start: 740,
        end: 1020,
        label: "Join",
        detail: "4,812 records",
        color: "var(--labui-chart-3)",
      },
    ],
  },
  {
    id: "storage",
    label: "Storage",
    spans: [
      { id: "write", start: 1020, end: 1220, label: "Write" },
      {
        id: "index",
        start: 1220,
        end: 1300,
        label: "Index refresh",
        detail: "Observed as a window, not measured",
        uncertain: true,
      },
    ],
  },
];

const weekly = spark([61, 72, 68, 80, 94, 88, 101, 97, 110, 118, 112, 125]);

export function TimingTracksDemo() {
  const [picked, setPicked] = useState("");
  return (
    <Section
      id="timing-tracks"
      intro={
        <>
          <code>TimingTracks</code> lays spans on a shared clock, one track per
          worker; dashed spans are observation windows. <code>ChartFrame</code>{" "}
          is the card every chart sits in, for charts of your own.
        </>
      }
    >
      <Specimen label="TimingTracks with onSelect" stack>
        <TimingTracks
          tracks={tracks}
          from={0}
          to={1300}
          label="Pipeline run 1842, by worker"
          unit="ms"
          onSelect={(span) => setPicked(span.label)}
        />
        <span className="muted" role="status">
          {picked && `Selected ${picked}`}
        </span>
      </Specimen>
      <Specimen label="ChartFrame with content of your own" stack>
        <ChartFrame aria-label="Samples per week">
          <div className="chart-frame-head">Samples per week</div>
          <div className="chart-frame-body">
            <HistogramSparkline
              bins={weekly}
              label="Samples per week over twelve weeks"
            />
            <p className="muted">
              Twelve weeks of intake, rising from 61 to 125 samples a week.
            </p>
          </div>
        </ChartFrame>
      </Specimen>
    </Section>
  );
}
