import * as React from "react";
import { Loader2Icon } from "lucide-react";
import { cn } from "./classes.js";

const Spinner = React.forwardRef<
  SVGSVGElement,
  React.ComponentPropsWithoutRef<"svg">
>(function Spinner({ className, ...props }, ref) {
  return (
    <Loader2Icon
      ref={ref}
      role="status"
      aria-label="Loading"
      className={cn("labui:size-4 labui:animate-spin", className)}
      {...props}
    />
  );
});

export { Spinner };
