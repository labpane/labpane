import { afterEach, expect, it, mock } from "bun:test";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button.js";
import { ConfirmDialog, matchesConfirmation } from "./confirm-dialog.js";

afterEach(cleanup);

const confirm = () =>
  screen.getByRole<HTMLButtonElement>("button", { name: "Delete" });

it("matches exactly by default and loosely on request", () => {
  expect(
    matchesConfirmation("warmup", { value: "Warmup", label: "Name" }),
  ).toBe(false);
  expect(
    matchesConfirmation(" warmup ", {
      value: "Warmup",
      label: "Name",
      match: "loose",
    }),
  ).toBe(true);
});

it("enables the action only for a matching entry and submits with Ctrl+Enter", async () => {
  const user = userEvent.setup();
  const onConfirm = mock();
  render(
    <ConfirmDialog
      defaultOpen
      title="Delete preset"
      confirmLabel="Delete"
      confirmation={{ value: "Warmup", label: "Preset name" }}
      onConfirm={onConfirm}
    />,
  );
  const input = screen.getByRole("textbox", { name: "Preset name" });
  expect(document.activeElement).toBe(input);
  expect(confirm().disabled).toBe(true);
  await user.type(input, "Warmup");
  expect(confirm().disabled).toBe(false);
  await user.keyboard("{Control>}{Enter}{/Control}");
  await waitFor(() => expect(onConfirm).toHaveBeenCalledTimes(1));
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
});

it("focuses Cancel without an entry and returns focus to the trigger on Escape", async () => {
  const user = userEvent.setup();
  render(
    <ConfirmDialog
      trigger={<Button>Open</Button>}
      title="Delete preset"
      confirmLabel="Delete"
      onConfirm={() => {}}
    />,
  );
  const trigger = screen.getByRole("button", { name: "Open" });
  await user.click(trigger);
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Cancel" }),
  );
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("alertdialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("blocks closing while busy, then keeps failures open with the app's message", async () => {
  const user = userEvent.setup();
  let finish!: () => void;
  const onConfirm = mock(
    () => new Promise<void>((resolve) => (finish = resolve)),
  );
  render(
    <ConfirmDialog
      defaultOpen
      title="Delete preset"
      confirmLabel="Delete"
      pendingLabel="Deleting"
      onConfirm={onConfirm}
      errorMessage="Could not delete."
    />,
  );
  await user.click(confirm());
  expect(
    screen.getByRole("button", { name: "Deleting" }).hasAttribute("disabled"),
  ).toBe(true);
  await user.keyboard("{Escape}");
  expect(screen.getByRole("alertdialog")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  await act(async () => finish());
  await waitFor(() => expect(screen.queryByRole("alertdialog")).toBeNull());
});

it("shows the app's error copy instead of the failure's details", async () => {
  const user = userEvent.setup();
  const onConfirm = mock(() => Promise.reject(new Error("internal")));
  render(
    <ConfirmDialog
      defaultOpen
      title="Delete preset"
      confirmLabel="Delete"
      onConfirm={onConfirm}
      errorMessage="Could not delete."
    />,
  );
  await user.click(confirm());
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Could not delete.",
  );
  expect(screen.queryByText("internal")).toBeNull();
});

it("asks for the name when typeToConfirm is set", () => {
  render(
    <ConfirmDialog
      defaultOpen
      title="Delete"
      name="orion"
      typeToConfirm
      confirmLabel="Delete"
      onConfirm={() => {}}
    />,
  );
  expect(screen.getByRole("textbox", { name: "Name" })).toBeTruthy();
  expect(screen.getByRole("button", { name: "Copy name" })).toBeTruthy();
});
