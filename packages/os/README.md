# @labpane/os

A browser-tab workspace for React. Tabs can be reordered, dragged into new panes, split left, right, or below, and resized, with full keyboard support. It depends only on React and ships its own plain CSS.

```sh
npm install @labpane/os
```

## Quick start

```tsx
import { useState } from "react";
import { Workspace, type Layout, type WorkspaceTab } from "@labpane/os";
import "@labpane/os/styles.css";

const initial: WorkspaceTab[] = [
  { key: "inbox", label: "Inbox" },
  { key: "reports", label: "Reports" },
];

export function App() {
  const [tabs, setTabs] = useState(initial);
  const [active, setActive] = useState<string | undefined>("inbox");
  const [layout, setLayout] = useState<Layout>({
    id: "main",
    tabs: initial.map((tab) => tab.key),
    active: "inbox",
  });

  return (
    <div style={{ height: "100vh" }}>
      <Workspace
        tabs={tabs}
        active={active}
        onSelect={setActive}
        onClose={(key, next) => {
          setTabs((tabs) => tabs.filter((tab) => tab.key !== key));
          setActive((current) => (current === key ? next : current));
        }}
        layout={layout}
        onLayoutChange={setLayout}
        empty={() => <p>No tabs open</p>}
      >
        {(tab) => <h1>{tab.label}</h1>}
      </Workspace>
    </div>
  );
}
```

The workspace owns no state: you keep the tabs, the active tab, and the layout, so they can live in your router, store, or URL.

## Tabs

Each tab is a `WorkspaceTab`:

| Field       |                                                                        |
| ----------- | ---------------------------------------------------------------------- |
| `key`       | Unique id                                                              |
| `label`     | Text on the tab                                                        |
| `icon`      | Optional icon before the label                                         |
| `actions`   | Buttons shown at the end of the pane's toolbar while the tab is active |
| `href`      | Makes the tab a real link, so middle-click and copy link work          |
| `scrollKey` | The panel scrolls to the top when this changes                         |
| `opener`    | Key of the tab that opened it; closing returns there                   |
| `fill`      | Removes the panel padding, for full-bleed content such as a terminal   |

Tabs whose content has unsaved changes call `useUnsavedChanges(true)`. Closing one asks first: through `confirmClose` if you pass it, and the browser's `confirm` otherwise. The page also warns before unloading.

The tab menu's **Close** submenu can close tabs to the left or right, other tabs in the same pane, all other tabs, or all tabs and panes. Left and right follow the order within the clicked tab's pane. Each unsaved tab asks separately; keeping one leaves it open while the other selected tabs close. Empty panes disappear.

## Inside a tab

Background tabs stay mounted, so a tab's content asks where it stands: `useTabActive()` is true for the tab in front of the focused pane and `useTabVisible()` for every tab on screen, including split panes (`useTabVisibleRef()` for listeners, `useShownOnce(visible)` to mount once). Gate polling, intervals, window listeners, and portaled overlays on them; redraw charts and canvases from a `ResizeObserver` on their own element and skip zero width; pause media when its tab is no longer visible. `useLeaveTab()` returns a function that closes the tab and returns to the tab it was opened from. With the `history` prop, each tab keeps its own history behind the browser's Back and Forward, starting at its `href`: `useTabHistory()` gives `{ path, canGoBack, canGoForward, navigate, back, forward }`. `hasOpenOverlay()` is true while a dialog, menu, listbox, or full-screen element is open, and the workspace's shortcuts wait for it.

## Slots

The workspace renders no menus or buttons of its own. You fill these slots with your own components, or with `@labpane/ui`:

Menu actions are `{ label, onSelect, disabled? }`, `{ label, items }` for submenus, or `null` for separators. `ActionMenu` from `@labpane/ui` renders these directly.

| Prop                                       |                                                                                                                                      |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `toolbar(pane)`                            | Content at the end of each pane's toolbar, such as an "open a tab" button                                                            |
| `menu(target, actions, restoreFocus, tab)` | Wraps a tab, or a divider, in your context menu. `actions` are the workspace's own (move, split, close); add your own for that `tab` |
| `confirmClose(tab)`                        | Asks before closing a tab with unsaved changes; return or resolve `true` to close                                                    |
| `leading`                                  | Content at the top left of the workspace, such as an app menu                                                                        |
| `trailing`                                 | Content pinned to the top right corner, such as window buttons; the top-right pane keeps room for it                                 |

## Layout

`layout` is a tree of panes and splits:

```ts
type Pane = { id: string; tabs: string[]; active?: string };
type Split = {
  id: string;
  axis: "x" | "y";
  ratio: number;
  first: Layout;
  second: Layout;
};
type Layout = Pane | Split;
```

`restoreLayout`, `reconcileLayout`, `dockTab`, and `panes` help you save, repair, and inspect layouts, for example after restoring one from storage.

## Size

`density` scales the workspace from 0 (dense) to 100 (comfortable). `densitySize(density)` returns the matching tab height, logo size, and gaps. The workspace also sets `--lab-tab-height` and `--lab-logo-size` on its element for content placed in its slots.

`WorkspaceFrame` wraps a workspace in a centred frame that users can resize or expand to full width.

## Desktop windows

### Installed PWAs

Enable the browser's window-controls overlay in your web app manifest:

```json
{
  "display": "standalone",
  "display_override": ["window-controls-overlay", "standalone"]
}
```

Then opt your top-level workspace into the available title-bar area:

```tsx
import { Workspace } from "@labpane/os";
import { useWindowControlsOverlay } from "@labpane/os/pwa";

function App() {
  const overlay = useWindowControlsOverlay();
  return <Workspace windowControlsOverlay={overlay} {...workspaceProps} />;
}
```

