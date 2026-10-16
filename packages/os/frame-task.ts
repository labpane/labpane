// Coalesce pointer samples and flush the final sample on release.
export function frameTask<T>(run: (value: T) => void) {
  let frame: number | undefined;
  let pending: { value: T } | undefined;
  const flush = () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
    frame = undefined;
    const next = pending;
    pending = undefined;
    if (next) run(next.value);
  };
  return {
    schedule(value: T) {
      pending = { value };
      if (frame === undefined) frame = requestAnimationFrame(flush);
    },
    flush,
    cancel() {
      if (frame !== undefined) cancelAnimationFrame(frame);
      frame = undefined;
      pending = undefined;
    },
  };
}
