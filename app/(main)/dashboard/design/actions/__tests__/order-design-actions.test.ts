import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getDesignQueueStats } from "../sub-actions/stats-actions";
import { db } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Mock the dependencies
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
    },
}));

vi.mock("@/lib/auth", () => ({
    getSession: vi.fn(),
}));

describe("getDesignQueueStats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should return an error if the user is not authenticated", async () => {
        (getSession as Mock).mockResolvedValue(null);

        const result = await getDesignQueueStats();

        expect(result.success).toBe(false);
        expect(result.error).toBe("Необходима авторизация");
    });

    it("should return statistics if the user is authenticated", async () => {
        (getSession as Mock).mockResolvedValue({ id: "user-1" });

        // Mocking the database chain results
        // 1. statusCounts
        (db.groupBy as Mock).mockResolvedValueOnce([
            { status: "pending", count: 5 },
            { status: "in_progress", count: 3 },
            { status: "review", count: 2 },
            { status: "approved", count: 10 },
        ]);

        // 2. overdueCount
        (db.where as Mock).mockResolvedValueOnce([{ count: 1 }]);

        // 3. myTasksCount
        (db.where as Mock).mockResolvedValueOnce([{ count: 4 }]);

        // 4. completedTodayCount
        (db.where as Mock).mockResolvedValueOnce([{ count: 2 }]);

        const result = await getDesignQueueStats();

        expect(result.success).toBe(true);
        expect(result.data).toBeDefined();
        if (result.success && result.data) {
            expect(result.data.total).toBe(20);
            expect(result.data.pending).toBe(5);
            expect(result.data.inProgress).toBe(3);
            expect(result.data.overdue).toBe(1);
            expect(result.data.myTasks).toBe(4);
            expect(result.data.completedToday).toBe(2);
        }
    });

    it("should return an error if database query fails", async () => {
        (getSession as Mock).mockResolvedValue({ id: "user-1" });
        (db.select as Mock).mockImplementationOnce(() => {
            throw new Error("DB Error");
        });

        const result = await getDesignQueueStats();

        expect(result.success).toBe(false);
        expect(result.error).toBe("Не удалось загрузить статистику");
    });
});
