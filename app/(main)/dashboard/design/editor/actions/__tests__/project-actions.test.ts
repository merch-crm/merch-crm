import { describe, it, expect, vi, beforeEach } from "vitest";
import { getEditorProjects, createEditorProject } from "../project-actions";
import { db } from "@/lib/db";

import { revalidatePath } from "next/cache";

// Mock auth
vi.mock("@/lib/session", () => ({
  getSession: vi.fn().mockResolvedValue({ id: "user-1", name: "Test User" }),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    query: {
      editorProjects: {
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
    },
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(),
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

describe("project-actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getEditorProjects", () => {
    it("should return success and projects when database calls succeed", async () => {
      const mockProjects = [{ id: "proj-1", name: "Project 1" }];
      (db.query.editorProjects.findMany as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue(mockProjects);

      const result = await getEditorProjects();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProjects);
    });

    it("should return error when database call fails", async () => {
      (db.query.editorProjects.findMany as unknown as { mockRejectedValue: (...args: unknown[]) => unknown }).mockRejectedValue(new Error("DB Error"));

      const result = await getEditorProjects();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Не удалось загрузить проекты");
    });
  });

  describe("createEditorProject", () => {
    it("should create a project and return success", async () => {
      const mockProject = { id: "proj-1", name: "New Project" };
      const insertMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockProject]),
      });
      (db.insert as unknown as { mockReturnValue: (...args: unknown[]) => unknown }).mockReturnValue({ values: insertMock });

      const result = await createEditorProject({
        name: "New Project",
        width: 800,
        height: 600,
        canvasData: {},
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockProject);
      expect(revalidatePath).toHaveBeenCalledWith("/dashboard/design/editor");
    });

    it("should return error on validation failure", async () => {
      const result = await createEditorProject({
        name: "", // Invalid name
        width: 800,
        height: 600,
        canvasData: {},
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
