import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "./classes.js";

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root>
>(function Tabs({ className, orientation = "horizontal", ...props }, ref) {
  return (
    <TabsPrimitive.Root
      ref={ref}
      data-slot="tabs"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "labui:group/tabs labui:flex labui:gap-2 labui:data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    />
  );
});

const tabsListVariants = {
  default: "labui:bg-muted",
  line: "labui:gap-1 labui:bg-transparent",
};

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    variant?: keyof typeof tabsListVariants;
  }
>(function TabsList({ className, variant = "default", ...props }, ref) {
  return (
    <TabsPrimitive.List
      ref={ref}
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(
        "labui:group/tabs-list labui:inline-flex labui:w-fit labui:items-center labui:justify-center labui:rounded-lg labui:p-[3px] labui:text-muted-foreground labui:group-data-[orientation=horizontal]/tabs:h-9 labui:group-data-[orientation=vertical]/tabs:h-fit labui:group-data-[orientation=vertical]/tabs:flex-col labui:data-[variant=line]:rounded-none",
        tabsListVariants[variant],
        className,
      )}
      {...props}
    />
  );
});

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(function TabsTrigger({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      data-slot="tabs-trigger"
      className={cn(
        "labui:relative labui:inline-flex labui:h-[calc(100%-1px)] labui:flex-1 labui:items-center labui:justify-center labui:gap-1.5 labui:rounded-md labui:border labui:border-transparent labui:px-2 labui:py-1 labui:text-sm labui:font-medium labui:whitespace-nowrap labui:text-foreground/60 labui:transition-all labui:group-data-[orientation=vertical]/tabs:w-full labui:group-data-[orientation=vertical]/tabs:justify-start labui:hover:text-foreground labui:focus-visible:border-ring labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50 labui:focus-visible:outline-1 labui:focus-visible:outline-ring labui:disabled:pointer-events-none labui:disabled:opacity-50 labui:group-data-[variant=default]/tabs-list:data-[state=active]:shadow-sm labui:group-data-[variant=line]/tabs-list:data-[state=active]:shadow-none labui:dark:text-muted-foreground labui:dark:hover:text-foreground labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0 labui:[&_svg:not([class*='size-'])]:size-4",
        "labui:group-data-[variant=line]/tabs-list:bg-transparent labui:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent labui:dark:group-data-[variant=line]/tabs-list:data-[state=active]:border-transparent labui:dark:group-data-[variant=line]/tabs-list:data-[state=active]:bg-transparent",
        "labui:data-[state=active]:bg-background labui:data-[state=active]:text-foreground labui:dark:data-[state=active]:border-input labui:dark:data-[state=active]:bg-input/30 labui:dark:data-[state=active]:text-foreground",
        "labui:after:absolute labui:after:bg-foreground labui:after:opacity-0 labui:after:transition-opacity labui:group-data-[orientation=horizontal]/tabs:after:inset-x-0 labui:group-data-[orientation=horizontal]/tabs:after:bottom-[-5px] labui:group-data-[orientation=horizontal]/tabs:after:h-0.5 labui:group-data-[orientation=vertical]/tabs:after:inset-y-0 labui:group-data-[orientation=vertical]/tabs:after:-right-1 labui:group-data-[orientation=vertical]/tabs:after:w-0.5 labui:group-data-[variant=line]/tabs-list:data-[state=active]:after:opacity-100",
        className,
      )}
      {...props}
    />
  );
});

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(function TabsContent({ className, ...props }, ref) {
  return (
    <TabsPrimitive.Content
      ref={ref}
      data-slot="tabs-content"
      className={cn("labui:flex-1 labui:outline-none", className)}
      {...props}
    />
  );
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
