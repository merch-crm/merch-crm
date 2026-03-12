import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    recalculateClientStats,
    recalculateAllClientsStats,
    getClientsAtRisk,
    getClientsStatsOverview,
    getActivityStats
} from '@/app/(main)/dashboard/clients/actions/stats.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        then: vi.fn().mockImplementation((cb: (arg: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        clients: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
        execute: vi.fn().mockResolvedValue({ rowCount: 0 }),
    };

    return { mockDb, queryMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession, type Session as _Session } from '@/lib/auth';
import { mockSession } from '../helpers/mocks';

describe('Stats Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as _Session);
        chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([]));
    });

    describe('recalculateClientStats', () => {
        it('should calculate stats from orders and update client', async () => {
            const clientId = '55555555-5555-4555-8555-000000000001';
            const mockStats = [{
                totalCount: 5,
                totalAmount: '5000',
                avgAmount: '1000',
                lastOrder: new Date('2026-01-01'),
                firstOrder: new Date('2025-01-01')
            }];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockStats) => void) => cb(mockStats));

            const result = await recalculateClientStats(clientId);

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.totalOrdersCount).toBe(5);
            }
            expect(mockDb.update).toHaveBeenCalled();
        });
    });

    describe('recalculateAllClientsStats', () => {
        it('should iterate over all clients if admin', async () => {
            queryMock.clients.findMany.mockResolvedValueOnce([{ id: '1' }, { id: '2' }]);

            // Re-mocking for each client call
            chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([{ totalCount: 0 }]));

            const result = await recalculateAllClientsStats();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.processed).toBe(2);
            }
        });

        it('should block non-admins', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(mockSession() as _Session);
            const result = await recalculateAllClientsStats();
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Недостаточно прав");
            }
        });
    });

    describe('getClientsAtRisk', () => {
        it('should return clients above threshold', async () => {
            const mockAtRisk = [{ id: '1', lastName: 'Risk', firstName: 'Client', daysSinceLastOrder: 100 }];
            queryMock.clients.findMany.mockResolvedValueOnce(mockAtRisk);

            const result = await getClientsAtRisk({ daysThreshold: 90 });

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(1);
            }
        });
    });

    describe('getClientsStatsOverview', () => {
        it('should return overall activity summary', async () => {
            // total, active, atRisk, new, avg (5 select calls)
            vi.mocked(chainable.then)
                .mockImplementationOnce((cb: (arg: { count: number }[]) => void) => cb([{ count: 10 }])) // total
                .mockImplementationOnce((cb: (arg: { count: number }[]) => void) => cb([{ count: 5 }]))  // active
                .mockImplementationOnce((cb: (arg: { count: number }[]) => void) => cb([{ count: 3 }]))  // atRisk
                .mockImplementationOnce((cb: (arg: { count: number }[]) => void) => cb([{ count: 2 }]))  // new
                .mockImplementationOnce((cb: (arg: { avgOrders: string, avgRevenue: string }[]) => void) => cb([{ avgOrders: '5', avgRevenue: '5000' }])); // avg

            queryMock.clients.findMany.mockResolvedValueOnce([{ id: '1', lastName: 'T', firstName: 'C', totalOrdersAmount: 1000 }]); // top

            const result = await getClientsStatsOverview();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.totalClients).toBe(10);
                expect(result.data.activeClients).toBe(5);
                expect(result.data.atRiskClients).toBe(3);
                expect(result.data.newClients).toBe(2);
                expect(result.data.avgOrdersPerClient).toBe(5);
                expect(result.data.topClientsByRevenue).toHaveLength(1);
            }
        });
    });

    describe('getActivityStats', () => {
        it('should return activity buckets', async () => {
            const mockBuckets = [{
                total: 20,
                active: 10,
                attention: 5,
                atRisk: 3,
                inactive: 2
            }];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockBuckets) => void) => cb(mockBuckets));

            const result = await getActivityStats();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.active).toBe(10);
                expect(result.data.total).toBe(20);
            }
        });
    });
});
