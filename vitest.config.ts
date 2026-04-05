import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: ["./tests/global-setup.ts"],
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    // One process avoids duplicate Mongoose model registration across test files
    pool: "forks",
    poolOptions: {
      forks: {
        singleFork: true,
      },
    },
    fileParallelism: false,
    hookTimeout: 60_000,
    testTimeout: 30_000,
    coverage: {
      reporter: ["text", "html"],
    },
  },
});
