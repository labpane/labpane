import { useRef, useState, type ReactNode } from "react";
import {
  FileTextIcon,
  KeyboardIcon,
  LayoutPanelLeftIcon,
  PlusIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
} from "lucide-react";
import {
  Workspace,
  desktopSlots,
  useFullscreen,
  useWindowFrame,
  type Layout,
  type WindowHost,
  type WorkspaceTab,
} from "@labpane/os";
import {
  ActionMenu,
  AppMenu,
  Button,
  DiscardDialog,
  OptionMenu,
} from "@labpane/ui";
import { Logo } from "../site";
import { setDark, useDark } from "../theme";
import {
  DraftPage,
  KeyboardPage,
  LayoutPage,
  SettingsPage,
  WelcomePage,
} from "./pages";

export type Kind = "welcome" | "settings" | "keyboard" | "layout" | "draft";
export type DemoTab = WorkspaceTab & { kind: Kind };

const kinds: Record<Kind, { label: string; icon: ReactNode }> = {
  welcome: { label: "Welcome", icon: <SparklesIcon size={16} /> },
  layout: { label: "Layout", icon: <LayoutPanelLeftIcon size={16} /> },
  draft: { label: "Draft", icon: <FileTextIcon size={16} /> },
  keyboard: { label: "Keyboard", icon: <KeyboardIcon size={16} /> },
  settings: { label: "Settings", icon: <SlidersHorizontalIcon size={16} /> },
};
const order = Object.keys(kinds) as Kind[];

function start(wide: boolean) {
  const tabs = order.map((kind) => ({ key: kind, kind, ...kinds[kind] }));
  const layout: Layout = wide
    ? {
        id: "split",
        axis: "x",
        ratio: 0.56,
        first: {
          id: "left",
          tabs: ["welcome", "draft", "keyboard"],
          active: "welcome",
        },
        second: { id: "right", tabs: ["layout", "settings"], active: "layout" },
      }
    : { id: "main", tabs: order, active: "welcome" };
  return { tabs, layout };
}

const wide = () => matchMedia("(min-width: 48rem)").matches;

// Demo runs in the home page's frame, or fills a desktop window when given its host
export function Demo({ host }: { host?: WindowHost }) {
  const dark = useDark();
  const [fullscreen, setFullscreen] = useFullscreen(host);
  useWindowFrame(host);
  const [initial] = useState(() => start(wide()));
  const [tabs, setTabs] = useState<DemoTab[]>(initial.tabs);
  const [active, setActive] = useState<string | undefined>("welcome");
  const [layout, setLayout] = useState<Layout>(initial.layout);
  const [density, setDensity] = useState(100);
  const [icons, setIcons] = useState(wide);
  const [generation, setGeneration] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const opened = useRef<string | undefined>(undefined);
  const count = useRef(0);
  const [discard, setDiscard] = useState<{
    label: string;
    resolve: (discard: boolean) => void;
  }>();

  const add = (kind: Kind, after?: string) => {
    const base = kinds[kind].label;
    const taken = new Set(tabs.map((tab) => tab.label));
    let label = base;
    for (let n = 2; taken.has(label); n++) label = `${base} ${n}`;
    const key = `${kind}-${++count.current}`;
    const tab: DemoTab = { key, kind, label, icon: kinds[kind].icon };
    setTabs((tabs) => {
      const index = tabs.findIndex((tab) => tab.key === after);
      return index < 0
        ? [...tabs, tab]
        : [...tabs.slice(0, index + 1), tab, ...tabs.slice(index + 1)];
    });
    setActive(key);
    return key;
  };

  const reset = () => {
    const next = start(wide());
    setTabs(next.tabs);
    setLayout(next.layout);
    setActive("welcome");
    setGeneration((generation) => generation + 1);
    requestAnimationFrame(() =>
      root.current
        ?.querySelector<HTMLElement>('[role="tab"][data-tab="welcome"]')
        ?.focus(),
    );
  };

  const settle = (result: boolean) => {
    discard?.resolve(result);
    setDiscard(undefined);
  };

  const page = (tab: DemoTab) => {
    switch (tab.kind) {
      case "welcome":
        return <WelcomePage />;
      case "layout":
        return <LayoutPage layout={layout} onReset={reset} />;
      case "draft":
        return <DraftPage title={tab.label} />;
      case "keyboard":
        return <KeyboardPage />;
      case "settings":
        return (
          <SettingsPage
            density={density}
            onDensityChange={setDensity}
            icons={icons}
            onIconsChange={setIcons}
          />
        );
    }
  };

  return (
    <div ref={root} className="demo" data-fullscreen={fullscreen || undefined}>
      <Workspace
        key={generation}
        density={density}
        tabs={icons ? tabs : tabs.map((tab) => ({ ...tab, icon: undefined }))}
        active={active}
        onSelect={setActive}
        onClose={(key, next) => {
          setTabs((tabs) => tabs.filter((tab) => tab.key !== key));
          setActive((current) => (current === key ? next : current));
        }}
        onDuplicate={(key) => {
          const tab = tabs.find((tab) => tab.key === key)!;
          return add(tab.kind, key);
        }}
        layout={layout}
        onLayoutChange={setLayout}
        titleBar={!!host}
        {...desktopSlots(host, (align) => (
          <AppMenu
            name="Labpane"
            logo={<Logo />}
            dark={dark}
            onThemeChange={setDark}
            size={density}
            onSizeChange={setDensity}
            onSizeReset={() => setDensity(100)}
            fullscreen={fullscreen}
            onFullscreenChange={setFullscreen}
            align={align}
          />
        ))}
        toolbar={(pane) => (
          <OptionMenu
            options={order.map((kind) => ({
              id: kind,
              label: kinds[kind].label,
              icon: kinds[kind].icon,
            }))}
            onSelect={(kind) => {
              opened.current = add(kind as Kind);
            }}
            onCloseAutoFocus={(event) => {
              if (!opened.current) return;
              event.preventDefault();
              pane.focus(opened.current);
              opened.current = undefined;
            }}
            trigger={
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open a tab"
                title="Open a tab"
              >
                <PlusIcon />
              </Button>
            }
          />
        )}
        menu={(target, actions, restoreFocus) => (
          <ActionMenu
            actions={actions}
            onCloseAutoFocus={
              restoreFocus &&
              ((event) => {
                event.preventDefault();
                restoreFocus();
              })
            }
          >
            {target}
          </ActionMenu>
        )}
        confirmClose={(tab) =>
          new Promise<boolean>((resolve) =>
            setDiscard({ label: tab.label, resolve }),
          )
        }
        empty={() => (
          <div className="demo-empty">
            <p>All tabs are closed.</p>
            <Button variant="secondary" onClick={reset}>
              Restore the demo
            </Button>
          </div>
        )}
      >
        {page}
      </Workspace>
      <DiscardDialog
        label={discard?.label}
        onCancel={() => settle(false)}
        onConfirm={() => settle(true)}
        onCloseAutoFocus={(event) => event.preventDefault()}
      />
    </div>
  );
}
