import { defineConfig, mergeConfig } from "vitest/config";
import baseConfig from "./vitest.config";

export default mergeConfig(
  baseConfig,
  defineConfig({
    test: {
      include: ["__tests__/integration/**/*.test.ts"],
      // Интеграционные тесты запускаются последовательно
      pool: "forks",
      poolOptions: {
        forks: {
          singleFork: true,
        },
      },
      // Больше времени для работы с БД
      testTimeout: 30000,
      hookTimeout: 30000,
    },
  })
);
