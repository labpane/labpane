import * as React from "react";
import * as ContextMenu from "@radix-ui/react-context-menu";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { CheckIcon, ChevronRightIcon } from "lucide-react";

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
const menuItem =
  "labui:flex labui:min-h-9 labui:cursor-default labui:items-center labui:gap-3 labui:rounded-md labui:px-3 labui:text-sm labui:outline-none labui:data-highlighted:bg-accent labui:data-disabled:opacity-50 labui:[@media(pointer:coarse)]:min-h-11";
const optionPanel =
  panel +
  " labui:min-w-40 labui:max-h-[var(--radix-dropdown-menu-content-available-height)] labui:overflow-auto";

export function MenuContent({
  children,
  className = "labui:w-56",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align="start"
        sideOffset={4}
        collisionPadding={8}
        className={
          "labui:z-50 labui:max-h-[var(--radix-dropdown-menu-content-available-height)] labui:overflow-auto labui:rounded-lg labui:border labui:bg-popover labui:p-1 labui:text-popover-foreground labui:shadow-sm " +
          className
        }
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

function contextItem(action: MenuAction, index: number): React.ReactNode {
  if (!action)
    return (
      <ContextMenu.Separator
        key={index}
        className="labui:my-1 labui:border-t labui:border-border"
      />
    );
  if ("items" in action)
    return (
      <ContextMenu.Sub key={action.label}>
        <ContextMenu.SubTrigger
          className={
            menuItem +
            " labui:justify-between labui:data-[state=open]:bg-accent"
          }
        >
          {action.label}
          <ChevronRightIcon className="labui:size-4" />
        </ContextMenu.SubTrigger>
        <ContextMenu.Portal>
          <ContextMenu.SubContent
            className={panel + " labui:min-w-40"}
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
        <span className="labui:grid labui:size-4 labui:place-items-center">
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
  return (
    <ContextMenu.Root modal={false}>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>
      <ContextMenu.Portal>
        <ContextMenu.Content
          className={panel + " labui:min-w-44"}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          {actions.map(contextItem)}
        </ContextMenu.Content>
      </ContextMenu.Portal>
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
    <DropdownMenu.Item
      key={option.id}
      className={menuItem}
      onSelect={() => onSelect(option.id)}
    >
      {option.icon}
      {option.label}
    </DropdownMenu.Item>
  );
  return (
    <DropdownMenu.Root modal={false} open={open} onOpenChange={onOpenChange}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={4}
          collisionPadding={8}
          className={optionPanel}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          {options.filter((option) => !option.group).map(item)}
          {groups.map((group) => (
            <DropdownMenu.Sub key={group}>
              <DropdownMenu.SubTrigger
                className={
                  menuItem +
                  " labui:justify-between labui:data-[state=open]:bg-accent"
                }
              >
                {group}
                <ChevronRightIcon className="labui:size-4" />
              </DropdownMenu.SubTrigger>
              <DropdownMenu.Portal>
                <DropdownMenu.SubContent
                  className={optionPanel}
                  sideOffset={4}
                  collisionPadding={8}
                >
                  {options.filter((option) => option.group === group).map(item)}
                </DropdownMenu.SubContent>
              </DropdownMenu.Portal>
            </DropdownMenu.Sub>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
