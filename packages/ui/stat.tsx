import * as React from "react";
import { cn } from "./classes.js";

const Stats = React.forwardRef<
  HTMLDListElement,
  React.ComponentPropsWithoutRef<"dl">
>(function Stats({ className, ...props }, ref) {
  return (
    <dl
      ref={ref}
      data-slot="stats"
      className={cn(
        "labui:grid labui:gap-3 labui:sm:grid-cols-2 labui:lg:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]",
        className,
      )}
      {...props}
    />
  );
});

const Stat = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function Stat({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="stat"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-col labui:gap-1 labui:rounded-lg labui:border labui:bg-card labui:px-4 labui:py-3 labui:text-card-foreground",
        className,
      )}
      {...props}
    />
  );
});

const StatLabel = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"dt">
>(function StatLabel({ className, ...props }, ref) {
  return (
    <dt
      ref={ref}
      data-slot="stat-label"
      className={cn(
        "labui:text-xs labui:font-medium labui:tracking-wide labui:text-muted-foreground labui:uppercase",
        className,
      )}
      {...props}
    />
  );
});

const StatValue = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"dd">
>(function StatValue({ className, ...props }, ref) {
  return (
    <dd
      ref={ref}
      data-slot="stat-value"
      className={cn(
        "labui:truncate labui:text-xl labui:font-semibold labui:tracking-tight labui:tabular-nums",
        className,
      )}
      {...props}
    />
  );
});

const StatDetail = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"dd">
>(function StatDetail({ className, ...props }, ref) {
  return (
    <dd
      ref={ref}
      data-slot="stat-detail"
      className={cn(
        "labui:truncate labui:text-xs labui:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

export { Stats, Stat, StatLabel, StatValue, StatDetail };
