import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession, createMockExpense } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockFindMany, mockFindFirst, mockSelect, mockTx } = vi.hoisted(() => {
    const mockFindMany = vi.fn();
    const mockFindFirst = vi.fn();
    const mockSelect = vi.fn();
    const mockTx = {
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    };
    return { mockFindMany, mockFindFirst, mockSelect, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/promocodes', () => ({
    validatePromocode: vi.fn().mockResolvedValue({ isValid: true, discount: 100, promo: { code: 'TEST10' }, message: 'Скидка 10%' }),
}));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        query: {
            orders: { findMany: mockFindMany, findFirst: mockFindFirst },
            payments: { findMany: mockFindMany },
            expenses: { findMany: mockFindMany },
            users: { findMany: mockFindMany },
            inventoryTransactions: { findMany: mockFindMany },
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
    getFinancialStats,
    createExpense,
    getFinanceTransactions,
    getPLReport,
    validatePromocode,
} from '@/app/(main)/dashboard/finance/actions';

// ─── Tests ────────────────────────────────────────────────────────────────────

const setupMocks = () => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation((async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as any);
    vi.mocked(db.update).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) } as any);
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as any);
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as any);
    mockTx.update.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockTx.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
};

describe('getFinancialStats', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getFinancialStats();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку если нет прав (не Администратор/Руководство)', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Менеджер' }));
        const result = await getFinancialStats();
        expect(result).toEqual({ success: false, error: 'Доступ запрещен' });
    });

    it('возвращает финансовую статистику для Администратора', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession({ roleName: 'Администратор' }));
        const summaryResult = [{ totalRevenue: 100000, orderCount: 10, avgOrderValue: 10000 }];
        const dailyResult = [{ date: '2026-01-01', revenue: 100000, count: 10 }];
        const categoryResult = [{ category: 'Одежда', revenue: 100000, count: 10 }];
        const cogsResult = [{ totalCOGSCost: 50000 }];
        const recentResult = [{ id: 'o1', client: { lastName: 'Иванов', firstName: 'Иван', name: null }, totalAmount: 10000, createdAt: new Date(), status: 'done', category: 'Одежда' }];

        let callCount = 0;
        mockSelect.mockImplementation(() => {
            callCount++;
            if (callCount === 1) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(summaryResult) }) }) };
            if (callCount === 2) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ groupBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(dailyResult) }) }) }) };
            if (callCount === 3) return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ groupBy: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(categoryResult) }) }) }) };
            return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(cogsResult) }) }) };
        });
        mockFindMany.mockResolvedValueOnce(recentResult);

        const result = await getFinancialStats();
        expect(result.success).toBe(true);
    });
});

describe('createExpense', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await createExpense({ category: 'other', amount: 1000, description: 'Test' });
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await createExpense({ category: 'invalid-category', amount: -100 });
        expect(result.success).toBe(false);
    });

    it('создаёт расход при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const newExpense = createMockExpense();
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newExpense]) }),
        });
        const result = await createExpense({ category: 'other', amount: 1000, description: 'Test expense' });
        expect(result).toEqual({ success: true, data: newExpense });
    });

    it('возвращает ошибку при сбое БД', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const { db } = await import('@/lib/db');
        vi.mocked(db.transaction).mockRejectedValueOnce(new Error('DB error'));
        const result = await createExpense({ category: 'other', amount: 1000, description: 'Test' });
        expect(result).toEqual({ success: false, error: 'Ошибка при создании расхода' });
    });
});

describe('getFinanceTransactions', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getFinanceTransactions('payment');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает платежи при типе payment', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const payments = [{ id: 'p1', amount: '1000', createdAt: new Date() }];
        mockFindMany.mockResolvedValueOnce(payments);
        const result = await getFinanceTransactions('payment');
        expect(result).toEqual({ success: true, data: payments });
    });

    it('возвращает расходы при типе expense', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const expenses = [createMockExpense()];
        mockFindMany.mockResolvedValueOnce(expenses);
        const result = await getFinanceTransactions('expense');
        expect(result).toEqual({ success: true, data: expenses });
    });
});

describe('getPLReport', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await getPLReport();
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает P&L отчёт', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        let callCount = 0;
        mockSelect.mockImplementation(() => {
            callCount++;
            const values = [{ total: callCount === 1 ? 100000 : callCount === 2 ? 40000 : 20000 }];
            return { from: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue(values) }) }) };
        });

        const result = await getPLReport();
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data.totalRevenue).toBe(100000);
            expect(result.data.totalCOGS).toBe(40000);
            expect(result.data.grossProfit).toBe(60000);
            expect(result.data.netProfit).toBe(40000);
        }
    });
});

describe('validatePromocode', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await validatePromocode('TEST10', 1000);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает данные промокода при успешной валидации', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await validatePromocode('TEST10', 1000);
        expect(result.success).toBe(true);
    });

    it('возвращает ошибку при невалидном промокоде', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const { validatePromocode: validatePromoLib } = await import('@/lib/promocodes');
        vi.mocked(validatePromoLib).mockResolvedValueOnce({ isValid: false, error: 'Промокод не найден', discount: 0, promo: null, message: '' });
        const result = await validatePromocode('INVALID', 1000);
        expect(result).toEqual({ success: false, error: 'Промокод не найден' });
    });
});
