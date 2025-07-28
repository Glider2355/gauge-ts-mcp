import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1,
      },
    },
    coverage: {
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "build/",
        "test/",
        "**/*.d.ts",
        "vitest.config.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
