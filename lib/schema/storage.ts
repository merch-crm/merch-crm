import { pgTable, text, timestamp, uuid, boolean, index, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { storageLocationTypeEnum } from "./enums";
import { users } from "./users";
import { inventoryStocks, inventoryTransfers } from "./warehouse";

export const storageLocations = pgTable("storage_locations", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    address: text("address"),
    type: storageLocationTypeEnum("type").default("warehouse").notNull(),
    description: text("description"),
    responsibleUserId: uuid("responsible_user_id").references(() => users.id),
    isSystem: boolean("is_system").default(false).notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        typeIdx: index("storage_loc_type_idx").on(table.type),
        responsibleIdx: index("storage_loc_responsible_idx").on(table.responsibleUserId),
        activeIdx: index("storage_loc_active_idx").on(table.isActive),
        createdIdx: index("storage_loc_created_idx").on(table.createdAt),
    }
});

export const storageLocationsRelations = relations(storageLocations, ({ one, many }) => ({
    responsibleUser: one(users, {
        fields: [storageLocations.responsibleUserId],
        references: [users.id],
    }),
    stocks: many(inventoryStocks),
    transfersIn: many(inventoryTransfers, { relationName: "transfer_to" }),
    transfersOut: many(inventoryTransfers, { relationName: "transfer_from" }),
}));
