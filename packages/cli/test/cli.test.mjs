import test, { after } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  writeFile,
  symlink,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { setup, setupFromFile, addTarget } from "../src/setup.mjs";
import { validateConfig } from "../src/config.mjs";

const cli = fileURLToPath(new URL("../bin/labpane.mjs", import.meta.url));
const quiet = { log() {} };
const config = (targets = ["web"]) => ({
  version: 1,
  name: "test-app",
  directory: ".",
  template: "react-ts",
  targets,
});
const temporary = [];
const temp = async () => {
  const path = await mkdtemp(join(tmpdir(), "labpane-cli-"));
  temporary.push(path);
  return path;
};
after(async () => {
  for (const path of temporary) {
    assert.equal(dirname(resolve(path)), resolve(tmpdir()));
    assert.ok(basename(path).startsWith("labpane-cli-"));
    await rm(path, { recursive: true, force: true });
  }
});
const read = (root, file) => readFile(join(root, file), "utf8");
const invoke = (args, cwd) =>
  spawnSync(process.execPath, [cli, ...args], { cwd, encoding: "utf8" });

test("the executable provides help and fails for unknown commands/options", () => {
  const help = invoke(["--help"]);
  assert.equal(help.status, 0);
  assert.match(help.stdout, /setup:desktop/);
  assert.equal(invoke(["--version"]).stdout.trim(), "0.1.0-dev.0");
  assert.equal(invoke(["unknown"]).status, 1);
  assert.equal(invoke(["init", "--yes", "--unknown"]).status, 1);
});

test("noninteractive init requires --yes, and does not create an app", async () => {
  const dir = await temp();
  const result = invoke(["init", "child"], dir);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /--yes/);
  assert.deepEqual(await readdir(dir), []);
});

