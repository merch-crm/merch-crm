import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useProject } from "../use-project";
import * as projectActions from "../../actions/project-actions";

// Mock router
vi.mock("next/navigation", () => ({
    useRouter: vi.fn().mockImplementation(() => ({
        replace: vi.fn(),
    })),
}));

// Mock actions
vi.mock("../../actions/project-actions", () => ({
    getEditorProject: vi.fn(),
    createEditorProject: vi.fn(),
    updateEditorProject: vi.fn(),
    autoSaveProject: vi.fn(),
    saveEditorExport: vi.fn(),
}));

describe("useProject", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should load a project when projectId is provided", async () => {
        const mockProject = {
            id: "proj-123",
            name: "Test Project",
            width: 800,
            height: 600,
            canvasData: {},
            updatedAt: new Date(),
        };
        (projectActions.getEditorProject as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue({
            success: true,
            data: mockProject,
        });

        const { result } = renderHook(() => useProject({ projectId: "proj-123" }));

        expect(result.current.isLoading).toBe(true);
        expect(result.current.id).toBe("proj-123");

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.name).toBe("Test Project");
        expect(result.current.id).toBe("proj-123");
    });

    it("should update canvas data and track unsaved changes", async () => {
        const { result } = renderHook(() => useProject());

        expect(result.current.hasUnsavedChanges).toBe(false);

        act(() => {
            result.current.updateCanvasData({ objects: [] });
        });

        expect(result.current.hasUnsavedChanges).toBe(true);
    });

    it("should save a new project and update route", async () => {
        const mockProject = { id: "new-proj-id", name: "New Project" };
        (projectActions.createEditorProject as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue({
            success: true,
            data: mockProject,
        });

        const { result } = renderHook(() => useProject());

        let savedProject;
        await act(async () => {
            savedProject = await result.current.saveProject("New Project");
        });

        expect(savedProject).toEqual(mockProject);
        expect(result.current.id).toBe("new-proj-id");
        expect(result.current.hasUnsavedChanges).toBe(false);
    });
});
