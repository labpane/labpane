import * as React from "react";
import { cn } from "./classes.js";

const alertVariants = {
  default: "labui:bg-card labui:text-card-foreground",
  destructive:
    "labui:border-destructive/40 labui:bg-card labui:text-destructive labui:*:data-[slot=alert-description]:text-destructive/90 labui:[&>svg]:text-current",
  warning:
    "labui:border-warning/40 labui:bg-card labui:text-foreground labui:[&>svg]:text-warning",
  success:
    "labui:border-success/40 labui:bg-card labui:text-foreground labui:[&>svg]:text-success",
};

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    variant?: keyof typeof alertVariants | null;
  }
>(function Alert({ className, variant = "default", ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="alert"
      role="alert"
      className={cn(
        "labui:relative labui:grid labui:w-full labui:grid-cols-[0_1fr] labui:items-start labui:gap-y-0.5 labui:rounded-lg labui:border labui:px-4 labui:py-3 labui:text-sm labui:has-[>svg]:grid-cols-[--spacing(4)_1fr] labui:has-[>svg]:gap-x-3 labui:[&>svg]:size-4 labui:[&>svg]:translate-y-0.5 labui:[&>svg]:text-current",
        variant && alertVariants[variant],
        className,
      )}
      {...props}
    />
  );
});

const AlertTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function AlertTitle({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="alert-title"
      className={cn(
        "labui:col-start-2 labui:line-clamp-1 labui:min-h-4 labui:font-medium labui:tracking-tight",
        className,
      )}
      {...props}
    />
  );
});

const AlertDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function AlertDescription({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="alert-description"
      className={cn(
        "labui:col-start-2 labui:grid labui:justify-items-start labui:gap-1 labui:text-sm labui:text-muted-foreground labui:[&_p]:leading-relaxed",
        className,
      )}
      {...props}
    />
  );
});

export { Alert, AlertTitle, AlertDescription };
