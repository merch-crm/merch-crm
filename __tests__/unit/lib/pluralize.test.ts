/**
 * Тесты для модуля склонений
 */

import { describe, it, expect } from "vitest";
import { pluralize, formatCount } from "@/lib/pluralize";

describe("pluralize", () => {
  describe("pluralize()", () => {
    it("должен склонять слово 'заказ' правильно", () => {
      expect(pluralize(1, "заказ", "заказа", "заказов")).toBe("заказ");
      expect(pluralize(2, "заказ", "заказа", "заказов")).toBe("заказа");
      expect(pluralize(5, "заказ", "заказа", "заказов")).toBe("заказов");
      expect(pluralize(11, "заказ", "заказа", "заказов")).toBe("заказов");
      expect(pluralize(21, "заказ", "заказа", "заказов")).toBe("заказ");
      expect(pluralize(22, "заказ", "заказа", "заказов")).toBe("заказа");
    });

    it("должен склонять слово 'клиент' правильно", () => {
      expect(pluralize(1, "клиент", "клиента", "клиентов")).toBe("клиент");
      expect(pluralize(3, "клиент", "клиента", "клиентов")).toBe("клиента");
      expect(pluralize(10, "клиент", "клиента", "клиентов")).toBe("клиентов");
    });

    it("должен обрабатывать ноль", () => {
      expect(pluralize(0, "товар", "товара", "товаров")).toBe("товаров");
    });
  });

  describe("sentence()", () => {
    it("должен формировать полное предложение", () => {
      expect(formatCount(1, "заказ", "заказа", "заказов")).toBe("1 заказ");
      expect(formatCount(5, "заказ", "заказа", "заказов")).toBe("5 заказов");
      expect(formatCount(23, "клиент", "клиента", "клиентов")).toBe("23 клиента");
    });
  });
});
