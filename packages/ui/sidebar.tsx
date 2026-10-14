import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { PanelLeftIcon } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./classes.js";
import { Input } from "./input.js";
import { Separator } from "./separator.js";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./sheet.js";
import { Skeleton } from "./skeleton.js";
import { useTabActive } from "./tab-state.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.js";
import { useIsMobile } from "./use-mobile.js";

const widths = { expanded: "16rem", mobile: "18rem", icon: "3rem" };

type SidebarState = {
  state: "expanded" | "collapsed";
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
};

const SidebarContext = React.createContext<SidebarState | null>(null);

function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar needs a SidebarProvider above it");
  return context;
}

function useShortcut(key: string | null, run: () => void) {
  const active = useTabActive();
  React.useEffect(() => {
    if (!key || !active) return;
    const press = (event: KeyboardEvent) => {
      if (event.key !== key || !(event.metaKey || event.ctrlKey)) return;
      event.preventDefault();
      run();
    };
    window.addEventListener("keydown", press);
    return () => window.removeEventListener("keydown", press);
  }, [key, active, run]);
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    defaultOpen?: boolean;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    shortcut?: string | null;
  }
>(function SidebarProvider(
  {
    defaultOpen = true,
    open: openProp,
    onOpenChange,
    shortcut = "b",
    className,
    style,
    children,
    ...props
  },
  ref,
) {
  const isMobile = useIsMobile();
  const [openMobile, setOpenMobile] = React.useState(false);
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen);
  const open = openProp ?? ownOpen;
  const setOpen = React.useCallback(
    (next: boolean) => {
      setOwnOpen(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  const toggleSidebar = React.useCallback(
    () => (isMobile ? setOpenMobile((was) => !was) : setOpen(!open)),
    [isMobile, open, setOpen],
  );
  useShortcut(shortcut, toggleSidebar);

  const value = React.useMemo<SidebarState>(
    () => ({
      state: open ? "expanded" : "collapsed",
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [open, setOpen, isMobile, openMobile, toggleSidebar],
  );

  return (
    <SidebarContext.Provider value={value}>
      <TooltipProvider delayDuration={0}>
        <div
          ref={ref}
          data-slot="sidebar-wrapper"
          style={
            {
              "--labui-sidebar-width": widths.expanded,
              "--labui-sidebar-width-icon": widths.icon,
              ...style,
            } as React.CSSProperties
          }
          className={cn(
            "labui:group/sidebar-wrapper labui:flex labui:min-h-svh labui:w-full labui:has-data-[variant=inset]:bg-sidebar",
            className,
          )}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  );
});

type SidebarProps = React.ComponentPropsWithoutRef<"div"> & {
  side?: "left" | "right";
  variant?: "sidebar" | "floating" | "inset";
  collapsible?: "offcanvas" | "icon" | "none";
};

function MobileSidebar({
  side,
  children,
  ...props
}: Pick<SidebarProps, "side" | "children"> &
  React.ComponentProps<typeof Sheet>) {
  const { openMobile, setOpenMobile } = useSidebar();
  return (
    <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
      <SheetContent
        data-sidebar="sidebar"
        data-slot="sidebar"
        data-mobile="true"
        side={side}
        showCloseButton={false}
        style={
          { "--labui-sidebar-width": widths.mobile } as React.CSSProperties
        }
        className="labui:w-(--labui-sidebar-width) labui:bg-sidebar labui:p-0 labui:text-sidebar-foreground"
      >
        <SheetHeader className="labui:sr-only">
          <SheetTitle>Sidebar</SheetTitle>
          <SheetDescription>Navigation</SheetDescription>
        </SheetHeader>
        <div className="labui:flex labui:h-full labui:w-full labui:flex-col">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(function Sidebar(
  {
    side = "left",
    variant = "sidebar",
    collapsible = "offcanvas",
    className,
    children,
    ...props
  },
  ref,
) {
  const { isMobile, state } = useSidebar();
  const padded = variant === "floating" || variant === "inset";

  if (collapsible === "none")
    return (
      <div
        ref={ref}
        data-slot="sidebar"
        className={cn(
          "labui:flex labui:h-full labui:w-(--labui-sidebar-width) labui:flex-col labui:bg-sidebar labui:text-sidebar-foreground",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );

  if (isMobile) return <MobileSidebar side={side}>{children}</MobileSidebar>;

  return (
    <div
      ref={ref}
      data-slot="sidebar"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      className="labui:group labui:peer labui:hidden labui:text-sidebar-foreground labui:md:block"
    >
      <div
        data-slot="sidebar-gap"
        className={cn(
          "labui:relative labui:w-(--labui-sidebar-width) labui:bg-transparent labui:transition-[width] labui:duration-200 labui:ease-linear",
          "labui:group-data-[collapsible=offcanvas]:w-0 labui:group-data-[side=right]:rotate-180",
          padded
            ? "labui:group-data-[collapsible=icon]:w-[calc(var(--labui-sidebar-width-icon)+(--spacing(4)))]"
            : "labui:group-data-[collapsible=icon]:w-(--labui-sidebar-width-icon)",
        )}
      />
      <div
        data-slot="sidebar-container"
        className={cn(
          "labui:fixed labui:inset-y-0 labui:z-10 labui:hidden labui:h-svh labui:w-(--labui-sidebar-width) labui:transition-[left,right,width] labui:duration-200 labui:ease-linear labui:md:flex",
          side === "left"
            ? "labui:left-0 labui:group-data-[collapsible=offcanvas]:left-[calc(var(--labui-sidebar-width)*-1)]"
            : "labui:right-0 labui:group-data-[collapsible=offcanvas]:right-[calc(var(--labui-sidebar-width)*-1)]",
          padded
            ? "labui:p-2 labui:group-data-[collapsible=icon]:w-[calc(var(--labui-sidebar-width-icon)+(--spacing(4))+2px)]"
            : "labui:group-data-[collapsible=icon]:w-(--labui-sidebar-width-icon) labui:group-data-[side=left]:border-r labui:group-data-[side=right]:border-l",
          className,
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="labui:flex labui:h-full labui:w-full labui:flex-col labui:bg-sidebar labui:group-data-[variant=floating]:rounded-lg labui:group-data-[variant=floating]:border labui:group-data-[variant=floating]:border-sidebar-border labui:group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  );
});

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof Button>
>(function SidebarTrigger({ className, onClick, ...props }, ref) {
  const { toggleSidebar } = useSidebar();
  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon-sm"
      className={cn("labui:size-7", className)}
      onClick={(event) => {
        onClick?.(event);
        toggleSidebar();
      }}
      {...props}
    >
      <PanelLeftIcon />
      <span className="labui:sr-only">Toggle sidebar</span>
    </Button>
  );
});

const SidebarRail = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button">
>(function SidebarRail({ className, ...props }, ref) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      ref={ref}
      type="button"
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      title="Toggle sidebar"
      className={cn(
        "labui:absolute labui:inset-y-0 labui:z-20 labui:hidden labui:w-4 labui:-translate-x-1/2 labui:transition-all labui:ease-linear labui:group-data-[side=left]:-right-4 labui:group-data-[side=right]:left-0 labui:after:absolute labui:after:inset-y-0 labui:after:left-1/2 labui:after:w-[2px] labui:hover:after:bg-sidebar-border labui:sm:flex",
        "labui:in-data-[side=left]:cursor-w-resize labui:in-data-[side=right]:cursor-e-resize",
        "labui:[[data-side=left][data-state=collapsed]_&]:cursor-e-resize labui:[[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "labui:group-data-[collapsible=offcanvas]:translate-x-0 labui:group-data-[collapsible=offcanvas]:after:left-full labui:hover:group-data-[collapsible=offcanvas]:bg-sidebar",
        "labui:[[data-side=left][data-collapsible=offcanvas]_&]:-right-2 labui:[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className,
      )}
      {...props}
    />
  );
});

const SidebarInset = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"main">
>(function SidebarInset({ className, ...props }, ref) {
  return (
    <main
      ref={ref}
      data-slot="sidebar-inset"
      className={cn(
        "labui:relative labui:flex labui:w-full labui:flex-1 labui:flex-col labui:bg-background",
        "labui:md:peer-data-[variant=inset]:m-2 labui:md:peer-data-[variant=inset]:ml-0 labui:md:peer-data-[variant=inset]:rounded-xl labui:md:peer-data-[variant=inset]:shadow-sm labui:md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
        className,
      )}
      {...props}
    />
  );
});

const SidebarInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(function SidebarInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn(
        "labui:h-8 labui:w-full labui:bg-background labui:shadow-none",
        className,
      )}
      {...props}
    />
  );
});

function section(slot: string, classes: string) {
  const Section = React.forwardRef<
    HTMLDivElement,
    React.ComponentPropsWithoutRef<"div">
  >(function Section({ className, ...props }, ref) {
    return (
      <div
        ref={ref}
        data-slot={`sidebar-${slot}`}
        data-sidebar={slot}
        className={cn(classes, className)}
        {...props}
      />
    );
  });
  return Section;
}

const SidebarHeader = section(
  "header",
  "labui:flex labui:flex-col labui:gap-2 labui:p-2",
);
const SidebarFooter = section(
  "footer",
  "labui:flex labui:flex-col labui:gap-2 labui:p-2",
);
const SidebarContent = section(
  "content",
  "labui:flex labui:min-h-0 labui:flex-1 labui:flex-col labui:gap-2 labui:overflow-auto labui:group-data-[collapsible=icon]:overflow-hidden",
);
const SidebarGroup = section(
  "group",
  "labui:relative labui:flex labui:w-full labui:min-w-0 labui:flex-col labui:p-2",
);
const SidebarGroupContent = section(
  "group-content",
  "labui:w-full labui:text-sm",
);

const SidebarSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Separator>
>(function SidebarSeparator({ className, ...props }, ref) {
  return (
    <Separator
      ref={ref}
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(
        "labui:mx-2 labui:bg-sidebar-border labui:data-[orientation=horizontal]:w-auto",
        className,
      )}
      {...props}
    />
  );
});

const SidebarGroupLabel = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { asChild?: boolean }
>(function SidebarGroupLabel({ className, asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      ref={ref}
      data-slot="sidebar-group-label"
      data-sidebar="group-label"
      className={cn(
        "labui:flex labui:h-8 labui:shrink-0 labui:items-center labui:rounded-md labui:px-2 labui:text-xs labui:font-medium labui:text-sidebar-foreground/70 labui:ring-sidebar-ring labui:outline-hidden labui:transition-[margin,opacity] labui:duration-200 labui:ease-linear labui:focus-visible:ring-2 labui:[&>svg]:size-4 labui:[&>svg]:shrink-0",
        "labui:group-data-[collapsible=icon]:-mt-8 labui:group-data-[collapsible=icon]:opacity-0",
        className,
      )}
      {...props}
    />
  );
});

const SidebarGroupAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { asChild?: boolean }
>(function SidebarGroupAction({ className, asChild = false, ...props }, ref) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-slot="sidebar-group-action"
      data-sidebar="group-action"
      className={cn(
        "labui:absolute labui:top-3.5 labui:right-3 labui:flex labui:aspect-square labui:w-5 labui:items-center labui:justify-center labui:rounded-md labui:p-0 labui:text-sidebar-foreground labui:ring-sidebar-ring labui:outline-hidden labui:transition-transform labui:hover:bg-sidebar-accent labui:hover:text-sidebar-accent-foreground labui:focus-visible:ring-2 labui:[&>svg]:size-4 labui:[&>svg]:shrink-0",
        "labui:after:absolute labui:after:-inset-2 labui:md:after:hidden",
        "labui:group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});

const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(function SidebarMenu({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn(
        "labui:flex labui:w-full labui:min-w-0 labui:list-none labui:flex-col labui:gap-1",
        className,
      )}
      {...props}
    />
  );
});

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function SidebarMenuItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("labui:group/menu-item labui:relative", className)}
      {...props}
    />
  );
});

const menuButtonVariants = {
  default:
    "labui:hover:bg-sidebar-accent labui:hover:text-sidebar-accent-foreground",
  outline:
    "labui:bg-background labui:shadow-[0_0_0_1px_var(--labui-sidebar-border)] labui:hover:bg-sidebar-accent labui:hover:text-sidebar-accent-foreground labui:hover:shadow-[0_0_0_1px_var(--labui-sidebar-accent)]",
};

const menuButtonSizes = {
  default: "labui:h-8 labui:text-sm",
  sm: "labui:h-7 labui:text-xs",
  lg: "labui:h-12 labui:text-sm labui:group-data-[collapsible=icon]:p-0!",
};

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    asChild?: boolean;
    isActive?: boolean;
    variant?: keyof typeof menuButtonVariants;
    size?: keyof typeof menuButtonSizes;
    tooltip?: string | React.ComponentProps<typeof TooltipContent>;
  }
>(function SidebarMenuButton(
  {
    asChild = false,
    isActive = false,
    variant = "default",
    size = "default",
    tooltip,
    className,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const { isMobile, state } = useSidebar();
  const button = (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-button"
      data-sidebar="menu-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "labui:peer/menu-button labui:flex labui:w-full labui:items-center labui:gap-2 labui:overflow-hidden labui:rounded-md labui:p-2 labui:text-left labui:text-sm labui:ring-sidebar-ring labui:outline-hidden labui:transition-[width,height,padding] labui:group-has-data-[sidebar=menu-action]/menu-item:pr-8 labui:group-data-[collapsible=icon]:size-8! labui:group-data-[collapsible=icon]:p-2! labui:focus-visible:ring-2 labui:active:bg-sidebar-accent labui:active:text-sidebar-accent-foreground labui:disabled:pointer-events-none labui:disabled:opacity-50 labui:aria-disabled:pointer-events-none labui:aria-disabled:opacity-50 labui:data-[active=true]:bg-sidebar-accent labui:data-[active=true]:font-medium labui:data-[active=true]:text-sidebar-accent-foreground labui:data-[state=open]:hover:bg-sidebar-accent labui:data-[state=open]:hover:text-sidebar-accent-foreground labui:[&>span:last-child]:truncate labui:[&>svg]:size-4 labui:[&>svg]:shrink-0",
        menuButtonVariants[variant],
        menuButtonSizes[size],
        className,
      )}
      {...props}
    />
  );
  if (!tooltip) return button;
  const content = typeof tooltip === "string" ? { children: tooltip } : tooltip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...content}
      />
    </Tooltip>
  );
});

