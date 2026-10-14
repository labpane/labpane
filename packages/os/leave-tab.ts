import { createContext, useContext, useLayoutEffect, useRef } from "react";
import { useTabMap } from "./tab-map.js";
import type { WorkspaceTab } from "./workspace.js";

// useOpeners remembers which tab was in front when each tab was opened or last switched to
export function useOpeners(tabs: readonly WorkspaceTab[], front?: string) {
  const openers = useTabMap<string>(tabs);
  const previous = useRef<{ keys: Set<string>; front?: string }>({
    keys: new Set(),
  });
  useLayoutEffect(() => {
    const keys = new Set(tabs.map((tab) => tab.key));
    const { keys: known, front: before } = previous.current;
    previous.current = { keys, front };
    if (before === undefined || !keys.has(before)) return;
    for (const key of keys)
      if (key !== before && (!known.has(key) || key === front))
        openers.set(key, before);
  }, [tabs, front, openers]);
  return openers;
}

export const LeaveTab = createContext(() => {});

// useLeaveTab closes the current tab and returns to the tab it was opened from while that is open
export function useLeaveTab() {
  return useContext(LeaveTab);
}
