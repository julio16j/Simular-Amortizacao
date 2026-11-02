import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  use: {
    baseURL: "http://localhost:3001",
    browserName: "chromium",
    channel: "msedge",
    headless: true,
  },
  reporter: "list",
});
