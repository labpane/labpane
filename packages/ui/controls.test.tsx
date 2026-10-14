import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FieldError } from "./field.js";
import { NavTab, NavTabs } from "./nav-tabs.js";
import { SearchInput } from "./search-input.js";
import { resolveDrag, sidePanelLimits } from "./side-panel.js";
import { themeCss } from "./theme.js";

afterEach(cleanup);

it("clears the search from its button and refocuses the field", async () => {
  const user = userEvent.setup();
  const onClear = mock();
  render(<SearchInput aria-label="Find" onClear={onClear} />);
  expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  const input = screen.getByRole<HTMLInputElement>("searchbox", {
    name: "Find",
  });
  await user.type(input, "atlas");
  await user.click(screen.getByRole("button", { name: "Clear" }));
  expect(input.value).toBe("");
  expect(onClear).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(input);
});

it("moves between navigation tabs with the arrow keys", async () => {
  const user = userEvent.setup();
  render(
    <NavTabs aria-label="Sections">
      <NavTab href="#a" active>
        Schema
      </NavTab>
      <NavTab href="#b">Rows</NavTab>
    </NavTabs>,
  );
  screen.getByRole("link", { name: "Schema" }).focus();
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "Rows" }),
  );
  await user.keyboard("{ArrowRight}");
  expect(document.activeElement).toBe(
    screen.getByRole("link", { name: "Schema" }),
  );
  expect(
    screen.getByRole("link", { name: "Schema" }).getAttribute("aria-current"),
  ).toBe("page");
});

it("lists distinct error messages and renders nothing without any", () => {
  const { container, rerender } = render(
    <FieldError
      errors={[
        { message: "Required" },
        { message: "Required" },
        { message: "Too long" },
      ]}
    />,
  );
  expect(
    screen.getAllByRole("listitem").map((item) => item.textContent),
  ).toEqual(["Required", "Too long"]);
  rerender(<FieldError errors={[undefined]} />);
  expect(container.innerHTML).toBe("");
});

it("closes a side panel dragged past the slack and caps it to leave the main column room", () => {
  expect(resolveDrag(100, 1200, sidePanelLimits)).toEqual({
    open: false,
    width: 200,
  });
  expect(resolveDrag(150, 1200, sidePanelLimits)).toEqual({
    open: true,
    width: 200,
  });
  expect(resolveDrag(900, 1200, sidePanelLimits)).toEqual({
    open: true,
    width: 480,
  });
  expect(resolveDrag(400, 600, sidePanelLimits)).toEqual({
    open: true,
    width: 280,
  });
});

it("writes a theme as tokens for both packages", () => {
  const css = themeCss({
    light: { primary: "#a00", background: "#fff" },
    dark: { primary: "#f88" },
    radius: "4px",
    fonts: { sans: "Inter" },
  });
  expect(css).toBe(
    ":root{--labui-primary:#a00;--labui-background:#fff;--lab-background:#fff;--labui-font-sans:Inter;--lab-font-sans:Inter;--labui-radius:4px}\n.dark{--labui-primary:#f88}",
  );
  expect(themeCss({}, ".app")).toBe("");
});
