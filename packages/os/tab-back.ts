import { createContext, useContext, useSyncExternalStore } from "react";
import { useTabHistory } from "./tab-history.js";

export type TabBack = { canGoBack: boolean; back: () => void };

/** Selection history belongs to a pane; going back never closes its tabs. */
export function createPaneBack() {
  let active: string | undefined;
  let pending: string | undefined;
  let previous: string[] = [];
  let available = new Set<string>();
  let select = (_key: string) => {};
  const listeners = new Set<() => void>();
  const back = () => {
    const key = previous.pop();
    if (!key) return;
    pending = key;
    publish();
    select(key);
  };
  let snapshot: TabBack = { canGoBack: false, back };
  function publish() {
    const canGoBack = previous.length > 0;
    if (snapshot.canGoBack === canGoBack) return;
    snapshot = { canGoBack, back };
    listeners.forEach((listener) => listener());
  }
  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get: () => snapshot,
    update(
      key: string | undefined,
      keys: readonly string[],
      onSelect: (key: string) => void,
    ) {
      available = new Set(keys);
      select = onSelect;
      previous = previous.filter((entry) => available.has(entry));
      if (key !== active) {
        if (pending !== key && active && available.has(active))
          previous.push(active);
        active = key;
        pending = undefined;
      }
      while (previous.at(-1) === active && previous.length) previous.pop();
      publish();
    },
  };
}

export type PaneBackStore = ReturnType<typeof createPaneBack>;
export const TabBackContext = createContext(createPaneBack());

/** Return within this tab's view history first, then to the pane's previous tab. */
export function useTabBack(): TabBack {
  const history = useTabHistory();
  const store = useContext(TabBackContext);
  const pane = useSyncExternalStore(store.subscribe, store.get, store.get);
  return history.canGoBack ? { canGoBack: true, back: history.back } : pane;
}
