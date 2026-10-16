# Native desktop fixture

This private app exercises Labpane inside a real Wails window. It is a test host and a reference adapter, not a runtime dependency of `@labpane/os` or `@labpane/ui`. It does not depend on the Labpane CLI. The UI is a tree of Labpane components.

`src/desktop/wails.ts` translates public Wails APIs into `WindowHost` callbacks. `main.go` owns window creation. Labpane owns the tab layout and caption components. No Wails implementation or private bridge messages are embedded in either Labpane library.

## Run locally

Prerequisites: repository dependencies installed, Node 22.12+, Go 1.25+, Wails v2.16.0, and the [Wails platform dependencies](https://wails.io/docs/gettingstarted/installation/). From the repository root, build and pack the libraries locally:

```powershell
bun run build
npm pack ./packages/os --ignore-scripts --pack-destination e2e/wails
npm pack ./packages/ui --ignore-scripts --pack-destination e2e/wails
Copy-Item e2e/wails/labpane-os-1.3.0.tgz e2e/wails/labpane-os.tgz
Copy-Item e2e/wails/labpane-ui-1.3.0.tgz e2e/wails/labpane-ui.tgz
cd e2e/wails
npm ci
wails build
npm test
```

Packing creates local archives; it does not publish them. The commands use the current library version, 1.3.0. Update the archive names when testing a different version.

For interactive comparison, run `npm run dev` for the browser and launch `build/bin/labpane-wails-e2e.exe` for desktop. The default desktop frame uses the tabs as the title bar. Launch the executable with `-frame=native` for the OS title bar. Wails also supports `npm run desktop` for native development.

## Verification and limits

`npm test` starts a fresh executable for each frame mode with `-test`. The fixture then triggers DOM controls inside the actual webview and reads real native window state through Wails public APIs. The runner requires a success report and process exit. It checks tab selection, caption placement, drag-region exclusions, maximize/restore, title-bar double-click, F11 fullscreen, minimize/unminimize, and close. A timeout or early exit fails the test. Test execution cannot be enabled through a browser query string.

These are native smoke checks, not physical pointer automation. The separate `e2e/consumer/desktop.spec.ts` exercises pointer interactions against a mock host. Actual OS dragging, edge resizing, Windows snapping, focus behavior, and multiple-monitor DPI transitions still need interactive validation. Custom caption buttons do not provide Windows' native Snap Layout hover menu.

The native runner is currently verified on Windows. The macOS configuration retains real traffic lights with space reserved in the toolbar; macOS and Linux require testing on those systems. Browser mode has no native controls or drag regions. Debugging ports, registry changes, and dependency patches are not needed.

Existing applications such as RTCBench should keep their backend and shell lifecycle and supply their own `WindowHost` adapter. A different shell can implement that interface without depending on this fixture.
