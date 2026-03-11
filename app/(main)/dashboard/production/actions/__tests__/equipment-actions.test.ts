import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEquipment, createEquipment } from "../equipment-actions";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// Mock auth
vi.mock("@/lib/auth", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", user: { id: "user-1", name: "Test User" } }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(() => ({
            from: vi.fn(() => ({
                where: vi.fn(() => ({
                    orderBy: vi.fn().mockResolvedValue([{ id: "eq-1", name: "Printer 1" }]),
                })),
                orderBy: vi.fn().mockResolvedValue([{ id: "eq-1", name: "Printer 1" }]),
            })),
        })),
        query: {
            equipment: {
                findFirst: vi.fn(),
            },
        },
        insert: vi.fn(() => ({
            values: vi.fn(() => ({
                returning: vi.fn().mockResolvedValue([{ id: "eq-1", name: "Printer 1" }]),
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

describe("equipment-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getEquipment", () => {
        it("should return success and equipment", async () => {
            const result = await getEquipment();
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });
    });

    describe("createEquipment", () => {
        it("should create an equipment and return success", async () => {
            (db.query.equipment.findFirst as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(null);

            const result = await createEquipment({
                name: "New Printer",
                code: "PRN-001",
                category: "printer",
            });

            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
            expect(revalidatePath).toHaveBeenCalled();
        });
    });
});
