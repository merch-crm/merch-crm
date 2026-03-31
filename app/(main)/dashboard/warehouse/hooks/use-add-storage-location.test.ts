import { renderHook, act } from '@testing-library/react';
import { useAddStorageLocation } from './use-add-storage-location';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addStorageLocation } from '../storage-actions';

// Mock the server action
vi.mock('../storage-actions', () => ({
    addStorageLocation: vi.fn(),
}));

describe('useAddStorageLocation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAddStorageLocation());

        expect(result.current.isOpen).toBe(false);
        expect(result.current.error).toBe("");
        expect(result.current.fieldErrors).toEqual({});
        expect(result.current.responsibleUserId).toBe("");
        expect(result.current.type).toBe("warehouse");
        expect(result.current.isDefault).toBe(false);
        expect(result.current.isPending).toBe(false);
    });

    it('should respect controlled isOpen prop', () => {
        const { result } = renderHook(() => useAddStorageLocation({ controlledIsOpen: true }));
        expect(result.current.isOpen).toBe(true);
    });

    it('should toggle isOpen state', () => {
        const { result } = renderHook(() => useAddStorageLocation());

        act(() => {
            result.current.setIsOpen(true);
        });
        expect(result.current.isOpen).toBe(true);

        act(() => {
            result.current.setIsOpen(false);
        });
        expect(result.current.isOpen).toBe(false);
    });

    it('should call onOpenChange when provided', () => {
        const onOpenChange = vi.fn();
        const { result } = renderHook(() => useAddStorageLocation({ onOpenChange }));

        act(() => {
            result.current.setIsOpen(true);
        });
        expect(onOpenChange).toHaveBeenCalledWith(true);
        // Should not change internal state if onOpenChange is provided (component logic)
        expect(result.current.isOpen).toBe(false);
    });

    it('should clear specific field error', () => {
        const { result } = renderHook(() => useAddStorageLocation());

        const formData = new FormData();
        // Trigger validation error
        act(() => {
            result.current.handleSubmit(formData);
        });
        expect(result.current.fieldErrors.name).toBeDefined();

        act(() => {
            result.current.clearFieldError("name");
        });
        expect(result.current.fieldErrors.name).toBe("");
    });

    it('should validate name and address in handleSubmit', async () => {
        const { result } = renderHook(() => useAddStorageLocation());

        const formData = new FormData();
        await act(async () => {
            await result.current.handleSubmit(formData);
        });

        expect(result.current.fieldErrors.name).toBe("Введите название склада");
        expect(result.current.fieldErrors.address).toBe("Введите полный адрес");
        expect(addStorageLocation).not.toHaveBeenCalled();
    });

    it('should show error on short name or address', async () => {
        const { result } = renderHook(() => useAddStorageLocation());

        const formData = new FormData();
        formData.append("name","a");
        formData.append("address","123");

        await act(async () => {
            await result.current.handleSubmit(formData);
        });

        expect(result.current.fieldErrors.name).toBe("Введите название склада");
        expect(result.current.fieldErrors.address).toBe("Введите полный адрес");
    });

    it('should handle successful submission', async () => {
        vi.mocked(addStorageLocation).mockResolvedValue({ success: true, data: undefined } as unknown as any); // eslint-disable-line @typescript-eslint/no-explicit-any
        const { result } = renderHook(() => useAddStorageLocation());

        // Set state that should be reset
        act(() => {
            result.current.setIsOpen(true);
            result.current.setResponsibleUserId("user-1");
            result.current.setType("office");
        });

        const formData = new FormData();
        formData.append("name","Valid Name");
        formData.append("address","Valid City, Street 123");

        await act(async () => {
            await result.current.handleSubmit(formData);
        });

        expect(addStorageLocation).toHaveBeenCalled();
        expect(result.current.isOpen).toBe(false);
        expect(result.current.error).toBe("");
        expect(result.current.responsibleUserId).toBe("");
        expect(result.current.type).toBe("warehouse");
        expect(result.current.isPending).toBe(false);
    });

    it('should handle failed submission', async () => {
        vi.mocked(addStorageLocation).mockResolvedValue({ success: false, error:"Server Error" });
        const { result } = renderHook(() => useAddStorageLocation());

        // Open first
        act(() => {
            result.current.setIsOpen(true);
        });

        const formData = new FormData();
        formData.append("name","Valid Name");
        formData.append("address","Valid City, Street 123");

        await act(async () => {
            await result.current.handleSubmit(formData);
        });

        expect(result.current.error).toBe("Server Error");
        expect(result.current.isOpen).toBe(true); // Should stay open
        expect(result.current.isPending).toBe(false);
    });
});
