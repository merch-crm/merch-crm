import { renderHook, act, waitFor } from '@testing-library/react';
import { useCategoryDetail } from './use-category-detail';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useRouter, useSearchParams } from 'next/navigation';
import { getInventoryCategories, deleteInventoryCategory } from '../../../category-actions';
import { deleteInventoryItems, archiveInventoryItems } from '../../../bulk-actions';
import { getItemStocks } from '../../../stock-actions';
import { useBreadcrumbs } from '@/components/layout/breadcrumbs-context';

// Mocks
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
    useSearchParams: vi.fn(),
}));

vi.mock('@/components/ui/toast', () => ({
    useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/lib/sounds', () => ({
    playSound: vi.fn(),
}));

vi.mock('@/components/layout/breadcrumbs-context', () => ({
    useBreadcrumbs: vi.fn(),
}));

vi.mock('../../../bulk-actions', () => ({
    deleteInventoryItems: vi.fn(),
    archiveInventoryItems: vi.fn(),
}));

vi.mock('../../../category-actions', () => ({
    getInventoryCategories: vi.fn(),
    deleteInventoryCategory: vi.fn(),
}));

vi.mock('../../../stock-actions', () => ({
    getItemStocks: vi.fn(),
}));

const mockCategory: any = { id: 'cat-1', name: 'Одежда' };
const mockItems: any[] = [
    { id: 'item-1', name: 'Футболка' },
    { id: 'item-2', name: 'Худи' },
];

describe('useCategoryDetail', () => {
    const mockPush = vi.fn();
    const mockRefresh = vi.fn();
    const mockSetCustomTrail = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useRouter as any).mockReturnValue({ push: mockPush, refresh: mockRefresh });
        (useSearchParams as any).mockReturnValue(new URLSearchParams());
        (useBreadcrumbs as any).mockReturnValue({ setCustomTrail: mockSetCustomTrail });
        (getInventoryCategories as any).mockResolvedValue({ success: true, data: [] });
    });

    it('initializes state correctly', () => {
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        expect(result.current.ui.mounted).toBe(true);
        expect(result.current.subCategories).toEqual([]);
        expect(result.current.filters.search).toBe("");
    });

    it('sets breadcrumbs on mount', () => {
        renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));
        expect(mockSetCustomTrail).toHaveBeenCalledWith([
            { label: "Склад", href: "/dashboard/warehouse" },
            { label: "Одежда", href: "/dashboard/warehouse/categories/cat-1" }
        ]);
    });

    it('toggles item selection', () => {
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        act(() => {
            result.current.toggleSelectItem('item-1');
        });
        expect(result.current.ui.selectedIds).toContain('item-1');

        act(() => {
            result.current.toggleSelectItem('item-1');
        });
        expect(result.current.ui.selectedIds).not.toContain('item-1');
    });

    it('toggles select all', () => {
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        act(() => {
            result.current.toggleSelectAll();
        });
        expect(result.current.ui.selectedIds).toHaveLength(2);
        expect(result.current.ui.selectedIds).toContain('item-1');
        expect(result.current.ui.selectedIds).toContain('item-2');

        act(() => {
            result.current.toggleSelectAll();
        });
        expect(result.current.ui.selectedIds).toHaveLength(0);
    });

    it('updates URL when filters change', async () => {
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        act(() => {
            result.current.setFilters(prev => ({ ...prev, search: "test" }));
        });

        // Effect runs to update URL
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalled();
        });
    });

    it('handles item deletion', async () => {
        (deleteInventoryItems as any).mockResolvedValue({ success: true });
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        await act(async () => {
            await result.current.handleDeleteItems(['item-1']);
        });

        expect(deleteInventoryItems).toHaveBeenCalledWith(['item-1']);
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('handles category deletion', async () => {
        (deleteInventoryCategory as any).mockResolvedValue({ success: true });
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        await act(async () => {
            await result.current.handleDeleteCategory('cat-1');
        });

        expect(deleteInventoryCategory).toHaveBeenCalledWith('cat-1');
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('fetches stocks when opening adjust dialog', async () => {
        const mockStocks = [{ storageLocationId: 'loc-1', quantity: 10 }];
        (getItemStocks as any).mockResolvedValue({ success: true, data: mockStocks });
        const { result } = renderHook(() => useCategoryDetail(mockCategory, undefined, [], mockItems));

        await act(async () => {
            await result.current.handleOpenAdjust(mockItems[0]);
        });

        expect(getItemStocks).toHaveBeenCalledWith('item-1');
        expect(result.current.dialogs.adjust.isOpen).toBe(true);
        expect(result.current.dialogs.adjust.stocks).toEqual(mockStocks);
    });
});
