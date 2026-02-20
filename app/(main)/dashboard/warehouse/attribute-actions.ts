/**
 * Re-exporting warehouse attribute actions from sub-modules for backward compatibility.
 * This file serves as a proxy to the modular structure.
 */

export {
    getInventoryAttributes,
    createInventoryAttribute,
    updateInventoryAttribute,
    deleteInventoryAttribute
} from "./attributes/actions/attribute.actions";
export type { InventoryAttribute } from "./attributes/actions/attribute.actions";

export {
    getInventoryAttributeTypes,
    createInventoryAttributeType,
    deleteInventoryAttributeType,
    updateInventoryAttributeType
} from "./attributes/actions/type.actions";
export type { AttributeType } from "./attributes/actions/type.actions";

export { regenerateAllItemSKUs } from "./attributes/actions/maintenance.actions";
