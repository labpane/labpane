import * as React from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn, focusRing, invalidRing } from "./classes.js";

const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  Omit<React.ComponentPropsWithoutRef<"select">, "size"> & {
    size?: "sm" | "default";
  }
>(function NativeSelect({ className, size = "default", ...props }, ref) {
  return (
    <div
      data-slot="native-select-wrapper"
      className={cn(
        "labui:group/native-select labui:relative labui:w-full labui:min-w-0 labui:has-[select:disabled]:opacity-50",
        className,
      )}
    >
      <select
        ref={ref}
        data-slot="native-select"
        data-size={size}
        className={cn(
          "labui:h-(--labui-control-height) labui:w-full labui:min-w-0 labui:appearance-none labui:rounded-md labui:border labui:border-input labui:bg-input-background labui:px-(--labui-control-px) labui:py-1 labui:pr-9 labui:text-sm labui:shadow-xs labui:transition-[color,box-shadow] labui:outline-none labui:disabled:pointer-events-none labui:disabled:cursor-not-allowed labui:data-[size=sm]:h-(--labui-control-height-sm) labui:dark:hover:bg-input/50",
          focusRing,
          invalidRing,
        )}
        {...props}
      />
      <ChevronDownIcon
        data-slot="native-select-icon"
        aria-hidden="true"
        className="labui:pointer-events-none labui:absolute labui:top-1/2 labui:right-3 labui:size-4 labui:-translate-y-1/2 labui:text-muted-foreground labui:opacity-50 labui:select-none"
      />
    </div>
  );
});

const NativeSelectOption = React.forwardRef<
  HTMLOptionElement,
  React.ComponentPropsWithoutRef<"option">
>(function NativeSelectOption({ className, ...props }, ref) {
  return (
    <option
      ref={ref}
      data-slot="native-select-option"
      className={cn("labui:bg-[Canvas] labui:text-[CanvasText]", className)}
      {...props}
    />
  );
});

const NativeSelectOptGroup = React.forwardRef<
  HTMLOptGroupElement,
  React.ComponentPropsWithoutRef<"optgroup">
>(function NativeSelectOptGroup({ className, ...props }, ref) {
  return (
    <optgroup
      ref={ref}
      data-slot="native-select-optgroup"
      className={cn("labui:bg-[Canvas] labui:text-[CanvasText]", className)}
      {...props}
    />
  );
});

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
