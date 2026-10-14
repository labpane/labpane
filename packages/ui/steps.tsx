import * as React from "react";
import { cn } from "./classes.js";

const Steps = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav">
>(function Steps({ className, ...props }, ref) {
  return (
    <nav
      ref={ref}
      data-slot="steps"
      className={cn("labui:flex labui:flex-col labui:gap-1", className)}
      {...props}
    />
  );
});

const Step = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & { active?: boolean; index: number }
>(function Step({ active = false, index, className, children, ...props }, ref) {
  return (
    <button
      ref={ref}
      type="button"
      data-slot="step"
      data-state={active ? "active" : "inactive"}
      aria-current={active ? "step" : undefined}
      className={cn(
        "labui:flex labui:items-center labui:gap-3 labui:rounded-md labui:px-2 labui:py-2 labui:text-left labui:text-sm labui:text-muted-foreground labui:transition-colors labui:outline-none labui:hover:text-foreground labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50 labui:data-[state=active]:font-semibold labui:data-[state=active]:text-foreground",
        className,
      )}
      {...props}
    >
      <span
        data-slot="step-index"
        className="labui:grid labui:size-6 labui:shrink-0 labui:place-items-center labui:rounded-full labui:border labui:font-mono labui:text-[10px] labui:tabular-nums labui:[[data-state=active]>&]:border-primary labui:[[data-state=active]>&]:bg-primary labui:[[data-state=active]>&]:text-primary-foreground"
      >
        {String(index).padStart(2, "0")}
      </span>
      {children}
    </button>
  );
});

export { Steps, Step };
