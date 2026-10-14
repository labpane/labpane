import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRightIcon, EllipsisIcon } from "lucide-react";
import { cn } from "./classes.js";

const Breadcrumb = React.forwardRef<
  HTMLElement,
  React.ComponentPropsWithoutRef<"nav">
>(function Breadcrumb(props, ref) {
  return (
    <nav ref={ref} aria-label="Breadcrumb" data-slot="breadcrumb" {...props} />
  );
});

const BreadcrumbList = React.forwardRef<
  HTMLOListElement,
  React.ComponentPropsWithoutRef<"ol">
>(function BreadcrumbList({ className, ...props }, ref) {
  return (
    <ol
      ref={ref}
      data-slot="breadcrumb-list"
      className={cn(
        "labui:flex labui:list-none labui:flex-wrap labui:items-center labui:gap-1.5 labui:text-sm labui:break-words labui:text-muted-foreground labui:sm:gap-2.5",
        className,
      )}
      {...props}
    />
  );
});

const BreadcrumbItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function BreadcrumbItem({ className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-slot="breadcrumb-item"
      className={cn(
        "labui:inline-flex labui:items-center labui:gap-1.5",
        className,
      )}
      {...props}
    />
  );
});

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(function BreadcrumbLink({ asChild, className, ...props }, ref) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      ref={ref}
      data-slot="breadcrumb-link"
      className={cn(
        "labui:transition-colors labui:hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
});

const BreadcrumbPage = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function BreadcrumbPage({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-slot="breadcrumb-page"
      aria-current="page"
      className={cn("labui:font-normal labui:text-foreground", className)}
      {...props}
    />
  );
});

const BreadcrumbSeparator = React.forwardRef<
  HTMLLIElement,
  React.ComponentPropsWithoutRef<"li">
>(function BreadcrumbSeparator({ children, className, ...props }, ref) {
  return (
    <li
      ref={ref}
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("labui:[&>svg]:size-3.5", className)}
      {...props}
    >
      {children ?? <ChevronRightIcon />}
    </li>
  );
});

const BreadcrumbEllipsis = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function BreadcrumbEllipsis({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      aria-hidden="true"
      className={cn(
        "labui:flex labui:size-9 labui:items-center labui:justify-center",
        className,
      )}
      {...props}
    >
      <EllipsisIcon className="labui:size-4" />
      <span className="labui:sr-only">More</span>
    </span>
  );
});

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
