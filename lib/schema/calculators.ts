import {
    pgTable,
    uuid,
    varchar,
    integer,
    decimal,
    boolean,
    timestamp,
    jsonb,
    index,
    uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";
import { orders } from "./orders";

// ============================================================================
// METER PRICE TIERS - Прогрессивная шкала цен за погонный метр
// ============================================================================
// Пример: DTF 300мм: 0-5м = 1500₽/м, 5-20м = 1200₽/м, 20+м = 1000₽/м

export const meterPriceTiers = pgTable(
    "meter_price_tiers",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        
        // Тип печати: dtf, sublimation, dtg
        applicationType: varchar("application_type", { length: 50 }).notNull(),
        
        // Ширина рулона в мм (300, 600, 610, 1118...)
        rollWidthMm: integer("roll_width_mm").notNull(),
        
        // Диапазон метража
        fromMeters: decimal("from_meters", { precision: 10, scale: 2 }).notNull(),
        toMeters: decimal("to_meters", { precision: 10, scale: 2 }), // null = бесконечность
        
        // Цена за погонный метр
        pricePerMeter: decimal("price_per_meter", { precision: 10, scale: 2 }).notNull(),
        
        // Сортировка и статус
        sortOrder: integer("sort_order").default(0).notNull(),
        isActive: boolean("is_active").default(true).notNull(),
        
        // Timestamps
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        applicationTypeIdx: index("meter_price_tiers_application_type_idx")
            .on(table.applicationType),
        rollWidthIdx: index("meter_price_tiers_roll_width_idx")
            .on(table.rollWidthMm),
        activeIdx: index("meter_price_tiers_active_idx")
            .on(table.applicationType, table.isActive),
        uniqueTier: uniqueIndex("meter_price_tiers_unique_idx")
            .on(table.applicationType, table.rollWidthMm, table.fromMeters),
        createdAtIdx: index("meter_price_tiers_created_at_idx").on(table.createdAt),
    })
);

// ============================================================================
// PRINT PLACEMENTS - Типы нанесений (места на изделии)
// ============================================================================
// Пример: "Футболка перед" 290×400мм = 50₽ за работу

export const printPlacements = pgTable(
    "print_placements",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        
        // Тип печати
        applicationType: varchar("application_type", { length: 50 }).notNull(),
        
        // Название и slug
        name: varchar("name", { length: 100 }).notNull(),
        slug: varchar("slug", { length: 100 }).notNull(),
        description: varchar("description", { length: 255 }),
        
        // Максимальный размер области нанесения
        widthMm: integer("width_mm").notNull(),
        heightMm: integer("height_mm").notNull(),
        
        // Стоимость работы по нанесению (за единицу)
        workPrice: decimal("work_price", { precision: 10, scale: 2 }).notNull(),
        
        // Статус и сортировка
        isActive: boolean("is_active").default(true).notNull(),
        sortOrder: integer("sort_order").default(0).notNull(),
        
        // Timestamps
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        applicationTypeIdx: index("print_placements_application_type_idx")
            .on(table.applicationType),
        activeIdx: index("print_placements_active_idx")
            .on(table.applicationType, table.isActive),
        slugIdx: uniqueIndex("print_placements_slug_idx")
            .on(table.applicationType, table.slug),
        createdAtIdx: index("print_placements_created_at_idx").on(table.createdAt),
    })
);

// ============================================
// TYPES FOR JSON FIELDS
// ============================================

export interface ConsumptionDataItem {
    key: string;
    name: string;
    value: number;
    unit: string;
    unitPrice?: number;
    totalPrice?: number;
}

export interface ConsumptionData {
    items: ConsumptionDataItem[];
    totalMaterialsCost?: number;
    threadConsumption?: { totalThreadMeters: number };
    extraColorsCost?: number;
    discountAmount?: number;
     designs?: Array<{
        id: string;
        name: string;
        stitchCount: number;
        threadType: string;
        density: string;
        hasDigitizing: boolean;
        colorsCount: number;
    }>;
    prints?: Array<{
        id: string;
        name: string;
        type: string;
        sizeId: string;
        purchasePrice: number;
    }>;
    settings?: {
        includeGarments: boolean;
        isRush: boolean;
    };
    totalItems?: number;
    totalApplications?: number;
    estimatedTime?: number;
    materials?: Record<string, unknown>[];
    materialsCost?: number;
    breakdown?: Array<Record<string, unknown>>;
}

