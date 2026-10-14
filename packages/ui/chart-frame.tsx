import * as React from "react";
import { Card } from "./card.js";
import { cn } from "./classes.js";

/** Shared surface for interactive charts. Data loading belongs to the caller. */
const ChartFrame = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof Card>
>(function ChartFrame({ className, ...props }, ref) {
  return (
    <Card
      ref={ref}
      role="region"
      data-slot="chart-frame"
      className={cn(
        "labui:min-w-0 labui:gap-0 labui:overflow-hidden labui:py-0",
        className,
      )}
      {...props}
    />
  );
});

export { ChartFrame };
