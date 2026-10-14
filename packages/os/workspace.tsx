import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import { WorkspaceSurface, position } from "./surface.js";
import { WorkspaceToolbar } from "./toolbar.js";
import {
  panes,
  reconcileLayout,
  updateLayout,
  type Box,
  type Layout,
  type Pane,
} from "./layout.js";
import {
  WorkspaceId,
  WorkspaceDensity,
  useWorkspaceIds,
  useTabSize,
  type Density,
  type WorkspaceMenu,
} from "./context.js";
import { UnsavedChanges } from "./unsaved-changes.js";

export type WorkspaceTab = {
  key: string;
  label: string;
  icon?: ReactNode;
  actions?: ReactNode;
  href?: string;
  scrollKey?: string;
  opener?: string;
  fill?: boolean;
};
export type WorkspaceProps<T extends WorkspaceTab> = {
  density?: Density;
  tabs: readonly T[];
  active?: string;
  onSelect: (key: string) => void;
  onClose: (key: string, next?: string) => void;
  onDuplicate?: (key: string) => string;
  leading?: ReactNode;
  trailing?: ReactNode;
  // titleBar marks the top row of toolbars as a desktop window's title bar, which runs from the
  // top of the window, so their controls centre in it like the window buttons do
  titleBar?: boolean;
  toolbar?: (pane: WorkspacePane) => ReactNode;
  menu?: WorkspaceMenu;
  confirmClose?: (tab: T) => boolean | Promise<boolean>;
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  className?: string;
  children: (tab: T, pane: WorkspacePane) => ReactNode;
  empty: (pane: WorkspacePane) => ReactNode;
};
export type WorkspacePane = {
  id: string;
  tabs: string[];
  active?: string;
  focus: (key: string) => void;
};

export function Workspace<T extends WorkspaceTab>(props: WorkspaceProps<T>) {
  const id = useId();
  return (
    <WorkspaceId.Provider value={id}>
      <WorkspaceDensity.Provider value={props.density ?? 100}>
        <WorkspaceContent {...props} />
      </WorkspaceDensity.Provider>
    </WorkspaceId.Provider>
  );
}

