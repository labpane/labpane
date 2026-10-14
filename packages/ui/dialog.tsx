import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { Button } from "./button.js";
import { closeButton, cn, overlay } from "./classes.js";
import { useOverlayOpen } from "./overlay.js";

function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  const [current, change] = useOverlayOpen(open, onOpenChange, defaultOpen);
  return (
    <DialogPrimitive.Root
      data-slot="dialog"
      open={current}
      onOpenChange={change}
      {...props}
    />
  );
}

const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(function DialogOverlay({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(overlay, className)}
      {...props}
    />
  );
});

const keep = (event: Event) => event.preventDefault();

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
    busy?: boolean;
  }
>(function DialogContent(
  { className, children, showCloseButton = true, busy = false, ...props },
  ref,
) {
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        aria-busy={busy || undefined}
        onEscapeKeyDown={busy ? keep : props.onEscapeKeyDown}
        onInteractOutside={busy ? keep : props.onInteractOutside}
        className={cn(
          "labui:fixed labui:top-1/2 labui:left-1/2 labui:z-50 labui:-translate-x-1/2 labui:-translate-y-1/2",
          "labui:grid labui:max-h-[calc(100dvh-2rem)] labui:w-full labui:max-w-[calc(100%-2rem)] labui:sm:max-w-lg labui:gap-6 labui:overflow-y-auto",
          "labui:rounded-(--labui-radius-dialog) labui:border labui:bg-popover labui:p-6 labui:text-popover-foreground labui:shadow-sm labui:outline-none",
          "labui:data-[state=open]:animate-zoom-in labui:data-[state=closed]:animate-zoom-out",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && !busy && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={closeButton}
          >
            <XIcon />
            <span className="labui:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function DialogHeader({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-header"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-col labui:gap-2 labui:text-left",
        className,
      )}
      {...props}
    />
  );
});

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { showCloseButton?: boolean }
>(function DialogFooter(
  { className, showCloseButton = false, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        "labui:flex labui:flex-wrap labui:items-center labui:justify-end labui:gap-2",
        className,
      )}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogPrimitive.Close asChild>
          <Button variant="secondary">Close</Button>
        </DialogPrimitive.Close>
      )}
    </div>
  );
});

const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(function DialogTitle({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Title
      ref={ref}
      data-slot="dialog-title"
      className={cn(
        "labui:pr-8 labui:text-lg labui:leading-7 labui:font-semibold labui:break-words",
        className,
      )}
      {...props}
    />
  );
});

const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(function DialogDescription({ className, ...props }, ref) {
  return (
    <DialogPrimitive.Description
      ref={ref}
      data-slot="dialog-description"
      className={cn(
        "labui:text-sm labui:leading-6 labui:text-muted-foreground labui:break-words",
        className,
      )}
      {...props}
    />
  );
});

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
