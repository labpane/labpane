# @labpane/os

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
