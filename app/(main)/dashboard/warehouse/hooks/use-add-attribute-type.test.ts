import { renderHook, act } from '@testing-library/react';
import { useAddAttributeType, transliterateToSlug } from './use-add-attribute-type';
import { useSearchParams, useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { createInventoryAttributeType } from '../attributes/actions/type.actions';
import { playSound } from '@/lib/sounds';
import type { Category } from '@/lib/types';

// Mocks
vi.mock('next/navigation', () => ({
    useSearchParams: vi.fn(),
    useRouter: vi.fn()
}));

vi.mock('@/components/ui/toast', () => ({
    useToast: vi.fn()
}));

vi.mock('../attributes/actions/type.actions', () => ({
    createInventoryAttributeType: vi.fn()
}));

vi.mock('@/lib/sounds', () => ({
    playSound: vi.fn()
}));

const mockCategories: Category[] = [
    { id: 'cat1', name: 'Одежда' } as Category,
    { id: 'cat2', name: 'Обувь' } as Category
];

describe('transliterateToSlug', () => {
    it('correctly transliterates Russian to Latin', () => {
        expect(transliterateToSlug('Тест')).toBe('test');
        expect(transliterateToSlug('Цвет 123')).toBe('tsvet_123');
        expect(transliterateToSlug('Щука-рыба')).toBe('schuka-ryba');
        expect(transliterateToSlug('АБВ')).toBe('abv');
    });

    it('ignores special characters and leaves numbers/dashes', () => {
        expect(transliterateToSlug('Размер (US)')).toBe('razmer_us'); // parentheses removed
    });
});

describe('useAddAttributeType', () => {
    const mockRefresh = vi.fn();
    const mockToast = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();

        (useRouter as ReturnType<typeof vi.fn>).mockReturnValue({ refresh: mockRefresh });
        (useToast as ReturnType<typeof vi.fn>).mockReturnValue({ toast: mockToast });

        const mockSearchParams = new URLSearchParams();
        (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValue(mockSearchParams);
    });

    it('initializes with default values', () => {
        const { result } = renderHook(() => useAddAttributeType({ categories: mockCategories }));
        expect(result.current.dataTypes).toEqual([]);
        expect(result.current.activeCategoryId).toBe('cat1'); // Default to first category
        expect(result.current.isOpen).toBe(false);
    });

    it('dataTypes updates automatically when toggleDataType changes', () => {
        const { result } = renderHook(() => useAddAttributeType({ categories: mockCategories }));

        act(() => {
            result.current.toggleDataType('color');
        });

        expect(result.current.dataTypes).toEqual(['color']);
    });

    it('handleOpen resets state properly', () => {
        const { result } = renderHook(() => useAddAttributeType({ categories: mockCategories }));

        act(() => {
            result.current.toggleDataType('dimensions');
            result.current.setHasColor(true);
            result.current.handleOpen();
        });

        expect(result.current.isOpen).toBe(true);
        expect(result.current.dataTypes).toEqual([]); // reset to default empty array
        expect(result.current.hasColor).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('handleCreate fails without any dataTypes selected', async () => {
        (createInventoryAttributeType as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });

        const { result } = renderHook(() => useAddAttributeType({ categories: mockCategories }));

        await act(async () => {
            await result.current.handleCreate();
        });

        expect(result.current.error).toBe('Выберите хотя бы один тип данных');
        expect(createInventoryAttributeType).not.toHaveBeenCalled();
    });

    it('handleCreate succeeds and calls router.refresh()', async () => {
        (createInventoryAttributeType as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });

        const { result } = renderHook(() => useAddAttributeType({ categories: mockCategories }));

        act(() => {
            result.current.toggleDataType('material');
            result.current.setActiveCategoryId('cat2');
        });

        await act(async () => {
            await result.current.handleCreate();
        });

        expect(createInventoryAttributeType).toHaveBeenCalledWith({
            name: 'Материал',
            slug: 'material',
            category: 'cat2',
            isSystem: false,
            dataType: 'material',
            hasColor: false,
            hasUnits: false,
            hasComposition: false
        });

        expect(mockToast).toHaveBeenCalledWith('Новый раздел создан', 'success');
        expect(playSound).toHaveBeenCalledWith('notification_success');
        expect(result.current.isOpen).toBe(false);
        expect(mockRefresh).toHaveBeenCalled();
    });

    it('handleCreate fails and shows error toast', async () => {
        vi.mocked(createInventoryAttributeType).mockReset();
        vi.mocked(createInventoryAttributeType).mockResolvedValue({ success: false, error: 'Database error' });

        const { result } = renderHook(() => useAddAttributeType({ categories: mockCategories }));

        act(() => {
            result.current.toggleDataType('text');
        });

        await act(async () => {
            await result.current.handleCreate();
        });

        expect(createInventoryAttributeType).toHaveBeenCalled();
        expect(mockToast).toHaveBeenCalledWith('Database error', 'error');
        expect(playSound).toHaveBeenCalledWith('notification_error');
    });
});
