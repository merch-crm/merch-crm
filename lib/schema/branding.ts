import { pgTable, text, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users';

/**
 * Таблица настроек брендинга для PDF
 * @audit Хранит настройки компании пользователя для генерации документов
 */
export const brandingSettings = pgTable('branding_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' })
    .unique(),
  
  // Информация о компании
  companyName: text('company_name').notNull().default('Моя компания'),
  logoUrl: text('logo_url'),
  
  // Цвета
  primaryColor: text('primary_color').notNull().default('#2563eb'),
  secondaryColor: text('secondary_color').notNull().default('#64748b'),
  
  // Контакты
  phone: text('phone'),
  email: text('email'),
  website: text('website'),
  address: text('address'),
  
  // Реквизиты
  inn: text('inn'),
  kpp: text('kpp'),
  ogrn: text('ogrn'),
  bankDetails: text('bank_details'),
  
  // Дополнительно
  footerText: text('footer_text'),
  showQrCode: boolean('show_qr_code').notNull().default(false),
  
  // Метаданные
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => {
  return {
    emailIdx: index('branding_email_idx').on(table.email),
    phoneIdx: index('branding_phone_idx').on(table.phone),
    createdIdx: index('branding_created_idx').on(table.createdAt),
    userIdIdx: index('branding_user_idx').on(table.userId),
  }
});

export const brandingSettingsRelations = relations(brandingSettings, ({ one }) => ({
  user: one(users, {
    fields: [brandingSettings.userId],
    references: [users.id],
  }),
}));

/**
 * Тип для вставки настроек брендинга
 */
export type InsertBrandingSettings = typeof brandingSettings.$inferInsert;

/**
 * Тип для выборки настроек брендинга
 */
export type SelectBrandingSettings = typeof brandingSettings.$inferSelect;
