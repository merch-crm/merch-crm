import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductionStats, getTasksByLine, getUrgentProductionTasks } from "../production-dashboard-actions";


// Mock db
vi.mock("@/lib/db", () => {
    const data = [{
        id: "00000000-0000-0000-0000-000000000001",
        number: "TASK-1",
        title: "Test",
        status: "pending",
        priority: "normal",
        quantity: 10,
        completedQuantity: 0,
        lineId: "00000000-0000-0000-0000-000000000002",
        assigneeId: "00000000-0000-0000-0000-000000000001",
        dueDate: new Date(),
        createdAt: new Date(),
        count: 10,
        totalQuantity: 100
    }];

    const mockChain: unknown = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((resolve) => resolve(data)),
        [Symbol.iterator]: function* () { yield* data; },
        map: vi.fn().mockImplementation((fn) => data.map(fn)),
        length: data.length,
    };

    return {
        db: {
            select: vi.fn().mockReturnValue(mockChain),
            query: {
                orderItems: {
                    findMany: vi.fn().mockResolvedValue([]),
                },
                productionLines: {
                    findFirst: vi.fn().mockResolvedValue({ id: "00000000-0000-0000-0000-000000000002", name: "Line 1" }),
                },
            },
        }
    };
});

describe("production-dashboard-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProductionStats", () => {
        it("should return success and stats", async () => {
            const result = await getProductionStats();
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.inQueue).toBe(10);
        });
    });

    describe("getTasksByLine", () => {
        it("should return success and line data", async () => {
            const result = await getTasksByLine();
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
    });

    describe("getUrgentProductionTasks", () => {
        it("should return success and tasks", async () => {
            const result = await getUrgentProductionTasks();
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data![0].taskNumber).toBe("TASK-1");
        });
    });
});
