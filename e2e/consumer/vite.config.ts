import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "node:zlib": fileURLToPath(new URL("src/zlib.ts", import.meta.url)),
    },
  },
});
