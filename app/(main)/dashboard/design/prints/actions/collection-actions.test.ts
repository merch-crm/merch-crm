import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockSelect, mockInsert, mockUpdate, mockDelete } = vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockInsert = vi.fn(() => ({
        values: vi.fn(() => ({
            returning: vi.fn(() => Promise.resolve([{ id: 'new-id' }]))
        }))
    }));
    const mockUpdate = vi.fn(() => ({
        set: vi.fn(() => ({
            where: vi.fn(() => ({
                returning: vi.fn(() => Promise.resolve([{ id: 'updated-id' }]))
            }))
        }))
    }));
    const mockDelete = vi.fn(() => ({
        where: vi.fn(() => Promise.resolve({ success: true }))
    }));
    return { mockSelect, mockInsert, mockUpdate, mockDelete };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock("@/lib/db", () => ({
    db: {
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
        transaction: vi.fn(async (fn) => fn({ update: mockUpdate })),
    },
}));

vi.mock("@/lib/auth", () => ({
    getSession: vi.fn(),
}));

vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({
    invalidateCache: vi.fn(),
}));

vi.mock("@/lib/audit", () => ({
    logAction: vi.fn(),
}));

vi.mock("@/lib/error-logger", () => ({
    logError: vi.fn(),
}));

vi.mock("@/lib/utils", () => ({
    generateId: vi.fn(() => "123e4567-e89b-12d3-a456-426614174000"),
    slugify: vi.fn((s) => s.toLowerCase()),
}));

import { getCollections, createCollection } from "./collection-actions";
import { getSession } from "@/lib/auth";
import { mockSession } from "@/tests/helpers/mocks";

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("Collection Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockSelect.mockReset();
    });

    describe("getCollections", () => {
        it("should return empty array when no collections", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: "user-1", roleName: "Администратор" }));

            const queryMock = {
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                orderBy: vi.fn().mockResolvedValue([]),
                then: vi.fn((onFullfilled) => Promise.resolve([]).then(onFullfilled)),
            };

            mockSelect.mockReturnValue(queryMock);

            const result = await getCollections();

            if (result.success) {
                expect(result.data).toEqual([]);
            } else {
                console.error("Result error:", result.error);
                throw new Error("Expected success");
            }
        });

        it("should return error if session is missing", async () => {
            vi.mocked(getSession).mockResolvedValue(null);

            const result = await getCollections();
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Не авторизован");
            }
        });
    });

    describe("createCollection", () => {
        it("should return error if not authorized", async () => {
            vi.mocked(getSession).mockResolvedValue(null);

            const result = await createCollection({ name: "Test" });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Не авторизован");
            }
        });

        it("should validate input with zod", async () => {
            vi.mocked(getSession).mockResolvedValue(mockSession({ id: "user-1", roleName: "Дизайнер" }));

            const result = await createCollection({ name: "" });

            expect(result.success).toBe(false);
        });
    });
});