function WorkspaceContent<T extends WorkspaceTab>({
  density = 100,
  tabs,
  active,
  onSelect,
  onClose,
  onDuplicate,
  leading,
  trailing,
  titleBar,
  toolbar,
  menu,
  confirmClose,
  layout,
  onLayoutChange: change,
  className,
  children,
  empty,
}: WorkspaceProps<T>) {
  const ids = useWorkspaceIds();
  const { height, contentHeight, logoSize } = useTabSize();
  const corner = useRef<HTMLDivElement>(null);
  const [reserve, setReserve] = useState(0);
  const hasTrailing = !!trailing;
  useLayoutEffect(() => {
    const element = corner.current;
    if (!element) return setReserve(0);
    const observer = new ResizeObserver(() => setReserve(element.offsetWidth));
    observer.observe(element);
    return () => observer.disconnect();
  }, [hasTrailing]);
  const root = useRef<HTMLDivElement>(null);
  // inset is how far the workspace sits below the top of the window, which is part of the title bar
  const [inset, setInset] = useState(0);
  useLayoutEffect(() => {
    if (!titleBar) return setInset(0);
    const measure = () => setInset(root.current!.getBoundingClientRect().top);
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [titleBar]);
  const preferredPane = useRef<string | undefined>(undefined);
  const visibleLayout = reconcileLayout(
    layout,
    tabs.map((t) => t.key),
    active,
    preferredPane.current,
  );
  useLayoutEffect(() => {
    if (visibleLayout !== layout) change(visibleLayout);
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- onLayoutChange may be inline
  }, [visibleLayout, layout]);
  const dirty = useRef(new Map<symbol, string>());
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current.size) event.preventDefault();
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, []);
  function close(key: string) {
    const pane = panes(visibleLayout).find((p) => p.tabs.includes(key));
    if (!pane) return;
    const remaining = pane.tabs.filter((k) => k !== key);
    const opener = tabs.find((tab) => tab.key === key)?.opener;
    const neighbor =
      remaining.find((key) => key === opener) ??
      remaining[Math.min(pane.tabs.indexOf(key), remaining.length - 1)] ??
      tabs.find((t) => t.key !== key)?.key;
    onClose(key, neighbor);
    requestAnimationFrame(() =>
      (
        document.getElementById(
          ids.tab(key === pane.active ? (neighbor ?? "") : (pane.active ?? "")),
        ) ??
        root.current?.querySelector<HTMLElement>(
          ".lab-toolbar-end button, [data-pane-sheet]",
        )
      )?.focus({ preventScroll: true }),
    );
  }
  const focus = (key: string) =>
    requestAnimationFrame(() => document.getElementById(ids.tab(key))?.focus());
  const paneOf = (pane: Pane): WorkspacePane => ({
    id: pane.id,
    tabs: pane.tabs,
    active: pane.active,
    focus,
  });
  return (
    <>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- F6 moves between panes */}
      <div
        ref={root}
        role="region"
        aria-label="Workspace"
        data-density={density}
        data-title-bar={titleBar || undefined}
        style={
          {
            "--lab-tab-height": `${height}px`,
            "--lab-tab-content-height": `${contentHeight}px`,
            "--lab-logo-size": `${logoSize}px`,
            "--lab-title-inset": `${inset}px`,
          } as CSSProperties
        }
        className={className ? `lab-workspace ${className}` : "lab-workspace"}
        onKeyDown={(event) => {
          if (event.key !== "F6") return;
          event.preventDefault();
          const selected = Array.from(
            event.currentTarget.querySelectorAll<HTMLElement>(
              '[role="tab"][aria-selected="true"]',
            ),
          );
          const owner = document.activeElement?.closest(
            '[data-pane-header], [role="tabpanel"]',
          );
          const index = selected.findIndex(
            (tab) =>
              owner?.contains(tab) ||
              tab.getAttribute("aria-controls") === owner?.id,
          );
          selected[
            (index + (event.shiftKey ? selected.length - 1 : 1)) %
              selected.length
          ]?.focus();
        }}
      >
        {trailing && (
          <div ref={corner} className="lab-trailing" style={{ height }}>
            {trailing}
          </div>
        )}
        <WorkspaceSurface
          layout={visibleLayout}
          change={change}
          menu={menu}
          header={(pane, first, last, docking, surface) => (
            <WorkspaceToolbar
              leading={first ? leading : undefined}
              reserve={last ? reserve : undefined}
              end={toolbar?.(paneOf(pane))}
              menu={menu}
              onActivate={() => {
                preferredPane.current = pane.id;
              }}
              docking={docking}
              surface={surface}
              items={pane.tabs.map((key) => tabs.find((t) => t.key === key)!)}
              active={pane.active}
              onSelect={onSelect}
              onDuplicate={
                onDuplicate
                  ? (key) => {
                      const copy = onDuplicate(key),
                        index = pane.tabs.indexOf(key) + 1;
                      change(
                        updateLayout(visibleLayout, pane.id, () => ({
                          ...pane,
                          tabs: [
                            ...pane.tabs.slice(0, index),
                            copy,
                            ...pane.tabs.slice(index),
                          ],
                          active: copy,
                        })),
                      );
                      return copy;
                    }
                  : undefined
              }
              onClose={(key) => {
                if (![...dirty.current.values()].includes(key))
                  return close(key);
                const tab = tabs.find((tab) => tab.key === key)!;
                const element = document.getElementById(ids.tab(key));
                Promise.resolve(
                  confirmClose
                    ? confirmClose(tab)
                    : confirm(`Discard changes in ${tab.label}?`),
                ).then((discard) => {
                  if (discard) close(key);
                  else requestAnimationFrame(() => element?.focus());
                });
              }}
              onReorder={(keys) =>
                change(
                  updateLayout(visibleLayout, pane.id, (node) => ({
                    ...(node as Pane),
                    tabs: keys,
                  })),
                )
              }
            />
          )}
          content={(regions, transition, lifted) => (
            <>
              {tabs.map((tab) => {
                const region = regions.find((r) =>
                  r.pane.tabs.includes(tab.key),
                )!;
                return (
                  <TabPanel
                    key={tab.key}
                    tab={tab}
                    hidden={
                      tab.key !== region.pane.active && tab.key !== lifted
                    }
                    pane={region.pane.id}
                    box={region.box}
                    transition={transition}
                    focus={() => {
                      preferredPane.current = region.pane.id;
                      if (active !== tab.key) onSelect(tab.key);
                    }}
                  >
                    <UnsavedChanges.Provider
                      value={(source, changed) =>
                        changed
                          ? dirty.current.set(source, tab.key)
                          : dirty.current.delete(source)
                      }
                    >
                      {children(tab, paneOf(region.pane))}
                    </UnsavedChanges.Provider>
                  </TabPanel>
                );
              })}
              {!tabs.length && (
                <TabPanel
                  hidden={false}
                  pane={regions[0]!.pane.id}
                  box={regions[0]!.box}
                  transition={transition}
                >
                  {empty(paneOf(regions[0]!.pane))}
                </TabPanel>
              )}
            </>
          )}
        />
      </div>
    </>
  );
}

function TabPanel({
  tab,
  hidden,
  pane,
  box,
  transition,
  focus,
  children,
}: {
  tab?: WorkspaceTab;
  hidden: boolean;
  pane: string;
  box: Box;
  transition: boolean;
  focus?: () => void;
  children: ReactNode;
}) {
  const ids = useWorkspaceIds();
  const { height, borderWidth } = useTabSize();
  const viewport = useRef<HTMLElement>(null);
  useLayoutEffect(() => {
    viewport.current?.scrollTo(0, 0);
  }, [tab?.scrollKey]);
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- focusable panel
    <section
      ref={viewport}
      id={tab ? ids.panel(tab.key) : undefined}
      role={tab ? "tabpanel" : undefined}
      aria-labelledby={tab ? ids.tab(tab.key) : undefined}
      tabIndex={0}
      data-pane-sheet={pane}
      hidden={hidden}
      className="lab-panel"
      style={{
        borderWidth,
        ...(tab?.fill ? { padding: 0, overflow: "hidden" } : {}),
        ...position({
          ...box,
          y: box.y + height - 1,
          height: box.height - height + 1,
        }),
        transitionDuration: transition
          ? "var(--workspace-duration, 180ms)"
          : "0ms",
      }}
      onPointerDownCapture={(event) => {
        event.currentTarget.dataset.pointer = "";
        focus?.();
      }}
      onFocusCapture={focus}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null))
          delete event.currentTarget.dataset.pointer;
      }}
    >
      {children}
    </section>
  );
}
