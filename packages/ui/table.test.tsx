import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Table, TableStack } from "./table.js";

afterEach(cleanup);

const sessions = [
  { id: "north", name: "Northstar", events: 18430 },
  { id: "atlas", name: "Atlas", events: 9204 },
  { id: "mica", name: "Mica", events: 7482 },
];
const columns = [
  {
    id: "name",
    header: "Session",
    cell: (row: (typeof sessions)[number]) => row.name,
    sortValue: (row: (typeof sessions)[number]) => row.name,
  },
  {
    id: "events",
    header: "Events",
    numeric: true,
    hideBelow: "md" as const,
    cell: (row: (typeof sessions)[number]) => row.events,
    sortValue: (row: (typeof sessions)[number]) => row.events,
  },
];
const firstCells = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0]?.textContent);

it("sorts from the headers and hides a column below its breakpoint", async () => {
  const user = userEvent.setup();
  render(
    <Table
      label="Sessions"
      rows={sessions}
      rowKey={(row) => row.id}
      columns={columns}
    />,
  );
  const header = (name: string) =>
    screen.getByRole("columnheader", { name: new RegExp(`^${name}`) });
  await user.click(screen.getByRole("button", { name: /^Session/ }));
  expect(header("Session").getAttribute("aria-sort")).toBe("ascending");
  expect(firstCells()).toEqual(["Atlas", "Mica", "Northstar"]);
  await user.click(screen.getByRole("button", { name: /^Events/ }));
  expect(header("Events").getAttribute("aria-sort")).toBe("descending");
  expect(firstCells()).toEqual(["Northstar", "Atlas", "Mica"]);
  expect(header("Events").className).toContain("labui:max-md:hidden");
});

it("activates rows by click and keyboard, skipping clicks on controls", async () => {
  const user = userEvent.setup();
  const activate = mock();
  render(
    <Table
      label="Sessions"
      rows={sessions}
      rowKey={(row) => row.id}
      onRowActivate={activate}
      rowLabel={(row) => `Open ${row.name}`}
      selectedKey="north"
      columns={[
        {
          id: "name",
          header: "Session",
          cell: (row) => (
            <TableStack
              title={row.name}
              detail={<button type="button">Pin</button>}
            />
          ),
        },
      ]}
    />,
  );
  await user.click(
    within(screen.getByRole("row", { name: "Open Atlas" })).getByRole("button"),
  );
  expect(activate).not.toHaveBeenCalled();
  await user.click(screen.getByRole("row", { name: "Open Atlas" }));
  expect(activate).toHaveBeenLastCalledWith(sessions[1]);
  screen.getByRole("row", { name: "Open Northstar" }).focus();
  await user.keyboard("{ArrowDown}{Enter}");
  expect(activate).toHaveBeenLastCalledWith(sessions[1]);
  expect(document.activeElement).toBe(
    screen.getByRole("row", { name: "Open Atlas" }),
  );
  expect(
    screen
      .getByRole("row", { name: "Open Northstar" })
      .getAttribute("aria-selected"),
  ).toBe("true");
});

it("shows skeleton rows while loading, the empty message otherwise, and pages", async () => {
  const user = userEvent.setup();
  const { rerender } = render(
    <Table
      label="Sessions"
      rows={sessions}
      rowKey={(row) => row.id}
      columns={columns}
      loading
      skeletonRows={2}
    />,
  );
  expect(screen.getByRole("status").textContent).toBe("Loading rows");
  expect(
    document.querySelectorAll("[data-slot=table-skeleton-row]"),
  ).toHaveLength(2);
  rerender(
    <Table
      label="Sessions"
      rows={[]}
      rowKey={(row: (typeof sessions)[number]) => row.id}
      columns={columns}
      empty="Nothing yet"
    />,
  );
  expect(screen.getByText("Nothing yet")).toBeTruthy();
  rerender(
    <Table
      label="Sessions"
      rows={sessions}
      rowKey={(row) => row.id}
      columns={columns}
      pageSize={2}
    />,
  );
  expect(firstCells()).toEqual(["Northstar", "Atlas"]);
  await user.click(screen.getByRole("button", { name: "Next page" }));
  expect(firstCells()).toEqual(["Mica"]);
  expect(screen.getByText("3 to 3 of 3")).toBeTruthy();
});
