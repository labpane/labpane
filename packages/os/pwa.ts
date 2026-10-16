import {
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from "react";

type Overlay = EventTarget & {
  visible: boolean;
  getTitlebarAreaRect: () => DOMRect;
};

export type TitlebarArea = {
  left: number;
  right: number;
  height: number;
  insetRight: number;
};

export type WindowControlsOverlay = {
  readonly root: RefObject<HTMLDivElement | null>;
  readonly area: TitlebarArea | undefined;
};

// Coordinates supplied by the browser are viewport-relative, while pane boxes
// are workspace-relative. Never infer an overlay from the OS or display mode.
export function useWindowControlsOverlay(
  enabled = true,
): WindowControlsOverlay {
  const root = useRef<HTMLDivElement>(null);
  const [area, setArea] = useState<TitlebarArea>();
  useLayoutEffect(() => {
    const overlay = (
      navigator as Navigator & { windowControlsOverlay?: Overlay }
    ).windowControlsOverlay;
    const element = root.current;
    if (!enabled || !overlay || !element) {
      setArea(undefined);
      return;
    }
    const measure = () => {
      const rect = overlay.getTitlebarAreaRect();
      const bounds = element.getBoundingClientRect();
      const height = rect.y + rect.height - bounds.top;
      const next =
        overlay.visible &&
        !document.fullscreenElement &&
        rect.width > 0 &&
        rect.height > 0 &&
        bounds.top >= rect.y &&
        height > 0
          ? {
              left: Math.max(0, rect.x - bounds.left),
              right: Math.min(bounds.width, rect.x + rect.width - bounds.left),
              height,
              insetRight: Math.max(0, bounds.right - rect.x - rect.width),
            }
          : undefined;
      setArea((previous) =>
        previous?.left === next?.left &&
        previous?.right === next?.right &&
        previous?.height === next?.height &&
        previous?.insetRight === next?.insetRight
          ? previous
          : next,
      );
    };
    let frame = 0;
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(schedule);
    observer.observe(element);
    overlay.addEventListener("geometrychange", schedule);
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    document.addEventListener("fullscreenchange", schedule);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      overlay.removeEventListener("geometrychange", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
      document.removeEventListener("fullscreenchange", schedule);
    };
  }, [enabled, root]);
  return useMemo(
    () => ({ root, area: enabled ? area : undefined }),
    [area, enabled],
  );
}
