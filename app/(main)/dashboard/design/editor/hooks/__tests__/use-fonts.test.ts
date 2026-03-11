import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useFonts } from "../use-fonts";
import * as projectActions from "../../actions/project-actions";

// Mock the action
vi.mock("../../actions/project-actions", () => ({
    getSystemFonts: vi.fn(),
}));

// Mock FontFace and document.fonts
const mockAdd = vi.fn();
const mockLoad = vi.fn().mockResolvedValue(undefined);

const MockFontFace = vi.fn().mockImplementation(function (family: string, source: string, descriptors?: unknown) {
    return {
        load: mockLoad,
        family,
        source,
        descriptors
    };
});

vi.stubGlobal("FontFace", MockFontFace);

Object.defineProperty(document, "fonts", {
    value: {
        add: mockAdd,
    },
    configurable: true,
});

describe("useFonts", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should load fonts on mount", async () => {
        const mockFonts = [
            { id: "1", name: "Inter", family: "Inter", category: "sans-serif", regularPath: "/fonts/inter.woff2" },
        ];
        (projectActions.getSystemFonts as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue({
            success: true,
            data: mockFonts,
        });

        const { result } = renderHook(() => useFonts());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.fonts).toHaveLength(1);
        expect(result.current.fonts[0].family).toBe("Inter");
        expect(result.current.isFontLoaded("Inter")).toBe(true);
        expect(global.FontFace).toHaveBeenCalled();
        expect(mockAdd).toHaveBeenCalled();
    });

    it("should handle error when loading fonts fails", async () => {
        (projectActions.getSystemFonts as unknown as { mockResolvedValue: (...args: unknown[]) => unknown }).mockResolvedValue({
            success: false,
            error: "Failed to fetch",
        });

        const { result } = renderHook(() => useFonts());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.fonts).toHaveLength(0);
    });
});
