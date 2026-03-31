/**
 * Схема таблицы изделий для модуля нанесений (расширенная)
 * @module calculators
 * @audit placements
 */

import { pgTable, uuid, text, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

export const placementProducts = pgTable('placement_products', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  code: text('code').notNull(),
  name: text('name'),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
}, (table) => ({
  // Индексы для оптимизации запросов
  userIdIdx: index('placement_products_user_id_idx').on(table.userId),
  codeIdx: index('placement_products_code_idx').on(table.code),
  
  /** Составной индекс: пользователь + код изделия */
  userCodeIdx: index('placement_products_user_code_idx').on(table.userId, table.code),

  /** Индекс по дате создания */
  createdIdx: index('placement_products_created_idx').on(table.createdAt),

  // Индекс для soft-delete
  deletedAtIdx: index('placement_products_deleted_at_idx').on(table.deletedAt),
}));

export const placementProductsRelations = relations(placementProducts, ({ one }) => ({
  user: one(users, {
    fields: [placementProducts.userId],
    references: [users.id],
  }),
}));
