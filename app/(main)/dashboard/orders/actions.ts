/**
 * Orders Actions - Main Barrel File
 * 
 * This file re-exports server actions from decomposed action files for backward compatibility.
 * All new code should ideally import directly from specific action files.
 */

export {
    getOrders, getOrderById, createOrder, deleteOrder,
    getOrderStats, updateOrderField, getClientsForSelect,
    getInventoryForSelect, searchClients, archiveOrder,
    archiveOrder as toggleOrderArchived
} from "./actions/core.actions";

export {
    updateOrderStatus, updateOrderPriority
} from "./actions/status.actions";

export {
    refundOrder, addPayment
} from "./actions/financials.actions";

export {
    bulkUpdateOrderStatus, bulkUpdateOrderPriority,
    bulkArchiveOrders, bulkDeleteOrders
} from "./actions/bulk.actions";

export {
    uploadOrderFile
} from "./actions/attachments.actions";
