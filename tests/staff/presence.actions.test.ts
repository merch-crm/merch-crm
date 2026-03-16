import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    recordPresenceEvent,
    getCurrentPresenceStatus,
    getDailyReport,
    getWeeklyReport
} from '@/app/(main)/staff/actions/presence.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock, chainable } = vi.hoisted(() => {
    const chainable = {
        where: vi.fn().mockReturnThis(),
        set: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
        values: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        then: vi.fn().mockImplementation((cb: (args: unknown[]) => void) => cb([])),
    };

    const queryMock = {
        cameras: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        dailyWorkStats: { findFirst: vi.fn().mockResolvedValue(null), findMany: vi.fn().mockResolvedValue([]) },
        presenceLogs: { findMany: vi.fn().mockResolvedValue([]) },
        users: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const mockDb = {
        query: queryMock,
        select: vi.fn().mockReturnValue(chainable),
        update: vi.fn().mockReturnValue(chainable),
        insert: vi.fn().mockReturnValue(chainable),
        transaction: vi.fn().mockImplementation(async (cb: (db: unknown) => Promise<unknown>) => cb(mockDb)),
    };

    return { mockDb, queryMock, chainable };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/admin', () => ({ requireAdmin: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { getSession, type Session as _Session } from '@/lib/auth';
import { requireAdmin } from '@/lib/admin';
import { mockSession } from '../helpers/mocks';

describe('Presence Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as _Session);
        vi.mocked(requireAdmin).mockResolvedValue(undefined as never);
        chainable.then.mockImplementation((cb: (args: unknown[]) => void) => cb([]));
    });

    describe('recordPresenceEvent', () => {
        const validEvent = {
            cameraId: '55555555-5555-4555-8555-000000000001',
            eventType: 'recognized',
            userId: '55555555-5555-4555-8555-000000000002',
            confidence: 0.9,
            timestamp: new Date().toISOString()
        };

        it('should record event and update stats if userId present', async () => {
            queryMock.cameras.findFirst.mockResolvedValueOnce({ id: 'c1', isEnabled: true });
            chainable.returning.mockResolvedValueOnce([{ id: 'log-1' }]);

            const result = await recordPresenceEvent(validEvent);

            expect(result.success).toBe(true);
            expect(mockDb.insert).toHaveBeenCalled();
            expect(mockDb.transaction).toHaveBeenCalled(); // updateDailyStats
        });

        it('should return error if camera disabled', async () => {
            queryMock.cameras.findFirst.mockResolvedValueOnce(null);
            const result = await recordPresenceEvent(validEvent);
            expect(result.success).toBe(false);
            expect(result.error).toBe("Камера не найдена или отключена");
        });
    });

    describe('getCurrentPresenceStatus', () => {
        it('should return aggregated status for all active users', async () => {
            const mockLogs = [{ userId: 'u1', eventType: 'detected', timestamp: new Date(), cameraId: 'c1' }];
            const mockUsers = [{ id: 'u1', name: 'User 1', department: { name: 'IT' } }];
            const mockStats = [{ userId: 'u1', workSeconds: 3600, date: new Date() }];
            const mockCameras = [{ id: 'c1', name: 'Front Desk' }];

            chainable.then.mockImplementationOnce((cb: (args: unknown[]) => void) => cb(mockLogs));
            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);
            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);
            queryMock.cameras.findMany.mockResolvedValueOnce(mockCameras);

            const result = await getCurrentPresenceStatus();

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data).toHaveLength(1);
                expect(result.data[0].userName).toBe('User 1');
                expect(result.data[0].status).toBe('working');
            }
        });
    });

    describe('getDailyReport', () => {
        it('should return report for specific date', async () => {
            const mockStats = [{
                userId: 'u1',
                workSeconds: 28800,
                idleSeconds: 3600,
                user: { name: 'User 1', department: { name: 'Sales' } }
            }];
            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);

            const result = await getDailyReport(new Date());

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data[0].workHours).toBe(8);
            }
        });
    });

    describe('getWeeklyReport', () => {
        it('should aggregate weekly stats', async () => {
            const mockStats = [
                { userId: 'u1', workSeconds: 10000, date: new Date(), user: { name: 'U1' } },
                { userId: 'u1', workSeconds: 10000, date: new Date(), user: { name: 'U1' } }
            ];
            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);

            const result = await getWeeklyReport(new Date());

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data[0].daysWorked).toBe(2);
                expect(result.data[0].totalWorkHours).toBeCloseTo(20000 / 3600);
            }
        });
    });
});
