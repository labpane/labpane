import { afterEach, beforeEach, expect, it, spyOn } from "bun:test";
import { frameTask } from "./frame-task.js";

let callbacks: Map<number, FrameRequestCallback>;
let request: ReturnType<typeof spyOn>;
let cancel: ReturnType<typeof spyOn>;
beforeEach(() => {
  callbacks = new Map();
  let id = 0;
  request = spyOn(globalThis, "requestAnimationFrame").mockImplementation(
    (callback) => {
      callbacks.set(id, callback);
      return id++;
    },
  );
  cancel = spyOn(globalThis, "cancelAnimationFrame").mockImplementation(
    (id) => {
      callbacks.delete(id);
    },
  );
});
afterEach(() => {
  request.mockRestore();
  cancel.mockRestore();
});
const frame = () => {
  const pending = [...callbacks.values()];
  callbacks.clear();
  pending.forEach((callback) => callback(16));
};

it("coalesces a burst of samples into the latest value once per frame", () => {
  const received: number[] = [];
  const task = frameTask<number>((value) => received.push(value));
  for (let value = 0; value < 100; value++) task.schedule(value);
  expect(callbacks.size).toBe(1);
  expect(received).toEqual([]);
  frame();
  expect(received).toEqual([99]);
  expect(callbacks.size).toBe(0);
});
it("flushes the final release sample exactly once, even before a frame", () => {
  const received: number[] = [];
  const task = frameTask<number>((value) => received.push(value));
  task.schedule(1);
  task.schedule(2);
  task.flush();
  task.flush();
  frame();
  expect(received).toEqual([2]);
});
it("drops cancelled work and accepts a new gesture", () => {
  const received: number[] = [];
  const task = frameTask<number>((value) => received.push(value));
  task.schedule(1);
  task.cancel();
  task.flush();
  frame();
  expect(received).toEqual([]);
  task.schedule(2);
  frame();
  expect(received).toEqual([2]);
});
it("allows edge scrolling to schedule its next frame, including an undefined sample", () => {
  let calls = 0;
  const task = frameTask<void>(() => {
    calls++;
    task.schedule(undefined);
  });
  task.schedule(undefined);
  frame();
  expect(calls).toBe(1);
  expect(callbacks.size).toBe(1);
  task.cancel();
  frame();
  expect(calls).toBe(1);
});
