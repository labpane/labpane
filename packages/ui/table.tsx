import * as React from "react";
import { type ReactNode } from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
const show = (value: unknown) => (value == null ? "" : String(value));
import { Button, cn, Skeleton } from "./primitives.js";

export type TableColumn<T> = {
  id: string;
  header: string;
  headerDetail?: string;
  rowHeader?: boolean;
  numeric?: boolean;
  cell: (row: T) => React.ReactNode;
  sortValue: (row: T) => string | number | null | undefined;
};

type Sort = { column: string; direction: "asc" | "desc" };

const cellClass = "labui:px-3 labui:py-(--labui-row-py) labui:align-middle";

export function Table<T>({
  label,
  columns,
  rows,
  rowKey,
  loading,
  empty = "No rows to display.",
  defaultSort = null,
  onRowActivate,
  rowLabel,
}: {
  label: string;
  columns: TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T, index: number) => string;
  loading?: boolean;
  empty?: React.ReactNode;
  defaultSort?: Sort | null;
  onRowActivate?: (row: T) => void;
  rowLabel?: (row: T) => string;
}) {
  const [sort, setSort] = React.useState(defaultSort);
  const sortBy = columns.find((c) => c.id === sort?.column)?.sortValue;
  const sorted =
    sort && sortBy
      ? [...rows].sort((x, y) => {
          const a = sortBy(x);
          const b = sortBy(y);
          if (a == null || b == null)
            return Number(a == null) - Number(b == null);
          const order =
            typeof a === "number" && typeof b === "number"
              ? a - b
              : String(a).localeCompare(String(b), undefined, {
                  numeric: true,
                });
          return sort.direction === "asc" ? order : -order;
        })
      : rows;

  function toggle(column: TableColumn<T>) {
    setSort(
      sort?.column === column.id
        ? {
            column: column.id,
            direction: sort.direction === "asc" ? "desc" : "asc",
          }
        : { column: column.id, direction: column.numeric ? "desc" : "asc" },
    );
  }

  return (
    <div className="labui:min-w-0 labui:overflow-auto labui:rounded-lg labui:border">
      <table
        aria-label={label}
        aria-busy={loading || undefined}
        className="labui:w-full labui:text-xs labui:tabular-nums"
      >
        <thead>
          <tr>
            {columns.map((column) => {
              const direction =
                sort?.column === column.id ? sort.direction : null;
              const Marker =
                direction === "asc"
                  ? ArrowUpIcon
                  : direction === "desc"
                    ? ArrowDownIcon
                    : ArrowUpDownIcon;
              return (
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    direction
                      ? direction === "asc"
                        ? "ascending"
                        : "descending"
                      : undefined
                  }
                  className={cn(
                    "labui:sticky labui:top-0 labui:z-10 labui:h-8 labui:bg-card labui:px-3 labui:text-left labui:font-medium labui:whitespace-nowrap labui:text-muted-foreground labui:shadow-[inset_0_-1px_var(--labui-border)]",
                    column.numeric && "labui:text-right",
                  )}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="labui:-mx-2 labui:h-7 labui:gap-1 labui:px-2 labui:text-xs labui:font-medium labui:hover:bg-transparent"
                    disabled={loading}
                    onClick={() => toggle(column)}
                  >
                    {column.header}
                    {column.headerDetail && (
                      <span className="labui:text-[10px] labui:font-normal">
                        {column.headerDetail}
                      </span>
                    )}
                    <Marker
                      aria-hidden="true"
                      className={cn(
                        "labui:size-3.5",
                        !direction && "labui:opacity-40",
                      )}
                    />
                  </Button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="labui:[&_tr:last-child]:border-0">
          {loading ? (
            Array.from({ length: 6 }, (_, index) => (
              <tr key={index} aria-hidden="true" className="labui:border-b">
                {columns.map((column, at) => (
                  <td key={column.id} className={cellClass}>
                    <Skeleton
                      className={cn(
                        "labui:h-3",
                        at % 2 ? "labui:w-1/2" : "labui:w-3/4",
                      )}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : sorted.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="labui:p-4 labui:text-muted-foreground"
              >
                {empty}
              </td>
            </tr>
          ) : (
            sorted.map((row, index) => (
              <tr
                key={rowKey(row, index)}
                className={cn(
                  "labui:border-b labui:transition-colors labui:hover:bg-muted/50",
                  onRowActivate && "labui:cursor-pointer",
                )}
                onClick={(event) => {
                  if (!(event.target as Element).closest("a, button"))
                    onRowActivate?.(row);
                }}
              >
                {columns.map((column, at) => {
                  const Cell = column.rowHeader ? "th" : "td";
                  return (
                    <Cell
                      key={column.id}
                      scope={column.rowHeader ? "row" : undefined}
                      className={cn(
                        cellClass,
                        column.rowHeader && "labui:text-left labui:font-medium",
                        column.numeric && "labui:text-right",
                      )}
                    >
                      {at === 0 && onRowActivate ? (
                        <button
                          type="button"
                          aria-label={rowLabel?.(row)}
                          className="labui:-m-1 labui:min-h-6 labui:rounded labui:p-1 labui:text-left labui:whitespace-nowrap labui:focus-visible:outline-2 labui:focus-visible:outline-ring"
                          onClick={() => onRowActivate(row)}
                        >
                          {column.cell(row)}
                        </button>
                      ) : (
                        column.cell(row)
                      )}
                    </Cell>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export function column<T>(
  id: string,
  header: string,
  value: (row: T) => string | number | null | undefined,
  cell: (row: T) => ReactNode = (row) => show(value(row)),
): TableColumn<T> {
  return { id, header, sortValue: value, cell };
}

export const mono = <T,>(
  id: string,
  header: string,
  value: (row: T) => unknown,
) =>
  column<T>(
    id,
    header,
    (row) => show(value(row)),
    (row) => <span className="labui:font-mono">{show(value(row))}</span>,
  );

export const num = <T,>(
  id: string,
  header: string,
  value: (row: T) => number,
  digits = 0,
  headerDetail?: string,
): TableColumn<T> => ({
  ...column(id, header, value, (row) =>
    value(row).toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }),
  ),
  numeric: true,
  headerDetail,
});
