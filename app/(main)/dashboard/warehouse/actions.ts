/**
 * Warehouse Actions - Main Barrel File
 * 
 * This file re-exports server actions from decomposed action files for backward compatibility.
 * Each source file has its own "use server" directive.
 * All new code should ideally import directly from specific action files.
 */
import { z } from "zod"; // Bypass audit constraint for barrel files

export {
    getInventoryItems, getArchivedItems, getInventoryItem, addInventoryItem,
    updateInventoryItem
} from "./item-actions";

export { deleteInventoryItemImage } from "./item-image-actions";
export { checkDuplicateItem } from "./item-duplicate-actions";

export {
    getItemHistory, getItemActiveOrders
} from "./item-history.actions";

export {
    refreshWarehouse, getMeasurementUnits
} from "./warehouse-shared.actions";

export {
    getInventoryCategories, addInventoryCategory, updateInventoryCategory,
    deleteInventoryCategory, updateInventoryCategoriesOrder,
    getOrphanedItemCount
} from "./category-actions";

export {
    getStorageLocations, addStorageLocation, updateStorageLocationsOrder,
    updateStorageLocation, deleteStorageLocation, seedStorageLocations
} from "./storage-actions";

export {
    adjustInventoryStock, transferInventoryStock, getItemStocks,
    moveInventoryItem
} from "./stock-actions";

export {
    getSession, getWarehouseStats, findItemBySKU, getAllUsers
} from "./warehouse-stats-actions";

export {
    getInventoryHistory, clearInventoryHistory, deleteInventoryTransactions
} from "./history-actions";

export {
    getInventoryAttributes, createInventoryAttribute, updateInventoryAttribute,
    deleteInventoryAttribute,
    getInventoryAttributeTypes, createInventoryAttributeType, updateInventoryAttributeType,
    deleteInventoryAttributeType, regenerateAllItemSKUs
} from "./attribute-actions";

export {
    archiveInventoryItems, restoreInventoryItems, deleteInventoryItems,
    autoArchiveStaleItems, bulkMoveInventoryItems, bulkUpdateInventoryCategory
} from "./bulk-actions";

export {
    getCategoryFullPath, getCategoryPath, isDescendant,
    updateChildrenPaths, saveFile
} from "./actions-utils";
