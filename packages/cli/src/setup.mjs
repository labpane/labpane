import { dirname, resolve, basename } from "node:path";
import { json, readJson, validateConfig } from "./config.mjs";
import {
  applyFiles,
  assertNoSymlinks,
  exists,
  readOptional,
} from "./files.mjs";
import {
  desktopFiles,
  pwaFiles,
  starterFiles,
  starterPackage,
  wailsVersion,
} from "./templates.mjs";

function addValues(pkg, section, values) {
  pkg[section] ??= {};
  for (const [key, value] of Object.entries(values)) {
    if (pkg[section][key] && pkg[section][key] !== value) {
      throw new Error(
        `package.json ${section}.${key} already exists with a different value. Nothing was written.`,
      );
    }
    pkg[section][key] = value;
  }
}

async function featureFiles(root, config, pkg, { fresh = false } = {}) {
  const files = {};
  if (config.targets.includes("desktop")) {
    const desktop = await desktopFiles(config.name, { fresh });
    if (!fresh) {
      // Both generated defaults are valid. Re-adding desktop to a fresh starter
      // must retain its already-wired custom frame.
      const wired = await desktopFiles(config.name, { fresh: true });
      if ((await readOptional(resolve(root, "main.go"))) === wired["main.go"])
        desktop["main.go"] = wired["main.go"];
    }
    Object.assign(files, desktop);
    addValues(pkg, "scripts", {
      desktop: "wails dev",
      "build:desktop": "wails build",
    });
  }
  if (config.targets.includes("pwa")) {
    const configs = [];
    for (const name of [
      "vite.config.ts",
      "vite.config.js",
      "vite.config.mts",
      "vite.config.mjs",
    ]) {
      if (fresh ? name === "vite.config.ts" : await exists(resolve(root, name)))
        configs.push(name);
    }
    if (configs.length !== 1)
      throw new Error(
        "PWA setup requires exactly one Vite config (.ts, .js, .mts, or .mjs).",
      );
    await assertNoSymlinks(resolve(root, configs[0]));
    if (
      !fresh &&
      pkg.devDependencies?.["vite-plugin-pwa"] &&
      !(await exists(resolve(root, "vite.pwa.config.mjs")))
    ) {
      throw new Error(
        "This project already has vite-plugin-pwa. Review its existing PWA configuration before adding another.",
      );
    }
    Object.assign(files, pwaFiles(config.name, configs[0]));
    addValues(pkg, "scripts", {
      "dev:pwa": "vite --config vite.pwa.config.mjs",
      "build:pwa": "vite build --config vite.pwa.config.mjs",
      "preview:pwa": "vite preview --config vite.pwa.config.mjs",
    });
    pkg.devDependencies ??= {};
    pkg.devDependencies["vite-plugin-pwa"] ??= "^1.2.0";
  }
  return files;
}

