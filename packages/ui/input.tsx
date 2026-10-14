import * as React from "react";
import { cn, inputSurface } from "./classes.js";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<"input">
>(function Input({ className, type, ...props }, ref) {
  return (
    <input
      ref={ref}
      type={type}
      autoComplete="off"
      data-slot="input"
      className={cn(
        inputSurface,
        "labui:h-(--labui-control-height) labui:px-(--labui-control-px) labui:py-1",
        "labui:selection:bg-primary labui:selection:text-primary-foreground labui:disabled:pointer-events-none",
        "labui:file:me-3 labui:file:inline-flex labui:file:h-7 labui:file:border-0 labui:file:bg-transparent",
        "labui:file:text-sm labui:file:font-medium labui:file:text-foreground",
        "labui:[&::-webkit-search-cancel-button]:appearance-none labui:[&::-webkit-search-decoration]:appearance-none labui:[&::-webkit-search-results-button]:appearance-none",
        "labui:[&::-webkit-calendar-picker-indicator]:opacity-60 labui:[&::-webkit-datetime-edit]:leading-none",
        className,
      )}
      {...props}
    />
  );
});

export { Input };
