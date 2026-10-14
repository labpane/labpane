import { useEffect, useRef, useState } from "react";

const DEFAULT_WIDTH = 900;
const MIN_WIDTH = 200;

/** Measures a chart container with a ResizeObserver. Zero widths (hidden tabs, display none) keep the last size. */
export function useChartWidth() {
  const container = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    const observer = new ResizeObserver((entries) => {
      const measured = entries[0]?.contentRect.width ?? 0;
      if (measured > 0) setWidth(Math.max(MIN_WIDTH, measured));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return { container, width };
}
