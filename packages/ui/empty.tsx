import * as React from "react";
import { cn } from "./classes.js";

const Empty = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function Empty({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="empty"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-1 labui:flex-col labui:items-center labui:justify-center labui:gap-6 labui:rounded-lg labui:border-dashed labui:p-6 labui:text-center labui:text-balance labui:md:p-12",
        className,
      )}
      {...props}
    />
  );
});

const EmptyHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function EmptyHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="empty-header"
      className={cn(
        "labui:flex labui:max-w-sm labui:flex-col labui:items-center labui:gap-2 labui:text-center",
        className,
      )}
      {...props}
    />
  );
});

const emptyMediaVariants = {
  default: "labui:bg-transparent",
  icon: "labui:flex labui:size-10 labui:shrink-0 labui:items-center labui:justify-center labui:rounded-lg labui:bg-muted labui:text-foreground labui:[&_svg:not([class*='size-'])]:size-6",
};

const EmptyMedia = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    variant?: keyof typeof emptyMediaVariants;
  }
>(function EmptyMedia({ className, variant = "default", ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="empty-media"
      data-variant={variant}
      className={cn(
        "labui:mb-2 labui:flex labui:shrink-0 labui:items-center labui:justify-center labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0",
        emptyMediaVariants[variant],
        className,
      )}
      {...props}
    />
  );
});

const EmptyTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function EmptyTitle({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="empty-title"
      className={cn(
        "labui:text-lg labui:font-medium labui:tracking-tight",
        className,
      )}
      {...props}
    />
  );
});

const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(function EmptyDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="empty-description"
      className={cn(
        "labui:text-sm/relaxed labui:text-muted-foreground labui:[&>a]:underline labui:[&>a]:underline-offset-4 labui:[&>a:hover]:text-link",
        className,
      )}
      {...props}
    />
  );
});

const EmptyContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function EmptyContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="empty-content"
      className={cn(
        "labui:flex labui:w-full labui:max-w-sm labui:min-w-0 labui:flex-col labui:items-center labui:gap-4 labui:text-sm labui:text-balance",
        className,
      )}
      {...props}
    />
  );
});

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
};
