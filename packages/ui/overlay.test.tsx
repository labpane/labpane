import { afterEach, expect, it, mock } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { Dialog, DialogContent, DialogTitle } from "./dialog.js";
import { TabStateContext } from "./tab-state.js";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip.js";

afterEach(cleanup);

function Page({
  active,
  open,
  onOpenChange,
}: {
  active: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <TabStateContext.Provider value={{ active, visible: true }}>
      <Dialog defaultOpen open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogTitle>Settings</DialogTitle>
        </DialogContent>
      </Dialog>
    </TabStateContext.Provider>
  );
}

it("closes an uncontrolled dialog when its tab leaves the front and keeps it closed on return", () => {
  const { rerender } = render(<Page active />);
  expect(screen.getByRole("dialog")).toBeTruthy();
  rerender(<Page active={false} />);
  expect(screen.queryByRole("dialog")).toBeNull();
  rerender(<Page active />);
  expect(screen.queryByRole("dialog")).toBeNull();
});

it("reports the close to a controlled dialog", () => {
  const onOpenChange = mock();
  const { rerender } = render(<Page active open onOpenChange={onOpenChange} />);
  rerender(<Page active={false} open onOpenChange={onOpenChange} />);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it("closes a hover-opened tooltip with its tab", () => {
  const Tip = ({ active }: { active: boolean }) => (
    <TabStateContext.Provider value={{ active, visible: true }}>
      <TooltipProvider>
        <Tooltip defaultOpen>
          <TooltipTrigger>Save</TooltipTrigger>
          <TooltipContent>Saves the draft</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </TabStateContext.Provider>
  );
  const { rerender } = render(<Tip active />);
  expect(screen.getByRole("tooltip")).toBeTruthy();
  rerender(<Tip active={false} />);
  expect(screen.queryByRole("tooltip")).toBeNull();
});
