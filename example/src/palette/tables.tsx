import { useCallback, useMemo, useState } from "react";
import { PlusIcon } from "lucide-react";
import {
  Badge,
  Button,
  NavTab,
  NavTabs,
  Table,
  TableScreen,
  TableStack,
  column,
  mono,
  num,
} from "@labpane/ui";
import { Section, Specimen } from "./section";

type Workspace = { name: string; tabs: number; size: number; path: string };
const workspaces: Workspace[] = [
  { name: "Inbox", tabs: 4, size: 12.5, path: "/inbox" },
  { name: "Reports", tabs: 12, size: 3.25, path: "/reports" },
  { name: "Settings", tabs: 1, size: 0.75, path: "/settings" },
  { name: "Terminal", tabs: 2, size: 48, path: "/terminal" },
];
const workspaceColumns = [
  { ...column<Workspace>("name", "Name", (row) => row.name), rowHeader: true },
  mono<Workspace>("path", "Path", (row) => row.path),
  num<Workspace>("tabs", "Tabs", (row) => row.tabs),
  num<Workspace>("size", "Size", (row) => row.size, 2, "MB"),
];

type Sample = {
  id: string;
  site: string;
  depth: number;
  temperature: number;
  salinity: number;
  status: "Reviewed" | "Pending" | "Flagged";
};
const sites = ["North reef", "Lagoon", "Channel", "Outer wall", "Seagrass bed"];
const statuses = [
  "Reviewed",
  "Reviewed",
  "Pending",
  "Reviewed",
  "Flagged",
] as const;
const tones = {
  Reviewed: "success",
  Pending: "warning",
  Flagged: "destructive",
} as const;

// Values follow from the index, so the page and its tests always agree
function sample(index: number): Sample {
  return {
    id: `S-${String(index + 1).padStart(4, "0")}`,
    site: sites[index % sites.length]!,
    depth: Math.round(40 + ((index * 37) % 260)) / 10,
    temperature: Math.round(260 + Math.sin(index / 7) * 18) / 10,
    salinity: Math.round(3500 + Math.cos(index / 11) * 60) / 100,
    status: statuses[index % statuses.length]!,
  };
}
const samples = Array.from({ length: 300 }, (_, index) => sample(index));
const pagedSamples = samples.slice(0, 23);
const reviewed = samples.slice(0, 8);

const sampleColumns = [
  {
    ...column<Sample>(
      "id",
      "Sample",
      (row) => row.id,
      (row) => <TableStack title={row.id} detail={row.site} />,
    ),
    rowHeader: true,
  },
  num<Sample>("depth", "Depth", (row) => row.depth, 1, "m"),
  num<Sample>("temperature", "Temperature", (row) => row.temperature, 1, "C"),
  {
    ...num<Sample>("salinity", "Salinity", (row) => row.salinity, 2, "PSU"),
    hideBelow: "md" as const,
  },
  {
    ...column<Sample>(
      "status",
      "Status",
      (row) => row.status,
      (row) => <Badge variant={tones[row.status]}>{row.status}</Badge>,
    ),
    align: "end" as const,
  },
];

const compactColumns = [
  { ...mono<Sample>("id", "Sample", (row) => row.id), rowHeader: true },
  {
    ...column<Sample>("site", "Site", (row) => row.site),
    hideBelow: "sm" as const,
  },
  num<Sample>("depth", "Depth", (row) => row.depth, 1, "m"),
  num<Sample>("temperature", "Temperature", (row) => row.temperature, 1, "C"),
  column<Sample>("status", "Status", (row) => row.status),
];

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

