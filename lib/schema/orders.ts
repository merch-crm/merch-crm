import { pgTable, text, timestamp, uuid, boolean, index, decimal, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { orderStatusEnum, paymentStatusEnum, deliveryStatusEnum, orderCategoryEnum, productionStageStatusEnum } from "./enums";
import { clients } from "./clients";
import { users } from "./users";
import { promocodes } from "./promocodes";
import { inventoryItems } from "./warehouse";
import { payments } from "./finance";
import { tasks } from "./tasks";

export const orders = pgTable("orders", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id").references(() => clients.id),
    status: orderStatusEnum("status").default("new").notNull(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
    paidAmount: decimal("paid_amount", { precision: 10, scale: 2 }).default("0"),
    paymentStatus: paymentStatusEnum("payment_status").default("unpaid").notNull(),
    deliveryStatus: deliveryStatusEnum("delivery_status").default("not_started").notNull(),
    shippingAddress: text("shipping_address"),
    deliveryMethod: text("delivery_method"),
    deliveryTrackingNumber: text("delivery_tracking_number"),
    estimatedDeliveryDate: timestamp("estimated_delivery_date"),
    actualDeliveryDate: timestamp("actual_delivery_date"),
    comments: text("comments"),
    managerId: uuid("manager_id").references(() => users.id),
    createdBy: uuid("created_by").references(() => users.id),
    source: text("source"),
    deadline: timestamp("deadline"),
    priority: text("priority").default("normal").notNull(),
    discountAmount: decimal("discount_amount", { precision: 10, scale: 2 }).default("0"),
    promocodeId: uuid("promocode_id").references(() => promocodes.id),
    externalOrderNumber: text("external_order_number"),
    orderNumber: text("order_number").unique(),
    isUrgent: boolean("is_urgent").default(false).notNull(),
    cancelReason: text("cancel_reason"),
    category: orderCategoryEnum("category").default("other").notNull(),
    isArchived: boolean("is_archived").default(false).notNull(),
    archivedAt: timestamp("archived_at"),
    archivedBy: uuid("archived_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        clientIdx: index("orders_client_idx").on(table.clientId),
        statusIdx: index("orders_status_idx").on(table.status),
        managerIdx: index("orders_manager_idx").on(table.managerId),
        createdByIdx: index("orders_created_by_idx").on(table.createdBy),
        createdIdx: index("orders_created_idx").on(table.createdAt),
        deadlineIdx: index("orders_deadline_idx").on(table.deadline),
        dateIdx: index("orders_date_idx").on(table.createdAt),
        statusDateIdx: index("orders_status_date_idx").on(table.status, table.createdAt),
    }
});

export const ordersRelations = relations(orders, ({ one, many }) => ({
    client: one(clients, {
        fields: [orders.clientId],
        references: [clients.id],
    }),
    manager: one(users, {
        fields: [orders.managerId],
        references: [users.id],
        relationName: "order_manager",
    }),
    creator: one(users, {
        fields: [orders.createdBy],
        references: [users.id],
        relationName: "order_creator",
    }),
    archivedBy: one(users, {
        fields: [orders.archivedBy],
        references: [users.id],
        relationName: "order_archiver",
    }),
    promocode: one(promocodes, {
        fields: [orders.promocodeId],
        references: [promocodes.id],
    }),
    items: many(orderItems),
    attachments: many(orderAttachments),
    payments: many(payments),
    tasks: many(tasks),
}));

export const orderItems = pgTable("order_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }),
    inventoryId: uuid("inventory_id").references(() => inventoryItems.id),
    description: text("description"),
    quantity: integer("quantity").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    itemDetails: text("item_details"),
    stagePrepStatus: productionStageStatusEnum("stage_prep_status").default("pending").notNull(),
    stagePrintStatus: productionStageStatusEnum("stage_print_status").default("pending").notNull(),
    stageApplicationStatus: productionStageStatusEnum("stage_application_status").default("pending").notNull(),
    stagePackagingStatus: productionStageStatusEnum("stage_packaging_status").default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        orderIdx: index("order_items_order_idx").on(table.orderId),
        inventoryIdx: index("order_items_inventory_idx").on(table.inventoryId),
        createdIdx: index("order_items_created_idx").on(table.createdAt),
    }
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
    order: one(orders, {
        fields: [orderItems.orderId],
        references: [orders.id],
    }),
    inventory: one(inventoryItems, {
        fields: [orderItems.inventoryId],
        references: [inventoryItems.id],
    }),
}));

export const orderAttachments = pgTable("order_attachments", {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").references(() => orders.id, { onDelete: "cascade" }).notNull(),
    fileName: text("file_name").notNull(),
    fileKey: text("file_key").notNull(),
    fileUrl: text("file_url").notNull(),
    fileSize: integer("file_size"),
    contentType: text("content_type"),
    createdBy: uuid("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        orderIdx: index("order_attachments_order_idx").on(table.orderId),
        createdByIdx: index("order_attachments_created_by_idx").on(table.createdBy),
        createdIdx: index("order_attachments_created_idx").on(table.createdAt),
    }
});

export const orderAttachmentsRelations = relations(orderAttachments, ({ one }) => ({
    order: one(orders, {
        fields: [orderAttachments.orderId],
        references: [orders.id],
    }),
    creator: one(users, {
        fields: [orderAttachments.createdBy],
        references: [users.id],
    }),
}));
