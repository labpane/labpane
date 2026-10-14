import * as React from "react";

export type TabState = { active: boolean; visible: boolean };

// Both packages read one context, found by name so neither has to import the other
const key = Symbol.for("labpane.tab-state");
const registry = globalThis as unknown as Record<
  symbol,
  React.Context<TabState> | undefined
>;
export const TabStateContext = (registry[key] ??= React.createContext<TabState>(
  {
    active: true,
    visible: true,
  },
));

export function useTabActive() {
  return React.useContext(TabStateContext).active;
}

export function useTabVisible() {
  return React.useContext(TabStateContext).visible;
}
