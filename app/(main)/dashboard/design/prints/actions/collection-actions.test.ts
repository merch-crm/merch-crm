import { describe, it, expect, vi, beforeEach } from "vitest";

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockSelect, mockInsert, mockUpdate, mockDelete } = vi.hoisted(() => {
    const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        as: vi.fn().mockReturnThis(),
        then: vi.fn(function (this: unknown, resolve: (val: unknown) => void) {
            return Promise.resolve((this as { _results?: unknown[] })._results || []).then(resolve);
        }),
    };

    const mockSelect = vi.fn(() => mockQuery);
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
    return { mockSelect, mockInsert, mockUpdate, mockDelete, mockQuery };
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

            // @ts-expect-error -- mockQuery._results is a test-only property not in the type
            mockSelect()._results = [];
            // We need to mock the implementation of orderBy to return a Promise for await
            vi.spyOn(mockSelect(), 'orderBy').mockImplementation(() => Promise.resolve([]) as never);

            const result = await getCollections();
            if (!result.success) {
                console.error("DEBUG: getCollections failure:", result.error);
                throw new Error("Expected success but got error: " + result.error);
            }
            expect(result.data).toEqual([]);
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
