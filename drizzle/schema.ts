import { pgTable, index, foreignKey, uuid, text, integer, timestamp, boolean, unique, jsonb, numeric, date, varchar, uniqueIndex, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const cameraStatus = pgEnum("camera_status", ['online', 'offline', 'error', 'connecting'])
export const clientType = pgEnum("client_type", ['b2c', 'b2b'])
export const deliveryStatus = pgEnum("delivery_status", ['not_started', 'shipped', 'delivered', 'cancelled'])
export const expenseCategory = pgEnum("expense_category", ['rent', 'salary', 'purchase', 'tax', 'other'])
export const inventoryItemType = pgEnum("inventory_item_type", ['clothing', 'packaging', 'consumables'])
export const measurementUnitV2 = pgEnum("measurement_unit_v2", ['шт.', 'л', 'м', 'кг'])
export const notificationType = pgEnum("notification_type", ['info', 'warning', 'success', 'error', 'transfer'])
export const orderCategory = pgEnum("order_category", ['print', 'embroidery', 'merch', 'other'])
export const orderStatus = pgEnum("order_status", ['new', 'design', 'production', 'done', 'shipped', 'cancelled'])
export const paymentMethod = pgEnum("payment_method", ['cash', 'bank', 'online', 'account'])
export const paymentStatus = pgEnum("payment_status", ['unpaid', 'partial', 'paid', 'refunded'])
export const presenceEventType = pgEnum("presence_event_type", ['detected', 'lost', 'recognized', 'unknown'])
export const printFileType = pgEnum("print_file_type", ['preview', 'source'])
export const productLineType = pgEnum("product_line_type", ['base', 'finished'])
export const productionStageStatus = pgEnum("production_stage_status", ['pending', 'in_progress', 'done', 'failed'])
export const securityEventType = pgEnum("security_event_type", ['login_success', 'login_failed', 'logout', 'password_change', 'email_change', 'profile_update', 'role_change', 'permission_change', 'data_export', 'record_delete', 'settings_change', 'maintenance_mode_toggle', 'system_error', 'admin_impersonation_start', 'admin_impersonation_stop'])
export const sessionType = pgEnum("session_type", ['work', 'break', 'idle'])
export const storageLocationType = pgEnum("storage_location_type", ['warehouse', 'production', 'office'])
export const taskPriority = pgEnum("task_priority", ['low', 'normal', 'high'])
export const taskStatus = pgEnum("task_status", ['new', 'in_progress', 'review', 'done', 'archived'])
export const taskType = pgEnum("task_type", ['design', 'production', 'acquisition', 'delivery', 'other'])
export const transactionType = pgEnum("transaction_type", ['in', 'out', 'transfer', 'attribute_change', 'archive', 'restore', 'stock_in', 'stock_out', 'adjustment'])


export const orderAttachments = pgTable("order_attachments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	fileName: text("file_name").notNull(),
	fileKey: text("file_key").notNull(),
	fileUrl: text("file_url").notNull(),
	fileSize: integer("file_size"),
	contentType: text("content_type"),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("order_attachments_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("order_attachments_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("order_attachments_order_idx").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [orders.id],
		name: "order_attachments_order_id_orders_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "order_attachments_created_by_users_id_fk"
	}),
]);

export const tasks = pgTable("tasks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: taskStatus().default('new').notNull(),
	priority: taskPriority().default('normal').notNull(),
	taskType: taskType("task_type").default('other').notNull(),
	assignedToUserId: uuid("assigned_to_user_id"),
	assignedToRoleId: uuid("assigned_to_role_id"),
	assignedToDepartmentId: uuid("assigned_to_department_id"),
	createdBy: uuid("created_by").notNull(),
	orderId: uuid("order_id"),
	dueDate: timestamp("due_date", { mode: 'string' }),
	deadline: timestamp({ mode: 'string' }),
	completedAt: timestamp("completed_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("tasks_assigned_dept_idx").using("btree", table.assignedToDepartmentId.asc().nullsLast().op("uuid_ops")),
	index("tasks_assigned_role_idx").using("btree", table.assignedToRoleId.asc().nullsLast().op("uuid_ops")),
	index("tasks_assigned_user_idx").using("btree", table.assignedToUserId.asc().nullsLast().op("uuid_ops")),
	index("tasks_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("tasks_order_id_idx").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("tasks_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.assignedToDepartmentId],
		foreignColumns: [departments.id],
		name: "tasks_assigned_to_department_id_departments_id_fk"
	}),
	foreignKey({
		columns: [table.assignedToUserId],
		foreignColumns: [users.id],
		name: "tasks_assigned_to_user_id_users_id_fk"
	}),
	foreignKey({
		columns: [table.assignedToRoleId],
		foreignColumns: [roles.id],
		name: "tasks_assigned_to_role_id_roles_id_fk"
	}),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "tasks_created_by_users_id_fk"
	}),
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [orders.id],
		name: "tasks_order_id_orders_id_fk"
	}),
]);

export const notifications = pgTable("notifications", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	title: text().notNull(),
	message: text().notNull(),
	type: notificationType().default('info').notNull(),
	priority: text().default('normal').notNull(),
	isRead: boolean("is_read").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("notifications_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("notifications_read_idx").using("btree", table.isRead.asc().nullsLast().op("bool_ops")),
	index("notifications_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "notifications_user_id_users_id_fk"
	}),
]);

export const departments = pgTable("departments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	color: text().default('indigo'),
	isActive: boolean("is_active").default(true).notNull(),
	isSystem: boolean("is_system").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("departments_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	unique("departments_name_unique").on(table.name),
]);

