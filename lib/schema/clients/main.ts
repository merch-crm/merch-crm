import { pgTable, text, timestamp, uuid, boolean, index, integer, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { clientTypeEnum } from "../enums";
import { users } from "../users";
import { orders } from "../orders";
import { clientContacts } from "./contacts";
import { loyaltyLevels } from "./loyalty";

// Этапы воронки
export const funnelStages = ["lead", "first_contact", "negotiation", "first_order", "regular"] as const;
export type FunnelStage = typeof funnelStages[number];

export const funnelStageLabels: Record<FunnelStage, string> = {
    lead: "Лид",
    first_contact: "Первый контакт",
    negotiation: "Переговоры",
    first_order: "Первый заказ",
    regular: "Постоянный клиент",
};

export const funnelStageColors: Record<FunnelStage, string> = {
    lead: "#64748B",
    first_contact: "#3B82F6",
    negotiation: "#F59E0B",
    first_order: "#10B981",
    regular: "#6366F1",
};

// Причины потери клиента
export const lostReasons = [
    "price",           // Не устроила цена
    "competitor",      // Ушёл к конкуренту
    "quality",         // Не устроило качество
    "timing",          // Не устроили сроки
    "no_need",         // Отпала потребность
    "no_response",     // Не выходит на связь
    "other",           // Другое
] as const;
export type LostReason = typeof lostReasons[number];

export const lostReasonLabels: Record<LostReason, string> = {
    price: "Не устроила цена",
    competitor: "Ушёл к конкуренту",
    quality: "Не устроило качество",
    timing: "Не устроили сроки",
    no_need: "Отпала потребность",
    no_response: "Не выходит на связь",
    other: "Другое",
};

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

    // === НОВОЕ: Воронка ===
    funnelStage: text("funnel_stage").default("lead"),
    funnelStageChangedAt: timestamp("funnel_stage_changed_at", { withTimezone: true }).defaultNow(),
    lostAt: timestamp("lost_at", { withTimezone: true }),
    lostReason: text("lost_reason"),

    // === НОВОЕ: Лояльность ===
    loyaltyLevelId: uuid("loyalty_level_id").references(() => loyaltyLevels.id),
    loyaltyLevelSetManually: boolean("loyalty_level_set_manually").default(false),
    loyaltyLevelChangedAt: timestamp("loyalty_level_changed_at", { withTimezone: true }),

    // === НОВОЕ: Денормализованная статистика ===
    totalOrdersCount: integer("total_orders_count").default(0),
    totalOrdersAmount: decimal("total_orders_amount", { precision: 12, scale: 2 }).default("0"),
    averageCheck: decimal("average_check", { precision: 12, scale: 2 }).default("0"),
    lastOrderAt: timestamp("last_order_at", { withTimezone: true }),
    firstOrderAt: timestamp("first_order_at", { withTimezone: true }),
    daysSinceLastOrder: integer("days_since_last_order"),

    // === НОВОЕ: RFM-анализ ===
    rfmRecency: integer("rfm_recency"),
    rfmFrequency: integer("rfm_frequency"),
    rfmMonetary: integer("rfm_monetary"),
    rfmScore: text("rfm_score"),
    rfmSegment: text("rfm_segment"),
    rfmCalculatedAt: timestamp("rfm_calculated_at", { withTimezone: true }),

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
        funnelStageIdx: index("idx_clients_funnel_stage").on(table.funnelStage),
        loyaltyLevelIdx: index("idx_clients_loyalty_level").on(table.loyaltyLevelId),

        // === НОВОЕ: Индексы для статистики и RFM ===
        totalOrdersCountIdx: index("idx_clients_total_orders_count").on(table.totalOrdersCount),
        totalOrdersAmountIdx: index("idx_clients_total_orders_amount").on(table.totalOrdersAmount),
        lastOrderAtIdx: index("idx_clients_last_order_at").on(table.lastOrderAt),
        rfmSegmentIdx: index("idx_clients_rfm_segment").on(table.rfmSegment),
        rfmScoreIdx: index("idx_clients_rfm_score").on(table.rfmScore),
        cityIdx: index("idx_clients_city").on(table.city),
        sourceIdx: index("idx_clients_source").on(table.acquisitionSource),
        clientTypeIdx: index("idx_clients_client_type").on(table.clientType),
    }
});

export const clientsRelations = relations(clients, ({ one, many }) => ({
    manager: one(users, {
        fields: [clients.managerId],
        references: [users.id],
    }),
    orders: many(orders),
    contacts: many(clientContacts),
    loyaltyLevel: one(loyaltyLevels, {
        fields: [clients.loyaltyLevelId],
        references: [loyaltyLevels.id],
    }),
}));

