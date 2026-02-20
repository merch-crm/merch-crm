import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '@/lib/db';
import { mockSession } from '../helpers/mocks';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockSelect, mockTx } = vi.hoisted(() => {
    const mockSelect = vi.fn();
    const mockTx = {
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    };
    return { mockSelect, mockTx };
});

// ─── Module mocks ─────────────────────────────────────────────────────────────

vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

vi.mock('@/lib/db', () => ({
    db: {
        select: mockSelect,
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
        transaction: vi.fn().mockImplementation(async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)),
    },
}));

import { getSession } from '@/lib/auth';
import {
    getPromocodes,
    createPromocode,
    updatePromocode,
    togglePromocodeActive,
    bulkCreatePromocodes,
    deletePromocode,
} from '@/app/(main)/dashboard/finance/promocodes/actions';

// ─── Setup ────────────────────────────────────────────────────────────────────

const validPromocodeData = {
    code: 'SUMMER10',
    discountType: 'percentage' as const,
    value: 10,
};

const setupMocks = () => {
    vi.clearAllMocks();
    vi.mocked(db.transaction).mockImplementation(
        (async (fn: (tx: typeof mockTx) => Promise<unknown>) => fn(mockTx)) as never,
    );
    vi.mocked(db.insert).mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) } as never);
    vi.mocked(db.delete).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as never);
    mockTx.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) });
    mockTx.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
};

// ─── getPromocodes ────────────────────────────────────────────────────────────

describe('getPromocodes', () => {
    beforeEach(() => setupMocks());

    it('возвращает список промокодов', async () => {
        const promos = [{ id: 'p1', code: 'SUMMER10', discountType: 'percentage', value: '10' }];
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockResolvedValue(promos),
                }),
            }),
        });
        const result = await getPromocodes();
        expect(result).toEqual({ success: true, data: promos });
    });

    it('возвращает ошибку при сбое БД', async () => {
        mockSelect.mockReturnValue({
            from: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockReturnValue({
                    limit: vi.fn().mockRejectedValue(new Error('DB error')),
                }),
            }),
        });
        const result = await getPromocodes();
        expect(result.success).toBe(false);
    });
});

// ─── createPromocode ──────────────────────────────────────────────────────────

describe('createPromocode', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await createPromocode(validPromocodeData);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при слишком коротком коде', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await createPromocode({ code: 'AB', discountType: 'percentage', value: 10 });
        expect(result.success).toBe(false);
    });

    it('создаёт промокод при валидных данных', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const newPromo = { id: 'p1', code: 'SUMMER10' };
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newPromo]) }),
        });
        const result = await createPromocode(validPromocodeData);
        expect(result).toEqual({ success: true });
    });
});

// ─── updatePromocode ──────────────────────────────────────────────────────────

describe('updatePromocode', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await updatePromocode('p1-uuid', validPromocodeData);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('обновляет промокод', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await updatePromocode('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', {
            ...validPromocodeData, value: 15
        });
        expect(result).toEqual({ success: true });
    });
});

// ─── togglePromocodeActive ────────────────────────────────────────────────────

describe('togglePromocodeActive', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await togglePromocodeActive('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при невалидном UUID', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await togglePromocodeActive('not-a-uuid', true);
        expect(result.success).toBe(false);
    });

    it('деактивирует промокод', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await togglePromocodeActive('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
        expect(result).toEqual({ success: true });
    });
});

// ─── bulkCreatePromocodes ─────────────────────────────────────────────────────

describe('bulkCreatePromocodes', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await bulkCreatePromocodes(5, 'PROMO', validPromocodeData);
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при count > 100', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await bulkCreatePromocodes(101, 'PROMO', validPromocodeData);
        expect(result.success).toBe(false);
    });

    it('создаёт промокоды массово', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const generated = Array.from({ length: 3 }, (_, i) => ({ id: `p${i}`, code: `PROMO${i}` }));
        mockTx.insert.mockReturnValue({
            values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue(generated) }),
        });
        const result = await bulkCreatePromocodes(3, 'PROMO', validPromocodeData);
        expect(result.success).toBe(true);
        if (result.success && result.data) {
            expect(result.data.count).toBe(3);
        }
    });
});

// ─── deletePromocode ──────────────────────────────────────────────────────────

describe('deletePromocode', () => {
    beforeEach(() => setupMocks());

    it('возвращает ошибку если нет сессии', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(null);
        const result = await deletePromocode('p1');
        expect(result).toEqual({ success: false, error: 'Не авторизован' });
    });

    it('возвращает ошибку при пустом ID', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await deletePromocode('');
        expect(result).toEqual({ success: false, error: 'Некорректный ID' });
    });

    it('удаляет промокод', async () => {
        vi.mocked(getSession).mockResolvedValueOnce(mockSession());
        const result = await deletePromocode('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
        expect(result).toEqual({ success: true });
    });
});
