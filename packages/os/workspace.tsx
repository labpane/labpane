import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
  type RefObject,
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
  TabLinks,
  useTabLinks,
  MinimumTabHeight,
  densitySize,
  useWorkspaceIds,
  useTabSize,
  type Density,
  type WorkspaceMenu,
} from "./context.js";
import { UnsavedChanges } from "./unsaved-changes.js";
import { TabStateContext } from "./tab-state.js";
import { LeaveTab, useOpeners } from "./leave-tab.js";
import {
  TabHistoryContext,
  useTabHistories,
  type TabHistoryStore,
} from "./tab-history.js";
import { useBrowserHistory } from "./browser-history.js";
import { hasOpenOverlay } from "./overlay.js";
import type { WindowControlsOverlay } from "./pwa.js";

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
  /** Use an installed PWA's title-bar area, keeping the browser's native controls. */
  windowControlsOverlay?: WindowControlsOverlay;
  toolbar?: (pane: WorkspacePane) => ReactNode;
  menu?: WorkspaceMenu;
  confirmClose?: (tab: T) => boolean | Promise<boolean>;
  layout: Layout;
  onLayoutChange: (layout: Layout) => void;
  // history puts the front tab's own history, which starts at its href, behind the browser's Back
  // and Forward
  history?: boolean;
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
  const [links] = useState(() => new Map<string, HTMLElement>());
  return (
    <WorkspaceId.Provider value={id}>
      <TabLinks.Provider value={links}>
        <WorkspaceDensity.Provider value={props.density ?? 100}>
          <WorkspaceContent {...props} />
        </WorkspaceDensity.Provider>
      </TabLinks.Provider>
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
  windowControlsOverlay,
  toolbar,
  menu,
  confirmClose,
  layout,
  onLayoutChange: change,
  history,
  className,
  children,
  empty,
}: WorkspaceProps<T>) {
  const links = useTabLinks();
  const tabsByKey = useMemo(
    () => new Map(tabs.map((tab) => [tab.key, tab])),
    [tabs],
  );
  const {
    height: tabHeight,
    contentHeight,
    logoSize,
  } = useMemo(() => densitySize(density), [density]);
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
  const ownRoot = useRef<HTMLDivElement>(null);
  const root = windowControlsOverlay?.root ?? ownRoot;
  // inset is how far the workspace sits below the top of the window, which is part of the title bar
  const [inset, setInset] = useState(0);
  useLayoutEffect(() => {
    if (!titleBar) return setInset(0);
    const measure = () => setInset(root.current!.getBoundingClientRect().top);
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [titleBar, root]);
  const titlebarArea = windowControlsOverlay?.area;
  const height = Math.max(tabHeight, titlebarArea?.height ?? 0);
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
  const front = active ?? panes(visibleLayout)[0]?.active;
  const openers = useOpeners(tabs, front);
  const historyOf = useTabHistories(tabs);
  const frontTab = tabsByKey.get(front ?? "");
  useBrowserHistory(history && frontTab ? historyOf(frontTab) : undefined);
  const dirty = useRef(new Map<symbol, string>());
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty.current.size) event.preventDefault();
    };
    addEventListener("beforeunload", warn);
    return () => removeEventListener("beforeunload", warn);
  }, []);
  function close(key: string, next?: string) {
    const pane = panes(visibleLayout).find((p) => p.tabs.includes(key));
    if (!pane) return;
    const remaining = pane.tabs.filter((k) => k !== key);
    const opener = tabsByKey.get(key)?.opener;
    const neighbor =
      next ??
      remaining.find((key) => key === opener) ??
      remaining[Math.min(pane.tabs.indexOf(key), remaining.length - 1)] ??
      tabs.find((t) => t.key !== key)?.key;
    onClose(key, neighbor);
    requestAnimationFrame(() =>
      (
        links.get(
          key === pane.active ? (neighbor ?? "") : (pane.active ?? ""),
        ) ??
        root.current?.querySelector<HTMLElement>(
          ".lab-toolbar-end button, [data-pane-sheet]",
        )
      )?.focus({ preventScroll: true }),
    );
  }
  function requestClose(key: string, next?: string) {
    if (![...dirty.current.values()].includes(key)) return close(key, next);
    const tab = tabsByKey.get(key)!;
    const element = links.get(key);
    Promise.resolve(
      confirmClose
        ? confirmClose(tab)
        : confirm(`Discard changes in ${tab.label}?`),
    ).then((discard) => {
      if (discard) close(key, next);
      else requestAnimationFrame(() => element?.focus());
    });
  }
  function leave(key: string) {
    const opener = openers.get(key) ?? tabsByKey.get(key)?.opener;
    requestClose(key, tabsByKey.has(opener ?? "") ? opener : undefined);
  }
  // Stable services read current handlers and dirty state through refs.
  const services = useRef(leave);
  useLayoutEffect(() => {
    services.current = leave;
  });
  const paneOf = (pane: Pane): WorkspacePane => ({
    id: pane.id,
    tabs: pane.tabs,
    active: pane.active,
    focus: links.focus,
  });
  return (
    <MinimumTabHeight.Provider value={titlebarArea?.height ?? 0}>
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- F6 moves between panes */}
      <div
        ref={root}
        role="region"
        aria-label="Workspace"
        data-density={density}
        data-title-bar={titleBar || undefined}
        data-window-controls-overlay={titlebarArea ? "" : undefined}
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
          if (event.key !== "F6" || hasOpenOverlay()) return;
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
          <div
            ref={corner}
            className="lab-trailing"
            style={{ height, right: titlebarArea?.insetRight }}
          >
            {trailing}
          </div>
        )}
        <WorkspaceSurface
          titlebarArea={titlebarArea}
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
              items={pane.tabs.map((key) => tabsByKey.get(key)!)}
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
              onClose={requestClose}
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
                const hidden =
                  tab.key !== region.pane.active && tab.key !== lifted;
                return (
                  <TabPanel
                    key={tab.key}
                    tab={tab}
                    hidden={hidden}
                    pane={region.pane.id}
                    box={region.box}
                    transition={transition}
                    focus={() => {
                      preferredPane.current = region.pane.id;
                      if (active !== tab.key) onSelect(tab.key);
                    }}
                  >
                    <TabBody
                      tab={tab}
                      pane={region.pane}
                      focus={links.focus}
                      active={tab.key === front}
                      visible={!hidden}
                      history={historyOf(tab)}
                      services={services}
                      dirty={dirty.current}
                      render={children}
                    />
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
    </MinimumTabHeight.Provider>
  );
}

