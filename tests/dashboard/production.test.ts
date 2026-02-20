import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    const mockFindFirst = vi.fn();
    const mockTx = {
        query: {
            orderItems: { findFirst: mockFindFirst },
            orders: { findMany: mockFindMany },
        },
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    };
    return { mockFindMany, mockFindFirst, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/production', () => ({ updateItemStage: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            orders: { findMany: mockFindMany, findFirst: mockFindFirst },
            orderItems: { findMany: mockFindMany, findFirst: mockFindFirst },
        },
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import {
    updateProductionStageAction,
    getProductionStats,
    getProductionItems,
    reportProductionDefect,
} from '@/app/(main)/dashboard/production/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as any);
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as any);
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) } as any);
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
};

describe('updateProductionStageAction', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updateProductionStageAction('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'print', 'in_progress');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидном UUID', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateProductionStageAction('not-a-uuid', 'print', 'in_progress');
        expect(result.success).toBe(false);
    });

    it('возвращает ошибку при невалидном этапе', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updateProductionStageAction('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'invalid-stage' as never, 'in_progress');
        expect(result.success).toBe(false);
    });

    it('обновляет этап производства при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockTx.query.orderItems.findFirst = vi.fn().mockResolvedValue({
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            orderId: '44444444-4444-4444-8444-444444444444',
            order: { id: '44444444-4444-4444-8444-444444444444', orderNumber: 'ORD-26-1000' },
        });
        const result = await updateProductionStageAction('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'print', 'done');
        expect(result).toEqual({ success: true });
    });
});

describe('getProductionStats', () => {
    beforeEach(() => setupMocks());

    it('возвращает нули если нет сессии (публичные данные)', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getProductionStats();
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data.active).toBe(0);
            expect(result.data.urgent).toBe(0);
        }
    });

    it('возвращает статистику производства', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindMany.mockResolvedValueOnce([
            { id: 'o1', status: 'production', priority: 'urgent' },
            { id: 'o2', status: 'production', priority: 'normal' },
        ]);
        const result = await getProductionStats();
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data.active).toBe(2);
            expect(result.data.urgent).toBe(1);
        }
    });
});

describe('getProductionItems', () => {
    beforeEach(() => setupMocks());

    it('возвращает пустой массив если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getProductionItems();
        expect(result).toEqual({ success: true, data: [] });
    });

    it('возвращает позиции производства', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindMany.mockResolvedValueOnce([
            {
                id: 'o1',
                status: 'production',
                orderNumber: 'ORD-26-1000',
                client: { name: 'Client' },
                priority: 'normal',
                attachments: [],
                items: [{ id: 'i1', name: 'Item 1' }],
            },
        ]);
        const result = await getProductionItems();
        expect(result.success).toBe(true);
        expect((result as { data: unknown[] }).data).toHaveLength(1);
    });
});

describe('reportProductionDefect', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await reportProductionDefect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 'Брак печати');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидных данных (отрицательное количество)', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await reportProductionDefect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', -1, 'Брак');
        expect(result.success).toBe(false);
    });

    it('возвращает ошибку если позиция не найдена', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockTx.query.orderItems.findFirst = vi.fn().mockResolvedValue(null);
        const result = await reportProductionDefect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 1, 'Брак печати');
        expect(result.success).toBe(false);
        expect((result as { error: string }).error).toContain('не найдена');
    });

    it('фиксирует брак при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockTx.query.orderItems.findFirst = vi.fn().mockResolvedValue({
            id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            inventoryId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            order: { orderNumber: 'ORD-26-1000' },
        });
        mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
        mockTx.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
        const result = await reportProductionDefect('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 2, 'Брак печати');
        expect(result).toEqual({ success: true });
    });
});
