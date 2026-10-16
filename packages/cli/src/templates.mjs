import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { deflateSync } from "node:zlib";
import { json } from "./config.mjs";

export const wailsVersion = "v2.16.0";

export async function starterFiles(config) {
  const files = await readTemplate("react-ts", config.name);
  if (config.targets.includes("pwa")) {
    files["src/App.tsx"] =
      'import { useWindowControlsOverlay } from "@labpane/os/pwa";\n' +
      files["src/App.tsx"]
        .replace(
          "  useWindowFrame(host);",
          "  useWindowFrame(host);\n  const overlay = useWindowControlsOverlay(!host);",
        )
        .replace(
          "      <Workspace\n",
          "      <Workspace\n        windowControlsOverlay={overlay}\n",
        );
  }
  return files;
}

async function readTemplate(template, projectName) {
  const files = {};
  const root = fileURLToPath(
    new URL(`../templates/${template}/`, import.meta.url),
  );
  async function visit(directory, prefix = "") {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const name = prefix + entry.name;
      if (entry.isDirectory())
        await visit(join(directory, entry.name), name + "/");
      else
        files[name] = (
          await readFile(join(directory, entry.name), "utf8")
        ).replaceAll("__LABPANE_NAME__", projectName);
    }
  }
  await visit(root);
  return files;
}

export function starterPackage(name) {
  return {
    name,
    version: "0.0.0",
    private: true,
    type: "module",
    scripts: {
      dev: "vite",
      build: "tsc --noEmit && vite build",
      preview: "vite preview",
    },
    dependencies: {
      "@labpane/os": "^1.4.0",
      "@labpane/ui": "^1.4.0",
      "@radix-ui/react-alert-dialog": "^1.1.15",
      "@radix-ui/react-avatar": "^1.2.7",
      "@radix-ui/react-checkbox": "^1.3.3",
      "@radix-ui/react-context-menu": "^2.2.16",
      "@radix-ui/react-dialog": "^1.1.15",
      "@radix-ui/react-dropdown-menu": "^2.1.16",
      "@radix-ui/react-popover": "^1.1.15",
      "@radix-ui/react-select": "^2.2.6",
      "@radix-ui/react-slot": "^1.2.3",
      "@radix-ui/react-switch": "^1.3.8",
      "@radix-ui/react-tabs": "^1.1.22",
      "@radix-ui/react-toggle": "^1.1.19",
      "@radix-ui/react-toggle-group": "^1.1.20",
      "@radix-ui/react-tooltip": "^1.3.0",
      react: "^19.0.0",
      "react-dom": "^19.0.0",
    },
    devDependencies: {
      "@types/react": "^19.3.0",
      "@types/react-dom": "^19.3.0",
      "@vitejs/plugin-react": "^6.1.2",
      typescript: "^7.0.2",
      vite: "^8.3.4",
    },
  };
}

export async function desktopFiles(name, { fresh = false } = {}) {
  const template = await readTemplate("wails", name);
  // Existing applications keep their entry point; they opt into the adapter
  // explicitly instead of having an automatic source-code rewrite.
  if (!fresh) delete template["src/main.tsx"];
  template["main.go"] = template["main.go"].replaceAll(
    "__LABPANE_FRAME__",
    fresh ? "custom" : "native",
  );
  return {
    ...template,
    "go.mod": `module ${name}\n\ngo 1.25.0\n\nrequire github.com/wailsapp/wails/v2 ${wailsVersion}\n`,
    "wails.json": json({
      $schema: "https://wails.io/schemas/config.v2.json",
      version: "2",
      name,
      outputfilename: name,
      "frontend:dir": ".",
      "frontend:install": "npm install",
      "frontend:build": "npm run build",
      "frontend:dev:watcher": "npm run dev -- --host 127.0.0.1",
      "frontend:dev:serverUrl": "auto",
      wailsjsdir: "./src",
    }),
  };
}

// A tiny geometric app icon, encoded locally without an image dependency.
function icon(size) {
  const pixels = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const panel =
        x > size * 0.2 && x < size * 0.8 && y > size * 0.2 && y < size * 0.8;
      const divider =
        Math.abs(x - size * 0.5) < size * 0.025 ||
        Math.abs(y - size * 0.35) < size * 0.025;
      const color =
        panel && !divider ? [244, 241, 234, 255] : [5, 105, 122, 255];
      pixels.set(color, y * (size * 4 + 1) + 1 + x * 4);
    }
  }
  function chunk(type, data) {
    const body = Buffer.concat([Buffer.from(type), data]);
    let crc = 0xffffffff;
    for (const byte of body) {
      crc ^= byte;
      for (let bit = 0; bit < 8; bit++)
        crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
    const length = Buffer.alloc(4),
      checksum = Buffer.alloc(4);
    length.writeUInt32BE(data.length);
    checksum.writeUInt32BE((crc ^ 0xffffffff) >>> 0);
    return Buffer.concat([length, body, checksum]);
  }
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header[8] = 8;
  header[9] = 6;
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(pixels)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

export function pwaFiles(name, viteConfig) {
  return {
    "vite.pwa.config.mjs": `import { defineConfig, mergeConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import baseConfig from ${JSON.stringify("./" + viteConfig)};

export default defineConfig(async (env) => {
  const base = await (typeof baseConfig === "function" ? baseConfig(env) : baseConfig);
  return mergeConfig(base, {
    base: "./",
    build: { outDir: "dist-pwa" },
    plugins: [VitePWA({
      // Updates activate after all app windows close; never reload unsaved work.
      registerType: "prompt",
      injectRegister: "script",
      manifest: {
        id: "./", name: "${name}", short_name: "${name.slice(0, 12)}",
        start_url: "./", scope: "./", display: "standalone",
        display_override: ["window-controls-overlay", "standalone"],
        theme_color: "#eeeeee", background_color: "#eeeeee",
        icons: [
          { src: "labpane-icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "labpane-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any maskable" },
        ],
      },
      workbox: { globPatterns: ["**/*.{html,js,css,png,svg,ico,woff2}"] },
      devOptions: { enabled: false },
    })],
  });
});
`,
    "public/labpane-icon-192.png": { content: icon(192) },
    "public/labpane-icon-512.png": { content: icon(512) },
  };
}
