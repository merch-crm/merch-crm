import { pgTable, uuid, integer, text, timestamp, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clients } from "./main";
import { orders } from "../orders";

export const customerFeedback = pgTable("customer_feedback", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
    
    // NPS SCORE (1-10)
    score: integer("score").notNull(),
    
    // Качественный отзыв
    comment: text("comment"),
    
    // Токен для анонимного/безопасного доступа к форме (если нужно)
    token: uuid("token").defaultRandom().notNull().unique(),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
    clientIdx: index("customer_feedback_client_idx").on(table.clientId),
    orderIdx: index("customer_feedback_order_idx").on(table.orderId),
    scoreIdx: index("customer_feedback_score_idx").on(table.score),
    tokenIdx: index("customer_feedback_token_idx").on(table.token),
    createdIdx: index("customer_feedback_created_idx").on(table.createdAt),
}));

export const customerFeedbackRelations = relations(customerFeedback, ({ one }) => ({
    client: one(clients, {
        fields: [customerFeedback.clientId],
        references: [clients.id],
    }),
    order: one(orders, {
        fields: [customerFeedback.orderId],
        references: [orders.id],
    }),
}));

export type CustomerFeedback = typeof customerFeedback.$inferSelect;
export type NewCustomerFeedback = typeof customerFeedback.$inferInsert;
