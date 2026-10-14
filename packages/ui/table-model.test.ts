import { expect, it } from "bun:test";
import {
  compareValues,
  nextSort,
  pageOf,
  sortRows,
  visibleRowRange,
  type TableColumn,
} from "./table-model.js";

type Row = { name: string; size: number | null };
const rows: Row[] = [
  { name: "beta", size: 2 },
  { name: "Alpha", size: null },
  { name: "gamma", size: 10 },
];
const columns: TableColumn<Row>[] = [
  {
    id: "name",
    header: "Name",
    cell: (row) => row.name,
    sortValue: (row) => row.name,
  },
  {
    id: "size",
    header: "Size",
    cell: (row) => row.size,
    sortValue: (row) => row.size,
    numeric: true,
  },
];

it("compares numbers, booleans and text, with missing values last", () => {
  expect(compareValues(2, 10)).toBeLessThan(0);
  expect(compareValues("item 2", "item 10")).toBeLessThan(0);
  expect(compareValues("a", "B")).toBeLessThan(0);
  expect(compareValues(true, false)).toBeGreaterThan(0);
  expect(compareValues(null, 1)).toBeGreaterThan(0);
  expect(compareValues(Number.NaN, 1)).toBeGreaterThan(0);
});

it("keeps missing values at the end in both directions", () => {
  const names = (sorted: readonly Row[]) => sorted.map((row) => row.name);
  expect(
    names(sortRows(rows, columns, { column: "size", direction: "asc" })),
  ).toEqual(["beta", "gamma", "Alpha"]);
  expect(
    names(sortRows(rows, columns, { column: "size", direction: "desc" })),
  ).toEqual(["gamma", "beta", "Alpha"]);
  expect(sortRows(rows, columns, null)).toBe(rows);
});

it("sorts text ascending first and numbers descending first, then flips", () => {
  expect(nextSort(columns[0]!, null)).toEqual({
    column: "name",
    direction: "asc",
  });
  expect(nextSort(columns[1]!, null)).toEqual({
    column: "size",
    direction: "desc",
  });
  expect(nextSort(columns[1]!, { column: "size", direction: "desc" })).toEqual({
    column: "size",
    direction: "asc",
  });
});

it("pages rows and clamps the page to what exists", () => {
  expect(pageOf(rows, 2, 5)).toMatchObject({
    pages: 2,
    current: 1,
    offset: 2,
    rows: [rows[2]],
  });
  expect(pageOf(rows, undefined, 0).rows).toBe(rows);
});

it("keeps filtered rows visible when the old scroll position is past the end", () => {
  expect(visibleRowRange(2, 35000, 360, 36)).toEqual({ start: 0, end: 2 });
  expect(visibleRowRange(0, 35000, 360, 36)).toEqual({ start: 0, end: 0 });
  expect(visibleRowRange(1000, 3600, 360, 36)).toEqual({ start: 92, end: 118 });
});
