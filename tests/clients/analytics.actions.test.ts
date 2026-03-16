import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getClientAnalyticsOverview,
    getClientGrowthData
} from '@/app/(main)/dashboard/clients/actions/analytics/overview';
import {
    getFunnelAnalytics
} from '@/app/(main)/dashboard/clients/actions/analytics/distribution';
import {
    getManagerPerformance,
    getTopClients
} from '@/app/(main)/dashboard/clients/actions/analytics/performance';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, chainable } = vi.hoisted(() => {
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
        clients: { findFirst: vi.fn().mockResolvedValue(null) },
        users: { findFirst: vi.fn().mockResolvedValue({ id: 'user-1', name: 'Admin', email: 'a@b.com', role: { name: 'Администратор', permissions: {} }, department: null }) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
    };

    return { mockDb, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

import { getSession } from '@/lib/session';
import { type Session as _Session } from '@/lib/auth';
import { mockSession } from '../helpers/mocks';

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Analytics Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([]));
        vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }) as _Session);
    });

    describe('Overview Analytics', () => {
        it('getClientAnalyticsOverview returns correct stats', async () => {
            const mockStats = [{
                totalClients: 100,
                activeClients: 80,
                atRiskClients: 10,
                lostClients: 10,
                newClientsThisMonth: 5,
                newClientsLastMonth: 2,
                totalRevenue: 500000,
                averageCheck: 5000,
                averageLTV: 50000,
                b2cCount: 70,
                b2bCount: 30
            }];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockStats) => void) => cb(mockStats));

            const result = await getClientAnalyticsOverview();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.totalClients).toBe(100);
                expect(result.data.newClientsGrowth).toBe(150); // (5-2)/2 * 100
            }
        });

        it('getClientGrowthData returns monthly trends', async () => {
            const mockMonthly = [
                { month: '2026-01', newClients: 10, b2cNew: 7, b2bNew: 3 },
                { month: '2026-02', newClients: 15, b2cNew: 10, b2bNew: 5 }
            ];
            const mockTotalBefore = [{ totalBefore: 50 }];

            chainable.then.mockImplementationOnce((cb: (arg: typeof mockMonthly) => void) => cb(mockMonthly));
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockTotalBefore) => void) => cb(mockTotalBefore));

            const result = await getClientGrowthData(2);

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(2);
                expect(result.data[1].cumulativeClients).toBe(75); // 50 + 10 + 15
            }
        });
    });

    describe('Distribution Analytics', () => {
        it('getFunnelAnalytics returns conversion stages', async () => {
            const mockStages = [
                { stage: 'lead', count: 50 },
                { stage: 'negotiation', count: 30 }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockStages) => void) => cb(mockStages));

            const result = await getFunnelAnalytics();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                const lead = result.data.find(s => s.stage === 'lead');
                expect(lead?.count).toBe(50);
            }
        });
    });

    describe('Performance Analytics', () => {
        it('getManagerPerformance returns manager stats', async () => {
            const mockManagers = [
                { managerId: 'm1', managerName: 'Admin', clientCount: 10, totalRevenue: 100000, regularClients: 5 }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockManagers) => void) => cb(mockManagers));

            const result = await getManagerPerformance();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data[0].conversionRate).toBe(50);
            }
        });

        it('getTopClients returns limited list', async () => {
            const mockTop = [
                { id: '1', lastName: 'Top', firstName: 'Client', totalOrdersAmount: 1000000 }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockTop) => void) => cb(mockTop));

            const result = await getTopClients(5);

            expect(result.success).toBe(true);
            expect(chainable.limit).toHaveBeenCalledWith(5);
        });
    });
});
