/**
 * Схема таблиц для модуля нанесений
 * @module calculators
 * @audit placements
 */

import { pgTable, uuid, varchar, text, numeric, boolean, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Таблица изделия для нанесения
 * 
 * Хранит типы изделий: Футболка, Худи, Кепка, Кружка и т.д.
 */
export const placementItems = pgTable('placement_items', {
  /** Уникальный идентификатор */
  id: uuid('id').primaryKey().defaultRandom(),
  
  /** Тип изделия (slug из PRODUCT_TYPES) */
  type: varchar('type', { length: 50 }).notNull(),
  
  /** Название изделия */
  name: varchar('name', { length: 255 }).notNull(),
  
  /** Описание */
  description: text('description'),
  
  /** Активность */
  isActive: boolean('is_active').notNull().default(true),
  
  /** Порядок сортировки */
  sortOrder: integer('sort_order').notNull().default(0),
  
  /** Кто создал */
  createdBy: uuid('created_by').notNull().references(() => users.id),
  
  /** Дата создания */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** Дата обновления */
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** Дата мягкого удаления */
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  
  /** Кто удалил */
  deletedBy: uuid('deleted_by').references(() => users.id),
  
}, (table) => ({
  /** Индексы */
  typeIdx: index('placement_items_type_idx').on(table.type),
  isActiveIdx: index('placement_items_is_active_idx').on(table.isActive),
  sortOrderIdx: index('placement_items_sort_order_idx').on(table.sortOrder),
  deletedAtIdx: index('placement_items_deleted_at_idx').on(table.deletedAt),
  /** Индекс по дате создания */
  createdIdx: index('placement_items_created_idx').on(table.createdAt),
}));

/**
 * Таблица областей нанесения
 * 
 * Хранит области нанесения для каждого изделия:
 * Грудь слева, Спина полная, Рукав и т.д.
 */
export const placementAreas = pgTable('placement_areas', {
  /** Уникальный идентификатор */
  id: uuid('id').primaryKey().defaultRandom(),
  
  /** ID изделия */
  productId: uuid('product_id').notNull().references(() => placementItems.id, { onDelete: 'cascade' }),
  
  /** Название области */
  name: varchar('name', { length: 255 }).notNull(),
  
  /** Код области (slug для программной идентификации) */
  code: varchar('code', { length: 100 }).notNull(),
  
  /** Максимальная ширина (мм) */
  maxWidthMm: integer('max_width_mm').notNull().default(100),
  
  /** Максимальная высота (мм) */
  maxHeightMm: integer('max_height_mm').notNull().default(100),
  
  /** Стоимость работы (₽) */
  workPrice: numeric('work_price', { precision: 10, scale: 2 }).notNull().default('0'),
  
  /** Активность */
  isActive: boolean('is_active').notNull().default(true),
  
  /** Порядок сортировки */
  sortOrder: integer('sort_order').notNull().default(0),
  
  /** Кто создал */
  createdBy: uuid('created_by').notNull().references(() => users.id),
  
  /** Дата создания */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** Дата обновления */
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** Дата мягкого удаления */
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  
  /** Кто удалил */
  deletedBy: uuid('deleted_by').references(() => users.id),
  
}, (table) => ({
  /** Индексы */
  productIdIdx: index('placement_areas_product_id_idx').on(table.productId),
  codeIdx: index('placement_areas_code_idx').on(table.code),
  isActiveIdx: index('placement_areas_is_active_idx').on(table.isActive),
  sortOrderIdx: index('placement_areas_sort_order_idx').on(table.sortOrder),
  deletedAtIdx: index('placement_areas_deleted_at_idx').on(table.deletedAt),
  
  /** Составной индекс: продукт + код области */
  productCodeIdx: index('placement_areas_product_code_idx').on(table.productId, table.code),

  /** Индекс по дате создания */
  createdIdx: index('placement_areas_created_idx').on(table.createdAt),
}));

/**
 * Связи таблицы изделий
 */
export const placementItemsRelations = relations(placementItems, ({ many }) => ({
  /** Области нанесения */
  areas: many(placementAreas),
}));

/**
 * Связи таблицы областей
 */
export const placementAreasRelations = relations(placementAreas, ({ one }) => ({
  /** Изделие */
  product: one(placementItems, {
    fields: [placementAreas.productId],
    references: [placementItems.id],
  }),
}));

/**
 * Типы записей (для TypeScript)
 */
export type PlacementItemRecord = typeof placementItems.$inferSelect;
export type NewPlacementItemRecord = typeof placementItems.$inferInsert;
export type PlacementAreaRecord = typeof placementAreas.$inferSelect;
export type NewPlacementAreaRecord = typeof placementAreas.$inferInsert;
