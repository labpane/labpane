import * as React from "react";
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { closeButton, cn, overlay } from "./classes.js";
import { useOverlayOpen } from "./overlay.js";

function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Root>) {
  const [current, change] = useOverlayOpen(open, onOpenChange, defaultOpen);
  return (
    <SheetPrimitive.Root
      data-slot="sheet"
      open={current}
      onOpenChange={change}
      {...props}
    />
  );
}

const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;

const sheetSides = {
  right:
    "labui:inset-y-0 labui:right-0 labui:h-full labui:w-3/4 labui:rounded-l-(--labui-radius-dialog) labui:border-l labui:sm:max-w-sm labui:data-[state=open]:animate-slide-in-right labui:data-[state=closed]:animate-slide-out-right",
  left: "labui:inset-y-0 labui:left-0 labui:h-full labui:w-3/4 labui:rounded-r-(--labui-radius-dialog) labui:border-r labui:sm:max-w-sm labui:data-[state=open]:animate-slide-in-left labui:data-[state=closed]:animate-slide-out-left",
  top: "labui:inset-x-0 labui:top-0 labui:h-auto labui:rounded-b-(--labui-radius-dialog) labui:border-b labui:data-[state=open]:animate-slide-in-top labui:data-[state=closed]:animate-slide-out-top",
  bottom:
    "labui:inset-x-0 labui:bottom-0 labui:h-auto labui:rounded-t-(--labui-radius-dialog) labui:border-t labui:data-[state=open]:animate-slide-in-bottom labui:data-[state=closed]:animate-slide-out-bottom",
};

const SheetContent = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Content> & {
    side?: keyof typeof sheetSides;
    showCloseButton?: boolean;
  }
>(function SheetContent(
  { className, children, side = "right", showCloseButton = true, ...props },
  ref,
) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Overlay data-slot="sheet-overlay" className={overlay} />
      <SheetPrimitive.Content
        ref={ref}
        data-slot="sheet-content"
        data-side={side}
        className={cn(
          "labui:fixed labui:z-50 labui:flex labui:max-h-dvh labui:flex-col labui:gap-5 labui:overflow-y-auto labui:bg-popover labui:text-popover-foreground labui:shadow-sm labui:outline-none",
          sheetSides[side],
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <SheetPrimitive.Close data-slot="sheet-close" className={closeButton}>
            <XIcon />
            <span className="labui:sr-only">Close</span>
          </SheetPrimitive.Close>
        )}
      </SheetPrimitive.Content>
    </SheetPrimitive.Portal>
  );
});

const SheetHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function SheetHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="sheet-header"
      className={cn(
        "labui:flex labui:flex-col labui:gap-3 labui:p-6",
        className,
      )}
      {...props}
    />
  );
});

const SheetFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function SheetFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="sheet-footer"
      className={cn(
        "labui:mt-auto labui:flex labui:flex-col labui:gap-2 labui:p-6",
        className,
      )}
      {...props}
    />
  );
});

const SheetTitle = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Title>
>(function SheetTitle({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Title
      ref={ref}
      data-slot="sheet-title"
      className={cn(
        "labui:pr-8 labui:text-base labui:leading-6 labui:font-semibold labui:text-foreground",
        className,
      )}
      {...props}
    />
  );
});

const SheetDescription = React.forwardRef<
  React.ElementRef<typeof SheetPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof SheetPrimitive.Description>
>(function SheetDescription({ className, ...props }, ref) {
  return (
    <SheetPrimitive.Description
      ref={ref}
      data-slot="sheet-description"
      className={cn(
        "labui:text-sm labui:leading-6 labui:text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
});

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};
