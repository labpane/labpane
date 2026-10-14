import { useEffect, useLayoutEffect, useRef } from "react";
import type { TabHistory, TabHistoryStore } from "./tab-history.js";

type Mark = { session: number; serial: number };
const read = (state: unknown) => (state as { labpane?: Mark } | null)?.labpane;

// createBrowserHistory keeps one browser entry behind the page while the front tab can go back and
// one ahead while it can go forward, and steps the tab in memory when the browser lands on either
export function createBrowserHistory(front: () => TabHistory | undefined) {
  const session = Date.now();
  let serial = 0;
  let position = 0;
  let below = 0;
  let above = 0;
  let hopping = false;
  let queued = false;
  const mark = (serial: number) => ({ labpane: { session, serial } });
  const push = (path: string) => history.pushState(mark(++serial), "", path);
  const hop = () => {
    hopping = true;
    history.back();
  };
  const settle = () => {
    hopping = false;
    if (!queued) return;
    queued = false;
    sync();
  };
  const move = (to: number, direction: 1 | -1) => {
    position = to;
    below = Math.max(0, below + direction);
    above = Math.max(0, above - direction);
  };
  function sync() {
    const tab = front();
    if (!tab) return;
    if (hopping) {
      queued = true;
      return;
    }
    history.replaceState(mark(position), "", tab.path);
    if ((tab.canGoBack && !below) || (!tab.canGoForward && above)) {
      push(tab.path);
      position = serial;
      below += 1;
      above = 0;
    }
    if (tab.canGoForward && !above) {
      push(tab.path);
      above = 1;
      hop();
    }
  }
  function pop(event: PopStateEvent) {
    const landed = read(event.state);
    if (!landed) return;
    if (landed.session !== session) return history.back();
    if (landed.serial === position) return settle();
    const tab = front();
    if (landed.serial > position) {
      if (!tab?.canGoForward) {
        above += 1;
        queued = true;
        return hop();
      }
      move(landed.serial, 1);
      tab.forward();
    } else {
      move(landed.serial, -1);
      if (tab?.canGoBack) tab.back();
      else history.back();
    }
  }
  return { sync, pop };
}

// useBrowserHistory mirrors the front tab's history behind the browser's Back and Forward
export function useBrowserHistory(front?: TabHistoryStore) {
  const latest = useRef(front);
  useLayoutEffect(() => {
    latest.current = front;
  });
  const browser = useRef<ReturnType<typeof createBrowserHistory> | undefined>(
    undefined,
  );
  useEffect(() => {
    if (!front) return;
    const { sync, pop } = (browser.current ??= createBrowserHistory(() =>
      latest.current?.get(),
    ));
    addEventListener("popstate", pop);
    sync();
    const unsubscribe = front.subscribe(sync);
    return () => {
      unsubscribe();
      removeEventListener("popstate", pop);
    };
  }, [front]);
}
