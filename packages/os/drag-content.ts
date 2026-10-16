import { useEffect, useRef } from "react";
import { followGeometry } from "./geometry-task.js";

export function useDragContent() {
  const generation = useRef(0);
  const current = useRef<
    | {
        element: HTMLElement;
        width: number;
        height: number;
        offset: number;
        inert: boolean;
      }
    | undefined
  >(undefined);
  const prepareRelease = (animate = true) => {
    const preview = current.current;
    if (!preview) return;
    const { element, inert } = preview;
    const from = element.getBoundingClientRect();
    return () => {
      current.current = undefined;
      const version = ++generation.current;
      element.removeAttribute("data-drag-content");
      element.inert = inert;
      element.style.transition = "none";
      element.style.removeProperty("transform");
      for (const name of ["width", "height"])
        element.style.removeProperty(`--lab-drag-${name}`);
      requestAnimationFrame(() => {
        if (version !== generation.current) return;
        const to = element.getBoundingClientRect();
        element.style.removeProperty("transition");
        if (
          !animate ||
          !element.isConnected ||
          !to.width ||
          matchMedia("(prefers-reduced-motion: reduce)").matches
        )
          return;
        const resized =
          Math.abs(from.width - to.width) > 0.5 ||
          Math.abs(from.height - to.height) > 0.5;
        const animation = element.animate(
          [
            {
              transform: `translate(${from.left - to.left}px, ${from.top - to.top}px)`,
              width: `${from.width}px`,
              height: `${from.height}px`,
              filter: "blur(0)",
              opacity: 1,
            },
            {
              filter: resized ? "blur(3px)" : "blur(0)",
              opacity: resized ? 0.85 : 1,
              offset: 0.35,
            },
            {
              transform: "none",
              width: `${to.width}px`,
              height: `${to.height}px`,
              filter: "blur(0)",
              opacity: 1,
            },
          ],
          { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
        );
        followGeometry(element, animation);
      });
    };
  };
  const release = (animate = true) => prepareRelease(animate)?.();
  useEffect(() => () => release(false), []);
  return {
    release,
    prepareRelease,
    prepareLift(element: HTMLElement, tab: HTMLElement, fallback: DOMRect) {
      if (current.current?.element === element)
        return { ...current.current, apply: () => {} };
      const releasePrevious = prepareRelease(false);
      const animations = element.getAnimations();
      const bounds = element.hidden
        ? fallback
        : element.getBoundingClientRect();
      const preview = {
        element,
        width: bounds.width,
        height: bounds.height,
        offset: Math.max(
          8,
          Math.min(
            tab.getBoundingClientRect().left - bounds.left,
            bounds.width - tab.offsetWidth - 8,
          ),
        ),
        inert: element.inert,
      };
      return {
        ...preview,
        apply: () => {
          releasePrevious?.();
          generation.current++;
          animations.forEach((animation) => animation.cancel());
          current.current = preview;
          for (const [name, value] of Object.entries({
            width: `${bounds.width}px`,
            height: `${bounds.height}px`,
          }))
            element.style.setProperty(`--lab-drag-${name}`, String(value));
          element.inert = true;
          element.setAttribute("data-drag-content", "");
        },
      };
    },
    move(x: number, y: number) {
      const element = current.current?.element;
      // Move the panel without invalidating inherited styles in its contents.
      element?.style.setProperty("transform", `translate3d(${x}px, ${y}px, 0)`);
    },
  };
}
