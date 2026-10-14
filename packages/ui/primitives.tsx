import * as React from "react";
import {
  ArrowLeftIcon,
  CheckIcon,
  ChevronDownIcon,
  CopyIcon,
  Loader2Icon,
} from "lucide-react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Slot } from "@radix-ui/react-slot";

import { cn } from "./classes.js";
export { cn } from "./classes.js";

export function PageActions({ children }: { children?: React.ReactNode }) {
  return (
    <div className="labui:ml-auto labui:flex labui:max-w-full labui:flex-wrap labui:items-center labui:justify-end labui:gap-2 labui:[--labui-control-height:2.25rem] labui:empty:hidden labui:[@media(pointer:coarse)]:[--labui-control-height:2.75rem]">
      {children}
    </div>
  );
}
export function PageHeader({
  title,
  actions,
}: {
  title: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="labui:flex labui:flex-wrap labui:items-center labui:gap-3">
      <h1 className="labui:font-display labui:text-2xl labui:font-bold labui:tracking-tight">
        {title}
      </h1>
      <PageActions>{actions}</PageActions>
    </header>
  );
}
export function Page({
  title,
  actions,
  className,
  children,
}: {
  title?: string;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-col labui:gap-4",
        className,
      )}
    >
      {title && <PageHeader title={title} actions={actions} />}
      {children}
    </div>
  );
}

const focusRing =
  "labui:focus-visible:border-ring labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50";
const invalidRing =
  "labui:aria-invalid:border-destructive labui:aria-invalid:ring-destructive/20 labui:dark:aria-invalid:ring-destructive/40";

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
  secondary: raisedButtonSurface,
  ghost:
    "labui:hover:bg-accent labui:hover:text-accent-foreground labui:dark:hover:bg-accent/50",
  link: "labui:text-link labui:underline-offset-4 labui:hover:underline",
};
const buttonSizes = {
  default:
    "labui:h-(--labui-control-height) labui:px-4 labui:py-2 labui:has-[>svg]:px-3",
  sm: "labui:h-(--labui-control-height-sm) labui:gap-1.5 labui:rounded-md labui:px-3 labui:has-[>svg]:px-2.5",
  "icon-xs":
    "labui:size-6 labui:rounded-md labui:[&_svg:not([class*='size-'])]:size-3",
  "icon-sm": "labui:size-(--labui-control-height-sm)",
};

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<"button"> & {
    variant?: keyof typeof buttonVariants | null;
    size?: keyof typeof buttonSizes | null;
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

const badgeVariants = {
  default:
    "labui:bg-primary labui:text-primary-foreground labui:[a&]:hover:bg-primary/90",
  destructive:
    "labui:border-destructive/30 labui:bg-destructive/15 labui:text-destructive labui:focus-visible:ring-destructive/20 labui:[a&]:hover:bg-destructive/25",
  success:
    "labui:border-success/30 labui:bg-success/15 labui:text-success labui:[a&]:hover:bg-success/25",
  warning:
    "labui:border-warning/30 labui:bg-warning/15 labui:text-warning labui:[a&]:hover:bg-warning/25",
};

const Badge = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span"> & {
    variant?: keyof typeof badgeVariants | null;
  }
