# @labpane/os

## 1.6.0

### Minor Changes

- 78da411: Improve workspace tab semantics while keeping close controls available to assistive technology. Improve component labels, text contrast, command list semantics, and chart touch targets. SidebarInset and BrowserLayoutPane now support asChild for embedding layouts without nested main landmarks.
- 78da411: Support held-tab touch dragging and one-finger swipes between neighboring tabs while preserving native scrolling, form gestures, and pinch zoom. Give split dividers larger touch targets and keep resizing anchored to the finger's starting position. Add useTabBack for returning through detail views and previously selected tabs without closing editors or losing drafts.

### Patch Changes

- b59c3eb: Measure the workspace before its first paint so panes open at their full size instead of showing for a frame at their minimum size in the top-left corner.

## 1.5.1

### Patch Changes

- d6f15ea: Keep the window controls overlay animation frame in a ref for compatibility with updated React lint checks.

## 1.5.0

No changes in this release.

## 1.4.2

### Patch Changes

- 289fad0: - Add a Close submenu for tabs to the left or right, others in the pane, all others, or all tabs and panes.
  - Ask about unsaved tabs one at a time and keep tabs whose changes aren't discarded.

## 1.4.1

### Patch Changes

- 1b02229: Let touch gestures scroll workspace tabs without accidentally selecting, reordering, or docking them. Add a native picker for overflowing tabs on touch devices and enlarge their close targets. Allow Topbar and TopbarActions to wrap within narrow panes instead of clipping actions.

## 1.4.0

### Minor Changes

- 72fe7c4: Add an optional `@labpane/os/pwa` entry point for installed PWA window-controls overlays, preserving native caption controls and full-width panes. Keep pane outlines outside clipped toolbars so their borders remain continuous.

## 1.3.0

### Minor Changes

- 8faae84: - Batch drag and resize updates and measure pane geometry before applying changes.
  - Prioritize selected tabs and reuse unchanged pane content during movement.
  - Reuse table cells, number formatters, and chart labels while keeping state and geometry current.

## 1.2.0

### Minor Changes

- ff5db1d: Add navigation, layout, chart, and overlay components to ui, a theme object, and tab state, tab history, and leave-tab hooks to os

## 1.1.0

### Minor Changes

- 4cac9cf: Add `desktopSlots`, `TrafficLights`, and a `titleBar` mode for desktop windows, so the menu and window controls land on the right side for each platform and a shell can centre macOS's window buttons in the title bar. Controls at the end of each toolbar now sit on the tab row instead of the middle of the toolbar.