export const calculatorConsumablesSettings = pgTable(
    "calculator_consumables_settings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        
        // Тип печати (уникальный)
        applicationType: varchar("application_type", { length: 50 }).notNull().unique(),
        
        // Расход чернил (мл на м²)
        inkWhitePerM2: decimal("ink_white_per_m2", { precision: 10, scale: 2 }),
        inkCmykPerM2: decimal("ink_cmyk_per_m2", { precision: 10, scale: 2 }),
        
        // Расход порошка/клея (г на м²) — для DTF
        powderPerM2: decimal("powder_per_m2", { precision: 10, scale: 2 }),
        
        // Расход бумаги (м² на м²) — для сублимации
        paperPerM2: decimal("paper_per_m2", { precision: 10, scale: 2 }),
        
        // Процент заполнения принта (по умолчанию 80%)
        fillPercent: integer("fill_percent").default(80).notNull(),
        
        // Процент брака/отходов (по умолчанию 10%)
        wastePercent: integer("waste_percent").default(10).notNull(),
        
        // Дополнительные настройки (JSON)
        config: jsonb("config").$type<{
            primerPerItem?: number;      // Праймер для DTG (мл/изделие)
            stabilizatorPerM2?: number;  // Стабилизатор для вышивки
            threadPerKStitch?: number;   // Нить на 1000 стежков
            [key: string]: number | undefined;
        }>(),
        
        // Timestamps
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        createdAtIdx: index("calculator_consumables_settings_created_at_idx").on(table.createdAt),
    })
);

// ============================================================================
// PRINT CALCULATIONS - Сохранённые расчёты
// ============================================================================

export const printCalculations = pgTable(
    "print_calculations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        
        // Уникальный номер расчёта: DTF-20260313-001
        calculationNumber: varchar("calculation_number", { length: 50 }).notNull().unique(),
        
        // Тип печати
        applicationType: varchar("application_type", { length: 50 }).notNull(),
        
        // ===== Параметры расчёта =====
        rollWidthMm: integer("roll_width_mm").notNull(),
        edgeMarginMm: integer("edge_margin_mm").default(10).notNull(),
        printGapMm: integer("print_gap_mm").default(10).notNull(),
        
        // ===== Результаты раскладки =====
        totalPrints: integer("total_prints").notNull(),
        totalLengthM: decimal("total_length_m", { precision: 10, scale: 3 }).notNull(),
        totalAreaM2: decimal("total_area_m2", { precision: 10, scale: 4 }).notNull(),
        printsAreaM2: decimal("prints_area_m2", { precision: 10, scale: 4 }).notNull(),
        efficiencyPercent: decimal("efficiency_percent", { precision: 5, scale: 2 }).notNull(),
        
        // ===== Стоимость =====
        pricePerMeter: decimal("price_per_meter", { precision: 10, scale: 2 }).notNull(),
        printCost: decimal("print_cost", { precision: 12, scale: 2 }).notNull(),
        placementCost: decimal("placement_cost", { precision: 12, scale: 2 }).notNull(),
        materialsCost: decimal("materials_cost", { precision: 12, scale: 2 }).default("0").notNull(),
        totalCost: decimal("total_cost", { precision: 12, scale: 2 }).notNull(),
        
        // Статистика за принт
        avgCostPerPrint: decimal("avg_cost_per_print", { precision: 10, scale: 2 }).notNull(),
        minCostPerPrint: decimal("min_cost_per_print", { precision: 10, scale: 2 }).notNull(),
        maxCostPerPrint: decimal("max_cost_per_print", { precision: 10, scale: 2 }).notNull(),
        
        // ===== Расход материалов (JSON) =====
        consumptionData: jsonb("consumption_data").$type<ConsumptionData>(),
        
        // ===== Связи =====
        orderId: uuid("order_id").references(() => orders.id, { onDelete: "set null" }),
        createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
        
        // Timestamps
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        applicationTypeIdx: index("print_calculations_application_type_idx")
            .on(table.applicationType),
        orderIdIdx: index("print_calculations_order_id_idx")
            .on(table.orderId),
        createdByIdx: index("print_calculations_created_by_idx")
            .on(table.createdBy),
        createdAtIdx: index("print_calculations_created_at_idx")
            .on(table.createdAt),
        numberIdx: index("print_calculations_number_idx")
            .on(table.calculationNumber),
    })
);

