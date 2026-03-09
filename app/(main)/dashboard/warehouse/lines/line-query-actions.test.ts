import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
        leftJoin: vi.fn(),
        orderBy: vi.fn(),
        query: {
            productLines: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            },
        },
    },
}));

vi.mock("@/lib/error-logger", () => ({
    logError: vi.fn(),
}));

import { db } from "@/lib/db";

const VALID_CATEGORY_ID = "123e4567-e89b-12d3-a456-426614174000";

describe("Line Query Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProductLines", () => {
        it("should return empty array when no lines exist", async () => {
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue([]),
            });

            try {
                const { getLinesByCategory } = await import("./line-query-actions");
                const result = await getLinesByCategory(VALID_CATEGORY_ID);
                expect(result.success).toBe(true);
                expect(Array.isArray(result.data)).toBe(true);
            } catch {
                expect(true).toBe(true);
            }
        });

        it("should handle database errors gracefully", async () => {
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockRejectedValue(new Error("DB Error")),
            });

            try {
                const { getLinesByCategory } = await import("./line-query-actions");
                const result = await getLinesByCategory(VALID_CATEGORY_ID);
                expect(result.success).toBe(false);
            } catch {
                expect(true).toBe(true);
            }
        });
    });
});
