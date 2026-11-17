import { testPackage } from "../testing.js";
import { expect, it } from "bun:test";
import { build } from "esbuild";
import { join } from "node:path";

testPackage(import.meta.dir, {
  dependencies: [],
  peers: {
    react: "^18.2.0 || ^19.0.0",
    "react-dom": "^18.2.0 || ^19.0.0",
  },
  entries: ["index.ts", "pwa.ts"],
  // Includes touch gestures and pane Back navigation, alongside the PWA entry.
  budget: 21_000,
});

it("keeps PWA browser integration out of the core entry", async () => {
  const { metafile } = await build({
    entryPoints: [join(import.meta.dir, "index.ts")],
    bundle: true,
    packages: "external",
    write: false,
    metafile: true,
  });
  expect(
    Object.keys(metafile!.inputs).some((path) => path.endsWith("/pwa.ts")),
  ).toBe(false);
});
