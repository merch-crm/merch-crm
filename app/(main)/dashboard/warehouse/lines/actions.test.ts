import { describe, it, expect, vi, beforeEach } from "vitest";
import { createProductLine } from "./line-mutation-actions";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";
import { productLines } from "@/lib/schema";
import { revalidatePath } from "next/cache";
import { mockSession } from "@/tests/helpers/mocks";

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

vi.mock("@/lib/session", () => ({
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
            vi.mocked(getSession).mockResolvedValue(null);

            const result = await createProductLine({
                name: "Test Line",
                type: "base",
                categoryId: VALID_CATEGORY_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Не авторизован");
        });

        it("should create a base product line successfully", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: VALID_USER_ID }));

            // Mock category check
            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: VALID_CATEGORY_ID }])
            } as unknown as ReturnType<typeof db.select>);

            // Mock insertion with returning()
            const mockLine = { id: VALID_LINE_ID, name: "Base Line", type: "base" };
            (db.insert as ReturnType<typeof vi.fn>).mockReturnValue({
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
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: VALID_USER_ID }));

            vi.mocked(db.select).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([])
            } as unknown as ReturnType<typeof db.select>);

            const result = await createProductLine({
                name: "Test Line",
                type: "base",
                categoryId: VALID_CATEGORY_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Категория не найдена");
        });

        it("should require print collection for finished lines", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: VALID_USER_ID }));

            const result = await createProductLine({
                name: "Finished Line",
                type: "finished",
                categoryId: VALID_CATEGORY_ID
            });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Для готовой линейки необходимо указать коллекцию дизайнов");
        });

        it("should check for collection existence for finished lines", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: VALID_USER_ID }));

            // Mock category check (success)
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: VALID_CATEGORY_ID }])
            } as unknown as ReturnType<typeof db.select>);

            // Mock collection check (failure)
            vi.mocked(db.select).mockReturnValueOnce({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([])
            } as unknown as ReturnType<typeof db.select>);

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
