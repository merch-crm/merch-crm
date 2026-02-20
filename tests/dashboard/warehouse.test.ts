import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockSelect, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    const mockFindFirst = vi.fn();
    const mockSelect = vi.fn();
    const mockTx = {
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Test Item', sku: 'SKU-001' }]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        select: vi.fn().mockReturnValue({ from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }) }) }),
        query: {
            inventoryItems: { findFirst: mockFindFirst, findMany: mockFindMany },
            inventoryCategories: { findFirst: mockFindFirst },
        },
    };
    return { mockFindMany, mockFindFirst, mockSelect, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/redis', () => ({ invalidateCache: vi.fn() }));
vi.mock('@/lib/notifications', () => ({ checkItemStockAlerts: vi.fn() }));
vi.mock('@/app/(main)/dashboard/warehouse/actions-utils', () => ({
    getCategoryPath: vi.fn().mockResolvedValue('/uploads/warehouse'),
    saveFile: vi.fn().mockResolvedValue(null),
    getCategoryFullPath: vi.fn().mockResolvedValue('/uploads/warehouse'),
    isDescendant: vi.fn().mockResolvedValue(false),
    updateChildrenPaths: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('@/app/(main)/dashboard/warehouse/shared-utils', () => ({
    sanitizeFileName: vi.fn((name: string) => name),
}));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            inventoryItems: { findMany: mockFindMany, findFirst: mockFindFirst },
            inventoryCategories: { findMany: mockFindMany, findFirst: mockFindFirst },
            inventoryTransactions: { findMany: mockFindMany },
            orderItems: { findMany: mockFindMany },
        },
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        select: mockSelect,
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import {
    getInventoryItems,
    getInventoryItem,
    addInventoryItem,
} from '@/app/(main)/dashboard/warehouse/item-actions';
import {
    checkDuplicateItem,
} from '@/app/(main)/dashboard/warehouse/item-duplicate-actions';
import {
    getMeasurementUnits,
} from '@/app/(main)/dashboard/warehouse/warehouse-shared.actions';
import {
    getItemHistory,
    getItemActiveOrders,
} from '@/app/(main)/dashboard/warehouse/item-history.actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getInventoryItems', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает список товаров без фильтров', async () => {
        const items = [{ id: 'i1', name: 'Item 1', quantity: 10 }];
        mockFindMany.mockResolvedValueOnce(items);
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                where: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue([{ count: 1 }]),
                }),
            }),
        });
        const result = await getInventoryItems();
        expect(result.success).toBe(true);
    });

    it('возвращает ошибку при сбое БД', async () => {
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getInventoryItems();
        expect(result).toEqual({ success: false, error: 'Не удалось загрузить товары' });
    });
});

describe('getInventoryItem', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает ошибку при невалидном UUID', async () => {
        const result = await getInventoryItem('not-a-uuid');
        expect(result).toEqual({ success: false, error: 'Некорректный ID товара' });
    });

    it('возвращает товар при валидном UUID', async () => {
        const item = { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', name: 'Test Item', quantity: 10 };
        mockFindFirst.mockResolvedValueOnce(item);
        const result = await getInventoryItem('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result).toEqual({ success: true, data: item });
    });
});

describe('addInventoryItem', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const fd = new FormData();
        fd.append('name', 'Test Item');
        const result = await addInventoryItem(fd);
        expect(result).toEqual({ success: false, error: 'Недостаточно прав для добавления товаров' });
    });

    it('возвращает ошибку если роль не имеет прав', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Дизайнер' }));
        const fd = new FormData();
        fd.append('name', 'Test Item');
        const result = await addInventoryItem(fd);
        expect(result).toEqual({ success: false, error: 'Недостаточно прав для добавления товаров' });
    });

    it('возвращает ошибку при невалидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Склад' }));
        const fd = new FormData();
        fd.append('name', '');
        const result = await addInventoryItem(fd);
        expect(result.success).toBe(false);
    });
});

describe('checkDuplicateItem', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает null если нет дубликатов', async () => {
        mockFindMany.mockResolvedValueOnce([]);
        const result = await checkDuplicateItem('Unique Item Name');
        expect(result.duplicate).toBeNull();
    });

    it('находит дубликат по SKU', async () => {
        const existingItem = { id: 'i1', name: 'Existing Item', sku: 'SKU-001' };
        mockFindMany.mockResolvedValueOnce([existingItem]);
        mockFindFirst.mockResolvedValueOnce({ isArchived: false });
        const result = await checkDuplicateItem('New Item', 'SKU-001');
        expect(result.duplicate).toEqual(existingItem);
        expect(result.type).toBe('sku_exact');
    });
});

describe('getMeasurementUnits', () => {
    it('возвращает список единиц измерения', async () => {
        const result = await getMeasurementUnits();
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data).toHaveLength(4);
            expect(result.data.map(u => u.id)).toContain('шт.');
        }
    });
});

describe('getItemHistory', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает ошибку при невалидном UUID', async () => {
        const result = await getItemHistory('not-a-uuid');
        expect(result).toEqual({ success: false, error: 'Некорректный ID товара' });
    });

    it('возвращает историю товара', async () => {
        const history = [{ id: 't1', type: 'in', changeAmount: 10, createdAt: new Date() }];
        mockFindMany.mockResolvedValueOnce(history);
        const result = await getItemHistory('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result.success).toBe(true);
    });
});

describe('getItemActiveOrders', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает ошибку при невалидном UUID', async () => {
        const result = await getItemActiveOrders('not-a-uuid');
        expect(result).toEqual({ success: false, error: 'Некорректный ID товара' });
    });

    it('возвращает активные заказы товара (исключая cancelled/shipped)', async () => {
        const orderItems = [
            { id: 'oi1', order: { status: 'new' } },
            { id: 'oi2', order: { status: 'cancelled' } },
        ];
        mockFindMany.mockResolvedValueOnce(orderItems);
        const result = await getItemActiveOrders('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data).toHaveLength(1);
        }
    });
});
