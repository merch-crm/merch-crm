import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductionStats, getTasksByLine, getUrgentProductionTasks } from "../production-dashboard-actions";

// Mock db
vi.mock("@/lib/db", () => {
    const mockData = [
        {
            id: "00000000-0000-0000-0000-000000000001",
            number: "TASK-1",
            title: "Test Task",
            status: "pending",
            priority: "normal",
            quantity: 10,
            completedQuantity: 0,
            lineId: "00000000-0000-0000-0000-000000000002",
            assigneeId: null,
            dueDate: new Date(Date.now() + 86400000), // Tomorrow
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    const mockStats = {
        count: 1,
        quantity: 10
    };

    // Generic chain that works for all select/query styles in these actions
    const createChain = (data: any) => {
        const chain: any = {
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            innerJoin: vi.fn().mockReturnThis(),
            groupBy: vi.fn().mockReturnThis(),
            then: vi.fn().mockImplementation((resolve) => resolve(data)),
            // Support for [Symbol.iterator] if used by spreading etc.
            [Symbol.iterator]: function* () { yield* data; },
            map: (fn: any) => data.map(fn),
        };
        return chain;
    };

    const statsChain = createChain([mockStats]);
    const tasksChain = createChain(mockData);
    const linesChain = createChain([{
        id: "00000000-0000-0000-0000-000000000002",
        name: "Line 1",
        code: "L1",
        color: "#ff0000"
    }]);

    return {
        db: {
            select: vi.fn().mockImplementation((fields) => {
                // Heuristic to decide which chain to return
                if (fields && fields.count) return statsChain;
                if (fields && fields.id && fields.code) return linesChain;
                return tasksChain;
            }),
            from: vi.fn().mockReturnThis(),
            where: vi.fn().mockReturnThis(),
            orderBy: vi.fn().mockReturnThis(),
            limit: vi.fn().mockReturnThis(),
            query: {
                productionTasks: {
                    findMany: vi.fn().mockResolvedValue(mockData),
                },
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
        });
    });

    describe("getTasksByLine", () => {
        it("should return success and line data", async () => {
            const result = await getTasksByLine();
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data?.[0].tasksCount).toBe(1);
        });
    });

    describe("getUrgentProductionTasks", () => {
        it("should return success and tasks", async () => {
            const result = await getUrgentProductionTasks();
            if (!result.success) {
                console.error("Urgent tasks error:", result.error);
            }
            expect(result.success).toBe(true);
            expect(result.data).toHaveLength(1);
            expect(result.data![0].taskNumber).toBe("TASK-1");
        });
    });
});