export const systemSettings = pgTable("system_settings", {
	key: text().primaryKey().notNull(),
	value: jsonb().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("system_settings_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
]);

export const inventoryAttributes = pgTable("inventory_attributes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	type: text().notNull(),
	name: text().notNull(),
	value: text().notNull(),
	meta: jsonb(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	categoryId: uuid("category_id"),
}, (table) => [
	index("inv_attr_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_attr_type_idx").using("btree", table.type.asc().nullsLast().op("text_ops")),
	index("inv_attr_value_idx").using("btree", table.value.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [inventoryCategories.id],
		name: "inventory_attributes_category_id_fkey"
	}).onDelete("cascade"),
]);

export const orders = pgTable("orders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderNumber: text("order_number"),
	clientId: uuid("client_id"),
	status: orderStatus().default('new').notNull(),
	category: orderCategory().default('other').notNull(),
	totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).default('0').notNull(),
	paidAmount: numeric("paid_amount", { precision: 10, scale: 2 }).default('0'),
	priority: text().default('normal').notNull(),
	isUrgent: boolean("is_urgent").default(false).notNull(),
	deadline: timestamp({ mode: 'string' }),
	promocodeId: uuid("promocode_id"),
	createdBy: uuid("created_by"),
	isArchived: boolean("is_archived").default(false).notNull(),
	cancelReason: text("cancel_reason"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	discountAmount: numeric("discount_amount", { precision: 10, scale: 2 }).default('0'),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	paymentStatus: paymentStatus("payment_status").default('unpaid').notNull(),
	deliveryStatus: deliveryStatus("delivery_status").default('not_started').notNull(),
	shippingAddress: text("shipping_address"),
	deliveryMethod: text("delivery_method"),
	deliveryTrackingNumber: text("delivery_tracking_number"),
	estimatedDeliveryDate: timestamp("estimated_delivery_date", { mode: 'string' }),
	actualDeliveryDate: timestamp("actual_delivery_date", { mode: 'string' }),
	comments: text(),
	managerId: uuid("manager_id"),
	source: text(),
	externalOrderNumber: text("external_order_number"),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	archivedBy: uuid("archived_by"),
}, (table) => [
	index("orders_client_idx").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("orders_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("orders_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("orders_date_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("orders_deadline_idx").using("btree", table.deadline.asc().nullsLast().op("timestamp_ops")),
	index("orders_manager_idx").using("btree", table.managerId.asc().nullsLast().op("uuid_ops")),
	index("orders_status_date_idx").using("btree", table.status.asc().nullsLast().op("timestamp_ops"), table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("orders_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.clientId],
		foreignColumns: [clients.id],
		name: "orders_client_id_clients_id_fk"
	}),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "orders_created_by_users_id_fk"
	}),
	foreignKey({
		columns: [table.promocodeId],
		foreignColumns: [promocodes.id],
		name: "orders_promocode_id_promocodes_id_fk"
	}),
	foreignKey({
		columns: [table.managerId],
		foreignColumns: [users.id],
		name: "orders_manager_id_users_id_fk"
	}),
	foreignKey({
		columns: [table.archivedBy],
		foreignColumns: [users.id],
		name: "orders_archived_by_users_id_fk"
	}),
	unique("orders_order_number_unique").on(table.orderNumber),
]);

export const loyaltyLevels = pgTable("loyalty_levels", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	levelKey: text("level_key").notNull(),
	levelName: text("level_name").notNull(),
	minOrdersAmount: numeric("min_orders_amount", { precision: 12, scale: 2 }).default('0'),
	minOrdersCount: integer("min_orders_count").default(0),
	discountPercent: numeric("discount_percent", { precision: 5, scale: 2 }).default('0'),
	bonusDescription: text("bonus_description"),
	color: text().default('#64748b'),
	icon: text().default('star'),
	priority: integer().default(0),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_loyalty_levels_active").using("btree", table.isActive.asc().nullsLast().op("bool_ops")).where(sql`(is_active = true)`),
	index("idx_loyalty_levels_priority").using("btree", table.priority.desc().nullsFirst().op("int4_ops")),
	unique("loyalty_levels_level_key_key").on(table.levelKey),
	unique("loyalty_levels_level_key_unique").on(table.levelKey),
]);

export const orderItems = pgTable("order_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id"),
	description: text(),
	quantity: integer().notNull(),
	price: numeric({ precision: 10, scale: 2 }).notNull(),
	inventoryId: uuid("inventory_id"),
	stagePrepStatus: productionStageStatus("stage_prep_status").default('pending').notNull(),
	stagePrintStatus: productionStageStatus("stage_print_status").default('pending').notNull(),
	stageApplicationStatus: productionStageStatus("stage_application_status").default('pending').notNull(),
	stagePackagingStatus: productionStageStatus("stage_packaging_status").default('pending').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	itemDetails: text("item_details"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("order_items_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("order_items_inventory_idx").using("btree", table.inventoryId.asc().nullsLast().op("uuid_ops")),
	index("order_items_order_idx").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [orders.id],
		name: "order_items_order_id_orders_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.inventoryId],
		foreignColumns: [inventoryItems.id],
		name: "order_items_inventory_id_inventory_items_id_fk"
	}),
]);

