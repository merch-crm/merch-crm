import { pgTable, text, timestamp, uuid, boolean, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clientTypeEnum } from "./enums";
import { users } from "./users";
import { orders } from "./orders";

export const clients = pgTable("clients", {
    id: uuid("id").defaultRandom().primaryKey(),
    clientType: clientTypeEnum("client_type").default("b2c").notNull(),
    lastName: text("last_name").notNull(),
    firstName: text("first_name").notNull(),
    patronymic: text("patronymic"),
    name: text("name"),
    company: text("company"),
    phone: text("phone").notNull(),
    telegram: text("telegram"),
    instagram: text("instagram"),
    email: text("email"),
    city: text("city"),
    address: text("address"),
    comments: text("comments"),
    socialLink: text("social_link"),
    acquisitionSource: text("acquisition_source"),
    managerId: uuid("manager_id").references(() => users.id),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        managerIdx: index("clients_manager_idx").on(table.managerId),
        archivedIdx: index("clients_archived_idx").on(table.isArchived),
        searchIdx: index("clients_search_idx").on(table.lastName, table.firstName, table.phone),
        phoneIdx: index("clients_phone_idx").on(table.phone),
        emailIdx: index("clients_email_idx").on(table.email),
        companyIdx: index("clients_company_idx").on(table.company),
        createdIdx: index("clients_created_idx").on(table.createdAt),
    }
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
    manager: one(users, {
        fields: [clients.managerId],
        references: [users.id],
    }),
    orders: many(orders),
}));
