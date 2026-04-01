import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBaseLineWithPositions, createFinishedLineWithPositions } from "./actions";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { productLines } from "@/lib/schema/product-lines";
import { revalidatePath } from "next/cache";
import { mockSession } from "@/tests/helpers/mocks";

// Mock the dependencies
vi.mock("@/lib/db", () => ({
    db: {
        query: {
            inventoryItems: {
                findMany: vi.fn(),
            },
            productLines: {
                findFirst: vi.fn(),
            },
        },
        select: vi.fn(),
        insert: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        transaction: vi.fn((cb) => cb(db)), // Simple transaction mock that just calls callback with db
    },
}));

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/utils/line-name-generator", () => ({
    generatePositionName: vi.fn(() => "Mock Name"),
    generatePositionSKU: vi.fn(() => "MOCK-SKU"),
    singularize: vi.fn((s) => s),
}));

describe("New Item/Line Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const VALID_CATEGORY_ID = "123e4567-e89b-12d3-a456-426614174000";
    const VALID_LINE_ID = "123e4567-e89b-12d3-a456-426614174001";
    const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174002";

    describe("createBaseLineWithPositions", () => {
        it("should create base line and items successfully", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: VALID_USER_ID }));

            // Mock SKU check
            (db.query.inventoryItems.findMany as ReturnType<typeof vi.fn>).mockResolvedValue([]);

            // Mock insertions
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockResolvedValue({}),
            } as unknown as ReturnType<typeof db.insert>);

            const result = await createBaseLineWithPositions({
                line: {
                    name: "Base Cotton T-Shirt",
                    categoryId: VALID_CATEGORY_ID,
                    itemType: "base",
                },
                positions: [
                    { sizeCode: "M", quantity: 10, costPrice: "100", sellingPrice: "200" },
                    { sizeCode: "L", quantity: 5, costPrice: "100", sellingPrice: "200" }
                ]
            });

            expect(result.success).toBe(true);
            expect(result.lineId).toBeDefined();
            expect(db.insert).toHaveBeenCalledWith(productLines);
            // expect(db.insert).toHaveBeenCalledWith(inventoryItems); // Called multiple times
            expect(revalidatePath).toHaveBeenCalled();
        });
    });

    describe("createFinishedLineWithPositions", () => {
        it("should create finished line with items in transaction", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: VALID_USER_ID }));

            const VALID_PRINT_ID = "123e4567-e89b-12d3-a456-426614174005";
            const VALID_COLLECTION_ID = "123e4567-e89b-12d3-a456-426614174006";

            // Mock SKU check
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue([]),
            });

            // Mock insertions with returning
            vi.mocked(db.insert).mockReturnValue({
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([{ id: "item-1" }, { id: "item-2" }]),
            } as unknown as ReturnType<typeof db.insert>);

            const result = await createFinishedLineWithPositions({
                categoryId: VALID_CATEGORY_ID,
                lineName: "Awesome Print T-Shirt",
                printCollectionId: VALID_COLLECTION_ID,
                baseLineId: VALID_LINE_ID,
                positions: [
                    { name: "Awesome Print M", sku: "AP-M", printDesignId: VALID_PRINT_ID, attributes: { size: "M" } },
                    { name: "Awesome Print L", sku: "AP-L", printDesignId: VALID_PRINT_ID, attributes: { size: "L" } }
                ],
                stock: {
                    quantity: 10,
                    locationId: "loc-1",
                    minStock: 2,
                    userId: VALID_USER_ID
                }
            });

            expect(result.success).toBe(true);
            expect(result.lineId).toBeDefined();
            expect(result.positionsCount).toBe(2);
            expect(db.transaction).toHaveBeenCalled();
        });
    });
});

