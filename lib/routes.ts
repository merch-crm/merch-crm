export const ROUTES = {
    WAREHOUSE: {
        ROOT: "/dashboard/warehouse",
        CATEGORIES: "/dashboard/warehouse/categories",
        CATEGORY_DETAIL: (id: string) => `/dashboard/warehouse/categories/${id}`,
        ITEMS: "/dashboard/warehouse/items",
        ITEM_DETAIL: (id: string) => `/dashboard/warehouse/items/${id}`,
        NEW_ITEM: "/dashboard/warehouse/items/new",
        // Новые маршруты для линеек
        LINES: "/dashboard/warehouse/lines",
        LINE_DETAIL: (id: string) => `/dashboard/warehouse/lines/${id}`,
        NEW_LINE: "/dashboard/warehouse/lines/new",
    },

    DESIGN: {
        ROOT: "/dashboard/design",
        // Новые маршруты для принтов
        PRINTS: "/dashboard/design/prints",
        COLLECTION_DETAIL: (id: string) => `/dashboard/design/prints/${id}`,
        DESIGN_DETAIL: (collectionId: string, designId: string) =>
            `/dashboard/design/prints/${collectionId}/${designId}`,
    },
} as const;