type TabBodyProps<T extends WorkspaceTab> = {
  tab: T;
  pane: Pane;
  focus: (key: string) => void;
  active: boolean;
  visible: boolean;
  history: TabHistoryStore;
  services: RefObject<(key: string) => void>;
  dirty: Map<symbol, string>;
  render: (tab: T, pane: WorkspacePane) => ReactNode;
};
const TabBody = memo(function TabBody<T extends WorkspaceTab>({
  tab,
  pane,
  focus,
  active,
  visible,
  history,
  services,
  dirty,
  render,
}: TabBodyProps<T>) {
  const key = tab.key;
  // The panel is keyed by tab.key; its stable callback reads the latest handler.
  const [leave] = useState(() => () => services.current!(key));
  const report = useCallback(
    (source: symbol, changed: boolean) => {
      if (changed) dirty.set(source, key);
      else dirty.delete(source);
    },
    [dirty, key],
  );
  const requested = useMemo(
    () => ({ render, tab, pane, focus }),
    [render, tab, pane, focus],
  );
  const deferred = useDeferredValue(requested);
  // Hidden pages update in the background; visible pages use current inputs.
  const inputs = visible ? requested : deferred;
  const content = useMemo(
    () => inputs.render(inputs.tab, { ...inputs.pane, focus: inputs.focus }),
    [inputs],
  );
  const state = useMemo(() => ({ active, visible }), [active, visible]);
  return (
    <TabStateContext.Provider value={state}>
      <LeaveTab.Provider value={leave}>
        <TabHistoryContext.Provider value={history}>
          <UnsavedChanges.Provider value={report}>
            {content}
          </UnsavedChanges.Provider>
        </TabHistoryContext.Provider>
      </LeaveTab.Provider>
    </TabStateContext.Provider>
  );
}) as <T extends WorkspaceTab>(props: TabBodyProps<T>) => ReactNode;

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
