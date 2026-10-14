import * as React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon, CircleIcon } from "lucide-react";
import { cn } from "./classes.js";
import { useOverlayOpen } from "./overlay.js";

export type MenuAction =
  | {
      label: string;
      onSelect: () => void;
      disabled?: boolean;
      checked?: boolean;
    }
  | { label: string; items: MenuAction[] }
  | null;

export type MenuOption = {
  id: string;
  label: string;
  group?: string;
  icon?: React.ReactNode;
};

const panel =
  "labui:z-50 labui:rounded-lg labui:border labui:border-border labui:bg-popover labui:p-1 labui:font-sans labui:text-sm labui:leading-normal labui:text-popover-foreground labui:shadow-sm";
const scrollingPanel =
  panel +
  " labui:min-w-40 labui:max-h-(--radix-dropdown-menu-content-available-height) labui:overflow-auto";
const menuItem =
  "labui:relative labui:flex labui:min-h-9 labui:cursor-default labui:items-center labui:gap-3 labui:rounded-md labui:px-3 labui:text-sm labui:outline-none labui:data-highlighted:bg-accent labui:data-disabled:opacity-50 labui:[@media(pointer:coarse)]:min-h-11 labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0 labui:[&_svg:not([class*='size-'])]:size-4";
const subTrigger =
  menuItem + " labui:justify-between labui:data-[state=open]:bg-accent";
const indicator = "labui:grid labui:size-4 labui:place-items-center";
const separator = "labui:my-1 labui:border-t labui:border-border";

