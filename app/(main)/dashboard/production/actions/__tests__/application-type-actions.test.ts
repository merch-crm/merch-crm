import { describe, it, expect, vi, beforeEach } from "vitest";
import { getApplicationTypes, createApplicationType } from "../application-type-actions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock auth
vi.mock("@/lib/auth", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", name: "Test User" }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn().mockResolvedValue([{ id: "type-1", name: "DTG" }]),
                })),
                orderBy: vi.fn().mockResolvedValue([{ id: "type-1", name: "DTG" }]),
            })),
        })),
        query: {
            applicationTypes: {
                findFirst: vi.fn(),
            },
        },
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([{ id: "type-1", name: "DTG" }]),
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

describe("application-type-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getApplicationTypes", () => {
        it("should return success and types", async () => {
            const result = await getApplicationTypes();
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
    });

    describe("createApplicationType", () => {
        it("should create a type and return success", async () => {
            (db.query.applicationTypes.findFirst as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(null);

            const result = await createApplicationType({
                name: "New Type",
                slug: "new-type",
                category: "print",
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(revalidatePath).toHaveBeenCalled();
        });
    });
});
