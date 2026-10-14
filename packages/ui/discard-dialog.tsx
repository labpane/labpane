import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { cn, overlay } from "./classes.js";

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
        <AlertDialog.Overlay
          className={cn(
            overlay,
            "labui:font-sans labui:text-sm labui:leading-normal",
          )}
        />
        <AlertDialog.Content
          className={cn(
            "labui:fixed labui:top-1/2 labui:left-1/2 labui:z-50 labui:-translate-x-1/2 labui:-translate-y-1/2",
            "labui:w-[calc(100%-2rem)] labui:max-w-lg labui:rounded-(--labui-radius-dialog) labui:border labui:border-border labui:bg-popover labui:p-6",
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
              className={cn(dialogAction, "labui:border labui:border-border")}
            >
              Keep tab
            </AlertDialog.Cancel>
            <AlertDialog.Action
              className={cn(
                dialogAction,
                "labui:bg-destructive-muted labui:text-destructive",
              )}
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
