import { describe, it, expect, vi, beforeEach } from "vitest";
import { getDesignQueue } from "../sub-actions/task-actions";
import { db } from "@/lib/db";

// Mock auth
vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", name: "Test User" }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
    db: {
        query: {
            orderDesignTasks: {
                findMany: vi.fn(),
            },
        },
    },
}));

describe("task-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getDesignQueue", () => {
        it("should return success and tasks when database calls succeed", async () => {
            const mockTasks = [{ id: "task-1", title: "Test Task" }];
            (db.query.orderDesignTasks.findMany as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(mockTasks);

            const result = await getDesignQueue();

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data).toHaveLength(1);
            expect(result.data![0].title).toBe("Test Task");
        });

        it("should return error when database call fails", async () => {
            (db.query.orderDesignTasks.findMany as unknown as { mockRejectedValue: (...args: unknown[]) => unknown }).mockRejectedValue(new Error("DB Error"));

            const result = await getDesignQueue();

            expect(result.success).toBe(false);
            expect(result.error).toBeDefined();
        });
    });
});
