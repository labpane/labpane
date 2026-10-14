import * as React from "react";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";
import { Button } from "./button.js";
import { cn } from "./classes.js";
import { Skeleton } from "./skeleton.js";
import { Spinner } from "./spinner.js";
import {
  useColumnResize,
  useLoadMore,
  useTableWindow,
} from "./table-layout.js";
import {
  isSortable,
  nextSort,
  pageOf,
  sortRows,
  type SortDirection,
  type TableColumn,
  type TableSort,
} from "./table-model.js";

export type {
  SortDirection,
  SortValue,
  TableColumn,
  TableSort,
} from "./table-model.js";
export { column, mono, num } from "./table-model.js";

export type TableProps<T> = {
  label?: string;
  caption?: string;
  columns: TableColumn<T>[];
  rows: readonly T[];
  rowKey: (row: T, index: number) => string;
  empty?: React.ReactNode;
  className?: string;
  tableClassName?: string;
  scrollClassName?: string;
  rowClassName?: (row: T) => string | undefined;
  loading?: boolean;
  skeletonRows?: number;
  sort?: TableSort | null;
  defaultSort?: TableSort | null;
  onSortChange?: (sort: TableSort | null) => void;
  clientSort?: boolean;
  sortDisabled?: boolean;
  onRowActivate?: (row: T) => void;
  rowLabel?: (row: T) => string;
  selectedKey?: string | null;
  pageSize?: number;
  // rowHeight fixes every row's height and renders only the rows on screen
  rowHeight?: number;
  onLoadMore?: () => void | Promise<void>;
  hasMore?: boolean;
  banner?: React.ReactNode;
  tabs?: React.ReactNode;
  footerStart?: React.ReactNode;
  footerCenter?: React.ReactNode;
  footerEnd?: React.ReactNode;
};

const cellPadding = "labui:px-3 labui:py-(--labui-row-py)";
const hidden = {
  sm: "labui:max-sm:hidden",
  md: "labui:max-md:hidden",
  lg: "labui:max-lg:hidden",
};

function columnClasses<T>(column: TableColumn<T>) {
  return cn(
    (column.numeric || column.align === "end") && "labui:text-right",
    column.align === "center" && "labui:text-center",
    column.numeric && "labui:tabular-nums",
    column.hideBelow && hidden[column.hideBelow],
  );
}

const isControl = (target: EventTarget | null) =>
  target instanceof Element &&
  Boolean(
    target.closest(
      "a, button, input, select, textarea, label, [role=checkbox]",
    ),
  );

const pixels = (width?: string) =>
  width?.endsWith("px") ? parseFloat(width) : undefined;

const sortMarkers = {
  asc: ArrowUpIcon,
  desc: ArrowDownIcon,
  none: ArrowUpDownIcon,
};
const ariaSort = {
  asc: "ascending",
  desc: "descending",
  none: "none",
} as const;

function ResizeHandle({
  label,
  width,
  onDrag,
  onStep,
}: {
  label: string;
  width: number;
  onDrag: (event: React.PointerEvent<HTMLElement>, initial: number) => void;
  onStep: (initial: number, delta: number) => void;
}) {
  const measured = (element: HTMLElement) =>
    element.closest("th")?.getBoundingClientRect().width || width;
  return (
    <span
      role="separator"
      aria-orientation="vertical"
      aria-label={`Resize ${label} column`}
      aria-valuenow={width}
      aria-valuemin={72}
      aria-valuemax={720}
      tabIndex={0}
      className="labui:absolute labui:inset-y-0 labui:right-0 labui:w-1.5 labui:cursor-col-resize labui:touch-none labui:hover:bg-foreground/25 labui:focus-visible:bg-foreground/40 labui:focus-visible:outline-none"
      onPointerDown={(event) => onDrag(event, measured(event.currentTarget))}
      onKeyDown={(event) => {
        const delta =
          event.key === "ArrowRight" ? 16 : event.key === "ArrowLeft" ? -16 : 0;
        if (!delta) return;
        event.preventDefault();
        onStep(measured(event.currentTarget), delta);
      }}
    />
  );
}