export function Tables() {
  const [opened, setOpened] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(30);
  const streamed = useMemo(() => samples.slice(0, loaded), [loaded]);
  const loadMore = useCallback(async () => {
    await wait(400);
    setLoaded((count) => Math.min(samples.length, count + 20));
  }, []);
  return (
    <Section
      id="table"
      intro={
        <>
          Sortable columns built with <code>column</code>, <code>mono</code>,
          and <code>num</code>; click a header to sort. <code>TableStack</code>{" "}
          puts a detail line under a cell. Rows page with <code>pageSize</code>,
          window with <code>rowHeight</code>, or stream in with{" "}
          <code>onLoadMore</code>.
        </>
      }
    >
      <Specimen label="Sortable, with defaultSort and onRowActivate" stack>
        <Table
          label="Workspaces"
          rows={workspaces}
          rowKey={(row) => row.name}
          columns={workspaceColumns}
          defaultSort={{ column: "tabs", direction: "desc" }}
          onRowActivate={(row) => setOpened(row.name)}
          rowLabel={(row) => `Open ${row.name}`}
        />
        <span className="muted" role="status">
          {opened && `Opened: ${opened}`}
        </span>
      </Specimen>
      <Specimen
        label="selectedKey, TableStack, hideBelow, banner, footerStart, and footerEnd"
        stack
      >
        <Table
          label="Samples under review"
          rows={reviewed}
          rowKey={(row) => row.id}
          columns={sampleColumns}
          selectedKey={selected}
          onRowActivate={(row) => setSelected(row.id)}
          rowLabel={(row) => `Select ${row.id}`}
          banner={
            <p className="table-banner">
              Two samples are still waiting for review.
            </p>
          }
          footerStart={
            <span>
              {selected ? `Selected ${selected}` : "Click a row to select it"}
            </span>
          }
          footerEnd={
            <Button variant="ghost" size="xs">
              Export CSV
            </Button>
          }
        />
      </Specimen>
      <Specimen label="pageSize={5}" stack>
        <Table
          label="Samples by page"
          rows={pagedSamples}
          rowKey={(row) => row.id}
          columns={compactColumns}
          pageSize={5}
        />
      </Specimen>
      <div className="specimen-grid specimen-grid-wide">
        <Specimen
          label="rowHeight={36} renders only the rows on screen of 300"
          stack
        >
          <Table
            label="Three hundred samples"
            rows={samples}
            rowKey={(row) => row.id}
            columns={compactColumns}
            rowHeight={36}
            scrollClassName="table-scroll"
          />
        </Specimen>
        <Specimen
          label="onLoadMore with hasMore loads 20 more near the end"
          stack
        >
          <Table
            label="Samples loading as you scroll"
            rows={streamed}
            rowKey={(row) => row.id}
            columns={compactColumns}
            rowHeight={36}
            scrollClassName="table-scroll"
            onLoadMore={loadMore}
            hasMore={loaded < samples.length}
            footerStart={<span>{`${loaded} of ${samples.length} loaded`}</span>}
          />
        </Specimen>
      </div>
      <div className="specimen-grid specimen-grid-wide">
        <Specimen label="loading" stack>
          <Table
            label="Loading workspaces"
            rows={[]}
            rowKey={(row) => row.name}
            columns={workspaceColumns}
            loading
          />
        </Specimen>
        <Specimen label="Empty" stack>
          <Table
            label="No workspaces"
            rows={[]}
            rowKey={(row) => row.name}
            columns={workspaceColumns}
            empty="No workspaces yet."
          />
        </Specimen>
      </div>
    </Section>
  );
}

type Invoice = {
  number: string;
  client: string;
  amount: number;
  due: string;
  status: "Paid" | "Due" | "Overdue";
};
const invoices: Invoice[] = [
  {
    number: "INV-1042",
    client: "Marine Institute",
    amount: 1250,
    due: "2026-11-02",
    status: "Due",
  },
  {
    number: "INV-1041",
    client: "Coastal Council",
    amount: 480,
    due: "2026-10-20",
    status: "Overdue",
  },
  {
    number: "INV-1039",
    client: "Harbour Authority",
    amount: 3190,
    due: "2026-10-05",
    status: "Paid",
  },
  {
    number: "INV-1037",
    client: "Blue Carbon Trust",
    amount: 920,
    due: "2026-09-28",
    status: "Paid",
  },
];
const invoiceTones = {
  Paid: "success",
  Due: "info",
  Overdue: "destructive",
} as const;
const invoiceColumns = [
  {
    ...mono<Invoice>("number", "Invoice", (row) => row.number),
    rowHeader: true,
  },
  column<Invoice>("client", "Client", (row) => row.client),
  num<Invoice>("amount", "Amount", (row) => row.amount, 2, "USD"),
  {
    ...column<Invoice>("due", "Due", (row) => row.due),
    hideBelow: "sm" as const,
  },
  column<Invoice>(
    "status",
    "Status",
    (row) => row.status,
    (row) => <Badge variant={invoiceTones[row.status]}>{row.status}</Badge>,
  ),
];
const filters = ["All", "Due", "Overdue", "Paid"];

export function TableScreens() {
  const [filter, setFilter] = useState("All");
  const shown =
    filter === "All"
      ? invoices
      : invoices.filter((row) => row.status === filter);
  return (
    <Section
      id="table-screen"
      intro={
        <>
          A whole screen for a table: a bar <code>PageHeader</code> with the
          title, description, and actions, a row of tabs, an error when the data
          is stale, and the table filling what is left.
        </>
      }
    >
      <Specimen label="TableScreen with tabs and an error" stack>
        <div className="layout-frame layout-frame-tall">
          <TableScreen
            title="Invoices"
            description="Billing for shared instrument time"
            actions={
              <Button size="sm">
                <PlusIcon />
                New invoice
              </Button>
            }
            tabs={
              <NavTabs aria-label="Invoice filters">
                {filters.map((name) => (
                  <NavTab
                    key={name}
                    href="#table-screen"
                    active={name === filter}
                    onClick={(event) => {
                      event.preventDefault();
                      setFilter(name);
                    }}
                  >
                    {name}
                  </NavTab>
                ))}
              </NavTabs>
            }
            error="The billing service timed out. These invoices are from the last sync."
          >
            <Table
              label="Invoices"
              rows={shown}
              rowKey={(row) => row.number}
              columns={invoiceColumns}
              defaultSort={{ column: "due", direction: "desc" }}
            />
          </TableScreen>
        </div>
      </Specimen>
    </Section>
  );
}
