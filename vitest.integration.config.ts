import { defineConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default defineConfig({
  plugins: baseConfig.plugins,
  test: {
    ...baseConfig.test,
    include: ["__tests__/integration/**/*.test.ts"],
    exclude: [
      ...(baseConfig.test?.exclude || []).filter(pat => pat !== "**/integration/**"),
      "**/app/**/__tests__/**",
      "**/lib/**/__tests__/**",
      "**/components/**/__tests__/**",
    ],
    // Интеграционные тесты запускаются последовательно
    fileParallelism: false,
    maxWorkers: 1,
    isolate: true, // Use isolation to prevent data leaks between files
    // Больше времени для работы с БД
    testTimeout: 60000,
    hookTimeout: 60000,
  },
});
