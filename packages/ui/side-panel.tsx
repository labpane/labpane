import * as React from "react";
import { cn } from "./classes.js";

export type SidePanelLimits = {
  minWidth: number;
  maxWidth: number;
  slack: number;
  mainMinWidth: number;
};

export const sidePanelLimits: SidePanelLimits = {
  minWidth: 200,
  maxWidth: 480,
  slack: 80,
  mainMinWidth: 320,
};

// A drag that goes slack pixels past the minimum closes the panel; back out reopens it
export function resolveDrag(
  desired: number,
  available: number,
  limits: SidePanelLimits,
) {
  const open = desired > limits.minWidth - limits.slack;
  const max = Math.max(
    limits.minWidth,
    Math.min(limits.maxWidth, available - limits.mainMinWidth),
  );
  return { open, width: Math.min(max, Math.max(limits.minWidth, desired)) };
}

const SidePanel = React.forwardRef<
  HTMLElement,
  Omit<React.ComponentPropsWithoutRef<"aside">, "children"> & {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    width: number;
    onWidthChange: (width: number) => void;
    side?: "left" | "right";
    label: string;
    limits?: Partial<SidePanelLimits>;
    children: React.ReactNode;
  }
>(function SidePanel(
  {
    open,
    onOpenChange,
    width,
    onWidthChange,
    side = "right",
    label,
    limits: partial,
    className,
    children,
    ...props
  },
  ref,
) {
  const limits = { ...sidePanelLimits, ...partial };
  const direction = side === "right" ? -1 : 1;

  function apply(desired: number, available: number) {
    const next = resolveDrag(desired, available, limits);
    if (next.open !== open) onOpenChange(next.open);
    if (next.open && next.width !== width) onWidthChange(next.width);
  }

  function startDrag(event: React.PointerEvent<HTMLDivElement>) {
    event.preventDefault();
    const origin = event.clientX;
    const startWidth = open ? width : 0;
    const available =
      event.currentTarget.parentElement?.parentElement?.clientWidth ?? Infinity;
    const move = (next: PointerEvent) =>
      apply(startWidth + (next.clientX - origin) * direction, available);
    const stop = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", stop);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", stop);
  }

  function keyboardResize(event: React.KeyboardEvent<HTMLDivElement>) {
    const step =
      event.key === "ArrowLeft" ? -16 : event.key === "ArrowRight" ? 16 : 0;
    if (!step) return;
    event.preventDefault();
    const available =
      event.currentTarget.parentElement?.parentElement?.clientWidth ?? Infinity;
    apply((open ? width : 0) + step * direction, available);
  }

  return (
    <aside
      ref={ref}
      data-slot="side-panel"
      data-side={side}
      data-state={open ? "open" : "closed"}
      aria-label={label}
      style={{ width: open ? width : 0 }}
      className={cn(
        "labui:relative labui:flex labui:shrink-0 labui:overflow-visible",
        !open && "labui:border-0",
        className,
      )}
      {...props}
    >
      {open && (
        <div className="labui:min-w-0 labui:flex-1 labui:overflow-auto">
          {children}
        </div>
      )}
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={`Resize ${label}`}
        aria-valuenow={open ? width : 0}
        aria-valuemin={0}
        aria-valuemax={limits.maxWidth}
        tabIndex={0}
        onPointerDown={startDrag}
        onKeyDown={keyboardResize}
        className={cn(
          "labui:absolute labui:inset-y-0 labui:z-10 labui:w-1.5 labui:cursor-col-resize labui:touch-none labui:outline-none labui:hover:bg-foreground/25 labui:focus-visible:bg-foreground/40",
          side === "right" ? "labui:-left-0.75" : "labui:-right-0.75",
        )}
      />
    </aside>
  );
});

export { SidePanel };
