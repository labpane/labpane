import * as React from "react";
import { cn, inputSurface } from "./classes.js";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentPropsWithoutRef<"textarea">
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      data-slot="textarea"
      className={cn(
        inputSurface,
        "labui:flex labui:field-sizing-content labui:min-h-16 labui:px-(--labui-control-px) labui:py-2",
        className,
      )}
      {...props}
    />
  );
});

export { Textarea };
