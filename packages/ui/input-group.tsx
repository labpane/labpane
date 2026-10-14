import * as React from "react";
import { Button } from "./button.js";
import { cn } from "./classes.js";
import { Input } from "./input.js";
import { Textarea } from "./textarea.js";

const InputGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function InputGroup({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="input-group"
      role="group"
      className={cn(
        "labui:group/input-group labui:relative labui:flex labui:h-(--labui-control-height) labui:w-full labui:min-w-0 labui:items-center labui:rounded-md labui:border labui:border-input labui:bg-input-background labui:shadow-xs labui:transition-[color,box-shadow] labui:outline-none",
        "labui:has-[>textarea]:h-auto",
        "labui:has-[>[data-align=inline-start]]:[&>[data-slot=input-group-control]]:pl-2",
        "labui:has-[>[data-align=inline-end]]:[&>[data-slot=input-group-control]]:pr-2",
        "labui:has-[[data-slot=input-group-control]:focus-visible]:border-ring labui:has-[[data-slot=input-group-control]:focus-visible]:ring-[3px] labui:has-[[data-slot=input-group-control]:focus-visible]:ring-ring/50",
        "labui:has-[[data-slot][aria-invalid=true]]:border-destructive labui:has-[[data-slot][aria-invalid=true]]:ring-destructive/20 labui:dark:has-[[data-slot][aria-invalid=true]]:ring-destructive/40",
        className,
      )}
      {...props}
    />
  );
});

const addonAlignments = {
  "inline-start":
    "labui:order-first labui:pl-2.5 labui:has-[>button]:ml-[-0.45rem] labui:has-[>kbd]:ml-[-0.35rem]",
  "inline-end":
    "labui:order-last labui:pr-2.5 labui:has-[>button]:mr-[-0.4rem] labui:has-[>kbd]:mr-[-0.35rem]",
  "block-start":
    "labui:order-first labui:w-full labui:justify-start labui:px-3 labui:pt-3 labui:group-has-[>input]/input-group:pt-2.5 labui:[.labui\\:border-b]:pb-3",
  "block-end":
    "labui:order-last labui:w-full labui:justify-start labui:px-3 labui:pb-3 labui:group-has-[>input]/input-group:pb-2.5 labui:[.labui\\:border-t]:pt-3",
};

function focusControl(event: React.MouseEvent<HTMLDivElement>) {
  if ((event.target as HTMLElement).closest("button")) return;
  event.currentTarget.parentElement
    ?.querySelector<HTMLInputElement>("input, textarea")
    ?.focus();
}

const InputGroupAddon = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    align?: keyof typeof addonAlignments;
  }
>(function InputGroupAddon(
  { className, align = "inline-start", onClick, ...props },
  ref,
) {
  return (
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions -- a click on the addon focuses the control
    <div
      ref={ref}
      role="group"
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "labui:flex labui:h-auto labui:cursor-text labui:items-center labui:justify-center labui:gap-2 labui:py-1.5 labui:text-sm labui:font-medium labui:text-muted-foreground labui:select-none labui:group-data-[disabled=true]/input-group:opacity-50 labui:[&>kbd]:rounded-[calc(var(--labui-radius)-5px)] labui:[&>svg:not([class*='size-'])]:size-4",
        addonAlignments[align],
        className,
      )}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) focusControl(event);
      }}
      {...props}
    />
  );
});

const groupButtonSizes = {
  xs: "labui:h-6 labui:gap-1 labui:rounded-[calc(var(--labui-radius)-5px)] labui:px-2 labui:has-[>svg]:px-2 labui:[&>svg:not([class*='size-'])]:size-3.5",
  sm: "labui:h-8 labui:gap-1.5 labui:rounded-md labui:px-2.5 labui:has-[>svg]:px-2.5",
  "icon-xs":
    "labui:size-6 labui:rounded-[calc(var(--labui-radius)-5px)] labui:p-0 labui:has-[>svg]:p-0",
  "icon-sm": "labui:size-8 labui:p-0 labui:has-[>svg]:p-0",
};

const InputGroupButton = React.forwardRef<
  HTMLButtonElement,
  Omit<React.ComponentPropsWithoutRef<typeof Button>, "size"> & {
    size?: keyof typeof groupButtonSizes;
  }
>(function InputGroupButton(
  { className, type = "button", variant = "ghost", size = "xs", ...props },
  ref,
) {
  return (
    <Button
      ref={ref}
      type={type}
      data-size={size}
      variant={variant}
      size={null}
      className={cn(
        "labui:flex labui:items-center labui:gap-2 labui:text-sm labui:shadow-none",
        groupButtonSizes[size],
        className,
      )}
      {...props}
    />
  );
});

const InputGroupText = React.forwardRef<
  HTMLSpanElement,
  React.ComponentPropsWithoutRef<"span">
>(function InputGroupText({ className, ...props }, ref) {
  return (
    <span
      ref={ref}
      className={cn(
        "labui:flex labui:items-center labui:gap-2 labui:text-sm labui:text-muted-foreground labui:[&_svg]:pointer-events-none labui:[&_svg:not([class*='size-'])]:size-4",
        className,
      )}
      {...props}
    />
  );
});

const controlInGroup =
  "labui:flex-1 labui:rounded-none labui:border-0 labui:bg-transparent labui:shadow-none labui:focus-visible:ring-0 labui:dark:bg-transparent";

const InputGroupInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<typeof Input>
>(function InputGroupInput({ className, ...props }, ref) {
  return (
    <Input
      ref={ref}
      data-slot="input-group-control"
      className={cn(controlInGroup, className)}
      {...props}
    />
  );
});

const InputGroupTextarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<typeof Textarea>
>(function InputGroupTextarea({ className, ...props }, ref) {
  return (
    <Textarea
      ref={ref}
      data-slot="input-group-control"
      className={cn(controlInGroup, "labui:resize-none labui:py-3", className)}
      {...props}
    />
  );
});

export {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
  InputGroupInput,
  InputGroupTextarea,
};
