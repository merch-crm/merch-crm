import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getLoyaltyLevels,
    createLoyaltyLevel,
    updateLoyaltyLevel,
    toggleLoyaltyLevelActive,
    deleteLoyaltyLevel,
    reorderLoyaltyLevels,
    setClientLoyaltyLevel,
    recalculateAllClientsLoyalty
} from '@/app/(main)/dashboard/clients/actions/loyalty.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, txMock } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        delete: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        $dynamic: vi.fn().mockReturnThis(),
    };

    const queryMock = {
        loyaltyLevels: { findMany: vi.fn().mockResolvedValue([]) },
        clients: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const txMock = {
        update: vi.fn().mockReturnValue(chainable),
    };

    const mockDb = {
        query: queryMock,
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }) }),
        update: vi.fn().mockReturnValue(chainable),
        delete: vi.fn().mockReturnValue(chainable),
        transaction: vi.fn().mockImplementation(async (fn: any) => fn(txMock)),
    };

    return { mockDb, queryMock, txMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { logAction } from '@/lib/audit';
import { logError } from '@/lib/error-logger';
import { mockSession } from '../helpers/mocks';

describe('Loyalty Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as any);
        // Force session.role = "admin" to match what loyalty.actions.ts expects
        vi.mocked(getSession).mockResolvedValue({ role: 'admin' } as any);

        mockDb.insert().values().returning.mockResolvedValue([]);
        mockDb.update().set?.().where?.().returning?.mockResolvedValue([]);
    });

    describe('getLoyaltyLevels', () => {
        it('should return loyalty levels ordered by priority', async () => {
            const mockLevels = [
                { id: '1', levelName: 'Level 1', priority: 1 },
                { id: '2', levelName: 'Level 2', priority: 2 }
            ];
            queryMock.loyaltyLevels.findMany.mockResolvedValueOnce(mockLevels);

            const result = await getLoyaltyLevels();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(mockLevels);
            }
        });

        it('should return error on failure', async () => {
            queryMock.loyaltyLevels.findMany.mockRejectedValueOnce(new Error('DB Error'));

            const result = await getLoyaltyLevels();

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Не удалось загрузить уровни лояльности");
            }
            expect(logError).toHaveBeenCalled();
        });
    });

    describe('createLoyaltyLevel', () => {
        it('should create a new loyalty level if admin', async () => {
            const newLevel = { levelKey: 'gold', levelName: 'Gold', priority: 10 };
            const createdLevel = { id: 'uuid-123', ...newLevel };
            mockDb.insert().values().returning.mockResolvedValueOnce([createdLevel]);

            const result = await createLoyaltyLevel(newLevel as any);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(createdLevel);
            }
            expect(logAction).toHaveBeenCalledWith('create_loyalty_level', 'loyalty_level', 'uuid-123', newLevel);
            expect(revalidatePath).toHaveBeenCalled();
        });

        it('should deny access if not admin', async () => {
            vi.mocked(getSession).mockResolvedValueOnce({ role: 'manager' } as any);

            const result = await createLoyaltyLevel({} as any);

            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Access denied");
            }
        });
    });

    describe('updateLoyaltyLevel', () => {
        it('should update loyalty level if admin', async () => {
            const id = '55555555-5555-4555-8555-555555555555';
            const updates = { levelName: 'Updated Gold' };
            const updatedLevel = { id, ...updates };

            const chain = { set: vi.fn().mockReturnThis(), where: vi.fn().mockReturnThis(), returning: vi.fn().mockResolvedValueOnce([updatedLevel]) };
            vi.mocked(mockDb.update).mockReturnValueOnce(chain as any);

            const result = await updateLoyaltyLevel(id, updates);

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data).toEqual(updatedLevel);
            }
            expect(logAction).toHaveBeenCalledWith('loyalty_level_updated', 'loyalty_level', id, updates);
        });
    });

    describe('deleteLoyaltyLevel', () => {
        it('should delete loyalty level', async () => {
            const id = '55555555-5555-4555-8555-555555555555';
            const chain = { where: vi.fn().mockResolvedValueOnce(undefined) };
            vi.mocked(mockDb.delete).mockReturnValueOnce(chain as any);

            const result = await deleteLoyaltyLevel(id);

            expect(result.success).toBe(true);
            expect(logAction).toHaveBeenCalledWith('loyalty_level_deleted', 'loyalty_level', id);
        });
    });

    describe('reorderLoyaltyLevels', () => {
        it('should reorder levels in a transaction', async () => {
            const items = [
                { id: '55555555-5555-4555-8555-000000000001', priority: 1 },
                { id: '55555555-5555-4555-8555-000000000002', priority: 2 }
            ];

            const result = await reorderLoyaltyLevels(items);

            expect(result.success).toBe(true);
            expect(mockDb.transaction).toHaveBeenCalled();
        });
    });

    describe('recalculateAllClientsLoyalty', () => {
        it('should recalculate loyalty for clients without manual setting', async () => {
            const mockLevels = [
                { id: 'level-gold', minOrdersAmount: '1000', minOrdersCount: 5, priority: 2, isActive: true },
                { id: 'level-silver', minOrdersAmount: '500', minOrdersCount: 2, priority: 1, isActive: true }
            ];
            const mockClients = [
                { id: 'c1', totalOrdersAmount: '1200', totalOrdersCount: 6, loyaltyLevelId: null, loyaltyLevelSetManually: false },
                { id: 'c2', totalOrdersAmount: '600', totalOrdersCount: 3, loyaltyLevelId: 'level-silver', loyaltyLevelSetManually: false }
            ];

            queryMock.loyaltyLevels.findMany.mockResolvedValueOnce(mockLevels);
            queryMock.clients.findMany.mockResolvedValueOnce(mockClients);

            const chain = { set: vi.fn().mockReturnThis(), where: vi.fn().mockResolvedValueOnce(undefined) };
            vi.mocked(mockDb.update).mockReturnValue(chain as any);

            const result = await recalculateAllClientsLoyalty();

            expect(result.success).toBe(true);
            if (result.success) {
                expect(result.data?.updatedCount).toBe(1); // Only c1 updated
            }
        });
    });
});
