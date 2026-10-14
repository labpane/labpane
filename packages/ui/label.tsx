import * as React from "react";
import { cn } from "./classes.js";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<"label">
>(function Label({ className, ...props }, ref) {
  return (
    // oxlint-disable-next-line jsx-a11y/label-has-associated-control -- callers pass htmlFor
    <label
      ref={ref}
      data-slot="label"
      className={cn(
        "labui:flex labui:items-center labui:gap-2 labui:text-sm labui:leading-none labui:font-medium labui:select-none",
        "labui:group-data-[disabled=true]:pointer-events-none labui:group-data-[disabled=true]:opacity-50",
        "labui:peer-disabled:cursor-not-allowed labui:peer-disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

export { Label };
