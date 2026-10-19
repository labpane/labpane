import { useId, useState } from "react";
import {
  ArrowLeftIcon,
  BellIcon,
  ChartLineIcon,
  DatabaseIcon,
  EllipsisIcon,
  FlaskConicalIcon,
  InboxIcon,
  MicroscopeIcon,
  NotebookPenIcon,
  PlusIcon,
  ReceiptIcon,
  UsersIcon,
} from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  BrowserLayout,
  BrowserLayoutNav,
  BrowserLayoutPane,
  BrowserLayoutToggle,
  Button,
  Rail,
  RailItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  SettingsFooter,
  SettingsRow,
  SettingsSection,
  SidePanel,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  Stat,
  StatLabel,
  StatValue,
  Stats,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  Topbar,
  TopbarActions,
} from "@labpane/ui";
import { Logo } from "../site";
import { Section, Specimen } from "./section";

const workspace = [
  { id: "datasets", label: "Datasets", icon: DatabaseIcon, badge: "12" },
  {
    id: "experiments",
    label: "Experiments",
    icon: FlaskConicalIcon,
    sub: ["Coastal survey", "Catalyst screen"],
  },
  { id: "analysis", label: "Analysis", icon: ChartLineIcon, action: true },
  { id: "notebook", label: "Notebook", icon: NotebookPenIcon },
];