const SidebarMenuAction = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    asChild?: boolean;
    showOnHover?: boolean;
  }
>(function SidebarMenuAction(
  { className, asChild = false, showOnHover = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-action"
      data-sidebar="menu-action"
      className={cn(
        "labui:absolute labui:top-1.5 labui:right-1 labui:flex labui:aspect-square labui:w-5 labui:items-center labui:justify-center labui:rounded-md labui:p-0 labui:text-sidebar-foreground labui:ring-sidebar-ring labui:outline-hidden labui:transition-transform labui:peer-hover/menu-button:text-sidebar-accent-foreground labui:hover:bg-sidebar-accent labui:hover:text-sidebar-accent-foreground labui:focus-visible:ring-2 labui:[&>svg]:size-4 labui:[&>svg]:shrink-0",
        "labui:after:absolute labui:after:-inset-2 labui:md:after:hidden",
        "labui:peer-data-[size=sm]/menu-button:top-1 labui:peer-data-[size=default]/menu-button:top-1.5 labui:peer-data-[size=lg]/menu-button:top-2.5",
        "labui:group-data-[collapsible=icon]:hidden",
        showOnHover &&
          "labui:group-focus-within/menu-item:opacity-100 labui:group-hover/menu-item:opacity-100 labui:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground labui:data-[state=open]:opacity-100 labui:md:opacity-0",
        className,
      )}
      {...props}
    />
  );
});

