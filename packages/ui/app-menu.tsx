import * as Popover from "@radix-ui/react-popover";
import { useRef, useState, type ReactNode } from "react";
import { MaximizeIcon, MinimizeIcon, MoonIcon, SunIcon } from "lucide-react";
import { ActionMenu } from "./menu.js";
import { Button } from "./button.js";

const round = "labui:rounded-full labui:border labui:border-border";

export function AppMenu({
  name,
  logo,
  version,
  dark = false,
  onThemeChange,
  size = 100,
  align = "start",
  onSizeChange,
  onSizeReset,
  fullscreen = false,
  onFullscreenChange,
  children,
}: {
  name: string;
  logo: ReactNode;
  version?: ReactNode;
  dark?: boolean;
  onThemeChange?: (dark: boolean) => void;
  size?: number;
  onSizeChange?: (size: number) => void;
  // onSizeReset is offered when the size button is right-clicked
  onSizeReset?: () => void;
  fullscreen?: boolean;
  onFullscreenChange?: (fullscreen: boolean) => void;
  align?: "start" | "end";
  // children hold the app's own items, grouped with AppMenuSection
  children?: ReactNode;
}) {
  const trigger = useRef<HTMLButtonElement>(null);
  const sizePanel = useRef<HTMLDivElement>(null);
  const [anchor, setAnchor] = useState<number>();
  const level = Math.max(0, Math.min(100, size));
  const ThemeIcon = dark ? SunIcon : MoonIcon;
  const theme = dark ? "dark " : "";
  return (
    <Popover.Root
      onOpenChange={(open) => {
        if (open) setAnchor(trigger.current?.offsetHeight);
      }}
    >
      <Popover.Trigger asChild>
        <button
          ref={trigger}
          type="button"
          aria-label={name}
          title={`${name} menu`}
          className="labui:group labui:relative labui:grid labui:size-[var(--lab-tab-height,2.75rem)] labui:shrink-0 labui:cursor-pointer labui:place-items-center labui:rounded-full labui:outline-none labui:focus-visible:outline-2 labui:focus-visible:outline-ring"
        >
          <span className="labui:grid labui:size-[var(--lab-logo-size,1.5rem)] labui:transition-[filter,translate] labui:duration-150 labui:motion-safe:group-hover:-translate-y-0.5 labui:group-hover:drop-shadow-[0_3px_2px_#00000035] labui:group-active:translate-y-0 labui:dark:group-hover:drop-shadow-[0_3px_3px_#00000090]">
            {logo}
          </span>
          <Popover.Anchor asChild>
            <span
              className="labui:absolute labui:inset-x-0 labui:top-0"
              style={{ height: anchor ?? "100%" }}
            />
          </Popover.Anchor>
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          align={align}
          sideOffset={4}
          collisionPadding={8}
          aria-label={`${name} menu`}
          onInteractOutside={(event) => {
            if (sizePanel.current?.contains(event.target as Node))
              event.preventDefault();
          }}
          className={
            theme +
            (align === "start"
              ? "labui:ml-1 labui:sm:-ml-1 "
              : "labui:mr-1 labui:sm:-mr-1 ") +
            "labui:z-50 labui:flex labui:w-max labui:max-h-[var(--radix-popover-content-available-height)] labui:flex-col labui:items-center labui:gap-3 labui:overflow-auto labui:rounded-lg labui:border labui:bg-popover labui:p-4 labui:text-center labui:text-popover-foreground labui:shadow-sm"
          }
        >
          <div className="labui:flex labui:items-center labui:gap-2 labui:text-2xl">
            <span className="labui:grid labui:size-6 labui:shrink-0">
              {logo}
            </span>
            <span className="labui:font-display labui:font-bold labui:tracking-tight">
              {name}
            </span>
          </div>
          {version != null && (
            <div className="labui:text-xs labui:text-muted-foreground">
              <span className="labui:font-mono">{version}</span>
            </div>
          )}
          <div className="labui:flex labui:items-center labui:justify-center labui:gap-2">
            {onThemeChange && (
              <Button
                variant="ghost"
                size="icon-sm"
                className={round}
                aria-label="Toggle theme"
                aria-pressed={dark}
                onClick={() => onThemeChange(!dark)}
                title="Toggle theme"
              >
                <ThemeIcon className="labui:size-4" />
              </Button>
            )}
            {onSizeChange && (
              <Popover.Root>
                <ActionMenu
                  actions={
                    onSizeReset
                      ? [{ label: "Reset", onSelect: onSizeReset }]
                      : []
                  }
                >
                  <Popover.Trigger asChild>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      className={round}
                      aria-label="Workspace size"
                      title="Workspace size"
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="labui:size-4 labui:[&_rect]:transition-[fill-opacity]"
                      >
                        {[0, 1, 2].map((row) => (
                          <rect
                            key={row}
                            x="4"
                            y={3 + row * 7}
                            width="16"
                            height="4"
                            rx="1"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            fill="currentColor"
                            fillOpacity={Math.max(
                              0,
                              Math.min(1, (level / 100) * 3 - (2 - row)),
                            )}
                          />
                        ))}
                      </svg>
                    </Button>
                  </Popover.Trigger>
                </ActionMenu>
                <Popover.Portal>
                  <Popover.Content
                    ref={sizePanel}
                    side="bottom"
                    align="center"
                    sideOffset={8}
                    collisionPadding={8}
                    aria-label="Workspace size"
                    className={
                      theme +
                      "labui:z-[60] labui:origin-(--radix-popover-content-transform-origin) labui:animate-pop labui:rounded-xl labui:border labui:bg-popover labui:p-2 labui:shadow-md labui:data-[state=closed]:animate-[labui-pop_120ms_ease-in_reverse]"
                    }
                  >
                    <div className="labui:relative labui:h-28 labui:w-7 labui:overflow-hidden labui:rounded-full labui:border labui:bg-secondary labui:shadow-inner labui:has-focus-visible:outline-2 labui:has-focus-visible:outline-offset-2 labui:has-focus-visible:outline-ring">
                      <div
                        className="labui:pointer-events-none labui:absolute labui:inset-x-0 labui:bottom-0 labui:bg-white labui:shadow-[0_-1px_4px_#00000014] labui:[transition:height_100ms_ease-out] labui:forced-colors:hidden"
                        style={{ height: `${level}%` }}
                      />
                      <input
                        type="range"
                        min={0}
                        max={100}
                        step="any"
                        value={level}
                        aria-label="Workspace size"
                        aria-orientation="vertical"
                        aria-valuetext={`${Math.round(level)}%`}
                        className="labui:range-overlay"
                        onChange={(event) =>
                          onSizeChange(event.currentTarget.valueAsNumber)
                        }
                      />
                    </div>
                    <Popover.Arrow asChild width={16} height={8}>
                      <svg
                        viewBox="0 0 16 8"
                        className="labui:fill-popover labui:stroke-border"
                      >
                        <path d="M0 0 C3 0 5 6 7 7 Q8 8 9 7 C11 6 13 0 16 0" />
                      </svg>
                    </Popover.Arrow>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            )}
            {onFullscreenChange && (
              <Button
                variant="ghost"
                size="icon-sm"
                className={round}
                aria-label="Full screen"
                aria-pressed={fullscreen}
                title={fullscreen ? "Exit full screen" : "Full screen"}
                onClick={() => onFullscreenChange(!fullscreen)}
              >
                {fullscreen ? (
                  <MinimizeIcon className="labui:size-4" />
                ) : (
                  <MaximizeIcon className="labui:size-4" />
                )}
              </Button>
            )}
          </div>
          {children}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function AppMenuSection({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div
      data-slot="app-menu-section"
      className="labui:flex labui:w-full labui:flex-col labui:gap-1 labui:border-t labui:pt-3 labui:text-left labui:text-sm"
    >
      {title && (
        <p className="labui:px-1 labui:text-xs labui:font-medium labui:text-muted-foreground">
          {title}
        </p>
      )}
      {children}
    </div>
  );
}
