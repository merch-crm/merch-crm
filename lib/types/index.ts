/**
 * @fileoverview Централизованный экспорт типов
 * @module lib/types
 * @audit Обновлён 2026-03-27
 */

// Калькуляторы
export * from './calculators';

// Нанесения
export * from './placements';

// Расходники (дополнительные типы)
export * from './consumables';

// PDF
export * from './pdf';

// Конфигурации калькуляторов
export * from './calculator-configs';

// Общие типы и Action-хелперы
export * from './common';

// Клиенты
export * from './client';

// Пользователи и роли
export * from './user';

// Уведомления
export * from './notification';

// Заказы — order.ts: полный экспорт (Order, OrderStatus, OrderItem и т.д.)
export * from './order';
// orders.ts: только Drizzle-типы и типы, которых нет в order.ts
export type { NewOrder, OrderWithRelations, GetOrdersParams, GetOrdersResult, CreateOrderInput } from './orders';

// Дизайны
export * from './designs';

// Товары/продукты
export * from './product';

// Склад и инвентарь
export * from './warehouse';
export * from './inventory';

// Задачи
export * from './tasks';

// Финансы
export * from './finance';

// Брендинг
export * from './branding';

// Присутствие (онлайн-статус)
export * from './presence';
