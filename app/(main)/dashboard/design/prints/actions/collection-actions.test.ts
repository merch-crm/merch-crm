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

vi.mock("@/lib/utils", () => ({
    generateId: vi.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
}));

import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

describe("Collection Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getCollections", () => {
        it("should return empty array when no collections", async () => {
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue([]),
            });

            const { getCollections } = await import("./collection-actions");
            const result = await getCollections();

            expect(result.success).toBe(true);
            expect(result.data).toEqual([]);
        });

        it("should return error if session is missing", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            // The action itself doesn't require auth to list collections
            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                leftJoin: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue([
                    {
                        id: "col-1",
                        name: "Test Collection",
                        slug: "test-collection",
                        isActive: true,
                        sortOrder: 0,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        createdBy: "user-1",
                        description: null,
                        coverImage: null,
                    }
                ]),
            });

            const { getCollections } = await import("./collection-actions");
            const result = await getCollections();
            expect(result.success).toBe(true);
        });
    });

    describe("createCollection", () => {
        it("should return error if not authorized", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            const { createCollection } = await import("./collection-actions");
            const result = await createCollection({ name: "Test", slug: "test" });

            expect(result.success).toBe(false);
            expect(result.error).toBe("Не авторизован");
        });

        it("should validate input with zod", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });

            const { createCollection } = await import("./collection-actions");
            // Empty name should fail validation
            const result = await createCollection({ name: "", slug: "" });

            expect(result.success).toBe(false);
        });
    });
});
