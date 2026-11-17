import { useLayoutEffect, useRef, type RefObject } from "react";
import { hasOpenOverlay } from "./overlay.js";

const interactive =
  'a, button, input, textarea, select, summary, [contenteditable]:not([contenteditable="false"]), [role="button"], [role="link"], [role="checkbox"], [role="radio"], [role="switch"], [role="menuitem"], [role="tab"], [role="separator"], [role="slider"], [role="spinbutton"], [role="listbox"], [role="combobox"], [role="grid"], [role="tree"], [role="application"], canvas, video, audio, [draggable="true"], [data-no-swipe]';

function ownsGesture(target: Element, panel: HTMLElement) {
  if (target.closest(interactive)) return true;
  for (let node: Element | null = target; node; node = node.parentElement) {
    const style = getComputedStyle(node);
    if (style.touchAction === "none") return true;
    if (
      node.scrollWidth > node.clientWidth + 1 &&
      /auto|scroll/.test(style.overflowX)
    )
      return true;
    if (node === panel) break;
  }
  return false;
}

/** Preserve native vertical scrolling, zooming, and gestures inside controls. */
export function useTabSwipe(
  viewport: RefObject<HTMLElement | null>,
  enabled: boolean,
  previous?: () => void,
  next?: () => void,
) {
  const current = useRef({ previous, next });
  const gesture = useRef<
    | {
        id: number;
        x: number;
        y: number;
        dx: number;
        dy: number;
        started: number;
        horizontal: boolean;
      }
    | undefined
  >(undefined);
  useLayoutEffect(() => {
    current.current = { previous, next };
  });
  useLayoutEffect(() => {
    const panel = viewport.current;
    if (!panel || !enabled) return;
    const cancel = () => {
      gesture.current = undefined;
    };
    const additionalTouch = (event: TouchEvent) => {
      if (event.touches.length > 1) cancel();
    };
    const start = (event: TouchEvent) => {
      cancel();
      if (
        event.touches.length !== 1 ||
        hasOpenOverlay() ||
        !(event.target instanceof Element) ||
        ownsGesture(event.target, panel) ||
        getSelection()?.type === "Range"
      )
        return;
      const touch = event.touches[0]!;
      gesture.current = {
        id: touch.identifier,
        x: touch.clientX,
        y: touch.clientY,
        dx: 0,
        dy: 0,
        started: performance.now(),
        horizontal: false,
      };
    };
    const move = (event: TouchEvent) => {
      const moving = gesture.current;
      if (!moving) return;
      if (
        event.touches.length !== 1 ||
        hasOpenOverlay() ||
        performance.now() - moving.started > 1000
      )
        return cancel();
      const touch = event.touches[0]!;
      if (touch.identifier !== moving.id) return cancel();
      moving.dx = touch.clientX - moving.x;
      moving.dy = touch.clientY - moving.y;
      const x = Math.abs(moving.dx),
        y = Math.abs(moving.dy);
      if (!moving.horizontal) {
        if (y > 10 && y >= x) return cancel();
        if (x < 12 || x < y * 1.4) return;
        if (!(moving.dx < 0 ? current.current.next : current.current.previous))
          return cancel();
        moving.horizontal = true;
      }
      if (event.cancelable) event.preventDefault();
    };
    const end = (event: TouchEvent) => {
      const finished = gesture.current;
      cancel();
      if (
        !finished ||
        event.touches.length ||
        !finished.horizontal ||
        hasOpenOverlay()
      )
        return;
      const threshold = Math.max(48, Math.min(96, panel.clientWidth * 0.15));
      if (
        Math.abs(finished.dx) < threshold ||
        Math.abs(finished.dx) < Math.abs(finished.dy) * 1.4
      )
        return;
      (finished.dx < 0 ? current.current.next : current.current.previous)?.();
    };
    panel.addEventListener("touchstart", start, { passive: true });
    panel.addEventListener("touchmove", move, { passive: false });
    panel.addEventListener("touchend", end);
    panel.addEventListener("touchcancel", cancel);
    addEventListener("touchstart", additionalTouch, { passive: true });
    addEventListener("blur", cancel);
    return () => {
      cancel();
      panel.removeEventListener("touchstart", start);
      panel.removeEventListener("touchmove", move);
      panel.removeEventListener("touchend", end);
      panel.removeEventListener("touchcancel", cancel);
      removeEventListener("touchstart", additionalTouch);
      removeEventListener("blur", cancel);
    };
  }, [viewport, enabled]);
}
