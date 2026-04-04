/**
 * Order Status Mapping and Helpers
 */

export const ORDER_STATUS_LABELS: Record<string, string> = {
    new: "Новый",
    design: "Дизайн",
    production: "В производстве",
    done: "Готов",
    shipped: "Отгружен",
    cancelled: "Отменен",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
    new: "#3b82f6",       // Blue
    design: "#8b5cf6",    // Violet
    production: "#f59e0b", // Amber
    done: "#10b981",       // Emerald
    shipped: "#6366f1",    // Indigo
    cancelled: "#ef4444",  // Red
};

/**
 * Gets the human-readable label for a given order status.
 */
export function getOrderStatusLabel(status: string): string {
    return ORDER_STATUS_LABELS[status] || status;
}

/**
 * Gets the brand color for a given order status.
 */
export function getOrderStatusColor(status: string): string {
    return ORDER_STATUS_COLORS[status] || "#94a3b8";
}
