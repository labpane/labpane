import { defineConfig } from "@playwright/test";

const port = 4174;

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    browserName: "chromium",
    baseURL: `http://127.0.0.1:${port}/`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "phone", use: { viewport: { width: 375, height: 812 } } },
  ],
  webServer: {
    command: `bun run build && bunx vite preview --port ${port} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}/`,
    timeout: 120_000,
  },
});