const SidebarMenuBadge = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function SidebarMenuBadge({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      className={cn(
        "labui:pointer-events-none labui:absolute labui:right-1 labui:flex labui:h-5 labui:min-w-5 labui:items-center labui:justify-center labui:rounded-md labui:px-1 labui:text-xs labui:font-medium labui:text-sidebar-foreground labui:tabular-nums labui:select-none",
        "labui:peer-hover/menu-button:text-sidebar-accent-foreground labui:peer-data-[active=true]/menu-button:text-sidebar-accent-foreground",
        "labui:peer-data-[size=sm]/menu-button:top-1 labui:peer-data-[size=default]/menu-button:top-1.5 labui:peer-data-[size=lg]/menu-button:top-2.5",
        "labui:group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});

const SidebarMenuSkeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { showIcon?: boolean; width?: string }
>(function SidebarMenuSkeleton(
  { className, showIcon = false, width = "70%", ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn(
        "labui:flex labui:h-8 labui:items-center labui:gap-2 labui:rounded-md labui:px-2",
        className,
      )}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="labui:size-4 labui:rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="labui:h-4 labui:flex-1"
        data-sidebar="menu-skeleton-text"
        style={{ maxWidth: width }}
      />
    </div>
  );
});

const SidebarMenuSub = React.forwardRef<
  HTMLUListElement,
  React.ComponentPropsWithoutRef<"ul">
>(function SidebarMenuSub({ className, ...props }, ref) {
  return (
    <ul
      ref={ref}
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "labui:mx-3.5 labui:flex labui:min-w-0 labui:translate-x-px labui:list-none labui:flex-col labui:gap-1 labui:border-l labui:border-sidebar-border labui:px-2.5 labui:py-0.5",
        "labui:group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});

const SidebarMenuSubItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function SidebarMenuSubItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("labui:group/menu-sub-item labui:relative", className)}
      {...props}
    />
  );
});

const SidebarMenuSubButton = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & {
    asChild?: boolean;
    size?: "sm" | "md";
    isActive?: boolean;
  }
>(function SidebarMenuSubButton(
  { asChild = false, size = "md", isActive = false, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      data-slot="sidebar-menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size={size}
      data-active={isActive}
      className={cn(
        "labui:flex labui:h-7 labui:min-w-0 labui:-translate-x-px labui:items-center labui:gap-2 labui:overflow-hidden labui:rounded-md labui:px-2 labui:text-sidebar-foreground labui:ring-sidebar-ring labui:outline-hidden labui:hover:bg-sidebar-accent labui:hover:text-sidebar-accent-foreground labui:focus-visible:ring-2 labui:active:bg-sidebar-accent labui:active:text-sidebar-accent-foreground labui:disabled:pointer-events-none labui:disabled:opacity-50 labui:aria-disabled:pointer-events-none labui:aria-disabled:opacity-50 labui:[&>span:last-child]:truncate labui:[&>svg]:size-4 labui:[&>svg]:shrink-0 labui:[&>svg]:text-sidebar-accent-foreground",
        "labui:data-[active=true]:bg-sidebar-accent labui:data-[active=true]:text-sidebar-accent-foreground",
        size === "sm" ? "labui:text-xs" : "labui:text-sm",
        "labui:group-data-[collapsible=icon]:hidden",
        className,
      )}
      {...props}
    />
  );
});

export {
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
  useSidebar,
};