export const clients = pgTable("clients", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientType: clientType("client_type").default('b2c').notNull(),
	lastName: text("last_name").notNull(),
	firstName: text("first_name").notNull(),
	patronymic: text(),
	name: text(),
	company: text(),
	phone: text().notNull(),
	telegram: text(),
	instagram: text(),
	email: text(),
	city: text(),
	address: text(),
	comments: text(),
	socialLink: text("social_link"),
	acquisitionSource: text("acquisition_source"),
	managerId: uuid("manager_id"),
	isArchived: boolean("is_archived").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	loyaltyLevelId: uuid("loyalty_level_id"),
	loyaltyLevelSetManually: boolean("loyalty_level_set_manually").default(false),
	loyaltyLevelChangedAt: timestamp("loyalty_level_changed_at", { withTimezone: true, mode: 'string' }),
	totalOrdersCount: integer("total_orders_count").default(0),
	totalOrdersAmount: numeric("total_orders_amount", { precision: 12, scale: 2 }).default('0'),
	averageCheck: numeric("average_check", { precision: 12, scale: 2 }).default('0'),
	lastOrderAt: timestamp("last_order_at", { withTimezone: true, mode: 'string' }),
	firstOrderAt: timestamp("first_order_at", { withTimezone: true, mode: 'string' }),
	daysSinceLastOrder: integer("days_since_last_order"),
	rfmRecency: integer("rfm_recency"),
	rfmFrequency: integer("rfm_frequency"),
	rfmMonetary: integer("rfm_monetary"),
	rfmScore: text("rfm_score"),
	rfmSegment: text("rfm_segment"),
	rfmCalculatedAt: timestamp("rfm_calculated_at", { withTimezone: true, mode: 'string' }),
	funnelStage: text("funnel_stage").default('lead'),
	funnelStageChangedAt: timestamp("funnel_stage_changed_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	lostAt: timestamp("lost_at", { withTimezone: true, mode: 'string' }),
	lostReason: text("lost_reason"),
}, (table) => [
	index("clients_archived_idx").using("btree", table.isArchived.asc().nullsLast().op("bool_ops")),
	index("clients_company_idx").using("btree", table.company.asc().nullsLast().op("text_ops")),
	index("clients_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("clients_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("clients_manager_idx").using("btree", table.managerId.asc().nullsLast().op("uuid_ops")),
	index("clients_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("clients_search_idx").using("btree", table.lastName.asc().nullsLast().op("text_ops"), table.firstName.asc().nullsLast().op("text_ops"), table.phone.asc().nullsLast().op("text_ops")),
	index("idx_clients_days_since_last_order").using("btree", table.daysSinceLastOrder.asc().nullsLast().op("int4_ops")).where(sql`(days_since_last_order IS NOT NULL)`),
	index("idx_clients_funnel_stage").using("btree", table.funnelStage.asc().nullsLast().op("text_ops")),
	index("idx_clients_last_order_at").using("btree", table.lastOrderAt.asc().nullsLast().op("timestamptz_ops")),
	index("idx_clients_loyalty_level").using("btree", table.loyaltyLevelId.asc().nullsLast().op("uuid_ops")),
	index("idx_clients_rfm_score").using("btree", table.rfmScore.asc().nullsLast().op("text_ops")),
	index("idx_clients_rfm_segment").using("btree", table.rfmSegment.asc().nullsLast().op("text_ops")),
	index("idx_clients_total_orders_amount").using("btree", table.totalOrdersAmount.asc().nullsLast().op("numeric_ops")),
	index("idx_clients_total_orders_count").using("btree", table.totalOrdersCount.asc().nullsLast().op("int4_ops")),
	foreignKey({
		columns: [table.managerId],
		foreignColumns: [users.id],
		name: "clients_manager_id_users_id_fk"
	}),
	foreignKey({
		columns: [table.loyaltyLevelId],
		foreignColumns: [loyaltyLevels.id],
		name: "clients_loyalty_level_id_fkey"
	}),
]);

export const roles = pgTable("roles", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	permissions: jsonb().default({}).notNull(),
	isSystem: boolean("is_system").default(false).notNull(),
	departmentId: uuid("department_id"),
	color: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("roles_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("roles_department_idx").using("btree", table.departmentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.departmentId],
		foreignColumns: [departments.id],
		name: "roles_department_id_departments_id_fk"
	}),
	unique("roles_name_unique").on(table.name),
]);

export const inventoryStocks = pgTable("inventory_stocks", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	itemId: uuid("item_id").notNull(),
	storageLocationId: uuid("storage_location_id").notNull(),
	quantity: integer().default(0).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inv_stocks_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_stocks_item_idx").using("btree", table.itemId.asc().nullsLast().op("uuid_ops")),
	index("inv_stocks_item_storage_idx").using("btree", table.itemId.asc().nullsLast().op("uuid_ops"), table.storageLocationId.asc().nullsLast().op("uuid_ops")),
	index("inv_stocks_qty_positive_idx").using("btree", table.quantity.asc().nullsLast().op("int4_ops")).where(sql`(quantity > 0)`),
	index("inv_stocks_storage_idx").using("btree", table.storageLocationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [inventoryItems.id],
		name: "inventory_stocks_item_id_inventory_items_id_fk"
	}),
	foreignKey({
		columns: [table.storageLocationId],
		foreignColumns: [storageLocations.id],
		name: "inventory_stocks_storage_location_id_storage_locations_id_fk"
	}),
]);

export const productLines = pgTable("product_lines", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	slug: text(),
	type: productLineType().notNull(),
	categoryId: uuid("category_id").notNull(),
	printCollectionId: uuid("print_collection_id"),
	commonAttributes: jsonb("common_attributes").default({}),
	description: text(),
	image: text(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	baseLineId: uuid("base_line_id"),
}, (table) => [
	index("product_lines_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("product_lines_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("product_lines_category_type_idx").using("btree", table.categoryId.asc().nullsLast().op("enum_ops"), table.type.asc().nullsLast().op("uuid_ops")),
	index("product_lines_collection_idx").using("btree", table.printCollectionId.asc().nullsLast().op("uuid_ops")),
	index("product_lines_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("product_lines_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [inventoryCategories.id],
		name: "product_lines_category_id_inventory_categories_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.printCollectionId],
		foreignColumns: [printCollections.id],
		name: "product_lines_print_collection_id_print_collections_id_fk"
	}).onDelete("restrict"),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "product_lines_created_by_users_id_fk"
	}),
]);

