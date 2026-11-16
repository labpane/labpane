import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import lighthouse from "lighthouse";
import desktopConfig from "lighthouse/core/config/desktop-config.js";
import { launch } from "chrome-launcher";
import { chromium } from "@playwright/test";
import { preview } from "vite";

const root = fileURLToPath(new URL(".", import.meta.url));
const output = new URL("./lighthouse-reports/", import.meta.url);
const categories = ["performance", "accessibility", "best-practices", "seo"];
const server = await preview({
  root,
  preview: { host: "127.0.0.1", port: 4176, strictPort: true },
});
const scores = [];
try {
  await mkdir(output, { recursive: true });
  for (const mode of ["mobile", "desktop"]) {
    for (const [name, path] of [
      ["home", "/"],
      ["palette", "/palette/"],
      ["workspace", "/desktop/"],
    ]) {
      const chrome = await launch({
        chromePath: process.env.CHROME_PATH || chromium.executablePath(),
        chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
      });
      try {
        const result = await lighthouse(
          `http://127.0.0.1:4176${path}`,
          {
            port: chrome.port,
            onlyCategories: categories,
            output: ["json", "html"],
            logLevel: "error",
          },
          mode === "desktop" ? desktopConfig : undefined,
        );
        if (!result || result.lhr.runtimeError) {
          throw new Error(
            result?.lhr.runtimeError?.message ||
              "Lighthouse returned no report",
          );
        }
        const row = {
          page: name,
          mode,
          ...Object.fromEntries(
            categories.map((id) => [
              id,
              Math.round(result.lhr.categories[id].score * 100),
            ]),
          ),
        };
        scores.push(row);
        console.log(row);
        await writeFile(
          new URL(`${name}-${mode}.json`, output),
          result.report[0],
        );
        await writeFile(
          new URL(`${name}-${mode}.html`, output),
          result.report[1],
        );
        // Accessibility is deterministic; retain the other category scores for review.
        if (result.lhr.categories.accessibility.score !== 1) {
          const failed = result.lhr.categories.accessibility.auditRefs
            .map(({ id }) => result.lhr.audits[id])
            .filter(({ score }) => score !== null && score < 1)
            .map(({ id, title }) => `${id}: ${title}`);
          console.error(
            `${name} (${mode}) must score 100 for accessibility:\n${failed.join("\n")}`,
          );
          process.exitCode = 1;
        }
      } finally {
        await chrome.kill();
      }
    }
  }
} finally {
  await writeFile(
    new URL("scores.json", output),
    JSON.stringify(scores, null, 2) + "\n",
  );
  await new Promise((resolve, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : resolve())),
  );
}
