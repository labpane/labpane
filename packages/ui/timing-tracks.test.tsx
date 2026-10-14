import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { TimingTracks, type TimingSpan } from "./timing-tracks.js";

afterEach(cleanup);

it("retains overlapping observations and exposes original timings when selecting a clipped span", () => {
  const span = {
    id: "query",
    start: 5,
    end: 15,
    label: "GPU result",
    uncertain: true,
    detail: "Availability observed, not execution time.",
  };
  const select = mock((_span: TimingSpan) => {});
  render(
    <TimingTracks
      from={10}
      to={20}
      tracks={[
        {
          id: "gpu",
          label: "Pending queries",
          spans: [span, { id: "past", start: 0, end: 2, label: "Old query" }],
        },
      ]}
      onSelect={select}
    />,
  );
  expect(screen.queryByRole("button", { name: /Old query/ })).toBeNull();
  const query = screen.getByRole("button", {
    name: "GPU result, 5 to 15 ms, observation window",
  });
  fireEvent.focus(query);
  expect(screen.getByText(span.detail)).toBeTruthy();
  fireEvent.click(query);
  expect(select).toHaveBeenCalledWith(span);
});
