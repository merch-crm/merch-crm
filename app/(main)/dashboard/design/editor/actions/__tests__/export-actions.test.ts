import { describe, it, expect, vi, beforeEach, Mock } from "vitest";
import { getProjectExports } from "../export-actions";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
    db: {
        query: {
            editorExports: {
                findMany: vi.fn(),
            },
        },
    },
}));

describe("export-actions", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe("getProjectExports", () => {
        it("should return exports for a valid UUID", async () => {
            const validId = "550e8400-e29b-41d4-a716-446655440000";
            const mockExports = [
                { id: "1", projectId: validId, filename: "test.png" },
            ];
            (db.query.editorExports.findMany as Mock).mockResolvedValue(mockExports);

            const result = await getProjectExports(validId);

            expect(result.success).toBe(true);
            expect(result.data).toEqual(mockExports);
        });

        it("should return error for invalid UUID", async () => {
            const result = await getProjectExports("invalid-id");

            expect(result.success).toBe(false);
            expect(result.error).toBe("Неверный ID проекта");
        });

        it("should return error on DB failure", async () => {
            const validId = "550e8400-e29b-41d4-a716-446655440000";
            (db.query.editorExports.findMany as Mock).mockRejectedValue(new Error("DB Error"));

            const result = await getProjectExports(validId);

            expect(result.success).toBe(false);
            expect(result.error).toBe("Не удалось загрузить экспорты");
        });
    });
});