function instructions(config) {
  return `# ${config.name}

A React + TypeScript workspace built with Labpane and Vite.

\`\`\`sh
npm install
npm run dev
\`\`\`

Edit \`src/pages.tsx\` to compose your UI from \`@labpane/ui\`. \`src/App.tsx\` wires those pages into the \`@labpane/os\` workspace. \`npm run build\` typechecks and builds the browser app in \`dist/\`.

\`\`\`text
Workspace (@labpane/os)
├─ OptionMenu / ActionMenu (@labpane/ui)
├─ WelcomePage
│  └─ Page → Badge, Button (@labpane/ui)
└─ SettingsPage
   └─ Page → Badge, TextField, SelectField (@labpane/ui)
\`\`\`
Commit \`labpane.json\` and your dependency lockfiles. Setup creates source files; it is not a file synchronizer. Re-running it never overwrites edited source files.
${
  config.targets.includes("desktop")
    ? `
## Desktop

Install Go 1.25+ and the [Wails platform dependencies](https://wails.io/docs/gettingstarted/installation/), then:

\`\`\`sh
go install github.com/wailsapp/wails/v2/cmd/wails@${wailsVersion}
wails doctor
npm run desktop
\`\`\`

Add Go's bin directory to PATH. \`npm run build:desktop\` creates a native app in \`build/bin/\` for the current OS. Tabs form the title bar by default. Windows/Linux use Labpane caption buttons calling native window actions; macOS keeps the real traffic lights. Launch the built executable with \`-frame=native\` for the OS title bar, or change the flag default in \`main.go\`. Desktop consumes \`dist/\`, without a service worker.

The app owns \`main.go\` and \`src/desktop/wails.ts\`. The adapter passes host-neutral callbacks into \`App\`; Labpane's React packages have no Go or Wails dependency. Drag regions are configured in \`src/desktop/wails.css\`. Custom Windows buttons do not implement the native Snap Layout hover menu.
`
    : ""
}${
    config.targets.includes("pwa")
      ? `
## Installable web app

\`\`\`sh
npm run build:pwa
npm run preview:pwa
\`\`\`

Open the printed localhost URL to test installation and offline reloads. The production PWA is in \`dist-pwa/\`; it needs HTTPS when hosted. The worker caches the app shell, not API data. Workers are disabled during development. Updates take effect after all app windows close. Replace the generated icons before release. The separate PWA Vite config leaves the base build and desktop app unchanged.
`
      : ""
  }`;
}

async function addIgnore(root, files) {
  const previous = await readOptional(resolve(root, ".gitignore"));
  const lines = [
    "node_modules/",
    "dist/",
    "dist-pwa/",
    "build/bin/",
    "src/wailsjs/",
    "package.json.md5",
  ];
  const missing = lines.filter(
    (line) => !(previous ?? "").split(/\r?\n/).includes(line),
  );
  files[".gitignore"] = {
    previous,
    content:
      (previous ?? "") +
      (previous && !previous.endsWith("\n") ? "\n" : "") +
      (missing.length ? missing.join("\n") + "\n" : ""),
  };
}

export async function setup(config, root, options = {}) {
  validateConfig(config);
  root = resolve(root);
  await assertNoSymlinks(root);
  const pkg = starterPackage(config.name);
  const files = await starterFiles(config);
  Object.assign(files, await featureFiles(root, config, pkg, { fresh: true }));
  files["package.json"] = json(pkg);
  files["labpane.json"] = {
    content: json({ ...config, directory: "." }),
    previous: options.previousConfig ?? null,
  };
  files["README.md"] = instructions(config);
  await addIgnore(root, files);
  const changed = await applyFiles(root, files, options);
  return { root, changed, config };
}

export async function setupFromFile(path, options) {
  const absolute = resolve(path);
  const config = validateConfig(await readJson(absolute));
  const root = resolve(dirname(absolute), config.directory);
  const previousConfig =
    absolute === resolve(root, "labpane.json")
      ? await readOptional(absolute)
      : null;
  return setup(config, root, { ...options, previousConfig });
}

export async function addTarget(target, directory, options = {}) {
  const root = resolve(directory);
  await assertNoSymlinks(root);
  const pkgPath = resolve(root, "package.json");
  const previousPackage = await readOptional(pkgPath);
  if (previousPackage === null)
    throw new Error(
      "No package.json found. Create an app with `labpane init` first.",
    );
  const pkg = await readJson(pkgPath);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  if (!deps.vite || !deps.react || !pkg.scripts?.dev || !pkg.scripts?.build) {
    throw new Error(
      "This first version supports React + Vite projects with dev/build scripts and the default dist output.",
    );
  }
  const configPath = resolve(root, "labpane.json");
  const previousConfig = await readOptional(configPath);
  const config =
    previousConfig === null
      ? {
          version: 1,
          name: pkg.name ?? basename(root),
          directory: ".",
          template: "react-ts",
          targets: ["web"],
        }
      : validateConfig(await readJson(configPath));
  if (resolve(root, config.directory) !== root)
    throw new Error(
      "The project's labpane.json must have directory set to '.'.",
    );
  if (!config.targets.includes(target)) config.targets.push(target);
  validateConfig(config);
  // Only touch the requested integration; never regenerate the application's source.
  const files = await featureFiles(root, { ...config, targets: [target] }, pkg);
  files["package.json"] = { previous: previousPackage, content: json(pkg) };
  files["labpane.json"] = { previous: previousConfig, content: json(config) };
  await addIgnore(root, files);
  const changed = await applyFiles(root, files, options);
  return { root, changed, config };
}
