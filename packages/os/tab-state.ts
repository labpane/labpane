import * as React from "react";

export type TabState = { active: boolean; visible: boolean };

// Both packages read one context, found by name so neither has to import the other
const key = Symbol.for("labpane.tab-state");
const registry = globalThis as unknown as Record<
  symbol,
  React.Context<TabState> | undefined
>;
export const TabStateContext = (registry[key] ??= React.createContext<TabState>(
  { active: true, visible: true },
));

export function useTabActive() {
  return React.useContext(TabStateContext).active;
}

export function useTabVisible() {
  return React.useContext(TabStateContext).visible;
}

export function useTabVisibleRef() {
  const visible = useTabVisible();
  const ref = React.useRef(visible);
  React.useLayoutEffect(() => {
    ref.current = visible;
  }, [visible]);
  return ref;
}

export function useShownOnce(visible: boolean) {
  const [shown, setShown] = React.useState(visible);
  React.useEffect(() => {
    if (visible) setShown(true);
  }, [visible]);
  return shown;
}
