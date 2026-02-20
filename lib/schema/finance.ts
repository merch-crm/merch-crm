import { pgTable, text, timestamp, uuid, boolean, index, decimal, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { paymentMethodEnum, expenseCategoryEnum } from "./enums";
import { orders } from "./orders";
import { users } from "./users";

export const payments = pgTable("payments", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    method: paymentMethodEnum("method").notNull(),
    isAdvance: boolean("is_advance").default(false).notNull(),
    comment: text("comment"),
    status: text("status").notNull().default("completed"), // 'completed', 'pending', 'cancelled'
    referenceNumber: text("reference_number"),
    notes: text("notes"),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        orderIdx: index("payments_order_idx").on(table.orderId),
        statusIdx: index("payments_status_idx").on(table.status),
        createdIdx: index("payments_created_idx").on(table.createdAt),
    }
});

export const paymentsRelations = relations(payments, ({ one }) => ({
    order: one(orders, {
        fields: [payments.orderId],
        references: [orders.id],
    }),
    creator: one(users, {
        fields: [payments.createdBy],
        references: [users.id],
    }),
}));

export const expenses = pgTable("expenses", {
    id: uuid("id").defaultRandom().primaryKey(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    category: expenseCategoryEnum("category").notNull(),
    description: text("description"),
    date: date("date").notNull(),
    createdBy: uuid("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        createdByIdx: index("expenses_created_by_idx").on(table.createdBy),
        dateIdx: index("expenses_date_idx").on(table.date),
        categoryIdx: index("expenses_category_idx").on(table.category),
        createdIdx: index("expenses_created_idx").on(table.createdAt),
    }
});

export const expensesRelations = relations(expenses, ({ one }) => ({
    creator: one(users, {
        fields: [expenses.createdBy],
        references: [users.id],
    }),
}));
