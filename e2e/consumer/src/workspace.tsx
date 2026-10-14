import {
  Profiler,
  Suspense,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import {
  Workspace,
  useUnsavedChanges,
  type Layout,
  type WorkspaceMenu,
  type WorkspacePane,
  type WorkspaceTab,
} from "@labpane/os";

declare global {
  interface Window {
    lab: { commits: number; resolveReport: () => void };
  }
}

let reportReady = false;
let resolveReport = () => {};
const report = new Promise<void>((resolve) => {
  resolveReport = () => {
    reportReady = true;
    resolve();
  };
});
window.lab = { commits: 0, resolveReport: () => resolveReport() };

function Report() {
  if (!reportReady) throw report;
  return <p>Report ready</p>;
}

function Notes() {
  useUnsavedChanges(true);
  return <textarea aria-label="Notes" defaultValue="Draft" />;
}

const params = new URLSearchParams(location.search);
const kinds: Record<string, string> = {
  overview: "Overview",
  notes: "Notes",
  settings: "Settings",
  report: "Report",
};
const initial = Array.from(
  { length: Number(params.get("tabs") ?? 3) },
  (_, index) => {
    const kind = ["overview", "notes", "settings"][index % 3]!;
    return { key: `${kind}-${index}`, kind, label: `${kinds[kind]} ${index}` };
  },
);
type Tab = WorkspaceTab & { kind: string };
export type Slots = {
  toolbar?: (pane: WorkspacePane) => ReactNode;
  menu?: WorkspaceMenu;
  confirmClose?: (tab: Tab) => Promise<boolean>;
};

export function Demo({
  header,
  leading,
  trailing,
  titleBar,
  slots,
}: {
  header?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  titleBar?: boolean;
  slots?: (open: (kind: string) => string) => Slots;
}) {
  const [tabs, setTabs] = useState<Tab[]>(initial);
  const [active, setActive] = useState<string | undefined>(initial[0]?.key);
  const [layout, setLayout] = useState<Layout>({
    id: "primary",
    tabs: initial.map((tab) => tab.key),
    active: initial[0]?.key,
  });
  const [pending, startTransition] = useTransition();
  const navigate = params.has("transition")
    ? startTransition
    : (update: () => void) => update();
  const next = useRef(initial.length);
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    if (!params.has("ticks")) return;
    const timer = setInterval(() => setTicks((tick) => tick + 1), 50);
    return () => clearInterval(timer);
  }, []);
  const open = (kind: string) => {
    const index = next.current++;
    const key = `${kind}-${index}`;
    navigate(() => {
      setTabs((tabs) => [
        ...tabs,
        { key, kind, label: `${kinds[kind]} ${index}` },
      ]);
      setActive(key);
    });
    return key;
  };
  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center gap-2 border-b px-4 py-1 text-sm">
        <span data-pending={pending} data-ticks={ticks}>
          {pending ? "Loading" : "Idle"}
        </span>
        {header}
      </header>
      <Suspense fallback={<p>Loading workspace</p>}>
        <Profiler
          id="workspace"
          onRender={() => {
            window.lab.commits++;
          }}
        >
          <div className="min-h-0 flex-1">
            <Workspace
              tabs={tabs}
              active={active}
              layout={layout}
              onLayoutChange={setLayout}
              onSelect={(key) => navigate(() => setActive(key))}
              onClose={(key, neighbor) =>
                navigate(() => {
                  setTabs((tabs) => tabs.filter((tab) => tab.key !== key));
                  setActive((current) =>
                    current === key ? neighbor : current,
                  );
                })
              }
              leading={leading}
              trailing={trailing}
              titleBar={titleBar}
              empty={() => <p>No tabs open</p>}
              {...slots?.(open)}
            >
              {(tab) =>
                tab.kind === "notes" ? (
                  <Notes />
                ) : tab.kind === "report" ? (
                  <Report />
                ) : (
                  <p>{tab.label} content</p>
                )
              }
            </Workspace>
          </div>
        </Profiler>
      </Suspense>
    </div>
  );
}