function HeaderCell<T>({
  column,
  direction,
  width,
  disabled,
  onSort,
  resize,
}: {
  column: TableColumn<T>;
  direction: SortDirection | "none";
  width: number | undefined;
  disabled: boolean;
  onSort: (() => void) | undefined;
  resize: ReturnType<typeof useColumnResize>;
}) {
  const Marker = sortMarkers[direction];
  const title = typeof column.header === "string" ? column.header : undefined;
  const header = column.srOnly ? (
    <span className="labui:sr-only">{column.header}</span>
  ) : (
    column.header
  );
  return (
    <th
      scope="col"
      aria-sort={onSort ? ariaSort[direction] : undefined}
      style={{ width: width ?? column.width }}
      className={cn(
        "labui:sticky labui:top-0 labui:z-10 labui:h-8 labui:bg-card labui:px-3 labui:text-left labui:align-middle labui:text-xs labui:font-medium labui:whitespace-nowrap labui:text-muted-foreground labui:shadow-[inset_0_-1px_var(--labui-border)]",
        columnClasses(column),
        column.headClassName,
      )}
    >
      {onSort ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="labui:-mx-2 labui:h-7 labui:gap-1 labui:px-2 labui:text-xs labui:font-medium labui:hover:bg-transparent"
          disabled={disabled}
          onClick={onSort}
        >
          {header}
          <Marker
            aria-hidden="true"
            className={cn(
              "labui:size-3.5",
              direction === "none" && "labui:opacity-40",
            )}
          />
        </Button>
      ) : (
        header
      )}
      {column.headerDetail && (
        <span className="labui:block labui:text-[10px] labui:font-normal">
          {column.headerDetail}
        </span>
      )}
      {title && !column.srOnly && (
        <ResizeHandle
          label={title}
          width={width ?? pixels(column.width) ?? 180}
          onDrag={(event, initial) => resize.start(event, column.id, initial)}
          onStep={(initial, delta) => resize.change(column.id, initial + delta)}
        />
      )}
    </th>
  );
}

function SkeletonRows<T>({
  columns,
  count,
}: {
  columns: TableColumn<T>[];
  count: number;
}) {
  return Array.from({ length: count }, (_, index) => (
    <tr key={index} data-slot="table-skeleton-row" aria-hidden="true">
      {columns.map((column, at) => (
        <td
          key={column.id}
          className={cn(cellPadding, "labui:border-b", columnClasses(column))}
        >
          <Skeleton
            className={cn("labui:h-3", at % 2 ? "labui:w-1/2" : "labui:w-3/4")}
          />
        </td>
      ))}
    </tr>
  ));
}

function Spacer({ height, span }: { height: number; span: number }) {
  return height > 0 ? (
    <tr aria-hidden="true" style={{ height }}>
      <td colSpan={span} className="labui:p-0">
        <span className="labui:sr-only">Rows out of view</span>
      </td>
    </tr>
  ) : null;
}

function useRovingRows(
  interactive: boolean,
  keys: string[],
  selectedKey?: string | null,
) {
  const [focusKey, setFocusKey] = React.useState<string | null>(null);
  const pending = React.useRef<string | undefined>(undefined);
  const bodyRef = React.useRef<HTMLTableSectionElement>(null);

  React.useEffect(() => {
    if (!interactive) return;
    setFocusKey((current) =>
      current && keys.includes(current)
        ? current
        : selectedKey && keys.includes(selectedKey)
          ? selectedKey
          : (keys[0] ?? null),
    );
  }, [interactive, keys, selectedKey]);

  React.useLayoutEffect(() => {
    const key = pending.current;
    if (!key) return;
    const row = bodyRef.current?.querySelector<HTMLElement>(
      `[data-key="${CSS.escape(key)}"]`,
    );
    if (row) {
      row.focus();
      pending.current = undefined;
    }
  });

  function focusRow(key: string) {
    setFocusKey(key);
    pending.current = key;
  }

  return { bodyRef, focusKey, setFocusKey, focusRow };
}