export const inventoryTransfers = pgTable("inventory_transfers", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	itemId: uuid("item_id").notNull(),
	fromLocationId: uuid("from_location_id"),
	toLocationId: uuid("to_location_id"),
	quantity: integer().notNull(),
	comment: text(),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inv_transfers_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("inv_transfers_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_transfers_from_idx").using("btree", table.fromLocationId.asc().nullsLast().op("uuid_ops")),
	index("inv_transfers_item_idx").using("btree", table.itemId.asc().nullsLast().op("uuid_ops")),
	index("inv_transfers_to_idx").using("btree", table.toLocationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.itemId],
		foreignColumns: [inventoryItems.id],
		name: "inventory_transfers_item_id_inventory_items_id_fk"
	}),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "inventory_transfers_created_by_users_id_fk"
	}),
	foreignKey({
		columns: [table.fromLocationId],
		foreignColumns: [storageLocations.id],
		name: "inventory_transfers_from_location_id_storage_locations_id_fk"
	}),
	foreignKey({
		columns: [table.toLocationId],
		foreignColumns: [storageLocations.id],
		name: "inventory_transfers_to_location_id_storage_locations_id_fk"
	}),
]);

export const clientConversations = pgTable("client_conversations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clientId: uuid("client_id").notNull(),
	channelId: uuid("channel_id"),
	channelType: text("channel_type").notNull(),
	externalChatId: text("external_chat_id"),
	status: text().default('active'),
	unreadCount: integer("unread_count").default(0),
	lastMessageAt: timestamp("last_message_at", { withTimezone: true, mode: 'string' }),
	lastMessagePreview: text("last_message_preview"),
	assignedManagerId: uuid("assigned_manager_id"),
	metadata: jsonb().default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_conversations_assigned_manager").using("btree", table.assignedManagerId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_channel_type").using("btree", table.channelType.asc().nullsLast().op("text_ops")),
	index("idx_conversations_client_id").using("btree", table.clientId.asc().nullsLast().op("uuid_ops")),
	index("idx_conversations_last_message").using("btree", table.lastMessageAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_conversations_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.clientId],
		foreignColumns: [clients.id],
		name: "client_conversations_client_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.channelId],
		foreignColumns: [communicationChannels.id],
		name: "client_conversations_channel_id_fkey"
	}),
	foreignKey({
		columns: [table.assignedManagerId],
		foreignColumns: [users.id],
		name: "client_conversations_assigned_manager_id_fkey"
	}),
]);

export const communicationChannels = pgTable("communication_channels", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	channelType: text("channel_type").notNull(),
	icon: text(),
	color: text(),
	isActive: boolean("is_active").default(true),
	config: jsonb().default({}),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
});

export const taskChecklists = pgTable("task_checklists", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	taskId: uuid("task_id").notNull(),
	content: text().notNull(),
	isCompleted: boolean("is_completed").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("task_checklists_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("task_checklists_task_idx").using("btree", table.taskId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.taskId],
		foreignColumns: [tasks.id],
		name: "task_checklists_task_id_tasks_id_fk"
	}).onDelete("cascade"),
]);

export const taskHistory = pgTable("task_history", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	taskId: uuid("task_id").notNull(),
	userId: uuid("user_id").notNull(),
	type: text().notNull(),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("task_history_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("task_history_task_idx").using("btree", table.taskId.asc().nullsLast().op("uuid_ops")),
	index("task_history_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.taskId],
		foreignColumns: [tasks.id],
		name: "task_history_task_id_tasks_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "task_history_user_id_users_id_fk"
	}),
]);

export const taskComments = pgTable("task_comments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	taskId: uuid("task_id").notNull(),
	userId: uuid("user_id").notNull(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("task_comments_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("task_comments_task_idx").using("btree", table.taskId.asc().nullsLast().op("uuid_ops")),
	index("task_comments_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.taskId],
		foreignColumns: [tasks.id],
		name: "task_comments_task_id_tasks_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "task_comments_user_id_users_id_fk"
	}),
]);

export const taskAttachments = pgTable("task_attachments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	taskId: uuid("task_id").notNull(),
	fileName: text("file_name").notNull(),
	fileKey: text("file_key").notNull(),
	fileUrl: text("file_url").notNull(),
	fileSize: integer("file_size"),
	contentType: text("content_type"),
	createdBy: uuid("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("task_attachments_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("task_attachments_task_idx").using("btree", table.taskId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.taskId],
		foreignColumns: [tasks.id],
		name: "task_attachments_task_id_tasks_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "task_attachments_created_by_users_id_fk"
	}),
]);

export const expenses = pgTable("expenses", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	amount: numeric({ precision: 10, scale: 2 }).notNull(),
	category: expenseCategory().notNull(),
	description: text(),
	date: date().notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("expenses_category_idx").using("btree", table.category.asc().nullsLast().op("enum_ops")),
	index("expenses_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("expenses_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("expenses_date_idx").using("btree", table.date.asc().nullsLast().op("date_ops")),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "expenses_created_by_users_id_fk"
	}),
]);

export const conversationMessages = pgTable("conversation_messages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	conversationId: uuid("conversation_id").notNull(),
	direction: text().notNull(),
	messageType: text("message_type").default('text'),
	content: text(),
	mediaUrl: text("media_url"),
	mediaType: text("media_type"),
	externalMessageId: text("external_message_id"),
	status: text().default('sent'),
	sentById: uuid("sent_by_id"),
	sentAt: timestamp("sent_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	deliveredAt: timestamp("delivered_at", { withTimezone: true, mode: 'string' }),
	readAt: timestamp("read_at", { withTimezone: true, mode: 'string' }),
	metadata: jsonb().default({}),
}, (table) => [
	index("idx_messages_conversation_id").using("btree", table.conversationId.asc().nullsLast().op("uuid_ops")),
	index("idx_messages_direction").using("btree", table.direction.asc().nullsLast().op("text_ops")),
	index("idx_messages_sent_at").using("btree", table.sentAt.desc().nullsFirst().op("timestamptz_ops")),
	foreignKey({
		columns: [table.conversationId],
		foreignColumns: [clientConversations.id],
		name: "conversation_messages_conversation_id_fkey"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.sentById],
		foreignColumns: [users.id],
		name: "conversation_messages_sent_by_id_fkey"
	}),
]);

