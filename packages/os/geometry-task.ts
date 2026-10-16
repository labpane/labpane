// Measure all tab strips before any strip writes to the DOM.
type Read = (resized: boolean) => (() => void) | undefined;
type Task = { read: Read; resized: boolean };
const pending = new Set<Task>();
const observed = new Map<Element, Set<Task>>();
const animations = new Map<Element, Animation>();
let observer: ResizeObserver | undefined;
let frame: number | undefined;
let microtask = false;

function flush() {
  if (frame !== undefined) cancelAnimationFrame(frame);
  frame = undefined;
  for (const [element, animation] of animations) {
    for (const task of observed.get(element) ?? []) pending.add(task);
    if (!element.isConnected || animation.playState !== "running")
      animations.delete(element);
  }
  const reads = [...pending];
  pending.clear();
  const writes = reads.map((task) => {
    const resized = task.resized;
    task.resized = false;
    return task.read(resized);
  });
  for (const write of writes) write?.();
  if (animations.size && frame === undefined)
    frame = requestAnimationFrame(flush);
}

// Returning panels can move without triggering ResizeObserver.
export function followGeometry(element: Element, animation: Animation) {
  animations.set(element, animation);
  if (frame === undefined) frame = requestAnimationFrame(flush);
}

export function geometryTask(read: Read) {
  const task = { read, resized: false };
  return {
    schedule() {
      pending.add(task);
      if (frame === undefined) frame = requestAnimationFrame(flush);
    },
    // Wait for layout effects, but measure before paint.
    commit(resized = false) {
      task.resized ||= resized;
      pending.add(task);
      if (microtask) return;
      microtask = true;
      queueMicrotask(() => {
        microtask = false;
        flush();
      });
    },
    flush() {
      pending.add(task);
      flush();
    },
    cancel() {
      pending.delete(task);
      task.resized = false;
      if (!pending.size && !animations.size && frame !== undefined) {
        cancelAnimationFrame(frame);
        frame = undefined;
      }
    },
    observe(elements: Element[]) {
      observer ??= new ResizeObserver((entries) => {
        for (const { target } of entries)
          for (const task of observed.get(target) ?? []) {
            task.resized = true;
            pending.add(task);
          }
        flush();
      });
      for (const element of elements) {
        let callbacks = observed.get(element);
        if (!callbacks) {
          observed.set(element, (callbacks = new Set()));
          observer.observe(element);
        }
        callbacks.add(task);
      }
      return () => {
        for (const element of elements) {
          const callbacks = observed.get(element);
          callbacks?.delete(task);
          if (!callbacks?.size) {
            observed.delete(element);
            observer?.unobserve(element);
          }
        }
        if (!observed.size) {
          observer?.disconnect();
          observer = undefined;
        }
      };
    },
  };
}
