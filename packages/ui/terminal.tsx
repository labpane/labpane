import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { WTerm, type TerminalCore } from "@wterm/dom";
import { cn } from "./classes.js";
import {
  Maximize2Icon,
  Minimize2Icon,
  RotateCwIcon,
  XIcon,
} from "lucide-react";
import { Button } from "./button.js";

export type TerminalTheme = {
  foreground: number;
  background: number;
  cursor: number;
  palette: number[];
};
export type TerminalShell = {
  attach: (write: (data: string) => void) => unknown;
  handleInput: (data: string) => unknown;
};
export type TerminalHandle = { reconnect: () => void; focus: () => void };

export const terminalThemes = {
  dark: {
    foreground: 0xe5e5e5,
    background: 0x262626,
    cursor: 0xe5e5e5,
    palette: [
      0x1e1e1e, 0xf44747, 0x6a9955, 0xd7ba7d, 0x569cd6, 0xc586c0, 0x4ec9b0,
      0xd4d4d4, 0x808080, 0xff6b6b, 0x8ec07c, 0xffd866, 0x82aaff, 0xd7a1d7,
      0x7fdbca, 0xffffff,
    ],
  },
  light: {
    foreground: 0x262626,
    background: 0xffffff,
    cursor: 0x262626,
    palette: [
      0x262626, 0xb42318, 0x237a36, 0x876000, 0x245ac0, 0x8b3fa0, 0x006e7a,
      0xd4d4d4, 0x616161, 0xc43326, 0x287d3c, 0x8a6500, 0x2563c7, 0x9542aa,
      0x007c8a, 0xffffff,
    ],
  },
  solarized: {
    foreground: 0x839496,
    background: 0x002b36,
    cursor: 0x93a1a1,
    palette: [
      0x073642, 0xdc322f, 0x859900, 0xb58900, 0x268bd2, 0xd33682, 0x2aa198,
      0xeee8d5, 0x586e75, 0xcb4b16, 0x586e75, 0x657b83, 0x839496, 0x6c71c4,
      0x93a1a1, 0xfdf6e3,
    ],
  },
  monokai: {
    foreground: 0xf8f8f2,
    background: 0x272822,
    cursor: 0xf8f8f0,
    palette: [
      0x272822, 0xf92672, 0xa6e22e, 0xf4bf75, 0x66d9ef, 0xae81ff, 0xa1efe4,
      0xf8f8f2, 0x75715e, 0xf92672, 0xa6e22e, 0xf4bf75, 0x66d9ef, 0xae81ff,
      0xa1efe4, 0xf9f8f5,
    ],
  },
} satisfies Record<string, TerminalTheme>;
export type TerminalThemeName = "auto" | keyof typeof terminalThemes;

export type TerminalProps = (
  | {
      connect: () => string | URL | Promise<string | URL>;
      shell?: undefined;
    }
  | {
      shell: () => TerminalShell | Promise<TerminalShell>;
      connect?: undefined;
    }
) & {
  core?: () => Promise<TerminalCore & { dispose?: () => void }>;
  theme?: TerminalThemeName | TerminalTheme;
  // expandable adds a button that fills the screen with the terminal
  expandable?: boolean;
  className?: string;
};

