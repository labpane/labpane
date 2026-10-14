import * as React from "react";
import { cn } from "./classes.js";

const SettingsSection = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentPropsWithoutRef<"section">, "title"> & {
    title: React.ReactNode;
    description?: React.ReactNode;
  }
>(function SettingsSection(
  { title, description, className, children, ...props },
  ref,
) {
  const headingId = React.useId();
  return (
    <section
      ref={ref}
      data-slot="settings-section"
      aria-labelledby={headingId}
      className={cn("labui:flex labui:flex-col labui:gap-4", className)}
      {...props}
    >
      <div className="labui:flex labui:flex-col labui:gap-1">
        <h2
          id={headingId}
          className="labui:text-base labui:font-semibold labui:tracking-tight"
        >
          {title}
        </h2>
        {description && (
          <p className="labui:text-sm labui:text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="labui:divide-y labui:rounded-lg labui:border labui:bg-card labui:text-card-foreground">
        {children}
      </div>
    </section>
  );
});

const SettingsRow = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    label: React.ReactNode;
    description?: React.ReactNode;
    htmlFor?: string;
  }
>(function SettingsRow(
  { label, description, htmlFor, className, children, ...props },
  ref,
) {
  const Label = htmlFor ? "label" : "div";
  return (
    <div
      ref={ref}
      data-slot="settings-row"
      className={cn(
        "labui:flex labui:flex-wrap labui:items-center labui:justify-between labui:gap-x-6 labui:gap-y-2 labui:px-4 labui:py-3",
        className,
      )}
      {...props}
    >
      <div className="labui:flex labui:min-w-0 labui:flex-1 labui:basis-56 labui:flex-col labui:gap-0.5">
        <Label htmlFor={htmlFor} className="labui:text-sm labui:font-medium">
          {label}
        </Label>
        {description && (
          <p className="labui:text-sm labui:text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      <div className="labui:flex labui:shrink-0 labui:items-center labui:gap-2">
        {children}
      </div>
    </div>
  );
});

const SettingsFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { status?: React.ReactNode }
>(function SettingsFooter({ status, className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="settings-footer"
      className={cn(
        "labui:flex labui:flex-wrap labui:items-center labui:justify-end labui:gap-3 labui:border-t labui:pt-4",
        className,
      )}
      {...props}
    >
      <p
        role="status"
        className="labui:mr-auto labui:text-sm labui:text-muted-foreground labui:empty:hidden"
      >
        {status}
      </p>
      {children}
    </div>
  );
});

export { SettingsSection, SettingsRow, SettingsFooter };
