import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const page = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rolldownOptions: {
      input: {
        home: page("index.html"),
        palette: page("palette/index.html"),
      },
    },
  },
});
