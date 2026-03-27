/**
 * Схема таблицы загруженных файлов дизайнов
 * @module calculators
 * @audit files
 */

import { pgTable, uuid, varchar, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Таблица загруженных файлов дизайнов
 * 
 * Хранит метаданные загруженных файлов для калькуляторов.
 * Сами файлы хранятся в файловой системе.
 */
export const designFiles = pgTable('design_files', {
  /** Уникальный идентификатор */
  id: uuid('id').primaryKey().defaultRandom(),
  
  /** Оригинальное имя файла */
  originalName: varchar('original_name', { length: 255 }).notNull(),
  
  /** Имя файла на сервере (UUID.ext) */
  storedName: varchar('stored_name', { length: 255 }).notNull().unique(),
  
  /** MIME-тип */
  mimeType: varchar('mime_type', { length: 150 }).notNull(),
  
  /** Расширение файла */
  extension: varchar('extension', { length: 50 }).notNull(),
  
  /** Размер в байтах */
  sizeBytes: integer('size_bytes').notNull(),
  
  /** Путь к файлу (относительный) */
  filePath: varchar('file_path', { length: 1000 }).notNull(),
  
  /** Путь к превью (для изображений) */
  thumbnailPath: varchar('thumbnail_path', { length: 1000 }),
  
  /** Тип калькулятора */
  calculatorType: varchar('calculator_type', { length: 50 }).notNull(),
  
  /**
   * Размеры из файла (JSON)
   * { widthPx, heightPx, widthMm, heightMm }
   */
  fileDimensions: jsonb('file_dimensions'),
  
  /**
   * Данные вышивки (JSON, для DST и др.)
   * { format, stitchCount, colorCount, colorSequence, widthMm, heightMm, estimatedTimeMin }
   */
  embroideryData: jsonb('embroidery_data'),
  
  /** ID пользователя, загрузившего файл */
  uploadedBy: uuid('uploaded_by').notNull().references(() => users.id),
  
  /** ID расчёта (опционально, если файл привязан к истории) */
  calculationId: uuid('calculation_id'),
  
  /** Дата загрузки */
  uploadedAt: timestamp('uploaded_at', { withTimezone: true }).notNull().defaultNow(),

  /** Дата создания (для совместимости с аудитом) */
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  
  /** Дата удаления (soft delete) */
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  
}, (table) => ({
  /** Индекс по типу калькулятора */
  calculatorTypeIdx: index('design_files_calculator_type_idx').on(table.calculatorType),
  
  /** Индекс по пользователю */
  uploadedByIdx: index('design_files_uploaded_by_idx').on(table.uploadedBy),
  
  /** Индекс по расчёту */
  calculationIdIdx: index('design_files_calc_id_idx').on(table.calculationId),
  
  /** Индекс по дате загрузки */
  uploadedAtIdx: index('design_files_uploaded_at_idx').on(table.uploadedAt),
  
  /** Индекс по soft delete */
  deletedAtIdx: index('design_files_deleted_at_idx').on(table.deletedAt),

  /** Составной индекс: пользователь + тип калькулятора */
  userCalculatorIdx: index('design_files_user_calc_idx').on(table.uploadedBy, table.calculatorType),

  /** Индекс по дате создания */
  createdIdx: index('design_files_created_idx').on(table.createdAt),
}));

/**
 * Связи таблицы файлов
 */
export const designFilesRelations = relations(designFiles, ({ one }) => ({
  /** Кто загрузил */
  uploadedByUser: one(users, {
    fields: [designFiles.uploadedBy],
    references: [users.id],
  }),
}));

/**
 * Типы записей (для TypeScript)
 */
export type DesignFileRecord = typeof designFiles.$inferSelect;
export type NewDesignFileRecord = typeof designFiles.$inferInsert;
