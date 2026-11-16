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

The browser suite also checks WCAG accessibility rules in light and dark themes, the workspace accessibility tree and keyboard controls, and chart touch targets.

Run `bun run test:lighthouse` after building the workspace packages to audit the production homepage, palette, and desktop workspace with Google's mobile and desktop Lighthouse presets. CI requires an accessibility score of 100 on every page and saves HTML and JSON reports in `lighthouse-reports/`. Performance, best practices, and SEO scores are reported alongside accessibility; performance varies with the machine and throttling. Set `CHROME_PATH` to use an installed Chrome or Chromium instead of Playwright's Chromium.