// ============================================================================
// PRINT CALCULATION GROUPS - Группы принтов в расчёте
// ============================================================================

export const printCalculationGroups = pgTable(
    "print_calculation_groups",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        
        // Связь с расчётом
        calculationId: uuid("calculation_id")
            .references(() => printCalculations.id, { onDelete: "cascade" })
            .notNull(),
        
        // ===== Параметры принта =====
        name: varchar("name", { length: 100 }),
        widthMm: integer("width_mm").notNull(),
        heightMm: integer("height_mm").notNull(),
        quantity: integer("quantity").notNull(),
        
        // ===== Результаты раскладки =====
        printsPerRow: integer("prints_per_row").notNull(),
        rowsCount: integer("rows_count").notNull(),
        sectionLengthMm: integer("section_length_mm").notNull(),
        sectionAreaM2: decimal("section_area_m2", { precision: 10, scale: 4 }).notNull(),
        
        // ===== Нанесение =====
        placementId: uuid("placement_id")
            .references(() => printPlacements.id, { onDelete: "set null" }),
        placementCost: decimal("placement_cost", { precision: 12, scale: 2 }).default("0").notNull(),
        
        // ===== Стоимость =====
        sectionCost: decimal("section_cost", { precision: 12, scale: 2 }).notNull(),
        costPerPrint: decimal("cost_per_print", { precision: 10, scale: 2 }).notNull(),
        
        // ===== Визуализация =====
        color: varchar("color", { length: 7 }).notNull(), // HEX: #3B82F6
        sortOrder: integer("sort_order").default(0).notNull(),
        
        // Timestamp
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        calculationIdIdx: index("print_calculation_groups_calculation_id_idx")
            .on(table.calculationId),
        placementIdIdx: index("print_calculation_groups_placement_id_idx")
            .on(table.placementId),
        createdAtIdx: index("print_calculation_groups_created_at_idx").on(table.createdAt),
    })
);

// ============================================================================
// RELATIONS - Связи между таблицами
// ============================================================================

export const printCalculationsRelations = relations(printCalculations, ({ one, many }) => ({
    order: one(orders, {
        fields: [printCalculations.orderId],
        references: [orders.id],
    }),
    createdByUser: one(users, {
        fields: [printCalculations.createdBy],
        references: [users.id],
    }),
    groups: many(printCalculationGroups),
}));

export const printCalculationGroupsRelations = relations(printCalculationGroups, ({ one }) => ({
    calculation: one(printCalculations, {
        fields: [printCalculationGroups.calculationId],
        references: [printCalculations.id],
    }),
    placement: one(printPlacements, {
        fields: [printCalculationGroups.placementId],
        references: [printPlacements.id],
    }),
}));

// ============================================================================
// TYPES EXPORT - Экспорт типов Drizzle
// ============================================================================

export type MeterPriceTier = typeof meterPriceTiers.$inferSelect;
export type NewMeterPriceTier = typeof meterPriceTiers.$inferInsert;

export type PrintPlacement = typeof printPlacements.$inferSelect;
export type NewPrintPlacement = typeof printPlacements.$inferInsert;

export type CalculatorConsumablesSettings = typeof calculatorConsumablesSettings.$inferSelect;
export type NewCalculatorConsumablesSettings = typeof calculatorConsumablesSettings.$inferInsert;

export type PrintCalculation = typeof printCalculations.$inferSelect;
export type NewPrintCalculation = typeof printCalculations.$inferInsert;

export type PrintCalculationGroup = typeof printCalculationGroups.$inferSelect;
export type NewPrintCalculationGroup = typeof printCalculationGroups.$inferInsert;
