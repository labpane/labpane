import * as React from "react";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./classes.js";

const PageActions = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function PageActions({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="page-actions"
      className={cn(
        "labui:ml-auto labui:flex labui:max-w-full labui:flex-wrap labui:items-center labui:justify-end labui:gap-2 labui:[--labui-control-height:2.25rem] labui:empty:hidden labui:[@media(pointer:coarse)]:[--labui-control-height:2.75rem]",
        className,
      )}
      {...props}
    />
  );
});

const PageHeaderText = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<"div">
>(function PageHeaderText({ className, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="page-header-text"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-col labui:gap-1",
        className,
      )}
      {...props}
    />
  );
});

const PageEyebrow = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(function PageEyebrow({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="page-eyebrow"
      className={cn(
        "labui:text-xs labui:font-semibold labui:tracking-[0.14em] labui:text-muted-foreground labui:uppercase",
        className,
      )}
      {...props}
    />
  );
});

const PageTitle = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<"h1">
>(function PageTitle({ className, ...props }, ref) {
  return (
    // oxlint-disable-next-line jsx-a11y/heading-has-content -- callers pass children
    <h1
      ref={ref}
      data-slot="page-title"
      className={cn(
        "labui:font-display labui:text-2xl labui:font-bold labui:tracking-tight",
        className,
      )}
      {...props}
    />
  );
});

const PageDescription = React.forwardRef<
  HTMLParagraphElement,
  React.ComponentPropsWithoutRef<"p">
>(function PageDescription({ className, ...props }, ref) {
  return (
    <p
      ref={ref}
      data-slot="page-description"
      className={cn("labui:text-sm labui:text-muted-foreground", className)}
      {...props}
    />
  );
});

type PageHeaderProps = Omit<
  React.ComponentPropsWithoutRef<"header">,
  "title"
> & {
  title?: React.ReactNode;
  eyebrow?: React.ReactNode;
  description?: React.ReactNode;
  leading?: React.ReactNode;
  actions?: React.ReactNode;
  variant?: "bar";
};

const PageHeader = React.forwardRef<HTMLElement, PageHeaderProps>(
  function PageHeader(
    {
      title,
      eyebrow,
      description,
      leading,
      actions,
      variant,
      className,
      children,
      ...props
    },
    ref,
  ) {
    const hasText = title || eyebrow || description;
    return (
      <header
        ref={ref}
        data-slot="page-header"
        data-variant={variant}
        className={cn(
          "labui:flex labui:flex-wrap labui:items-center labui:gap-3",
          variant === "bar" &&
            "labui:border-b labui:px-4 labui:py-3 labui:sm:px-6",
          className,
        )}
        {...props}
      >
        {leading}
        {hasText && (
          <PageHeaderText>
            {eyebrow && <PageEyebrow>{eyebrow}</PageEyebrow>}
            {title && <PageTitle>{title}</PageTitle>}
            {description && <PageDescription>{description}</PageDescription>}
          </PageHeaderText>
        )}
        {children}
        <PageActions>{actions}</PageActions>
      </header>
    );
  },
);

const Page = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<"div">, "title"> & {
    title?: React.ReactNode;
    actions?: React.ReactNode;
  }
>(function Page({ title, actions, className, children, ...props }, ref) {
  return (
    <div
      ref={ref}
      data-slot="page"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-col labui:gap-4",
        className,
      )}
      {...props}
    >
      {title && <PageHeader title={title} actions={actions} />}
      {children}
    </div>
  );
});

const Back = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<"a"> & { label: string }
>(function Back({ label, ...props }, ref) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="labui:-ml-2.5 labui:self-start"
      asChild
    >
      <a ref={ref} {...props}>
        <ArrowLeftIcon />
        {label}
      </a>
    </Button>
  );
});

export {
  Back,
  Page,
  PageActions,
  PageDescription,
  PageEyebrow,
  PageHeader,
  PageHeaderText,
  PageTitle,
};