function DropdownMenu({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DropdownMenuPrimitive.Root>) {
  const [current, change] = useOverlayOpen(open, onOpenChange, defaultOpen);
  return (
    <DropdownMenuPrimitive.Root
      modal={false}
      open={current}
      onOpenChange={change}
      {...props}
    />
  );
}

const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(function DropdownMenuContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        ref={ref}
        data-slot="dropdown-menu-content"
        align="start"
        sideOffset={4}
        collisionPadding={8}
        className={cn(scrollingPanel, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

const DropdownMenuSubTrigger = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubTrigger>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubTrigger> & {
    inset?: boolean;
  }
>(function DropdownMenuSubTrigger(
  { className, inset, children, ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.SubTrigger
      ref={ref}
      data-slot="dropdown-menu-sub-trigger"
      className={cn(subTrigger, inset && "labui:pl-10", className)}
      {...props}
    >
      {children}
      <ChevronRightIcon className="labui:ml-auto labui:size-4" />
    </DropdownMenuPrimitive.SubTrigger>
  );
});

const DropdownMenuSubContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.SubContent>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.SubContent>
>(function DropdownMenuSubContent({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.SubContent
        ref={ref}
        data-slot="dropdown-menu-sub-content"
        sideOffset={4}
        collisionPadding={8}
        className={cn(scrollingPanel, className)}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
});

const itemVariants = {
  default: "",
  destructive:
    "labui:text-destructive labui:data-highlighted:bg-destructive/10 labui:data-highlighted:text-destructive",
};

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> & {
    inset?: boolean;
    variant?: keyof typeof itemVariants;
  }
>(function DropdownMenuItem(
  { className, inset, variant = "default", ...props },
  ref,
) {
  return (
    <DropdownMenuPrimitive.Item
      ref={ref}
      data-slot="dropdown-menu-item"
      data-variant={variant}
      className={cn(
        menuItem,
        itemVariants[variant],
        inset && "labui:pl-10",
        className,
      )}
      {...props}
    />
  );
});

const DropdownMenuCheckboxItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.CheckboxItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.CheckboxItem>
>(function DropdownMenuCheckboxItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.CheckboxItem
      ref={ref}
      data-slot="dropdown-menu-checkbox-item"
      className={cn(menuItem, className)}
      {...props}
    >
      <span className={indicator}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CheckIcon className="labui:size-4" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.CheckboxItem>
  );
});

const DropdownMenuRadioItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.RadioItem>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.RadioItem>
>(function DropdownMenuRadioItem({ className, children, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.RadioItem
      ref={ref}
      data-slot="dropdown-menu-radio-item"
      className={cn(menuItem, className)}
      {...props}
    >
      <span className={indicator}>
        <DropdownMenuPrimitive.ItemIndicator>
          <CircleIcon className="labui:size-2 labui:fill-current" />
        </DropdownMenuPrimitive.ItemIndicator>
      </span>
      {children}
    </DropdownMenuPrimitive.RadioItem>
  );
});

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label> & {
    inset?: boolean;
  }
>(function DropdownMenuLabel({ className, inset, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Label
      ref={ref}
      data-slot="dropdown-menu-label"
      className={cn(
        "labui:px-3 labui:py-1.5 labui:text-xs labui:font-medium labui:text-muted-foreground",
        inset && "labui:pl-10",
        className,
      )}
      {...props}
    />
  );
});

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(function DropdownMenuSeparator({ className, ...props }, ref) {
  return (
    <DropdownMenuPrimitive.Separator
      ref={ref}
      data-slot="dropdown-menu-separator"
      className={cn(separator, className)}
      {...props}
    />
  );
});

function DropdownMenuShortcut({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="dropdown-menu-shortcut"
      className={cn(
        "labui:ml-auto labui:text-xs labui:tracking-widest labui:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function MenuContent({
  children,
  className = "labui:w-56",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenuContent className={className}>{children}</DropdownMenuContent>
  );
}

function contextItem(action: MenuAction, index: number): React.ReactNode {
  if (!action)
    return <ContextMenu.Separator key={index} className={separator} />;
  if ("items" in action)
    return (
      <ContextMenu.Sub key={action.label}>
        <ContextMenu.SubTrigger className={subTrigger}>
          {action.label}
          <ChevronRightIcon className="labui:size-4" />
        </ContextMenu.SubTrigger>
        <ContextMenu.Portal>
          <ContextMenu.SubContent
            className={cn(panel, "labui:min-w-40")}
            sideOffset={4}
            collisionPadding={8}
          >
            {action.items.map(contextItem)}
          </ContextMenu.SubContent>
        </ContextMenu.Portal>
      </ContextMenu.Sub>
    );
  if (action.checked !== undefined)
    return (
      <ContextMenu.CheckboxItem
        key={action.label}
        className={menuItem}
        checked={action.checked}
        disabled={action.disabled}
        onSelect={action.onSelect}
      >
        <span className={indicator}>
          <ContextMenu.ItemIndicator>
            <CheckIcon className="labui:size-4" />
          </ContextMenu.ItemIndicator>
        </span>
        {action.label}
      </ContextMenu.CheckboxItem>
    );
  return (
    <ContextMenu.Item
      key={action.label}
      className={menuItem}
      disabled={action.disabled}
      onSelect={action.onSelect}
    >
      {action.label}
    </ContextMenu.Item>
  );
}

export function ActionMenu({
  children,
  actions,
  onCloseAutoFocus,
}: {
  children: React.ReactElement;
  actions: MenuAction[];
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const [open, setOpen] = useOverlayOpen(undefined, undefined);
  return (
    <ContextMenu.Root modal={false} onOpenChange={setOpen}>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      {open && (
        <ContextMenu.Portal>
          <ContextMenu.Content
            className={cn(panel, "labui:min-w-44")}
            onCloseAutoFocus={onCloseAutoFocus}
          >
            {actions.map(contextItem)}
          </ContextMenu.Content>
        </ContextMenu.Portal>
      )}
    </ContextMenu.Root>
  );
}

export function OptionMenu({
  trigger,
  options,
  onSelect,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  trigger: React.ReactElement;
  options: readonly MenuOption[];
  onSelect: (id: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const groups = [
    ...new Set(
      options.flatMap((option) => (option.group ? [option.group] : [])),
    ),
  ];
  const item = (option: MenuOption) => (
    <DropdownMenuItem key={option.id} onSelect={() => onSelect(option.id)}>
      {option.icon}
      {option.label}
    </DropdownMenuItem>
  );
  return (
    <DropdownMenu open={open} onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent onCloseAutoFocus={onCloseAutoFocus}>
        {options.filter((option) => !option.group).map(item)}
        {groups.map((group) => (
          <DropdownMenuSub key={group}>
            <DropdownMenuSubTrigger>{group}</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {options.filter((option) => option.group === group).map(item)}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
};
