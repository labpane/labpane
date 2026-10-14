import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "./classes.js";

function moveFocus(nav: HTMLElement, step: 1 | -1) {
  const tabs = [...nav.querySelectorAll<HTMLElement>("[data-slot=nav-tab]")];
  if (!tabs.length) return;
  const index = tabs.indexOf(document.activeElement as HTMLElement);
  const next = index < 0 ? 0 : (index + step + tabs.length) % tabs.length;
  tabs[next]?.focus();
}

const NavTabs = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav">
>(function NavTabs({ className, onKeyDown, ...props }, ref) {
  return (
    // oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- arrow keys move between the tabs
    <nav
      ref={ref}
      data-slot="nav-tabs"
      className={cn(
        "labui:flex labui:gap-1 labui:overflow-x-auto labui:border-b labui:pb-1 labui:[scrollbar-width:none]",
        className,
      )}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        event.preventDefault();
        moveFocus(event.currentTarget, event.key === "ArrowRight" ? 1 : -1);
      }}
      {...props}
    />
  );
});

const NavTab = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { active?: boolean; asChild?: boolean }
>(function NavTab(
  { active = false, asChild = false, className, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      data-slot="nav-tab"
      data-state={active ? "active" : "inactive"}
      aria-current={active ? "page" : undefined}
      className={cn(
        "labui:relative labui:inline-flex labui:h-8 labui:shrink-0 labui:items-center labui:gap-1.5 labui:rounded-md labui:px-3 labui:text-sm labui:font-medium labui:whitespace-nowrap labui:text-muted-foreground labui:transition-colors labui:outline-none labui:hover:bg-accent/60 labui:hover:text-foreground labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50 labui:data-[state=active]:text-foreground",
        "labui:after:absolute labui:after:inset-x-2 labui:after:-bottom-[5px] labui:after:h-0.5 labui:after:rounded-full labui:after:bg-primary labui:after:opacity-0 labui:after:transition-opacity labui:data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
});

export { NavTabs, NavTab };