function Table<T>({
  label,
  caption,
  columns,
  rows,
  rowKey,
  empty = "No rows to display.",
  className,
  tableClassName,
  scrollClassName,
  rowClassName,
  loading = false,
  skeletonRows = 6,
  sort,
  defaultSort = null,
  onSortChange,
  clientSort = true,
  sortDisabled = false,
  onRowActivate,
  rowLabel,
  selectedKey,
  pageSize,
  rowHeight,
  onLoadMore,
  hasMore = false,
  banner,
  tabs,
  footerStart,
  footerCenter,
  footerEnd,
}: TableProps<T>) {
  const statusId = React.useId();
  const [ownSort, setOwnSort] = React.useState<TableSort | null>(defaultSort);
  const activeSort = sort === undefined ? ownSort : sort;
  const [page, setPage] = React.useState(0);
  const interactive = Boolean(onRowActivate);

  const sorted = React.useMemo(
    () => (loading || !clientSort ? rows : sortRows(rows, columns, activeSort)),
    [activeSort, clientSort, columns, loading, rows],
  );
  const paged = React.useMemo(
    () => pageOf(sorted, pageSize, page),
    [sorted, pageSize, page],
  );
  const { scrollRef, range, reveal, viewportHeight } = useTableWindow(
    paged.rows.length,
    rowHeight,
  );
  const visible = paged.rows.slice(range.start, range.end);
  const keys = React.useMemo(
    () => paged.rows.map((row, index) => rowKey(row, paged.offset + index)),
    [paged, rowKey],
  );
  const roving = useRovingRows(interactive && !loading, keys, selectedKey);
  const resize = useColumnResize();
  const more = useLoadMore(scrollRef, onLoadMore, hasMore);

  React.useEffect(() => setPage(0), [rows, pageSize, activeSort]);

  function changeSort(column: TableColumn<T>) {
    const next = nextSort(column, activeSort);
    if (sort === undefined) setOwnSort(next);
    onSortChange?.(next);
  }

  function focusIndex(index: number) {
    const key = keys[Math.max(0, Math.min(keys.length - 1, index))];
    if (!key) return;
    roving.focusRow(key);
    reveal(keys.indexOf(key));
  }

  function rowKeyDown(row: T, at: number, event: React.KeyboardEvent) {
    if (event.target !== event.currentTarget) return;
    const pageStep = Math.max(
      1,
      Math.floor(viewportHeight / (rowHeight || 36)),
    );
    const moves: Record<string, number> = {
      ArrowDown: at + 1,
      ArrowUp: at - 1,
      Home: 0,
      End: keys.length - 1,
      PageDown: at + pageStep,
      PageUp: at - pageStep,
    };
    if (event.key in moves) {
      event.preventDefault();
      focusIndex(moves[event.key]!);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onRowActivate?.(row);
    }
  }

  const span = columns.length;
  const fixed = Boolean(rowHeight) || Object.keys(resize.widths).length > 0;
  const showFooter =
    footerStart || footerCenter || footerEnd || paged.pages > 1;

  return (
    <div
      data-slot="table-frame"
      className={cn(
        "labui:flex labui:min-w-0 labui:flex-col labui:overflow-hidden labui:rounded-lg labui:border",
        className,
      )}
    >
      {banner}
      {tabs}
      {loading && (
        <span id={statusId} role="status" className="labui:sr-only">
          Loading rows
        </span>
      )}
      <div
        ref={scrollRef}
        data-slot="table-container"
        className={cn(
          "labui:relative labui:w-full labui:min-w-0 labui:overflow-auto",
          rowHeight && "labui:max-h-[calc(100dvh-16rem)]",
          scrollClassName,
        )}
      >
        <table
          data-slot="table"
          aria-label={caption ? undefined : label}
          aria-busy={loading || undefined}
          aria-describedby={loading ? statusId : undefined}
          aria-rowcount={rowHeight ? rows.length + 1 : undefined}
          className={cn(
            "labui:w-full labui:caption-bottom labui:text-xs labui:tabular-nums",
            fixed && "labui:table-fixed",
            tableClassName,
          )}
        >
          {caption && <caption className="labui:sr-only">{caption}</caption>}
          <thead>
            <tr>
              {columns.map((column) => (
                <HeaderCell
                  key={column.id}
                  column={column}
                  direction={
                    activeSort?.column === column.id
                      ? activeSort.direction
                      : "none"
                  }
                  width={resize.widths[column.id]}
                  disabled={sortDisabled || loading}
                  onSort={
                    isSortable(column) ? () => changeSort(column) : undefined
                  }
                  resize={resize}
                />
              ))}
            </tr>
          </thead>
          <tbody ref={roving.bodyRef}>
            {loading ? (
              <SkeletonRows columns={columns} count={skeletonRows} />
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={span}
                  className="labui:p-4 labui:text-muted-foreground"
                >
                  {empty}
                </td>
              </tr>
            ) : (
              <>
                {rowHeight && (
                  <Spacer height={range.start * rowHeight} span={span} />
                )}
                {visible.map((row, visibleIndex) => {
                  const at = range.start + visibleIndex;
                  const index = paged.offset + at;
                  const key = keys[at]!;
                  const selected = selectedKey === key;
                  return (
                    <tr
                      key={key}
                      data-key={key}
                      data-state={selected ? "selected" : undefined}
                      aria-rowindex={rowHeight ? index + 2 : undefined}
                      aria-selected={interactive ? selected : undefined}
                      aria-label={rowLabel?.(row)}
                      tabIndex={
                        interactive
                          ? roving.focusKey === key
                            ? 0
                            : -1
                          : undefined
                      }
                      style={rowHeight ? { height: rowHeight } : undefined}
                      className={cn(
                        "labui:border-b labui:transition-colors labui:hover:bg-muted/50 labui:data-[state=selected]:bg-muted",
                        interactive &&
                          "labui:cursor-pointer labui:focus-visible:ring-[3px] labui:focus-visible:ring-ring/50 labui:focus-visible:ring-inset labui:focus-visible:outline-none",
                        rowClassName?.(row),
                      )}
                      onFocus={
                        interactive ? () => roving.setFocusKey(key) : undefined
                      }
                      onClick={
                        interactive
                          ? (event) => {
                              if (!isControl(event.target))
                                onRowActivate?.(row);
                            }
                          : undefined
                      }
                      onKeyDown={
                        interactive
                          ? (event) => rowKeyDown(row, at, event)
                          : undefined
                      }
                    >
                      {columns.map((column) => {
                        const Cell = column.rowHeader ? "th" : "td";
                        const content = column.cell(row, index);
                        return (
                          <Cell
                            key={column.id}
                            scope={column.rowHeader ? "row" : undefined}
                            className={cn(
                              cellPadding,
                              "labui:align-middle",
                              column.rowHeader &&
                                "labui:text-left labui:font-medium labui:text-foreground",
                              typeof column.className === "function"
                                ? column.className(row, index)
                                : column.className,
                              columnClasses(column),
                              rowHeight &&
                                "labui:overflow-hidden labui:py-0 labui:text-ellipsis labui:whitespace-nowrap",
                            )}
                          >
                            {rowHeight ? (
                              <div
                                className={cn(
                                  "labui:flex labui:items-center labui:overflow-hidden",
                                  (column.numeric || column.align === "end") &&
                                    "labui:justify-end",
                                )}
                                style={{ height: rowHeight - 1 }}
                              >
                                {content}
                              </div>
                            ) : (
                              content
                            )}
                          </Cell>
                        );
                      })}
                    </tr>
                  );
                })}
                {rowHeight && (
                  <Spacer
                    height={(paged.rows.length - range.end) * rowHeight}
                    span={span}
                  />
                )}
              </>
            )}
            {onLoadMore && hasMore && !loading && (
              <tr ref={more.sentinel} data-slot="table-load-more">
                <td colSpan={span} className="labui:p-3 labui:text-center">
                  {more.loading && <Spinner className="labui:inline-block" />}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showFooter && (
        <div
          data-slot="table-footer"
          className="labui:flex labui:flex-wrap labui:items-center labui:justify-between labui:gap-3 labui:border-t labui:px-3 labui:py-2 labui:text-xs"
        >
          <div className="labui:flex labui:items-center labui:gap-2">
            {footerStart}
          </div>
          <div className="labui:flex labui:items-center labui:gap-2">
            {footerCenter}
            {paged.pages > 1 && (
              <Pager
                page={paged.current}
                pages={paged.pages}
                from={paged.offset + 1}
                to={Math.min(paged.offset + paged.size, sorted.length)}
                total={sorted.length}
                onChange={setPage}
              />
            )}
          </div>
          <div className="labui:flex labui:items-center labui:gap-2">
            {footerEnd}
          </div>
        </div>
      )}
    </div>
  );
}

function Pager({
  page,
  pages,
  from,
  to,
  total,
  onChange,
}: {
  page: number;
  pages: number;
  from: number;
  to: number;
  total: number;
  onChange: (page: number) => void;
}) {
  return (
    <>
      <span aria-live="polite">
        {from} to {to} of {total}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        Previous page
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={page + 1 === pages}
        onClick={() => onChange(page + 1)}
      >
        Next page
      </Button>
    </>
  );
}

function TableStack({
  title,
  detail,
}: {
  title: React.ReactNode;
  detail?: React.ReactNode;
}) {
  return (
    <>
      {title}
      {detail && (
        <div
          data-slot="table-stack-detail"
          className="labui:mt-0.5 labui:text-xs labui:font-normal labui:text-muted-foreground"
        >
          {detail}
        </div>
      )}
    </>
  );
}

export { Table, TableStack };
