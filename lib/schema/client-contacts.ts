// lib/schema/client-contacts.ts
import { pgTable, uuid, text, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clients } from "./clients";

// Роли контактных лиц
export const contactRoles = ["lpr", "accountant", "buyer", "other"] as const;
export type ContactRole = typeof contactRoles[number];

export const contactRoleLabels: Record<ContactRole, string> = {
    lpr: "ЛПР",
    accountant: "Бухгалтер",
    buyer: "Закупщик",
    other: "Другое",
};

export const clientContacts = pgTable("client_contacts", {
    id: uuid("id").primaryKey().defaultRandom(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),

    // Основная информация
    name: text("name").notNull(),
    position: text("position"),
    role: text("role").notNull().default("other"),

    // Контакты
    phone: text("phone"),
    email: text("email"),
    telegram: text("telegram"),

    // Флаги
    isPrimary: boolean("is_primary").default(false),

    // Метаданные
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
}, (table) => ({
    clientIdIdx: index("idx_client_contacts_client_id").on(table.clientId),
    roleIdx: index("idx_client_contacts_role").on(table.role),
    emailIdx: index("idx_client_contacts_email").on(table.email),
    phoneIdx: index("idx_client_contacts_phone").on(table.phone),
    createdAtIdx: index("idx_client_contacts_created_at").on(table.createdAt),
}));

// Отношения
export const clientContactsRelations = relations(clientContacts, ({ one }) => ({
    client: one(clients, {
        fields: [clientContacts.clientId],
        references: [clients.id],
    }),
}));

// Типы
export type ClientContact = typeof clientContacts.$inferSelect;
export type NewClientContact = typeof clientContacts.$inferInsert;
