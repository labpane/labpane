import { expect, it } from "bun:test";
import { testStyles } from "../testing.js";
import { unlayer } from "../unlayer.mjs";

const css = testStyles(import.meta.dir, { prefix: "labui" });

it("reads fonts from tokens apps may set to inherit", () => {
  for (const font of ["mono", "display"])
    expect(css()).toContain(
      `.labui\\:font-${font}{font-family:var(--labui-font-${font})}`,
    );
});

it("keeps source order and nested blocks when unwrapping layers", () => {
  expect(
    unlayer(
      "@layer theme,base,components,utilities;@layer properties{a{b:c}}@layer base{x{y:z}@media print{w{v:u}}}@layer components;@layer utilities{.u{t:s}}.after{r:q}",
    ),
  ).toBe(
    "@layer properties{a{b:c}}x{y:z}@media print{w{v:u}}.u{t:s}.after{r:q}",
  );
});
