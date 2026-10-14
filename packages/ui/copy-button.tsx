import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./classes.js";

const messages = {
  idle: "",
  copied: "Copied",
  failed: "Copy unavailable",
};

export function CopyButton({
  value,
  label = "Copy",
  className,
  variant = "ghost",
  size = "icon-xs",
  ...props
}: Omit<
  React.ComponentPropsWithoutRef<typeof Button>,
  "onClick" | "value" | "size"
> & {
  value: string;
  label?: string;
  size?: "icon" | "icon-xs" | "icon-sm" | "icon-lg";
}) {
  const [state, setState] = React.useState<keyof typeof messages>("idle");

  function copy() {
    if (!navigator.clipboard) return setState("failed");
    navigator.clipboard.writeText(value).then(
      () => setState("copied"),
      () => setState("failed"),
    );
  }

  return (
    <span
      data-slot="copy-button"
      className={cn("labui:inline-flex labui:items-center", className)}
    >
      <Button
        type="button"
        variant={variant}
        size={size}
        aria-label={label}
        title={messages[state] || label}
        onClick={copy}
        {...props}
      >
        {state === "copied" ? (
          <CheckIcon aria-hidden="true" />
        ) : (
          <CopyIcon aria-hidden="true" />
        )}
      </Button>
      <span role="status" className="labui:sr-only">
        {messages[state]}
      </span>
    </span>
  );
}