>(function Badge({ className, variant = "default", ...props }, ref) {
  return (
    <span
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

const alertVariants = {
  destructive:
    "labui:border-destructive/40 labui:bg-card labui:text-destructive labui:*:data-[slot=alert-description]:text-destructive/90 labui:[&>svg]:text-current",
  warning:
    "labui:border-warning/40 labui:bg-card labui:text-foreground labui:[&>svg]:text-warning",
};

const Alert = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    variant?: keyof typeof alertVariants | null;
  }
>(function Alert({ className, variant, ...props }, ref) {
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

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function Input({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      autoComplete="off"
      data-slot="input"
      className={cn(
        "labui:h-(--labui-control-height) labui:w-full labui:min-w-0 labui:rounded-md labui:border labui:border-input",
        "labui:bg-input-background labui:px-(--labui-control-px) labui:py-1 labui:shadow-xs",
        "labui:text-base labui:md:text-sm labui:placeholder:text-muted-foreground labui:transition-[color,box-shadow] labui:outline-none",
        "labui:selection:bg-primary labui:selection:text-primary-foreground",
        "labui:file:me-3 labui:file:inline-flex labui:file:h-7 labui:file:border-0 labui:file:bg-transparent",
        "labui:file:text-sm labui:file:font-medium labui:file:text-foreground",
        "labui:disabled:pointer-events-none labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
        focusRing,
        invalidRing,
        "labui:[&::-webkit-search-cancel-button]:appearance-none labui:[&::-webkit-search-decoration]:appearance-none labui:[&::-webkit-search-results-button]:appearance-none",
        "labui:[&::-webkit-calendar-picker-indicator]:opacity-60 labui:[&::-webkit-datetime-edit]:leading-none",
        className,
      )}
      {...props}
    />
  );
});

export { Input };

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "labui:peer labui:size-4 labui:shrink-0 labui:rounded-[4px] labui:border labui:border-input labui:dark:bg-input/30",
        "labui:shadow-xs labui:transition-shadow labui:outline-none",
        "labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
        "labui:data-[state=checked]:border-primary labui:data-[state=checked]:bg-primary labui:data-[state=checked]:text-primary-foreground labui:dark:data-[state=checked]:bg-primary",
        focusRing,
        invalidRing,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="labui:grid labui:place-content-center labui:text-current labui:transition-none"
      >
        <CheckIcon className="labui:size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export { Checkbox };

const Field = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { orientation?: "horizontal" }
>(function Field({ className, orientation, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="group"
      className={cn(
        "labui:flex labui:w-full labui:gap-3 labui:data-[invalid=true]:text-destructive",
        orientation ? "labui:items-center" : "labui:flex-col",
        className,
      )}
      {...props}
    />
  );
});

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(function FieldLabel({ className, ...props }, ref) {
  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- callers pass htmlFor
    <label
      ref={ref}
      className={cn(
        "labui:flex labui:w-fit labui:items-center labui:gap-2 labui:text-sm labui:leading-snug labui:font-medium labui:select-none",
        className,
      )}
      {...props}
    />
  );
});

const FieldError = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FieldError({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      role="alert"
      className={cn("labui:text-sm labui:text-destructive", className)}
      {...props}
    />
  );
});

export { Field, FieldLabel, FieldError };

function Select(props: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />;
}

function SelectValue(
  props: React.ComponentProps<typeof SelectPrimitive.Value>,
) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />;
}

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger> & {
    size?: "sm" | "default";
  }
>(function SelectTrigger(
  { className, size = "default", children, ...props },
  ref,
) {
  return (
    <SelectPrimitive.Trigger
      ref={ref}
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "labui:flex labui:h-(--labui-control-height) labui:w-full labui:min-w-0 labui:items-center labui:justify-between labui:gap-2",
        "labui:rounded-md labui:border labui:border-input labui:bg-input-background labui:px-(--labui-control-px) labui:shadow-xs",
        "labui:text-sm labui:whitespace-nowrap labui:transition-[color,box-shadow] labui:outline-none labui:data-[placeholder]:text-muted-foreground",
        "labui:data-[size=sm]:h-(--labui-control-height-sm) labui:data-[size=sm]:px-2 labui:data-[size=sm]:text-xs",
        focusRing,
        invalidRing,
        "labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
        "labui:*:data-[slot=select-value]:truncate labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0",
        className,
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="labui:size-4 labui:text-muted-foreground" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
});

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(function SelectContent({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        ref={ref}
        data-slot="select-content"
        position="popper"
        sideOffset={4}
        className={cn(
          "labui:relative labui:z-50 labui:max-h-(--radix-select-content-available-height) labui:min-w-(--radix-select-trigger-width) labui:overflow-x-hidden labui:overflow-y-auto labui:rounded-lg labui:border labui:bg-popover/90 labui:p-1 labui:text-popover-foreground labui:shadow-lg labui:backdrop-blur-xl labui:backdrop-saturate-150",
          className,
        )}
        {...props}
      >
        <SelectPrimitive.Viewport>
          {React.Children.toArray(children).length ? (
            children
          ) : (
            <p className="labui:p-2 labui:text-sm labui:text-muted-foreground">
              Empty
            </p>
          )}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  );
});

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(function SelectItem({ className, children, ...props }, ref) {
  return (
    <SelectPrimitive.Item
      ref={ref}
      data-slot="select-item"
      className={cn(
        "labui:relative labui:flex labui:w-full labui:cursor-default labui:items-center labui:rounded-md labui:py-1.5 labui:pr-8 labui:pl-2 labui:text-sm labui:outline-none labui:select-none labui:data-[disabled]:pointer-events-none labui:data-[disabled]:opacity-50 labui:data-[highlighted]:bg-accent labui:data-[highlighted]:text-accent-foreground",
        className,
      )}
      {...props}
    >
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
      <SelectPrimitive.ItemIndicator className="labui:absolute labui:right-2 labui:flex labui:items-center">
        <CheckIcon className="labui:size-4 labui:text-primary" />
      </SelectPrimitive.ItemIndicator>
    </SelectPrimitive.Item>
  );
});

export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue };

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

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-label={label}
      title={label}
      onClick={() =>
        navigator.clipboard.writeText(value).then(() => setCopied(true))
      }
    >
      {copied ? <CheckIcon /> : <CopyIcon />}
    </Button>
  );
}

export function Back({
  label,
  ...props
}: React.ComponentProps<"a"> & { label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="labui:-ml-2.5 labui:self-start"
      asChild
    >
      <a {...props}>
        <ArrowLeftIcon />
        {label}
      </a>
    </Button>
  );
}
