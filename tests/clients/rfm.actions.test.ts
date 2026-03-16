import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    calculateClientRFM,
    calculateAllClientsRFM,
    getRFMStats,
    getClientsByRFMSegment
} from '@/app/(main)/dashboard/clients/actions/rfm.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        then: vi.fn().mockImplementation((cb: (arg: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        clients: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        users: { findFirst: vi.fn().mockResolvedValue(null) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
    };

    return { mockDb, queryMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession } from '@/lib/session';
import { type Session as _Session } from '@/lib/auth';;
import { logAction } from '@/lib/audit';
import { mockSession } from '../helpers/mocks';

describe('RFM Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as _Session);

        // Mock users.findFirst for withAuth (role check)
        // Note: queryMock is hoisted, so we can access it
        (queryMock.clients.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(null);
        (queryMock.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue({
            id: 'user-id',
            name: 'Test User',
            email: 'test@example.com',
            role: { name: 'Администратор', permissions: {} },
        });

        chainable.then.mockImplementation((cb: (arg: unknown[]) => void) => cb([]));
    });

    describe('calculateClientRFM', () => {
        it('should calculate and save RFM for a client', async () => {
            const clientId = '55555555-5555-4555-8555-000000000001';
            const mockClient = {
                id: clientId,
                daysSinceLastOrder: 10,
                totalOrdersCount: 20,
                totalOrdersAmount: 200000
            };
            (queryMock.clients.findFirst as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockClient);

            const result = await calculateClientRFM(clientId);
            expect(result.success).toBe(true);
            if (result.success && result.data) {
                const data = result.data as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                expect(data.segment).toBe('champions');
                expect(data.score).toBe('555');
            }
            expect(mockDb.update).toHaveBeenCalled();
        });

        it('should return error if client not found', async () => {
            queryMock.clients.findFirst.mockResolvedValueOnce(null);
            const result = await calculateClientRFM('55555555-5555-4555-8555-000000000001');
            expect(result.success).toBe(false);
            if (!result.success) {
                expect(result.error).toBe("Клиент не найден");
            }
        });
    });

    describe('calculateAllClientsRFM', () => {
        it('should recalculate RFM for all non-archived clients', async () => {
            const mockClients = [
                { id: '1', daysSinceLastOrder: 10, totalOrdersCount: 20, totalOrdersAmount: 200000 },
                { id: '2', daysSinceLastOrder: 300, totalOrdersCount: 1, totalOrdersAmount: 1000 }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockClients) => void) => cb(mockClients));

            const result = await calculateAllClientsRFM();
            expect(result.success).toBe(true);
            if (result.success && result.data) {
                const data = result.data as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                expect(data.updated).toBe(2);
            }
            expect(logAction).toHaveBeenCalled();
        });
    });

    describe('getRFMStats', () => {
        it('should return aggregated RFM stats', async () => {
            const mockSegmentData = [
                { segment: 'champions', count: 5, avgRevenue: 100000 },
                { segment: 'potential', count: 10, avgRevenue: 50000 }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockSegmentData) => void) => cb(mockSegmentData));

            const result = await getRFMStats();
            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(2);
                expect(result.data[0].segment).toBe('champions');
                expect(result.data[0].count).toBe(5);
            }
        });
    });

    describe('getClientsByRFMSegment', () => {
        it('should return list of clients in a segment', async () => {
            const mockClientsInSegment = [
                { id: '1', lastName: 'Test', firstName: 'One', company: 'Co', rfmScore: '555', totalOrdersAmount: 100000, daysSinceLastOrder: 5 }
            ];
            chainable.then.mockImplementationOnce((cb: (arg: typeof mockClientsInSegment) => void) => cb(mockClientsInSegment));

            const result = await getClientsByRFMSegment('champions' as Parameters<typeof getClientsByRFMSegment>[0]);
            expect(result.success).toBe(true);
            if (result.success && result.data) {
                const data = result.data as unknown as any; // eslint-disable-line @typescript-eslint/no-explicit-any
                expect(data).toHaveLength(1);
                expect(data[0].fullName).toBe('Test One');
            }
        });
    });
});