for (const target of ["web", "desktop", "pwa", "both"]) {
  test(`init ${target} creates a starter from the CLI, including paths with spaces`, async () => {
    const dir = await temp();
    const result = invoke(
      ["init", "my app", "--yes", "--name", "my-app", "--target", target],
      dir,
    );
    assert.equal(result.status, 0, result.stderr);
    const root = join(dir, "my app");
    const pkg = JSON.parse(await read(root, "package.json"));
    assert.equal(pkg.name, "my-app");
    assert.equal(pkg.dependencies["@labpane/ui"], "^1.4.0");
    assert.equal(
      (await read(root, "src/App.tsx")).includes("@labpane/os/pwa"),
      target === "pwa" || target === "both",
    );
    assert.match(await read(root, "src/App.tsx"), /useState\("my-app"\)/);
    assert.match(await read(root, "src/pages.tsx"), /from "@labpane\/ui"/);
    const generated = JSON.parse(await read(root, "labpane.json"));
    if (["desktop", "both"].includes(target)) {
      assert.ok(generated.targets.includes("desktop"));
      assert.match(await read(root, "main.go"), /go:embed all:dist/);
      assert.match(
        await read(root, "main.go"),
        /flag.String\("frame", "custom"/,
      );
      assert.match(await read(root, "main.go"), /Title:\s+"my-app"/);
      assert.match(await read(root, "src/main.tsx"), /readWailsHost/);
      assert.match(
        await read(root, "src/desktop/wails.ts"),
        /WindowToggleMaximise/,
      );
      assert.equal(
        JSON.parse(await read(root, "wails.json"))["frontend:dir"],
        ".",
      );
      assert.deepEqual((await addTarget("desktop", root, quiet)).changed, []);
    } else {
      assert.doesNotMatch(await read(root, "src/main.tsx"), /wails/i);
    }
    if (["pwa", "both"].includes(target)) {
      assert.match(
        await read(root, "src/App.tsx"),
        /windowControlsOverlay=\{overlay\}/,
      );
      assert.match(
        await read(root, "vite.pwa.config.mjs"),
        /display_override: \["window-controls-overlay", "standalone"\]/,
      );
      assert.match(
        await read(root, "vite.pwa.config.mjs"),
        /outDir: "dist-pwa"/,
      );
      const png = await readFile(join(root, "public/labpane-icon-512.png"));
      assert.equal(png.readUInt32BE(16), 512);
    }
  });
}

test("config-only can be inspected and applied later, relative to its own directory", async () => {
  const dir = await temp();
  assert.equal(
    invoke(["init", "saved", "--yes", "--config-only", "--target", "both"], dir)
      .status,
    0,
  );
  const root = join(dir, "saved");
  assert.deepEqual(await readdir(root), ["labpane.json"]);
  const result = invoke(["setup", join(root, "labpane.json")], dirname(dir));
  assert.equal(result.status, 0, result.stderr);
  assert.match(await read(root, "src/App.tsx"), /Workspace/);
});

test("an external JSON recipe resolves directory relative to the recipe, not the process", async () => {
  const dir = await temp();
  await writeFile(
    join(dir, "recipe.json"),
    JSON.stringify({ ...config(), directory: "output" }),
  );
  const result = await setupFromFile(join(dir, "recipe.json"), quiet);
  assert.equal(result.root, join(dir, "output"));
  assert.equal(
    JSON.parse(await read(result.root, "labpane.json")).directory,
    ".",
  );
});

test("hand-formatted project config is accepted and normalized", async () => {
  const dir = await temp();
  await writeFile(join(dir, "labpane.json"), JSON.stringify(config()));
  await setupFromFile(join(dir, "labpane.json"), quiet);
  assert.ok(await read(dir, "package.json"));
});

test("dry run leaves no files or directories, including config-only", async () => {
  const dir = await temp();
  for (const flags of [[], ["--config-only"]]) {
    const result = invoke(
      ["init", "app", "--yes", "--target", "both", "--dry-run", ...flags],
      dir,
    );
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(await readdir(dir), []);
  }
});

test("unchanged setup is idempotent, including binary PWA icons", async () => {
  const dir = await temp();
  await setup(config(["web", "desktop", "pwa"]), dir, quiet);
  const result = await setup(config(["web", "desktop", "pwa"]), dir, quiet);
  assert.deepEqual(result.changed, []);
});

test("a conflicting file prevents ALL planned writes", async () => {
  const dir = await temp();
  await mkdir(join(dir, "src"));
  await writeFile(join(dir, "src/App.tsx"), "my existing application");
  await assert.rejects(
    setup(config(["desktop", "pwa"]), dir, quiet),
    /nothing was written/,
  );
  assert.deepEqual(await readdir(dir), ["src"]);
  assert.equal(await read(dir, "src/App.tsx"), "my existing application");
});

test("add desktop preserves edited app source, custom scripts and dependencies", async () => {
  const dir = await temp();
  await setup(config(), dir, quiet);
  const entry = await read(dir, "src/main.tsx");
  await writeFile(join(dir, "src/App.tsx"), "my custom app");
  const pkg = JSON.parse(await read(dir, "package.json"));
  pkg.scripts.test = "my-test-runner";
  pkg.dependencies.react = "19.0.0";
  await writeFile(join(dir, "package.json"), JSON.stringify(pkg));
  const result = invoke(["setup:desktop", dir]);
  assert.equal(result.status, 0, result.stderr);
  const updated = JSON.parse(await read(dir, "package.json"));
  assert.equal(updated.scripts.test, "my-test-runner");
  assert.equal(updated.dependencies.react, "19.0.0");
  assert.equal(updated.scripts.desktop, "wails dev");
  assert.equal(await read(dir, "src/App.tsx"), "my custom app");
  assert.equal(await read(dir, "src/main.tsx"), entry);
  assert.match(await read(dir, "main.go"), /flag.String\("frame", "native"/);
  assert.deepEqual((await addTarget("desktop", dir, quiet)).changed, []);
});

test("add pwa keeps the base Vite config and can coexist with desktop", async () => {
  const dir = await temp();
  await setup(config(["web", "desktop"]), dir, quiet);
  const original = await read(dir, "vite.config.ts");
  await addTarget("pwa", dir, quiet);
  assert.equal(await read(dir, "vite.config.ts"), original);
  assert.equal(
    JSON.parse(await read(dir, "package.json")).scripts.build,
    "tsc --noEmit && vite build",
  );
  assert.deepEqual((await addTarget("pwa", dir, quiet)).changed, []);
});

test("a script conflict blocks the entire integration", async () => {
  const dir = await temp();
  await setup(config(), dir, quiet);
  const pkg = JSON.parse(await read(dir, "package.json"));
  pkg.scripts.desktop = "my-own-command";
  const before = JSON.stringify(pkg);
  await writeFile(join(dir, "package.json"), before);
  await assert.rejects(
    addTarget("desktop", dir, quiet),
    /scripts.desktop already exists/,
  );
  assert.equal(await read(dir, "package.json"), before);
  assert.ok(!(await readdir(dir)).includes("main.go"));
});

test("invalid configs fail before any writes", async () => {
  const dir = await temp();
  for (const invalid of [
    { ...config(), name: "../escape" },
    { ...config(), name: "con" },
    { ...config(), targets: ["electron"] },
    { ...config(), targets: ["web", "web"] },
    { ...config(), version: 2 },
    { ...config(), install: "arbitrary-command" },
    { ...config(), directory: " " },
    { ...config(), template: "vue" },
  ]) {
    assert.throws(() => validateConfig(invalid));
    await assert.rejects(setup(invalid, dir, quiet));
  }
  assert.deepEqual(await readdir(dir), []);
});

test("setup refuses directory symlinks/junctions without writing to their target", async (t) => {
  const dir = await temp();
  const outside = await temp();
  try {
    await symlink(
      outside,
      join(dir, "src"),
      process.platform === "win32" ? "junction" : "dir",
    );
  } catch (error) {
    if (process.platform === "win32" && error.code === "EPERM") {
      t.skip("Windows sandbox does not permit creating junctions");
      return;
    }
    throw error;
  }
  await assert.rejects(setup(config(), dir, quiet), /symbolic link/);
  assert.deepEqual(await readdir(outside), []);
});

test("desktop reports missing setup rather than silently creating files", async () => {
  const dir = await temp();
  const result = invoke(["desktop", dir]);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /setup:desktop/);
  assert.deepEqual(await readdir(dir), []);
});
