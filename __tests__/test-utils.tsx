/**
 * Утилиты для тестирования React компонентов
 */

import { ReactElement, ReactNode } from "react";
import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
// Провайдеры для тестов
function AllProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
    </>
  );
}

/**
 * Кастомный render с провайдерами
 */
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
}

export * from "@testing-library/react";
export { customRender as render };

/**
 * Хелпер для ожидания
 */
export function waitFor(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Создаёт мок сессии пользователя
 */
export function createMockSession(overrides = {}) {
  return {
    user: {
      id: "test-user-id",
      name: "Тест Пользователь",
      email: "test@example.com",
      roleId: "admin-role-id",
      departmentId: "dept-id",
      ...overrides,
    },
    session: {
      id: "session-id",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // suppressHydrationWarning
    },
  };
}

/**
 * Создаёт тестовые данные заказа
 */
export function createMockOrder(overrides = {}) {
  return {
    id: "order-1",
    orderNumber: "ORD-24-0001",
    clientId: "client-1",
    status: "new" as const,
    category: "print" as const,
    totalAmount: "5000.00",
    isUrgent: false,
    priority: "normal",
    createdAt: new Date(), // suppressHydrationWarning
    updatedAt: new Date(), // suppressHydrationWarning
    ...overrides,
  };
}

/**
 * Создаёт тестовые данные клиента
 */
export function createMockClient(overrides = {}) {
  return {
    id: "client-1",
    clientType: "b2c" as const,
    lastName: "Иванов",
    firstName: "Иван",
    patronymic: "Иванович",
    name: "Иванов Иван Иванович",
    phone: "+79001234567",
    email: "ivanov@example.com",
    isArchived: false,
    createdAt: new Date(), // suppressHydrationWarning
    updatedAt: new Date(), // suppressHydrationWarning
    ...overrides,
  };
}

/**
 * Создаёт тестовые данные товара
 */
export function createMockInventoryItem(overrides = {}) {
  return {
    id: "item-1",
    name: "Футболка белая",
    sku: "TSH-WHT-M",
    quantity: 100,
    reservedQuantity: 10,
    lowStockThreshold: 20,
    criticalStockThreshold: 5,
    costPrice: "500.00",
    sellingPrice: "1200.00",
    isArchived: false,
    createdAt: new Date(), // suppressHydrationWarning
    updatedAt: new Date(), // suppressHydrationWarning
    ...overrides,
  };
}
