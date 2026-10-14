import {
  cpSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { join, resolve } from "node:path";

const here = import.meta.dirname;
const args = process.argv.slice(2);
const split = args.indexOf("--");
const [variant = "react18", ...options] =
  split < 0 ? args : args.slice(0, split);
const extra = split < 0 ? [] : args.slice(split + 1);
const specs = {};
for (let i = 0; i < options.length; i += 2)
  specs[options[i].replace(/^--/, "")] = options[i + 1];
const variants = JSON.parse(readFileSync(join(here, "variants.json"), "utf8"));
if (!variants[variant])
  throw new Error(`Unknown variant ${variant}; use ${Object.keys(variants)}`);

const run = (command, cwd) => {
  console.log(`\n$ ${command.join(" ")}`);
  const { exitCode } = Bun.spawnSync(command, {
    cwd,
    stdio: ["inherit", "inherit", "inherit"],
  });
  if (exitCode) process.exit(exitCode);
};

const work = join(here, ".work", variant);
rmSync(work, { recursive: true, force: true });
mkdirSync(work, { recursive: true });
for (const file of [
  "bunfig.toml",
  "index.html",
  "postcss.config.js",
  "tailwind.config.js",
  "vite.config.ts",
  "tsconfig.json",
  "playwright.config.ts",
  "fixtures.ts",
  "consumer.spec.ts",
  "ui.spec.ts",
  "install.spec.ts",
  "os.spec.ts",
  "desktop.spec.ts",
  "terminal.spec.ts",
  "src",
])
  cpSync(join(here, file), join(work, file), { recursive: true });

const manifest = JSON.parse(readFileSync(join(here, "package.json"), "utf8"));
const {
  dependencies = {},
  devDependencies = {},
  overrides,
} = variants[variant];
Object.assign(manifest.dependencies, dependencies);
Object.assign(manifest.devDependencies, devDependencies);
if (overrides) manifest.overrides = overrides;
const repo = resolve(here, "../..");
const packages = join(repo, "packages");
const local = ["os", "ui"].filter((name) => !specs[name]);
if (local.length) run(["bun", "install", "--frozen-lockfile"], repo);
for (const name of ["os", "ui"]) {
  if (specs[name]) {
    manifest.dependencies[`@labpane/${name}`] = specs[name];
    continue;
  }
  const dir = join(packages, name);
  run(["bun", "run", "build"], dir);
  run(
    ["bun", "pm", "pack", "--ignore-scripts", "--quiet", "--destination", work],
    dir,
  );
  const { version } = JSON.parse(
    readFileSync(join(dir, "package.json"), "utf8"),
  );
  manifest.dependencies[`@labpane/${name}`] =
    `file:./labpane-${name}-${version}.tgz`;
}
writeFileSync(
  join(work, "package.json"),
  JSON.stringify(manifest, null, 2) + "\n",
);
run(["bun", "install"], work);
run(["bun", "run", "check"], work);
run(["bun", "run", "build"], work);
const playwright = ["node", "node_modules/@playwright/test/cli.js"];
run([...playwright, "install", "chromium"], work);
run([...playwright, "test", ...extra], work);
