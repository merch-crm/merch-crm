import { pgTable, text, timestamp, uuid, index, integer, AnyPgColumn } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users";

export const wikiFolders = pgTable("wiki_folders", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    parentId: uuid("parent_id").references((): AnyPgColumn => wikiFolders.id),
    sortOrder: integer("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        parentIdx: index("wiki_folders_parent_idx").on(table.parentId),
        createdIdx: index("wiki_folders_created_idx").on(table.createdAt),
    }
});

export const wikiFoldersRelations = relations(wikiFolders, ({ one, many }) => ({
    parent: one(wikiFolders, {
        fields: [wikiFolders.parentId],
        references: [wikiFolders.id],
        relationName: "folderHierarchy",
    }),
    children: many(wikiFolders, {
        relationName: "folderHierarchy",
    }),
    pages: many(wikiPages),
}));

export const wikiPages = pgTable("wiki_pages", {
    id: uuid("id").defaultRandom().primaryKey(),
    folderId: uuid("folder_id").references(() => wikiFolders.id),
    title: text("title").notNull(),
    content: text("content"),
    createdBy: uuid("created_by").references(() => users.id),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        folderIdx: index("wiki_pages_folder_idx").on(table.folderId),
        createdByIdx: index("wiki_pages_created_by_idx").on(table.createdBy),
        createdIdx: index("wiki_pages_created_idx").on(table.createdAt),
    }
});

export const wikiPagesRelations = relations(wikiPages, ({ one }) => ({
    folder: one(wikiFolders, {
        fields: [wikiPages.folderId],
        references: [wikiFolders.id],
    }),
    author: one(users, {
        fields: [wikiPages.createdBy],
        references: [users.id],
    }),
}));
