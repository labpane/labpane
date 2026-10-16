# labpane CLI (local prototype)

One CLI for creating a React workspace and adding web, PWA, or Wails desktop builds. The generated UI is a component tree built from `@labpane/ui`, hosted by `@labpane/os`.

This package is deliberately `private: true`. Nothing here has been published, and the public `labpane` npm name has not been verified or reserved. Use the local entry point or a locally packed archive until a release is explicitly approved.

## Command design

The intended public commands, **after a future release**, are:

```sh
npx labpane init my-app
npx labpane init my-app --yes --target both
npx labpane setup project.json
npx labpane setup:desktop .
npx labpane desktop
```

`npm i -D labpane` would keep the CLI available in an existing project. `npx labpane init` would work without installing it first. This uses npm's [`bin` entry](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/#bin). `npm create labpane` would require a separate `create-labpane` package; it is intentionally outside this first version.

| Command                      | Responsibility                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| `init [directory]`           | Ask for the project directory, name, and targets; generate the same config consumed by setup |
| `init --config-only`         | Save the answers as JSON for review or later use                                             |
| `setup [file.json]`          | Generate a project from JSON; defaults to `labpane.json`                                     |
| `add desktop [directory]`    | Add Wails files and npm scripts to a React + Vite app                                        |
| `add pwa [directory]`        | Add a separate PWA Vite config, icons, dependency, and npm scripts                           |
| `setup:desktop`, `setup:pwa` | Aliases for the corresponding `add` commands                                                 |
| `desktop [directory]`        | Run `wails dev`; `--build` runs `wails build`                                                |
| `doctor [directory]`         | Run the Go version check and `wails doctor`; show prerequisites                              |

Every writing command accepts `--dry-run`. `init --yes` makes it usable in scripts. There is no automatic install, Git initialization, telemetry, publishing, or remote template fetch.

## Try it locally

From the repository checkout:

```sh
node packages/cli/bin/labpane.mjs init .work/my-app --yes --name my-app --target both
node packages/cli/bin/labpane.mjs setup:desktop .work/my-app --dry-run
npm run test:cli
npm pack ./packages/cli --pack-destination .work
```

The archive can be installed with `npm install -D /absolute/path/to/labpane-0.1.0-dev.0.tgz`. Then `npx --no-install labpane --help` exercises npm's local executable resolution without looking for a public release. The CLI itself has no third-party dependencies and needs Node 22.12+.

Generated apps target the planned `@labpane/os` and `@labpane/ui` 1.4.0 release and declare the UI package's required peers. Until that release is published, build and pack both libraries here, then install their `.tgz` files into the generated app before its first build. Registry access for third-party dependencies is still needed unless cached.

After building both the web and PWA targets, this repository also has an optional browser check:

```sh
node packages/cli/test/browser-smoke.mjs .work/my-app
```

It uses the repository's Playwright installation and Chromium to check UI interactions, phone sizing, separation of the web build from the service worker, and an offline PWA reload. It serves the app on an ephemeral localhost port and closes the browser/server when finished.

## The config is the contract

```json
{
  "version": 1,
  "name": "my-app",
  "directory": "./my-app",
  "template": "react-ts",
  "targets": ["web", "desktop", "pwa"]
}
```

`directory` resolves relative to the config file. The generated project's `labpane.json` uses `"."`, so moving the project does not break its config. `init my-app --config-only` writes the config inside `my-app`; applying that file fills the same directory. A JSON Schema is included in `schema.json` for editors. The CLI rejects unknown properties, unsupported versions, and invalid names/targets before writing files.

`setup` is a generator, not an updater: identical files are left alone, edited files produce a conflict, and all conflicts are checked before any writes. `add` preserves application source and merges only the requested scripts/dependencies, config, and ignore entries. It refuses conflicting scripts or integration files. Interrupted disk writes are not transactional; no force-overwrite mode is provided.

## Generated component tree

```text
App (React state and workspace wiring)
└─ Workspace (@labpane/os)
   ├─ OptionMenu / ActionMenu (@labpane/ui)
   ├─ WelcomePage
   │  └─ Page → Badge, Button (@labpane/ui)
   └─ SettingsPage
      └─ Page → Badge, TextField, SelectField (@labpane/ui)
```

App code owns state and composition. Reusable controls and appearance come from the UI package, with its packaged CSS; the starter needs no Tailwind setup. Settings are deliberately in-memory examples, not a persistence layer.

## Targets and boundaries

Web is always available through `npm run dev` and `npm run build`. `desktop` adds a [Wails v2](https://wails.io/docs/gettingstarted/installation/) shell embedding `dist/`, plus `desktop` and `build:desktop` scripts. Go 1.25+, Wails v2.16.0, and the OS dependencies are required. Install Wails explicitly; the generator does not install system software. Native builds target the current OS; installers, signing, and cross compilation are future work.

New desktop starters use Labpane tabs as the title bar, with `titleBar` and `desktopSlots` from `@labpane/os`. Windows/Linux use `WindowControls`, wired to native actions. macOS retains the actual OS traffic lights and reserves space for them. The built executable accepts `-frame=native` to use the OS title bar instead; the default lives in `main.go`. Custom Windows caption buttons do not implement the native Snap Layout hover menu.

The application owns its shell and `src/desktop/wails.ts` adapter. The adapter uses Wails public APIs and passes `WindowHost` callbacks to the React app. Neither `@labpane/os` nor `@labpane/ui` depends on Wails or Go. A future Tauri or custom native host can implement the same callbacks. Ordinary browser sessions have no native window controls. Wails drag-region CSS stays in the app's adapter, with interactive elements excluded.

`add desktop` preserves an existing app's entry point and therefore starts with the native title bar. To adopt the tab title bar, load `readWailsHost()` and its CSS in your entry point, pass its result to the workspace's window controls/hooks, and change the frame default in `main.go` to `custom`. Existing applications with their own shell, such as RTCBench, should keep that shell and connect the `WindowHost` interface directly rather than generating a second shell.

`pwa` adds `dev:pwa`, `build:pwa`, and `preview:pwa`. A separate config wraps the existing Vite config and builds `dist-pwa/` with [vite-plugin-pwa](https://vite-pwa-org.netlify.app/guide/). Its service worker caches the app shell only and is disabled in development. Updates activate once all app windows close, without forcing a reload. HTTPS is needed outside localhost. Replace the starter icons before shipping.

The PWA manifest requests `window-controls-overlay`. Starters that select PWA import `useWindowControlsOverlay` from `@labpane/os/pwa` and pass its result to `<Workspace windowControlsOverlay={overlay}>`. Web-only and desktop-only starters do not import the PWA module. An installed browser can put the tabs in its title bar while keeping its native window buttons. Chromium may require the user to choose **Hide title bar** first. Unsupported browsers or disabled overlays keep the normal layout. `add pwa` preserves existing app code, so existing apps opt their own top-level workspace in with the hook and prop. No desktop adapter is needed for a PWA.

Both targets can coexist. The PWA worker is absent from the normal web/desktop build. Existing-app integration currently supports React + Vite projects with standard `dev`/`build` scripts and `dist/` output, not arbitrary frameworks, custom roots, SSR, existing Go modules, or existing PWA integrations. Review `--dry-run` before adoption. Keep the generated config, package lock, and Go checksums in source control for reproducible builds.
