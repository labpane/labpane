import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { SearchIcon } from "lucide-react";
import { cn } from "./classes.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./dialog.js";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(function Command({ className, ...props }, ref) {
  return (
    <CommandPrimitive
      ref={ref}
      data-slot="command"
      className={cn(
        "labui:flex labui:h-full labui:w-full labui:flex-col labui:overflow-hidden labui:rounded-md labui:bg-popover labui:text-popover-foreground",
        className,
      )}
      {...props}
    />
  );
});

function CommandDialog({
  title = "Command palette",
  description = "Search for a command to run",
  children,
  className,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
  className?: string;
  showCloseButton?: boolean;
}) {
  return (
    <Dialog {...props}>
      <DialogContent
        className={cn("labui:overflow-hidden labui:p-0", className)}
        showCloseButton={showCloseButton}
      >
        <DialogHeader className="labui:sr-only">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Command className="labui:**:data-[slot=command-input-wrapper]:h-12 labui:[&_[cmdk-group-heading]]:px-2 labui:[&_[cmdk-group-heading]]:font-medium labui:[&_[cmdk-group-heading]]:text-muted-foreground labui:[&_[cmdk-group]]:px-2 labui:[&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 labui:[&_[cmdk-input-wrapper]_svg]:h-5 labui:[&_[cmdk-input-wrapper]_svg]:w-5 labui:[&_[cmdk-input]]:h-12 labui:[&_[cmdk-item]]:px-2 labui:[&_[cmdk-item]]:py-3 labui:[&_[cmdk-item]_svg]:h-5 labui:[&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(function CommandInput({ className, ...props }, ref) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="labui:flex labui:h-9 labui:items-center labui:gap-2 labui:border-b labui:px-3"
    >
      <SearchIcon className="labui:size-4 labui:shrink-0 labui:opacity-50" />
      <CommandPrimitive.Input
        ref={ref}
        data-slot="command-input"
        className={cn(
          "labui:flex labui:h-10 labui:w-full labui:rounded-md labui:bg-transparent labui:py-3 labui:text-sm labui:outline-hidden labui:placeholder:text-muted-foreground labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  );
});

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(function CommandList({ className, ...props }, ref) {
  return (
    <CommandPrimitive.List
      ref={ref}
      data-slot="command-list"
      className={cn(
        "labui:max-h-[300px] labui:scroll-py-1 labui:overflow-x-hidden labui:overflow-y-auto",
        className,
      )}
      {...props}
    />
  );
});

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(function CommandEmpty({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Empty
      ref={ref}
      data-slot="command-empty"
      className={cn("labui:py-6 labui:text-center labui:text-sm", className)}
      {...props}
    />
  );
});

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(function CommandGroup({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Group
      ref={ref}
      data-slot="command-group"
      className={cn(
        "labui:overflow-hidden labui:p-1 labui:text-foreground labui:[&_[cmdk-group-heading]]:px-2 labui:[&_[cmdk-group-heading]]:py-1.5 labui:[&_[cmdk-group-heading]]:text-xs labui:[&_[cmdk-group-heading]]:font-medium labui:[&_[cmdk-group-heading]]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(function CommandSeparator({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Separator
      ref={ref}
      data-slot="command-separator"
      className={cn("labui:-mx-1 labui:h-px labui:bg-border", className)}
      {...props}
    />
  );
});

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(function CommandItem({ className, ...props }, ref) {
  return (
    <CommandPrimitive.Item
      ref={ref}
      data-slot="command-item"
      className={cn(
        "labui:relative labui:flex labui:cursor-default labui:items-center labui:gap-2 labui:rounded-sm labui:px-2 labui:py-1.5 labui:text-sm labui:outline-hidden labui:select-none labui:data-[disabled=true]:pointer-events-none labui:data-[disabled=true]:opacity-50 labui:data-[selected=true]:bg-accent labui:data-[selected=true]:text-accent-foreground labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0 labui:[&_svg:not([class*='size-'])]:size-4 labui:[&_svg:not([class*='text-'])]:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

function CommandShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn(
        "labui:ml-auto labui:text-xs labui:tracking-widest labui:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
