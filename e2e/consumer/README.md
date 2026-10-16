# Browser and installed PWA tests

This consumer installs packed Labpane libraries and exercises them in Vite development and production builds. From the repository root:

```sh
bun e2e/consumer/run.mjs react18
```

`pwa.spec.ts` simulates the Window Controls Overlay API for deterministic coverage of controls on either side, geometry/viewport changes, split panes, dense sizing, interactive slots, tab dragging, fullscreen, opt-out, and unsupported browsers. `desktop.spec.ts` checks the generic native adapter with a mock host.

`frame.spec.ts` checks painted pane edges against Windows Chromium snapshots at 100% and 125% scale. It covers left/right caption areas and clipped toolbars, then splits and resizes the panes. These visual baselines run on Windows; geometry tests remain cross-platform. Local package archives include a content hash so Bun cannot reuse a different worktree's package at the same version.

`pwa-native.spec.ts` runs on Windows and launches headed Chromium with a short disposable profile in the system temporary directory. It installs the loopback-only test manifest through the DevTools PWA API and opens an actual app window. `pwa-window.ps1` invokes native controls through Windows UI Automation, restricted to that browser process and the named fixture window. It checks the browser's Show/Hide title bar toggle, real titlebar geometry, clickable tabs/actions, maximize/restore, resize, fullscreen, minimize, and close. It uninstalls the app before closing and removing the profile, including on assertion failures. It never uses your personal browser profile. An `installed-pwa.png` screenshot is saved in Playwright's test output.

For just the installed smoke check in an already prepared consumer directory:

```sh
node node_modules/@playwright/test/cli.js test --project=pwa-native
```

Native caption controls use accessibility invocation; resize and unminimize use browser automation. Physical OS dragging/snapping and macOS/Linux native behavior still require validation on those systems. The simulated geometry tests run on all platforms. The independent [Wails fixture](../wails/README.md) checks real native window actions through a public-API adapter; neither test host is a Labpane runtime dependency.
