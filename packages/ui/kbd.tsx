import * as React from "react";
import { cn } from "./classes.js";

const Kbd = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"kbd">
>(function Kbd({ className, ...props }, ref) {
  return (
    <kbd
      ref={ref}
      data-slot="kbd"
      className={cn(
        "labui:pointer-events-none labui:inline-flex labui:h-5 labui:w-fit labui:min-w-5 labui:items-center labui:justify-center labui:gap-1 labui:rounded-sm labui:bg-muted labui:px-1 labui:font-sans labui:text-xs labui:font-medium labui:text-muted-foreground labui:select-none",
        "labui:[&_svg:not([class*='size-'])]:size-3",
        "labui:[[data-slot=tooltip-content]_&]:bg-background/20 labui:[[data-slot=tooltip-content]_&]:text-background",
        className,
      )}
      {...props}
    />
  );
});

const KbdGroup = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"kbd">
>(function KbdGroup({ className, ...props }, ref) {
  return (
    <kbd
      ref={ref}
      data-slot="kbd-group"
      className={cn(
        "labui:inline-flex labui:items-center labui:gap-1",
        className,
      )}
      {...props}
    />
  );
});

export { Kbd, KbdGroup };
