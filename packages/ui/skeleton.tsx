import * as React from "react";
import { cn } from "./classes.js";

const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function Skeleton({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="skeleton"
      className={cn(
        "labui:animate-pulse labui:rounded-md labui:bg-accent",
        className,
      )}
      {...props}
    />
  );
});

export { Skeleton };
