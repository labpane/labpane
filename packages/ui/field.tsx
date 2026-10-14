import * as React from "react";
import { cn } from "./classes.js";
import { Label } from "./label.js";
import { Separator } from "./separator.js";

const FieldSet = React.forwardRef<
  HTMLFieldSetElement,
  React.ComponentPropsWithoutRef<"fieldset">
>(function FieldSet({ className, ...props }, ref) {
  return (
    <fieldset
      ref={ref}
      data-slot="field-set"
      className={cn(
        "labui:flex labui:flex-col labui:gap-6",
        "labui:has-[>[data-slot=checkbox-group]]:gap-3 labui:has-[>[data-slot=radio-group]]:gap-3",
        className,
      )}
      {...props}
    />
  );
});

const FieldLegend = React.forwardRef<
  HTMLLegendElement,
  React.ComponentPropsWithoutRef<"legend"> & { variant?: "legend" | "label" }
>(function FieldLegend({ className, variant = "legend", ...props }, ref) {
  return (
    <legend
      ref={ref}
      data-slot="field-legend"
      data-variant={variant}
      className={cn(
        "labui:mb-3 labui:font-medium",
        "labui:data-[variant=legend]:text-base labui:data-[variant=label]:text-sm",
        className,
      )}
      {...props}
    />
  );
});

const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FieldGroup({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="field-group"
      className={cn(
        "labui:group/field-group labui:@container/field-group labui:flex labui:w-full labui:flex-col labui:gap-7 labui:data-[slot=checkbox-group]:gap-3 labui:[&>[data-slot=field-group]]:gap-4",
        className,
      )}
      {...props}
    />
  );
});

const fieldOrientations = {
  vertical: "labui:flex-col labui:[&>*]:w-full",
  horizontal: [
    "labui:flex-row labui:items-center",
    "labui:[&>[data-slot=field-label]]:flex-auto",
    "labui:has-[>[data-slot=field-content]]:items-start labui:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
  ].join(" "),
  responsive: [
    "labui:flex-col labui:@md/field-group:flex-row labui:@md/field-group:items-center labui:[&>*]:w-full labui:@md/field-group:[&>*]:w-auto",
    "labui:@md/field-group:[&>[data-slot=field-label]]:flex-auto",
    "labui:@md/field-group:has-[>[data-slot=field-content]]:items-start labui:@md/field-group:has-[>[data-slot=field-content]]:[&>[role=checkbox],[role=radio]]:mt-px",
  ].join(" "),
};

const Field = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & {
    orientation?: keyof typeof fieldOrientations;
  }
>(function Field({ className, orientation = "vertical", ...props }, ref) {
  return (
    <div
      ref={ref}
      role="group"
      data-slot="field"
      data-orientation={orientation}
      className={cn(
        "labui:group/field labui:flex labui:w-full labui:gap-3 labui:data-[invalid=true]:text-destructive",
        fieldOrientations[orientation],
        className,
      )}
      {...props}
    />
  );
});

const FieldContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FieldContent({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="field-content"
      className={cn(
        "labui:group/field-content labui:flex labui:flex-1 labui:flex-col labui:gap-1.5 labui:leading-snug",
        className,
      )}
      {...props}
    />
  );
});

const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.ComponentPropsWithoutRef<typeof Label>
>(function FieldLabel({ className, ...props }, ref) {
  return (
    <Label
      ref={ref}
      data-slot="field-label"
      className={cn(
        "labui:group/field-label labui:peer/field-label labui:flex labui:w-fit labui:gap-2 labui:leading-snug labui:group-data-[disabled=true]/field:opacity-50",
        "labui:has-[>[data-slot=field]]:w-full labui:has-[>[data-slot=field]]:flex-col labui:has-[>[data-slot=field]]:rounded-md labui:has-[>[data-slot=field]]:border labui:[&>*]:data-[slot=field]:p-4",
        "labui:has-data-[state=checked]:border-primary labui:has-data-[state=checked]:bg-primary/5 labui:dark:has-data-[state=checked]:bg-primary/10",
        className,
      )}
      {...props}
    />
  );
});

const FieldTitle = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FieldTitle({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="field-title"
      className={cn(
        "labui:flex labui:w-fit labui:items-center labui:gap-2 labui:text-sm labui:leading-snug labui:font-medium labui:group-data-[disabled=true]/field:opacity-50",
        className,
      )}
      {...props}
    />
  );
});

const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(function FieldDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="field-description"
      className={cn(
        "labui:text-sm labui:leading-normal labui:font-normal labui:text-muted-foreground labui:group-has-[[data-orientation=horizontal]]/field:text-balance",
        "labui:last:mt-0 labui:nth-last-2:-mt-1 labui:[[data-variant=legend]+&]:-mt-1.5",
        "labui:[&>a]:underline labui:[&>a]:underline-offset-4 labui:[&>a:hover]:text-link",
        className,
      )}
      {...props}
    />
  );
});

const FieldSeparator = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function FieldSeparator({ children, className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="field-separator"
      data-content={!!children}
      className={cn(
        "labui:relative labui:-my-2 labui:h-5 labui:text-sm labui:group-data-[variant=outline]/field-group:-mb-2",
        className,
      )}
      {...props}
    >
      <Separator className="labui:absolute labui:inset-0 labui:top-1/2" />
      {children && (
        <span
          data-slot="field-separator-content"
          className="labui:relative labui:mx-auto labui:block labui:w-fit labui:bg-background labui:px-2 labui:text-muted-foreground"
        >
          {children}
        </span>
      )}
    </div>
  );
});

type FieldErrorItem = { message?: string } | undefined;

function uniqueMessages(errors: FieldErrorItem[]) {
  return [...new Set(errors.flatMap((error) => error?.message ?? []))];
}

function errorContent(children: React.ReactNode, errors?: FieldErrorItem[]) {
  if (children) return children;
  const messages = uniqueMessages(errors ?? []);
  if (messages.length <= 1) return messages[0] ?? null;
  return (
    <ul className="labui:ml-4 labui:flex labui:list-disc labui:flex-col labui:gap-1">
      {messages.map((message) => (
        <li key={message}>{message}</li>
      ))}
    </ul>
  );
}

const FieldError = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div"> & { errors?: FieldErrorItem[] }
>(function FieldError({ className, children, errors, ...props }, ref) {
  const content = errorContent(children, errors);
  if (!content) return null;
  return (
    <div
      ref={ref}
      role="alert"
      data-slot="field-error"
      className={cn(
        "labui:text-sm labui:font-normal labui:text-destructive",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
});

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldContent,
  FieldTitle,
};
