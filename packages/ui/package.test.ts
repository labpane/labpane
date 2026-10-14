import { expect, it } from "bun:test";
import { build } from "esbuild";
import { join } from "node:path";
import { testPackage } from "../testing.js";
import { cn } from "./classes.js";

testPackage(import.meta.dir, {
  dependencies: ["clsx", "lucide-react", "tailwind-merge"],
  peers: {
    "@radix-ui/react-alert-dialog": "^1.1.15",
    "@radix-ui/react-checkbox": "^1.3.3",
    "@radix-ui/react-context-menu": "^2.2.16",
    "@radix-ui/react-dialog": "^1.1.15",
    "@radix-ui/react-dropdown-menu": "^2.1.16",
    "@radix-ui/react-popover": "^1.1.15",
    "@radix-ui/react-select": "^2.2.6",
    "@radix-ui/react-slot": "^1.2.3",
    "@wterm/dom": "^0.5.4",
    react: "^18.2.0 || ^19.0.0",
    "react-dom": "^18.2.0 || ^19.0.0",
  },
  entries: ["index.ts", "terminal.tsx"],
  budget: 24_000,
});

it("lets callers' classes replace the defaults they conflict with", () => {
  expect(cn("labui:h-10 labui:px-4", "h-8")).toBe("labui:px-4 h-8");
  expect(cn("labui:hover:bg-accent", "hover:bg-card")).toBe("hover:bg-card");
  expect(cn("labui:flex labui:flex-col", "mt-4")).toBe(
    "labui:flex labui:flex-col mt-4",
  );
});

it("loads the terminal and @wterm/dom only from the terminal entry", async () => {
  const { metafile } = await build({
    entryPoints: [join(import.meta.dir, "index.ts")],
    bundle: true,
    format: "esm",
    write: false,
    packages: "external",
    metafile: true,
    outdir: "out",
  });
  const output = Object.values(metafile.outputs)[0]!;
  expect(output.imports.map((i) => i.path)).not.toContain("@wterm/dom");
  expect(
    Object.keys(output.inputs).some((path) => path.includes("terminal")),
  ).toBe(false);
});
