import * as React from "react";
import { cn } from "./classes.js";

const Separator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    orientation?: "horizontal" | "vertical";
    decorative?: boolean;
  }
>(function Separator(
  { className, orientation = "horizontal", decorative = true, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="separator"
      data-orientation={orientation}
      role={decorative ? "none" : "separator"}
      aria-orientation={
        !decorative && orientation === "vertical" ? orientation : undefined
      }
      className={cn(
        "labui:shrink-0 labui:bg-border",
        "labui:data-[orientation=horizontal]:h-px labui:data-[orientation=horizontal]:w-full",
        "labui:data-[orientation=vertical]:h-full labui:data-[orientation=vertical]:w-px",
        className,
      )}
      {...props}
    />
  );
});

export { Separator };