export const promocodes = pgTable("promocodes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text(),
	code: text().notNull(),
	discountType: text("discount_type").notNull(),
	value: numeric({ precision: 10, scale: 2 }).notNull(),
	minOrderAmount: numeric("min_order_amount", { precision: 10, scale: 2 }).default('0'),
	maxDiscountAmount: numeric("max_discount_amount", { precision: 10, scale: 2 }).default('0'),
	startDate: timestamp("start_date", { mode: 'string' }),
	expiresAt: timestamp("expires_at", { mode: 'string' }),
	usageLimit: integer("usage_limit"),
	usageCount: integer("usage_count").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	adminComment: text("admin_comment"),
	constraints: jsonb().default({}),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("promocodes_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("promocodes_code_idx").using("btree", table.code.asc().nullsLast().op("text_ops")),
	index("promocodes_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	unique("promocodes_code_unique").on(table.code),
]);

export const wikiFolders = pgTable("wiki_folders", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	parentId: uuid("parent_id"),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("wiki_folders_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("wiki_folders_parent_idx").using("btree", table.parentId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.parentId],
		foreignColumns: [table.id],
		name: "wiki_folders_parent_id_wiki_folders_id_fk"
	}),
]);

export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	roleId: uuid("role_id"),
	phone: text(),
	birthday: date(),
	avatar: text(),
	telegram: text(),
	instagram: text(),
	socialMax: text("social_max"),
	departmentId: uuid("department_id"),
	lastActiveAt: timestamp("last_active_at", { mode: 'string' }),
	isSystem: boolean("is_system").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("users_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("users_department_idx").using("btree", table.departmentId.asc().nullsLast().op("uuid_ops")),
	index("users_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("users_phone_idx").using("btree", table.phone.asc().nullsLast().op("text_ops")),
	index("users_role_idx").using("btree", table.roleId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.roleId],
		foreignColumns: [roles.id],
		name: "users_role_id_roles_id_fk"
	}),
	foreignKey({
		columns: [table.departmentId],
		foreignColumns: [departments.id],
		name: "users_department_id_departments_id_fk"
	}),
	unique("users_email_unique").on(table.email),
]);

export const payments = pgTable("payments", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	orderId: uuid("order_id").notNull(),
	amount: numeric({ precision: 10, scale: 2 }).notNull(),
	method: paymentMethod().notNull(),
	isAdvance: boolean("is_advance").default(false).notNull(),
	comment: text(),
	status: text().default('completed').notNull(),
	referenceNumber: text("reference_number"),
	notes: text(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("payments_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("payments_order_idx").using("btree", table.orderId.asc().nullsLast().op("uuid_ops")),
	index("payments_status_idx").using("btree", table.status.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.orderId],
		foreignColumns: [orders.id],
		name: "payments_order_id_orders_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "payments_created_by_users_id_fk"
	}),
]);

export const messageTemplates = pgTable("message_templates", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	title: text().notNull(),
	content: text().notNull(),
	category: text(),
	shortcut: text(),
	usageCount: integer("usage_count").default(0),
	isActive: boolean("is_active").default(true),
	createdById: uuid("created_by_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'string' }).defaultNow(),
}, (table) => [
	index("idx_templates_category").using("btree", table.category.asc().nullsLast().op("text_ops")),
	index("idx_templates_shortcut").using("btree", table.shortcut.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.createdById],
		foreignColumns: [users.id],
		name: "message_templates_created_by_id_fkey"
	}),
]);

export const wikiPages = pgTable("wiki_pages", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	folderId: uuid("folder_id"),
	title: text().notNull(),
	content: text(),
	createdBy: uuid("created_by"),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("wiki_pages_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("wiki_pages_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("wiki_pages_folder_idx").using("btree", table.folderId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.folderId],
		foreignColumns: [wikiFolders.id],
		name: "wiki_pages_folder_id_wiki_folders_id_fk"
	}),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "wiki_pages_created_by_users_id_fk"
	}),
]);

export const dailyWorkStats = pgTable("daily_work_stats", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	date: timestamp({ mode: 'string' }).notNull(),
	firstSeenAt: timestamp("first_seen_at", { mode: 'string' }),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }),
	workSeconds: integer("work_seconds").default(0).notNull(),
	idleSeconds: integer("idle_seconds").default(0).notNull(),
	breakSeconds: integer("break_seconds").default(0).notNull(),
	productivity: numeric({ precision: 5, scale: 2 }),
	totalSessions: integer("total_sessions").default(0).notNull(),
	lateArrivalMinutes: integer("late_arrival_minutes").default(0),
	earlyDepartureMinutes: integer("early_departure_minutes").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("daily_work_stats_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("daily_work_stats_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("daily_work_stats_user_date_idx").using("btree", table.userId.asc().nullsLast().op("timestamp_ops"), table.date.asc().nullsLast().op("uuid_ops")),
	index("daily_work_stats_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "daily_work_stats_user_id_users_id_fk"
	}).onDelete("cascade"),
]);

