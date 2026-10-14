import {
  useWorkspaceIds,
  useTabLinks,
  useTabSize,
  fitTabWidth,
  type WorkspaceAction,
  type WorkspaceMenu,
} from "./context.js";
import * as React from "react";
import { createPortal } from "react-dom";
import { XIcon, ChevronLeftIcon, ChevronRightIcon } from "./icons.js";
import type { Docking } from "./surface.js";
import { TabSurface, paneShape, tabShape } from "./frame.js";
import type { WorkspaceTab } from "./workspace.js";
import { useDragContent } from "./drag-content.js";
import { hasOpenOverlay } from "./overlay.js";

const motion = { duration: 160, easing: "cubic-bezier(.2,.8,.2,1)" };

export type TabDrag = {
  key: string;
  x: number;
  y: number;
  detached: boolean;
};

export type WorkspaceTabsProps = {
  items: readonly WorkspaceTab[];
  active: string;
  onClose: (key: string) => void;
  onDuplicate?: (key: string) => string;
  onReorder: (keys: string[]) => void;
  onSelect: (key: string) => void;
  dragBoundary: HTMLElement | null;
  surface: (key?: string) => HTMLElement | null;
  docking: Docking;
  menu?: WorkspaceMenu;
};

export function WorkspaceTabs({
  items,
  active,
  onClose,
  onDuplicate,
  onReorder,
  onSelect,
  dragBoundary,
  surface,
  docking,
  menu,
}: WorkspaceTabsProps) {
  const ids = useWorkspaceIds();
  const tabLinks = useTabLinks();
  const content = useDragContent();
  const density = useTabSize();
  const [metrics, setMetrics] = React.useState({
    available: Infinity,
    overflow: false,
    left: false,
    right: false,
  });
  const measured = React.useRef(metrics);
  const { available } = metrics;
  const size = {
      ...density,
      width: fitTabWidth(
        density.width,
        available,
        items.length + (docking.insertion === undefined ? 0 : 1),
      ),
    },
    { width: tabWidth, height, contentHeight } = size,
    width = tabWidth + 16;
  const links = items.map(({ key, label }) => [key, label] as const);
  const tabOrder = JSON.stringify(items.map(({ key }) => key));
  const labels = new Map(links);
  const navRef = React.useRef<HTMLDivElement>(null);
  const stripRef = React.useRef<HTMLDivElement>(null);
  const helpId = React.useId();
  const menuFocus = React.useRef<string | undefined>(undefined);
  const drag = React.useRef<
    | (TabDrag & {
        offset: number;
        offsetY: number;
        sheet: DOMRect;
        moved: boolean;
        order: string[];
      })
    | undefined
  >(undefined);
  const [dragging, setDragging] = React.useState<string>();
  const [pointerFocus, setPointerFocus] = React.useState(false);
  const [announcement, announce] = React.useState("");
  const ghostRef = React.useRef<HTMLDivElement | null>(null);
  const ghost = React.useCallback((element: HTMLDivElement | null) => {
    ghostRef.current = element;
    if (element) element.inert = true;
  }, []);
  const frameRef = React.useRef<SVGSVGElement>(null);
  const maskedSheet = React.useRef<HTMLElement | null>(null);
  const maskedOutline = React.useRef<SVGPathElement | null>(null);
  const restoreFrame = () => {
    maskedSheet.current?.style.removeProperty("border-color");
    maskedOutline.current?.style.removeProperty("visibility");
    maskedSheet.current = null;
    maskedOutline.current = null;
  };
  const settling = React.useRef<Animation | undefined>(undefined);
  const positions = React.useRef({
    order: "",
    tabs: new Map<string, number>(),
  });
  const frame = React.useRef(0);
  const suppressClick = React.useRef(false);
  const tabElement = (key: string) =>
    navRef.current?.querySelector<HTMLElement>(
      `a[data-tab="${CSS.escape(key)}"]`,
    )?.parentElement;
  const reveal = (key = active) => {
    const nav = navRef.current,
      tab = tabElement(key);
    if (!nav || !tab || drag.current?.moved || docking.insertion !== undefined)
      return;
    nav.scrollLeft = Math.max(
      tab.offsetLeft + tab.offsetWidth + 8 - nav.clientWidth,
      Math.min(nav.scrollLeft, tab.offsetLeft - 8),
    );
  };
  const draw = () => {
    const current = drag.current,
      ghost = ghostRef.current,
      nav = navRef.current,
      bounds = dragBoundary?.getBoundingClientRect(),
      floating = !!ghost && !!current?.detached,
      tab = (floating ? null : ghost) ?? tabElement(active),
      frame = frameRef.current;
    if (ghost && current?.moved && bounds) {
      const sheet = surface(current.key);
      const preview =
        floating && sheet
          ? content.lift(sheet, ghost, current.sheet)
          : undefined;
      const left = floating ? 8 : bounds.left + 8,
        right = floating ? innerWidth - 8 : bounds.right - 8;
      const x = Math.max(
        left,
        Math.min(current.x - current.offset, right - ghost.offsetWidth),
      );
      const y = floating
        ? Math.max(
            0,
            Math.min(current.y - current.offsetY, innerHeight - height - 8),
          )
        : nav!.getBoundingClientRect().top;
      ghost.style.left = `${x}px`;
      ghost.style.top = `${y}px`;
      if (preview) {
        content.move(x - preview.offset, y + height - 1);
        const left = preview.offset - 8,
          right = preview.width - preview.offset - tabWidth - 8;
        ghost
          .querySelector("svg > path")!
          .setAttribute("d", tabShape(left, right, size)[0]);
        const outline =
          ghost.querySelector<SVGPathElement>("[data-tab-outline]")!;
        outline.style.visibility = "visible";
        outline.setAttribute(
          "d",
          paneShape(left, right, height + preview.height - 1.5, true, size),
        );
      } else content.release();
    }
    restoreFrame();
    if (!tab || !bounds || !frame) {
      if (frame) frame.style.visibility = "hidden";
      return;
    }
    const box = tab.getBoundingClientRect();
    const sheet = surface(),
      sheetBox = sheet?.getBoundingClientRect();
    const attached = Math.abs(box.top - bounds.top) < 0.5 && !!sheet;
    const left = attached ? box.left - 8 - sheetBox!.left : 16,
      right = attached ? sheetBox!.right - box.right - 8 : 16;
    if (ghost && !floating) {
      const [fill, outline] = tabShape(
        Math.max(0, left),
        Math.max(0, right),
        size,
      );
      ghost.querySelector("svg > path")!.setAttribute("d", fill);
      ghost.querySelector("[data-tab-outline]")!.setAttribute("d", outline);
    }
    const stroke = tab.querySelector<SVGPathElement>("[data-tab-outline]")!;
    stroke.style.visibility = attached ? "hidden" : "visible";
    maskedOutline.current = stroke;
    frame.style.visibility = attached ? "visible" : "hidden";
    if (!attached) return;
    sheet!.style.borderColor = "transparent";
    maskedSheet.current = sheet;
    const x = box.left - 8,
      bottom = sheetBox!.bottom - box.top - 0.5;
    const origin = frame.parentElement!.getBoundingClientRect();
    frame.style.left = `${x - origin.left}px`;
    frame.style.top = `${box.top - origin.top}px`;
    const viewport =
        ghost && !floating ? sheetBox! : nav!.getBoundingClientRect(),
      clipLeft = Math.max(-left, viewport.left - x),
      clipRight = Math.min(width + right, viewport.right - x);
    frame.style.clipPath = `polygon(${clipLeft}px 0px, ${clipRight}px 0px, ${clipRight}px ${height - 1}px, ${width + right}px ${height - 1}px, ${width + right}px ${bottom + 1}px, ${-left}px ${bottom + 1}px, ${-left}px ${height - 1}px, ${clipLeft}px ${height - 1}px)`;
    frame
      .querySelector("path")!
      .setAttribute(
        "d",
        paneShape(left, right, bottom, !!ghost && !floating, size) +
          ((!ghost || floating) && clipLeft > 0
            ? ` M0 ${height - 0.5} H${Math.min(width, clipLeft)}`
            : "") +
          ((!ghost || floating) && clipRight < width
            ? ` M${Math.max(0, clipRight)} ${height - 0.5} H${width}`
            : ""),
      );
  };
  const animate = (element: HTMLElement, from: number) => {
    const transform = getComputedStyle(element).transform;
    if (transform !== "none") from += new DOMMatrixReadOnly(transform).m41;
    element.getAnimations().forEach((animation) => animation.cancel());
    if (!matchMedia("(prefers-reduced-motion: reduce)").matches)
      element.animate(
        [{ transform: `translateX(${from}px)` }, { transform: "none" }],
        motion,
      );
  };
  const settle = (key: string) =>
    requestAnimationFrame(() => {
      if (drag.current) return;
      reveal(key);
      const ghost = ghostRef.current,
        slot = tabElement(key);
      if (
        !ghost ||
        !slot ||
        matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        setDragging(undefined);
        return;
      }
      const from = ghost.getBoundingClientRect(),
        to = slot.getBoundingClientRect();
      settling.current = ghost.animate(
        [
          { transform: "none" },
          {
            transform: `translate(${to.left - from.left}px,${to.top - from.top}px)`,
          },
        ],
        { ...motion, fill: "forwards" },
      );
      settling.current.onfinish = () => setDragging(undefined);
      latest.current.refresh();
    });
  const finish = (cancel = false) => {
    const current = drag.current;
    if (!current) return;
    drag.current = undefined;
    suppressClick.current = current.moved;
    content.release();
    if (cancel) {
      docking.cancel();
      if (current.moved) onReorder(current.order);
      announce("");
    }
    if (current.moved && (cancel || !docking.drop())) settle(current.key);
    else setDragging(undefined);
  };
  const move = (from: string, to: string) => {
    const order = links.map(([key]) => key),
      index = order.indexOf(to);
    if (from === to || index < 0) return;
    order.splice(order.indexOf(from), 1);
    order.splice(index, 0, from);
    onReorder(order);
    announce(`${labels.get(from)}: position ${index + 1} of ${order.length}`);
  };
  const split = (key: string, edge: "left" | "right" | "bottom") => {
    announce(
      docking.split(key, edge)
        ? `${labels.get(key)} split ${edge}`
        : "Open another tab or make this pane larger to split it",
    );
    tabLinks.focus(key);
  };
  const keyDown = (event: React.KeyboardEvent, key: string, index: number) => {
    if (hasOpenOverlay()) return;
    if (event.key === "Escape") return finish(true);
    const edges: Record<string, "left" | "right" | "bottom"> = {
      ArrowLeft: "left",
      ArrowRight: "right",
      ArrowDown: "bottom",
    };
    const edge = edges[event.key];
    if (event.altKey && edge) {
      if (event.shiftKey) split(key, edge);
      else if (edge !== "bottom")
        move(key, items[index + (edge === "left" ? -1 : 1)]?.key ?? key);
      else return;
    } else {
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      const targets: Record<string, number> = {
        Home: 0,
        End: items.length - 1,
        ArrowLeft: (index + items.length - 1) % items.length,
        ArrowRight: (index + 1) % items.length,
      };
      const target = targets[event.key];
      if (target !== undefined) tabLinks.get(items[target]!.key)?.focus();
      else if (event.key === "Delete") onClose(key);
      else if (event.key === " ") onSelect(key);
      else return;
    }
    event.preventDefault();
  };
  const measure = () => {
    const nav = navRef.current,
      strip = stripRef.current;
    if (!nav || !strip || !dragBoundary) return;
    const trailing =
      strip.parentElement!.nextElementSibling?.getBoundingClientRect().width ??
      0;
    const availableWidth = Math.max(
      0,
      dragBoundary.getBoundingClientRect().right -
        strip.getBoundingClientRect().left -
        trailing -
        4,
    );
    const inserting = docking.insertion === undefined ? 0 : 1;
    const count = items.length - (drag.current?.detached ? 1 : 0) + inserting;
    const next = {
      available: availableWidth,
      overflow:
        count *
          fitTabWidth(density.width, availableWidth, items.length + inserting) +
          16 >
        availableWidth + 1,
      left: nav.scrollLeft > 1,
      right: nav.scrollLeft + nav.clientWidth < nav.scrollWidth - 1,
    };
    const current = measured.current;
    if (
      next.available !== current.available ||
      next.overflow !== current.overflow ||
      next.left !== current.left ||
      next.right !== current.right
    ) {
      measured.current = next;
      setMetrics(next);
    }
  };
  const follow = () => {
    const nav = navRef.current;
    if (
      [surface(), nav, ghostRef.current].some((element) =>
        element
          ?.getAnimations({ subtree: element === nav })
          .some((animation) => animation.playState === "running"),
      )
    )
      frame.current = requestAnimationFrame(() => latest.current.refresh());
  };
  const refresh = (resized = false) => {
    cancelAnimationFrame(frame.current);
    measure();
    if (resized) reveal();
    draw();
    follow();
  };
  const latest = React.useRef({ refresh, finish });
  const detached = !!dragging && !!drag.current?.detached;
  React.useLayoutEffect(() => {
    latest.current = { refresh, finish };
    const order = JSON.stringify([tabOrder, docking.insertion]);
    const previous = positions.current;
    positions.current = { order, tabs: new Map() };
    for (const element of navRef.current!
      .children as HTMLCollectionOf<HTMLElement>) {
      const key = element.querySelector("a")?.dataset.tab;
      if (!key) continue;
      const left = element.offsetLeft,
        from = previous.tabs.get(key);
      if (
        previous.order !== order &&
        key !== dragging &&
        from !== undefined &&
        from !== left
      )
        animate(element, from - left);
      positions.current.tabs.set(key, left);
    }
    cancelAnimationFrame(frame.current);
    draw();
    follow();
  });
  React.useLayoutEffect(
    () => refresh(),
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- the inputs refresh measures
    [
      dragBoundary,
      active,
      tabOrder,
      docking.insertion,
      tabWidth,
      height,
      metrics.overflow,
      dragging,
      detached,
    ],
  );
  // oxlint-disable-next-line react-hooks/exhaustive-deps -- only when the active tab or order changes
  React.useLayoutEffect(() => reveal(), [active, tabOrder, docking.insertion]);
  React.useLayoutEffect(() => {
    const nav = navRef.current!;
    const resize = () => latest.current.refresh(true),
      scroll = () => latest.current.refresh(),
      blur = () => latest.current.finish(true);
    const wheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        Math.abs(event.deltaX) >= Math.abs(event.deltaY) ||
        nav.scrollWidth <= nav.clientWidth
      )
        return;
      event.preventDefault();
      nav.scrollLeft +=
        event.deltaY *
        (event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? nav.clientWidth
            : 1);
    };
    const observer = new ResizeObserver(resize);
    for (const element of [
      nav,
      stripRef.current,
      dragBoundary,
      ...(dragBoundary?.children ?? []),
      surface(),
    ])
      if (element) observer.observe(element);
    addEventListener("scroll", scroll, true);
    addEventListener("blur", blur);
    nav.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      removeEventListener("scroll", scroll, true);
      removeEventListener("blur", blur);
      nav.removeEventListener("wheel", wheel);
      cancelAnimationFrame(frame.current);
      restoreFrame();
    };
    // oxlint-disable-next-line react-hooks/exhaustive-deps -- reruns when the active tab changes
  }, [active, dragBoundary]);
  const scrollButton = (direction: -1 | 1) =>
    metrics.overflow && (
      <button
        type="button"
        className="lab-scroll"
        style={{ width: Math.min(28, height), height: Math.min(28, height) }}
        aria-label={direction < 0 ? "Scroll tabs left" : "Scroll tabs right"}
        title={direction < 0 ? "Scroll tabs left" : "Scroll tabs right"}
        disabled={direction < 0 ? !metrics.left : !metrics.right}
        onClick={() => {
          const nav = navRef.current!;
          nav.scrollBy({
            left: direction * Math.max(tabWidth, nav.clientWidth - tabWidth),
            behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
              ? "instant"
              : "smooth",
          });
        }}
      >
        {direction < 0 ? (
          <ChevronLeftIcon className="lab-icon" />
        ) : (
          <ChevronRightIcon className="lab-icon" />
        )}
      </button>
    );
  return (
    <div ref={stripRef} className="lab-tabs">
      {scrollButton(-1)}
      <div
        ref={navRef}
        role={links.length ? "tablist" : undefined}
        aria-label={
          links.length ? `Workspace tabs: ${labels.get(active)}` : undefined
        }
        aria-describedby={links.length ? helpId : undefined}
        onKeyDownCapture={() => setPointerFocus(false)}
        onBlurCapture={() => setPointerFocus(false)}
        onPointerDownCapture={() => {
          content.release(false);
          settling.current?.cancel();
          setDragging(undefined);
          drag.current = undefined;
          suppressClick.current = false;
        }}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (suppressClick.current) {
            event.preventDefault();
            event.stopPropagation();
            suppressClick.current = false;
          }
        }}
        onPointerMove={(event) => {
          const current = drag.current,
            nav = navRef.current,
            x = event.clientX;
          if (!(event.buttons & 1) || !current || !nav) return;
          if (
            !current.moved &&
            Math.hypot(x - current.x, event.clientY - current.y) < 6
          )
            return;
          if (!current.moved && active !== current.key) onSelect(current.key);
          current.moved = true;
          if (!nav.hasPointerCapture(event.pointerId))
            nav.setPointerCapture(event.pointerId);
          setDragging(current.key);
          event.preventDefault();
          current.x = x;
          current.y = event.clientY;
          current.detached = docking.move(current);
          if (!current.detached) {
            const { left, right } = nav.getBoundingClientRect();
            nav.scrollLeft += x < left + 24 ? -16 : x > right - 24 ? 16 : 0;
            const index = Math.max(
              0,
              Math.min(
                items.length - 1,
                Math.floor(
                  (Math.max(left + 8, Math.min(x, right - 8)) -
                    left +
                    nav.scrollLeft -
                    8) /
                    tabWidth,
                ),
              ),
            );
            move(current.key, items[index]!.key);
          }
          refresh();
        }}
        onPointerUp={() => finish()}
        onPointerCancel={() => finish(true)}
        className="lab-tablist"
      >
        {links.map(([key, text], index) => {
          const actions: WorkspaceAction[] = [
            ...(onDuplicate
              ? [
                  {
                    label: "Duplicate tab",
                    onSelect: () => {
                      menuFocus.current = onDuplicate(key);
                    },
                  },
                ]
              : []),
            {
              label: "Move left",
              onSelect: () => move(key, items[index - 1]!.key),
              disabled: !index,
            },
            {
              label: "Move right",
              onSelect: () => move(key, items[index + 1]!.key),
              disabled: index === items.length - 1,
            },
            {
              label: "Move to next pane",
              onSelect: () => docking.next(key),
              disabled: docking.paneCount < 2,
            },
            null,
            ...(["left", "right", "bottom"] as const).map((edge) => ({
              label: `Split ${edge === "bottom" ? "below" : edge}`,
              onSelect: () => split(key, edge),
              disabled: items.length < 2,
            })),
            null,
            { label: "Close tab", onSelect: () => onClose(key) },
          ];
          const target = (
            <div
              role="presentation"
              className="lab-tab"
              data-dragging={dragging === key || undefined}
              style={{
                paddingTop: height - contentHeight,
                marginRight:
                  dragging === key && drag.current?.detached ? -tabWidth : 0,
                marginLeft: docking.insertion === index ? tabWidth : 0,
                zIndex:
                  active === key ? links.length + 1 : links.length - index,
              }}
            >
              <TabSurface
                width={tabWidth}
                selected={active === key}
                keyboardFocus={!pointerFocus}
              />
              <a
                ref={tabLinks.register(key)}
                id={ids.tab(key)}
                role="tab"
                tabIndex={active === key ? 0 : -1}
                aria-selected={active === key}
                aria-controls={ids.panel(key)}
                href={items[index]!.href}
                data-tab={key}
                style={{ width: tabWidth, height: contentHeight }}
                onClick={(event) => {
                  const { metaKey, ctrlKey, shiftKey, altKey } = event;
                  if (metaKey || ctrlKey || shiftKey || altKey) return;
                  event.preventDefault();
                  onSelect(key);
                }}
                onFocus={() => onSelect(key)}
                draggable={false}
                title={text}
                aria-keyshortcuts="ArrowLeft ArrowRight Home End Delete Alt+ArrowLeft Alt+ArrowRight Alt+Shift+ArrowLeft Alt+Shift+ArrowRight Alt+Shift+ArrowDown"
                onKeyDown={(event) => keyDown(event, key, index)}
                onPointerDown={(event) => {
                  if (event.button !== 0 || !event.isPrimary) return;
                  if (event.pointerType === "mouse") event.preventDefault();
                  event.currentTarget.setPointerCapture(event.pointerId);
                  event.currentTarget.focus({ preventScroll: true });
                  setPointerFocus(true);
                  const box =
                    event.currentTarget.parentElement!.getBoundingClientRect();
                  drag.current = {
                    key,
                    offset: event.clientX - box.left,
                    offsetY: event.clientY - box.top,
                    sheet: surface()!.getBoundingClientRect(),
                    x: event.clientX,
                    y: event.clientY,
                    detached: false,
                    moved: false,
                    order: links.map(([path]) => path),
                  };
                }}
                className="lab-tab-link"
              >
                {items[index]!.icon && (
                  <span aria-hidden="true" className="lab-tab-icon">
                    {items[index]!.icon}
                  </span>
                )}
                <span className="lab-tab-label">{text}</span>
              </a>
              <CloseTab label={text} onClick={() => onClose(key)} />
            </div>
          );
          return (
            <React.Fragment key={key}>
              {menu
                ? menu(
                    target,
                    actions,
                    () => {
                      tabLinks.focus(menuFocus.current ?? key);
                      menuFocus.current = undefined;
                    },
                    key,
                  )
                : target}
            </React.Fragment>
          );
        })}
        {docking.insertion === items.length && (
          <div
            aria-hidden="true"
            style={{ width: tabWidth }}
            className="lab-tab-placeholder"
          />
        )}
      </div>
      {scrollButton(1)}
      <span className="lab-sr-only" aria-live="polite">
        {announcement}
      </span>
      <span id={helpId} className="lab-sr-only">
        Arrow keys switch tabs. Home and End select the first and last tab.
        Delete closes a tab. Alt plus Left or Right reorders. Alt plus Shift and
        Left, Right, or Down splits a pane. F6 moves between panes; Shift plus
        F6 moves back.
        {menu &&
          " Right-click or press Shift plus F10 for tab actions without dragging."}
      </span>
      {active && (
        <svg
          ref={frameRef}
          aria-hidden="true"
          data-pane-frame
          viewBox={`0 0 ${width} ${height}`}
          strokeWidth={size.borderWidth}
          style={{ width, height }}
          className="lab-pane-frame"
        >
          <path className="lab-outline" />
        </svg>
      )}
      {dragging &&
        createPortal(
          <div
            ref={ghost}
            data-dragged-tab
            aria-hidden="true"
            style={{
              width: tabWidth,
              height,
              paddingTop: height - contentHeight,
            }}
            className="lab-ghost"
          >
            <TabSurface selected width={tabWidth} />
            <span
              style={{ height: contentHeight }}
              className="lab-ghost-content"
            >
              {items.find((item) => item.key === dragging)?.icon && (
                <span className="lab-tab-icon">
                  {items.find((item) => item.key === dragging)!.icon}
                </span>
              )}
              <span className="lab-tab-label">{labels.get(dragging)}</span>
            </span>
            <CloseTab label={labels.get(dragging)!} />
          </div>,
          document.body,
        )}
    </div>
  );
}

function CloseTab({ label, onClick }: { label: string; onClick?: () => void }) {
  const { height, contentHeight } = useTabSize();
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-label={`Close ${label}`}
      title={`Close ${label}`}
      style={{ top: height - contentHeight / 2 }}
      className="lab-tab-close"
      onClick={onClick}
    >
      <XIcon className="lab-tab-close-icon" />
    </button>
  );
}
