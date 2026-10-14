import * as React from "react";
import { CheckIcon, CircleAlertIcon } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./classes.js";
import { CopyButton } from "./copy-button.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog.js";
import { Input } from "./input.js";
import { Spinner } from "./spinner.js";

export type Confirmation = {
  value: string;
  label: string;
  placeholder?: string;
  match?: "exact" | "loose";
};

export type ConfirmDialogProps = {
  trigger?: React.ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title: React.ReactNode;
  // name is shown after the title as a copyable chip
  name?: string;
  description?: React.ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  pendingLabel?: string;
  tone?: "destructive" | "default";
  warning?: React.ReactNode;
  confirmation?: Confirmation;
  // typeToConfirm asks for name, for callers that have no confirmation
  typeToConfirm?: boolean;
  disabled?: boolean;
  onConfirm: () => void | Promise<void>;
  errorMessage?: string;
};

const loose = (text: string) => text.trim().toLowerCase();

export function matchesConfirmation(value: string, confirmation: Confirmation) {
  return confirmation.match === "loose"
    ? loose(value) === loose(confirmation.value)
    : value === confirmation.value;
}

function confirmationFor({
  confirmation,
  typeToConfirm,
  name,
}: ConfirmDialogProps) {
  if (confirmation) return confirmation;
  if (typeToConfirm && name) return { value: name, label: "Name" };
  return undefined;
}

export function ConfirmDialog({
  trigger,
  open,
  defaultOpen = false,
  onOpenChange,
  ...props
}: ConfirmDialogProps) {
  const [ownOpen, setOwnOpen] = React.useState(defaultOpen);
  const [busy, setBusy] = React.useState(false);
  const confirmation = confirmationFor(props);

  function changeOpen(next: boolean) {
    if (busy) return;
    setOwnOpen(next);
    onOpenChange?.(next);
  }

  return (
    <Dialog open={open ?? ownOpen} onOpenChange={changeOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <ConfirmDialogContent
        key={confirmation?.value}
        {...props}
        confirmation={confirmation}
        busy={busy}
        onBusyChange={setBusy}
        onClose={() => changeOpen(false)}
      />
    </Dialog>
  );
}

type ContentProps = Omit<
  ConfirmDialogProps,
  "trigger" | "open" | "defaultOpen" | "onOpenChange" | "typeToConfirm"
> & {
  busy: boolean;
  onBusyChange: (busy: boolean) => void;
  onClose: () => void;
};

function ConfirmDialogContent({
  title,
  name,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  pendingLabel = confirmLabel,
  tone = "destructive",
  warning,
  confirmation,
  disabled = false,
  onConfirm,
  errorMessage,
  busy,
  onBusyChange,
  onClose,
}: ContentProps) {
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string>();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const inputId = React.useId();
  const hintId = React.useId();
  const canConfirm =
    !disabled && (!confirmation || matchesConfirmation(value, confirmation));
  const Icon = tone === "destructive" ? CircleAlertIcon : CheckIcon;

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canConfirm || busy) return;
    onBusyChange(true);
    setError(undefined);
    try {
      await onConfirm();
    } catch (failure) {
      setError(errorMessage ?? (failure as Error).message);
      return;
    } finally {
      onBusyChange(false);
    }
    onClose();
  }

  function submitWithModifier(event: React.KeyboardEvent<HTMLFormElement>) {
    if (event.key !== "Enter") return;
    if (event.nativeEvent.isComposing || event.repeat) {
      event.preventDefault();
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      event.preventDefault();
      event.currentTarget.requestSubmit();
    }
  }

  return (
    <DialogContent
      role="alertdialog"
      aria-describedby={description ? undefined : undefined}
      className="labui:p-0"
      busy={busy}
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        (inputRef.current ?? cancelRef.current)?.focus();
      }}
    >
      {/* oxlint-disable-next-line jsx-a11y/no-noninteractive-element-interactions -- Ctrl+Enter submits */}
      <form
        data-slot="confirm-dialog"
        className="labui:flex labui:min-w-0 labui:flex-col"
        aria-busy={busy}
        onSubmit={submit}
        onKeyDown={submitWithModifier}
      >
        <div className="labui:flex labui:min-w-0 labui:flex-col labui:gap-5 labui:p-6">
          <div className="labui:flex labui:items-start labui:gap-3">
            <span
              aria-hidden="true"
              className={cn(
                "labui:mt-0.5 labui:flex labui:size-9 labui:shrink-0 labui:items-center labui:justify-center labui:rounded-xl",
                tone === "destructive"
                  ? "labui:bg-destructive-muted labui:text-destructive"
                  : "labui:bg-muted labui:text-foreground",
              )}
            >
              <Icon className="labui:size-5" />
            </span>
            <DialogHeader>
              <DialogTitle>
                {title}
                {name && (
                  <>
                    {" "}
                    <span className="labui:inline-flex labui:items-center labui:gap-1 labui:rounded-md labui:border labui:bg-muted/50 labui:py-0.5 labui:pr-0.5 labui:pl-2 labui:align-middle labui:font-mono labui:text-base labui:break-all">
                      {name}
                      <CopyButton value={name} label="Copy name" />
                    </span>
                    ?
                  </>
                )}
              </DialogTitle>
              {(description || warning) && (
                <DialogDescription asChild>
                  <div className="labui:flex labui:flex-col labui:gap-3">
                    {description && <div>{description}</div>}
                    {warning && (
                      <p className="labui:border-l-2 labui:border-destructive/35 labui:pl-3 labui:text-xs labui:leading-5">
                        {warning}
                      </p>
                    )}
                  </div>
                </DialogDescription>
              )}
            </DialogHeader>
          </div>
          {confirmation && (
            <div className="labui:flex labui:min-w-0 labui:flex-col labui:gap-2">
              <label
                htmlFor={inputId}
                className="labui:text-sm labui:font-medium"
              >
                {confirmation.label}
              </label>
              <Input
                ref={inputRef}
                id={inputId}
                aria-describedby={hintId}
                placeholder={confirmation.placeholder ?? confirmation.value}
                value={value}
                disabled={busy}
                spellCheck={false}
                autoCapitalize="none"
                onChange={(event) => setValue(event.target.value)}
              />
              <p
                id={hintId}
                className="labui:text-xs labui:leading-5 labui:text-muted-foreground"
              >
                To continue, enter{" "}
                <strong className="labui:font-medium labui:break-all labui:whitespace-pre-wrap labui:text-foreground">
                  {confirmation.value}
                </strong>
                {confirmation.match === "loose" ? "." : " exactly as shown."}
              </p>
            </div>
          )}
          {error && (
            <p role="alert" className="labui:text-sm labui:text-destructive">
              {error}
            </p>
          )}
        </div>
        <DialogFooter className="labui:justify-between labui:border-t labui:bg-muted/40 labui:px-6 labui:py-4">
          <Button
            ref={cancelRef}
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={onClose}
          >
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant={tone}
            disabled={!canConfirm || busy}
            aria-keyshortcuts="Control+Enter Meta+Enter"
          >
            {busy && <Spinner aria-hidden="true" />}
            {busy ? pendingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
