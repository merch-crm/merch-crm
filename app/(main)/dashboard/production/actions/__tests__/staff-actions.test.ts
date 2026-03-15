import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductionStaff, createProductionStaff, getProductionStaffById } from "../staff-actions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock auth
vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", name: "Test User" }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    groupBy: vi.fn().mockResolvedValue([{ status: "in_progress", count: 2 }]),
                })),
                groupBy: vi.fn().mockResolvedValue([{ status: "in_progress", count: 2 }]),
            })),
        })),
        query: {
            productionStaff: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            },
            productionTasks: {
                findMany: vi.fn(),
            }
        },
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([{ id: "staff-1", name: "John Doe" }]),
            })),
        })),
        update: vi.fn(() => ({
            set: vi.fn(() => ({
                where: vi.fn(() => ({
                    returning: vi.fn(),
                })),
            })),
        })),
        delete: vi.fn(() => ({
            where: vi.fn(),
        })),
    },
}));

// Mock next/cache
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("staff-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProductionStaff", () => {
        it("should return success and staff with stats", async () => {
            const mockStaff = [{ id: "staff-1", name: "John Doe", lineIds: [] }];
            (db.query.productionStaff.findMany as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(mockStaff);

            const result = await getProductionStaff();

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data![0].stats).toBeDefined();
        });
    });

    describe("getProductionStaffById", () => {
        it("should return success and member full data", async () => {
            const mockMember = { id: "staff-1", name: "John Doe" };
            (db.query.productionStaff.findFirst as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(mockMember);
            (db.query.productionTasks.findMany as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue([]);
            (db.select as unknown as { mockImplementation: (...args: unknown[]) => unknown }).mockImplementation(() => ({
                from: vi.fn().mockImplementation(() => ({
                    where: vi.fn().mockResolvedValue([{ count: 10 }]),
                }))
            }));

            const result = await getProductionStaffById("staff-1");
            expect(result.success).toBe(true);
            expect(result.data?.completedCount).toBe(10);
        });
    });

    describe("createProductionStaff", () => {
        it("should create staff and return success", async () => {
            const result = await createProductionStaff({
                name: "John Doe",
                email: "john@example.com",
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(revalidatePath).toHaveBeenCalled();
        });
    });
});
