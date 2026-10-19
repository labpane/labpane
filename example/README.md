# Labpane example site

Labpane's homepage, with a live `@labpane/os` workspace, and a palette of every `@labpane/ui` component and color token. It's a static Vite site that uses the packages from this workspace.

```sh
bun install
bun run build   # at the repository root, to build @labpane/os and @labpane/ui

cd example
bun run dev     # http://localhost:5173
bun run build   # writes the static site to example/dist
bun run preview # serves example/dist
bun run test    # builds, serves, and checks desktop and mobile browsers
```

The build uses relative URLs, so `dist` can be served from any folder of any static host.

The browser suite includes touch-enabled iPhone 16 Pro (WebKit) and Pixel 5 (Chromium) projects, with narrow 320px checks. Install both engines with `bunx playwright install chromium webkit`. Mobile checks cover tab selection, native swiping in Chromium, draft preservation, section links and browser history, and overflow inside panels and toolbars as well as the document. These are emulated browsers, not tests on physical phones.
