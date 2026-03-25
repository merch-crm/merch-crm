import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./__tests__/setup.ts"],
    globals: true,
    testTimeout: 30000,
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/e2e/**",     
      "**/.next/**",
    ],
    include: [
      "**/__tests__/**/*.test.ts",
      "**/__tests__/**/*.test.tsx",
    ],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules",
        ".next",
        "**/*.d.ts",
        "**/*.config.*",
        "**/mocks/**",
      ],
      thresholds: {
        statements: 60,
        branches: 50,
        functions: 60,
        lines: 60,
      },
    },
    pool: "threads",
    poolOptions: {
      threads: {
        singleThread: true,
      },
    },
  },
});
