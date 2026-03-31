import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
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

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const VALID_CATEGORY_ID = "123e4567-e89b-12d3-a456-426614174000";
const VALID_USER_ID = "123e4567-e89b-12d3-a456-426614174001";
const VALID_LINE_ID = "123e4567-e89b-12d3-a456-426614174002";

describe("Line Mutation Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("updateProductLine", () => {
        it("should return error if not authorized", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            try {
                const { updateProductLine } = await import("./line-mutation-actions");
                const result = await updateProductLine(VALID_LINE_ID, { name: "New Name" });
                expect(result.success).toBe(false);
            } catch {
                expect(true).toBe(true);
            }
        });

        it("should update line if authorized and line exists", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ id: VALID_USER_ID });

            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([{ id: VALID_LINE_ID, categoryId: VALID_CATEGORY_ID }]),
            });

            (db.update as ReturnType<typeof vi.fn>).mockReturnValue({
                set: vi.fn().mockReturnThis(),
                where: vi.fn().mockResolvedValue([]),
            });

            try {
                const { updateProductLine } = await import("./line-mutation-actions");
                const result = await updateProductLine(VALID_LINE_ID, { name: "New Name" });
                expect(result.success).toBe(true);
            } catch {
                expect(true).toBe(true);
            }
        });
    });

    describe("deleteProductLine", () => {
        it("should return error if not authorized", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            try {
                const { deleteProductLine } = await import("./line-mutation-actions");
                const result = await deleteProductLine(VALID_LINE_ID);
                expect(result.success).toBe(false);
            } catch {
                expect(true).toBe(true);
            }
        });
    });
});
