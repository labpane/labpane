import * as React from "react";
import { Alert, AlertDescription, AlertTitle } from "./alert.js";
import { cn } from "./classes.js";
import { PageHeader } from "./page.js";

const TableScreen = React.forwardRef<
  HTMLDivElement,
  Omit<React.ComponentPropsWithoutRef<"div">, "title"> & {
    title: React.ReactNode;
    description?: React.ReactNode;
    actions?: React.ReactNode;
    tabs?: React.ReactNode;
    error?: React.ReactNode;
  }
>(function TableScreen(
  { title, description, actions, tabs, error, className, children, ...props },
  ref,
) {
  return (
    <div
      ref={ref}
      data-slot="table-screen"
      className={cn(
        "labui:flex labui:h-full labui:min-h-0 labui:min-w-0 labui:flex-col",
        className,
      )}
      {...props}
    >
      <PageHeader
        variant="bar"
        title={title}
        description={description}
        actions={actions}
      />
      {tabs && (
        <div className="labui:px-4 labui:pt-3 labui:sm:px-6">{tabs}</div>
      )}
      {error && (
        <Alert
          variant="destructive"
          className="labui:mx-4 labui:mt-3 labui:w-auto labui:sm:mx-6"
        >
          <AlertTitle>Something went wrong</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="labui:flex labui:min-h-0 labui:flex-1 labui:flex-col labui:p-4 labui:sm:p-6 labui:*:data-[slot=table-frame]:min-h-0 labui:*:data-[slot=table-frame]:flex-1">
        {children}
      </div>
    </div>
  );
});

export { TableScreen };