export const cameras = pgTable("cameras", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	xiaomiAccountId: uuid("xiaomi_account_id"),
	deviceId: varchar("device_id", { length: 100 }).notNull(),
	model: varchar({ length: 100 }),
	name: varchar({ length: 255 }).notNull(),
	localName: varchar("local_name", { length: 255 }),
	location: varchar({ length: 255 }),
	localIp: varchar("local_ip", { length: 45 }),
	streamUrl: text("stream_url"),
	status: cameraStatus().default('offline').notNull(),
	lastOnlineAt: timestamp("last_online_at", { mode: 'string' }),
	errorMessage: text("error_message"),
	isEnabled: boolean("is_enabled").default(true).notNull(),
	confidenceThreshold: numeric("confidence_threshold", { precision: 3, scale: 2 }).default('0.60'),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("cameras_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("cameras_device_id_idx").using("btree", table.deviceId.asc().nullsLast().op("text_ops")),
	index("cameras_is_enabled_idx").using("btree", table.isEnabled.asc().nullsLast().op("bool_ops")),
	index("cameras_status_idx").using("btree", table.status.asc().nullsLast().op("enum_ops")),
	index("cameras_xiaomi_account_id_idx").using("btree", table.xiaomiAccountId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.xiaomiAccountId],
		foreignColumns: [xiaomiAccounts.id],
		name: "cameras_xiaomi_account_id_xiaomi_accounts_id_fk"
	}).onDelete("cascade"),
]);

export const employeeFaces = pgTable("employee_faces", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	faceEncoding: jsonb("face_encoding").notNull(),
	photoUrl: text("photo_url"),
	isActive: boolean("is_active").default(true).notNull(),
	isPrimary: boolean("is_primary").default(false).notNull(),
	quality: numeric({ precision: 3, scale: 2 }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdById: uuid("created_by_id"),
}, (table) => [
	index("employee_faces_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("employee_faces_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("employee_faces_is_primary_idx").using("btree", table.isPrimary.asc().nullsLast().op("bool_ops")),
	index("employee_faces_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "employee_faces_user_id_users_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.createdById],
		foreignColumns: [users.id],
		name: "employee_faces_created_by_id_users_id_fk"
	}).onDelete("set null"),
]);

export const presenceSettings = pgTable("presence_settings", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	key: varchar({ length: 100 }).notNull(),
	value: jsonb().notNull(),
	description: text(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedById: uuid("updated_by_id"),
}, (table) => [
	index("presence_settings_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("presence_settings_key_idx").using("btree", table.key.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.updatedById],
		foreignColumns: [users.id],
		name: "presence_settings_updated_by_id_users_id_fk"
	}).onDelete("set null"),
	unique("presence_settings_key_unique").on(table.key),
]);

export const workSessions = pgTable("work_sessions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	cameraId: uuid("camera_id"),
	date: timestamp({ mode: 'string' }).notNull(),
	startTime: timestamp("start_time", { mode: 'string' }).notNull(),
	endTime: timestamp("end_time", { mode: 'string' }),
	durationSeconds: integer("duration_seconds").default(0),
	sessionType: sessionType("session_type").default('work').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("work_sessions_camera_id_idx").using("btree", table.cameraId.asc().nullsLast().op("uuid_ops")),
	index("work_sessions_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("work_sessions_date_idx").using("btree", table.date.asc().nullsLast().op("timestamp_ops")),
	index("work_sessions_session_type_idx").using("btree", table.sessionType.asc().nullsLast().op("enum_ops")),
	index("work_sessions_user_date_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops"), table.date.asc().nullsLast().op("timestamp_ops")),
	index("work_sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "work_sessions_user_id_users_id_fk"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.cameraId],
		foreignColumns: [cameras.id],
		name: "work_sessions_camera_id_cameras_id_fk"
	}).onDelete("set null"),
]);

export const workstations = pgTable("workstations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	cameraId: uuid("camera_id"),
	assignedUserId: uuid("assigned_user_id"),
	zone: jsonb(),
	color: varchar({ length: 7 }).default('#3B82F6'),
	sortOrder: integer("sort_order").default(0),
	isActive: boolean("is_active").default(true),
	requiresAssignedUser: boolean("requires_assigned_user").default(false),
	lastSeenUserId: uuid("last_seen_user_id"),
	lastSeenAt: timestamp("last_seen_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("workstations_assigned_user_id_idx").using("btree", table.assignedUserId.asc().nullsLast().op("uuid_ops")),
	index("workstations_camera_id_idx").using("btree", table.cameraId.asc().nullsLast().op("uuid_ops")),
	index("workstations_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("workstations_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	foreignKey({
		columns: [table.cameraId],
		foreignColumns: [cameras.id],
		name: "workstations_camera_id_cameras_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.assignedUserId],
		foreignColumns: [users.id],
		name: "workstations_assigned_user_id_users_id_fk"
	}).onDelete("set null"),
]);

export const xiaomiAccounts = pgTable("xiaomi_accounts", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	xiaomiUserId: varchar("xiaomi_user_id", { length: 50 }).notNull(),
	email: varchar({ length: 255 }),
	nickname: varchar({ length: 255 }),
	encryptedToken: text("encrypted_token").notNull(),
	region: varchar({ length: 10 }).default('cn').notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	lastSyncAt: timestamp("last_sync_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	createdById: uuid("created_by_id"),
}, (table) => [
	index("xiaomi_accounts_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("xiaomi_accounts_email_idx").using("btree", table.email.asc().nullsLast().op("text_ops")),
	index("xiaomi_accounts_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("xiaomi_accounts_xiaomi_user_id_idx").using("btree", table.xiaomiUserId.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.createdById],
		foreignColumns: [users.id],
		name: "xiaomi_accounts_created_by_id_users_id_fk"
	}).onDelete("set null"),
	unique("xiaomi_accounts_xiaomi_user_id_unique").on(table.xiaomiUserId),
]);

export const presenceLogs = pgTable("presence_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	cameraId: uuid("camera_id"),
	workstationId: uuid("workstation_id"),
	eventType: presenceEventType("event_type").notNull(),
	confidence: numeric({ precision: 3, scale: 2 }),
	faceEncoding: jsonb("face_encoding"),
	facePosition: jsonb("face_position"),
	snapshotUrl: text("snapshot_url"),
	timestamp: timestamp({ mode: 'string' }).defaultNow().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("presence_logs_camera_id_idx").using("btree", table.cameraId.asc().nullsLast().op("uuid_ops")),
	index("presence_logs_created_at_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("presence_logs_event_type_idx").using("btree", table.eventType.asc().nullsLast().op("enum_ops")),
	index("presence_logs_timestamp_idx").using("btree", table.timestamp.asc().nullsLast().op("timestamp_ops")),
	index("presence_logs_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	index("presence_logs_workstation_id_idx").using("btree", table.workstationId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "presence_logs_user_id_users_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.cameraId],
		foreignColumns: [cameras.id],
		name: "presence_logs_camera_id_cameras_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.workstationId],
		foreignColumns: [workstations.id],
		name: "presence_logs_workstation_id_workstations_id_fk"
	}).onDelete("set null"),
]);

