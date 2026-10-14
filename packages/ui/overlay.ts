import * as React from "react";
import { useTabActive } from "./tab-state.js";

// Overlays close when their tab leaves the front and stay closed when it returns
export function useOverlayOpen(
  open: boolean | undefined,
  onOpenChange: ((open: boolean) => void) | undefined,
  defaultOpen = false,
): [boolean, (open: boolean) => void] {
  const [own, setOwn] = React.useState(defaultOpen);
  const current = open ?? own;
  const active = useTabActive();
  const change = React.useCallback(
    (next: boolean) => {
      setOwn(next);
      onOpenChange?.(next);
    },
    [onOpenChange],
  );
  React.useEffect(() => {
    if (!active && current) change(false);
  }, [active, current, change]);
  return [current, change];
}
