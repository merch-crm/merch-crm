import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getDesignQueueStats } from "../sub-actions/stats-actions";
import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

// Mock the dependencies
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        execute: vi.fn(), // Drizzle can use execute or thenable for results
        then: vi.fn(), // To make it thenable
    },
}));

vi.mock("@/lib/session", () => ({
    getSession: vi.fn(),
}));

describe("getDesignQueueStats", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset the thenable mock to avoid hanging
        (db as unknown as { then: unknown }).then = undefined;
    });

    it("should return an error if the user is not authenticated", async () => {
        (getSession as Mock).mockResolvedValue(null);

        const result = await getDesignQueueStats();

        expect(result.success).toBe(false);
        expect(result.error).toBe("Необходима авторизация");
    });

    it("should return statistics if the user is authenticated", async () => {
        (getSession as Mock).mockResolvedValue({ id: "user-1" });

        // Mocking the database chain results by overriding 'then' for each call
        const mockDb = db as unknown as { then: Mock };
        
        // 1. statusCounts
        mockDb.then = vi.fn().mockImplementationOnce((onSuccess: (data: unknown) => void) => onSuccess([
            { status: "pending", count: 5 },
            { status: "in_progress", count: 3 },
            { status: "review", count: 2 },
            { status: "approved", count: 10 },
        ]));

        // 2. overdueCount
        mockDb.then.mockImplementationOnce((onSuccess: (data: unknown) => void) => onSuccess([{ count: 1 }]));

        // 3. myTasksCount
        mockDb.then.mockImplementationOnce((onSuccess: (data: unknown) => void) => onSuccess([{ count: 4 }]));

        // 4. completedTodayCount
        mockDb.then.mockImplementationOnce((onSuccess: (data: unknown) => void) => onSuccess([{ count: 2 }]));

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
