import { describe, it, expect, vi, beforeEach } from "vitest";
import { getProductionLines, createProductionLine } from "../line-actions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock auth
vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", user: { id: "user-1", name: "Test User" } }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    groupBy: vi.fn().mockResolvedValue([{ status: "pending", count: 1 }]),
                })),
                groupBy: vi.fn().mockResolvedValue([{ status: "pending", count: 1 }]),
            })),
        })),
        query: {
            productionLines: {
                findMany: vi.fn(),
                findFirst: vi.fn(),
            },
        },
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([{ id: "line-1", name: "Line 1" }]),
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
        transaction: vi.fn((cb) => cb(db)),
    },
}));

// Mock next/cache
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

describe("line-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProductionLines", () => {
        it("should return success and lines with stats", async () => {
            const mockLines = [{ id: "line-1", name: "Line 1" }];
            (db.query.productionLines.findMany as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(mockLines);

            const result = await getProductionLines();

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(result.data![0].stats).toBeDefined();
        });
    });

    describe("createProductionLine", () => {
        it("should create a line and return success", async () => {
            (db.query.productionLines.findFirst as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(null);

            const result = await createProductionLine({
                name: "New Line",
                code: "L-001",
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(revalidatePath).toHaveBeenCalled();
        });
    });
});
