import {
    pgTable,
    varchar,
    text,
    boolean,
    integer,
    timestamp,
    index,
    pgEnum,
    uuid,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

// ============ ENUMS ============

export const fileTypeEnum = pgEnum("print_file_type", ["preview", "source"]);

// ============ КОЛЛЕКЦИИ ============

export const printCollections = pgTable(
    "print_collections",
    {
        id: uuid("id").primaryKey(),
        name: varchar("name", { length: 255 }).notNull(),
        slug: varchar("slug", { length: 255 }).notNull(),
        description: text("description"),
        coverImage: varchar("cover_image", { length: 500 }),
        isActive: boolean("is_active").default(true).notNull(),
        sortOrder: integer("sort_order").default(0).notNull(),
        createdBy: uuid("created_by")
            .notNull()
            .references(() => users.id),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        activeIdx: index("print_collections_active_idx").on(table.isActive),
        sortOrderIdx: index("print_collections_sort_order_idx").on(table.sortOrder),
        slugIdx: index("print_collections_slug_idx").on(table.slug),
        createdByIdx: index("print_collections_created_by_idx").on(table.createdBy),
        createdAtIdx: index("print_collections_created_at_idx").on(table.createdAt),
    })
);

// ============ ПРИНТЫ (ДИЗАЙНЫ) ============

export const printDesigns = pgTable(
    "print_designs",
    {
        id: uuid("id").primaryKey(),
        collectionId: uuid("collection_id")
            .notNull()
            .references(() => printCollections.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        description: text("description"),
        preview: varchar("preview", { length: 500 }),
        printFilePath: text("print_file_path"),
        applicationTypeId: uuid("application_type_id"), // Added for design-pricing-card
        costPrice: integer("cost_price"), // decimal/integer, using integer representing cents or exact value
        retailPrice: integer("retail_price"),
        isActive: boolean("is_active").default(true).notNull(),
        sortOrder: integer("sort_order").default(0).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        collectionIdx: index("print_designs_collection_idx").on(table.collectionId),
        activeIdx: index("print_designs_active_idx").on(table.isActive),
        sortOrderIdx: index("print_designs_sort_order_idx").on(table.sortOrder),
        createdAtIdx: index("print_designs_created_at_idx").on(table.createdAt),
    })
);

// ============ ВЕРСИИ ПРИНТОВ ============

export const printDesignVersions = pgTable(
    "print_design_versions",
    {
        id: uuid("id").primaryKey(),
        designId: uuid("design_id")
            .notNull()
            .references(() => printDesigns.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        preview: varchar("preview", { length: 500 }),
        sortOrder: integer("sort_order").default(0).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
        updatedAt: timestamp("updated_at").defaultNow().notNull(),
    },
    (table) => ({
        designIdx: index("print_design_versions_design_idx").on(table.designId),
        sortOrderIdx: index("print_design_versions_sort_order_idx").on(table.sortOrder),
        createdAtIdx: index("print_design_versions_created_at_idx").on(table.createdAt),
    })
);

// ============ ФАЙЛЫ ВЕРСИЙ ============

export const printDesignFiles = pgTable(
    "print_design_files",
    {
        id: uuid("id").primaryKey(),
        versionId: uuid("version_id")
            .notNull()
            .references(() => printDesignVersions.id, { onDelete: "cascade" }),
        filename: varchar("filename", { length: 255 }).notNull(),
        originalName: varchar("original_name", { length: 255 }).notNull(),
        format: varchar("format", { length: 20 }).notNull(),
        fileType: fileTypeEnum("file_type").notNull(),
        size: integer("size").notNull(), // размер в байтах
        width: integer("width"), // ширина в пикселях (для изображений)
        height: integer("height"), // высота в пикселях (для изображений)
        path: varchar("path", { length: 500 }).notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    },
    (table) => ({
        versionIdx: index("print_design_files_version_idx").on(table.versionId),
        fileTypeIdx: index("print_design_files_type_idx").on(table.fileType),
        formatIdx: index("print_design_files_format_idx").on(table.format),
        createdAtIdx: index("print_design_files_created_at_idx").on(table.createdAt),
    })
);

// ============ МОКАПЫ ДИЗАЙНОВ ============

export const printDesignMockups = pgTable("print_design_mockups", {
    id: uuid("id").defaultRandom().primaryKey(),
    designId: uuid("design_id").notNull().references(() => printDesigns.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    preview: text("preview"),
    imagePath: text("image_path"),
    color: varchar("color", { length: 50 }),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
},
    (table) => ({
        designIdx: index("print_design_mockups_design_idx").on(table.designId),
        activeIdx: index("print_design_mockups_active_idx").on(table.isActive),
        sortOrderIdx: index("print_design_mockups_sort_order_idx").on(table.sortOrder),
        createdAtIdx: index("print_design_mockups_created_at_idx").on(table.createdAt),
    }));

// ============ RELATIONS ============

export const printCollectionsRelations = relations(
    printCollections,
    ({ one, many }) => ({
        creator: one(users, {
            fields: [printCollections.createdBy],
            references: [users.id],
        }),
        designs: many(printDesigns),
    })
);

export const printDesignsRelations = relations(
    printDesigns,
    ({ one, many }) => ({
        collection: one(printCollections, {
            fields: [printDesigns.collectionId],
            references: [printCollections.id],
        }),
        versions: many(printDesignVersions),
        mockups: many(printDesignMockups),
    })
);

export const printDesignVersionsRelations = relations(
    printDesignVersions,
    ({ one, many }) => ({
        design: one(printDesigns, {
            fields: [printDesignVersions.designId],
            references: [printDesigns.id],
        }),
        files: many(printDesignFiles),
    })
);

export const printDesignFilesRelations = relations(
    printDesignFiles,
    ({ one }) => ({
        version: one(printDesignVersions, {
            fields: [printDesignFiles.versionId],
            references: [printDesignVersions.id],
        }),
    })
);

// ============ TYPES ============

export type PrintCollection = typeof printCollections.$inferSelect;
export type NewPrintCollection = typeof printCollections.$inferInsert;

export type PrintDesign = typeof printDesigns.$inferSelect;
export type NewPrintDesign = typeof printDesigns.$inferInsert;

export type PrintDesignVersion = typeof printDesignVersions.$inferSelect;
export type NewPrintDesignVersion = typeof printDesignVersions.$inferInsert;

export type PrintDesignFile = typeof printDesignFiles.$inferSelect;
export type NewPrintDesignFile = typeof printDesignFiles.$inferInsert;

export type PrintDesignMockup = typeof printDesignMockups.$inferSelect;
export type NewPrintDesignMockup = typeof printDesignMockups.$inferInsert;
