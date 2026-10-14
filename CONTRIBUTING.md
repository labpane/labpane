# Contributing

Thanks for helping with Labpane. Bug reports, fixes, and ideas are all welcome. For larger changes, open an issue first so we can agree on the approach.

## Setup

You need [Bun](https://bun.sh) (the version is pinned in `package.json`) and Node.js 22 or later for the browser tests and package checks.

```sh
bun install
bun run build
bun run test
```

## Checks

| Command                  | What it does                                                             |
| ------------------------ | ------------------------------------------------------------------------ |
| `bun run test`           | Unit tests for both packages                                             |
| `bun run lint`           | Lints with oxlint                                                        |
| `bun run format`         | Formats with Prettier; `format:check` only checks                        |
| `bun run check:packages` | Packs both packages and checks them with publint and are-the-types-wrong |

CI runs all of these on every pull request.

## Browser tests

`e2e/consumer` installs the packed packages into a Vite app with Tailwind 3 and runs Playwright tests against it. Pick `minimum` (React 18.2), `react18`, or `latest`:

```sh
cd e2e/consumer
bun run.mjs react18
```

Arguments after `--` go to Playwright, for example `bun run.mjs react18 -- desktop.spec.ts`.

## Desktop windows

`e2e/desktop` is a small Wails program that opens the built example site in a native window. Its smoke test builds it, opens the window, and checks that the platform's webview loads the site. It needs Go, and on Linux the GTK 3 and WebKitGTK 4.1 development packages and Xvfb:

```sh
bun run --cwd example build
bash e2e/desktop/smoke.sh native
bash e2e/desktop/smoke.sh custom
```

`native` keeps the system title bar. `custom` opens the example's desktop page in a window without one, the way `desktopSlots` and `titleBar` are meant to be used, and the page checks that the window's controls landed where they belong: the traffic lights' room and the menu at the end on macOS, the menu first and the window buttons in the corner elsewhere.

CI runs it on Linux, macOS, and Windows. Wails is only used by this test; the packages don't depend on it.

## Guidelines

- `@labpane/os` depends only on React. Keep it that way.
- Keep CSS scoped: os uses `lab-` classes and `--lab-*` tokens, and ui uses `labui:` utilities and `--labui-*` tokens. The style tests enforce this.
- Both packages support React 18.2 and later, in apps with Tailwind 3, Tailwind 4, or no Tailwind.
- Write relative imports with a `.js` extension (`./layout.js`) so the published types resolve in every module mode.
- Add tests with your change: unit tests next to the code, browser tests in `e2e/consumer`.

## Changesets

If your change affects a published package, add a changeset that describes it for the changelog:

```sh
bun run changeset
```

Pick the packages and the bump: patch for fixes, minor for features, and major for anything the README's [versioning](README.md#versioning) section counts as breaking. Both packages are always released together under one version. Commit the generated file with your change.

CI checks that every pull request touching a published package has one. If a change doesn't need a release, such as a fix to a test, run `bun run changeset --empty` instead.

## Releasing

Maintainers release from `main`:

1. When changesets land, the Release workflow opens a "Version Packages" pull request that bumps the versions and updates the changelogs.
2. Merging that pull request publishes the new versions to npm with provenance and creates GitHub releases. The publish job runs in the `npm` environment, so it waits for approval when that environment requires reviewers.

Publishing uses npm trusted publishing, so the repository holds no npm token. A new package's first version is published by hand with `npm publish` in its folder. After that, add this repository's `release.yml` workflow, with environment `npm`, as the package's trusted publisher on npmjs.com.
