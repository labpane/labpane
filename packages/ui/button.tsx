import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn, focusRing, invalidRing } from "./classes.js";

const raisedButtonSurface = [
  "labui:border labui:border-border labui:border-b-input labui:bg-card labui:bg-linear-to-b labui:from-card labui:to-muted labui:text-foreground",
  "labui:shadow-[inset_0_1px_0_#ffffff,0_1px_1px_#00000014,0_3px_4px_#0000000d]",
  "labui:hover:to-background labui:hover:shadow-[inset_0_1px_0_#ffffff,0_2px_3px_#0000001a,0_4px_6px_#0000000d]",
  "labui:active:translate-y-px labui:active:from-muted labui:active:to-card labui:active:shadow-[inset_0_1px_2px_#0000001a,0_1px_0_#ffffff80]",
  "labui:dark:border-foreground/15 labui:dark:border-b-foreground/10 labui:dark:bg-secondary labui:dark:from-[color-mix(in_srgb,var(--labui-secondary)_88%,var(--labui-foreground))] labui:dark:to-secondary labui:dark:text-popover-foreground",
  "labui:dark:shadow-[inset_0_1px_0_#ffffff14,0_1px_2px_#00000026]",
  "labui:dark:hover:border-foreground/25 labui:dark:hover:from-[color-mix(in_srgb,var(--labui-secondary)_82%,var(--labui-foreground))] labui:dark:hover:to-secondary labui:dark:hover:shadow-[inset_0_1px_0_#ffffff1f,0_2px_4px_#00000033]",
  "labui:dark:active:from-secondary labui:dark:active:to-secondary labui:dark:active:shadow-[inset_0_1px_2px_#00000033,0_1px_0_#ffffff0a]",
  "labui:disabled:bg-secondary labui:disabled:bg-none labui:disabled:shadow-none labui:dark:disabled:shadow-none",
].join(" ");

const buttonVariants = {
  default:
    "labui:border labui:border-transparent labui:bg-primary labui:text-primary-foreground labui:shadow-xs labui:hover:bg-primary/90 labui:active:translate-y-px",
  destructive:
    "labui:border labui:border-transparent labui:bg-destructive-muted labui:text-destructive labui:hover:border-destructive/20 labui:hover:bg-destructive/15 labui:focus-visible:ring-destructive/20 labui:dark:focus-visible:ring-destructive/40",
  outline:
    "labui:border labui:bg-background labui:shadow-xs labui:hover:bg-accent labui:hover:text-accent-foreground labui:dark:border-input labui:dark:bg-input/30 labui:dark:hover:bg-input/50",
  secondary: raisedButtonSurface,
  ghost:
    "labui:hover:bg-accent labui:hover:text-accent-foreground labui:dark:hover:bg-accent/50",
  link: "labui:text-link labui:underline-offset-4 labui:hover:underline",
};

const buttonSizes = {
  default:
    "labui:h-(--labui-control-height) labui:px-4 labui:py-2 labui:has-[>svg]:px-3",
  xs: "labui:h-6 labui:gap-1 labui:rounded-md labui:px-2 labui:text-xs labui:has-[>svg]:px-1.5 labui:[&_svg:not([class*='size-'])]:size-3",
  sm: "labui:h-(--labui-control-height-sm) labui:gap-1.5 labui:rounded-md labui:px-3 labui:has-[>svg]:px-2.5",
  lg: "labui:h-11 labui:rounded-md labui:px-6 labui:has-[>svg]:px-4",
  icon: "labui:size-(--labui-control-height)",
  "icon-xs":
    "labui:size-6 labui:rounded-md labui:[&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "labui:size-(--labui-control-height-sm)",
  "icon-lg": "labui:size-11",
};

export type ButtonVariant = keyof typeof buttonVariants;
export type ButtonSize = keyof typeof buttonSizes;

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    variant?: ButtonVariant | null;
    size?: ButtonSize | null;
    asChild?: boolean;
  }
>(function Button(
  {
    className,
    variant = "default",
    size = "default",
    asChild = false,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      ref={ref}
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(
        "labui:inline-flex labui:shrink-0 labui:items-center labui:justify-center labui:gap-2 labui:rounded-md",
        "labui:text-sm labui:font-medium labui:whitespace-nowrap labui:transition-all labui:outline-none",
        "labui:disabled:pointer-events-none labui:disabled:opacity-50",
        focusRing,
        invalidRing,
        "labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0 labui:[&_svg:not([class*='size-'])]:size-4",
        variant && buttonVariants[variant],
        size && buttonSizes[size],
        className,
      )}
      {...props}
    />
  );
});

export { Button };
