// Runs native checks inside the real Wails webview, using only public APIs.
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { dirname, resolve } from "node:path";

if (process.platform !== "win32") {
  throw new Error(
    "This native smoke runner is currently verified on Windows only.",
  );
}
const executable = resolve(
  process.argv[2] ?? "build/bin/labpane-wails-e2e.exe",
);
await access(executable);
for (const frame of ["custom", "native"]) {
  let output = "";
  const app = spawn(executable, [`-frame=${frame}`, "-test"], {
    cwd: dirname(executable),
    stdio: ["ignore", "pipe", "pipe"],
  });
  for (const stream of [app.stdout, app.stderr]) {
    stream.on("data", (chunk) => {
      output = (output + chunk).slice(-16000);
    });
  }
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    app.kill();
  }, 30000);
  try {
    const code = await new Promise((done, fail) => {
      app.once("error", fail);
      app.once("exit", done);
    });
    assert.equal(timedOut, false, `Native test timed out. ${output}`);
    assert.equal(code, 0, output);
    assert.doesNotMatch(output, /LABPANE_TEST_FAIL/, output);
    assert.match(
      output,
      /LABPANE_TEST_PASS/,
      `Window closed without completing its checks. ${output}`,
    );
    console.log(`${frame}: actual native window state and UI checks passed.`);
  } finally {
    clearTimeout(timer);
    if (app.exitCode === null && app.signalCode === null) app.kill();
  }
}
