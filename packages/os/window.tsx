import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export type WindowEdge = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";
// WindowHost connects the workspace to a desktop shell such as Wails, Tauri, or Electron
export type WindowHost = {
  platform: "windows" | "macos" | "linux";
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  drag?: () => void;
  resize?: (edge: WindowEdge) => void;
  fullscreen?: (on: boolean) => void;
};

const client = typeof window !== "undefined";
const maximized = () =>
  client &&
  outerWidth >= screen.availWidth &&
  outerHeight >= screen.availHeight;
const isFullscreen = (host?: WindowHost) =>
  client &&
  (host?.fullscreen
    ? innerWidth >= screen.width && innerHeight >= screen.height
    : !!document.fullscreenElement);
const setFullscreen = (host: WindowHost | undefined, on: boolean) => {
  if (host?.fullscreen) host.fullscreen(on);
  else if (on) void document.documentElement.requestFullscreen?.();
  else if (document.fullscreenElement) void document.exitFullscreen();
};
const interactive =
  "a, button, input, select, textarea, label, summary, [contenteditable], [role=button], [role=tab], [role=separator], [role=menuitem], .lab-tab";
const draggable = (target: EventTarget | null) =>
  target instanceof Element &&
  !target.closest(interactive) &&
  (!!target.closest(".lab-toolbar, [data-window-drag]") ||
    target.matches(".lab-workspace") ||
    !!target.querySelector(".lab-workspace"));

// useFullscreen tracks full screen: the window's with a host, the page's without
export function useFullscreen(host?: WindowHost) {
  const [full, setFull] = useState(() => isFullscreen(host));
  useEffect(() => {
    const update = () => setFull(isFullscreen(host));
    update();
    window.addEventListener("resize", update);
    document.addEventListener("fullscreenchange", update);
    return () => {
      window.removeEventListener("resize", update);
      document.removeEventListener("fullscreenchange", update);
    };
  }, [host]);
  return [full, (on: boolean) => setFullscreen(host, on)] as const;
}

// useWindowFrame drags, maximises, and resizes a frameless window, and handles the full screen key
export function useWindowFrame(host?: WindowHost) {
  useEffect(() => {
    if (!host) return;
    const root = document.documentElement;
    let armed = false;
    let cursor = "";
    const edgeAt = (x: number, y: number) => {
      if (!host.resize || maximized()) return "";
      const vertical = y < 6 ? "n" : y > innerHeight - 6 ? "s" : "";
      const horizontal = x < 6 ? "w" : x > innerWidth - 6 ? "e" : "";
      return (vertical + horizontal) as WindowEdge | "";
    };
    const move = (event: MouseEvent) => {
      if (armed && event.buttons === 1) {
        armed = false;
        host.drag!();
      } else if (!event.buttons) {
        const edge = edgeAt(event.clientX, event.clientY);
        const next = edge && `${edge}-resize`;
        if (next !== cursor) root.style.cursor = cursor = next;
      }
    };
    const down = (event: MouseEvent) => {
      if (event.button !== 0) return;
      const edge = edgeAt(event.clientX, event.clientY);
      if (edge) {
        event.preventDefault();
        host.resize!(edge);
      } else
        armed = !!host.drag && event.detail === 1 && draggable(event.target);
    };
    const up = () => {
      armed = false;
    };
    const dblclick = (event: MouseEvent) => {
      if (draggable(event.target)) host.toggleMaximize();
    };
    const key = (event: KeyboardEvent) => {
      const shortcut =
        host.platform === "macos"
          ? event.ctrlKey && event.metaKey && event.code === "KeyF"
          : event.key === "F11";
      if (!host.fullscreen || !shortcut) return;
      event.preventDefault();
      host.fullscreen(!isFullscreen(host));
    };
    window.addEventListener("mousemove", move);
    window.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("dblclick", dblclick);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("dblclick", dblclick);
      window.removeEventListener("keydown", key);
      if (cursor) root.style.cursor = "";
    };
  }, [host]);
}

const glyph = (children: ReactNode) => (
  <svg
    aria-hidden="true"
    viewBox="0 0 10 10"
    width="10"
    height="10"
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
  >
    {children}
  </svg>
);

// WindowControls are caption buttons for the workspace's trailing slot, flush in the window's corner
export function WindowControls({ host }: { host: WindowHost }) {
  const [full] = useFullscreen(host);
  const [max, setMax] = useState(maximized);
  const [top, setTop] = useState(0);
  const spacer = useRef<HTMLDivElement>(null);
  const hidden = host.platform === "macos" || full;
  const measure = () => {
    setMax(maximized());
    if (spacer.current) setTop(spacer.current.getBoundingClientRect().top);
  };
  useLayoutEffect(measure);
  useEffect(() => {
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);
  if (hidden) return null;
  const button = (
    label: string,
    action: () => void,
    icon: ReactNode,
    close?: boolean,
  ) => (
    <button
      type="button"
      tabIndex={-1}
      aria-label={label}
      title={label}
      className={
        close ? "lab-window-button lab-window-close" : "lab-window-button"
      }
      onClick={action}
    >
      {icon}
    </button>
  );
  return (
    <div
      ref={spacer}
      className="lab-window-controls"
      style={{ "--lab-window-top": `${top}px` } as CSSProperties}
    >
      <div className="lab-window-buttons">
        {button(
          "Minimize",
          () => host.minimize(),
          glyph(<path d="M0 5.5h10" />),
        )}
        {button(
          max ? "Restore" : "Maximize",
          () => host.toggleMaximize(),
          max
            ? glyph(
                <>
                  <rect x="0.5" y="2.5" width="7" height="7" rx="1" />
                  <path d="M2.5 2.5v-1a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1h-1" />
                </>,
              )
            : glyph(<rect x="0.5" y="0.5" width="9" height="9" rx="1" />),
        )}
        {button(
          "Close",
          () => host.close(),
          glyph(<path d="m0.5 0.5 9 9m0-9-9 9" />),
          true,
        )}
      </div>
    </div>
  );
}
