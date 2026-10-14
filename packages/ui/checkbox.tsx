import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import { cn, focusRing, invalidRing } from "./classes.js";

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(function Checkbox({ className, ...props }, ref) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      data-slot="checkbox"
      className={cn(
        "labui:peer labui:size-4 labui:shrink-0 labui:rounded-[4px] labui:border labui:border-input labui:dark:bg-input/30",
        "labui:shadow-xs labui:transition-shadow labui:outline-none",
        "labui:disabled:cursor-not-allowed labui:disabled:opacity-50",
        "labui:data-[state=checked]:border-primary labui:data-[state=checked]:bg-primary labui:data-[state=checked]:text-primary-foreground labui:dark:data-[state=checked]:bg-primary",
        focusRing,
        invalidRing,
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="labui:grid labui:place-content-center labui:text-current labui:transition-none"
      >
        <CheckIcon className="labui:size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export { Checkbox };
