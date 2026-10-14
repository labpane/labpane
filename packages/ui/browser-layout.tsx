import * as React from "react";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./classes.js";

type BrowserLayoutState = {
  navOpen: boolean;
  setNavOpen: (open: boolean) => void;
};

const BrowserLayoutContext = React.createContext<BrowserLayoutState>({
  navOpen: true,
  setNavOpen: () => {},
});

export function useBrowserLayout() {
  return React.useContext(BrowserLayoutContext);
}

// Below md only the pane the route is about shows; from md up both show and the nav can collapse
const BrowserLayout = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    view: "nav" | "detail";
    navOpen?: boolean;
    defaultNavOpen?: boolean;
    onNavOpenChange?: (open: boolean) => void;
  }
>(function BrowserLayout(
  {
    view,
    navOpen,
    defaultNavOpen = true,
    onNavOpenChange,
    className,
    children,
    ...props
  },
  ref,
) {
  const [own, setOwn] = React.useState(defaultNavOpen);
  const open = navOpen ?? own;
  const state = React.useMemo<BrowserLayoutState>(
    () => ({
      navOpen: open,
      setNavOpen: (next) => {
        setOwn(next);
        onNavOpenChange?.(next);
      },
    }),
    [open, onNavOpenChange],
  );
  return (
    <BrowserLayoutContext.Provider value={state}>
      <div
        ref={ref}
        data-slot="browser-layout"
        data-view={view}
        data-nav={open ? "open" : "closed"}
        className={cn(
          "labui:group/browser labui:flex labui:min-h-0 labui:min-w-0 labui:flex-1",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </BrowserLayoutContext.Provider>
  );
});

const BrowserLayoutNav = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav">
>(function BrowserLayoutNav({ className, ...props }, ref) {
  return (
    <nav
      ref={ref}
      data-slot="browser-layout-nav"
      className={cn(
        "labui:flex labui:w-full labui:min-w-0 labui:flex-col labui:overflow-auto labui:md:w-72 labui:md:shrink-0 labui:md:border-r",
        "labui:max-md:group-data-[view=detail]/browser:hidden labui:md:group-data-[nav=closed]/browser:hidden",
        className,
      )}
      {...props}
    />
  );
});

const BrowserLayoutPane = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"main">
>(function BrowserLayoutPane({ className, ...props }, ref) {
  return (
    <main
      ref={ref}
      data-slot="browser-layout-pane"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-1 labui:flex-col labui:overflow-auto",
        "labui:max-md:group-data-[view=nav]/browser:hidden",
        className,
      )}
      {...props}
    />
  );
});

const BrowserLayoutToggle = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(function BrowserLayoutToggle({ className, onClick, ...props }, ref) {
  const { navOpen, setNavOpen } = useBrowserLayout();
  return (
    <Button
      ref={ref}
      data-slot="browser-layout-toggle"
      variant="ghost"
      size="icon-sm"
      aria-label="Toggle navigation"
      aria-pressed={navOpen}
      className={cn("labui:max-md:hidden", className)}
      onClick={(event) => {
        onClick?.(event);
        setNavOpen(!navOpen);
      }}
      {...props}
    >
      <PanelLeftIcon />
    </Button>
  );
});

export {
  BrowserLayout,
  BrowserLayoutNav,
  BrowserLayoutPane,
  BrowserLayoutToggle,
};
