import { defineConfig } from "@playwright/test";

const server = (port: number, command: string) => ({
  command: `bunx vite ${command} --port ${port} --strictPort --host 127.0.0.1`,
  url: `http://127.0.0.1:${port}/`,
  timeout: 60_000,
});

export default defineConfig({
  testDir: ".",
  testMatch: "*.spec.ts",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 2,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    browserName: "chromium",
    viewport: { width: 1400, height: 800 },
    trace: "retain-on-failure",
  },
  projects: [
    { name: "dev", use: { baseURL: "http://127.0.0.1:5310/" } },
    { name: "build", use: { baseURL: "http://127.0.0.1:5311/" } },
  ],
  webServer: [server(5310, ""), server(5311, "preview")],
});
