import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getClientsForFunnel,
    getFunnelStats,
    updateClientFunnelStage,
    markClientAsLost
} from '@/app/(main)/dashboard/clients/actions/funnel.actions';

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
        then: vi.fn().mockImplementation((cb: any) => cb([])),
    };

    const queryMock = {
        clients: { findFirst: vi.fn().mockResolvedValue(null) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
    };

    return { mockDb, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/auth', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession } from '@/lib/auth';
import { logAction } from '@/lib/audit';
import { mockSession } from '../helpers/mocks';

describe('Funnel Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession({ roleName: 'Администратор' }) as any);
        chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([]));
    });

    describe('getClientsForFunnel', () => {
        it('should return non-archived, non-lost clients', async () => {
            const mockClients = [{ id: '1', lastName: 'Ivanov', funnelStage: 'lead' }];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockClients) => void) => cb(mockClients));

            const result = await getClientsForFunnel();

            expect(result).toEqual(mockClients);
            expect(mockDb.select).toHaveBeenCalled();
        });

        it('should return empty array on failure', async () => {
            chainable.then.mockImplementationOnce(() => { throw new Error('DB error'); });
            const result = await getClientsForFunnel();
            expect(result).toEqual([]);
        });
    });

    describe('getFunnelStats', () => {
        it('should return aggregated stats by stage', async () => {
            const mockStats = [
                { stage: 'lead', count: 5, amount: '5000' },
                { stage: 'negotiation', count: 2, amount: '2000' }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockStats) => void) => cb(mockStats));

            const result = await getFunnelStats();

            expect(result.lead).toEqual({ count: 5, amount: 5000 });
            expect(result.negotiation).toEqual({ count: 2, amount: 2000 });
        });
    });

    describe('updateClientFunnelStage', () => {
        it('should update stage and log action', async () => {
            const clientId = '55555555-5555-4555-8555-000000000001';
            const stage = 'negotiation';

            await updateClientFunnelStage(clientId, stage);

            expect(mockDb.update).toHaveBeenCalled();
            expect(logAction).toHaveBeenCalledWith('update_funnel_stage', 'client', clientId, { stage });
        });

        it('should throw error on unauthorized', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(null);
            await expect(updateClientFunnelStage('uuid', 'stage')).rejects.toThrow("Unauthorized");
        });
    });

    describe('markClientAsLost', () => {
        it('should archive client and set lost reason', async () => {
            const clientId = '55555555-5555-4555-8555-000000000001';
            const reason = 'High price';

            await markClientAsLost(clientId, reason, 'Too expensive for them');

            expect(mockDb.update).toHaveBeenCalled();
            expect(logAction).toHaveBeenCalledWith('mark_as_lost', 'client', clientId, { reason, comment: 'Too expensive for them' });
        });
    });
});
