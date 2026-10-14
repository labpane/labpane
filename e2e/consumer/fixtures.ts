import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ quiet: void }>({
  quiet: [
    async ({ page }, use) => {
      const messages: string[] = [];
      page.on("pageerror", (error) => messages.push(`error: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error" || message.type() === "warning")
          messages.push(`${message.type()}: ${message.text()}`);
      });
      await use();
      expect(messages, "Browser errors and warnings").toEqual([]);
    },
    { auto: true },
  ],
});
export { expect };
