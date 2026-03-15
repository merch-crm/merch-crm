import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/db", () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        from: vi.fn(),
        where: vi.fn(),
        limit: vi.fn(),
    },
}));

vi.mock("@/lib/session", () => ({
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
}));

import { db } from "@/lib/db";
import { getSession } from "@/lib/session";

const VALID_DESIGN_ID = "123e4567-e89b-12d3-a456-426614174002";
const VALID_VERSION_ID = "123e4567-e89b-12d3-a456-426614174003";

describe("Version Actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("createVersion", () => {
        it("should return error if not authorized", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            const { createDesignVersion } = await import("./version-actions");
            const result = await createDesignVersion({
                designId: VALID_DESIGN_ID,
                name: "v1.0",
            });

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Не авторизован");
            }
        });

        it("should validate input with zod", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });

            const { createDesignVersion } = await import("./version-actions");
            const result = await createDesignVersion({
                designId: "not-a-uuid",
                name: "",
            });

            expect(result.success).toBe(false);
        });

        it("should return error if design not found", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });

            (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
                from: vi.fn().mockReturnThis(),
                where: vi.fn().mockReturnThis(),
                limit: vi.fn().mockResolvedValue([]),
            });

            const { createDesignVersion } = await import("./version-actions");
            const result = await createDesignVersion({
                designId: VALID_DESIGN_ID,
                name: "v1.0",
            });

            expect(result.success).toBe(false);
        });
    });

    describe("updateVersion", () => {
        it("should return error if not authorized", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            const { updateDesignVersion } = await import("./version-actions");
            const result = await updateDesignVersion(VALID_VERSION_ID, { name: "v2.0" });

            expect(result.success).toBe(false);
        });
    });

    describe("deleteVersion", () => {
        it("should return error if not authorized", async () => {
            (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

            const { deleteDesignVersion } = await import("./version-actions");
            const result = await deleteDesignVersion(VALID_VERSION_ID);

            expect(result.success).toBe(false);
        });
    });
});
