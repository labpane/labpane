import { expect, test } from "@playwright/test";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

function packages(directory = "node_modules"): string[] {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .flatMap((entry) =>
      entry.name.startsWith("@")
        ? readdirSync(join(directory, entry.name)).map((name) =>
            join(directory, entry.name, name),
          )
        : [join(directory, entry.name)],
    )
    .flatMap((path) => [path, ...packages(join(path, "node_modules"))]);
}

test("installs one Radix layer stack shared with the app", ({}, info) => {
  test.skip(info.project.name !== "dev", "Checks node_modules once");
  const installed = packages();
  const copies = (name: string) =>
    installed
      .filter((path) => path.endsWith(join("node_modules", name)))
      .map(
        (path) =>
          JSON.parse(readFileSync(join(path, "package.json"), "utf8"))
            .version as string,
      );
  const layers = copies("@radix-ui/react-dismissable-layer");
  expect(layers).toHaveLength(1);
  const pinned = JSON.parse(readFileSync("package.json", "utf8")).overrides?.[
    "@radix-ui/react-dismissable-layer"
  ];
  if (pinned) expect(layers).toEqual([pinned]);
  expect(copies("radix-ui")).toEqual([]);
  expect(copies("lucide-react")).toHaveLength(1);
});
