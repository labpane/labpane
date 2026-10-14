import { expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import postcss from "postcss";
import tailwind3 from "tailwindcss3";

const css = readFileSync(join(import.meta.dir, "styles.css"), "utf8");
const root = postcss.parse(css);

it("scopes every rule to lab's own class names and data attributes", () => {
  const unscoped: string[] = [];
  root.walkRules((rule) => {
    for (const selector of rule.selectors)
      if (
        !/lab-|\[data-(pane-sheet|drag-content|dragged-tab)\]/.test(selector) &&
        !/^(:root|\.dark|:where\(:root\)|:where\(\.dark\))$/.test(selector)
      )
        unscoped.push(selector);
  });
  expect(unscoped).toEqual([]);
});

it("ships plain CSS that builds through a Tailwind 3 PostCSS pipeline", async () => {
  expect(css).not.toContain("@layer");
  expect(css).not.toContain("@tailwind");
  const content = [{ raw: '<button class="p-4">' }];
  const app = await postcss([tailwind3({ content })]).process(
    `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n${css}`,
    { from: "app.css" },
  );
  expect(app.css).toContain(".p-4");
  expect(app.css).toContain(".lab-workspace");
});

it("lets apps override tokens while forced colors win", () => {
  const order = root.nodes.flatMap((node) =>
    node.type === "rule"
      ? [node.selector]
      : node.type === "atrule" && node.params === "(forced-colors: active)"
        ? node.nodes!.flatMap((child) =>
            child.type === "rule" &&
            child.nodes.some((d) => d.type === "decl" && d.important)
              ? ["forced"]
              : [],
          )
        : [],
  );
  const defaults = order.indexOf(":where(:root)");
  expect(defaults).toBeGreaterThan(-1);
  expect(order.indexOf(":where(.dark)")).toBeGreaterThan(defaults);
  expect(order.lastIndexOf("forced")).toBeGreaterThan(
    order.indexOf(":where(.dark)"),
  );
  expect(css).toMatch(/--lab-font-sans:\s*system-ui,/);
  expect(css).toMatch(/font-family: var\(--lab-font-sans\);/);
});
