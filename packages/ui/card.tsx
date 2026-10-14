import * as React from "react";
import { cn } from "./classes.js";

const Card = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function Card({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn(
        "labui:flex labui:flex-col labui:gap-(--labui-card-gap) labui:rounded-xl labui:border labui:bg-card labui:py-(--labui-card-py) labui:text-card-foreground labui:shadow-sm",
        className,
      )}
      {...props}
    />
  );
});

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { bordered?: boolean }
>(function CardHeader({ className, bordered, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-header"
      data-bordered={bordered || undefined}
      className={cn(
        "labui:@container/card-header labui:grid labui:auto-rows-min labui:grid-rows-[auto_auto] labui:items-start labui:gap-2 labui:px-(--labui-card-px) labui:has-data-[slot=card-action]:grid-cols-[1fr_auto] labui:data-[bordered]:border-b labui:data-[bordered]:pb-4",
        className,
      )}
      {...props}
    />
  );
});

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h2"> & { as?: "h2" | "h3" | "h4" | "div" }
>(function CardTitle({ as: Comp = "h2", className, ...props }, ref) {
  return (
    <Comp
      ref={ref}
      data-slot="card-title"
      className={cn(
        "labui:text-base labui:leading-none labui:font-semibold",
        className,
      )}
      {...props}
    />
  );
});

const CardDescription = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function CardDescription({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-description"
      className={cn("labui:text-sm labui:text-muted-foreground", className)}
      {...props}
    />
  );
});

const CardAction = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function CardAction({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-action"
      className={cn(
        "labui:col-start-2 labui:row-span-2 labui:row-start-1 labui:self-start labui:justify-self-end",
        className,
      )}
      {...props}
    />
  );
});

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function CardContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-content"
      className={cn("labui:px-(--labui-card-px)", className)}
      {...props}
    />
  );
});

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { bordered?: boolean }
>(function CardFooter({ className, bordered, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="card-footer"
      data-bordered={bordered || undefined}
      className={cn(
        "labui:flex labui:items-center labui:px-(--labui-card-px) labui:data-[bordered]:border-t labui:data-[bordered]:pt-4",
        className,
      )}
      {...props}
    />
  );
});

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
