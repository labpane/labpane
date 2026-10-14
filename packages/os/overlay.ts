const overlays = ["dialog", "alertdialog", "menu", "listbox"]
  .map((role) => `[role="${role}"]`)
  .concat("[data-labpane-overlay]")
  .join(", ");

// hasOpenOverlay is true while a modal, menu, listbox, or full-screen element is open, so shortcuts
// behind it stay quiet; the whole page in full screen is not an overlay
export function hasOpenOverlay() {
  const full = document.fullscreenElement;
  return (
    (!!full && full !== document.documentElement) ||
    !!document.querySelector(overlays)
  );
}
