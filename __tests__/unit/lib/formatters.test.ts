/**
 * Тесты для форматтеров
 */

import { describe, it, expect } from "vitest";
import { formatCurrency, formatPhone, formatDate } from "@/lib/formatters";

describe("formatters", () => {
  describe("formatCurrency()", () => {
    it("должен форматировать рубли", () => {
      // Intl.NumberFormat uses non-breaking thin space \u202f as thousands separator in ru-RU
      expect(formatCurrency(1000)).toMatch(/1[\s\u202f]000\s*₽/);
      expect(formatCurrency(1234567.89)).toMatch(/1[\s\u202f]234[\s\u202f]567,89\s*₽/);
      expect(formatCurrency(0)).toMatch(/0\s*₽/);
    });

    it("должен обрабатывать отрицательные значения", () => {
      expect(formatCurrency(-500)).toMatch(/-[\s]?500\s*₽/);
    });

    it("должен обрабатывать строки", () => {
      expect(formatCurrency("1500.50" as unknown as number)).toMatch(/1[\s\u202f]500,50\s*₽/);
    });
  });

  describe("formatPhone()", () => {
    it("должен форматировать российский номер", () => {
      expect(formatPhone("79001234567")).toBe("+7 (900) 123-45-67");
      expect(formatPhone("+79001234567")).toBe("+7 (900) 123-45-67");
    });

    it("должен возвращать исходное значение для некорректного номера", () => {
      expect(formatPhone("123")).toBe("123");
      expect(formatPhone("")).toBe("");
    });
  });

  describe("formatDate()", () => {
    it("должен форматировать дату на русском", () => {
      const date = new Date("2024-03-15T12:00:00");
      // formatDate with default format returns dd.MM.yyyy
      const result = formatDate(date);
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });

    it("должен форматировать дату с явным форматом", () => {
      const date = new Date("2024-03-15T12:00:00");
      // With custom format string in date-fns notation
      expect(formatDate(date, "d MMMM yyyy")).toBe("15 марта 2024");
    });

    it("должен обрабатывать строковые даты", () => {
      const result = formatDate("2024-01-01");
      expect(result).toMatch(/\d{2}\.\d{2}\.\d{4}/);
    });
  });
});