export const Terminal = forwardRef<TerminalHandle, TerminalProps>(
  function Terminal(
    { connect, shell, core, theme = "auto", expandable, className },
    ref,
  ) {
    const reconnect = useRef(() => {});
    const terminal = useRef<WTerm | undefined>(undefined);
    const [status, setStatus] = useState("Connecting…");
    const [error, setError] = useState("");
    const [full, setFull] = useState(false);
    const frame = useRef<HTMLDivElement>(null);
    const host = useRef<HTMLDivElement>(null);
    const chosen = useRef(theme);
    chosen.current = theme;
    const applyTheme = useRef(() => {});
    useImperativeHandle(ref, () => ({
      reconnect: () => reconnect.current(),
      focus: () => terminal.current?.focus(),
    }));

    useEffect(() => applyTheme.current(), [theme]);

    useLayoutEffect(() => {
      const element = frame.current;
      if (!full || !element || !("showPopover" in element)) return;
      element.setAttribute("popover", "manual");
      element.showPopover();
      return () => {
        if (element.matches(":popover-open")) element.hidePopover();
        element.removeAttribute("popover");
      };
    }, [full]);

    useEffect(() => {
      let disposed = false,
        term: WTerm | undefined,
        loaded: (TerminalCore & { dispose?: () => void }) | undefined,
        ws: WebSocket | undefined,
        input: (text: string) => void = () => {},
        initialized: Promise<WTerm> | undefined,
        retryTimer: ReturnType<typeof setTimeout> | undefined,
        generation = 0,
        sessions = 0;
      const observers: { disconnect: () => void }[] = [];
      const disconnect = () => {
        clearTimeout(retryTimer);
        input = () => {};
        if (ws) {
          ws.onopen = ws.onmessage = ws.onclose = ws.onerror = null;
          ws.close();
          ws = undefined;
        }
      };
      const send = (bytes: Uint8Array) => {
        if (ws?.readyState !== WebSocket.OPEN) return;
        if (ws.bufferedAmount + bytes.length > 1024 * 1024) {
          setError("Terminal input buffer is full; input was not sent");
          return;
        }
        for (let i = 0; i < bytes.length; i += 16384)
          ws.send(bytes.slice(i, i + 16384));
      };
      const resize = (cols: number, rows: number) => {
        if (ws?.readyState === WebSocket.OPEN)
          ws.send(JSON.stringify({ cols, rows }));
      };
      const updateTheme = () => {
        if (!host.current || !term) return;
        const name = chosen.current;
        term.setThemeColors(
          typeof name === "object"
            ? name
            : name !== "auto"
              ? terminalThemes[name]
              : getComputedStyle(host.current).colorScheme === "dark"
                ? terminalThemes.dark
                : terminalThemes.light,
        );
      };
      const open = async (canRetry = true) => {
        const attempt = ++generation;
        const stale = () => disposed || attempt !== generation;
        disconnect();
        setError("");
        setStatus(canRetry ? "Connecting…" : "Reconnecting…");
        const failed = (message: string) => {
          if (stale()) return;
          if (canRetry) {
            setStatus("Reconnecting…");
            retryTimer = setTimeout(() => void open(false), 1000);
          } else {
            setStatus("Disconnected");
            setError(message);
          }
        };
        try {
          if (shell) {
            const session = await shell();
            if (stale()) return;
            await (initialized ??= term!.init());
            if (stale()) return;
            if (sessions++) term!.write("\x1bc");
            input = (text) => void session.handleInput(text);
            await session.attach((data) => {
              if (!stale()) term!.write(data);
            });
            if (!stale()) setStatus("Connected");
            return;
          }
          const target = await connect!();
          if (stale()) return;
          await (initialized ??= term!.init());
          if (stale()) return;
          const address = new URL(target, document.baseURI);
          address.protocol = address.protocol.replace(/^http/, "ws");
          ws = new WebSocket(address);
          ws.binaryType = "arraybuffer";
          input = (text) => send(new TextEncoder().encode(text));
          let connectionError = "";
          ws.onopen = () => {
            setStatus("Connected");
            resize(term!.cols, term!.rows);
          };
          ws.onmessage = (event) => {
            if (typeof event.data === "string") connectionError = event.data;
            else {
              canRetry = true;
              term!.write(new Uint8Array(event.data));
            }
          };
          ws.onerror = () => {
            connectionError = "Could not connect to the terminal";
          };
          ws.onclose = (event) => {
            if (event.code === 1000 && !connectionError)
              setStatus("Disconnected");
            else failed(connectionError || event.reason || "Connection lost");
          };
        } catch (err) {
          failed(err instanceof Error ? err.message : String(err));
        }
      };
      void (async () => {
        try {
          loaded = await core?.();
        } catch (err) {
          console.warn("Using the built-in terminal core:", err);
        }
        if (disposed) return loaded?.dispose?.();
        term = new WTerm(host.current!, {
          core: loaded,
          onData: (text) => input(text),
          onBinary: send,
          onResize: resize,
          announceOutput: true,
        });
        terminal.current = term;
        const themeObserver = new MutationObserver(updateTheme);
        for (
          let parent = host.current!.parentElement;
          parent;
          parent = parent.parentElement
        )
          themeObserver.observe(parent, {
            attributes: true,
            attributeFilter: ["class", "style"],
          });
        const preferred = matchMedia("(prefers-color-scheme: dark)");
        preferred.addEventListener("change", updateTheme);
        const visible = new ResizeObserver(() =>
          term!.setRenderingPaused(!host.current?.clientHeight),
        );
        visible.observe(host.current!);
        observers.push(themeObserver, visible, {
          disconnect: () =>
            preferred.removeEventListener("change", updateTheme),
        });
        applyTheme.current = updateTheme;
        updateTheme();
        reconnect.current = () => {
          void open();
          term!.focus();
        };
        void open();
      })();
      return () => {
        disposed = true;
        reconnect.current = applyTheme.current = () => {};
        terminal.current = undefined;
        disconnect();
        for (const observer of observers) observer.disconnect();
        term?.destroy();
        loaded?.dispose?.();
      };
    }, [connect, shell, core]);

    return (
      <div
        ref={frame}
        data-slot="terminal"
        className={cn(
          "labui:flex labui:h-full labui:min-h-0 labui:flex-col",
          full &&
            "labui:fixed labui:inset-0 labui:z-50 labui:m-0 labui:size-full labui:max-h-none labui:max-w-none labui:border-0 labui:bg-background labui:p-0 labui:text-foreground",
          className,
        )}
      >
        <span role="status" className="labui:sr-only">
          {status}
        </span>
        {(status === "Disconnected" || error) && (
          <div
            key="banner"
            role="alert"
            className="labui:flex labui:shrink-0 labui:items-center labui:gap-2 labui:border-b labui:bg-muted labui:px-3 labui:py-1 labui:text-xs"
          >
            <span className="labui:min-w-0 labui:flex-1">
              {error || "Terminal disconnected"}
            </span>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={
                status === "Connected"
                  ? "Dismiss terminal message"
                  : "Reconnect terminal"
              }
              title={status === "Connected" ? "Dismiss" : "Reconnect terminal"}
              onClick={() =>
                status === "Connected" ? setError("") : reconnect.current()
              }
            >
              {status === "Connected" ? (
                <XIcon aria-hidden="true" />
              ) : (
                <RotateCwIcon aria-hidden="true" />
              )}
            </Button>
          </div>
        )}
        <div
          key="terminal"
          className="labui:group labui:relative labui:min-h-0 labui:flex-1"
        >
          <div
            ref={host}
            aria-label="Terminal input"
            className="labui:h-full"
            style={{ borderRadius: 0, boxShadow: "none" }}
          />
          {expandable && (
            <Button
              variant="secondary"
              size="icon-xs"
              aria-label="Full screen"
              aria-pressed={full}
              title={full ? "Exit full screen" : "Full screen"}
              className="labui:absolute labui:top-2 labui:right-2 labui:opacity-0 labui:transition-opacity labui:group-hover:opacity-100 labui:focus-visible:opacity-100"
              onClick={() => {
                setFull(!full);
                requestAnimationFrame(() => terminal.current?.focus());
              }}
            >
              {full ? (
                <Minimize2Icon aria-hidden="true" />
              ) : (
                <Maximize2Icon aria-hidden="true" />
              )}
            </Button>
          )}
        </div>
      </div>
    );
  },
);
