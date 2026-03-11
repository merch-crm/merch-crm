import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDesignStats } from "../design-dashboard-actions";
import { db } from "@/lib/db";


// Mock the database
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        join: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
    },
}));

describe("design-dashboard-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDesignStats", () => {
        it("should return success and stats when database calls succeed", async () => {
            // Mock individual select calls to return an array (since we destructure it)
            const mockResult = [{ count: 5, avgMinutes: 10 }];

            vi.mocked(db.select).mockImplementation(() => ({
                from: vi.fn().mockImplementation(() => ({
                    where: vi.fn().mockResolvedValue(mockResult),
                    orderBy: vi.fn().mockReturnThis(),
                    limit: vi.fn().mockReturnThis(),
                    // Handle cases where .where() is not called (like totalDesigns)
                    then: (resolve: (arg: typeof mockResult) => void) => resolve(mockResult),
                })),
            } as unknown as ReturnType<typeof db.select>));

            const result = await getDesignStats();

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.inQueue).toBe(5);
        });

        it("should return error when database call fails", async () => {
            vi.mocked(db.select).mockImplementation(() => {
                throw new Error("DB Error");
            });

            const result = await getDesignStats();

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
