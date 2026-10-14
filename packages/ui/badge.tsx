import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn, focusRing, invalidRing } from "./classes.js";

const badgeVariants = {
  default:
    "labui:bg-primary labui:text-primary-foreground labui:[a&]:hover:bg-primary/90",
  secondary:
    "labui:bg-secondary labui:text-secondary-foreground labui:[a&]:hover:bg-secondary/90",
  destructive:
    "labui:border-destructive/30 labui:bg-destructive/15 labui:text-destructive labui:focus-visible:ring-destructive/20 labui:[a&]:hover:bg-destructive/25",
  success:
    "labui:border-success/30 labui:bg-success/15 labui:text-success labui:[a&]:hover:bg-success/25",
  warning:
    "labui:border-warning/30 labui:bg-warning/15 labui:text-warning labui:[a&]:hover:bg-warning/25",
  info: "labui:border-info/30 labui:bg-info/15 labui:text-info labui:[a&]:hover:bg-info/25",
  outline:
    "labui:border-border labui:text-foreground labui:[a&]:hover:bg-accent labui:[a&]:hover:text-accent-foreground",
  ghost: "labui:[a&]:hover:bg-accent labui:[a&]:hover:text-accent-foreground",
  link: "labui:text-link labui:underline-offset-4 labui:[a&]:hover:underline",
};

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    variant?: keyof typeof badgeVariants | null;
    asChild?: boolean;
  }
>(function Badge(
  { className, variant = "default", asChild = false, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      ref={ref}
      data-slot="badge"
      data-variant={variant}
      className={cn(
        "labui:inline-flex labui:w-fit labui:shrink-0 labui:items-center labui:justify-center labui:gap-1 labui:overflow-hidden",
        "labui:rounded-full labui:border labui:border-transparent labui:px-2 labui:py-0.5",
        "labui:text-xs labui:font-medium labui:whitespace-nowrap labui:transition-[color,box-shadow]",
        focusRing,
        invalidRing,
        "labui:[&>svg]:pointer-events-none labui:[&>svg]:size-3",
        variant && badgeVariants[variant],
        className,
      )}
      {...props}
    />
  );
});

export { Badge };
