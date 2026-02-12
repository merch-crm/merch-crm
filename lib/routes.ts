export const ROUTES = {
    WAREHOUSE: {
        ROOT: "/dashboard/warehouse",
        CATEGORIES: "/dashboard/warehouse/categories",
        ITEMS: "/dashboard/warehouse/items",
        ITEM_DETAIL: (id: string) => `/dashboard/warehouse/items/${id}`,
        NEW_ITEM: "/dashboard/warehouse/items/new",
    }
} as const;
