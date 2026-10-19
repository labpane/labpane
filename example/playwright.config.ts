import { defineConfig, devices } from "@playwright/test";

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
    {
      name: "desktop",
      testIgnore: "mobile.spec.ts",
      use: { viewport: { width: 1440, height: 900 } },
    },
    {
      name: "phone",
      testIgnore: "mobile.spec.ts",
      use: { viewport: { width: 375, height: 812 } },
    },
    {
      name: "iphone",
      testMatch: "mobile.spec.ts",
      use: { ...devices["iPhone 16 Pro"], browserName: "webkit" },
    },
    {
      name: "android",
      testMatch: "mobile.spec.ts",
      use: { ...devices["Pixel 5"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: `bun run build && bunx vite preview --port ${port} --strictPort --host 127.0.0.1`,
    url: `http://127.0.0.1:${port}/`,
    timeout: 120_000,
  },
});
