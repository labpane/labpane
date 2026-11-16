import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    // Split shared UI components by source module instead of pulling the palette's
    // entire bundled UI entry into the homepage. Consumer tests cover the packages.
    alias: [
      { find: /^@labpane\/ui$/, replacement: page("../packages/ui/index.ts") },
    ],
  },
  build: {
    rolldownOptions: {
      input: {
        home: page("index.html"),
        palette: page("palette/index.html"),
        desktop: page("desktop/index.html"),
      },
    },
  },
});
