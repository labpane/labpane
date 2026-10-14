import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn, focusRing, invalidRing } from "./classes.js";

const toggleVariants = {
  default: "labui:bg-transparent",
  outline:
    "labui:border labui:border-input labui:bg-transparent labui:shadow-xs labui:hover:bg-accent labui:hover:text-accent-foreground",
};

const toggleSizes = {
  default: "labui:h-9 labui:min-w-9 labui:px-2",
  sm: "labui:h-8 labui:min-w-8 labui:px-1.5",
  lg: "labui:h-10 labui:min-w-10 labui:px-2.5",
};

type ToggleStyle = {
  variant?: keyof typeof toggleVariants;
  size?: keyof typeof toggleSizes;
};

function toggleClasses({ variant = "default", size = "default" }: ToggleStyle) {
  return cn(
    "labui:inline-flex labui:items-center labui:justify-center labui:gap-2 labui:rounded-md labui:text-sm labui:font-medium labui:whitespace-nowrap labui:transition-[color,box-shadow] labui:outline-none labui:hover:bg-muted labui:hover:text-muted-foreground labui:disabled:pointer-events-none labui:disabled:opacity-50 labui:data-[state=on]:bg-accent labui:data-[state=on]:text-accent-foreground labui:[&_svg]:pointer-events-none labui:[&_svg]:shrink-0 labui:[&_svg:not([class*='size-'])]:size-4",
    focusRing,
    invalidRing,
    toggleVariants[variant],
    toggleSizes[size],
  );
}

const Toggle = React.forwardRef<
  React.ElementRef<typeof TogglePrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof TogglePrimitive.Root> & ToggleStyle
>(function Toggle({ className, variant, size, ...props }, ref) {
  return (
    <TogglePrimitive.Root
      ref={ref}
      data-slot="toggle"
      className={cn(toggleClasses({ variant, size }), className)}
      {...props}
    />
  );
});

const ToggleGroupContext = React.createContext<
  ToggleStyle & { spacing: number }
>({ spacing: 0 });

const ToggleGroup = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Root> &
    ToggleStyle & { spacing?: number }
>(function ToggleGroup(
  { className, variant, size, spacing = 0, children, ...props },
  ref,
) {
  const style = React.useMemo(
    () => ({ variant, size, spacing }),
    [variant, size, spacing],
  );
  return (
    <ToggleGroupPrimitive.Root
      ref={ref}
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--labui-gap": spacing } as React.CSSProperties}
      className={cn(
        "labui:group/toggle-group labui:flex labui:w-fit labui:items-center labui:gap-[--spacing(var(--labui-gap))] labui:rounded-md",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={style}>
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
});

const ToggleGroupItem = React.forwardRef<
  React.ElementRef<typeof ToggleGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof ToggleGroupPrimitive.Item> & ToggleStyle
>(function ToggleGroupItem({ className, variant, size, ...props }, ref) {
  const group = React.useContext(ToggleGroupContext);
  const style = {
    variant: group.variant ?? variant,
    size: group.size ?? size,
  };
  return (
    <ToggleGroupPrimitive.Item
      ref={ref}
      data-slot="toggle-group-item"
      data-variant={style.variant}
      data-size={style.size}
      data-spacing={group.spacing}
      className={cn(
        toggleClasses(style),
        "labui:w-auto labui:min-w-0 labui:shrink-0 labui:px-3 labui:focus:z-10 labui:focus-visible:z-10",
        "labui:data-[spacing=0]:rounded-none labui:data-[spacing=0]:shadow-none labui:data-[spacing=0]:first:rounded-l-md labui:data-[spacing=0]:last:rounded-r-md labui:data-[spacing=0]:data-[variant=outline]:border-l-0 labui:data-[spacing=0]:data-[variant=outline]:first:border-l",
        className,
      )}
      {...props}
    />
  );
});

export { Toggle, ToggleGroup, ToggleGroupItem };
