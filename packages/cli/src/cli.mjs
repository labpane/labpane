import { parseArgs } from "node:util";
import { basename, resolve } from "node:path";
import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { json, readJson, validateConfig } from "./config.mjs";
import { applyFiles, exists } from "./files.mjs";
import { addTarget, setup, setupFromFile } from "./setup.mjs";
import { wailsVersion } from "./templates.mjs";

const help = `Labpane — a React workspace, in the browser or on your desktop

  labpane init [directory]             Ask questions and create an app
  labpane init my-app --yes            Use the React + TypeScript web defaults
  labpane init my-app --target both    Add Wails desktop and PWA builds
  labpane setup [file.json]            Apply a config (default: labpane.json)
  labpane add desktop [directory]      Add Wails to an existing Vite app
  labpane add pwa [directory]          Add an installable web build
  labpane setup:desktop [directory]    Alias for add desktop
  labpane setup:pwa [directory]        Alias for add pwa
  labpane desktop [directory]          Run Wails dev in a configured app
  labpane desktop [directory] --build  Build a native app
  labpane doctor [directory]           Check desktop prerequisites

Init options:
  --name <name>     Lowercase package name
  --target <kind>   web, desktop, pwa, or both
  --yes, -y         Accept defaults without prompting
  --config-only    Write labpane.json without generating the app

Setup/init/add options:
  --dry-run        Show file changes without writing anything

  --help, -h       Show this help
  --version, -v    Show the CLI version

Setup never installs dependencies or publishes anything. Run npm install
in the generated app. Desktop needs Go and the Wails CLI on PATH.
`;

function parse(args, options = {}) {
  return parseArgs({ args, allowPositionals: true, strict: true, options });
}
const dryOption = { "dry-run": { type: "boolean" } };

function onePath(positionals, fallback) {
  if (positionals.length > 1)
    throw new Error("Too many arguments. Run labpane --help for usage.");
  return positionals[0] ?? fallback;
}

function targetList(value) {
  if (!["web", "desktop", "pwa", "both"].includes(value))
    throw new Error("Target must be web, desktop, pwa, or both.");
  return value === "both"
    ? ["web", "desktop", "pwa"]
    : value === "web"
      ? ["web"]
      : ["web", value];
}

async function init(args) {
  const { values, positionals } = parse(args, {
    ...dryOption,
    yes: { type: "boolean", short: "y" },
    name: { type: "string" },
    target: { type: "string" },
    "config-only": { type: "boolean" },
  });
  let directory = onePath(positionals, "my-labpane-app");
  let name = values.name;
  let target = values.target;
  if (target) targetList(target);
  if (!values.yes) {
    if (!stdin.isTTY || !stdout.isTTY)
      throw new Error(
        "Interactive init needs a terminal. Use --yes (and optionally --name and --target) for scripts.",
      );
    const rl = createInterface({ input: stdin, output: stdout });
    const controller = new AbortController();
    rl.on("SIGINT", () => controller.abort());
    const ask = async (label, fallback) =>
      (
        await rl.question(`${label} (${fallback}): `, {
          signal: controller.signal,
        })
      ).trim() || fallback;
    try {
      if (!positionals.length)
        directory = await ask("Project directory", directory);
      if (!name) name = await ask("Package name", basename(resolve(directory)));
      if (!target)
        target = await ask("Build for: web, desktop (Wails), pwa, both", "web");
    } finally {
      rl.close();
    }
  }
  name ??= basename(resolve(directory));
  const config = validateConfig({
    version: 1,
    name,
    directory: ".",
    template: "react-ts",
    targets: targetList(target ?? "web"),
  });
  const root = resolve(directory);
  const options = { dryRun: values["dry-run"] };
  if (values["config-only"]) {
    await applyFiles(root, { "labpane.json": json(config) }, options);
    console.log(
      `\n${options.dryRun ? "Config would be saved" : "Config saved"} in ${root}.\nFrom that directory, apply with: labpane setup labpane.json`,
    );
    return;
  }
  const result = await setup(config, root, options);
  done(result, options.dryRun);
}