The PWA browser integration is a separate entry point. Importing `Workspace` or using `@labpane/ui` alone does not include that module. Pass `false` to the hook to temporarily disable the integration; it then installs no observers or event listeners.

Place the workspace at the top of the viewport; remove any separate title-bar spacer. When the installed browser reports a visible overlay, Labpane places the top row of tabs inside its safe rectangle, leaving room for the browser's real window buttons on either side. Panel content keeps the full width. Geometry changes update the layout, and dense tabs get a minimum height sufficient to clear the native title bar. All pane headers share that minimum height while the overlay is active.

Set the app's manifest `theme_color` and document `<meta name="theme-color">` to the workspace background color. Update the meta value when the app changes theme so the browser's caption area matches. The generated starter reads `--lab-background` on theme changes; the library leaves document metadata to the application.

The blank toolbar area drags the window. Tabs, toolbar actions, and leading/trailing slots remain interactive. Mark a noninteractive leading element with `data-window-drag` if it should also drag; use `data-window-no-drag` for custom interactive content. Don't render `WindowControls` or supply a `WindowHost` for this path: the installed browser owns window actions and caption buttons.

Ordinary browser tabs, unsupported browsers, disabled overlays, and fullscreen use the normal layout. The browser controls whether the overlay is enabled; Chromium may require the user to choose **Hide title bar**. A workspace below the title-bar area is left alone. Installability, service workers, and the manifest remain application responsibilities. See the [browser platform documentation](https://learn.microsoft.com/en-us/microsoft-edge/progressive-web-apps/how-to/window-controls-overlay) and [PWA test fixture](../../e2e/consumer/README.md).

### Native shells

To run the workspace in a frameless desktop window (Wails, Tauri, Electron, or your own shell), describe the window as a `WindowHost` and the workspace becomes its title bar:

```tsx
import { desktopSlots, useWindowFrame, type WindowHost } from "@labpane/os";

const host: WindowHost = {
  platform: "windows", // or "macos" or "linux"
  minimize: () => shell.minimize(),
  toggleMaximize: () => shell.toggleMaximize(),
  close: () => shell.close(),
  drag: () => shell.startDrag(), // optional
  resize: (edge) => shell.startResize(edge), // optional, for windows without a native frame
  fullscreen: (on) => shell.setFullscreen(on), // optional
  trafficLights: (center) => shell.setTrafficLights(center), // optional, macOS
};

function App() {
  useWindowFrame(host);
  return (
    <Workspace
      titleBar
      {...desktopSlots(host, (align) => <AppMenu align={align} />)}
      // ...
    />
  );
}
```

- `desktopSlots(host, menu)` fills the workspace's `leading` and `trailing` slots for the platform: on macOS, room for the traffic lights first and the menu at the end; elsewhere, the menu first and the window buttons at the end. A function `menu` gets the side it lands on, `"start"` or `"end"`, so a dropdown can open inward. Without a host, the menu just leads.
- `WindowControls` are Windows-style minimise, maximise, and close buttons, flush in the window's top-right corner and reaching down to the top pane. They hide on macOS, which keeps its own traffic lights, and in full screen.
- `TrafficLights` keeps room for macOS's traffic lights at the start of the toolbar, and hides on other platforms and in full screen. If the host has `trafficLights`, it calls it with the centre of the title bar, in pixels from the top of the window, whenever that moves, so the shell can centre the buttons there.
- `titleBar` centres the top row's toolbar controls in the title bar, which runs from the top of the window to the top pane, the same as the window buttons. Without it they centre in the toolbar, below any space the page leaves above the workspace.
- `useWindowFrame` moves the window when an empty part of a toolbar is dragged, maximises it on a double click, resizes it from its edges, and toggles full screen with F11, or Ctrl+Cmd+F on macOS. Add `data-window-drag` to other elements that should move the window.
- `useFullscreen(host)` returns `[fullscreen, setFullscreen]`. Without a host it uses the browser's Fullscreen API.

The host interface has no Wails, Go, Tauri, or Electron dependency. Applications own their shell and adapt its public APIs to these callbacks. If the shell already handles dragging and edge resizing, omit `drag` and `resize` to avoid sending duplicate commands. The [native desktop fixture](../../e2e/wails/README.md) demonstrates this boundary and checks real window actions with Wails. Its shell is test code, not part of this package.

## Keyboard

On touch devices, swipe the tab bar to scroll it and tap a tab to select it. An overflowing bar also has a native tab picker at its end. Swiping does not reorder or split tabs. If you supply a `menu`, touch and hold a tab to use its move and split actions. Mouse dragging and keyboard actions remain available.

Workspace panels scroll their content independently. Make page headers and action rows wrap, use `min-width: 0` for flex children, and keep wide tables or code blocks in their own scroll containers. A fixed `min-width` on application content can still make a panel scroll sideways even when the document fits the screen.

- Left and Right move between tabs, Home and End jump to the first and last, and Space selects
- Alt+Left and Alt+Right move the focused tab
- Alt+Shift+Left, Right, or Down split the focused tab into a new pane on that side
- Delete closes the focused tab
- F6 moves between panes
- Arrow keys on a divider resize the panes beside it

## Theming

Set these on `:root`, or on any ancestor of the workspace. Add a `dark` class to an ancestor for the dark defaults.

```css
:root {
  --lab-font-sans: inherit;
  --lab-background: #f4f1ea;
  --lab-foreground: #242424;
  --lab-card: #ffffff;
  --lab-muted-foreground: #626262;
  --lab-accent: #e6e6e6;
  --lab-border: #d6d6d6;
  --lab-ring: #1d9db4;
}
```

All classes start with `lab-` and the CSS has no global rules, so it doesn't affect the rest of your page.

## License

MIT
