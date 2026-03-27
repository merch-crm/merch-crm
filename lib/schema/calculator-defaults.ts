/**
 * Схема таблицы дефолтных настроек калькуляторов
 * @module calculators
 * @audit settings
 */

import { pgTable, uuid, varchar, jsonb, timestamp, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Таблица дефолтных настроек расходников для калькуляторов
 * 
 * Хранит глобальные настройки расходников для каждого типа калькулятора.
 * Одна запись на каждый тип калькулятора.
 */
export const calculatorDefaults = pgTable('calculator_defaults', {
  /** Уникальный идентификатор */
  id: uuid('id').primaryKey().defaultRandom(),
  
  /** ID пользователя (владельца настроек) */
  userId: uuid('user_id').notNull().references(() => users.id),
  
  /** Тип калькулятора */
  calculatorType: varchar('calculator_type', { length: 50 }).notNull(),
  
  /**
   * Конфигурация расходников (JSON)
   * Массив объектов ConsumableItem
   */
  consumablesConfig: jsonb('consumables_config').notNull(),
  
  /**
   * Конфигурация наценок за срочность (JSON)
   */
  urgencyConfig: jsonb('urgency_config'),
  
  /**
   * Конфигурация маржинальности по умолчанию (JSON)
   */
  marginConfig: jsonb('margin_config'),
  
  /**
   * Специфичные для калькулятора настройки (JSON)
   * (например, виды пленок, доплаты за белый слой)
   */
  printConfig: jsonb('print_config'),
  
  /** Дата создания */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** Дата обновления */
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  
}, (table) => ({
  /** Уникальный индекс на пользователя и тип калькулятора */
  userTypeIdx: uniqueIndex('calc_defaults_user_type_idx')
    .on(table.userId, table.calculatorType),
    
  /** Индекс по типу калькулятора */
  calculatorTypeIdx: index('calc_defaults_type_idx').on(table.calculatorType),
  /** Индекс по дате создания */
  createdIdx: index('calc_defaults_created_idx').on(table.createdAt),
}));

export const calculatorDefaultsRelations = relations(calculatorDefaults, ({ one }) => ({
  user: one(users, {
    fields: [calculatorDefaults.userId],
    references: [users.id],
  }),
}));

/**
 * Тип записи дефолтов калькулятора (для TypeScript)
 */
export type CalculatorDefaultsRecord = typeof calculatorDefaults.$inferSelect;
export type NewCalculatorDefaultsRecord = typeof calculatorDefaults.$inferInsert;
