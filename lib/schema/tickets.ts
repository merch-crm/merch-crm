import { pgTable, text, timestamp, uuid, varchar, index, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { orders, orderItems } from "./orders";

export const ticketStatusEnum = pgEnum("ticket_status", [
    "open",
    "in_progress",
    "resolved",
    "closed"
]);

export const ticketPriorityEnum = pgEnum("ticket_priority", [
    "low",
    "normal",
    "high",
    "critical"
]);

export const ticketCategoryEnum = pgEnum("ticket_category", [
    "equipment",  // Проблемы с оборудованием
    "materials",  // Нехватка или брак материалов
    "design",     // Ошибки в макете
    "other"       // Прочее
]);

export const tickets = pgTable("tickets", {
    id: uuid("id").defaultRandom().primaryKey(),
    
    // Номер тикета
    number: varchar("number", { length: 50 }).notNull().unique(),
    
    // Кто создал
    createdById: uuid("created_by_id").references(() => users.id).notNull(),
    
    // Суть проблемы
    title: text("title").notNull(),
    description: text("description"),
    
    // Категория, статус, приоритет
    category: ticketCategoryEnum("category").default("other").notNull(),
    status: ticketStatusEnum("status").default("open").notNull(),
    priority: ticketPriorityEnum("priority").default("normal").notNull(),
    
    // Привязка к заказу (опционально)
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    orderItemId: uuid("order_item_id").references(() => orderItems.id, { onDelete: "set null" }),
    
    // Ответственный (мастер или админ)
    assigneeId: uuid("assignee_id").references(() => users.id),
    
    // Решение
    resolution: text("resolution"),
    resolvedAt: timestamp("resolved_at"),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    createdByIdx: index("tickets_created_by_idx").on(table.createdById),
    statusIdx: index("tickets_status_idx").on(table.status),
    priorityIdx: index("tickets_priority_idx").on(table.priority),
    orderIdx: index("tickets_order_idx").on(table.orderId),
    createdAtIdx: index("tickets_created_at_idx").on(table.createdAt),
}));

export const ticketsRelations = relations(tickets, ({ one }) => ({
    creator: one(users, {
        fields: [tickets.createdById],
        references: [users.id],
        relationName: "ticket_creator",
    }),
    assignee: one(users, {
        fields: [tickets.assigneeId],
        references: [users.id],
        relationName: "ticket_assignee",
    }),
    order: one(orders, {
        fields: [tickets.orderId],
        references: [orders.id],
    }),
}));

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
