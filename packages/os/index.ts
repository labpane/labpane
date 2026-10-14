export {
  Workspace,
  type WorkspaceTab,
  type WorkspaceProps,
  type WorkspacePane,
} from "./workspace.js";
export { WorkspaceFrame } from "./workspace-frame.js";
export {
  densityPresets,
  densitySize,
  type Density as WorkspaceDensity,
  type WorkspaceAction,
  type WorkspaceMenu,
} from "./context.js";
export { useUnsavedChanges } from "./unsaved-changes.js";
export {
  restoreLayout,
  reconcileLayout,
  dockTab,
  panes,
  type Layout,
  type Pane,
  type Split,
} from "./layout.js";
export {
  TrafficLights,
  WindowControls,
  desktopSlots,
  useFullscreen,
  useWindowFrame,
  type WindowEdge,
  type WindowHost,
} from "./window.js";
