import type * as React from "react";

export type SortDirection = "asc" | "desc";
export type TableSort = { column: string; direction: SortDirection };
export type SortValue = string | number | boolean | null | undefined;

export type TableColumn<T> = {
  id: string;
  header: React.ReactNode;
  headerDetail?: React.ReactNode;
  srOnly?: boolean;
  rowHeader?: boolean;
  className?: string | ((row: T, index: number) => string | undefined);
  headClassName?: string;
  cell: (row: T, index: number) => React.ReactNode;
  sortValue?: (row: T) => SortValue;
  // sort marks a column the server sorts, so it has no client comparator
  sort?: boolean;
  align?: "start" | "end" | "center";
  numeric?: boolean;
  width?: string;
  hideBelow?: "sm" | "md" | "lg";
};

const missing = (value: SortValue) =>
  value == null || (typeof value === "number" && Number.isNaN(value));

export function compareValues(left: SortValue, right: SortValue): number {
  if (missing(left) || missing(right))
    return Number(missing(left)) - Number(missing(right));
  if (typeof left === "number" && typeof right === "number")
    return left === right ? 0 : left < right ? -1 : 1;
  if (typeof left === "boolean" && typeof right === "boolean")
    return Number(left) - Number(right);
  return String(left).localeCompare(String(right), undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

export function sortRows<T>(
  rows: readonly T[],
  columns: TableColumn<T>[],
  sort: TableSort | null,
): readonly T[] {
  const column = columns.find((item) => item.id === sort?.column);
  const value = column?.sortValue;
  if (!sort || !value) return rows;
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const order = compareValues(value(a), value(b));
    return missing(value(a)) || missing(value(b)) ? order : order * sign;
  });
}

export const isSortable = <T>(column: TableColumn<T>) =>
  Boolean(column.sortValue) || column.sort === true;

export function nextSort<T>(
  column: TableColumn<T>,
  current: TableSort | null,
): TableSort {
  if (current?.column !== column.id)
    return { column: column.id, direction: column.numeric ? "desc" : "asc" };
  return {
    column: column.id,
    direction: current.direction === "asc" ? "desc" : "asc",
  };
}

export function pageOf<T>(
  rows: readonly T[],
  pageSize: number | undefined,
  page: number,
) {
  const size = pageSize ? Math.max(1, Math.floor(pageSize)) : rows.length || 1;
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const current = Math.min(page, pages - 1);
  return {
    size,
    pages,
    current,
    offset: current * size,
    rows: pageSize ? rows.slice(current * size, (current + 1) * size) : rows,
  };
}

// Clamps the scroll position so filtering a scrolled list still renders rows
export function visibleRowRange(
  count: number,
  scrollTop: number,
  height: number,
  rowHeight: number,
  overscan = 8,
) {
  const viewport = height || 360;
  const top = Math.min(
    Math.max(0, scrollTop),
    Math.max(0, count * rowHeight - viewport),
  );
  const start = Math.min(
    count,
    Math.max(0, Math.floor(top / rowHeight) - overscan),
  );
  const end = Math.min(
    count,
    Math.ceil((top + viewport) / rowHeight) + overscan,
  );
  return { start, end: Math.max(start, end) };
}

export const clampColumnWidth = (width: number) =>
  Math.min(720, Math.max(72, Math.round(width)));

const show = (value: unknown) => (value == null ? "" : String(value));

export function column<T>(
  id: string,
  header: string,
  value: (row: T) => SortValue,
  cell: (row: T) => React.ReactNode = (row) => show(value(row)),
): TableColumn<T> {
  return { id, header, sortValue: value, cell };
}

export const mono = <T>(
  id: string,
  header: string,
  value: (row: T) => unknown,
): TableColumn<T> => ({
  ...column<T>(id, header, (row) => show(value(row))),
  className: "labui:font-mono",
});

export const num = <T>(
  id: string,
  header: string,
  value: (row: T) => number,
  digits = 0,
  headerDetail?: string,
): TableColumn<T> => {
  const formatter = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
  return {
    ...column(id, header, value, (row) => formatter.format(value(row))),
    numeric: true,
    headerDetail,
  };
};
