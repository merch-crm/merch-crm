import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProductLine } from "./line-mutation-actions";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { productLines } from "@/lib/schema";
import { revalidatePath } from "next/cache";

// Mock the dependencies
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
    },
}));

vi.mock("@/lib/auth", () => ({
    getSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
    invalidateCache: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
    logAction: vi.fn(),
}));

vi.mock("@/lib/error-logger", () => ({
    logError: vi.fn(),
}));

describe("Product Line Mutation Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    // Use standard v4 UUIDs
    const VALID_CATEGORY_ID = "123e4567-e89b-12d3-a456-426614174000";
    const VALID_COLLECTION_ID = "123e4567-e89b-12d3-a456-426614174001";
    const VALID_LINE_ID = "123e4567-e89b-12d3-a456-426614174002";
    const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174003";

    describe("createProductLine", () => {
        it("should return error if not authorized", async () => {
            (getSession as any).mockResolvedValue(null);

            const result = await createProductLine({
                name: "Test Line",
                type: "base",
                categoryId: VALID_CATEGORY_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Не авторизован");
        });

        it("should create a base product line successfully", async () => {
            (getSession as any).mockResolvedValue({ id: VALID_USER_ID });

            // Mock category check
            (db.select as any).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: VALID_CATEGORY_ID }])
            });

            // Mock insertion with returning()
            const mockLine = { id: VALID_LINE_ID, name: "Base Line", type: "base" };
            (db.insert as any).mockReturnValue({
                values: vi.fn().mockReturnThis(),
                returning: vi.fn().mockResolvedValue([mockLine])
            });

            const result = await createProductLine({
                name: "Base Line",
                type: "base",
                categoryId: VALID_CATEGORY_ID,
                commonAttributes: { brand: "Muse" }
            });

            expect(result.success).toBe(true);
            expect(result.data?.id).toBe(VALID_LINE_ID);
            expect(db.insert).toHaveBeenCalledWith(productLines);
            expect(revalidatePath).toHaveBeenCalledWith("/dashboard/warehouse");
        });

        it("should return error if category not found", async () => {
            (getSession as any).mockResolvedValue({ id: VALID_USER_ID });

            (db.select as any).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([])
            });

            const result = await createProductLine({
                name: "Test Line",
                type: "base",
                categoryId: VALID_CATEGORY_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Категория не найдена");
        });

        it("should require print collection for finished lines", async () => {
            (getSession as any).mockResolvedValue({ id: VALID_USER_ID });

            const result = await createProductLine({
                name: "Finished Line",
                type: "finished",
                categoryId: VALID_CATEGORY_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Для готовой линейки необходимо указать коллекцию дизайнов");
        });

        it("should check for collection existence for finished lines", async () => {
            (getSession as any).mockResolvedValue({ id: VALID_USER_ID });

            // Mock category check (success)
            (db.select as any).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: VALID_CATEGORY_ID }])
            });

            // Mock collection check (failure)
            (db.select as any).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([])
            });

            const result = await createProductLine({
                name: "Finished Line",
                type: "finished",
                categoryId: VALID_CATEGORY_ID,
                printCollectionId: VALID_COLLECTION_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Коллекция дизайнов не найдена");
        });
    });
});
