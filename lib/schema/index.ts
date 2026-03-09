// Enums
export * from "./enums";

// Core
export * from "./users";
export * from "./clients/main";
export * from "./clients/contacts";
export * from "./clients/loyalty";
export * from "./promocodes";
export * from "./storage";

// Designs (перед warehouse, т.к. warehouse зависит от designs)
export * from "./designs";

// Product Lines (перед warehouse)
export * from "./product-lines";

// Warehouse
export * from "./warehouse/categories";
export * from "./warehouse/attributes";
export * from "./warehouse/items";
export * from "./warehouse/stock";
export * from "./inventory-transactions.schema";

// Orders & Finance
export * from "./orders";
export * from "./finance";

// Other
export * from "./tasks";
export * from "./system";
export * from "./wiki";
export * from "./presence/hardware";
export * from "./presence/recognition";
export * from "./presence/workstations";
export * from "./presence/sessions";
export * from "./presence/settings";
export * from "./communications";
