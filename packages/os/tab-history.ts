import { createContext, useContext, useSyncExternalStore } from "react";
import { useTabMap } from "./tab-map.js";
import type { WorkspaceTab } from "./workspace.js";

export type TabHistory = {
  path: string;
  canGoBack: boolean;
  canGoForward: boolean;
  navigate: (path: string) => void;
  back: () => void;
  forward: () => void;
};
export type TabHistoryStore = {
  subscribe: (listener: () => void) => () => void;
  get: () => TabHistory;
};

export function createTabHistory(initial: string): TabHistoryStore {
  const paths = [initial];
  const listeners = new Set<() => void>();
  let index = 0;
  const go = (to: number) => {
    index = to;
    current = snapshot();
    listeners.forEach((listener) => listener());
  };
  const navigate = (path: string) => {
    if (path === paths[index]) return;
    paths.splice(index + 1, Infinity, path);
    go(index + 1);
  };
  const back = () => {
    if (index > 0) go(index - 1);
  };
  const forward = () => {
    if (index < paths.length - 1) go(index + 1);
  };
  const snapshot = (): TabHistory => ({
    path: paths[index]!,
    canGoBack: index > 0,
    canGoForward: index < paths.length - 1,
    navigate,
    back,
    forward,
  });
  let current = snapshot();
  return {
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    get: () => current,
  };
}

export const TabHistoryContext = createContext(createTabHistory(""));

export function useTabHistory() {
  const store = useContext(TabHistoryContext);
  return useSyncExternalStore(store.subscribe, store.get, store.get);
}

// useTabHistories gives each open tab a history that starts at its href
export function useTabHistories(tabs: readonly WorkspaceTab[]) {
  const stores = useTabMap<TabHistoryStore>(tabs);
  return (tab: WorkspaceTab) => {
    let store = stores.get(tab.key);
    if (!store) stores.set(tab.key, (store = createTabHistory(tab.href ?? "")));
    return store;
  };
}
