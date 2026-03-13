import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductionTasks, createProductionTask } from "../task-actions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Real-looking UUIDs (must be hoisted or defined inside mock factories)

// Mock auth
vi.mock("@/lib/auth", () => ({
    getSession: vi.fn().mockResolvedValue({
        id: "550e8400-e29b-41d4-a716-446655440000",
        user: { id: "550e8400-e29b-41d4-a716-446655440000", name: "Test User" }
    }),
}));

// Mock db
vi.mock("@/lib/db", () => {
    const TASK_ID = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
    const USER_ID = "550e8400-e29b-41d4-a716-446655440000";

    const mockInsert = vi.fn().mockImplementation(() => ({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([{ id: TASK_ID, title: "Test Task" }]),
        then: vi.fn().mockImplementation((resolve) => resolve([{ id: TASK_ID, title: "Test Task" }])),
    }));

    return {
        db: {
            query: {
                productionTasks: {
                    findMany: vi.fn().mockResolvedValue([]),
                    findFirst: vi.fn().mockResolvedValue({ id: TASK_ID, number: "TASK-2026-00001", title: "Existing Task" }),
                },
                productionStaff: {
                    findFirst: vi.fn().mockResolvedValue({ id: USER_ID }),
                },
            },
            insert: mockInsert,
            transaction: vi.fn((cb) => cb({
                insert: mockInsert,
            })),
        }
    };
});

// Mock next/cache
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

// Mock internal helper
vi.mock("../task-actions", async () => {
    const actual = await vi.importActual<Record<string, unknown>>("../task-actions");
    return {
        ...actual,
        generateTaskNumber: vi.fn().mockResolvedValue("TASK-2026-00001"),
    };
});

describe("production task-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProductionTasks", () => {
        it("should return success and tasks when database calls succeed", async () => {
            const TASK_ID = "6ba7b814-9dad-11d1-80b4-00c04fd430c8";
            const mockTasks = [{ id: TASK_ID, title: "Test Task" }];
            vi.mocked(db.query.productionTasks.findMany).mockResolvedValue(mockTasks as never);

            const result = await getProductionTasks();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockTasks);
        });
    });

    describe("createProductionTask", () => {
        it("should create a task and return success", async () => {
            const ORDER_ID = "6ba7b812-9dad-11d1-80b4-00c04fd430c8";
            const LINE_ID = "6ba7b810-9dad-11d1-80b4-00c04fd430c8";
            const APP_TYPE_ID = "6ba7b811-9dad-11d1-80b4-00c04fd430c8";

            const result = await createProductionTask({
                orderId: ORDER_ID,
                name: "New Task",
                quantity: 10,
                lineId: LINE_ID,
                applicationTypeId: APP_TYPE_ID,
                priority: "normal",
            });

            if (!result.success) {
                console.error("Test failed with error:", result.error);
            }

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(revalidatePath).toHaveBeenCalled();
        });
    });
});
