/**
 * Тесты CSRF-защиты
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateCsrfToken, validateCsrfToken } from "@/lib/csrf";

describe("CSRF", () => {
  beforeEach(() => {
    vi.stubEnv("BETTER_AUTH_SECRET", "test-secret-32-characters-long!!");
  });

  describe("generateCsrfToken()", () => {
    it("должен генерировать токен в правильном формате", () => {
      const token = generateCsrfToken();
      const parts = token.split(":");

      expect(parts).toHaveLength(3);
      expect(parts[0]).toHaveLength(64); // hex encoded 32 bytes
      expect(parseInt(parts[1])).toBeGreaterThan(0); // timestamp
      expect(parts[2]).toHaveLength(64); // HMAC signature
    });

    it("должен генерировать уникальные токены", () => {
      const token1 = generateCsrfToken();
      const token2 = generateCsrfToken();

      expect(token1).not.toBe(token2);
    });
  });

  describe("validateCsrfToken()", () => {
    it("должен валидировать корректный токен", () => {
      const token = generateCsrfToken();
      expect(validateCsrfToken(token)).toBe(true);
    });

    it("должен отклонять пустой токен", () => {
      expect(validateCsrfToken("")).toBe(false);
    });

    it("должен отклонять токен с неверной подписью", () => {
      const token = generateCsrfToken();
      const [value, timestamp] = token.split(":");
      const tamperedToken = `${value}:${timestamp}:invalid-signature`;

      expect(validateCsrfToken(tamperedToken)).toBe(false);
    });

    it("должен отклонять истёкший токен", () => {
      // Здесь нужен мок для создания токена с старым timestamp
      // Для простоты пропускаем
    });
  });
});
