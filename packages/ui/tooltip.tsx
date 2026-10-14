import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "./classes.js";
import { useOverlayOpen } from "./overlay.js";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

function Tooltip({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  const [current, change] = useOverlayOpen(open, onOpenChange, defaultOpen);
  return (
    <TooltipPrimitive.Root
      data-slot="tooltip"
      open={current}
      onOpenChange={change}
      {...props}
    />
  );
}

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(function TooltipContent(
  { className, sideOffset = 0, children, ...props },
  ref,
) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "labui:z-50 labui:w-fit labui:origin-(--radix-tooltip-content-transform-origin) labui:rounded-md labui:bg-foreground labui:px-3 labui:py-1.5 labui:text-xs labui:text-balance labui:text-background",
          "labui:data-[state=delayed-open]:animate-fade-in labui:data-[state=instant-open]:animate-fade-in labui:data-[state=closed]:animate-fade-out",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="labui:z-50 labui:size-2.5 labui:translate-y-[calc(-50%-2px)] labui:rotate-45 labui:rounded-[2px] labui:bg-foreground labui:fill-foreground" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
});

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
