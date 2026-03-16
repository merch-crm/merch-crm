import { getSession, type Session } from "@/lib/session";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
    getDailyReport,
    getWeeklyReport,
    getMonthlyReport,
    exportReport
} from '@/app/(staff)/staff/reports/reports.actions';

// ─── Hoisted mocks ─────────────────────────────────────────────────────────────

const { mockDb, queryMock } = vi.hoisted(() => {
    const queryMock = {
        dailyWorkStats: { findMany: vi.fn().mockResolvedValue([]) },
        presenceSettings: { findMany: vi.fn().mockResolvedValue([]) },
        users: { findMany: vi.fn().mockResolvedValue([]) },
    };

    const mockDb = {
        query: queryMock,
    };

    return { mockDb, queryMock };
});

vi.mock('@/lib/db', () => ({ db: mockDb }));
vi.mock('@/lib/session', () => ({ getSession: vi.fn() }));
vi.mock('@/lib/error-logger', () => ({ logError: vi.fn() }));
vi.mock('@/lib/audit', () => ({ logAction: vi.fn() }));

// ─── Imports after mocks ──────────────────────────────────────────────────────

import { mockSession } from '../helpers/mocks';

describe('Reports Actions', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(getSession).mockResolvedValue(mockSession() as Session);
    });

    describe('getDailyReport', () => {
        it('should return daily report with employee stats', async () => {
            const mockStats = [{
                userId: 'u1',
                firstSeenAt: new Date('2026-03-05T08:55:00'),
                lastSeenAt: new Date('2026-03-05T17:00:00'),
                workSeconds: 28800,
                idleSeconds: 1800,
                breakSeconds: 3600,
                productivity: '0.85',
                lateArrivalMinutes: 0
            }];
            const mockUsers = [{ id: 'u1', name: 'User 1', email: 'u1@test.com' }];
            const mockSettings = [
                { key: 'work_start_time', value: '09:00' },
                { key: 'late_threshold_minutes', value: 15 }
            ];

            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);
            queryMock.presenceSettings.findMany.mockResolvedValueOnce(mockSettings);
            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);

            const result = await getDailyReport('2026-03-05');

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.totalEmployees).toBe(1);
                expect(result.data.presentToday).toBe(1);
                expect(result.data.employees).toHaveLength(1);
                expect(result.data.employees[0].workHours).toBe(8);
            }
        });

        it('should reject invalid date format', async () => {
            const result = await getDailyReport('invalid-date');
            expect(result.success).toBe(false);
        });

        it('should reject unauthorized users', async () => {
            vi.mocked(getSession).mockResolvedValueOnce(null);
            const result = await getDailyReport('2026-03-05');
            expect(result.success).toBe(false);
            expect(result.error).toBe('Unauthorized');
        });
    });

    describe('getWeeklyReport', () => {
        it('should return weekly breakdown with employee summaries', async () => {
            const mockStats = [
                { userId: 'u1', date: new Date('2026-03-03'), workSeconds: 28800, lateArrivalMinutes: 0, productivity: '0.8' },
                { userId: 'u1', date: new Date('2026-03-04'), workSeconds: 25200, lateArrivalMinutes: 10, productivity: '0.7' }
            ];
            const mockUsers = [{ id: 'u1', name: 'User 1', email: 'u1@test.com' }];

            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);
            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);

            const result = await getWeeklyReport('2026-03-05');

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.dailyBreakdown).toHaveLength(7);
                expect(result.data.employees).toHaveLength(1);
                expect(result.data.employees[0].daysPresent).toBe(2);
            }
        });
    });

    describe('getMonthlyReport', () => {
        it('should return monthly summary with work day count', async () => {
            const mockStats = [
                { userId: 'u1', workSeconds: 28800, lateArrivalMinutes: 0, earlyDepartureMinutes: 0, productivity: '0.9' }
            ];
            const mockUsers = [{ id: 'u1', name: 'User 1', email: 'u1@test.com' }];

            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);
            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);

            const result = await getMonthlyReport(2026, 3);

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.year).toBe(2026);
                expect(result.data.month).toBe(3);
                expect(result.data.monthName).toBe('Март');
                expect(result.data.workDays).toBeGreaterThan(0);
                expect(result.data.employees).toHaveLength(1);
            }
        });

        it('should reject invalid month', async () => {
            const result = await getMonthlyReport(2026, 13);
            expect(result.success).toBe(false);
        });
    });

    describe('exportReport', () => {
        it('should generate CSV for daily report', async () => {
            const mockStats = [{
                userId: 'u1',
                firstSeenAt: new Date('2026-03-05T09:00:00'),
                lastSeenAt: new Date('2026-03-05T17:00:00'),
                workSeconds: 28800,
                idleSeconds: 0,
                breakSeconds: 0,
                productivity: '0.9',
                lateArrivalMinutes: 0
            }];
            const mockUsers = [{ id: 'u1', name: 'User 1', email: 'u1@test.com' }];
            const mockSettings = [{ key: 'work_start_time', value: '09:00' }];

            queryMock.dailyWorkStats.findMany.mockResolvedValueOnce(mockStats);
            queryMock.presenceSettings.findMany.mockResolvedValueOnce(mockSettings);
            queryMock.users.findMany.mockResolvedValueOnce(mockUsers);

            const result = await exportReport('daily', { date: '2026-03-05' });

            expect(result.success).toBe(true);
            if (result.success && result.data) {
                expect(result.data.csv).toContain('Имя,Email');
                expect(result.data.filename).toMatch(/^report_daily_/);
            }
        });
    });
});