export const inventoryItems = pgTable("inventory_items", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	sku: text(),
	categoryId: uuid("category_id"),
	itemType: inventoryItemType("item_type").default('clothing').notNull(),
	quantity: integer().default(0).notNull(),
	unit: measurementUnitV2().default('шт.').notNull(),
	lowStockThreshold: integer("low_stock_threshold").default(10).notNull(),
	criticalStockThreshold: integer("critical_stock_threshold").default(0).notNull(),
	description: text(),
	qualityCode: text("quality_code"),
	materialCode: text("material_code"),
	brandCode: text("brand_code"),
	attributeCode: text("attribute_code"),
	sizeCode: text("size_code"),
	attributes: jsonb().default({}),
	image: text(),
	imageBack: text("image_back"),
	imageSide: text("image_side"),
	imageDetails: jsonb("image_details").default([]),
	thumbnailSettings: jsonb("thumbnail_settings"),
	reservedQuantity: integer("reserved_quantity").default(0).notNull(),
	materialComposition: jsonb("material_composition").default({}),
	costPrice: numeric("cost_price", { precision: 10, scale: 2 }),
	isArchived: boolean("is_archived").default(false).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	archivedAt: timestamp("archived_at", { mode: 'string' }),
	archivedBy: uuid("archived_by"),
	archiveReason: text("archive_reason"),
	zeroStockSince: timestamp("zero_stock_since", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	sellingPrice: numeric("selling_price", { precision: 10, scale: 2 }),
	createdBy: uuid("created_by"),
	productLineId: uuid("product_line_id"),
	baseItemId: uuid("base_item_id"),
	printDesignId: uuid("print_design_id"),
	printVersionId: uuid("print_version_id"),
}, (table) => [
	index("inv_items_archived_idx").using("btree", table.isArchived.asc().nullsLast().op("bool_ops")),
	index("inv_items_base_item_idx").using("btree", table.baseItemId.asc().nullsLast().op("uuid_ops")),
	index("inv_items_category_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	index("inv_items_created_by_idx").using("btree", table.createdBy.asc().nullsLast().op("uuid_ops")),
	index("inv_items_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_items_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	index("inv_items_print_design_idx").using("btree", table.printDesignId.asc().nullsLast().op("uuid_ops")),
	index("inv_items_print_version_idx").using("btree", table.printVersionId.asc().nullsLast().op("uuid_ops")),
	index("inv_items_product_line_idx").using("btree", table.productLineId.asc().nullsLast().op("uuid_ops")),
	index("inv_items_sku_idx").using("btree", table.sku.asc().nullsLast().op("text_ops")),
	index("inv_items_type_idx").using("btree", table.itemType.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.archivedBy],
		foreignColumns: [users.id],
		name: "inventory_items_archived_by_users_id_fk"
	}),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [inventoryCategories.id],
		name: "inventory_items_category_id_inventory_categories_id_fk"
	}),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "inventory_items_created_by_users_id_fk"
	}),
	foreignKey({
		columns: [table.productLineId],
		foreignColumns: [productLines.id],
		name: "inventory_items_product_line_id_product_lines_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.baseItemId],
		foreignColumns: [table.id],
		name: "inventory_items_base_item_id_inventory_items_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.printDesignId],
		foreignColumns: [printDesigns.id],
		name: "inventory_items_print_design_id_print_designs_id_fk"
	}).onDelete("set null"),
	foreignKey({
		columns: [table.printVersionId],
		foreignColumns: [printDesignVersions.id],
		name: "inventory_items_print_version_id_print_design_versions_id_fk"
	}).onDelete("set null"),
	unique("inventory_items_sku_unique").on(table.sku),
]);

export const sessions = pgTable("sessions", {
	id: text().primaryKey().notNull(),
	userId: uuid("user_id").notNull(),
	userAgent: text("user_agent"),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("sessions_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("sessions_expires_idx").using("btree", table.expiresAt.asc().nullsLast().op("timestamp_ops")),
	index("sessions_user_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.userId],
		foreignColumns: [users.id],
		name: "sessions_user_id_users_id_fk"
	}).onDelete("cascade"),
]);

export const inventoryCategories = pgTable("inventory_categories", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	icon: text(),
	color: text(),
	colorMarker: text("color_marker"),
	slug: text(),
	fullPath: text("full_path"),
	prefix: text(),
	parentId: uuid("parent_id"),
	sortOrder: integer("sort_order").default(0).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	isSystem: boolean("is_system").default(false).notNull(),
	defaultUnit: measurementUnitV2("default_unit"),
	gender: text().default('masculine').notNull(),
	singularName: text("singular_name"),
	pluralName: text("plural_name"),
	showInSku: boolean("show_in_sku").default(true).notNull(),
	showInName: boolean("show_in_name").default(true).notNull(),
	level: integer().default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inv_cats_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("inv_cats_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_cats_parent_idx").using("btree", table.parentId.asc().nullsLast().op("uuid_ops")),
	index("inv_cats_path_idx").using("btree", table.fullPath.asc().nullsLast().op("text_ops")),
	index("inv_cats_slug_idx").using("btree", table.slug.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.parentId],
		foreignColumns: [table.id],
		name: "inventory_categories_parent_id_inventory_categories_id_fk"
	}).onDelete("set null"),
	unique("inventory_categories_name_unique").on(table.name),
	unique("inventory_categories_slug_unique").on(table.slug),
]);

