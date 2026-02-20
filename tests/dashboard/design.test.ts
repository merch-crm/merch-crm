import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockOrder } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany } = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    return { mockFindMany };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            orders: { findMany: mockFindMany },
        },
    },
}));

import { getSession } from '@/lib/auth';
import {
    getDesignStats,
    getDesignOrders,
} from '@/app/(main)/dashboard/design/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('getDesignStats', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getDesignStats();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает статистику дизайна', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const designOrders = [
            createMockOrder({ status: 'design', priority: 'high' }),
            createMockOrder({ id: 'o2', status: 'design', priority: 'normal' }),
        ];
        mockFindMany.mockResolvedValueOnce(designOrders);
        const result = await getDesignStats();
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data.newTasks).toBe(2);
            expect(result.data.pendingApproval).toBe(1); // only 'high' priority
            expect(result.data.completed).toBe(24);
            expect(result.data.efficiency).toBe(95);
        }
    });

    it('возвращает ошибку при сбое БД', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getDesignStats();
        expect(result.success).toBe(false);
    });
});

describe('getDesignOrders', () => {
    beforeEach(() => vi.clearAllMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getDesignOrders();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидных параметрах', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        // page: 0 is invalid (must be positive)
        const result = await getDesignOrders({ page: 0 });
        expect(result.success).toBe(false);
    });

    it('возвращает список заказов в статусе design', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const orders = [
            createMockOrder({ status: 'design' }),
            createMockOrder({ id: 'o2', status: 'design' }),
        ];
        mockFindMany.mockResolvedValueOnce(orders);
        const result = await getDesignOrders({ page: 1, limit: 10 });
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data).toHaveLength(2);
        }
    });

    it('возвращает ошибку при сбое БД', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        mockFindMany.mockRejectedValueOnce(new Error('DB error'));
        const result = await getDesignOrders();
        expect(result.success).toBe(false);
    });
});
