import * as React from "react";
import { cn } from "./classes.js";

const Topbar = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"header">
>(function Topbar({ className, ...props }, ref) {
  return (
    <header
      ref={ref}
      data-slot="topbar"
      className={cn(
        "labui:flex labui:min-h-(--labui-topbar-height) labui:shrink-0 labui:flex-wrap labui:items-center labui:justify-between labui:gap-x-4 labui:gap-y-2 labui:border-b labui:bg-background labui:px-4 labui:py-1.5",
        className,
      )}
      {...props}
    />
  );
});

const TopbarActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function TopbarActions({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="topbar-actions"
      className={cn(
        "labui:flex labui:min-w-0 labui:max-w-full labui:flex-wrap labui:items-center labui:gap-2",
        className,
      )}
      {...props}
    />
  );
});

export { Topbar, TopbarActions };