export function Sidebars() {
  const [active, setActive] = useState("datasets");
  const current = workspace.find((item) => item.id === active)!;
  return (
    <Section
      id="sidebar"
      intro={
        <>
          <code>SidebarProvider</code> keeps the open state for a{" "}
          <code>Sidebar</code>, its <code>SidebarTrigger</code>, and the{" "}
          <code>SidebarRail</code> on its edge. With{" "}
          <code>collapsible="icon"</code> it shrinks to icons with tooltips; on
          narrow screens it becomes a sheet. The Ctrl+B shortcut is off here.
        </>
      }
    >
      <Specimen
        label="Sidebar with header, groups, menu, submenu, badge, action, skeleton, footer, rail, and SidebarInset"
        stack
      >
        <div className="layout-frame">
          <SidebarProvider shortcut={null} style={{ minHeight: "100%" }}>
            <Sidebar collapsible="icon">
              <SidebarHeader>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton size="lg" tooltip="Coastal survey">
                      <Logo />
                      <span>Coastal survey</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
                <SidebarInput
                  aria-label="Search the workspace"
                  placeholder="Search"
                />
              </SidebarHeader>
              <SidebarContent>
                <SidebarGroup>
                  <SidebarGroupLabel>Workspace</SidebarGroupLabel>
                  <SidebarGroupAction title="Add a page">
                    <PlusIcon />
                    <span className="sr-only">Add a page</span>
                  </SidebarGroupAction>
                  <SidebarGroupContent>
                    <SidebarMenu>
                      {workspace.map((item) => (
                        <SidebarMenuItem key={item.id}>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={item.id === active}
                            onClick={() => setActive(item.id)}
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </SidebarMenuButton>
                          {item.badge && (
                            <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                          )}
                          {item.action && (
                            <SidebarMenuAction showOnHover aria-label="More">
                              <EllipsisIcon />
                            </SidebarMenuAction>
                          )}
                          {item.sub && (
                            <SidebarMenuSub>
                              {item.sub.map((name, index) => (
                                <SidebarMenuSubItem key={name}>
                                  <SidebarMenuSubButton
                                    href="#sidebar"
                                    isActive={index === 0}
                                  >
                                    <span>{name}</span>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          )}
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
                <SidebarSeparator />
                <SidebarGroup>
                  <SidebarGroupLabel>Recent</SidebarGroupLabel>
                  <SidebarGroupContent>
                    <SidebarMenu aria-busy="true">
                      {[0, 1, 2].map((row) => (
                        <SidebarMenuItem key={row}>
                          <SidebarMenuSkeleton showIcon />
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>
              <SidebarFooter>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Mara Okafor">
                      <Avatar size="sm">
                        <AvatarFallback>MO</AvatarFallback>
                      </Avatar>
                      <span>Mara Okafor</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarFooter>
              <SidebarRail />
            </Sidebar>
            <SidebarInset>
              <header className="inset-header">
                <SidebarTrigger />
                <Separator orientation="vertical" className="inset-separator" />
                <span>{current.label}</span>
              </header>
              <div className="inset-body muted">
                Pick a page in the sidebar. The trigger, or the rail on the
                sidebar's edge, collapses it to icons.
              </div>
            </SidebarInset>
          </SidebarProvider>
        </div>
      </Specimen>
    </Section>
  );
}

const rail = [
  { id: "inbox", label: "Inbox", icon: InboxIcon },
  { id: "instruments", label: "Instruments", icon: MicroscopeIcon },
  { id: "members", label: "Members", icon: UsersIcon },
  { id: "billing", label: "Billing", icon: ReceiptIcon },
];

export function Rails() {
  const [active, setActive] = useState("instruments");
  const current = rail.find((item) => item.id === active)!;
  return (
    <Section
      id="rail"
      intro={
        <>
          <code>Rail</code> is a narrow sidebar of <code>RailItem</code>s, an
          icon over a label, that never collapses. <code>Topbar</code> runs
          along the top of a page with <code>TopbarActions</code> at its end.
        </>
      }
    >
      <Specimen label="Rail with RailItems beside a Topbar" stack>
        <div className="layout-frame">
          <SidebarProvider shortcut={null} style={{ minHeight: "100%" }}>
            <Rail aria-label="Sections">
              <SidebarContent>
                <SidebarMenu className="rail-menu">
                  {rail.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <RailItem
                        active={item.id === active}
                        onClick={() => setActive(item.id)}
                      >
                        <item.icon />
                        <span>{item.label}</span>
                      </RailItem>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarContent>
            </Rail>
            <div className="rail-main">
              <Topbar>
                <span className="topbar-title">{current.label}</span>
                <TopbarActions>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Notifications"
                  >
                    <BellIcon />
                  </Button>
                  <Button size="sm">
                    <PlusIcon />
                    Book time
                  </Button>
                </TopbarActions>
              </Topbar>
              <div className="inset-body muted">
                Three instruments are free this afternoon.
              </div>
            </div>
          </SidebarProvider>
        </div>
      </Specimen>
    </Section>
  );
}

const zones = [
  { id: "utc", name: "UTC" },
  { id: "europe-lisbon", name: "Europe, Lisbon" },
  { id: "pacific-auckland", name: "Pacific, Auckland" },
];

export function SettingsDemo() {
  const digest = useId();
  const alerts = useId();
  const zone = useId();
  const [weekly, setWeekly] = useState(true);
  const [faults, setFaults] = useState(false);
  const [picked, setPicked] = useState(zones[1]!.id);
  const [status, setStatus] = useState("");
  return (
    <Section
      id="settings"
      intro={
        <>
          A settings page: <code>SettingsSection</code>s of{" "}
          <code>SettingsRow</code>s, each a label and description with its
          control at the end, and a <code>SettingsFooter</code> with a status
          and the actions.
        </>
      }
    >
      <Specimen
        label="SettingsSection, SettingsRow with Switch and Select, SettingsFooter"
        stack
      >
        <div className="settings-sample">
          <SettingsSection
            title="Notifications"
            description="What the lab sends to your inbox."
          >
            <SettingsRow
              label="Weekly digest"
              description="Runs, invoices, and bookings, every Monday morning."
              htmlFor={digest}
            >
              <Switch
                id={digest}
                checked={weekly}
                onCheckedChange={setWeekly}
              />
            </SettingsRow>
            <SettingsRow
              label="Instrument faults"
              description="As soon as a booked instrument reports one."
              htmlFor={alerts}
            >
              <Switch
                id={alerts}
                checked={faults}
                onCheckedChange={setFaults}
              />
            </SettingsRow>
            <SettingsRow label="Time zone" htmlFor={zone}>
              <Select value={picked} onValueChange={setPicked}>
                <SelectTrigger id={zone} size="sm" className="settings-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {zones.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </SettingsRow>
          </SettingsSection>
          <SettingsFooter status={status}>
            <Button
              variant="ghost"
              onClick={() => {
                setWeekly(true);
                setFaults(false);
                setPicked(zones[1]!.id);
                setStatus("Defaults restored");
              }}
            >
              Reset
            </Button>
            <Button onClick={() => setStatus("Saved just now")}>Save</Button>
          </SettingsFooter>
        </div>
      </Specimen>
    </Section>
  );
}

export function SidePanels() {
  const [open, setOpen] = useState(true);
  const [width, setWidth] = useState(260);
  return (
    <Section
      id="side-panel"
      intro={
        <>
          <code>SidePanel</code> is a resizable aside. Drag its edge, or focus
          the edge and press the arrow keys; dragging it well past its minimum
          closes it, and the caller keeps the state. This example stacks the
          details below the controls on a phone.
        </>
      }
    >
      <Specimen label="SidePanel with open, width, and limits" stack>
        <div className="layout-frame panel-frame">
          <div className="panel-main">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setOpen(!open)}
            >
              {open ? "Close details" : "Open details"}
            </Button>
            <p className="muted" role="status">
              {open ? (
                <>
                  Details open
                  <span className="panel-width"> · {width}px wide</span>
                </>
              ) : (
                "Panel closed"
              )}
            </p>
          </div>
          <SidePanel
            open={open}
            onOpenChange={setOpen}
            width={width}
            onWidthChange={setWidth}
            label="Details"
            limits={{ mainMinWidth: 240 }}
            className="panel-aside"
          >
            <div className="panel-body">
              <h3>Run 043</h3>
              <Stats className="panel-stats">
                <Stat>
                  <StatLabel>Yield</StatLabel>
                  <StatValue>78.4%</StatValue>
                </Stat>
                <Stat>
                  <StatLabel>Samples</StatLabel>
                  <StatValue>96</StatValue>
                </Stat>
              </Stats>
              <p className="muted">
                A temperature sweep over catalyst A, nine readings at fifteen
                minute intervals.
              </p>
            </div>
          </SidePanel>
        </div>
      </Specimen>
    </Section>
  );
}

const datasets = [
  { id: "reef", name: "Reef transects 2026", samples: 412 },
  { id: "lagoon", name: "Lagoon chemistry", samples: 1284 },
  { id: "seagrass", name: "Seagrass cover", samples: 96 },
];

type View = "nav" | "detail";

export function BrowserLayouts() {
  const [view, setView] = useState<View>("nav");
  const [picked, setPicked] = useState(datasets[0]!);
  return (
    <Section
      id="browser-layout"
      intro={
        <>
          A list beside a detail pane. Below 768px only the pane that{" "}
          <code>view</code> names shows, so a phone moves between them; above,
          both show and <code>BrowserLayoutToggle</code> hides the{" "}
          <code>BrowserLayoutNav</code>.
        </>
      }
    >
      <Specimen
        label="BrowserLayout with BrowserLayoutNav, BrowserLayoutPane, and BrowserLayoutToggle"
        stack
      >
        <div className="browser-controls">
          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            aria-label="View"
            value={view}
            onValueChange={(value) => value && setView(value as View)}
          >
            <ToggleGroupItem value="nav">view="nav"</ToggleGroupItem>
            <ToggleGroupItem value="detail">view="detail"</ToggleGroupItem>
          </ToggleGroup>
          <span className="muted">Matters below 768px wide.</span>
        </div>
        <div className="layout-frame">
          <BrowserLayout view={view}>
            <BrowserLayoutNav aria-label="Datasets">
              <ul className="browser-list">
                {datasets.map((dataset) => (
                  <li key={dataset.id}>
                    <button
                      type="button"
                      aria-current={dataset === picked ? "true" : undefined}
                      onClick={() => {
                        setPicked(dataset);
                        setView("detail");
                      }}
                    >
                      <span>{dataset.name}</span>
                      <span className="muted">
                        {dataset.samples.toLocaleString("en-US")} samples
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </BrowserLayoutNav>
            <BrowserLayoutPane>
              <header className="inset-header">
                <BrowserLayoutToggle />
                <Button
                  variant="ghost"
                  size="sm"
                  className="browser-back"
                  onClick={() => setView("nav")}
                >
                  <ArrowLeftIcon />
                  Datasets
                </Button>
                <span>{picked.name}</span>
              </header>
              <div className="inset-body muted">
                {picked.samples.toLocaleString("en-US")} samples. Pick another
                dataset in the list.
              </div>
            </BrowserLayoutPane>
          </BrowserLayout>
        </div>
      </Specimen>
    </Section>
  );
}
