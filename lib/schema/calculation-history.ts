/**
 * Схема таблицы истории расчётов калькуляторов
 * @module calculators
 * @audit calculators
 */

import { pgTable, uuid, varchar, text, timestamp, numeric, jsonb, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';
import { clients } from './clients/main';

/**
 * Таблица истории расчётов
 * 
 * Хранит все сохранённые расчёты из калькуляторов печати.
 * Поддерживает soft delete через поле deleted_at.
 */
export const calculationHistory = pgTable('calculation_history', {
  /** Уникальный идентификатор */
  id: uuid('id').primaryKey().defaultRandom(),
  
  /** Номер расчёта (CALC-2026-00001) */
  calculationNumber: varchar('calculation_number', { length: 20 }).notNull().unique(),
  
  /** Название расчёта (обязательное) */
  name: varchar('name', { length: 255 }).notNull(),
  
  /** Тип калькулятора */
  calculatorType: varchar('calculator_type', { length: 50 }).notNull(),
  
  /** Имя клиента (текстовое, для обратной совместимости или если клиент не в базе) */
  clientName: varchar('client_name', { length: 255 }),
  
  /** ID клиента из базы (если привязан) */
  clientId: uuid('client_id').references(() => clients.id),
  
  /** Комментарий к расчёту */
  comment: text('comment'),
  
  /** Общая себестоимость */
  totalCost: numeric('total_cost', { precision: 12, scale: 2 }).notNull(),
  
  /** Цена продажи */
  sellingPrice: numeric('selling_price', { precision: 12, scale: 2 }).notNull(),
  
  /** Количество изделий */
  quantity: numeric('quantity', { precision: 10, scale: 0 }).notNull(),
  
  /** Цена за единицу */
  pricePerItem: numeric('price_per_item', { precision: 12, scale: 2 }).notNull(),
  
  /** Процент маржи */
  marginPercent: numeric('margin_percent', { precision: 5, scale: 2 }).notNull(),
  
  /** 
   * Полные параметры расчёта (JSON)
   * Включает: consumables, placements, costBreakdown, layoutSettings, specificParams
   */
  parameters: jsonb('parameters').notNull(),
  
  /** 
   * Загруженные файлы дизайнов (JSON)
   * Массив объектов UploadedDesignFile
   */
  designFiles: jsonb('design_files').notNull().default('[]'),
  
  /**
   * Визуализация раскладки (JSON, опционально)
   * Включает: imageUrl, totalLengthM, efficiencyPercent
   */
  rollVisualization: jsonb('roll_visualization'),
  
  /** Дата создания */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** ID автора */
  createdBy: uuid('created_by').notNull().references(() => users.id),
  
  /** Дата удаления (soft delete) */
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  
  /** ID удалившего */
  deletedBy: uuid('deleted_by').references(() => users.id),
  
}, (table) => ({
  /** Индекс по типу калькулятора для фильтрации */
  calculatorTypeIdx: index('calc_history_calculator_type_idx').on(table.calculatorType),
  
  /** Индекс по дате создания для сортировки */
  createdAtIdx: index('calc_history_created_at_idx').on(table.createdAt),
  
  /** Индекс по soft delete для фильтрации активных записей */
  deletedAtIdx: index('calc_history_deleted_at_idx').on(table.deletedAt),
  
  /** Индекс по автору для фильтрации */
  createdByIdx: index('calc_history_created_by_idx').on(table.createdBy),
  
  /** Индекс по клиенту для поиска */
  clientIdIdx: index('calc_history_client_id_idx').on(table.clientId),

  /** Составной индекс для поиска по названию, номеру и клиенту */
  searchIdx: index('calc_history_search_idx').on(table.name, table.calculationNumber, table.clientName, table.clientId),
  
  /** Индекс по клиенту и дате создания для истории клиента */
  clientCreatedIdx: index('calc_history_client_created_idx').on(table.clientId, table.createdAt),

  /** Составной индекс для фильтрации (пользователь, тип, дата) */
  userTypeCreatedIdx: index('calc_history_user_type_created_idx')
    .on(table.createdBy, table.calculatorType, table.createdAt),
}));

/**
 * Связи таблицы истории расчётов
 */
export const calculationHistoryRelations = relations(calculationHistory, ({ one }) => ({
  /** Автор расчёта */
  createdByUser: one(users, {
    fields: [calculationHistory.createdBy],
    references: [users.id],
  }),
  /** Кто удалил (если удалён) */
  deletedByUser: one(users, {
    fields: [calculationHistory.deletedBy],
    references: [users.id],
  }),
  /** Связанный клиент */
  client: one(clients, {
    fields: [calculationHistory.clientId],
    references: [clients.id],
  }),
}));

/**
 * Тип записи истории расчётов (для TypeScript)
 */
export type CalculationHistoryRecord = typeof calculationHistory.$inferSelect;
export type NewCalculationHistoryRecord = typeof calculationHistory.$inferInsert;
