import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    hookTimeout: 120000, // 120 seconds for MongoMemoryServer to download/start
    testTimeout: 30000,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