export const storageLocations = pgTable("storage_locations", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	address: text(),
	type: storageLocationType().default('warehouse').notNull(),
	description: text(),
	responsibleUserId: uuid("responsible_user_id"),
	isSystem: boolean("is_system").default(false).notNull(),
	isDefault: boolean("is_default").default(false).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("storage_loc_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("storage_loc_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("storage_loc_responsible_idx").using("btree", table.responsibleUserId.asc().nullsLast().op("uuid_ops")),
	index("storage_loc_type_idx").using("btree", table.type.asc().nullsLast().op("enum_ops")),
	foreignKey({
		columns: [table.responsibleUserId],
		foreignColumns: [users.id],
		name: "storage_locations_responsible_user_id_users_id_fk"
	}),
]);

export const printCollections = pgTable("print_collections", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	coverImage: text("cover_image"),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdBy: uuid("created_by"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	slug: varchar({ length: 255 }),
}, (table) => [
	index("print_collections_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("print_collections_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("print_collections_name_idx").using("btree", table.name.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.createdBy],
		foreignColumns: [users.id],
		name: "print_collections_created_by_users_id_fk"
	}),
]);

export const printDesignFiles = pgTable("print_design_files", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	versionId: uuid("version_id").notNull(),
	filename: text().notNull(),
	format: text().notNull(),
	size: integer(),
	dimensions: text(),
	url: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	originalName: varchar("original_name", { length: 255 }).default('').notNull(),
	fileType: varchar("file_type", { length: 50 }).default('preview').notNull(),
	width: integer(),
	height: integer(),
	path: varchar({ length: 500 }).default('').notNull(),
}, (table) => [
	index("print_design_files_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("print_design_files_format_idx").using("btree", table.format.asc().nullsLast().op("text_ops")),
	index("print_design_files_version_idx").using("btree", table.versionId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.versionId],
		foreignColumns: [printDesignVersions.id],
		name: "print_design_files_version_id_print_design_versions_id_fk"
	}).onDelete("cascade"),
]);

export const printDesigns = pgTable("print_designs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	collectionId: uuid("collection_id").notNull(),
	name: text().notNull(),
	preview: text(),
	description: text(),
	skuCode: text("sku_code"),
	isActive: boolean("is_active").default(true).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("print_designs_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
	index("print_designs_collection_idx").using("btree", table.collectionId.asc().nullsLast().op("uuid_ops")),
	index("print_designs_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	foreignKey({
		columns: [table.collectionId],
		foreignColumns: [printCollections.id],
		name: "print_designs_collection_id_print_collections_id_fk"
	}).onDelete("cascade"),
]);

export const printDesignVersions = pgTable("print_design_versions", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	designId: uuid("design_id").notNull(),
	name: text().notNull(),
	fabricType: text("fabric_type").notNull(),
	preview: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
}, (table) => [
	index("print_design_versions_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("print_design_versions_design_idx").using("btree", table.designId.asc().nullsLast().op("uuid_ops")),
	index("print_design_versions_fabric_type_idx").using("btree", table.fabricType.asc().nullsLast().op("text_ops")),
	foreignKey({
		columns: [table.designId],
		foreignColumns: [printDesigns.id],
		name: "print_design_versions_design_id_print_designs_id_fk"
	}).onDelete("cascade"),
]);

export const inventoryItemAttributes = pgTable("inventory_item_attributes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	inventoryItemId: uuid("inventory_item_id").notNull(),
	attributeId: uuid("attribute_id").notNull(),
	value: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	index("inv_item_attr_attribute_idx").using("btree", table.attributeId.asc().nullsLast().op("uuid_ops")),
	index("inv_item_attr_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_item_attr_unique").using("btree", table.inventoryItemId.asc().nullsLast().op("uuid_ops"), table.attributeId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.inventoryItemId],
		foreignColumns: [inventoryItems.id],
		name: "inventory_item_attributes_inventory_item_id_inventory_items_id_"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.attributeId],
		foreignColumns: [inventoryAttributes.id],
		name: "inventory_item_attributes_attribute_id_inventory_attributes_id_"
	}).onDelete("restrict"),
]);

export const inventoryAttributeTypes = pgTable("inventory_attribute_types", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	slug: text().notNull(),
	name: text().notNull(),
	isSystem: boolean("is_system").default(false).notNull(),
	sortOrder: integer("sort_order").default(0).notNull(),
	categoryId: uuid("category_id"),
	showInSku: boolean("show_in_sku").default(true).notNull(),
	showInName: boolean("show_in_name").default(true).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	dataType: text("data_type").default('text').notNull(),
	meta: jsonb(),
	hasColor: boolean("has_color").default(false).notNull(),
	hasUnits: boolean("has_units").default(false).notNull(),
	hasComposition: boolean("has_composition").default(false).notNull(),
}, (table) => [
	index("inv_attr_types_created_idx").using("btree", table.createdAt.asc().nullsLast().op("timestamp_ops")),
	index("inv_attr_types_department_idx").using("btree", table.categoryId.asc().nullsLast().op("uuid_ops")),
	uniqueIndex("inv_attr_types_slug_category_unique").using("btree", table.slug.asc().nullsLast().op("uuid_ops"), table.categoryId.asc().nullsLast().op("uuid_ops")),
	foreignKey({
		columns: [table.categoryId],
		foreignColumns: [inventoryCategories.id],
		name: "inventory_attribute_types_category_id_inventory_categories_id_f"
	}),
]);
