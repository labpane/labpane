import * as React from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { CircleAlertIcon, XIcon } from "lucide-react";
import { Button, cn, CopyButton, Input, Spinner } from "./primitives.js";

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    showCloseButton?: boolean;
  }
>(function DialogContent(
  { className, children, showCloseButton = true, ...props },
  ref,
) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="labui:fixed labui:inset-0 labui:z-50 labui:bg-overlay" />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        className={cn(
          "labui:fixed labui:top-1/2 labui:left-1/2 labui:z-50 labui:-translate-x-1/2 labui:-translate-y-1/2",
          "labui:grid labui:max-h-[calc(100dvh-2rem)] labui:w-full labui:max-w-[calc(100%-2rem)] labui:sm:max-w-lg labui:gap-6 labui:overflow-y-auto",
          "labui:rounded-(--labui-radius-dialog) labui:border labui:bg-popover labui:p-6 labui:text-popover-foreground labui:shadow-sm labui:outline-none",
          className,
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className={cn(
              "labui:absolute labui:top-4 labui:right-4 labui:inline-flex labui:size-8 labui:items-center labui:justify-center labui:rounded-md",
              "labui:text-muted-foreground labui:transition-colors labui:hover:bg-accent labui:hover:text-foreground",
              "labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50 labui:focus-visible:outline-none labui:disabled:pointer-events-none",
              "labui:[&_svg]:pointer-events-none labui:[&_svg]:size-4 labui:[&_svg]:shrink-0",
            )}
          >
            <XIcon />
            <span className="labui:sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
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
  React.ComponentPropsWithoutRef<"div">
>(function DialogFooter({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="dialog-footer"
      className={cn(
        "labui:flex labui:flex-wrap labui:items-center labui:justify-end labui:gap-2",
        className,
      )}
      {...props}
    />
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
      className={cn("labui:text-sm labui:text-muted-foreground", className)}
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
  DialogTitle,
  DialogTrigger,
};

export function ConfirmDialog({
  trigger,
  title,
  name,
  confirmLabel,
  typeToConfirm,
  onConfirm,
}: {
  trigger: React.ReactElement;
  title: string;
  name: string;
  confirmLabel: string;
  typeToConfirm?: boolean;
  onConfirm: () => Promise<void>;
}) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState<string>();

  function change(next: boolean) {
    if (busy) return;
    setOpen(next);
    setValue("");
    setError(undefined);
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(undefined);
    try {
      await onConfirm();
      setOpen(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={change}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent
        role="alertdialog"
        aria-describedby={undefined}
        className="labui:p-0"
        showCloseButton={!busy}
        onOpenAutoFocus={(event) => {
          const input = (event.target as HTMLElement).querySelector("input");
          if (!input) return;
          event.preventDefault();
          input.focus();
        }}
      >
        <form
          className="labui:flex labui:min-w-0 labui:flex-col"
          onSubmit={submit}
        >
          <div className="labui:flex labui:min-w-0 labui:flex-col labui:gap-4 labui:p-6">
            <div className="labui:flex labui:items-center labui:gap-3">
              <span
                aria-hidden="true"
                className="labui:flex labui:size-9 labui:shrink-0 labui:items-center labui:justify-center labui:rounded-xl labui:bg-destructive-muted labui:text-destructive"
              >
                <CircleAlertIcon className="labui:size-5" />
              </span>
              <DialogTitle>
                {title}{" "}
                <span className="labui:inline-flex labui:items-center labui:gap-1 labui:rounded-md labui:border labui:bg-muted/50 labui:py-0.5 labui:pr-0.5 labui:pl-2 labui:align-middle labui:font-mono labui:text-base labui:break-all">
                  {name}
                  <CopyButton value={name} label="Copy name" />
                </span>
                ?
              </DialogTitle>
            </div>
            {typeToConfirm && (
              <Input
                aria-label="Name"
                autoComplete="off"
                spellCheck="false"
                placeholder={name}
                value={value}
                disabled={busy}
                onChange={(event) => setValue(event.target.value)}
              />
            )}
            {error && (
              <p role="alert" className="labui:text-sm labui:text-destructive">
                {error}
              </p>
            )}
          </div>
          <DialogFooter className="labui:justify-between labui:border-t labui:bg-muted/40 labui:px-6 labui:py-4">
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => change(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={busy || (typeToConfirm && value !== name)}
            >
              {busy && <Spinner />}
              {confirmLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

const dialogAction =
  "labui:inline-flex labui:shrink-0 labui:items-center labui:justify-center labui:rounded-md labui:text-sm labui:font-medium labui:outline-none labui:transition-colors labui:hover:bg-accent labui:focus-visible:ring-2 labui:focus-visible:ring-ring labui:px-4 labui:py-2";

export function DiscardDialog({
  label,
  onCancel,
  onConfirm,
  onCloseAutoFocus,
}: {
  label?: string;
  onCancel: () => void;
  onConfirm: () => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  return (
    <AlertDialog.Root
      open={label !== undefined}
      onOpenChange={(open) => !open && onCancel()}
    >
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="labui:fixed labui:inset-0 labui:z-50 labui:font-sans labui:text-sm labui:leading-normal labui:bg-overlay" />
        <AlertDialog.Content
          className={cn(
            "labui:fixed labui:top-1/2 labui:left-1/2 labui:z-50 labui:-translate-x-1/2 labui:-translate-y-1/2",
            "labui:w-[calc(100%-2rem)] labui:max-w-lg labui:rounded-[1.25rem] labui:border labui:border-border labui:bg-popover labui:p-6",
            "labui:font-sans labui:text-sm labui:leading-normal labui:text-popover-foreground labui:shadow-sm labui:outline-none",
          )}
          onCloseAutoFocus={onCloseAutoFocus}
        >
          <AlertDialog.Title className="labui:m-0 labui:text-lg labui:font-semibold">
            Discard changes in {label}?
          </AlertDialog.Title>
          <AlertDialog.Description className="labui:mt-2 labui:text-muted-foreground">
            Closing the tab discards its unsaved changes.
          </AlertDialog.Description>
          <div className="labui:mt-6 labui:flex labui:flex-wrap labui:justify-end labui:gap-2">
            <AlertDialog.Cancel
              className={dialogAction + " labui:border labui:border-border"}
            >
              Keep tab
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className={
                dialogAction +
                " labui:bg-destructive-muted labui:text-destructive"
              }
              onClick={onConfirm}
            >
              Discard and close
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
