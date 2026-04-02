import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

/**
 * Глобальная настройка тестов
 */

// Устанавливаем env-переменные ДО импорта любых модулей
if (!process.env.BETTER_AUTH_SECRET) {
  process.env.BETTER_AUTH_SECRET = "test-secret-key-32-chars-minimum-length"; // audit-ignore: test env only
}
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = process.env.BETTER_AUTH_SECRET;
}
if (!process.env.JWT_SECRET_KEY) {
  process.env.JWT_SECRET_KEY = process.env.BETTER_AUTH_SECRET;
}
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "postgresql://postgres:postgres@127.0.0.1:5432/merch_crm_test";
}

import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import { server } from "./mocks/server";

// MSW сервер
beforeAll(() => {
  server.listen({ onUnhandledRequest: "warn" });
});

afterEach(() => {
  cleanup();
  server.resetHandlers();
  vi.clearAllMocks();
});

afterAll(() => {
  server.close();
});

// Мокаем next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  redirect: vi.fn(),
}));

// Мокаем next/headers
vi.mock("next/headers", () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => new Headers(),
}));

// Мокаем фоновую очередь, чтобы не было утечек соединений к БД в тестах
vi.mock("@/lib/queue", () => ({
  queueClientStatsUpdate: vi.fn(),
  queueTask: vi.fn((_name, task) => task()), // Выполняем сразу или не выполняем вовсе (сейчас просто мокаем)
}));

// Глобальные моки
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
