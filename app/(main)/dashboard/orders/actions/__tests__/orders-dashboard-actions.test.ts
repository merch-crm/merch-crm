import { describe, it, expect, vi, beforeEach } from "vitest";
import { getOrdersStats } from "../orders-dashboard-actions";
import { db } from "@/lib/db";

// Mock session
vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", name: "Test User", roleName: "Администратор" }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(),
    },
}));

describe("orders-dashboard-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getOrdersStats", () => {
        it("should return success and stats when database calls succeed", async () => {
            const mockResult = [{ count: 10, sum: 1000, avg: 100 }];

            vi.mocked(db.select).mockImplementation(() => ({
                from: vi.fn().mockImplementation(() => ({
                    where: vi.fn().mockResolvedValue(mockResult),
                    then: (resolve: (arg: typeof mockResult) => void) => resolve(mockResult),
                })),
            } as unknown as ReturnType<typeof db.select>));

            const result = await getOrdersStats();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toBeDefined();
                expect(result.data?.total).toBe(10);
                expect(result.data?.totalSales).toBe(1000);
            }
        });

        it("should return error when database call fails", async () => {
            vi.mocked(db.select).mockImplementation(() => {
                throw new Error("DB Error");
            });

            const result = await getOrdersStats();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Не удалось получить статистику");
            }
        });
    });
});
