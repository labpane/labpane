import { expect, it, spyOn } from "bun:test";
import { followGeometry, geometryTask } from "./geometry-task.js";

it("coalesces commits and measures all strips before writing any strip", async () => {
  const calls: string[] = [];
  const a = geometryTask(() => {
    calls.push("read a");
    return () => {
      calls.push("write a");
    };
  });
  const b = geometryTask(() => {
    calls.push("read b");
    return () => {
      calls.push("write b");
    };
  });
  a.commit();
  b.commit();
  a.commit();
  expect(calls).toEqual([]);
  await Promise.resolve();
  expect(calls).toEqual(["read a", "read b", "write a", "write b"]);
});

it("follows transform-only motion in the destination and stops after its last frame", () => {
  const callbacks = new Map<number, FrameRequestCallback>();
  let id = 0;
  const request = spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (callback) => {
      callbacks.set(++id, callback);
      return id;
    },
  );
  const cancel = spyOn(globalThis, "cancelAnimationFrame").mockImplementation(
    (id) => {
      callbacks.delete(id);
    },
  );
  const tick = () => {
    const next = [...callbacks.values()];
    callbacks.clear();
    next.forEach((callback) => callback(16));
  };
  const element = document.createElement("div");
  document.body.append(element);
  let updates = 0;
  const destination = geometryTask(() => () => {
    updates++;
  });
  const unobserve = destination.observe([element]);
  const animation = { playState: "running" } as Animation;
  try {
    followGeometry(element, animation);
    tick();
    tick();
    expect(updates).toBe(2);
    Object.assign(animation, { playState: "finished" });
    tick();
    expect(updates).toBe(3);
    expect(callbacks.size).toBe(0);
  } finally {
    Object.assign(animation, { playState: "finished" });
    tick();
    unobserve();
    destination.cancel();
    element.remove();
    request.mockRestore();
    cancel.mockRestore();
  }
});
it("cancels an unmounted strip and flushes pending peers on an immediate update", async () => {
  const calls: string[] = [];
  const a = geometryTask(() => () => {
    calls.push("a");
  });
  const b = geometryTask(() => () => {
    calls.push("b");
  });
  a.commit();
  b.commit();
  a.cancel();
  b.flush();
  await Promise.resolve();
  expect(calls).toEqual(["b"]);
});
it("batches ResizeObserver deliveries and releases all observations", () => {
  const original = globalThis.ResizeObserver;
  let deliver: ResizeObserverCallback;
  let observed = 0,
    unobserved = 0,
    disconnected = 0;
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) {
      deliver = callback;
    }
    observe() {
      observed++;
    }
    unobserve() {
      unobserved++;
    }
    disconnect() {
      disconnected++;
    }
  };
  try {
    const calls: string[] = [];
    const element = document.createElement("div");
    const a = geometryTask(() => {
      calls.push("read a");
      return () => {
        calls.push("write a");
      };
    });
    const b = geometryTask(() => {
      calls.push("read b");
      return () => {
        calls.push("write b");
      };
    });
    const stopA = a.observe([element]),
      stopB = b.observe([element]);
    expect(observed).toBe(1);
    deliver!(
      [{ target: element } as ResizeObserverEntry],
      {} as ResizeObserver,
    );
    expect(calls).toEqual(["read a", "read b", "write a", "write b"]);
    stopA();
    expect(unobserved).toBe(0);
    stopB();
    expect(unobserved).toBe(1);
    expect(disconnected).toBe(1);
  } finally {
    globalThis.ResizeObserver = original;
  }
});
