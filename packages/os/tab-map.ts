import { useLayoutEffect, useRef } from "react";
import type { WorkspaceTab } from "./workspace.js";

// useTabMap keeps a value per open tab and forgets closed tabs
export function useTabMap<V>(tabs: readonly WorkspaceTab[]) {
  const map = useRef(new Map<string, V>());
  useLayoutEffect(() => {
    for (const key of map.current.keys())
      if (!tabs.some((tab) => tab.key === key)) map.current.delete(key);
  }, [tabs]);
  return map.current;
}
