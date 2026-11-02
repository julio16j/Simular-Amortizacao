import { defineConfig } from "vitest/config";
export default defineConfig({
  test: { include: ["tests/finance/**/*.test.ts"] },
});