function done({ root, config }, dryRun) {
  if (dryRun) {
    console.log("\nPreview only; no files written.");
    return;
  }
  console.log(
    `\nReady in ${root}\n\nFrom that directory, run:\n  npm install\n  npm run dev`,
  );
  if (config.targets.includes("desktop"))
    console.log(
      "\nDesktop: install the Wails prerequisites, then npm run desktop.",
    );
  if (config.targets.includes("pwa"))
    console.log("PWA: npm run build:pwa, then npm run preview:pwa.");
}

export async function run(command, args, cwd) {
  await new Promise((resolveRun, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit", shell: false });
    child.once("error", (error) =>
      reject(
        new Error(
          error.code === "ENOENT"
            ? `${command} is not on PATH. Run labpane doctor for setup instructions.`
            : error.message,
        ),
      ),
    );
    child.once("exit", (code, signal) => {
      if (code === 0) resolveRun();
      else
        reject(
          new Error(
            `${command} ${args.join(" ")} ${signal ? `stopped by ${signal}` : `exited with code ${code}`}.`,
          ),
        );
    });
  });
}

async function doctor(directory) {
  console.log(
    `Node ${process.version}\nDesktop requires Go 1.25+, Wails ${wailsVersion}, and OS dependencies.`,
  );
  let failed = false;
  for (const [command, args] of [
    ["go", ["version"]],
    ["wails", ["doctor"]],
  ]) {
    try {
      await run(command, args, directory);
    } catch (error) {
      console.error(error.message);
      failed = true;
    }
  }
  console.log(
    `\nInstall Wails: go install github.com/wailsapp/wails/v2/cmd/wails@${wailsVersion}\nAdd Go's bin directory to PATH.\nPlatform dependencies: https://wails.io/docs/gettingstarted/installation/`,
  );
  if (failed) process.exitCode = 1;
}

export async function main(args) {
  if (!args.length || args.includes("--help") || args.includes("-h")) {
    console.log(help);
    return;
  }
  if (args.length === 1 && ["--version", "-v"].includes(args[0])) {
    console.log(
      (
        await readJson(
          fileURLToPath(new URL("../package.json", import.meta.url)),
        )
      ).version,
    );
    return;
  }
  const [command, ...rest] = args;
  if (command === "init") return init(rest);
  if (command === "setup") {
    const { values, positionals } = parse(rest, dryOption);
    const result = await setupFromFile(onePath(positionals, "labpane.json"), {
      dryRun: values["dry-run"],
    });
    done(result, values["dry-run"]);
    return;
  }
  if (["add", "setup:desktop", "setup:pwa"].includes(command)) {
    const target =
      command === "add" ? rest.shift() : command.slice("setup:".length);
    if (!["desktop", "pwa"].includes(target))
      throw new Error("Usage: labpane add <desktop|pwa> [directory]");
    const { values, positionals } = parse(rest, dryOption);
    const result = await addTarget(target, onePath(positionals, "."), {
      dryRun: values["dry-run"],
    });
    done(result, values["dry-run"]);
    return;
  }
  if (command === "desktop" || command === "doctor") {
    const { values, positionals } = parse(
      rest,
      command === "desktop" ? { build: { type: "boolean" } } : {},
    );
    const directory = resolve(onePath(positionals, "."));
    if (!(await exists(directory)))
      throw new Error(`Directory not found: ${directory}`);
    if (command === "doctor") return doctor(directory);
    if (!(await exists(resolve(directory, "wails.json"))))
      throw new Error(
        "Desktop is not configured. Run labpane setup:desktop . first.",
      );
    return run("wails", [values.build ? "build" : "dev"], directory);
  }
  throw new Error(`Unknown command: ${command}. Run labpane --help.`);
}
