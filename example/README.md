# Labpane example site

Labpane's homepage, with a live `@labpane/os` workspace, and a palette of every `@labpane/ui` component and colour token. It's a static Vite site that uses the packages from this workspace.

```sh
bun install
bun run build   # at the repository root, to build @labpane/os and @labpane/ui

cd example
bun run dev     # http://localhost:5173
bun run build   # writes the static site to example/dist
bun run preview # serves example/dist
bun run test    # builds, serves, and checks both pages in Chromium
```

The build uses relative URLs, so `dist` can be served from any folder of any static host.
