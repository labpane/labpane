import * as React from "react";
import { Button } from "./button.js";
import { cn } from "./classes.js";

const FileInput = React.forwardRef<
  HTMLInputElement,
  Omit<React.ComponentPropsWithoutRef<"input">, "type" | "size"> & {
    chooseLabel?: string;
    emptyLabel?: string;
  }
>(function FileInput(
  {
    className,
    id,
    disabled,
    onChange,
    chooseLabel = "Choose file",
    emptyLabel = "No file chosen",
    ...props
  },
  ref,
) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const [filename, setFilename] = React.useState("");
  return (
    <div
      data-slot="file-input"
      className={cn(
        "labui:flex labui:min-w-0 labui:items-center labui:gap-2",
        className,
      )}
    >
      <input
        ref={ref}
        id={inputId}
        type="file"
        className="labui:sr-only"
        disabled={disabled}
        onChange={(event) => {
          setFilename(event.target.files?.[0]?.name ?? "");
          onChange?.(event);
        }}
        {...props}
      />
      <Button asChild variant="outline" size="sm" disabled={disabled}>
        <label htmlFor={inputId}>{chooseLabel}</label>
      </Button>
      <span className="labui:min-w-0 labui:truncate labui:text-sm labui:text-muted-foreground">
        {filename || emptyLabel}
      </span>
    </div>
  );
});

export { FileInput };
