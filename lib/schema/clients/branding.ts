import { pgTable, text, timestamp, uuid, integer, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import {} from "../enums";
import { clients } from "./main";

// ============ БРЕНДИНГ КЛИЕНТА (B2B) ============

export const clientBranding = pgTable("client_branding", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id").notNull().references(() => clients.id, { onDelete: "cascade" }),
    fileType: text("file_type").notNull(),
    name: text("name").notNull(), // Название (Основной логотип, Альтернативный и т.д.)
    fileName: text("file_name").notNull(),
    filePath: text("file_path").notNull(),
    fileSize: integer("file_size"),
    mimeType: text("mime_type"),
    description: text("description"),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    clientIdx: index("client_branding_client_idx").on(table.clientId),
    typeIdx: index("client_branding_type_idx").on(table.fileType),
    sortIdx: index("client_branding_sort_idx").on(table.sortOrder),
    createdAtIdx: index("client_branding_created_at_idx").on(table.createdAt),
}));

// ============ RELATIONS ============

export const clientBrandingRelations = relations(clientBranding, ({ one }) => ({
    client: one(clients, {
        fields: [clientBranding.clientId],
        references: [clients.id],
    }),
}));

// ============ TYPES ============

export type ClientBranding = typeof clientBranding.$inferSelect;
export type NewClientBranding = typeof clientBranding.$inferInsert;
