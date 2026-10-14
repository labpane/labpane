import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn, focusRing, invalidRing } from "./classes.js";

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> & {
    size?: "default" | "sm";
  }
>(function Switch({ className, size = "default", ...props }, ref) {
  return (
    <SwitchPrimitive.Root
      ref={ref}
      data-slot="switch"
      data-size={size}
      className={cn(
        "labui:peer labui:group/switch labui:inline-flex labui:h-5 labui:w-9 labui:shrink-0 labui:items-center labui:rounded-full labui:border labui:border-transparent labui:shadow-xs labui:transition-colors labui:outline-none",
        "labui:data-[size=sm]:h-4 labui:data-[size=sm]:w-7",
        "labui:data-[state=unchecked]:bg-input/60 labui:data-[state=checked]:bg-primary labui:dark:data-[state=unchecked]:bg-input/40",
        "labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
        focusRing,
        invalidRing,
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "labui:pointer-events-none labui:block labui:size-4 labui:rounded-full labui:bg-background labui:shadow-sm labui:ring-0 labui:transition-transform",
          "labui:data-[state=unchecked]:translate-x-0 labui:data-[state=checked]:translate-x-4",
          "labui:group-data-[size=sm]/switch:size-3 labui:group-data-[size=sm]/switch:data-[state=checked]:translate-x-3",
          "labui:dark:data-[state=checked]:bg-primary-foreground",
        )}
      />
    </SwitchPrimitive.Root>
  );
});

export { Switch };
