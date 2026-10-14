import * as React from "react";
import { cn } from "./classes.js";
import { Sidebar, SidebarMenuButton } from "./sidebar.js";

const Rail = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<typeof Sidebar>, "collapsible">
>(function Rail({ className, ...props }, ref) {
  return (
    <Sidebar
      ref={ref}
      collapsible="none"
      data-slot="rail"
      className={cn(
        "labui:sticky labui:top-0 labui:h-svh labui:w-[4.75rem] labui:shrink-0 labui:border-r labui:border-sidebar-border",
        className,
      )}
      {...props}
    />
  );
});

const RailItem = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof SidebarMenuButton>, "isActive"> & {
    active?: boolean;
  }
>(function RailItem({ active = false, className, ...props }, ref) {
  return (
    <SidebarMenuButton
      ref={ref}
      data-slot="rail-item"
      isActive={active}
      className={cn(
        "labui:relative labui:h-auto labui:flex-col labui:items-center labui:justify-center labui:gap-1 labui:rounded-lg labui:px-1 labui:py-2 labui:text-[10px] labui:leading-none labui:font-medium labui:tracking-tight labui:[&>svg]:size-5 labui:[&>span:last-child]:truncate",
        "labui:before:absolute labui:before:inset-y-2 labui:before:left-0 labui:before:w-0.5 labui:before:rounded-full labui:before:bg-sidebar-primary labui:before:opacity-0 labui:before:transition-opacity labui:data-[active=true]:before:opacity-100",
        className,
      )}
      {...props}
    />
  );
});

export { Rail, RailItem };
