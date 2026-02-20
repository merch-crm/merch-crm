import { pgEnum } from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", ["new", "design", "production", "done", "shipped", "cancelled"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partial", "paid", "refunded"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["not_started", "shipped", "delivered", "cancelled"]);
export const taskStatusEnum = pgEnum("task_status", ["new", "in_progress", "review", "done", "archived"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "normal", "high"]);
export const taskTypeEnum = pgEnum("task_type", ["design", "production", "acquisition", "delivery", "other"]);
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "success", "error", "transfer"]);
export const securityEventTypeEnum = pgEnum("security_event_type", [
    "login_success", "login_failed", "logout", "password_change", "email_change",
    "profile_update", "role_change", "permission_change", "data_export",
    "record_delete", "settings_change", "maintenance_mode_toggle", "system_error",
    "admin_impersonation_start", "admin_impersonation_stop"
]);
export const orderCategoryEnum = pgEnum("order_category", ["print", "embroidery", "merch", "other"]);
export const inventoryItemTypeEnum = pgEnum("inventory_item_type", ["clothing", "packaging", "consumables"]);
export const clientTypeEnum = pgEnum("client_type", ["b2c", "b2b"]);
export const measurementUnitEnum = pgEnum("measurement_unit_v2", ["шт.", "л", "м", "кг"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bank", "online", "account"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["rent", "salary", "purchase", "tax", "other"]);
export const productionStageStatusEnum = pgEnum("production_stage_status", ["pending", "in_progress", "done", "failed"]);
export const storageLocationTypeEnum = pgEnum("storage_location_type", ["warehouse", "production", "office"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["in", "out", "transfer", "attribute_change", "archive", "restore", "stock_in", "stock_out", "adjustment"]);
