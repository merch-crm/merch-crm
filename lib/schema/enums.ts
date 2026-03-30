import {
    pgEnum,
} from "drizzle-orm/pg-core";

export const orderStatusEnum = pgEnum("order_status", ["new", "design", "production", "done", "shipped", "cancelled", "completed", "archived"]);
export const orderItemDesignStatusEnum = pgEnum("order_item_design_status", ["pending", "in_progress", "review", "approved", "revision", "not_required"]);
export const paymentStatusEnum = pgEnum("payment_status", ["unpaid", "partial", "paid", "refunded"]);
export const deliveryStatusEnum = pgEnum("delivery_status", ["not_started", "shipped", "delivered", "cancelled"]);
export const taskStatusEnum = pgEnum("task_status", ["new", "in_progress", "review", "done", "archived", "cancelled", "completed"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "normal", "high", "urgent"]);
export const taskTypeEnum = pgEnum("task_type", ["general", "design", "production", "acquisition", "delivery", "inventory", "maintenance", "other"]);
export const notificationTypeEnum = pgEnum("notification_type", ["info", "warning", "success", "error", "transfer"]);
export const securityEventTypeEnum = pgEnum("security_event_type", [
    "login_success", "login_failed", "logout", "password_change", "password_reset_requested",
    "email_change", "profile_update", "role_change", "permission_change", "data_export",
    "record_delete", "settings_change", "maintenance_mode_toggle", "system_error",
    "rate_limit_exceeded", "admin_impersonation_start", "admin_impersonation_stop"
]);
export const orderCategoryEnum = pgEnum("order_category", ["print", "embroidery", "merch", "other"]);
export const inventoryItemTypeEnum = pgEnum("inventory_item_type", ["clothing", "packaging", "consumables"]);
export const clientTypeEnum = pgEnum("client_type", ["b2c", "b2b"]);
export const measurementUnitEnum = pgEnum("measurement_unit_v2", ["шт.", "см", "м", "гр", "кг", "мл", "л"]);
export const paymentMethodEnum = pgEnum("payment_method", ["cash", "bank", "online", "account"]);
export const expenseCategoryEnum = pgEnum("expense_category", ["rent", "salary", "purchase", "tax", "other"]);
export const productionStageStatusEnum = pgEnum("production_stage_status", ["pending", "in_progress", "paused", "done", "failed"]);
export const storageLocationTypeEnum = pgEnum("storage_location_type", ["warehouse", "production", "office"]);
export const transactionTypeEnum = pgEnum("transaction_type", ["in", "out", "transfer", "attribute_change", "archive", "restore", "stock_in", "stock_out", "adjustment"]);
export const presenceEventTypeEnum = pgEnum("presence_event_type", ["detected", "lost", "recognized", "unknown"]);
export const sessionTypeEnum = pgEnum("session_type", ["work", "break", "idle"]);
export const cameraStatusEnum = pgEnum("camera_status", ["online", "offline", "error", "connecting"]);
export const brandingFileTypeEnum = pgEnum("branding_file_type", ["logo_main", "logo_accent", "icon", "font", "pattern", "other"]);
export const printFileTypeEnum = pgEnum("print_file_type", ["preview", "source"]);
export const defectReasonEnum = pgEnum("defect_reason", ["equipment_failure", "human_error", "material_defect", "other"]);
