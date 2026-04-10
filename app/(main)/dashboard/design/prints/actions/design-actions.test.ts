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

const VALID_COLLECTION_ID = "123e4567-e89b-12d3-a456-426614174001";

describe("Design Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createDesign", () => {
    it("should return error if not authorized", async () => {
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { createDesign } = await import("./design-actions");
      const result = await createDesign({
        collectionId: VALID_COLLECTION_ID,
        name: "Test Design",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Не авторизован");
      }
    });

    it("should validate uuid for collectionId", async () => {
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });

      const { createDesign } = await import("./design-actions");
      const result = await createDesign({
        collectionId: "not-a-uuid",
        name: "Test",
      });

      expect(result.success).toBe(false);
    });

    it("should return error if collection not found", async () => {
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue({ id: "user-1" });

      (db.select as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const { createDesign } = await import("./design-actions");
      const result = await createDesign({
        collectionId: VALID_COLLECTION_ID,
        name: "Test Design",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBe("Коллекция не найден");
      }
    });
  });

  describe("deleteDesign", () => {
    it("should return error if not authorized", async () => {
      (getSession as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { deleteDesign } = await import("./design-actions");
      const result = await deleteDesign(VALID_COLLECTION_ID);

      expect(result.success).toBe(false);
    });
  });
});
