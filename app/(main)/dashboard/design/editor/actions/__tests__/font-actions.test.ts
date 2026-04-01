import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getSystemFonts } from "../font-actions";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            systemFonts: {
                findMany: vi.fn(),
            },
        },
    },
}));

vi.mock("@/lib/session", () => ({
    getSession: vi.fn().mockResolvedValue({ id: "user-1", name: "Test User", roleSlug: "admin" }),
}));

describe("font-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getSystemFonts", () => {
        it("should return fonts on success", async () => {
            const mockFonts = [
                { id: "1", name: "Inter", family: "Inter", isActive: true },
                { id: "2", name: "Roboto", family: "Roboto", isActive: true },
            ];
            (db.query.systemFonts.findMany as Mock).mockResolvedValue(mockFonts);

            const result = await getSystemFonts();

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockFonts);
        });

        it("should return error on failure", async () => {
            (db.query.systemFonts.findMany as Mock).mockRejectedValue(new Error("DB Error"));

            const result = await getSystemFonts();

            expect(result.success).toBe(false);
            expect(result.error).toBe("Не удалось загрузить шрифты");
        });
    });
});
